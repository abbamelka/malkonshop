const { sequelize, Sequelize } = require('../config/database');
const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);

const db = {};

// Load all models
const modelFiles = fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  });

// First pass: Load all models
modelFiles.forEach(file => {
  try {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
    console.log(`✅ Loaded model: ${model.name}`);
  } catch (error) {
    console.error(`❌ Failed to load model from ${file}:`, error.message);
  }
});

// Second pass: Set up associations after all models are loaded
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    try {
      db[modelName].associate(db);
      console.log(`✅ Set associations for: ${modelName}`);
    } catch (error) {
      console.error(`❌ Failed to set associations for ${modelName}:`, error.message);
    }
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Export specific models for easy access
db.User = db.User;
db.UserProfile = db.UserProfile;
db.Category = db.Category;
db.Product = db.Product;
db.ProductVariant = db.ProductVariant;
db.ProductAttribute = db.ProductAttribute;
db.ProductAttributeValue = db.ProductAttributeValue;
db.Cart = db.Cart;
db.CartItem = db.CartItem;
db.Order = db.Order;
db.OrderItem = db.OrderItem;
db.Payment = db.Payment;
db.Review = db.Review;
db.Wishlist = db.Wishlist;
db.Coupon = db.Coupon;
db.CouponUsage = db.CouponUsage;
db.InventoryLog = db.InventoryLog;

module.exports = db;