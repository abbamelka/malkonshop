const { sequelize } = require('../models');
const { seedDatabase } = require('./seed');
const logger = require('../utils/logger');

const resetDatabase = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      logger.error('🚫 Cannot reset database in production environment');
      process.exit(1);
    }

    logger.info('🔄 Resetting database...');
    
    // Drop all tables and recreate
    await sequelize.sync({ force: true });
    logger.info('✅ Database reset completed');

    // Seed with initial data
    await seedDatabase();
    
    logger.info('🎉 Database reset and seeding completed!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Database reset failed:', error);
    process.exit(1);
  }
};

resetDatabase();