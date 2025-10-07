const BaseService = require('./baseService');
const { UserRepository } = require('../repositories');
const { AppError } = require('../utils/errors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class UserService extends BaseService {
  constructor() {
    super(new UserRepository());
  }

  async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await this.repository.findByEmail(userData.email);
      if (existingUser) {
        throw new AppError('User with this email already exists', 409);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user
      const user = await this.repository.create({
        ...userData,
        password: hashedPassword,
        emailVerificationToken: crypto.randomBytes(32).toString('hex')
      });

      // Remove sensitive data
      const { password, emailVerificationToken, resetPasswordToken, resetPasswordExpires, ...userWithoutSensitive } = user.toJSON();

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        user: userWithoutSensitive,
        token
      };
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    try {
      // Find user by email
      const user = await this.repository.findByEmail(email, {
        include: ['profile']
      });

      if (!user || !user.isActive) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
      }

      // Update last login
      await this.repository.updateLastLogin(user.id);

      // Remove sensitive data
      const { password: userPassword, emailVerificationToken, resetPasswordToken, resetPasswordExpires, ...userWithoutSensitive } = user.toJSON();

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        user: userWithoutSensitive,
        token
      };
    } catch (error) {
      throw error;
    }
  }

  async getProfile(userId) {
    try {
      const user = await this.repository.findUserWithProfile(userId);
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const { password, emailVerificationToken, resetPasswordToken, resetPasswordExpires, ...userWithoutSensitive } = user.toJSON();

      return userWithoutSensitive;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(userId, profileData) {
    try {
      const user = await this.repository.update(userId, profileData);

      const { password, emailVerificationToken, resetPasswordToken, resetPasswordExpires, ...userWithoutSensitive } = user.toJSON();

      return userWithoutSensitive;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await this.repository.findById(userId);

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new AppError('Current password is incorrect', 400);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await this.repository.update(userId, { password: hashedPassword });

      return { message: 'Password updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(email) {
    try {
      const user = await this.repository.findByEmail(email);

      if (!user) {
        // Don't reveal if user exists or not
        return { message: 'If the email exists, a reset link will be sent' };
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

      await this.repository.update(user.id, {
        resetPasswordToken: crypto.createHash('sha256').update(resetToken).digest('hex'),
        resetPasswordExpires
      });

      // In a real application, you would send an email here
      // await this.emailService.sendPasswordResetEmail(user.email, resetToken);

      return { 
        message: 'If the email exists, a reset link will be sent',
        resetToken // In development only
      };
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(resetToken, newPassword) {
    try {
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      const user = await this.repository.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() }
      });

      if (!user) {
        throw new AppError('Invalid or expired reset token', 400);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password and clear reset token
      await this.repository.update(user.id, {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      });

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(token) {
    try {
      const user = await this.repository.findOne({
        emailVerificationToken: token
      });

      if (!user) {
        throw new AppError('Invalid verification token', 400);
      }

      await this.repository.update(user.id, {
        emailVerified: true,
        emailVerificationToken: null
      });

      return { message: 'Email verified successfully' };
    } catch (error) {
      throw error;
    }
  }

  async deactivateUser(userId) {
    try {
      await this.repository.deactivateUser(userId);
      return { message: 'User deactivated successfully' };
    } catch (error) {
      throw error;
    }
  }

  async activateUser(userId) {
    try {
      await this.repository.activateUser(userId);
      return { message: 'User activated successfully' };
    } catch (error) {
      throw error;
    }
  }

  generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
  }

  async searchUsers(searchTerm, options = {}) {
    try {
      return await this.repository.searchUsers(searchTerm, options);
    } catch (error) {
      throw error;
    }
  }

  async getUsersByRole(role, options = {}) {
    try {
      return await this.repository.findUsersByRole(role, options);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserService;