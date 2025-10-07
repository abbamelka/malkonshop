const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductAttributeValue = sequelize.define('ProductAttributeValue', {
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
    attributeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    tableName: 'product_attribute_values',
    underscored: true,
    indexes: [
      { fields: ['product_id'] },
      { fields: ['attribute_id'] },
    ],
  });

  ProductAttributeValue.associate = function(models) {
    ProductAttributeValue.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    ProductAttributeValue.belongsTo(models.ProductAttribute, { foreignKey: 'attributeId', as: 'attribute' });
  };

  return ProductAttributeValue;
};