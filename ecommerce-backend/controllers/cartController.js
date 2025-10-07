const BaseController = require('./baseController');
const { CartService } = require('../services');

class CartController {
  constructor() {
    this.service = new CartService();
  }

  success(res, statusCode, message, data = null) {
    return require('../utils/responseHandler').successResponse(res, statusCode, message, data);
  }

  error(res, statusCode, message, errors = null) {
    return require('../utils/responseHandler').errorResponse(res, statusCode, message, errors);
  }

  handleError(res, error) {
    console.error('Cart Controller Error:', error);

    if (error.statusCode) {
      return this.error(res, error.statusCode, error.message, error.errors);
    }

    return this.error(res, 500, 'Internal server error');
  }

  getCart = async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
      const result = await this.service.getCart(req.user?.id, sessionId);
      this.success(res, 200, 'Cart fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  addToCart = async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
      const result = await this.service.addItemToCart(req.user?.id, sessionId, req.body);
      this.success(res, 200, 'Item added to cart successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  updateCartItem = async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
      const { itemId } = req.params;
      const result = await this.service.updateCartItem(req.user?.id, sessionId, itemId, req.body);
      this.success(res, 200, 'Cart item updated successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  removeFromCart = async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
      const { itemId } = req.params;
      const result = await this.service.removeItemFromCart(req.user?.id, sessionId, itemId);
      this.success(res, 200, 'Item removed from cart successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  clearCart = async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
      const result = await this.service.clearCart(req.user?.id, sessionId);
      this.success(res, 200, 'Cart cleared successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  mergeCarts = async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
      const result = await this.service.mergeCarts(req.user.id, sessionId);
      this.success(res, 200, 'Carts merged successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  applyCoupon = async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
      const { couponCode } = req.body;
      const result = await this.service.applyCouponToCart(req.user?.id, sessionId, couponCode);
      this.success(res, 200, 'Coupon applied successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  removeCoupon = async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
      const result = await this.service.removeCouponFromCart(req.user?.id, sessionId);
      this.success(res, 200, 'Coupon removed successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };
}

module.exports = CartController;