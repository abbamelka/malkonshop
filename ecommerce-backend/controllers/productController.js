const BaseController = require('./baseController');
const { ProductService } = require('../services');

class ProductController extends BaseController {
  constructor() {
    super(new ProductService());
  }

  // Public routes
  getProducts = async (req, res) => {
    try {
      const result = await this.service.getProducts(req.query);
      this.success(res, 200, 'Products fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.service.getProductWithDetails(id);
      this.success(res, 200, 'Product fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getFeaturedProducts = async (req, res) => {
    try {
      const result = await this.service.getFeaturedProducts(req.query);
      this.success(res, 200, 'Featured products fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getProductsByCategory = async (req, res) => {
    try {
      const { categoryId } = req.params;
      const result = await this.service.getProductsByCategory(categoryId, req.query);
      this.success(res, 200, 'Products fetched by category', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Admin routes
  createProduct = async (req, res) => {
    try {
      const result = await this.service.createProduct(req.body);
      this.success(res, 201, 'Product created successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  updateProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.service.updateProduct(id, req.body);
      this.success(res, 200, 'Product updated successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  deleteProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.service.delete(id);
      this.success(res, 200, result.message);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  publishProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.service.publishProduct(id);
      this.success(res, 200, 'Product published successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  unpublishProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.service.unpublishProduct(id);
      this.success(res, 200, 'Product unpublished successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  updateStock = async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const result = await this.service.updateStock(id, quantity);
      this.success(res, 200, 'Stock updated successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getLowStockProducts = async (req, res) => {
    try {
      const { threshold = 5 } = req.query;
      const result = await this.service.getLowStockProducts(parseInt(threshold), req.query);
      this.success(res, 200, 'Low stock products fetched', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  bulkUpdateProducts = async (req, res) => {
    try {
      const { products } = req.body;
      const result = await this.service.bulkUpdateProducts(products);
      this.success(res, 200, result.message, result);
    } catch (error) {
      this.handleError(res, error);
    }
  };
}

module.exports = ProductController;