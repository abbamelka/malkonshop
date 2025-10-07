const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../models');
const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js') && file !== 'index.js');

console.log('🔄 Fixing model field mappings...');

modelFiles.forEach(file => {
  const filePath = path.join(modelsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add field mappings for common camelCase to snake_case conversions
  const fieldMappings = [
    { camel: 'userId', snake: 'user_id' },
    { camel: 'orderId', snake: 'order_id' },
    { camel: 'productId', snake: 'product_id' },
    { camel: 'categoryId', snake: 'category_id' },
    { camel: 'variantId', snake: 'variant_id' },
    { camel: 'cartId', snake: 'cart_id' },
    { camel: 'addressId', snake: 'address_id' },
    { camel: 'paymentId', snake: 'payment_id' },
    { camel: 'reviewId', snake: 'review_id' },
    { camel: 'couponId', snake: 'coupon_id' },
    { camel: 'parentId', snake: 'parent_id' },
    { camel: 'orderNumber', snake: 'order_number' },
    { camel: 'paymentStatus', snake: 'payment_status' },
    { camel: 'paymentMethod', snake: 'payment_method' },
    { camel: 'discountAmount', snake: 'discount_amount' },
    { camel: 'taxAmount', snake: 'tax_amount' },
    { camel: 'shippingAmount', snake: 'shipping_amount' },
    { camel: 'totalAmount', snake: 'total_amount' },
    { camel: 'billingAddressId', snake: 'billing_address_id' },
    { camel: 'shippingAddressId', snake: 'shipping_address_id' },
    { camel: 'shippingMethod', snake: 'shipping_method' },
    { camel: 'trackingNumber', snake: 'tracking_number' },
    { camel: 'cancelledReason', snake: 'cancelled_reason' },
    { camel: 'refundedReason', snake: 'refunded_reason' },
    { camel: 'paidAt', snake: 'paid_at' },
    { camel: 'deliveredAt', snake: 'delivered_at' },
    { camel: 'cancelledAt', snake: 'cancelled_at' },
    { camel: 'refundedAt', snake: 'refunded_at' },
    { camel: 'sessionId', snake: 'session_id' },
    { camel: 'couponCode', snake: 'coupon_code' },
    { camel: 'productName', snake: 'product_name' },
    { camel: 'productSku', snake: 'product_sku' },
    { camel: 'variantOptions', snake: 'variant_options' },
    { camel: 'unitPrice', snake: 'unit_price' },
    { camel: 'totalPrice', snake: 'total_price' },
    { camel: 'shortDescription', snake: 'short_description' },
    { camel: 'comparePrice', snake: 'compare_price' },
    { camel: 'costPerItem', snake: 'cost_per_item' },
    { camel: 'trackQuantity', snake: 'track_quantity' },
    { camel: 'lowStockAlert', snake: 'low_stock_alert' },
    { camel: 'allowOutOfStockPurchases', snake: 'allow_out_of_stock_purchases' },
    { camel: 'isActive', snake: 'is_active' },
    { camel: 'isPublished', snake: 'is_published' },
    { camel: 'publishedAt', snake: 'published_at' },
    { camel: 'seoTitle', snake: 'seo_title' },
    { camel: 'seoDescription', snake: 'seo_description' },
    { camel: 'isApproved', snake: 'is_approved' },
    { camel: 'helpfulCount', snake: 'helpful_count' },
    { camel: 'notHelpfulCount', snake: 'not_helpful_count' },
    { camel: 'emailVerified', snake: 'email_verified' },
    { camel: 'emailVerificationToken', snake: 'email_verification_token' },
    { camel: 'resetPasswordToken', snake: 'reset_password_token' },
    { camel: 'resetPasswordExpires', snake: 'reset_password_expires' },
    { camel: 'lastLogin', snake: 'last_login' },
    { camel: 'dateOfBirth', snake: 'date_of_birth' },
    { camel: 'socialLinks', snake: 'social_links' },
    { camel: 'sortOrder', snake: 'sort_order' },
    { camel: 'metaTitle', snake: 'meta_title' },
    { camel: 'metaDescription', snake: 'meta_description' },
    { camel: 'metaKeywords', snake: 'meta_keywords' },
    { camel: 'gatewayTransactionId', snake: 'gateway_transaction_id' },
    { camel: 'gatewayResponse', snake: 'gateway_response' },
    { camel: 'refundAmount', snake: 'refund_amount' },
    { camel: 'refundReason', snake: 'refund_reason' },
    { camel: 'previousStock', snake: 'previous_stock' },
    { camel: 'newStock', snake: 'new_stock' },
    { camel: 'referenceId', snake: 'reference_id' },
    { camel: 'referenceType', snake: 'reference_type' },
    { camel: 'createdBy', snake: 'created_by' },
    { camel: 'usageLimit', snake: 'usage_limit' },
    { camel: 'usedCount', snake: 'used_count' },
    { camel: 'perUserLimit', snake: 'per_user_limit' },
    { camel: 'validFrom', snake: 'valid_from' },
    { camel: 'validUntil', snake: 'valid_until' },
    { camel: 'appliesTo', snake: 'applies_to' },
    { camel: 'applicableCategories', snake: 'applicable_categories' },
    { camel: 'applicableProducts', snake: 'applicable_products' },
  ];

  fieldMappings.forEach(mapping => {
    const regex = new RegExp(`${mapping.camel}:\\s*{[^}]*}`, 'g');
    const matches = content.match(regex);
    
    if (matches) {
      matches.forEach(match => {
        const updated = match.replace('}', `,\n      field: '${mapping.snake}'\n    }`);
        content = content.replace(match, updated);
      });
    }
  });

  // Fix index fields to use snake_case
  fieldMappings.forEach(mapping => {
    const indexRegex = new RegExp(`fields:\\s*\\['${mapping.camel}'\\]`, 'g');
    content = content.replace(indexRegex, `fields: ['${mapping.snake}']`);
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed ${file}`);
});

console.log('🎉 All models updated with proper field mappings!');