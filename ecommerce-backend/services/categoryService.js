const BaseService = require('./baseService');
const CategoryRepository = require('../repositories/categoryRepository');

class CategoryService extends BaseService {
  constructor() {
    super(new CategoryRepository());
  }

  /**
   * Get all active categories
   */
  async getActiveCategories(options = {}) {
    try {
      return await this.repository.findActiveCategories(options);
    } catch (error) {
      throw new Error(`Failed to get active categories: ${error.message}`);
    }
  }

  /**
   * Get all categories (alias for findAll)
   */
  async getAll(options = {}) {
    try {
      return await this.repository.findAll(options);
    } catch (error) {
      throw new Error(`Failed to get categories: ${error.message}`);
    }
  }

  /**
   * Get category by ID
   */
  async getById(id, options = {}) {
    try {
      if (!id) {
        throw new Error('Category ID is required');
      }

      const category = await this.repository.findById(id, options);
      
      if (!category) {
        throw new Error('Category not found');
      }

      return category;
    } catch (error) {
      throw new Error(`Failed to get category: ${error.message}`);
    }
  }

  /**
   * Get category with its products
   */
  async getCategoryWithProducts(categoryId, options = {}) {
    try {
      if (!categoryId) {
        throw new Error('Category ID is required');
      }

      const category = await this.repository.findCategoryWithProducts(categoryId, options);
      
      if (!category) {
        throw new Error('Category not found');
      }

      return category;
    } catch (error) {
      throw new Error(`Failed to get category with products: ${error.message}`);
    }
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug, options = {}) {
    try {
      if (!slug) {
        throw new Error('Slug is required');
      }

      const category = await this.repository.findCategoryBySlug(slug, options);
      
      if (!category) {
        throw new Error('Category not found');
      }

      return category;
    } catch (error) {
      throw new Error(`Failed to get category by slug: ${error.message}`);
    }
  }

  /**
   * Get all parent categories
   */
  async getParentCategories(options = {}) {
    try {
      return await this.repository.findParentCategories(options);
    } catch (error) {
      throw new Error(`Failed to get parent categories: ${error.message}`);
    }
  }

  /**
   * Get subcategories of a parent category
   */
  async getSubcategories(parentId, options = {}) {
    try {
      if (!parentId) {
        throw new Error('Parent ID is required');
      }

      return await this.repository.findSubcategories(parentId, options);
    } catch (error) {
      throw new Error(`Failed to get subcategories: ${error.message}`);
    }
  }

  /**
   * Get complete category tree
   */
  async getCategoryTree(options = {}) {
    try {
      return await this.repository.findCategoryTree(options);
    } catch (error) {
      throw new Error(`Failed to get category tree: ${error.message}`);
    }
  }

  /**
   * Get categories with product count
   */
  async getCategoriesWithProductCount(options = {}) {
    try {
      return await this.repository.findCategoriesWithProductCount(options);
    } catch (error) {
      throw new Error(`Failed to get categories with product count: ${error.message}`);
    }
  }

  /**
   * Create a new category
   */
  async create(categoryData, options = {}) {
    try {
      // Validate required fields
      if (!categoryData.name) {
        throw new Error('Category name is required');
      }

      // Check if category with same name already exists
      const existingCategory = await this.repository.findOne({ 
        name: categoryData.name 
      });

      if (existingCategory) {
        throw new Error('Category with this name already exists');
      }

      // Generate slug if not provided
      if (!categoryData.slug) {
        categoryData.slug = this.generateSlug(categoryData.name);
      }

      // Set default values
      const defaultData = {
        isActive: true,
        sortOrder: 0,
        ...categoryData
      };

      return await this.repository.create(defaultData, options);
    } catch (error) {
      throw new Error(`Failed to create category: ${error.message}`);
    }
  }

