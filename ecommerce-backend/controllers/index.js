// controllers/index.js
module.exports = {
  AuthController: require('./authController'),
  UserController: require('./userController'),
  ProductController: require('./productController'),
  CategoryController: require('./categoryController'),
  OrderController: require('./orderController'),
  CartController: require('./cartController'),
  PaymentController: require('./paymentController'),
  ReviewController: require('./reviewController'), // <-- this is the instance exported above
};
