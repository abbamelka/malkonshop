const BaseRepository = require('./baseRepository');
const { Review, User, Product, Order } = require('../models');
const { Op } = require('sequelize');

class ReviewRepository extends BaseRepository {
  constructor() {
    super(Review);
  }

  async findReviewWithDetails(reviewId, options = {}) {
    return await this.findById(reviewId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'slug', 'images']
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber']
        }
      ],
      ...options
    });
  }

  async findProductReviews(productId, options = {}) {
    const { page = 1, limit = 10, rating, ...otherOptions } = options;

    const where = {
      productId,
      isApproved: true
    };

    if (rating) {
      where.rating = rating;
    }

    return await this.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'avatar']
        }
      ],
      order: [
        ['helpfulCount', 'DESC'],
        ['createdAt', 'DESC']
      ],
      page,
      limit,
      ...otherOptions
    });
  }

  async findUserReviews(userId, options = {}) {
    const { page = 1, limit = 10, ...otherOptions } = options;

    return await this.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'slug', 'images']
        }
      ],
      order: [['createdAt', 'DESC']],
      page,
      limit,
      ...otherOptions
    });
  }

  async findPendingReviews(options = {}) {
    return await this.findAll({
      where: { isApproved: false },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [['createdAt', 'ASC']],
      ...options
    });
  }

  async findReviewByUserAndProduct(userId, productId, orderId, options = {}) {
    return await this.findOne({
      where: {
        userId,
        productId,
        orderId
      },
      ...options
    });
  }

  async getProductRatingStats(productId, options = {}) {
    const { sequelize } = require('../models');
    const { QueryTypes } = require('sequelize');

    const query = `
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM reviews 
      WHERE product_id = ? 
        AND is_approved = true
        AND deleted_at IS NULL
    `;

    const [stats] = await sequelize.query(query, {
      replacements: [productId],
      type: QueryTypes.SELECT
    });

    // Calculate percentages
    if (stats.total_reviews > 0) {
      stats.five_star_percentage = Math.round((stats.five_star / stats.total_reviews) * 100);
      stats.four_star_percentage = Math.round((stats.four_star / stats.total_reviews) * 100);
      stats.three_star_percentage = Math.round((stats.three_star / stats.total_reviews) * 100);
      stats.two_star_percentage = Math.round((stats.two_star / stats.total_reviews) * 100);
      stats.one_star_percentage = Math.round((stats.one_star / stats.total_reviews) * 100);
    }

    return stats;
  }

  async approveReview(reviewId, options = {}) {
    return await this.update(reviewId, { isApproved: true }, options);
  }

  async rejectReview(reviewId, options = {}) {
    return await this.update(reviewId, { isApproved: false }, options);
  }

  async markHelpful(reviewId, options = {}) {
    const review = await this.findById(reviewId, options);
    return await review.increment('helpfulCount');
  }

  async markNotHelpful(reviewId, options = {}) {
    const review = await this.findById(reviewId, options);
    return await review.increment('notHelpfulCount');
  }

  async getRecentReviews(days = 7, options = {}) {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return await this.findAll({
      where: {
        createdAt: { [Op.gte]: date },
        isApproved: true
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'slug', 'images']
        }
      ],
      order: [['createdAt', 'DESC']],
      ...options
    });
  }

  async searchReviews(searchTerm, options = {}) {
    const { page = 1, limit = 10, ...otherOptions } = options;

    return await this.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${searchTerm}%` } },
          { comment: { [Op.like]: `%${searchTerm}%` } }
        ],
        isApproved: true
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'slug']
        }
      ],
      page,
      limit,
      ...otherOptions
    });
  }
}

module.exports = ReviewRepository;