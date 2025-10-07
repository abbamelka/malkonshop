const BaseController = require('./baseController');
const { AuthService } = require('../services');

class AuthController extends BaseController {
  constructor() {
    super(new AuthService());
  }

  register = async (req, res) => {
    try {
      const result = await this.service.register(req.body);
      this.success(res, 201, 'User registered successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await this.service.login(email, password);
      this.success(res, 200, 'Login successful', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getProfile = async (req, res) => {
    try {
      const result = await this.service.userService.getProfile(req.user.id);
      this.success(res, 200, 'Profile fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  updateProfile = async (req, res) => {
    try {
      const result = await this.service.userService.updateProfile(req.user.id, req.body);
      this.success(res, 200, 'Profile updated successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  changePassword = async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await this.service.changePassword(req.user.id, currentPassword, newPassword);
      this.success(res, 200, result.message);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
      const result = await this.service.forgotPassword(email);
      this.success(res, 200, result.message);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  resetPassword = async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
      const result = await this.service.resetPassword(token, password);
      this.success(res, 200, result.message);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  verifyEmail = async (req, res) => {
    try {
      const { token } = req.params;
      const result = await this.service.verifyEmail(token);
      this.success(res, 200, result.message);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  refreshToken = async (req, res) => {
    try {
      const { refreshToken } = req.body;
      const result = await this.service.refreshToken(refreshToken);
      this.success(res, 200, 'Token refreshed successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  verifyToken = async (req, res) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      const result = await this.service.verifyToken(token);
      this.success(res, 200, 'Token is valid', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };
}

module.exports = AuthController;