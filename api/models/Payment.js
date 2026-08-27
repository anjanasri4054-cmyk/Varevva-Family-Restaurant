import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    index: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    default: 'PhonePe'
  },
  screenshot: {
    type: String,
    required: true
  },
  screenshotPublicId: {
    type: String,
    default: ''
  },
  transactionId: {
    type: String,
    default: ''
  },
  utrNumber: {
    type: String,
    default: '',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'SUBMITTED', 'SUCCESS', 'FAILED'],
    default: 'SUBMITTED'
  },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING'
  },
  verificationMessage: {
    type: String,
    default: ''
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  orderItems: [{
    name: String,
    quantity: Number,
    price: Number,
    subtotal: Number
  }]
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
