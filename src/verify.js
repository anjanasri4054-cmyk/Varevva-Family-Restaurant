import { menuData } from './menuData.js';

// Decode URL-safe Base64 UTF-8 string
function decodePayload(base64) {
  try {
    let str = base64.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
      str += '=';
    }
    const decodedJson = decodeURIComponent(escape(atob(str)));
    return JSON.parse(decodedJson);
  } catch (e) {
    console.error("Payload decoding failed:", e);
    return null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const verifyCard = document.getElementById('verify-card');
  if (!verifyCard) return;

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('o');

  if (!code) {
    renderError(verifyCard, "Missing verification code. Please make sure you clicked the full link from WhatsApp.");
    return;
  }

  const payload = decodePayload(code);
  if (!payload || !payload.n || !payload.k || !Array.isArray(payload.i)) {
    renderError(verifyCard, "Invalid or corrupted verification code. This order bill may have been tampered with or edited!");
    return;
  }

  renderSuccess(verifyCard, payload);
});

function renderSuccess(container, payload) {
  const { n: name, p: phone, t: typeVal, k: token, i: items, a: address } = payload;
  let orderType = "Takeaway / Parcel";
  if (typeVal === 0) {
    orderType = "Dine-in (Eating at Restaurant)";
  } else if (typeVal === 2) {
    orderType = "Door Delivery";
  }
  
  let addressHTML = '';
  if (typeVal === 2 && address) {
    addressHTML = `
      <div class="meta-item full-width" style="grid-column: 1 / -1; margin-top: 10px; border-top: 1px dashed rgba(0, 0, 0, 0.08); padding-top: 10px; width: 100%;">
        <span class="meta-label">Delivery Address</span>
        <span class="meta-value" style="font-weight: 600; color: var(--text-dark);">${address}</span>
      </div>
    `;
  }
  
  let itemsHTML = '';
  let calculatedTotal = 0;
  let index = 1;

  items.forEach(([idOrName, qty, priceVal]) => {
    // Find item in menuData
    const menuItem = menuData.find(item => item.id === idOrName || item.name === idOrName);
    const itemName = menuItem ? menuItem.name : idOrName;
    const itemPrice = menuItem ? menuItem.price : (priceVal || 0);
    const subtotal = itemPrice * qty;
    calculatedTotal += subtotal;

    itemsHTML += `
      <tr class="verify-table-row">
        <td>${index}. <strong>${itemName}</strong></td>
        <td style="text-align: center;">x ${qty}</td>
        <td style="text-align: right;">₹${itemPrice}</td>
        <td style="text-align: right; font-weight: 700; color: var(--text-dark);">₹${subtotal}</td>
      </tr>
    `;
    index++;
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { dateStyle: 'medium' });
  const timeStr = now.toLocaleTimeString('en-IN', { timeStyle: 'short' });

  container.className = "verify-card verified";
  container.innerHTML = `
    <div class="verify-status-banner">
      <div class="verify-icon-wrapper">
        <i class="fa-solid fa-circle-check"></i>
      </div>
      <h2>Order Verified</h2>
      <span class="badge-verified"><i class="fa-solid fa-circle-check"></i> Genuine Receipt</span>
    </div>
    
    <div class="verify-details">
      <div class="verify-meta-grid">
        <div class="meta-item">
          <span class="meta-label">Order Token</span>
          <span class="meta-value highlight">${token}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Dining Option</span>
          <span class="meta-value">${orderType}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Customer Name</span>
          <span class="meta-value">${name}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Phone Number</span>
          <span class="meta-value">${phone}</span>
        </div>
        ${addressHTML}
      </div>
      
      <div class="verify-bill-section">
        <h3>Official Bill Items</h3>
        <div class="verify-table-wrapper">
          <table class="verify-table">
            <thead>
              <tr>
                <th style="text-align: left;">Item</th>
                <th>Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
        </div>
        
        <div class="verify-total-row">
          <span>Official Total Amount:</span>
          <span class="verify-total-price">₹${calculatedTotal}</span>
        </div>
      </div>

      <div class="verify-footer">
        <p><i class="fa-solid fa-clock"></i> Checked on ${dateStr} at ${timeStr}</p>
        <p class="verification-note">Prices verified against official Varevva Menu. This bill represents the correct price calculation.</p>
        <a href="/index.html" class="btn-verify-back">Back to Home</a>
      </div>
    </div>
  `;

  // Fetch online payment verification status if orderId is provided
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');
  if (orderId) {
    const dbStatusContainer = document.createElement('div');
    dbStatusContainer.id = 'verify-db-status';
    dbStatusContainer.style.marginTop = '16px';
    dbStatusContainer.style.borderTop = '1px dashed rgba(0,0,0,0.08)';
    dbStatusContainer.style.paddingTop = '16px';
    dbStatusContainer.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Checking live payment verification...`;

    const verifyDetails = container.querySelector('.verify-details');
    const verifyFooter = container.querySelector('.verify-footer');
    if (verifyDetails && verifyFooter) {
      verifyDetails.insertBefore(dbStatusContainer, verifyFooter);
    }

    setTimeout(async () => {
      try {
        const res = await fetch(`/api/orders/track/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.order) {
            const order = data.order;
            dbStatusContainer.innerHTML = `
              <h3 style="font-family: var(--font-header); font-size: 0.95rem; margin: 0 0 10px 0; color: var(--text-dark); text-align: left;">Live Payment Status</h3>
              <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.8rem; text-align: left;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">Order Reference ID:</span>
                  <span style="font-weight: 700; color: var(--text-dark);">${order.orderId}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">Payment Method:</span>
                  <span style="font-weight: 600; color: var(--text-dark);">${order.paymentMethod}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">Payment Status:</span>
                  <span style="font-weight: 700; color: ${order.paymentStatus === 'Paid' ? '#059669' : '#d97706'};">${order.paymentStatus}</span>
                </div>
                ${order.utrNumber ? `
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">Transaction / UTR ID:</span>
                  <span style="font-family: monospace; font-weight: 700; color: var(--text-dark);">${order.utrNumber}</span>
                </div>` : ''}
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">Verification Status:</span>
                  <span style="font-weight: 700; color: ${order.orderStage === 'Order Confirmed' || order.orderStage === 'Preparing Food' || order.orderStage === 'Ready for Pickup' || order.orderStage === 'Completed' ? '#059669' : '#d97706'};">
                    ${order.orderStage === 'Order Confirmed' || order.orderStage === 'Preparing Food' || order.orderStage === 'Ready for Pickup' || order.orderStage === 'Completed' ? '✓ VERIFIED' : 'PENDING'}
                  </span>
                </div>
              </div>
            `;
          } else {
            dbStatusContainer.remove();
          }
        } else {
          dbStatusContainer.remove();
        }
      } catch (err) {
        dbStatusContainer.remove();
      }
    }, 100);
  }
}

function renderError(container, message) {
  container.className = "verify-card failed";
  container.innerHTML = `
    <div class="verify-status-banner">
      <div class="verify-icon-wrapper">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>
      <h2>Verification Failed</h2>
      <span class="badge-failed"><i class="fa-solid fa-circle-xmark"></i> Untrusted Receipt</span>
    </div>
    
    <div class="verify-error-content">
      <p class="error-msg">${message}</p>
      <p class="error-warning"><i class="fa-solid fa-circle-info"></i> Security Note: If the customer modified the text in the WhatsApp message to reduce the price or change items, the verification code signature will mismatch or decode incorrectly.</p>
      
      <div class="error-actions">
        <a href="/index.html" class="btn-verify-back">Back to Home</a>
      </div>
    </div>
  `;
}
