const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const { PaymentController } = require('../controllers');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const paymentController = new PaymentController();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing endpoints
 */

/**
 * @swagger
 * /payment/intent:
 *   post:
 *     summary: Create payment intent
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Payment intent created successfully
 */
router.post('/intent',
  authenticate,
  [
    body('orderId').isInt({ min: 1 }).withMessage('Valid order ID is required')
  ],
  validateRequest,
  paymentController.createPaymentIntent
);

/**
 * @swagger
 * /payment/confirm:
 *   post:
 *     summary: Confirm payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentIntentId
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *                 example: pi_1A2b3C4d5e6f7G8h9i0j
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 */
router.post('/confirm',
  authenticate,
  [
    body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required')
  ],
  validateRequest,
  paymentController.confirmPayment
);

/**
 * @swagger
 * /payment/methods:
 *   get:
 *     summary: Get user's payment methods
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment methods fetched successfully
 */
router.get('/methods', authenticate, paymentController.getPaymentMethods);

/**
 * @swagger
 * /payment/methods:
 *   post:
 *     summary: Add payment method
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentMethodId
 *               - type
 *             properties:
 *               paymentMethodId:
 *                 type: string
 *                 example: pm_1A2b3C4d5e6f7G8h9i0j
 *               type:
 *                 type: string
 *                 enum: [card, paypal]
 *                 example: card
 *     responses:
 *       201:
 *         description: Payment method added successfully
 */
router.post('/methods',
  authenticate,
  [
    body('paymentMethodId').notEmpty().withMessage('Payment method ID is required'),
    body('type').isIn(['card', 'paypal']).withMessage('Valid payment method type is required')
  ],
  validateRequest,
  paymentController.addPaymentMethod
);

/**
 * @swagger
 * /payment/methods/{paymentMethodId}:
 *   delete:
 *     summary: Remove payment method
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentMethodId
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment method ID
 *     responses:
 *       200:
 *         description: Payment method removed successfully
 */
router.delete('/methods/:paymentMethodId',
  authenticate,
  [
    param('paymentMethodId').notEmpty().withMessage('Payment method ID is required')
  ],
  validateRequest,
  paymentController.removePaymentMethod
);

/**
 * @swagger
 * /payment/history:
 *   get:
 *     summary: Get payment history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Payment history fetched successfully
 */
router.get('/history', authenticate, paymentController.getPaymentHistory);

// Admin routes
/**
 * @swagger
 * /payment/refund/{orderId}:
 *   post:
 *     summary: Process refund (Admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 50.00
 *               reason:
 *                 type: string
 *                 example: Customer requested refund
 *     responses:
 *       200:
 *         description: Refund processed successfully
 */
router.post('/refund/:orderId',
  authenticate,
  authorize('admin'),
  [
    param('orderId').isInt({ min: 1 }).withMessage('Valid order ID is required'),
    body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('reason').optional().isString().withMessage('Reason must be a string')
  ],
  validateRequest,
  paymentController.refundPayment
);

// Webhook endpoint (no authentication required for webhooks)
/**
 * @swagger
 * /payment/webhook/stripe:
 *   post:
 *     summary: Stripe webhook endpoint
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post('/webhook/stripe', paymentController.processStripeWebhook);

module.exports = router;