const BaseRepository = require('./baseRepository');
const { Order, User, Address, OrderItem, Product, ProductVariant } = require('../models');
const { Op } = require('sequelize');

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  async findOrderWithDetails(orderId, options = {}) {
    return await this.findById(orderId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Address,
          as: 'billingAddress',
          attributes: { exclude: ['createdAt', 'updatedAt'] }
        },
        {
          model: Address,
          as: 'shippingAddress',
          attributes: { exclude: ['createdAt', 'updatedAt'] }
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'images']
            },
            {
              model: ProductVariant,
              as: 'variant',
              attributes: ['id', 'options']
            }
          ]
        }
      ],
      ...options
    });
  }

  async findOrdersByUser(userId, options = {}) {
    return await this.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'images']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      ...options
    });
  }

  async findOrdersByStatus(status, options = {}) {
    return await this.findAll({
      where: { status },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      ...options
    });
  }

  async updateOrderStatus(orderId, status, options = {}) {
    const updateData = { status };
    
    // Set timestamps based on status
    switch (status) {
      case 'paid':
        updateData.paidAt = new Date();
        updateData.paymentStatus = 'paid';
        break;
      case 'shipped':
        updateData.shippedAt = new Date();
        break;
      case 'delivered':
        updateData.deliveredAt = new Date();
        break;
      case 'cancelled':
        updateData.cancelledAt = new Date();
        break;
      case 'refunded':
        updateData.refundedAt = new Date();
        updateData.paymentStatus = 'refunded';
        break;
    }

    return await this.update(orderId, updateData, options);
  }

  async updatePaymentStatus(orderId, paymentStatus, options = {}) {
    const updateData = { paymentStatus };
    
    if (paymentStatus === 'paid') {
      updateData.paidAt = new Date();
      updateData.status = 'confirmed';
    }

    return await this.update(orderId, updateData, options);
  }

  async findRecentOrders(days = 7, options = {}) {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return await this.findAll({
      where: {
        createdAt: { [Op.gte]: date }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      ...options
    });
  }

  async findOrdersByDateRange(startDate, endDate, options = {}) {
    return await this.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrderItem,
          as: 'items'
        }
      ],
      ...options
    });
  }

  async getOrderStats(timeframe = 'month') {
    const { sequelize } = require('../models');
    const { QueryTypes } = require('sequelize');

    let groupBy;
    let dateFormat;

    switch (timeframe) {
      case 'day':
        groupBy = 'DATE(created_at)';
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        groupBy = 'YEARWEEK(created_at)';
        dateFormat = '%x-%v';
        break;
      case 'month':
      default:
        groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
        dateFormat = '%Y-%m';
        break;
    }

    const query = `
      SELECT 
        ${groupBy} as period,
        COUNT(*) as order_count,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_order_value
      FROM orders 
      WHERE status != 'cancelled' 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
      GROUP BY ${groupBy}
      ORDER BY period DESC
    `;

    return await sequelize.query(query, {
      type: QueryTypes.SELECT
    });
  }
}

module.exports = OrderRepository;