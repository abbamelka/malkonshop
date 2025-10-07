const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const { CategoryController } = require('../controllers');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const categoryController = new CategoryController();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management endpoints
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
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
 *           default: 50
 *         description: Number of categories per page
 *       - in: query
 *         name: includeProducts
 *         schema:
 *           type: boolean
 *         description: Include products in the category response
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *       500:
 *         description: Server error
 */
router.get('/', optionalAuth, categoryController.getCategories);

/**
 * @swagger
 * /categories/tree:
 *   get:
 *     summary: Get category tree structure
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Category tree fetched successfully
 */
router.get('/tree', optionalAuth, categoryController.getCategoryTree);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category fetched successfully
 *       404:
 *         description: Category not found
 */
router.get(
  '/:id',
  [param('id').isInt().withMessage('Invalid category ID')],
  validateRequest,
  optionalAuth,
  categoryController.getCategory
);

/**
 * @swagger
 * /categories/slug/{slug}:
 *   get:
 *     summary: Get category by slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Category slug
 *     responses:
 *       200:
 *         description: Category fetched successfully
 *       404:
 *         description: Category not found
 */
router.get(
  '/slug/:slug',
  [param('slug').notEmpty().withMessage('Slug is required')],
  validateRequest,
  optionalAuth,
  categoryController.getCategoryBySlug
);

/**
 * @swagger
 * /categories/{id}/products:
 *   get:
 *     summary: Get category with products
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
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
 *         description: Number of products per page
 *     responses:
 *       200:
 *         description: Category with products fetched successfully
 *       404:
 *         description: Category not found
 */
router.get(
  '/:id/products',
  [param('id').isInt().withMessage('Invalid category ID')],
  validateRequest,
  optionalAuth,
  categoryController.getCategoryWithProducts
);

// -----------------------
// ✅ Admin-only Routes
// -----------------------
router.use(authenticate, authorize('admin'));

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Electronics
 *               description:
 *                 type: string
 *                 example: Devices and accessories
 *               parentId:
 *                 type: integer
 *                 example: null
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Category name is required'),
    body('parentId').optional().isInt().withMessage('Valid parent category ID is required'),
  ],
  validateRequest,
  categoryController.createCategory
);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Category Name
 *               description:
 *                 type: string
 *                 example: Updated description
 *               parentId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('Invalid category ID'),
    body('parentId').optional().isInt().withMessage('Valid parent category ID is required'),
  ],
  validateRequest,
  categoryController.updateCategory
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.delete(
  '/:id',
  [param('id').isInt().withMessage('Invalid category ID')],
  validateRequest,
  categoryController.deleteCategory
);

/**
 * @swagger
 * /categories/stats/product-count:
 *   get:
 *     summary: Get product count for each category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product count stats fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/stats/product-count', categoryController.getCategoriesWithProductCount);

module.exports = router;
