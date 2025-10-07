const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errors');
const UserService = require('./userService');

class AuthService {
  constructor() {
    this.userService = new UserService();
  }

  async register(userData) {
    try {
      return await this.userService.register(userData);
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    try {
      return await this.userService.login(email, password);
    } catch (error) {
      throw error;
    }
  }

  async verifyToken(token) {
    try {
      if (!token) {
        throw new AppError('No token provided', 401);
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verify user still exists and is active
      const user = await this.userService.getById(decoded.id);
      
      if (!user || !user.isActive) {
        throw new AppError('User no longer exists or is inactive', 401);
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        },
        decoded
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new AppError('Invalid token', 401);
      }
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Token expired', 401);
      }
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    try {
      // In a real application, you would have a separate refresh token system
      // For now, we'll use the same JWT secret
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      
      const user = await this.userService.getById(decoded.id);
      
      if (!user || !user.isActive) {
        throw new AppError('User no longer exists or is inactive', 401);
      }

      const newToken = this.userService.generateToken(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        },
        token: newToken
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new AppError('Invalid refresh token', 401);
      }
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Refresh token expired', 401);
      }
      throw error;
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      return await this.userService.changePassword(userId, currentPassword, newPassword);
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(email) {
    try {
      return await this.userService.forgotPassword(email);
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(resetToken, newPassword) {
    try {
      return await this.userService.resetPassword(resetToken, newPassword);
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(token) {
    try {
      return await this.userService.verifyEmail(token);
    } catch (error) {
      throw error;
    }
  }

  authorize(requiredRole, userRole) {
    const rolesHierarchy = {
      user: 1,
      vendor: 2,
      admin: 3
    };

    if (!rolesHierarchy[userRole] || rolesHierarchy[userRole] < rolesHierarchy[requiredRole]) {
      throw new AppError('Insufficient permissions', 403);
    }

    return true;
  }

  async validateApiKey(apiKey) {
    // This would validate API keys for external services
    // For now, we'll use a simple environment variable check
    if (apiKey !== process.env.API_KEY) {
      throw new AppError('Invalid API key', 401);
    }

    return true;
  }
}

module.exports = AuthService;