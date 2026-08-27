// Service to handle sending notifications to the restaurant owner via WhatsApp Cloud API
export const sendOrderMessage = async (order) => {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const recipient = process.env.WHATSAPP_RECIPIENT_NUMBER;

  if (!token || !phoneId || !recipient) {
    console.log('WhatsApp Cloud API is not configured or missing environment variables.');
    return false;
  }

  const itemsText = (order.items || []).map(i => {
    return `${i.name} x ${i.quantity}\n₹${i.subtotal || (i.price * i.quantity)}`;
  }).join('\n\n');

  const text = `🍽️ NEW ONLINE ORDER\n\n` +
               `Restaurant:\nVarevya Telangana Ruchulu\n\n` +
               `Order ID:\n${order.orderId}\n\n` +
               `Customer:\n${order.customerName}\n\n` +
               `Phone:\n${order.customerPhone}\n\n` +
               `-------------------------\n` +
               `ORDER DETAILS\n` +
               `-------------------------\n\n` +
               `${itemsText}\n\n` +
               `-------------------------\n\n` +
               `Total:\n₹${order.totalAmount}\n\n` +
               `Payment Method:\n${order.paymentMethod}\n\n` +
               `Payment Status:\n${order.paymentStatus === 'Proof Submitted' ? 'Payment Proof Submitted' : order.paymentStatus}\n\n` +
               `UTR:\n${order.utrNumber || 'N/A'}\n\n` +
               `Payment Verification:\nPending / Validated\n\n` +
               `-------------------------\n\n` +
               `Please verify the payment proof before confirming the order.`;

  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'text',
        text: { body: text }
      })
    });
    const data = await res.json();
    console.log('WhatsApp Cloud API order message result:', data);
    return res.ok;
  } catch (err) {
    console.error('WhatsApp sendOrderMessage Error:', err);
    return false;
  }
};

export const sendPaymentProof = async (order) => {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const recipient = process.env.WHATSAPP_RECIPIENT_NUMBER;

  if (!token || !phoneId || !recipient || !order.paymentScreenshot) {
    console.log('WhatsApp Cloud API is not configured or screenshot is missing.');
    return false;
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'image',
        image: {
          link: order.paymentScreenshot,
          caption: `Payment Proof\nOrder ID: ${order.orderId}\nAmount: ₹${order.totalAmount}\nUTR: ${order.utrNumber || 'N/A'}`
        }
      })
    });
    const data = await res.json();
    console.log('WhatsApp Cloud API image upload result:', data);
    return res.ok;
  } catch (err) {
    console.error('WhatsApp sendPaymentProof Error:', err);
    return false;
  }
};
