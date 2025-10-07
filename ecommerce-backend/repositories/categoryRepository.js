const BaseRepository = require('./baseRepository');
const { Category, Product } = require('../models');
const { Op } = require('sequelize');

class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }

  async findActiveCategories(options = {}) {
    return await this.findAll({
      where: { isActive: true },
      ...options
    });
  }

  async findCategoryWithProducts(categoryId, options = {}) {
    return await this.findById(categoryId, {
      include: [
        {
          model: Product,
          as: 'products',
          where: { 
            isActive: true,
            isPublished: true 
          },
          required: false
        }
      ],
      ...options
    });
  }

  async findCategoryBySlug(slug, options = {}) {
    return await this.findOne({ slug }, options);
  }

  async findParentCategories(options = {}) {
    return await this.findAll({
      where: { parentId: null },
      ...options
    });
  }

  async findSubcategories(parentId, options = {}) {
    return await this.findAll({
      where: { parentId },
      ...options
    });
  }

  async findCategoryTree(options = {}) {
    const categories = await this.findAll({
      where: { isActive: true },
      include: [
        {
          model: Category,
          as: 'children',
          where: { isActive: true },
          required: false,
          include: [
            {
              model: Category,
              as: 'children',
              where: { isActive: true },
              required: false
            }
          ]
        }
      ],
      ...options
    });

    return categories.filter(category => !category.parentId);
  }

  async findCategoriesWithProductCount(options = {}) {
    const { sequelize } = require('../models');
    const { QueryTypes } = require('sequelize');

    const query = `
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.parent_id,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id 
        AND p.is_active = true 
        AND p.is_published = true
        AND p.deleted_at IS NULL
      WHERE c.is_active = true 
        AND c.deleted_at IS NULL
      GROUP BY c.id, c.name, c.slug, c.parent_id
      ORDER BY c.sort_order ASC, c.name ASC
    `;

    return await sequelize.query(query, {
      type: QueryTypes.SELECT
    });
  }

  async updateCategorySortOrder(categoryId, sortOrder, options = {}) {
    return await this.update(categoryId, { sortOrder }, options);
  }

  async searchCategories(searchTerm, options = {}) {
    return await this.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { name: { [Op.like]: `%${searchTerm}%` } },
          { description: { [Op.like]: `%${searchTerm}%` } }
        ]
      },
      ...options
    });
  }
}

module.exports = CategoryRepository;