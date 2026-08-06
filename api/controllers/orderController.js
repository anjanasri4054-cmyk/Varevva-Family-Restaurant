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
      orderStage: 'Preparing Food',
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

    const cleanUtr = utrNumber.toString().trim().replace(/\s+/g, '').toUpperCase();
    const cleanLast4 = last4DigitsMobile.toString().trim().replace(/\D/g, '');

    // 1. UTR Format Validation (A-Z, 0-9, 12-22 chars)
    if (!/^[A-Z0-9]{12,22}$/.test(cleanUtr)) {
      return res.status(400).json({
        success: false,
        message: 'UTR must be between 12 and 22 uppercase alphanumeric characters (A-Z, 0-9).'
      });
    }

    // 2. Last 4 Digits Format Validation (Exactly 4 digits)
    if (cleanLast4.length !== 4 || !/^\d{4}$/.test(cleanLast4)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter exactly 4 numeric digits for mobile suffix.'
      });
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // 3. Registered Mobile Suffix Match Validation
    if (order.customerPhone) {
      const registeredDigits = order.customerPhone.replace(/\D/g, '');
      const expectedLast4 = registeredDigits.slice(-4);

      if (expectedLast4 && cleanLast4 !== expectedLast4) {
        return res.status(400).json({
          success: false,
          message: 'The last four digits do not match your registered mobile number.'
        });
      }
    }

    // 4. Duplicate UTR Check
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

    if (!order.pickupToken) {
      order.pickupToken = `A${tokenCounter++}`;
    }

    order.utrNumber = cleanUtr;
    order.last4DigitsMobile = cleanLast4;
    order.paymentStatus = 'Order Confirmed';
    order.orderStage = 'Preparing Food';
    order.estimatedPrepTime = '15 Minutes';
    
    order.auditLogs.push({
      adminName: 'Customer',
      action: 'PAYMENT_SUBMITTED',
      time: new Date(),
      reason: `UTR ${cleanUtr} submitted. Order confirmed & token ${order.pickupToken} assigned.`
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Payment details submitted! Order confirmed.',
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
