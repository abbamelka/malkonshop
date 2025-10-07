const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const { CartController } = require('../controllers');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const cartController = new CartController();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management endpoints
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get user cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-session-id
 *         schema:
 *           type: string
 *         description: Session ID for guest users
 *     responses:
 *       200:
 *         description: Cart fetched successfully
 */
router.get('/', optionalAuth, cartController.getCart);

/**
 * @swagger
 * /cart/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-session-id
 *         schema:
 *           type: string
 *         description: Session ID for guest users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *               variantId:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 */
router.post('/items',
  optionalAuth,
  [
    body('productId').isInt({ min: 1 }).withMessage('Valid product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('variantId').optional().isInt({ min: 1 }).withMessage('Valid variant ID is required')
  ],
  validateRequest,
  cartController.addToCart
);

/**
 * @swagger
 * /cart/items/{itemId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart item ID
 *       - in: header
 *         name: x-session-id
 *         schema:
 *           type: string
 *         description: Session ID for guest users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 */
router.put('/items/:itemId',
  optionalAuth,
  [
    param('itemId').isInt({ min: 1 }).withMessage('Valid item ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
  ],
  validateRequest,
  cartController.updateCartItem
);

/**
 * @swagger
 * /cart/items/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart item ID
 *       - in: header
 *         name: x-session-id
 *         schema:
 *           type: string
 *         description: Session ID for guest users
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 */
router.delete('/items/:itemId',
  optionalAuth,
  [
    param('itemId').isInt({ min: 1 }).withMessage('Valid item ID is required')
  ],
  validateRequest,
  cartController.removeFromCart
);

/**
 * @swagger
 * /cart/clear:
 *   delete:
 *     summary: Clear cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-session-id
 *         schema:
 *           type: string
 *         description: Session ID for guest users
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 */
router.delete('/clear', optionalAuth, cartController.clearCart);

/**
 * @swagger
 * /cart/merge:
 *   post:
 *     summary: Merge guest cart with user cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-session-id
 *         schema:
 *           type: string
 *         description: Session ID for guest users
 *     responses:
 *       200:
 *         description: Carts merged successfully
 */
router.post('/merge', authenticate, cartController.mergeCarts);

/**
 * @swagger
 * /cart/coupon:
 *   post:
 *     summary: Apply coupon to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-session-id
 *         schema:
 *           type: string
 *         description: Session ID for guest users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - couponCode
 *             properties:
 *               couponCode:
 *                 type: string
 *                 example: SUMMER2024
 *     responses:
 *       200:
 *         description: Coupon applied successfully
 */
router.post('/coupon',
  optionalAuth,
  [
    body('couponCode').notEmpty().withMessage('Coupon code is required')
  ],
  validateRequest,
  cartController.applyCoupon
);

/**
 * @swagger
 * /cart/coupon:
 *   delete:
 *     summary: Remove coupon from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-session-id
 *         schema:
 *           type: string
 *         description: Session ID for guest users
 *     responses:
 *       200:
 *         description: Coupon removed successfully
 */
router.delete('/coupon', optionalAuth, cartController.removeCoupon);

module.exports = router;