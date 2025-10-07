const BaseService = require('./baseService');
const { PaymentRepository, OrderRepository } = require('../repositories');
const { AppError } = require('../utils/errors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService extends BaseService {
  constructor() {
    super(new PaymentRepository());
    this.orderRepository = new OrderRepository();
  }

  async createPaymentIntent(orderId) {
    try {
      // Get order details
      const order = await this.orderRepository.findById(orderId);
      
      if (!order) {
        throw new AppError('Order not found', 404);
      }

      if (order.paymentStatus === 'paid') {
        throw new AppError('Order is already paid', 400);
      }

      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.totalAmount * 100), // Convert to cents
        currency: order.currency || 'usd',
        metadata: {
          orderId: order.id.toString(),
          orderNumber: order.orderNumber
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Create payment record in database
      const payment = await this.repository.createPaymentRecord(orderId, {
        paymentMethod: 'stripe',
        paymentGateway: 'stripe',
        gatewayTransactionId: paymentIntent.id,
        amount: order.totalAmount,
        currency: order.currency || 'usd'
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        payment
      };
    } catch (error) {
      throw error;
    }
  }

  async confirmPayment(paymentIntentId) {
    try {
      // Retrieve payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        throw new AppError(`Payment not successful. Status: ${paymentIntent.status}`, 400);
      }

      // Find payment record
      const payment = await this.repository.findPaymentByGatewayTransaction(paymentIntentId);
      
      if (!payment) {
        throw new AppError('Payment record not found', 404);
      }

      // Update payment status
      const updatedPayment = await this.repository.updatePaymentStatus(
        payment.id, 
        'completed',
        { 
          gatewayResponse: paymentIntent 
        }
      );

      // Update order payment status
      await this.orderRepository.updatePaymentStatus(payment.orderId, 'paid');

      return updatedPayment;
    } catch (error) {
      throw error;
    }
  }

  async handleStripeWebhook(payload, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object);
          break;
        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      throw new AppError(`Webhook Error: ${error.message}`, 400);
    }
  }

  async handlePaymentIntentSucceeded(paymentIntent) {
    const payment = await this.repository.findPaymentByGatewayTransaction(paymentIntent.id);
    
    if (payment) {
      await this.repository.updatePaymentStatus(payment.id, 'completed', {
        gatewayResponse: paymentIntent
      });

      await this.orderRepository.updatePaymentStatus(payment.orderId, 'paid');
    }
  }

  async handlePaymentIntentFailed(paymentIntent) {
    const payment = await this.repository.findPaymentByGatewayTransaction(paymentIntent.id);
    
    if (payment) {
      await this.repository.updatePaymentStatus(payment.id, 'failed', {
        gatewayResponse: paymentIntent
      });
    }
  }

  async handleChargeRefunded(charge) {
    const paymentIntentId = charge.payment_intent;
    const payment = await this.repository.findPaymentByGatewayTransaction(paymentIntentId);
    
    if (payment) {
      const refundAmount = charge.amount_refunded / 100; // Convert from cents
      
      await this.repository.processRefund(
        payment.id,
        refundAmount,
        'Refund processed via Stripe'
      );

      if (refundAmount === payment.amount) {
        await this.orderRepository.updatePaymentStatus(payment.orderId, 'refunded');
      }
    }
  }

  async getPaymentMethods(userId) {
    try {
      // In a real application, you would retrieve saved payment methods from Stripe
      // For now, we'll return a mock response
      const payments = await this.repository.findPaymentsByUser(userId, {
        where: { status: 'completed' }
      });

      const paymentMethods = payments.data.map(payment => ({
        id: payment.id,
        type: payment.paymentMethod,
        last4: '4242', // Mock data
        brand: 'visa', // Mock data
        expMonth: 12,
        expYear: 2025,
        isDefault: false
      }));

      return paymentMethods;
    } catch (error) {
      throw error;
    }
  }

  async addPaymentMethod(userId, paymentMethodData) {
    try {
      // In a real application, you would create a payment method in Stripe
      // For now, we'll just return a mock response
      return {
        id: `pm_${Date.now()}`,
        ...paymentMethodData,
        userId,
        isDefault: false
      };
    } catch (error) {
      throw error;
    }
  }

  async removePaymentMethod(userId, paymentMethodId) {
    try {
      // In a real application, you would detach the payment method from Stripe
      return { message: 'Payment method removed successfully' };
    } catch (error) {
      throw error;
    }
  }

  async processRefund(orderId, amount, reason) {
    try {
      const order = await this.orderRepository.findById(orderId);
      
      if (!order) {
        throw new AppError('Order not found', 404);
      }

      const payment = await this.repository.findOne({
        orderId,
        status: 'completed'
      });

      if (!payment) {
        throw new AppError('No completed payment found for this order', 400);
      }

      // Process refund with Stripe
      const refund = await stripe.refunds.create({
        payment_intent: payment.gatewayTransactionId,
        amount: Math.round(amount * 100), // Convert to cents
        metadata: {
          reason: reason,
          orderId: orderId.toString()
        }
      });

      // Update payment record
      const updatedPayment = await this.repository.processRefund(
        payment.id,
        amount,
        reason
      );

      // Update order status if fully refunded
      if (amount === payment.amount) {
        await this.orderRepository.updatePaymentStatus(orderId, 'refunded');
        await this.orderRepository.updateOrderStatus(orderId, 'refunded');
      }

      return {
        refund,
        payment: updatedPayment
      };
    } catch (error) {
      throw error;
    }
  }

  async getPaymentHistory(userId, options = {}) {
    try {
      return await this.repository.findPaymentsByUser(userId, options);
    } catch (error) {
      throw error;
    }
  }

  async getPaymentStats(timeframe = 'month') {
    try {
      return await this.repository.getPaymentStats(timeframe);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PaymentService;