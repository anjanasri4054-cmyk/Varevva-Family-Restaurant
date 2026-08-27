import Order from '../models/Order.js';
import Payment from '../models/Payment.js';

// Generate sequential pickup token: find last token, e.g. A101, A102...
async function getNextPickupToken() {
  const lastTokenOrder = await Order.findOne({ pickupToken: { $regex: /^A\d+$/ } }).sort({ createdAt: -1 });
  let nextTokenNumber = 101;
  if (lastTokenOrder && lastTokenOrder.pickupToken) {
    const match = lastTokenOrder.pickupToken.match(/^A(\d+)$/);
    if (match) {
      nextTokenNumber = parseInt(match[1], 10) + 1;
    }
  }
  return `A${nextTokenNumber}`;
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
    const pickupToken = isCod ? await getNextPickupToken() : null;
    const estPrepTime = isCod ? '15 Minutes' : '';

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
    const order = await Order.findOne({ orderId });
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

    const order = await Order.findOne({ $or: [{ _id: id }, { orderId: id }] });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (orderStage) order.orderStage = orderStage;
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
