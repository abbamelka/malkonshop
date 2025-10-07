const BaseRepository = require('./baseRepository');
const { User, UserProfile, Address, Order } = require('../models');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email, options = {}) {
    return await this.findOne({ email }, options);
  }

  async findActiveUsers(options = {}) {
    return await this.findAll({
      where: { isActive: true },
      ...options
    });
  }

  async findUserWithProfile(userId, options = {}) {
    return await this.findById(userId, {
      include: [
        {
          model: UserProfile,
          as: 'profile',
          attributes: { exclude: ['createdAt', 'updatedAt'] }
        }
      ],
      ...options
    });
  }

  async findUserWithAddresses(userId, options = {}) {
    return await this.findById(userId, {
      include: [
        {
          model: Address,
          as: 'addresses',
          attributes: { exclude: ['createdAt', 'updatedAt'] }
        }
      ],
      ...options
    });
  }

  async findUserWithOrders(userId, options = {}) {
    const { page = 1, limit = 10, ...otherOptions } = options;
    
    return await this.findAll({
      where: { id: userId },
      include: [
        {
          model: Order,
          as: 'orders',
          include: ['billingAddress', 'shippingAddress']
        }
      ],
      page,
      limit,
      ...otherOptions
    });
  }

  async updateLastLogin(userId, options = {}) {
    return await this.update(userId, { lastLogin: new Date() }, options);
  }

  async updateUserProfile(userId, profileData, options = {}) {
    const user = await this.findById(userId, options);
    
    if (user.profile) {
      await user.profile.update(profileData);
    } else {
      await UserProfile.create({ userId, ...profileData });
    }
    
    return await this.findUserWithProfile(userId, options);
  }

  async deactivateUser(userId, options = {}) {
    return await this.update(userId, { isActive: false }, options);
  }

  async activateUser(userId, options = {}) {
    return await this.update(userId, { isActive: true }, options);
  }

  async findUsersByRole(role, options = {}) {
    return await this.findAll({
      where: { role },
      ...options
    });
  }

  async searchUsers(searchTerm, options = {}) {
    const { page = 1, limit = 10, ...otherOptions } = options;
    
    return await this.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${searchTerm}%` } },
          { email: { [Op.like]: `%${searchTerm}%` } }
        ]
      },
      page,
      limit,
      ...otherOptions
    });
  }
}

module.exports = UserRepository;