const BaseController = require('./baseController');
const { PaymentService, OrderService } = require('../services');

class PaymentController extends BaseController {
  constructor() {
    super(new PaymentService());
    this.orderService = new OrderService();
  }

  success(res, statusCode, message, data = null) {
    return require('../utils/responseHandler').successResponse(res, statusCode, message, data);
  }

  error(res, statusCode, message, errors = null) {
    return require('../utils/responseHandler').errorResponse(res, statusCode, message, errors);
  }

  handleError(res, error) {
    console.error('Payment Controller Error:', error);

    if (error.statusCode) {
      return this.error(res, error.statusCode, error.message, error.errors);
    }

    return this.error(res, 500, 'Internal server error');
  }

  createPaymentIntent = async (req, res) => {
    try {
      const { orderId } = req.body;
      const result = await this.service.createPaymentIntent(orderId);
      this.success(res, 200, 'Payment intent created successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  confirmPayment = async (req, res) => {
    try {
      const { paymentIntentId } = req.body;
      const result = await this.service.confirmPayment(paymentIntentId);
      this.success(res, 200, 'Payment confirmed successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  processStripeWebhook = async (req, res) => {
    try {
      const signature = req.headers['stripe-signature'];
      const result = await this.service.handleStripeWebhook(req.body, signature);
      this.success(res, 200, 'Webhook processed successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getPaymentMethods = async (req, res) => {
    try {
      const result = await this.service.getPaymentMethods(req.user.id);
      this.success(res, 200, 'Payment methods fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  addPaymentMethod = async (req, res) => {
    try {
      const result = await this.service.addPaymentMethod(req.user.id, req.body);
      this.success(res, 201, 'Payment method added successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  removePaymentMethod = async (req, res) => {
    try {
      const { paymentMethodId } = req.params;
      const result = await this.service.removePaymentMethod(req.user.id, paymentMethodId);
      this.success(res, 200, 'Payment method removed successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  refundPayment = async (req, res) => {
    try {
      const { orderId } = req.params;
      const { amount, reason } = req.body;
      const result = await this.service.processRefund(orderId, amount, reason);
      this.success(res, 200, 'Refund processed successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getPaymentHistory = async (req, res) => {
    try {
      const result = await this.service.getPaymentHistory(req.user.id, req.query);
      this.success(res, 200, 'Payment history fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };
}

module.exports = PaymentController;