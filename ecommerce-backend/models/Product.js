const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(300),
      unique: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    shortDescription: {
      type: DataTypes.TEXT,
    },
    sku: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    barcode: {
      type: DataTypes.STRING(100),
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    comparePrice: {
      type: DataTypes.DECIMAL(10, 2),
    },
    costPerItem: {
      type: DataTypes.DECIMAL(10, 2),
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING(100),
    },
    supplierId: {
      type: DataTypes.INTEGER,
    },
    trackQuantity: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lowStockAlert: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },
    allowOutOfStockPurchases: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    weight: {
      type: DataTypes.DECIMAL(8, 2),
    },
    dimensions: {
      type: DataTypes.JSON,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    publishedAt: {
      type: DataTypes.DATE,
    },
    tags: {
      type: DataTypes.JSON,
    },
    images: {
      type: DataTypes.JSON,
    },
    seoTitle: {
      type: DataTypes.STRING(255),
    },
    seoDescription: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'products',
    underscored: true,
    indexes: [
      { fields: ['slug'] },
      { fields: ['category_id'] },
      { fields: ['price'] },
      { fields: ['is_active'] },
      { fields: ['is_published'] },
      { fields: ['sku'] }
    ]
  });

  Product.associate = function(models) {
    Product.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
    Product.hasMany(models.ProductVariant, { foreignKey: 'productId', as: 'variants' });
    Product.hasMany(models.Review, { foreignKey: 'productId', as: 'reviews' });
    Product.hasMany(models.Wishlist, { foreignKey: 'productId', as: 'wishlists' });
    Product.hasMany(models.CartItem, { foreignKey: 'productId', as: 'cartItems' });
    Product.hasMany(models.OrderItem, { foreignKey: 'productId', as: 'orderItems' });
  };

  return Product;
};