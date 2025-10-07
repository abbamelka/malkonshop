const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'product_id'
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
    rating: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    title: {
      type: DataTypes.STRING(255),
    },
    comment: {
      type: DataTypes.TEXT,
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_approved'
    },
    helpfulCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'helpful_count'
    },
    notHelpfulCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'not_helpful_count'
    },
  }, {
    tableName: 'reviews',
    underscored: true,
    indexes: [
      { fields: ['product_id'] },
      { fields: ['rating'] },
      { fields: ['is_approved'] },
    ],
  });

  Review.associate = function(models) {
    Review.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    Review.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Review.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
  };

  return Review;
};