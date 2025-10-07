const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CouponUsage = sequelize.define('CouponUsage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    couponId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'coupon_id'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'order_id'
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'discount_amount'
    },
    usedAt: {
      type: DataTypes.DATE,
      field: 'used_at',
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'coupon_usage',
    underscored: true,
    indexes: [
      { fields: ['coupon_id'] },
      { fields: ['user_id'] },
    ],
  });

  CouponUsage.associate = function(models) {
    CouponUsage.belongsTo(models.Coupon, { foreignKey: 'couponId', as: 'coupon' });
    CouponUsage.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    CouponUsage.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
  };

  return CouponUsage;
};