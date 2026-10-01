import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import { sendOrderMessage, sendPaymentProof } from '../services/whatsappService.js';

// Sequential pickup token generator - robust max token detection
async function getNextPickupToken() {
  const allTokenOrders = await Order.find({ pickupToken: { $regex: /^A\d+$/ } }, { pickupToken: 1 }).lean();
  let maxNum = 100;
  for (const o of allTokenOrders) {
    if (o.pickupToken) {
      const match = o.pickupToken.match(/^A(\d+)$/);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val > maxNum) maxNum = val;
      }
    }
  }
  return `A${maxNum + 1}`;
}

function buildIdQuery(id) {
  const cleanId = (id || '').trim();
  const regex = new RegExp(`^${cleanId}$`, 'i');
  return mongoose.Types.ObjectId.isValid(cleanId)
    ? { $or: [{ _id: cleanId }, { orderId: regex }, { pickupToken: regex }] }
    : { $or: [{ orderId: regex }, { pickupToken: regex }] };
}

// 1. Get Single Payment details
export const getPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findOne(buildIdQuery(id));
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }
    return res.status(200).json({ success: true, payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Upload Proof and Create Payment
export const uploadProof = async (req, res) => {
  try {
    const { orderId, detectedAmount, detectedTxnId, riskLevel, analysisResult } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required.' });
    }

    const cleanOrderId = (orderId || '').trim();
    let order = await Order.findOne(buildIdQuery(cleanOrderId));

    // Emergency auto-recovery: If order wasn't found in DB, auto-create it using client payload
    if (!order) {
      const customerName = (req.body.customerName || '').trim();
      const customerPhone = (req.body.customerPhone || '').trim();
      const totalAmount = Number(req.body.totalAmount) || Number(detectedAmount) || 0;
      let items = [];
      try {
        if (req.body.items) {
          items = typeof req.body.items === 'string' ? JSON.parse(req.body.items) : req.body.items;
        }
      } catch (e) {}

      if (customerName || totalAmount > 0) {
        const nextToken = await getNextPickupToken();
        order = new Order({
          orderId: cleanOrderId.toUpperCase(),
          customerName: customerName || 'Valued Customer',
          customerPhone: customerPhone || '',
          diningPreference: req.body.diningPreference || 'Takeaway',
          deliveryAddress: req.body.deliveryAddress || '',
          items: Array.isArray(items) && items.length > 0 ? items : [{ name: 'Meal Order', quantity: 1, price: totalAmount, subtotal: totalAmount }],
          totalAmount: totalAmount,
          paymentMethod: 'UPI QR Payment',
          paymentStatus: 'Pending',
          orderStage: 'Order Placed',
          orderStatus: 'PLACED',
          pickupToken: nextToken,
          estimatedPrepTime: '15 Minutes',
          auditLogs: [{
            adminName: 'System',
            action: 'ORDER_RECOVERED',
            time: new Date(),
            reason: 'Order auto-recovered on payment proof submission.'
          }]
        });
        await order.save();
      } else {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Screenshot file is required.' });
    }

    const utr = (detectedTxnId || '').trim();
    if (!utr) {
      return res.status(400).json({ success: false, message: 'Transaction ID / UTR is required.' });
    }

    // Duplicate UTR check across Payments and Orders
    const duplicatePayment = await Payment.findOne({ utrNumber: utr });
    const duplicateOrder = await Order.findOne({ utrNumber: utr, orderId: { $ne: order.orderId } });
    if (duplicatePayment || duplicateOrder) {
      return res.status(400).json({
        success: false,
        message: 'This Transaction ID / UTR has already been submitted for another order.'
      });
    }

    // Amount match validation (default to order.totalAmount if detectedAmount is 0 or omitted)
    const amountVal = Number(detectedAmount) || order.totalAmount;
    if (amountVal > 0 && order.totalAmount > 0 && amountVal !== order.totalAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment amount mismatch. Screenshot/Form shows ₹${amountVal}, but order total is ₹${order.totalAmount}.`
      });
    }

    // Create Payment Document
    const newPayment = new Payment({
      orderId: order.orderId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      amount: order.totalAmount,
      paymentMethod: 'PhonePe',
      screenshot: req.file.path,
      screenshotPublicId: req.file.filename || '',
      transactionId: utr,
      utrNumber: utr,
      paymentStatus: 'SUBMITTED',
      verificationStatus: 'PENDING',
      orderItems: order.items
    });

    await newPayment.save();

    // Link to Order
    order.paymentId = newPayment._id;
    order.paymentScreenshot = req.file.path;
    order.utrNumber = utr;
    order.detectedAmount = amountVal;
    order.detectedTxnId = utr;
    order.riskLevel = riskLevel || 'Low';
    order.analysisResult = analysisResult || '✓ Yes';
    order.paymentStatus = 'Proof Submitted';
    order.orderStage = 'Payment Proof Submitted';
    order.submissionTime = new Date();
    if (!order.pickupToken) {
      order.pickupToken = await getNextPickupToken();
      order.estimatedPrepTime = '15 Minutes';
    }

    await order.save();

    // Send WhatsApp Cloud API notifications (graceful failure)
    try {
      await sendOrderMessage(order);
      await sendPaymentProof(order);
    } catch (wsErr) {
      console.warn('WhatsApp service execution failed:', wsErr);
    }

    return res.status(200).json({
      success: true,
      message: 'Payment proof submitted successfully!',
      order,
      payment: newPayment
    });
  } catch (error) {
    console.error('Upload Proof Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Admin: Get all payments
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, payments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Admin: Approve Payment
export const approvePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const query = buildIdQuery(id);
    const payment = await Payment.findOne(query);
    const order = await Order.findOne(query);

    if (!order && !payment) {
      return res.status(404).json({ success: false, message: 'Order / Payment record not found.' });
    }

    if (payment) {
      payment.paymentStatus = 'SUCCESS';
      payment.verificationStatus = 'VERIFIED';
      payment.verificationMessage = reason || 'Payment verified by admin.';
      payment.verifiedAt = new Date();
      await payment.save();
    }

    if (order) {
      order.paymentStatus = 'Paid';
      order.orderStage = 'Order Confirmed';
      order.orderStatus = 'CONFIRMED';
      if (!order.pickupToken) {
        order.pickupToken = await getNextPickupToken();
        order.estimatedPrepTime = '15 Minutes';
      }
      order.auditLogs.push({
        adminName: 'Admin',
        action: 'PAYMENT_APPROVED',
        time: new Date(),
        reason: reason || 'Payment screenshot proof approved.'
      });
      await order.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Payment approved successfully!',
      payment,
      order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Admin: Reject Payment
export const rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
    }

    const query = buildIdQuery(id);
    const payment = await Payment.findOne(query);
    const order = await Order.findOne(query);

    if (!order && !payment) {
      return res.status(404).json({ success: false, message: 'Order / Payment record not found.' });
    }

    if (payment) {
      payment.paymentStatus = 'FAILED';
      payment.verificationStatus = 'REJECTED';
      payment.verificationMessage = reason;
      payment.verifiedAt = new Date();
      await payment.save();
    }

    if (order) {
      order.paymentStatus = 'Pending'; // reset back
      order.orderStage = 'Order Placed'; // rollback
      order.orderStatus = 'CANCELLED'; // mark cancelled
      order.auditLogs.push({
        adminName: 'Admin',
        action: 'PAYMENT_REJECTED',
        time: new Date(),
        reason: reason
      });
      await order.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Payment rejected successfully!',
      payment,
      order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Verify UTR duplicate helper
export const verifyUtr = async (req, res) => {
  try {
    const { utr, orderId } = req.body || req.query;
    if (!utr) {
      return res.status(400).json({ success: false, message: 'UTR is required.' });
    }

    const cleanUtr = utr.trim();
    const duplicatePayment = await Payment.findOne({ utrNumber: cleanUtr });
    const duplicateOrder = await Order.findOne({ utrNumber: cleanUtr, orderId: { $ne: orderId } });
    const exists = !!(duplicatePayment || duplicateOrder);

    return res.status(200).json({
      exists,
      message: exists ? 'This Transaction ID has already been submitted.' : 'UTR is unique.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
