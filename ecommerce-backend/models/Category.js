const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
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
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(120),
      unique: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    image: {
      type: DataTypes.STRING(500),
    },
    parentId: {
      type: DataTypes.INTEGER,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    metaTitle: {
      type: DataTypes.STRING(255),
    },
    metaDescription: {
      type: DataTypes.TEXT,
    },
    metaKeywords: {
      type: DataTypes.STRING(500),
    },
  }, {
    tableName: 'categories',
    underscored: true,
    indexes: [
      { fields: ['slug'] },
      { fields: ['parent_id'] },
      { fields: ['is_active'] }
    ]
  });

  Category.associate = function(models) {
    Category.belongsTo(models.Category, { foreignKey: 'parentId', as: 'parent' });
    Category.hasMany(models.Category, { foreignKey: 'parentId', as: 'children' });
    Category.hasMany(models.Product, { foreignKey: 'categoryId', as: 'products' });
  };

  return Category;
};