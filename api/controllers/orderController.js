import Order from '../models/Order.js';

// Sequential Pickup Token counter memory helper
let tokenCounter = 101;

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
    const initialPaymentStatus = isCod ? 'COD' : 'Order Confirmed';
    const pickupToken = `A${tokenCounter++}`;

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
      verificationStatus: 'Verified',
      orderStage: 'Order Confirmed',
      pickupToken: pickupToken,
      estimatedPrepTime: '15 Minutes',
      auditLogs: [{
        adminName: 'System',
        action: 'ORDER_CONFIRMED',
        time: new Date(),
        reason: 'Order placed & confirmed immediately'
      }]
    });

    await newOrder.save();

    return res.status(201).json({
      success: true,
      message: 'Order placed and confirmed successfully!',
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

// 2. Submit UTR & Last 4 Digits Mobile (Payment Details Submission)
export const submitUtr = async (req, res) => {
  try {
    const { orderId, utrNumber, last4DigitsMobile } = req.body;

    if (!orderId || !utrNumber || !last4DigitsMobile) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, UTR Number, and Last 4 Digits of Mobile are required.'
      });
    }

    const cleanUtr = utrNumber.trim();
    const cleanLast4 = last4DigitsMobile.trim();

    if (cleanUtr.length < 12 || cleanUtr.length > 22) {
      return res.status(400).json({
        success: false,
        message: 'UTR / Transaction ID must be between 12 and 22 characters.'
      });
    }

    if (cleanLast4.length !== 4 || !/^\d{4}$/.test(cleanLast4)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 4-digit mobile number suffix.'
      });
    }

    const duplicateUtrOrder = await Order.findOne({
      utrNumber: cleanUtr,
      orderId: { $ne: orderId }
    });

    if (duplicateUtrOrder) {
      return res.status(400).json({
        success: false,
        isDuplicate: true,
        message: 'This Transaction ID has already been submitted.'
      });
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Assign Token if not already assigned
    if (!order.pickupToken) {
      order.pickupToken = `A${tokenCounter++}`;
    }

    // Update Order Details to Order Confirmed immediately
    order.utrNumber = cleanUtr;
    order.last4DigitsMobile = cleanLast4;
    order.paymentStatus = 'Order Confirmed';
    order.verificationStatus = 'Verified';
    order.orderStage = 'Order Confirmed';
    order.estimatedPrepTime = '15 Minutes';
    
    order.auditLogs.push({
      adminName: 'Customer',
      action: 'UTR_SUBMITTED_CONFIRMED',
      time: new Date(),
      reason: `UTR ${cleanUtr} submitted. Order confirmed immediately.`
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Payment details saved and order confirmed!',
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
    const { utr } = req.query;
    if (!utr) return res.status(400).json({ exists: false });

    const existing = await Order.findOne({ utrNumber: utr.trim() });
    return res.status(200).json({
      exists: !!existing,
      message: existing ? 'This Transaction ID has already been submitted.' : 'UTR is unique.'
    });
  } catch (error) {
    return res.status(500).json({ exists: false, message: error.message });
  }
};

// 5. Admin Action: Approve Payment
export const approvePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminName = 'Restaurant Owner', estimatedPrepTime = '15 Minutes' } = req.body;

    const order = await Order.findOne({ $or: [{ _id: id }, { orderId: id }] });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus === 'Paid' && order.pickupToken) {
      return res.status(400).json({
        success: false,
        message: `Order ${order.orderId} has already been approved with Token ${order.pickupToken}.`
      });
    }

    // Generate Pickup Token (e.g. A101, A102...)
    const pickupToken = `A${tokenCounter++}`;

    order.paymentStatus = 'Paid';
    order.verificationStatus = 'Verified';
    order.orderStage = 'Preparing Food';
    order.pickupToken = pickupToken;
    order.estimatedPrepTime = estimatedPrepTime;
    order.verifiedBy = adminName;
    order.verificationTime = new Date();
    order.rejectionReason = '';

    order.auditLogs.push({
      adminName,
      action: 'PAYMENT_APPROVED',
      time: new Date(),
      reason: `Payment verified manually by owner. Pickup token ${pickupToken} assigned.`
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Payment verified successfully! Pickup Token: ${pickupToken}`,
      order
    });
  } catch (error) {
    console.error('Approve Payment Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Admin Action: Reject Payment
export const rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason = 'Payment not received', adminName = 'Restaurant Owner' } = req.body;

    const order = await Order.findOne({ $or: [{ _id: id }, { orderId: id }] });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.paymentStatus = 'Rejected';
    order.verificationStatus = 'Failed';
    order.rejectionReason = rejectionReason;
    order.verifiedBy = adminName;
    order.verificationTime = new Date();

    order.auditLogs.push({
      adminName,
      action: 'PAYMENT_REJECTED',
      time: new Date(),
      reason: rejectionReason
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order ${order.orderId} payment rejected. Reason: ${rejectionReason}`,
      order
    });
  } catch (error) {
    console.error('Reject Payment Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Update Order Stage (Preparing Food -> Ready for Pickup -> Completed)
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
