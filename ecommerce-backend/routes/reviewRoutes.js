const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

// Import your middleware and controllers
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const reviewController = require('../controllers/reviewController');

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Product review management endpoints
 */

/**
 * @swagger
 * /reviews/product/{productId}:
 *   get:
 *     summary: Get all reviews for a product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product
 *     responses:
 *       200:
 *         description: List of reviews fetched successfully
 *       404:
 *         description: Product not found
 */
router.get(
  '/product/:productId',
  [param('productId').isInt({ min: 1 }).withMessage('Valid product ID is required')],
  validateRequest,
  reviewController.getProductReviews
);

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - orderId
 *               - rating
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *               orderId:
 *                 type: integer
 *                 example: 101
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               title:
 *                 type: string
 *                 example: Excellent product
 *               comment:
 *                 type: string
 *                 example: Really enjoyed using this product.
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authenticate,
  [
    body('productId').isInt({ min: 1 }).withMessage('Valid product ID is required'),
    body('orderId').isInt({ min: 1 }).withMessage('Valid order ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('title').optional().isString().isLength({ max: 255 }).withMessage('Title must be a string with max 255 characters'),
    body('comment').optional().isString().withMessage('Comment must be a string')
  ],
  validateRequest,
  reviewController.createReview
);

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               title:
 *                 type: string
 *                 example: Updated title
 *               comment:
 *                 type: string
 *                 example: Updated comment
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
router.put(
  '/:id',
  authenticate,
  [
    param('id').isInt({ min: 1 }).withMessage('Valid review ID is required'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('title').optional().isString().isLength({ max: 255 }).withMessage('Title must be a string with max 255 characters'),
    body('comment').optional().isString().withMessage('Comment must be a string')
  ],
  validateRequest,
  reviewController.updateReview
);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
router.delete(
  '/:id',
  authenticate,
  [param('id').isInt({ min: 1 }).withMessage('Valid review ID is required')],
  validateRequest,
  reviewController.deleteReview
);

/**
 * @swagger
 * /reviews/{id}/approve:
 *   patch:
 *     summary: Approve a review (Admin only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Review not found
 */
router.patch(
  '/:id/approve',
  authenticate,
  authorize('admin'),
  [param('id').isInt({ min: 1 }).withMessage('Valid review ID is required')],
  validateRequest,
  reviewController.approveReview
);

/**
 * @swagger
 * /reviews/{id}/reject:
 *   patch:
 *     summary: Reject a review (Admin only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Review not found
 */
router.patch(
  '/:id/reject',
  authenticate,
  authorize('admin'),
  [param('id').isInt({ min: 1 }).withMessage('Valid review ID is required')],
  validateRequest,
  reviewController.rejectReview
);

module.exports = router;