const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Coupon = sequelize.define('Coupon', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    type: {
      type: DataTypes.ENUM('percentage', 'fixed_amount'),
      defaultValue: 'percentage',
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    minimumAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'minimum_amount'
    },
    maximumDiscount: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'maximum_discount'
    },
    usageLimit: {
      type: DataTypes.INTEGER,
      field: 'usage_limit'
    },
    usedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'used_count'
    },
    perUserLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      field: 'per_user_limit'
    },
    validFrom: {
      type: DataTypes.DATE,
      field: 'valid_from'
    },
    validUntil: {
      type: DataTypes.DATE,
      field: 'valid_until'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    appliesTo: {
      type: DataTypes.ENUM('all', 'categories', 'products'),
      defaultValue: 'all',
      field: 'applies_to'
    },
    applicableCategories: {
      type: DataTypes.JSON,
      field: 'applicable_categories'
    },
    applicableProducts: {
      type: DataTypes.JSON,
      field: 'applicable_products'
    },
  }, {
    tableName: 'coupons',
    underscored: true,
    indexes: [
      { fields: ['code'] },
      { fields: ['is_active'] },
    ],
  });

  Coupon.associate = function(models) {
    Coupon.hasMany(models.CouponUsage, { foreignKey: 'couponId', as: 'usages' });
  };

  return Coupon;
};