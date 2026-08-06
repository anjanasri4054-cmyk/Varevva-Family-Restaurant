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
    enum: ['Pending', 'Waiting for Verification', 'Paid', 'Rejected', 'COD Pending'],
    default: 'Pending',
  },
  verificationStatus: {
    type: String,
    enum: ['Waiting', 'Verified', 'Failed'],
    default: 'Waiting',
  },
  orderStage: {
    type: String,
    enum: ['Order Placed', 'Waiting for Payment Verification', 'Payment Verified', 'Preparing Food', 'Ready for Pickup', 'Completed'],
    default: 'Order Placed',
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
  rejectionReason: {
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
    reason: String
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model('Order', orderSchema);
