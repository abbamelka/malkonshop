const BaseRepository = require('./baseRepository');
const { Cart, CartItem, Product, ProductVariant } = require('../models');

class CartRepository extends BaseRepository {
  constructor() {
    super(Cart);
  }

  async findCartByUser(userId, options = {}) {
    return await this.findOne({ userId }, {
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'images', 'quantity', 'allowOutOfStockPurchases']
            },
            {
              model: ProductVariant,
              as: 'variant',
              attributes: ['id', 'options', 'quantity']
            }
          ]
        }
      ],
      ...options
    });
  }

  async findCartBySession(sessionId, options = {}) {
    return await this.findOne({ sessionId }, {
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'images', 'quantity', 'allowOutOfStockPurchases']
            },
            {
              model: ProductVariant,
              as: 'variant',
              attributes: ['id', 'options', 'quantity']
            }
          ]
        }
      ],
      ...options
    });
  }

  async findOrCreateUserCart(userId, options = {}) {
    return await this.findOrCreate(
      { userId },
      { userId },
      {
        include: [
          {
            model: CartItem,
            as: 'items',
            include: ['product', 'variant']
          }
        ],
        ...options
      }
    );
  }

  async findOrCreateSessionCart(sessionId, options = {}) {
    return await this.findOrCreate(
      { sessionId },
      { sessionId },
      {
        include: [
          {
            model: CartItem,
            as: 'items',
            include: ['product', 'variant']
          }
        ],
        ...options
      }
    );
  }

  async addItemToCart(cartId, itemData, options = {}) {
    const cart = await this.findById(cartId, {
      include: ['items'],
      ...options
    });

    const existingItem = cart.items.find(item => 
      item.productId === itemData.productId && 
      item.variantId === itemData.variantId
    );

    if (existingItem) {
      // Update quantity if item already exists
      await existingItem.update({
        quantity: existingItem.quantity + (itemData.quantity || 1)
      }, options);
    } else {
      // Add new item
      await CartItem.create({
        cartId,
        ...itemData
      }, options);
    }

    return await this.findById(cartId, {
      include: ['items'],
      ...options
    });
  }

  async updateCartItem(cartId, itemId, updateData, options = {}) {
    const cart = await this.findById(cartId, {
      include: ['items'],
      ...options
    });

    const item = cart.items.find(item => item.id === itemId);
    if (!item) {
      throw new AppError('Cart item not found', 404);
    }

    await item.update(updateData, options);

    return await this.findById(cartId, {
      include: ['items'],
      ...options
    });
  }

  async removeItemFromCart(cartId, itemId, options = {}) {
    const cart = await this.findById(cartId, {
      include: ['items'],
      ...options
    });

    const item = cart.items.find(item => item.id === itemId);
    if (!item) {
      throw new AppError('Cart item not found', 404);
    }

    await item.destroy(options);

    return await this.findById(cartId, {
      include: ['items'],
      ...options
    });
  }

  async clearCart(cartId, options = {}) {
    await CartItem.destroy({
      where: { cartId },
      ...options
    });

    return await this.findById(cartId, {
      include: ['items'],
      ...options
    });
  }

  async updateCartTotals(cartId, options = {}) {
    const cart = await this.findById(cartId, {
      include: [
        {
          model: CartItem,
          as: 'items',
          include: ['product']
        }
      ],
      ...options
    });

    let subtotal = 0;
    
    for (const item of cart.items) {
      subtotal += item.price * item.quantity;
    }

    const totalAmount = subtotal + (cart.shippingAmount || 0) + (cart.taxAmount || 0) - (cart.discountAmount || 0);

    return await this.update(cartId, {
      subtotal,
      totalAmount
    }, options);
  }

  async mergeCarts(userCartId, sessionCartId, options = {}) {
    const userCart = await this.findById(userCartId, {
      include: ['items'],
      ...options
    });

    const sessionCart = await this.findById(sessionCartId, {
      include: ['items'],
      ...options
    });

    // Merge session cart items into user cart
    for (const sessionItem of sessionCart.items) {
      await this.addItemToCart(userCartId, {
        productId: sessionItem.productId,
        variantId: sessionItem.variantId,
        quantity: sessionItem.quantity,
        price: sessionItem.price,
        options: sessionItem.options
      }, options);
    }

    // Delete session cart
    await this.delete(sessionCartId, options);

    return await this.findById(userCartId, {
      include: ['items'],
      ...options
    });
  }
}

module.exports = CartRepository;