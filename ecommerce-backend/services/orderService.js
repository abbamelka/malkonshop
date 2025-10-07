const BaseService = require('./baseService');
const { OrderRepository, CartRepository, ProductRepository, UserRepository } = require('../repositories');
const { AppError } = require('../utils/errors');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../utils/constants');

class OrderService extends BaseService {
  constructor() {
    super(new OrderRepository());
    this.cartRepository = new CartRepository();
    this.productRepository = new ProductRepository();
    this.userRepository = new UserRepository();
  }

  async createOrderFromCart(userId, orderData) {
    const transaction = await this.repository.model.sequelize.transaction();

    try {
      // Get user cart with items
      const cart = await this.cartRepository.findCartByUser(userId, { transaction });
      
      if (!cart || !cart.items || cart.items.length === 0) {
        throw new AppError('Cart is empty', 400);
      }

      // Validate stock and calculate totals
      const { items, subtotal } = await this.validateCartItemsAndCalculateTotals(cart.items, transaction);

      // Generate order number
      const orderNumber = this.generateOrderNumber();

      // Create order
      const order = await this.repository.create({
        orderNumber,
        userId,
        ...orderData,
        subtotal,
        totalAmount: subtotal + (orderData.shippingAmount || 0) + (orderData.taxAmount || 0) - (orderData.discountAmount || 0),
        status: ORDER_STATUS.PENDING,
        paymentStatus: PAYMENT_STATUS.PENDING
      }, { transaction });

      // Create order items
      const orderItems = items.map(item => ({
        orderId: order.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product.name,
        productSku: item.variant ? item.variant.sku : item.product.sku,
        variantOptions: item.variant ? item.variant.options : null,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity
      }));

      await this.repository.model.sequelize.models.OrderItem.bulkCreate(orderItems, { transaction });

      // Update product stock
      await this.updateProductStock(items, transaction);

      // Clear cart
      await this.cartRepository.clearCart(cart.id, { transaction });

      // Commit transaction
      await transaction.commit();

      // Get full order details
      const fullOrder = await this.repository.findOrderWithDetails(order.id);

      return fullOrder;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async validateCartItemsAndCalculateTotals(cartItems, transaction = null) {
    let subtotal = 0;
    const validatedItems = [];

    for (const item of cartItems) {
      const product = await this.productRepository.findById(item.productId, { transaction });
      
      if (!product || !product.isActive || !product.isPublished) {
        throw new AppError(`Product ${item.productName || product.name} is not available`, 400);
      }

      // Check stock availability
      if (product.trackQuantity) {
        const availableStock = item.variantId ? 
          (item.variant?.quantity || 0) : 
          product.quantity;

        if (availableStock < item.quantity && !product.allowOutOfStockPurchases) {
          throw new AppError(`Insufficient stock for ${product.name}. Available: ${availableStock}`, 400);
        }
      }

      // Use variant price if available, otherwise product price
      const price = item.variantId ? (item.variant?.price || product.price) : product.price;

      validatedItems.push({
        ...item.toJSON(),
        product,
        price
      });

      subtotal += price * item.quantity;
    }

    return { items: validatedItems, subtotal };
  }

  async updateProductStock(items, transaction = null) {
    for (const item of items) {
      if (item.product.trackQuantity) {
        if (item.variantId) {
          await this.productRepository.model.sequelize.models.ProductVariant.decrement(
            'quantity',
            {
              by: item.quantity,
              where: { id: item.variantId },
              transaction
            }
          );
        } else {
          await this.productRepository.decrementStock(
            item.productId,
            item.quantity,
            { transaction }
          );
        }
      }
    }
  }

  async updateOrderStatus(orderId, status, notes = null) {
    try {
      const updateData = { status };
      
      if (notes) {
        if (status === ORDER_STATUS.CANCELLED) {
          updateData.cancelledReason = notes;
        } else if (status === ORDER_STATUS.REFUNDED) {
          updateData.refundedReason = notes;
        }
      }

      const order = await this.repository.updateOrderStatus(orderId, status, { data: updateData });

      // Send notification based on status change
      // await this.notificationService.sendOrderStatusUpdate(order.userId, order);

      return order;
    } catch (error) {
      throw error;
    }
  }

  async updatePaymentStatus(orderId, paymentStatus) {
    try {
      const order = await this.repository.updatePaymentStatus(orderId, paymentStatus);

      // Send payment confirmation if paid
      if (paymentStatus === PAYMENT_STATUS.PAID) {
        // await this.emailService.sendPaymentConfirmation(order.userId, order);
      }

      return order;
    } catch (error) {
      throw error;
    }
  }

  async getOrderByNumber(orderNumber) {
    try {
      const order = await this.repository.findOne({ orderNumber }, {
        include: ['user', 'billingAddress', 'shippingAddress', 'items']
      });

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      return order;
    } catch (error) {
      throw error;
    }
  }

  async getUserOrders(userId, options = {}) {
    try {
      return await this.repository.findOrdersByUser(userId, options);
    } catch (error) {
      throw error;
    }
  }

  async cancelOrder(orderId, reason) {
    try {
      const order = await this.repository.findById(orderId);

      if (order.status !== ORDER_STATUS.PENDING && order.status !== ORDER_STATUS.CONFIRMED) {
        throw new AppError('Order cannot be cancelled at this stage', 400);
      }

      // Restore product stock
      await this.restoreOrderStock(orderId);

      const cancelledOrder = await this.repository.updateOrderStatus(orderId, ORDER_STATUS.CANCELLED, {
        data: { cancelledReason: reason }
      });

      return cancelledOrder;
    } catch (error) {
      throw error;
    }
  }

  async restoreOrderStock(orderId) {
    const transaction = await this.repository.model.sequelize.transaction();

    try {
      const order = await this.repository.findOrderWithDetails(orderId, { transaction });

      for (const item of order.items) {
        if (item.product.trackQuantity) {
          if (item.variantId) {
            await this.productRepository.model.sequelize.models.ProductVariant.increment(
              'quantity',
              {
                by: item.quantity,
                where: { id: item.variantId },
                transaction
              }
            );
          } else {
            await this.productRepository.incrementStock(
              item.productId,
              item.quantity,
              { transaction }
            );
          }
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getOrderStats(timeframe = 'month') {
    try {
      return await this.repository.getOrderStats(timeframe);
    } catch (error) {
      throw error;
    }
  }

  async getRecentOrders(days = 7, options = {}) {
    try {
      return await this.repository.findRecentOrders(days, options);
    } catch (error) {
      throw error;
    }
  }

  generateOrderNumber() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${timestamp.slice(-6)}-${random}`;
  }
}

module.exports = OrderService;