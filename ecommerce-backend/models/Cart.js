const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Cart = sequelize.define('Cart', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      field: 'user_id'
    },
    sessionId: {
      type: DataTypes.STRING(100),
      field: 'session_id'
    },
    couponCode: {
      type: DataTypes.STRING(50),
      field: 'coupon_code'
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'discount_amount'
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'tax_amount'
    },
    shippingAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'shipping_amount'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'total_amount'
    },
  }, {
    tableName: 'carts',
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['session_id'] },
    ],
  });

  Cart.associate = function(models) {
    Cart.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Cart.hasMany(models.CartItem, { foreignKey: 'cartId', as: 'items' });
  };

  return Cart;
};