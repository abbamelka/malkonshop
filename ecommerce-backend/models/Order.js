const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      field: 'order_number'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
      defaultValue: 'pending',
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending',
      field: 'payment_status'
    },
    paymentMethod: {
      type: DataTypes.ENUM('credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery'),
      allowNull: false,
      field: 'payment_method'
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
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
      allowNull: false,
      field: 'total_amount'
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD',
    },
    billingAddressId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'billing_address_id'
    },
    shippingAddressId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'shipping_address_id'
    },
    shippingMethod: {
      type: DataTypes.STRING(100),
      field: 'shipping_method'
    },
    trackingNumber: {
      type: DataTypes.STRING(100),
      field: 'tracking_number'
    },
    notes: {
      type: DataTypes.TEXT,
    },
    cancelledReason: {
      type: DataTypes.TEXT,
      field: 'cancelled_reason'
    },
    refundedReason: {
      type: DataTypes.TEXT,
      field: 'refunded_reason'
    },
    paidAt: {
      type: DataTypes.DATE,
      field: 'paid_at'
    },
    deliveredAt: {
      type: DataTypes.DATE,
      field: 'delivered_at'
    },
    cancelledAt: {
      type: DataTypes.DATE,
      field: 'cancelled_at'
    },
    refundedAt: {
      type: DataTypes.DATE,
      field: 'refunded_at'
    },
  }, {
    tableName: 'orders',
    underscored: true,
    indexes: [
      { fields: ['order_number'] },
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['payment_status'] },
      { fields: ['created_at'] },
    ],
  });

  Order.associate = function(models) {
    Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Order.belongsTo(models.Address, { foreignKey: 'billingAddressId', as: 'billingAddress' });
    Order.belongsTo(models.Address, { foreignKey: 'shippingAddressId', as: 'shippingAddress' });
    Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'items' });
    Order.hasMany(models.Payment, { foreignKey: 'orderId', as: 'payments' });
    Order.hasMany(models.Review, { foreignKey: 'orderId', as: 'reviews' });
  };

  return Order;
};