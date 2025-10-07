const BaseRepository = require('./baseRepository');
const { Payment, Order, User } = require('../models');
const { Op } = require('sequelize');

class PaymentRepository extends BaseRepository {
  constructor() {
    super(Payment);
  }

  async findPaymentWithDetails(paymentId, options = {}) {
    return await this.findById(paymentId, {
      include: [
        {
          model: Order,
          as: 'order',
          include: ['user', 'billingAddress', 'shippingAddress']
        }
      ],
      ...options
    });
  }

  async findPaymentsByUser(userId, options = {}) {
    const { page = 1, limit = 10, ...otherOptions } = options;

    return await this.findAll({
      include: [
        {
          model: Order,
          as: 'order',
          where: { userId },
          attributes: ['id', 'orderNumber', 'totalAmount']
        }
      ],
      order: [['createdAt', 'DESC']],
      page,
      limit,
      ...otherOptions
    });
  }

  async findPaymentsByOrder(orderId, options = {}) {
    return await this.findAll({
      where: { orderId },
      order: [['createdAt', 'DESC']],
      ...options
    });
  }

  async findPaymentByGatewayTransaction(gatewayTransactionId, options = {}) {
    return await this.findOne({ gatewayTransactionId }, options);
  }

  async findSuccessfulPayments(dateRange = {}, options = {}) {
    const { startDate, endDate } = dateRange;
    
    const where = {
      status: 'completed'
    };

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }

    return await this.findAll({
      where,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber', 'totalAmount']
        }
      ],
      ...options
    });
  }

  async updatePaymentStatus(paymentId, status, options = {}) {
    const updateData = { status };
    
    if (status === 'completed') {
      updateData.paidAt = new Date();
    } else if (status === 'refunded') {
      updateData.refundedAt = new Date();
    }

    return await this.update(paymentId, updateData, options);
  }

  async processRefund(paymentId, refundAmount, reason, options = {}) {
    const payment = await this.findById(paymentId, options);
    
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'completed') {
      throw new Error('Cannot refund a payment that is not completed');
    }

    if (refundAmount > payment.amount) {
      throw new Error('Refund amount cannot exceed payment amount');
    }

    const updateData = {
      status: refundAmount === payment.amount ? 'refunded' : 'partially_refunded',
      refundAmount,
      refundReason: reason,
      refundedAt: new Date()
    };

    return await this.update(paymentId, updateData, options);
  }

  async getPaymentStats(timeframe = 'month') {
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
        COUNT(*) as total_payments,
        SUM(amount) as total_revenue,
        AVG(amount) as average_payment,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_payments,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as successful_revenue
      FROM payments 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
      GROUP BY ${groupBy}
      ORDER BY period DESC
    `;

    return await sequelize.query(query, {
      type: QueryTypes.SELECT
    });
  }

  async findPendingPayments(options = {}) {
    return await this.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber', 'userId']
        }
      ],
      ...options
    });
  }

  async createPaymentRecord(orderId, paymentData, options = {}) {
    const payment = await this.create({
      orderId,
      ...paymentData,
      status: 'pending'
    }, options);

    return await this.findPaymentWithDetails(payment.id, options);
  }
}

module.exports = PaymentRepository;