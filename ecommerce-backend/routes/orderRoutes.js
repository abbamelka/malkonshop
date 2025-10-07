const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const { OrderController } = require('../controllers');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const orderController = new OrderController();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         userId:
 *           type: integer
 *           example: 5
 *         orderNumber:
 *           type: string
 *           example: "ORD-2025-0001"
 *         status:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled, refunded]
 *           example: pending
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *           example: paid
 *         paymentMethod:
 *           type: string
 *           enum: [credit_card, debit_card, paypal, stripe, cash_on_delivery]
 *           example: credit_card
 *         totalAmount:
 *           type: number
 *           example: 199.99
 *         notes:
 *           type: string
 *           example: "Please deliver after 5 PM"
 */

//
// -----------------------
// 🔹 Admin Routes
// -----------------------

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled, refunded]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 */
router.get('/',
  authenticate,
  authorize('admin'),
  orderController.getAllOrders
);

/**
 * @swagger
 * /api/orders/stats:
 *   get:
 *     summary: Get order statistics (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: month
 *     responses:
 *       200:
 *         description: Order stats fetched successfully
 */
router.get('/stats',
  authenticate,
  authorize('admin'),
  orderController.getOrderStats
);

/**
 * @swagger
 * /api/orders/recent:
 *   get:
 *     summary: Get recent orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *     responses:
 *       200:
 *         description: Recent orders fetched successfully
 */
router.get('/recent',
  authenticate,
  authorize('admin'),
  orderController.getRecentOrders
);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, processing, shipped, delivered, cancelled, refunded]
 *                 example: shipped
 *               notes:
 *                 type: string
 *                 example: "Shipped via FedEx"
 *     responses:
 *       200:
 *         description: Order status updated successfully
 */
router.patch('/:id/status',
  authenticate,
  authorize('admin'),
  [
    param('id').isInt().withMessage('Invalid order ID'),
    body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).withMessage('Valid status is required')
  ],
  validateRequest,
  orderController.updateOrderStatus
);

/**
 * @swagger
 * /api/orders/{id}/payment-status:
 *   patch:
 *     summary: Update payment status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentStatus
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, paid, failed, refunded]
 *                 example: paid
 *     responses:
 *       200:
 *         description: Payment status updated successfully
 */
router.patch('/:id/payment-status',
  authenticate,
  authorize('admin'),
  [
    param('id').isInt().withMessage('Invalid order ID'),
    body('paymentStatus').isIn(['pending', 'paid', 'failed', 'refunded']).withMessage('Valid payment status is required')
  ],
  validateRequest,
  orderController.updatePaymentStatus
);

//
// -----------------------
// 🔹 User Routes
// -----------------------

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order from cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - billingAddressId
 *               - shippingAddressId
 *               - paymentMethod
 *             properties:
 *               billingAddressId:
 *                 type: integer
 *               shippingAddressId:
 *                 type: integer
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, debit_card, paypal, stripe, cash_on_delivery]
 *               shippingMethod:
 *                 type: string
 *                 example: standard
 *               notes:
 *                 type: string
 *                 example: "Please deliver after 5 PM"
 *     responses:
 *       201:
 *         description: Order created successfully
 */
router.post('/',
  authenticate,
  [
    body('billingAddressId').isInt({ min: 1 }).withMessage('Valid billing address ID is required'),
    body('shippingAddressId').isInt({ min: 1 }).withMessage('Valid shipping address ID is required'),
    body('paymentMethod').isIn(['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery']).withMessage('Valid payment method is required')
  ],
  validateRequest,
  orderController.createOrder
);

/**
 * @swagger
 * /api/orders/user:
 *   get:
 *     summary: Get current user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled, refunded]
 *     responses:
 *       200:
 *         description: User orders fetched successfully
 */
router.get('/user',
  authenticate,
  orderController.getUserOrders
);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order fetched successfully
 */
router.get('/:id',
  authenticate,
  [param('id').isInt().withMessage('Invalid order ID')],
  validateRequest,
  orderController.getOrder
);

/**
 * @swagger
 * /api/orders/number/{orderNumber}:
 *   get:
 *     summary: Get order by order number
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order fetched successfully
 */
router.get('/number/:orderNumber',
  authenticate,
  [param('orderNumber').notEmpty().withMessage('Order number is required')],
  validateRequest,
  orderController.getOrderByNumber
);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Changed my mind"
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 */
router.patch('/:id/cancel',
  authenticate,
  [
    param('id').isInt().withMessage('Invalid order ID'),
    body('reason').optional().isString().withMessage('Reason must be a string')
  ],
  validateRequest,
  orderController.cancelOrder
);

module.exports = router;
