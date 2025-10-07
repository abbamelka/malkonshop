const BaseController = require('./baseController');
const CategoryService = require('../services/categoryService'); // FIXED: Direct import

class CategoryController extends BaseController {
  constructor() {
    super(new CategoryService());
  }

  // Public routes
  getCategories = async (req, res) => {
    try {
      const result = await this.service.getAll(req.query);
      this.success(res, 200, 'Categories fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getCategory = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.service.getById(id);
      this.success(res, 200, 'Category fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getCategoryBySlug = async (req, res) => {
    try {
      const { slug } = req.params;
      const result = await this.service.getCategoryBySlug(slug);
      this.success(res, 200, 'Category fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getCategoryTree = async (req, res) => {
    try {
      const result = await this.service.getCategoryTree(req.query);
      this.success(res, 200, 'Category tree fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getCategoryWithProducts = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.service.getCategoryWithProducts(id, req.query);
      this.success(res, 200, 'Category with products fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getActiveCategories = async (req, res) => {
    try {
      const result = await this.service.getActiveCategories(req.query);
      this.success(res, 200, 'Active categories fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getParentCategories = async (req, res) => {
    try {
      const result = await this.service.getParentCategories(req.query);
      this.success(res, 200, 'Parent categories fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getSubcategories = async (req, res) => {
    try {
      const { parentId } = req.params;
      const result = await this.service.getSubcategories(parentId, req.query);
      this.success(res, 200, 'Subcategories fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Admin routes
  createCategory = async (req, res) => {
    try {
      const result = await this.service.create(req.body);
      this.success(res, 201, 'Category created successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  updateCategory = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.service.update(id, req.body);
      this.success(res, 200, 'Category updated successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  deleteCategory = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.service.delete(id);
      this.success(res, 200, result.message);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getCategoriesWithProductCount = async (req, res) => {
    try {
      const result = await this.service.getCategoriesWithProductCount();
      this.success(res, 200, 'Categories with product count fetched', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  searchCategories = async (req, res) => {
    try {
      const { q } = req.query;
      const result = await this.service.searchCategories(q, req.query);
      this.success(res, 200, 'Categories search completed', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  updateSortOrder = async (req, res) => {
    try {
      const { id } = req.params;
      const { sortOrder } = req.body;
      const result = await this.service.updateCategorySortOrder(id, sortOrder);
      this.success(res, 200, 'Category sort order updated', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  reorderCategories = async (req, res) => {
    try {
      const { orderedIds } = req.body;
      const result = await this.service.reorderCategories(orderedIds);
      this.success(res, 200, 'Categories reordered successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };
}

module.exports = CategoryController;