  /**
   * Update category
   */
  async update(categoryId, updateData, options = {}) {
    try {
      if (!categoryId) {
        throw new Error('Category ID is required');
      }

      // Check if category exists
      const existingCategory = await this.repository.findById(categoryId);
      if (!existingCategory) {
        throw new Error('Category not found');
      }

      // If name is being updated, check for duplicates
      if (updateData.name && updateData.name !== existingCategory.name) {
        const duplicateCategory = await this.repository.findOne({ 
          name: updateData.name,
          id: { [this.repository.Op.ne]: categoryId }
        });

        if (duplicateCategory) {
          throw new Error('Category with this name already exists');
        }

        // Update slug if name changed and slug wasn't explicitly provided
        if (!updateData.slug) {
          updateData.slug = this.generateSlug(updateData.name);
        }
      }

      return await this.repository.update(categoryId, updateData, options);
    } catch (error) {
      throw new Error(`Failed to update category: ${error.message}`);
    }
  }

  /**
   * Update category sort order
   */
  async updateCategorySortOrder(categoryId, sortOrder, options = {}) {
    try {
      if (!categoryId) {
        throw new Error('Category ID is required');
      }

      if (sortOrder === undefined || sortOrder === null) {
        throw new Error('Sort order is required');
      }

      // Check if category exists
      const existingCategory = await this.repository.findById(categoryId);
      if (!existingCategory) {
        throw new Error('Category not found');
      }

      return await this.repository.updateCategorySortOrder(categoryId, sortOrder, options);
    } catch (error) {
      throw new Error(`Failed to update category sort order: ${error.message}`);
    }
  }

  /**
   * Soft delete category
   */
  async delete(categoryId, options = {}) {
    try {
      if (!categoryId) {
        throw new Error('Category ID is required');
      }

      // Check if category exists
      const existingCategory = await this.repository.findById(categoryId);
      if (!existingCategory) {
        throw new Error('Category not found');
      }

      // Check if category has products
      const categoryWithProducts = await this.repository.findCategoryWithProducts(categoryId);
      if (categoryWithProducts && categoryWithProducts.products && categoryWithProducts.products.length > 0) {
        throw new Error('Cannot delete category with associated products');
      }

      // Check if category has subcategories
      const subcategories = await this.repository.findSubcategories(categoryId);
      if (subcategories && subcategories.length > 0) {
        throw new Error('Cannot delete category with subcategories');
      }

      const result = await this.repository.delete(categoryId, options);
      return { 
        success: true, 
        message: 'Category deleted successfully',
        data: result 
      };
    } catch (error) {
      throw new Error(`Failed to delete category: ${error.message}`);
    }
  }

  /**
   * Search categories
   */
  async searchCategories(searchTerm, options = {}) {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        throw new Error('Search term is required');
      }

      return await this.repository.searchCategories(searchTerm.trim(), options);
    } catch (error) {
      throw new Error(`Failed to search categories: ${error.message}`);
    }
  }

  /**
   * Generate slug from name
   */
  generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Bulk update categories
   */
  async bulkUpdateCategories(updates, options = {}) {
    try {
      const transaction = await this.repository.sequelize.transaction();
      
      try {
        const results = [];
        
        for (const update of updates) {
          const { id, ...updateData } = update;
          const result = await this.update(id, updateData, { 
            ...options, 
            transaction 
          });
          results.push(result);
        }

        await transaction.commit();
        return results;
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      throw new Error(`Failed to bulk update categories: ${error.message}`);
    }
  }

  /**
   * Reorder categories
   */
  async reorderCategories(orderedIds, options = {}) {
    try {
      if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
        throw new Error('Ordered IDs array is required');
      }

      const transaction = await this.repository.sequelize.transaction();
      
      try {
        const updates = orderedIds.map((id, index) => ({
          id,
          sortOrder: index
        }));

        const results = await this.bulkUpdateCategories(updates, { 
          ...options, 
          transaction 
        });

        await transaction.commit();
        return results;
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      throw new Error(`Failed to reorder categories: ${error.message}`);
    }
  }
}

module.exports = CategoryService;