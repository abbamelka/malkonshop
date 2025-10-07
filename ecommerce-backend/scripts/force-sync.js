const { sequelize } = require('../models');
const logger = require('../utils/logger');

const forceSyncDatabase = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      logger.error('🚫 Cannot force sync in production environment');
      process.exit(1);
    }

    logger.info('🔄 Starting forced database synchronization...');
    
    // Test connection
    await sequelize.authenticate();
    logger.info('✅ Database connection established');

    // Force sync (drops all tables and recreates them)
    await sequelize.sync({ force: true });
    logger.info('✅ Database force synchronized successfully');

    // Seed initial data
    logger.info('🌱 Seeding initial data...');
    const { seedDatabase } = require('./seed');
    await seedDatabase();
    logger.info('✅ Initial data seeded');

    logger.info('🎉 Force sync completed!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Force sync failed:', error);
    process.exit(1);
  }
};

forceSyncDatabase();