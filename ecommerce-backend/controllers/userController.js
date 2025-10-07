const BaseController = require('./baseController');
const { UserService } = require('../services');

class UserController extends BaseController {
  constructor() {
    super(new UserService());
  }

  // Admin only routes
  getAllUsers = async (req, res) => {
    try {
      const result = await this.service.getAll(req.query);
      this.success(res, 200, 'Users fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getUserById = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.service.getById(id);
      this.success(res, 200, 'User fetched successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  createUser = async (req, res) => {
    try {
      const result = await this.service.create(req.body);
      this.success(res, 201, 'User created successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.service.update(id, req.body);
      this.success(res, 200, 'User updated successfully', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.service.delete(id);
      this.success(res, 200, result.message);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  deactivateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.service.deactivateUser(id);
      this.success(res, 200, result.message);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  activateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.service.activateUser(id);
      this.success(res, 200, result.message);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  searchUsers = async (req, res) => {
    try {
      const { q } = req.query;
      const result = await this.service.searchUsers(q, req.query);
      this.success(res, 200, 'Users search completed', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getUsersByRole = async (req, res) => {
    try {
      const { role } = req.params;
      const result = await this.service.getUsersByRole(role, req.query);
      this.success(res, 200, 'Users fetched by role', result);
    } catch (error) {
      this.handleError(res, error);
    }
  };
}

module.exports = UserController;