const UserService = require('./userService');
const ProductService = require('./productService');
const OrderService = require('./orderService');
const CartService = require('./cartService');
const AuthService = require('./authService');
const PaymentService = require('./paymentService');
const ReviewService = require('./reviewService');
// Add these if you create them later
// const EmailService = require('./emailService');
// const FileService = require('./fileService');

module.exports = {
  UserService,
  ProductService,
  OrderService,
  CartService,
  AuthService,
  PaymentService,
  ReviewService,
  // EmailService,
  // FileService
};