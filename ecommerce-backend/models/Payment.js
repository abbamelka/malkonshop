const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'order_id'
    },
    paymentMethod: {
      type: DataTypes.ENUM('credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery'),
      allowNull: false,
      field: 'payment_method'
    },
    paymentGateway: {
      type: DataTypes.STRING(50),
      field: 'payment_gateway'
    },
    gatewayTransactionId: {
      type: DataTypes.STRING(255),
      field: 'gateway_transaction_id'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD',
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending',
    },
    gatewayResponse: {
      type: DataTypes.JSON,
      field: 'gateway_response'
    },
    refundAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'refund_amount'
    },
    refundReason: {
      type: DataTypes.TEXT,
      field: 'refund_reason'
    },
    paidAt: {
      type: DataTypes.DATE,
      field: 'paid_at'
    },
    refundedAt: {
      type: DataTypes.DATE,
      field: 'refunded_at'
    },
  }, {
    tableName: 'payments',
    underscored: true,
    indexes: [
      { fields: ['order_id'] },
      { fields: ['status'] },
      { fields: ['gateway_transaction_id'] },
    ],
  });

  Payment.associate = function(models) {
    Payment.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
  };

  return Payment;
};