const BaseService = require('./baseService');
const { CartRepository, ProductRepository, ProductVariantRepository } = require('../repositories');
const { AppError } = require('../utils/errors');

class CartService {
  constructor() {
    this.cartRepository = new CartRepository();
    this.productRepository = new ProductRepository();
    this.variantRepository = new ProductVariantRepository(); // Fixed this line
  }
  async getCart(userId, sessionId = null) {
    try {
      let cart;

      if (userId) {
        cart = await this.cartRepository.findOrCreateUserCart(userId);
      } else if (sessionId) {
        cart = await this.cartRepository.findOrCreateSessionCart(sessionId);
      } else {
        throw new AppError('User ID or session ID required', 400);
      }

      await this.cartRepository.updateCartTotals(cart.record.id || cart.id);

      return cart.record || cart;
    } catch (error) {
      throw error;
    }
  }

  async addItemToCart(userId, sessionId, itemData) {
    try {
      let cart;

      if (userId) {
        cart = await this.cartRepository.findOrCreateUserCart(userId);
      } else if (sessionId) {
        cart = await this.cartRepository.findOrCreateSessionCart(sessionId);
      } else {
        throw new AppError('User ID or session ID required', 400);
      }

      const cartId = cart.record ? cart.record.id : cart.id;

      // Validate product and variant
      await this.validateCartItem(itemData);

      // Get current price
      const price = await this.getItemPrice(itemData.productId, itemData.variantId);

      const cartWithItem = await this.cartRepository.addItemToCart(cartId, {
        ...itemData,
        price
      });

      await this.cartRepository.updateCartTotals(cartId);

      return cartWithItem;
    } catch (error) {
      throw error;
    }
  }

  async updateCartItem(userId, sessionId, itemId, updateData) {
    try {
      let cart;

      if (userId) {
        cart = await this.cartRepository.findCartByUser(userId);
      } else if (sessionId) {
        cart = await this.cartRepository.findCartBySession(sessionId);
      }

      if (!cart) {
        throw new AppError('Cart not found', 404);
      }

      const cartWithItem = await this.cartRepository.updateCartItem(cart.id, itemId, updateData);

      await this.cartRepository.updateCartTotals(cart.id);

      return cartWithItem;
    } catch (error) {
      throw error;
    }
  }

  async removeItemFromCart(userId, sessionId, itemId) {
    try {
      let cart;

      if (userId) {
        cart = await this.cartRepository.findCartByUser(userId);
      } else if (sessionId) {
        cart = await this.cartRepository.findCartBySession(sessionId);
      }

      if (!cart) {
        throw new AppError('Cart not found', 404);
      }

      const cartWithoutItem = await this.cartRepository.removeItemFromCart(cart.id, itemId);

      await this.cartRepository.updateCartTotals(cart.id);

      return cartWithoutItem;
    } catch (error) {
      throw error;
    }
  }

  async clearCart(userId, sessionId) {
    try {
      let cart;

      if (userId) {
        cart = await this.cartRepository.findCartByUser(userId);
      } else if (sessionId) {
        cart = await this.cartRepository.findCartBySession(sessionId);
      }

      if (!cart) {
        throw new AppError('Cart not found', 404);
      }

      const emptyCart = await this.cartRepository.clearCart(cart.id);

      return emptyCart;
    } catch (error) {
      throw error;
    }
  }

  async mergeCarts(userId, sessionId) {
    try {
      const userCart = await this.cartRepository.findOrCreateUserCart(userId);
      const sessionCart = await this.cartRepository.findCartBySession(sessionId);

      if (!sessionCart) {
        return userCart.record || userCart;
      }

      const mergedCart = await this.cartRepository.mergeCarts(
        userCart.record ? userCart.record.id : userCart.id,
        sessionCart.id
      );

      await this.cartRepository.updateCartTotals(mergedCart.id);

      return mergedCart;
    } catch (error) {
      throw error;
    }
  }

  async validateCartItem(itemData) {
    const { productId, variantId, quantity } = itemData;

    // Validate product
    const product = await this.productRepository.findById(productId);
    if (!product || !product.isActive || !product.isPublished) {
      throw new AppError('Product not available', 400);
    }

    // Validate variant if provided
    if (variantId) {
      const variant = await this.variantRepository.findById(variantId);
      if (!variant || !variant.isActive || variant.productId !== productId) {
        throw new AppError('Invalid product variant', 400);
      }
    }

    // Check stock
    const availableStock = variantId ? 
      (await this.variantRepository.findById(variantId)).quantity : 
      product.quantity;

    if (product.trackQuantity && availableStock < quantity && !product.allowOutOfStockPurchases) {
      throw new AppError(`Insufficient stock. Available: ${availableStock}`, 400);
    }

    return true;
  }

  async getItemPrice(productId, variantId = null) {
    if (variantId) {
      const variant = await this.variantRepository.findById(variantId);
      return variant.price;
    }

    const product = await this.productRepository.findById(productId);
    return product.price;
  }

  async applyCouponToCart(userId, sessionId, couponCode) {
    try {
      // This would integrate with a coupon service
      // For now, we'll implement basic coupon logic
      
      let cart;
      if (userId) {
        cart = await this.cartRepository.findCartByUser(userId);
      } else if (sessionId) {
        cart = await this.cartRepository.findCartBySession(sessionId);
      }

      if (!cart) {
        throw new AppError('Cart not found', 404);
      }

      // Validate coupon (simplified)
      // const coupon = await this.couponService.validateCoupon(couponCode, cart.totalAmount);
      
      // For now, we'll just set a placeholder discount
      const discountAmount = 10; // This would be calculated from coupon

      const updatedCart = await this.cartRepository.update(cart.id, {
        couponCode,
        discountAmount
      });

      await this.cartRepository.updateCartTotals(cart.id);

      return updatedCart;
    } catch (error) {
      throw error;
    }
  }

  async removeCouponFromCart(userId, sessionId) {
    try {
      let cart;
      if (userId) {
        cart = await this.cartRepository.findCartByUser(userId);
      } else if (sessionId) {
        cart = await this.cartRepository.findCartBySession(sessionId);
      }

      if (!cart) {
        throw new AppError('Cart not found', 404);
      }

      const updatedCart = await this.cartRepository.update(cart.id, {
        couponCode: null,
        discountAmount: 0
      });

      await this.cartRepository.updateCartTotals(cart.id);

      return updatedCart;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CartService;