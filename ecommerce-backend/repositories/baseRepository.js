const { Op } = require('sequelize');
const { AppError } = require('../utils/errors');

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  /**
   * Find record by primary key
   */
  async findById(id, options = {}) {
    try {
      const record = await this.model.findByPk(id, {
        ...options,
        paranoid: options.paranoid !== undefined ? options.paranoid : true
      });
      
      if (!record) {
        throw new AppError(`${this.model.name} not found`, 404);
      }
      
      return record;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error finding ${this.model.name}: ${error.message}`, 500);
    }
  }

  /**
   * Find all records with filtering, pagination, and sorting
   */
  async findAll(options = {}) {
    try {
      const {
        where = {},
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        include = [],
        attributes,
        paranoid = true,
        ...otherOptions
      } = options;

      const offset = (page - 1) * limit;
      
      const result = await this.model.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [[sortBy, sortOrder]],
        include,
        attributes,
        paranoid,
        distinct: true, // For correct count with includes
        ...otherOptions
      });

      return {
        data: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.count,
          pages: Math.ceil(result.count / limit),
          hasNext: page * limit < result.count,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new AppError(`Error fetching ${this.model.name}s: ${error.message}`, 500);
    }
  }

  /**
   * Find one record by conditions
   */
  async findOne(conditions = {}, options = {}) {
    try {
      const record = await this.model.findOne({
        where: conditions,
        ...options,
        paranoid: options.paranoid !== undefined ? options.paranoid : true
      });
      
      return record;
    } catch (error) {
      throw new AppError(`Error finding ${this.model.name}: ${error.message}`, 500);
    }
  }

  /**
   * Create new record
   */
  async create(data, options = {}) {
    try {
      const record = await this.model.create(data, options);
      
      // Reload with associations if needed
      if (options.include) {
        return await this.model.findByPk(record.id, {
          include: options.include,
          paranoid: false
        });
      }
      
      return record;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new AppError('Record already exists', 409);
      }
      if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(err => err.message);
        throw new AppError(`Validation failed: ${messages.join(', ')}`, 400);
      }
      throw new AppError(`Error creating ${this.model.name}: ${error.message}`, 500);
    }
  }

  /**
   * Update record by ID
   */
  async update(id, data, options = {}) {
    try {
      const record = await this.findById(id, options);
      
      const updatedRecord = await record.update(data, {
        ...options,
        returning: true
      });
      
      return updatedRecord;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new AppError('Record already exists', 409);
      }
      if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(err => err.message);
        throw new AppError(`Validation failed: ${messages.join(', ')}`, 400);
      }
      throw new AppError(`Error updating ${this.model.name}: ${error.message}`, 500);
    }
  }

  /**
   * Delete record (soft delete if paranoid is enabled)
   */
  async delete(id, options = {}) {
    try {
      const record = await this.findById(id, options);
      
      await record.destroy(options);
      
      return { message: `${this.model.name} deleted successfully` };
    } catch (error) {
      throw new AppError(`Error deleting ${this.model.name}: ${error.message}`, 500);
    }
  }

  /**
   * Hard delete record
   */
  async hardDelete(id, options = {}) {
    try {
      const record = await this.model.findByPk(id, {
        ...options,
        paranoid: false
      });
      
      if (!record) {
        throw new AppError(`${this.model.name} not found`, 404);
      }
      
      await record.destroy({ ...options, force: true });
      
      return { message: `${this.model.name} permanently deleted` };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error deleting ${this.model.name}: ${error.message}`, 500);
    }
  }

  /**
   * Restore soft-deleted record
   */
  async restore(id, options = {}) {
    try {
      const record = await this.model.findByPk(id, {
        ...options,
        paranoid: false
      });
      
      if (!record) {
        throw new AppError(`${this.model.name} not found`, 404);
      }
      
      await record.restore(options);
      
      return record;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error restoring ${this.model.name}: ${error.message}`, 500);
    }
  }

  /**
   * Count records by conditions
   */
  async count(conditions = {}, options = {}) {
    try {
      const count = await this.model.count({
        where: conditions,
        ...options,
        paranoid: options.paranoid !== undefined ? options.paranoid : true
      });
      
      return count;
    } catch (error) {
      throw new AppError(`Error counting ${this.model.name}s: ${error.message}`, 500);
    }
  }

  /**
   * Bulk create records
   */
  async bulkCreate(data, options = {}) {
    try {
      const records = await this.model.bulkCreate(data, {
        ...options,
        returning: true
      });
      
      return records;
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(err => err.message);
        throw new AppError(`Validation failed: ${messages.join(', ')}`, 400);
      }
      throw new AppError(`Error bulk creating ${this.model.name}s: ${error.message}`, 500);
    }
  }

  /**
   * Update multiple records by conditions
   */
  async updateMany(conditions, data, options = {}) {
    try {
      const [affectedCount] = await this.model.update(data, {
        where: conditions,
        ...options
      });
      
      return { affectedCount };
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(err => err.message);
        throw new AppError(`Validation failed: ${messages.join(', ')}`, 400);
      }
      throw new AppError(`Error updating ${this.model.name}s: ${error.message}`, 500);
    }
  }

  /**
   * Find or create record
   */
  async findOrCreate(conditions, defaults = {}, options = {}) {
    try {
      const [record, created] = await this.model.findOrCreate({
        where: conditions,
        defaults,
        ...options
      });
      
      return { record, created };
    } catch (error) {
      throw new AppError(`Error finding or creating ${this.model.name}: ${error.message}`, 500);
    }
  }
}

module.exports = BaseRepository;