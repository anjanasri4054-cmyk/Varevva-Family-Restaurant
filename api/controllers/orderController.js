import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';

// Generate sequential pickup token: find maximum token number across all orders
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

// 1. Create New Order (Customer Checkout)
export const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      pickupTime,
      specialInstructions,
      diningPreference,
      deliveryAddress,
      items,
      totalAmount,
      paymentMethod
    } = req.body;

    // Count existing orders to generate sequential VRV1001, VRV1002...
    const orderCount = await Order.countDocuments();
    const orderId = `VRV${1001 + orderCount}`;

    const isCod = paymentMethod === 'Cash on Delivery';
    const initialPaymentStatus = isCod ? 'COD' : 'Pending';
    const initialOrderStage = isCod ? 'Preparing Food' : 'Order Placed';
    const pickupToken = await getNextPickupToken();
    const estPrepTime = '15 Minutes';

    const newOrder = new Order({
      orderId,
      customerName,
      customerPhone,
      pickupTime: pickupTime || '',
      specialInstructions: specialInstructions || '',
      diningPreference: diningPreference || 'Takeaway',
      deliveryAddress: deliveryAddress || '',
      items: items || [],
      totalAmount,
      paymentMethod: paymentMethod || 'UPI QR Payment',
      paymentStatus: initialPaymentStatus,
      orderStage: initialOrderStage,
      pickupToken: pickupToken,
      estimatedPrepTime: estPrepTime,
      auditLogs: [{
        adminName: 'System',
        action: 'ORDER_PLACED',
        time: new Date(),
        reason: isCod ? 'COD Order placed & confirmed immediately' : 'Online order placed. Awaiting payment proof.'
      }]
    });

    await newOrder.save();

    return res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      order: newOrder
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 2. Submit Payment Screenshot & Details (Screenshot Submission Flow)
export const submitUtr = async (req, res) => {
  try {
    const { orderId, detectedAmount, detectedTxnId, riskLevel, analysisResult } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required.'
      });
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // 1. Prevent duplicate screenshot submissions for the same order
    if (order.paymentScreenshot || order.paymentStatus === 'Proof Submitted') {
      return res.status(400).json({
        success: false,
        message: 'Payment proof screenshot has already been submitted for this order.'
      });
    }

    // 2. Validate uploaded files
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your payment screenshot.'
      });
    }

    // 3. Store the payment image and analysis results
    order.paymentScreenshot = req.file.path;
    order.detectedAmount = Number(detectedAmount) || 0;
    order.detectedTxnId = detectedTxnId || '';
    order.riskLevel = riskLevel || 'Low';
    order.analysisResult = analysisResult || '';
    order.submissionTime = new Date();

    // 4. Update statuses and stages sequentially
    order.paymentStatus = 'Proof Submitted';
    order.orderStage = 'Preparing Food'; // Placed -> Proof Submitted -> Confirmed -> Preparing Food
    order.estimatedPrepTime = '15 Minutes';
    order.paymentMethod = 'UPI QR Payment';

    // 5. Generate a unique sequential pickup token (prevent duplicates)
    if (!order.pickupToken) {
      order.pickupToken = await getNextPickupToken();
    }

    order.auditLogs.push({
      adminName: 'Customer',
      action: 'PAYMENT_PROOF_SUBMITTED',
      time: new Date(),
      reason: `Payment proof screenshot submitted. OCR Amount: ₹${order.detectedAmount}. Risk: ${order.riskLevel}. Token ${order.pickupToken} assigned.`
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Payment proof submitted successfully!',
      order
    });
  } catch (error) {
    console.error('Submit UTR Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get Single Order Status for Customer Tracking (Auto-Polling)
export const getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne(buildIdQuery(orderId));
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Check UTR Availability (Pre-flight duplicate check)
export const checkUtrAvailability = async (req, res) => {
  try {
    const { utr, orderId } = req.query;
    if (!utr) return res.status(400).json({ exists: false });

    const cleanUtr = utr.trim();
    const duplicatePayment = await Payment.findOne({ utrNumber: cleanUtr });
    const duplicateOrder = await Order.findOne({ utrNumber: cleanUtr, orderId: { $ne: orderId } });
    
    const exists = !!(duplicatePayment || duplicateOrder);
    return res.status(200).json({
      exists,
      message: exists ? 'This Transaction ID has already been submitted.' : 'UTR is unique.'
    });
  } catch (error) {
    return res.status(500).json({ exists: false, message: error.message });
  }
};

// 5. Update Order Stage (Preparing Food -> Ready for Pickup -> Completed)
export const updateOrderStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStage } = req.body;

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { orderId: id }] }
      : { orderId: id };

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (orderStage) {
      order.orderStage = orderStage;
      if (orderStage === 'Preparing Food') order.orderStatus = 'PREPARING';
      if (orderStage === 'Ready for Pickup') order.orderStatus = 'READY';
      if (orderStage === 'Completed') order.orderStatus = 'COMPLETED';
      order.auditLogs.push({
        adminName: 'Admin',
        action: `STAGE_${orderStage.toUpperCase().replace(/\s+/g, '_')}`,
        time: new Date(),
        reason: `Order stage updated to ${orderStage}`
      });
    }
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order stage updated to "${order.orderStage}"`,
      order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Get All Orders (Admin Dashboard - Newest First)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
