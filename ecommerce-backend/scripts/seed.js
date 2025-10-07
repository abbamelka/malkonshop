const { sequelize } = require('../models');
const { User, Category, Product } = require('../models');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

const seedDatabase = async () => {
  try {
    logger.info('🌱 Starting database seeding...');

    // Create default admin user
    const adminExists = await User.findOne({ where: { email: process.env.DEFAULT_ADMIN_EMAIL } });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD, 12);
      
      await User.create({
        name: 'Administrator',
        email: process.env.DEFAULT_ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        emailVerified: true
      });
      
      logger.info('✅ Default admin user created');
    }

    // Create default categories
    const categories = await Category.bulkCreate([
      {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Latest electronic devices and gadgets',
        isActive: true
      },
      {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Fashionable clothing for everyone',
        isActive: true
      },
      {
        name: 'Home & Kitchen',
        slug: 'home-kitchen',
        description: 'Everything for your home and kitchen',
        isActive: true
      },
      {
        name: 'Books',
        slug: 'books',
        description: 'Books for all ages and interests',
        isActive: true
      },
      {
        name: 'Sports',
        slug: 'sports',
        description: 'Sports equipment and accessories',
        isActive: true
      }
    ], { ignoreDuplicates: true });

    logger.info('✅ Default categories created');

    // Create sample products
    const sampleProducts = [
      {
        name: 'Smartphone X',
        slug: 'smartphone-x',
        description: 'Latest smartphone with amazing features',
        shortDescription: 'High-end smartphone',
        price: 699.99,
        comparePrice: 799.99,
        categoryId: 1,
        sku: 'SPX-001',
        quantity: 50,
        isActive: true,
        isPublished: true,
        images: JSON.stringify(['https://via.placeholder.com/400x400?text=Smartphone+X'])
      },
      {
        name: 'Laptop Pro',
        slug: 'laptop-pro',
        description: 'Professional laptop for work and gaming',
        shortDescription: 'High-performance laptop',
        price: 1299.99,
        comparePrice: 1499.99,
        categoryId: 1,
        sku: 'LP-001',
        quantity: 25,
        isActive: true,
        isPublished: true,
        images: JSON.stringify(['https://via.placeholder.com/400x400?text=Laptop+Pro'])
      },
      {
        name: 'Wireless Headphones',
        slug: 'wireless-headphones',
        description: 'Noise-cancelling wireless headphones',
        shortDescription: 'Premium audio experience',
        price: 199.99,
        comparePrice: 249.99,
        categoryId: 1,
        sku: 'WH-001',
        quantity: 100,
        isActive: true,
        isPublished: true,
        images: JSON.stringify(['https://via.placeholder.com/400x400?text=Wireless+Headphones'])
      }
    ];

    await Product.bulkCreate(sampleProducts, { ignoreDuplicates: true });
    logger.info('✅ Sample products created');

    logger.info('🎉 Database seeding completed successfully!');

  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    throw error;
  }
};

module.exports = { seedDatabase };