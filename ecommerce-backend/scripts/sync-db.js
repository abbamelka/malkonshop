const { sequelize } = require('../models');
const logger = require('../utils/logger');

const syncDatabase = async () => {
  try {
    logger.info('🔄 Starting database synchronization...');
    
    // Test connection
    await sequelize.authenticate();
    logger.info('✅ Database connection established');

    // Sync all models
    if (process.env.NODE_ENV === 'production') {
      // In production, use migrations instead of sync
      logger.info('📦 Production environment - using migrations');
      await sequelize.sync({ alter: false });
    } else {
      // In development, use sync with alter
      logger.info('🔧 Development environment - syncing database');
      await sequelize.sync({ alter: true });
      logger.info('✅ Database synchronized successfully');
    }

    logger.info('🎉 Database setup completed!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Database synchronization failed:', error);
    process.exit(1);
  }
};

syncDatabase();