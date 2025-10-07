const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
    },
    avatar: {
      type: DataTypes.STRING(500),
    },
    role: {
      type: DataTypes.ENUM('admin', 'user', 'vendor'),
      defaultValue: 'user',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    emailVerificationToken: {
      type: DataTypes.STRING(100),
    },
    resetPasswordToken: {
      type: DataTypes.STRING(100),
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
    },
    lastLogin: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'users',
    underscored: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['role'] },
      { fields: ['created_at'] }
    ]
  });

  User.associate = function(models) {
    User.hasOne(models.UserProfile, { foreignKey: 'userId', as: 'profile' });
    User.hasMany(models.Address, { foreignKey: 'userId', as: 'addresses' });
    User.hasMany(models.Order, { foreignKey: 'userId', as: 'orders' });
    User.hasMany(models.Review, { foreignKey: 'userId', as: 'reviews' });
    User.hasMany(models.Wishlist, { foreignKey: 'userId', as: 'wishlists' });
    User.hasMany(models.Cart, { foreignKey: 'userId', as: 'carts' });
  };

  return User;
};