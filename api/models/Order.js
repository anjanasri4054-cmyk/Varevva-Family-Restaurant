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
    enum: ['Pending', 'Proof Submitted', 'Order Confirmed', 'Paid', 'COD'],
    default: 'Pending',
  },
  orderStage: {
    type: String,
    enum: ['Order Placed', 'Payment Proof Submitted', 'Order Confirmed', 'Preparing Food', 'Ready for Pickup', 'Completed'],
    default: 'Order Placed',
  },
  orderStatus: {
    type: String,
    enum: ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'],
    default: 'PLACED',
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null,
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
  paymentScreenshot: {
    type: String,
    default: '',
  },
  detectedAmount: {
    type: Number,
    default: 0,
  },
  detectedTxnId: {
    type: String,
    default: '',
  },
  analysisResult: {
    type: String,
    default: '',
  },
  riskLevel: {
    type: String,
    default: '',
  },
  submissionTime: {
    type: Date,
    default: null,
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
    reason: String,
    ipAddress: String
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model('Order', orderSchema);
