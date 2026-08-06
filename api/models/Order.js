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
    enum: ['Waiting for Verification', 'Order Confirmed', 'Paid', 'Rejected', 'COD'],
    default: 'Waiting for Verification',
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending',
  },
  orderStage: {
    type: String,
    enum: ['Order Confirmed', 'Waiting for Verification', 'Preparing Food', 'Ready for Pickup', 'Completed'],
    default: 'Waiting for Verification',
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
  verifiedBy: {
    type: String,
    default: '',
  },
  verificationTime: {
    type: Date,
  },
  auditLogs: [{
    adminName: String,
    action: String,
    time: { type: Date, default: Date.now },
    reason: String,
    ipAddress: String
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model('Order', orderSchema);
