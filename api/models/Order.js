import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
    required: true,
  },
  pickupTime: {
    type: String,
    default: '',
  },
  specialInstructions: {
    type: String,
    default: '',
  },
  diningPreference: {
    type: String,
    required: true,
  },
  deliveryAddress: {
    type: String,
    default: '',
  },
  items: [{
    name: String,
    quantity: Number,
    price: Number,
    subtotal: Number
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['UPI QR Payment', 'Cash on Delivery'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['Order Confirmed', 'Paid', 'COD'],
    default: 'Order Confirmed',
  },
  orderStage: {
    type: String,
    enum: ['Order Confirmed', 'Preparing Food', 'Ready for Pickup', 'Completed'],
    default: 'Order Confirmed',
  },
  utrNumber: {
    type: String,
    default: '',
    index: true,
  },
  last4DigitsMobile: {
    type: String,
    default: '',
  },
  pickupToken: {
    type: String,
    default: null,
  },
  estimatedPrepTime: {
    type: String,
    default: '',
  },
  auditLogs: [{
    adminName: String,
    action: String,
    time: { type: Date, default: Date.now },
    reason: String
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model('Order', orderSchema);
