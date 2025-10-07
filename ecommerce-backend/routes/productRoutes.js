const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const { ProductController } = require('../controllers');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { uploadProductImages } = require('../middleware/upload');

const productController = new ProductController();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */

// Public routes
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *         description: Category ID filter
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Featured products only
 *     responses:
 *       200:
 *         description: Products fetched successfully
 */
router.get('/', optionalAuth, productController.getProducts);

/**
 * @swagger
 * /products/featured:
 *   get:
 *     summary: Get featured products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Featured products fetched successfully
 */
router.get('/featured', optionalAuth, productController.getFeaturedProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *       404:
 *         description: Product not found
 */
router.get('/:id',
  [param('id').isInt().withMessage('Invalid product ID')],
  validateRequest,
  optionalAuth,
  productController.getProduct
);

/**
 * @swagger
 * /products/category/{categoryId}:
 *   get:
 *     summary: Get products by category
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Products fetched by category
 */
router.get('/category/:categoryId',
  [param('categoryId').isInt().withMessage('Invalid category ID')],
  validateRequest,
  optionalAuth,
  productController.getProductsByCategory
);

// Admin routes
router.use(authenticate, authorize('admin'));

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags: [Products]
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
 *               - price
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Smartphone XYZ
 *               description:
 *                 type: string
 *                 example: A great smartphone with amazing features
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 599.99
 *               categoryId:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 example: 100
 *               sku:
 *                 type: string
 *                 example: SMTP-XYZ-001
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.post('/',
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('categoryId').isInt().withMessage('Valid category ID is required'),
    body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a positive integer')
  ],
  validateRequest,
  productController.createProduct
);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Product Name
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 649.99
 *               description:
 *                 type: string
 *                 example: Updated product description
 *     responses:
 *       200:
 *         description: Product updated successfully
 */
router.put('/:id',
  [
    param('id').isInt().withMessage('Invalid product ID'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a positive integer')
  ],
  validateRequest,
  productController.updateProduct
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 */
router.delete('/:id',
  [param('id').isInt().withMessage('Invalid product ID')],
  validateRequest,
  productController.deleteProduct
);

/**
 * @swagger
 * /products/{id}/publish:
 *   patch:
 *     summary: Publish product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product published successfully
 */
router.patch('/:id/publish',
  [param('id').isInt().withMessage('Invalid product ID')],
  validateRequest,
  productController.publishProduct
);

/**
 * @swagger
 * /products/{id}/unpublish:
 *   patch:
 *     summary: Unpublish product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product unpublished successfully
 */
router.patch('/:id/unpublish',
  [param('id').isInt().withMessage('Invalid product ID')],
  validateRequest,
  productController.unpublishProduct
);

/**
 * @swagger
 * /products/{id}/stock:
 *   patch:
 *     summary: Update product stock (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 150
 *     responses:
 *       200:
 *         description: Stock updated successfully
 */
router.patch('/:id/stock',
  [
    param('id').isInt().withMessage('Invalid product ID'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a positive integer')
  ],
  validateRequest,
  productController.updateStock
);

module.exports = router;