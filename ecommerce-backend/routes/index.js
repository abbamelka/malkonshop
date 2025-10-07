// routes/index.js
const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const orderRoutes = require('./orderRoutes');
const cartRoutes = require('./cartRoutes');
const paymentRoutes = require('./paymentRoutes');
const reviewRoutes = require('./reviewRoutes');

// Debug: Log the type and value of each route module
console.log('authRoutes:', typeof authRoutes, authRoutes);
console.log('userRoutes:', typeof userRoutes, userRoutes);
console.log('productRoutes:', typeof productRoutes, productRoutes);
console.log('categoryRoutes:', typeof categoryRoutes, categoryRoutes);
console.log('orderRoutes:', typeof orderRoutes, orderRoutes);
console.log('cartRoutes:', typeof cartRoutes, cartRoutes);
console.log('paymentRoutes:', typeof paymentRoutes, paymentRoutes);
console.log('reviewRoutes:', typeof reviewRoutes, reviewRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running smoothly',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);
router.use('/payment', paymentRoutes);
router.use('/reviews', reviewRoutes);

module.exports = router;