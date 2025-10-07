const { validationResult } = require('express-validator');
const { AppError } = require('../utils/errors');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));
    
    throw new AppError('Validation failed', 400, errorMessages);
  }
  
  next();
};

// Common validation rules
const commonRules = {
  email: {
    isEmail: true,
    normalizeEmail: true,
    errorMessage: 'Please provide a valid email address'
  },
  password: {
    isLength: {
      options: { min: 6 },
      errorMessage: 'Password must be at least 6 characters long'
    }
  },
  phone: {
    isMobilePhone: true,
    errorMessage: 'Please provide a valid phone number'
  },
  price: {
    isDecimal: true,
    errorMessage: 'Price must be a valid decimal number'
  },
  quantity: {
    isInt: { min: 0 },
    errorMessage: 'Quantity must be a positive integer'
  }
};

module.exports = {
  validateRequest,
  commonRules
};