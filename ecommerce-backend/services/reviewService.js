const BaseService = require('./baseService');
const { ReviewRepository, ProductRepository, OrderRepository } = require('../repositories');
const { AppError } = require('../utils/errors');

class ReviewService extends BaseService {
  constructor() {
    super(new ReviewRepository());
    this.productRepository = new ProductRepository();
    this.orderRepository = new OrderRepository();
  }

  async createReview(userId, reviewData) {
    try {
      const { productId, orderId } = reviewData;

      // Verify product exists
      const product = await this.productRepository.findById(productId);
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      // Verify order exists and belongs to user
      const order = await this.orderRepository.findById(orderId);
      if (!order || order.userId !== userId) {
        throw new AppError('Order not found or does not belong to user', 404);
      }

      // Check if user has already reviewed this product from this order
      const existingReview = await this.repository.findReviewByUserAndProduct(
        userId, 
        productId, 
        orderId
      );

      if (existingReview) {
        throw new AppError('You have already reviewed this product from this order', 400);
      }

      // Verify that the order contains the product
      const orderItem = order.items.find(item => item.productId === productId);
      if (!orderItem) {
        throw new AppError('Product not found in the specified order', 400);
      }

      // Auto-approve reviews for now (could be configurable)
      const review = await this.repository.create({
        ...reviewData,
        userId,
        isApproved: true // Auto-approve for demo
      });

      return await this.repository.findReviewWithDetails(review.id);
    } catch (error) {
      throw error;
    }
  }

  async getProductReviews(productId, options = {}) {
    try {
      // Verify product exists
      const product = await this.productRepository.findById(productId);
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      const reviews = await this.repository.findProductReviews(productId, options);
      
      // Get rating statistics
      const stats = await this.repository.getProductRatingStats(productId);

      return {
        reviews,
        stats
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserReviews(userId, options = {}) {
    try {
      return await this.repository.findUserReviews(userId, options);
    } catch (error) {
      throw error;
    }
  }

  async updateReview(reviewId, userId, updateData) {
    try {
      const review = await this.repository.findById(reviewId);
      
      if (!review) {
        throw new AppError('Review not found', 404);
      }

      // Users can only update their own reviews
      if (review.userId !== userId) {
        throw new AppError('You can only update your own reviews', 403);
      }

      // Reset approval status if content is changed
      if (updateData.rating || updateData.title || updateData.comment) {
        updateData.isApproved = false;
      }

      const updatedReview = await this.repository.update(reviewId, updateData);
      return await this.repository.findReviewWithDetails(updatedReview.id);
    } catch (error) {
      throw error;
    }
  }

  async deleteReview(reviewId, userId) {
    try {
      const review = await this.repository.findById(reviewId);
      
      if (!review) {
        throw new AppError('Review not found', 404);
      }

      // Users can only delete their own reviews
      if (review.userId !== userId) {
        throw new AppError('You can only delete your own reviews', 403);
      }

      return await this.repository.delete(reviewId);
    } catch (error) {
      throw error;
    }
  }

  async approveReview(reviewId) {
    try {
      const review = await this.repository.approveReview(reviewId);
      return await this.repository.findReviewWithDetails(review.id);
    } catch (error) {
      throw error;
    }
  }

  async rejectReview(reviewId) {
    try {
      const review = await this.repository.rejectReview(reviewId);
      return await this.repository.findReviewWithDetails(review.id);
    } catch (error) {
      throw error;
    }
  }

  async getPendingReviews(options = {}) {
    try {
      return await this.repository.findPendingReviews(options);
    } catch (error) {
      throw error;
    }
  }

  async markHelpful(reviewId, userId) {
    try {
      // In a real application, you would track which users marked which reviews helpful
      // to prevent multiple votes. For now, we'll just increment the count.
      const review = await this.repository.markHelpful(reviewId);
      return review;
    } catch (error) {
      throw error;
    }
  }

  async markNotHelpful(reviewId, userId) {
    try {
      const review = await this.repository.markNotHelpful(reviewId);
      return review;
    } catch (error) {
      throw error;
    }
  }

  async getRecentReviews(days = 7, options = {}) {
    try {
      return await this.repository.getRecentReviews(days, options);
    } catch (error) {
      throw error;
    }
  }

  async searchReviews(searchTerm, options = {}) {
    try {
      return await this.repository.searchReviews(searchTerm, options);
    } catch (error) {
      throw error;
    }
  }

  async getReviewStats(productId) {
    try {
      return await this.repository.getProductRatingStats(productId);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ReviewService;