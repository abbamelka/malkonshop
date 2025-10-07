const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Address = sequelize.define('Address', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
    },
    type: {
      type: DataTypes.ENUM('billing', 'shipping'),
      defaultValue: 'shipping',
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'last_name'
    },
    company: {
      type: DataTypes.STRING(255),
    },
    addressLine1: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'address_line_1'
    },
    addressLine2: {
      type: DataTypes.STRING(255),
      field: 'address_line_2'
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'postal_code'
    },
    phone: {
      type: DataTypes.STRING(20),
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_default'
    },
  }, {
    tableName: 'addresses',
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['type'] }
    ]
  });

  Address.associate = function(models) {
    Address.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Address;
};