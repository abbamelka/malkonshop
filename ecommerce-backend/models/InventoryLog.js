const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InventoryLog = sequelize.define('InventoryLog', {
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
    variantId: {
      type: DataTypes.INTEGER,
      field: 'variant_id'
    },
    type: {
      type: DataTypes.ENUM('in', 'out', 'adjustment'),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    previousStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'previous_stock'
    },
    newStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'new_stock'
    },
    reason: {
      type: DataTypes.STRING(255),
    },
    referenceId: {
      type: DataTypes.INTEGER,
      field: 'reference_id'
    },
    referenceType: {
      type: DataTypes.STRING(50),
      field: 'reference_type'
    },
    notes: {
      type: DataTypes.TEXT,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      field: 'created_by'
    },
  }, {
    tableName: 'inventory_logs',
    underscored: true,
    indexes: [
      { fields: ['product_id'] },
      { fields: ['created_at'] }, // Fixed: use snake_case
    ],
  });

  InventoryLog.associate = function(models) {
    InventoryLog.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    InventoryLog.belongsTo(models.ProductVariant, { foreignKey: 'variantId', as: 'variant' });
    InventoryLog.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
  };

  return InventoryLog;
};