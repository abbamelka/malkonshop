const BaseService = require('./baseService');
const { ProductRepository, CategoryRepository } = require('../repositories');
const { AppError } = require('../utils/errors');

class ProductService extends BaseService {
  constructor() {
    super(new ProductRepository());
    this.categoryRepository = new CategoryRepository();
  }

  async createProduct(productData) {
    try {
      // Validate category exists
      const category = await this.categoryRepository.findById(productData.categoryId);
      if (!category) {
        throw new AppError('Category not found', 404);
      }

      // Generate SKU if not provided
      if (!productData.sku) {
        productData.sku = this.generateSKU(productData.name);
      }

      // Generate slug if not provided
      if (!productData.slug) {
        productData.slug = this.generateSlug(productData.name);
      }

      const product = await this.repository.create(productData);

      return product;
    } catch (error) {
      throw error;
    }
  }

  async getProducts(filters = {}, options = {}) {
    try {
      const { 
        search, 
        category, 
        minPrice, 
        maxPrice, 
        inStock, 
        featured,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        ...otherOptions 
      } = options;

      const repositoryOptions = {
        ...otherOptions,
        sortBy,
        sortOrder
      };

      if (search || category || minPrice !== undefined || maxPrice !== undefined || inStock !== undefined || featured !== undefined) {
        return await this.repository.searchProducts(search, {
          categoryId: category,
          minPrice,
          maxPrice,
          inStock,
          featured,
          ...repositoryOptions
        });
      }

      return await this.repository.findActiveProducts(repositoryOptions);
    } catch (error) {
      throw error;
    }
  }

  async getProductWithDetails(productId) {
    try {
      const product = await this.repository.findProductWithDetails(productId);

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      // Calculate average rating
      if (product.reviews && product.reviews.length > 0) {
        const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
        product.dataValues.averageRating = (totalRating / product.reviews.length).toFixed(1);
        product.dataValues.reviewCount = product.reviews.length;
      } else {
        product.dataValues.averageRating = 0;
        product.dataValues.reviewCount = 0;
      }

      return product;
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(productId, productData) {
    try {
      // If name is being updated, update slug as well
      if (productData.name) {
        productData.slug = this.generateSlug(productData.name);
      }

      const product = await this.repository.update(productId, productData);

      return product;
    } catch (error) {
      throw error;
    }
  }

  async updateStock(productId, quantity) {
    try {
      const product = await this.repository.updateStock(productId, quantity);

      // Log inventory change
      // await this.inventoryService.logInventoryChange(productId, null, 'adjustment', quantity);

      return product;
    } catch (error) {
      throw error;
    }
  }

  async incrementStock(productId, amount) {
    try {
      const product = await this.repository.incrementStock(productId, amount);

      // Log inventory change
      // await this.inventoryService.logInventoryChange(productId, null, 'in', amount);

      return product;
    } catch (error) {
      throw error;
    }
  }

  async decrementStock(productId, amount) {
    try {
      const product = await this.repository.decrementStock(productId, amount);

      // Log inventory change
      // await this.inventoryService.logInventoryChange(productId, null, 'out', amount);

      return product;
    } catch (error) {
      throw error;
    }
  }

  async publishProduct(productId) {
    try {
      const product = await this.repository.publishProduct(productId);

      return product;
    } catch (error) {
      throw error;
    }
  }

  async unpublishProduct(productId) {
    try {
      const product = await this.repository.unpublishProduct(productId);

      return product;
    } catch (error) {
      throw error;
    }
  }

  async getFeaturedProducts(options = {}) {
    try {
      return await this.repository.findFeaturedProducts(options);
    } catch (error) {
      throw error;
    }
  }

  async getProductsByCategory(categoryId, options = {}) {
    try {
      // Verify category exists
      const category = await this.categoryRepository.findById(categoryId);
      if (!category) {
        throw new AppError('Category not found', 404);
      }

      return await this.repository.findProductsByCategory(categoryId, options);
    } catch (error) {
      throw error;
    }
  }

  async getLowStockProducts(threshold = 5, options = {}) {
    try {
      return await this.repository.findLowStockProducts(threshold, options);
    } catch (error) {
      throw error;
    }
  }

  async bulkUpdateProducts(productsData) {
    try {
      const updatePromises = productsData.map(productData =>
        this.repository.update(productData.id, productData)
      );

      const results = await Promise.allSettled(updatePromises);

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      return {
        message: `Bulk update completed: ${successful} successful, ${failed} failed`,
        successful,
        failed
      };
    } catch (error) {
      throw error;
    }
  }

  generateSKU(name) {
    const prefix = name.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

module.exports = ProductService;