const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserProfile = sequelize.define('UserProfile', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
    },
    bio: {
      type: DataTypes.TEXT,
    },
    company: {
      type: DataTypes.STRING(255),
    },
    website: {
      type: DataTypes.STRING(500),
    },
    socialLinks: {
      type: DataTypes.JSON,
    },
    preferences: {
      type: DataTypes.JSON,
    },
  }, {
    tableName: 'user_profiles',
    underscored: true,
  });

  UserProfile.associate = function(models) {
    UserProfile.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return UserProfile;
};