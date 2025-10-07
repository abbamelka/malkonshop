const { AppError } = require('../utils/errors');

class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  async getById(id, options = {}) {
    try {
      return await this.repository.findById(id, options);
    } catch (error) {
      throw error;
    }
  }

  async getAll(options = {}) {
    try {
      return await this.repository.findAll(options);
    } catch (error) {
      throw error;
    }
  }

  async create(data, options = {}) {
    try {
      return await this.repository.create(data, options);
    } catch (error) {
      throw error;
    }
  }

  async update(id, data, options = {}) {
    try {
      return await this.repository.update(id, data, options);
    } catch (error) {
      throw error;
    }
  }

  async delete(id, options = {}) {
    try {
      return await this.repository.delete(id, options);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BaseService;