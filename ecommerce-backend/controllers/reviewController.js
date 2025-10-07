// controllers/reviewController.js
const BaseController = require('./baseController');
const ReviewService = require('../services/reviewService');

class ReviewController extends BaseController {
  constructor() {
    super(new ReviewService());
  }

  // Create a new review
  createReview = async (req, res) => {
    try {
      const { id: userId } = req.user;
      const result = await this.service.createReview(userId, req.body);
      this.success(res, 201, 'Review created successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Get reviews for a product
  getProductReviews = async (req, res) => {
    try {
      const { productId } = req.params;
      const result = await this.service.getProductReviews(productId, req.query);
      this.success(res, 200, 'Product reviews fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Get user's reviews
  getUserReviews = async (req, res) => {
    try {
      const { id: userId } = req.user;
      const result = await this.service.getUserReviews(userId, req.query);
      this.success(res, 200, 'User reviews fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Get specific user's reviews (admin)
  getUserReviewsById = async (req, res) => {
    try {
      const { userId } = req.params;
      const result = await this.service.getUserReviews(userId, req.query);
      this.success(res, 200, 'User reviews fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Update review
  updateReview = async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { id: reviewId } = req.params;
      const result = await this.service.updateReview(reviewId, userId, req.body);
      this.success(res, 200, 'Review updated successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Delete review
  deleteReview = async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { id: reviewId } = req.params;
      const result = await this.service.deleteReview(reviewId, userId);
      this.success(res, 200, 'Review deleted successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Admin: Approve review
  approveReview = async (req, res) => {
    try {
      const { id: reviewId } = req.params;
      const result = await this.service.approveReview(reviewId);
      this.success(res, 200, 'Review approved successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Admin: Reject review
  rejectReview = async (req, res) => {
    try {
      const { id: reviewId } = req.params;
      const result = await this.service.rejectReview(reviewId);
      this.success(res, 200, 'Review rejected successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Admin: Get pending reviews
  getPendingReviews = async (req, res) => {
    try {
      const result = await this.service.getPendingReviews(req.query);
      this.success(res, 200, 'Pending reviews fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Mark review as helpful
  markHelpful = async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { id: reviewId } = req.params;
      const result = await this.service.markHelpful(reviewId, userId);
      this.success(res, 200, 'Review marked as helpful', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Mark review as not helpful
  markNotHelpful = async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { id: reviewId } = req.params;
      const result = await this.service.markNotHelpful(reviewId, userId);
      this.success(res, 200, 'Review marked as not helpful', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Get recent reviews
  getRecentReviews = async (req, res) => {
    try {
      const { days = 7 } = req.query;
      const result = await this.service.getRecentReviews(parseInt(days, 10), req.query);
      this.success(res, 200, 'Recent reviews fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Search reviews
  searchReviews = async (req, res) => {
    try {
      const { q } = req.query;
      const result = await this.service.searchReviews(q, req.query);
      this.success(res, 200, 'Reviews search completed', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Get review statistics for a product
  getReviewStats = async (req, res) => {
    try {
      const { productId } = req.params;
      const result = await this.service.getReviewStats(productId);
      this.success(res, 200, 'Review statistics fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Get single review by ID
  getReview = async (req, res) => {
    try {
      const { id: reviewId } = req.params;
      const result = await this.service.getById(reviewId);
      this.success(res, 200, 'Review fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Get all reviews (admin)
  getAllReviews = async (req, res) => {
    try {
      const result = await this.service.getAll(req.query);
      this.success(res, 200, 'All reviews fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };
}

// Export an instance (not the class)
module.exports = new ReviewController();
