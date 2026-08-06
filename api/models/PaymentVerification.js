import mongoose from 'mongoose';

const paymentVerificationSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    index: true,
  },
  referenceNumber: {
    type: String,
    index: true,
  },
  imageHash: {
    type: String,
    required: true,
    index: true,
  },
  pHash: {
    type: String,
    default: '',
  },
  amount: {
    type: Number,
    required: true,
  },
  merchantName: {
    type: String,
    default: '',
  },
  upiId: {
    type: String,
    default: '',
  },
  extractedDate: {
    type: String,
    default: '',
  },
  ocrConfidence: {
    type: Number,
    default: 0,
  },
  aiVerificationResult: {
    type: Object,
    default: {},
  },
  status: {
    type: String,
    enum: ['VERIFIED', 'REJECTED'],
    required: true,
  },
  rejectionReason: {
    type: String,
    default: '',
  },
  orderId: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model('PaymentVerification', paymentVerificationSchema);
