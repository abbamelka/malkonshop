const { Review, Product, User, Order } = require('../models');
const { AppError } = require('../utils/errors');
const { Op } = require('sequelize');

const reviewController = {
  // Get all reviews for a product
  getProductReviews: async (req, res, next) => {
    try {
      const { productId } = req.params;

      const reviews = await Review.findAll({
        where: { 
          productId,
          status: 'approved' // Only show approved reviews
        },
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName']
          },
          {
            model: Product,
            attributes: ['id', 'name']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: reviews,
        count: reviews.length
      });
    } catch (error) {
      next(error);
    }
  },

  // Create a new review
  createReview: async (req, res, next) => {
    try {
      const { productId, orderId, rating, title, comment } = req.body;
      const userId = req.user.id;

      // Check if user has purchased the product
      const order = await Order.findOne({
        where: {
          id: orderId,
          userId,
          status: 'delivered'
        },
        include: [
          {
            model: Product,
            through: { where: { productId } },
            required: true
          }
        ]
      });

      if (!order) {
        throw new AppError('You can only review products you have purchased and received', 403);
      }

      // Check if user already reviewed this product
      const existingReview = await Review.findOne({
        where: {
          productId,
          userId,
          orderId
        }
      });

      if (existingReview) {
        throw new AppError('You have already reviewed this product for this order', 400);
      }

      const review = await Review.create({
        productId,
        userId,
        orderId,
        rating,
        title,
        comment,
        status: 'pending' // Admin approval required
      });

      // Populate with user data for response
      const reviewWithUser = await Review.findByPk(review.id, {
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully and awaiting approval',
        data: reviewWithUser
      });
    } catch (error) {
      next(error);
    }
  },

  // Update a review
  updateReview: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { rating, title, comment } = req.body;
      const userId = req.user.id;

      const review = await Review.findOne({
        where: {
          id,
          userId // Users can only update their own reviews
        }
      });

      if (!review) {
        throw new AppError('Review not found or you are not authorized to update it', 404);
      }

      // Only allow updating if review is not approved yet
      if (review.status === 'approved') {
        throw new AppError('Cannot update an approved review', 400);
      }

      await review.update({
        rating: rating || review.rating,
        title: title || review.title,
        comment: comment || review.comment,
        status: 'pending' // Reset to pending after update
      });

      res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: review
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete a review
  deleteReview: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const review = await Review.findOne({
        where: {
          id,
          userId // Users can only delete their own reviews
        }
      });

      if (!review) {
        throw new AppError('Review not found or you are not authorized to delete it', 404);
      }

      await review.destroy();

      res.status(200).json({
        success: true,
        message: 'Review deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Admin: Approve review
  approveReview: async (req, res, next) => {
    try {
      const { id } = req.params;

      const review = await Review.findByPk(id);
      if (!review) {
        throw new AppError('Review not found', 404);
      }

      await review.update({ status: 'approved' });

      res.status(200).json({
        success: true,
        message: 'Review approved successfully',
        data: review
      });
    } catch (error) {
      next(error);
    }
  },

  // Admin: Reject review
  rejectReview: async (req, res, next) => {
    try {
      const { id } = req.params;

      const review = await Review.findByPk(id);
      if (!review) {
        throw new AppError('Review not found', 404);
      }

      await review.update({ status: 'rejected' });

      res.status(200).json({
        success: true,
        message: 'Review rejected successfully',
        data: review
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = reviewController;