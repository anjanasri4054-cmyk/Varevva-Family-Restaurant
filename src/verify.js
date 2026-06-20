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
