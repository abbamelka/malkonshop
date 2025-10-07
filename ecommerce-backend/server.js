require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const logger = require('./utils/logger');

// Import seeders for initial data
const { seedDatabase } = require('./scripts/seed');

class Server {
  constructor() {
    this.port = process.env.PORT || 5000;
    this.app = app;
    this.init();
  }

  async init() {
    try {
      // Initialize database connection
      await this.initializeDatabase();
      
      // Start the server
      this.startServer();
      
      // Setup graceful shutdown
      this.setupGracefulShutdown();
      
    } catch (error) {
      logger.error('Failed to initialize server:', error);
      process.exit(1);
    }
  }

  async initializeDatabase() {
    try {
      // Test database connection
      await sequelize.authenticate();
      logger.info('✅ Database connection established successfully.');

      // Sync database (use with caution in production)
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ force: false });
        logger.info('✅ Database synchronized successfully.');
        
        // Seed initial data in development
        await seedDatabase();
      } else {
        // In production, just authenticate without syncing
        logger.info('✅ Production database connected.');
      }

    } catch (error) {
      logger.error('❌ Unable to connect to the database:', error);
      throw error;
    }
  }

  startServer() {
    const server = this.app.listen(this.port, () => {
      logger.info(`
🚀 ===============================================
   E-Commerce Server Started Successfully!
   ===============================================
   🌐 Environment: ${process.env.NODE_ENV}
   📍 Port: ${this.port}
   🗄️  Database: ${process.env.DB_NAME}
   📚 API Docs: http://localhost:${this.port}/api-docs
   🔗 API Base: http://localhost:${this.port}/api
   👤 Admin: ${process.env.DEFAULT_ADMIN_EMAIL}
   ===============================================
      `);
    });

    this.server = server;
    return server;
  }

  setupGracefulShutdown() {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
      logger.error('Error Name:', error.name);
      logger.error('Error Message:', error.message);
      logger.error('Error Stack:', error.stack);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('💥 UNHANDLED REJECTION! Shutting down...');
      logger.error('Promise:', promise);
      logger.error('Reason:', reason);
      
      // Close server & exit process
      this.server.close(() => {
        process.exit(1);
      });
    });

    // Handle SIGTERM signal
    process.on('SIGTERM', () => {
      logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully...');
      this.server.close(() => {
        logger.info('💥 Process terminated!');
        process.exit(0);
      });
    });

    // Handle SIGINT signal (Ctrl+C)
    process.on('SIGINT', () => {
      logger.info('👋 SIGINT RECEIVED. Shutting down gracefully...');
      this.server.close(() => {
        logger.info('💥 Process terminated!');
        process.exit(0);
      });
    });

    // Handle process exit
    process.on('exit', (code) => {
      if (code === 0) {
        logger.info('✅ Server shutdown completed successfully.');
      } else {
        logger.error(`❌ Server shutdown with error code: ${code}`);
      }
    });
  }
}

// Create server instance
const server = new Server();

module.exports = server;