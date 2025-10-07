const BaseController = require('./baseController');
const { OrderService } = require('../services');

class OrderController extends BaseController {
  constructor() {
    super(new OrderService());
  }

  createOrder = async (req, res) => {
    try {
      const result = await this.service.createOrderFromCart(req.user.id, req.body);
      this.success(res, 201, 'Order created successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getOrder = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.service.getById(id);
      
      // Users can only see their own orders unless admin
      if (req.user.role !== 'admin' && result.userId !== req.user.id) {
        return this.error(res, 403, 'Access denied');
      }

      this.success(res, 200, 'Order fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getOrderByNumber = async (req, res) => {
    try {
      const { orderNumber } = req.params;
      const result = await this.service.getOrderByNumber(orderNumber);
      
      // Users can only see their own orders unless admin
      if (req.user.role !== 'admin' && result.userId !== req.user.id) {
        return this.error(res, 403, 'Access denied');
      }

      this.success(res, 200, 'Order fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getUserOrders = async (req, res) => {
    try {
      const result = await this.service.getUserOrders(req.user.id, req.query);
      this.success(res, 200, 'User orders fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getAllOrders = async (req, res) => {
    try {
      const result = await this.service.getAll(req.query);
      this.success(res, 200, 'Orders fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  updateOrderStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const result = await this.service.updateOrderStatus(id, status, notes);
      this.success(res, 200, 'Order status updated successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  updatePaymentStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentStatus } = req.body;
      const result = await this.service.updatePaymentStatus(id, paymentStatus);
      this.success(res, 200, 'Payment status updated successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  cancelOrder = async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const result = await this.service.cancelOrder(id, reason);
      this.success(res, 200, 'Order cancelled successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getOrderStats = async (req, res) => {
    try {
      const { timeframe = 'month' } = req.query;
      const result = await this.service.getOrderStats(timeframe);
      this.success(res, 200, 'Order stats fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getRecentOrders = async (req, res) => {
    try {
      const { days = 7 } = req.query;
      const result = await this.service.getRecentOrders(parseInt(days), req.query);
      this.success(res, 200, 'Recent orders fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };
}

module.exports = OrderController;