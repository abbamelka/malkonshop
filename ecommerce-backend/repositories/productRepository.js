const BaseRepository = require('./baseRepository');
const { Product, Category, ProductVariant, Review, ProductAttributeValue } = require('../models');
const { Op } = require('sequelize');

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  async findActiveProducts(options = {}) {
    return await this.findAll({
      where: { 
        isActive: true,
        isPublished: true 
      },
      ...options
    });
  }

  async findProductWithDetails(productId, options = {}) {
    return await this.findById(productId, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: ProductVariant,
          as: 'variants',
          where: { isActive: true },
          required: false
        },
        {
          model: Review,
          as: 'reviews',
          where: { isApproved: true },
          required: false
        }
      ],
      ...options
    });
  }

  async findProductsByCategory(categoryId, options = {}) {
    return await this.findAll({
      where: {
        categoryId,
        isActive: true,
        isPublished: true
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      ...options
    });
  }

  async searchProducts(searchTerm, options = {}) {
    const { categoryId, minPrice, maxPrice, inStock, ...otherOptions } = options;
    
    const where = {
      isActive: true,
      isPublished: true,
      [Op.or]: [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { description: { [Op.like]: `%${searchTerm}%` } },
        { shortDescription: { [Op.like]: `%${searchTerm}%` } }
      ]
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price[Op.gte] = minPrice;
      if (maxPrice !== undefined) where.price[Op.lte] = maxPrice;
    }

    if (inStock !== undefined) {
      if (inStock) {
        where[Op.or] = [
          { quantity: { [Op.gt]: 0 } },
          { allowOutOfStockPurchases: true }
        ];
      } else {
        where.quantity = { [Op.lte]: 0 };
        where.allowOutOfStockPurchases = false;
      }
    }

    return await this.findAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: ProductVariant,
          as: 'variants',
          where: { isActive: true },
          required: false
        }
      ],
      ...otherOptions
    });
  }

  async findFeaturedProducts(options = {}) {
    return await this.findAll({
      where: {
        featured: true,
        isActive: true,
        isPublished: true
      },
      ...options
    });
  }

  async updateStock(productId, quantity, options = {}) {
    return await this.update(productId, { quantity }, options);
  }

  async incrementStock(productId, amount, options = {}) {
    const product = await this.findById(productId, options);
    return await product.increment('quantity', { by: amount });
  }

  async decrementStock(productId, amount, options = {}) {
    const product = await this.findById(productId, options);
    
    if (product.trackQuantity && product.quantity < amount && !product.allowOutOfStockPurchases) {
      throw new AppError('Insufficient stock', 400);
    }
    
    return await product.decrement('quantity', { by: amount });
  }

  async findLowStockProducts(threshold = 5, options = {}) {
    return await this.findAll({
      where: {
        trackQuantity: true,
        quantity: { [Op.lte]: threshold },
        isActive: true
      },
      ...options
    });
  }

  async publishProduct(productId, options = {}) {
    return await this.update(productId, { 
      isPublished: true,
      publishedAt: new Date()
    }, options);
  }

  async unpublishProduct(productId, options = {}) {
    return await this.update(productId, { 
      isPublished: false 
    }, options);
  }

  async findProductsWithAttributes(productId, options = {}) {
    return await this.findById(productId, {
      include: [
        {
          model: ProductAttributeValue,
          as: 'attributeValues',
          include: ['attribute']
        }
      ],
      ...options
    });
  }
}

module.exports = ProductRepository;