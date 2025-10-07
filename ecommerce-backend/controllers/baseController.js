const { successResponse, errorResponse } = require('../utils/responseHandler');

class BaseController {
  constructor(service) {
    this.service = service;
  }

  success(res, statusCode, message, data = null) {
    return successResponse(res, statusCode, message, data);
  }

  error(res, statusCode, message, errors = null) {
    return errorResponse(res, statusCode, message, errors);
  }

  handleError(res, error) {
    console.error('Controller Error:', error);

    if (error.statusCode) {
      return this.error(res, error.statusCode, error.message, error.errors);
    }

    // Handle specific error types
    if (error.name === 'ValidationError') {
      return this.error(res, 400, 'Validation Error', error.errors);
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return this.error(res, 409, 'Resource already exists');
    }

    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return this.error(res, 400, 'Invalid reference');
    }

    return this.error(res, 500, 'Internal server error');
  }

  // Common CRUD methods
  create = async (req, res) => {
    try {
      const result = await this.service.create(req.body);
      this.success(res, 201, `${this.constructor.name.replace('Controller', '')} created successfully`, result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getById = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.service.getById(id);
      this.success(res, 200, `${this.constructor.name.replace('Controller', '')} fetched successfully`, result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getAll = async (req, res) => {
    try {
      const result = await this.service.getAll(req.query);
      this.success(res, 200, `${this.constructor.name.replace('Controller', '')}s fetched successfully`, result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  update = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.service.update(id, req.body);
      this.success(res, 200, `${this.constructor.name.replace('Controller', '')} updated successfully`, result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  delete = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.service.delete(id);
      this.success(res, 200, result.message);
    } catch (error) {
      this.handleError(res, error);
    }
  };
}

module.exports = BaseController;