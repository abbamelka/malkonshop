const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductAttribute = sequelize.define('ProductAttribute', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(120),
      unique: true,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('text', 'number', 'select', 'multiselect', 'boolean'),
      defaultValue: 'text',
    },
    values: {
      type: DataTypes.JSON,
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_required'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'sort_order'
    },
  }, {
    tableName: 'product_attributes',
    underscored: true,
  });

  ProductAttribute.associate = function(models) {
    ProductAttribute.hasMany(models.ProductAttributeValue, {
      foreignKey: 'attributeId',
      as: 'attributeValues'
    });
  };

  return ProductAttribute;
};