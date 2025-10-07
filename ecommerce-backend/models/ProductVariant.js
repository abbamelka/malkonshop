const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductVariant = sequelize.define('ProductVariant', {
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
    sku: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    comparePrice: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'compare_price'
    },
    costPerItem: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'cost_per_item'
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    weight: {
      type: DataTypes.DECIMAL(8, 2),
    },
    dimensions: {
      type: DataTypes.JSON,
    },
    options: {
      type: DataTypes.JSON,
    },
    image: {
      type: DataTypes.STRING(500),
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'product_variants',
    underscored: true,
    indexes: [
      { fields: ['product_id'] },
      { fields: ['sku'] },
    ],
  });

  ProductVariant.associate = function(models) {
    ProductVariant.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    ProductVariant.hasMany(models.CartItem, { foreignKey: 'variantId', as: 'cartItems' });
    ProductVariant.hasMany(models.OrderItem, { foreignKey: 'variantId', as: 'orderItems' });
    ProductVariant.hasMany(models.InventoryLog, { foreignKey: 'variantId', as: 'inventoryLogs' });
  };

  return ProductVariant;
};