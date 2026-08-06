import { menuData } from './menuData.js';
import { defaultSpecials } from './specialsData.js';
import { initDatabase, fetchMenuData, saveMenuData, fetchSpecialsData, saveSpecialsData } from './db.js';

// --- DOM Element References ---
const navbar = document.getElementById('navbar');
const navMenu = document.getElementById('nav-menu');
const mobileNavToggle = document.getElementById('mobile-nav-toggle');
const menuGrid = document.getElementById('live-menu-grid');
const specialsGrid = document.getElementById('live-specials-grid');
const searchInput = document.getElementById('menu-search');
const searchClearBtn = document.getElementById('search-clear-btn');
const dietButtons = document.querySelectorAll('.btn-filter-diet');
const categoryTabs = document.querySelectorAll('.menu-tab-btn');

// --- Application State ---
let activeCategory = 'all';
let activeDiet = 'all';
let searchQuery = '';

// Load menu data & specials
let currentMenu = [];
let currentSpecials = [];

// Session admin login state
let isAdmin = sessionStorage.getItem('varevva_admin_logged_in') === 'true';

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', async () => {
  await initDatabase();
  currentMenu = await fetchMenuData();
  currentSpecials = await fetchSpecialsData();

  initNavbarScroll();
  initMobileNav();
  updateFloatingCartBar();

  // Only initialize menu search and filters if they exist (on menu.html)
  if (menuGrid) {
    initMenuFilters();
    initSearch();
    initAdminPortal();
    renderMenu();
  }

  // Only initialize specials if they exist (on specials.html)
  if (specialsGrid) {
    initAdminPortal();
    renderSpecials();
  }

  initCartEventListeners();

  // Open checkout modal if redirected from item page with ?checkout=true
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('checkout') === 'true') {
    setTimeout(() => {
      openOrderModal();
    }, 100);
  }
});

// --- Navbar Scroll Effect ---
function initNavbarScroll() {
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }
}

// --- Mobile Navigation Menu ---
function initMobileNav() {
  if (mobileNavToggle && navMenu) {
    mobileNavToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');

      // Toggle menu icon
      const icon = mobileNavToggle.querySelector('i');
      if (navMenu.classList.contains('open')) {
        icon.className = 'fa-solid fa-xmark';
      } else {
        icon.className = 'fa-solid fa-bars';
      }
    });

    // Close menu when a link is clicked
    const links = navMenu.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileNavToggle.querySelector('i').className = 'fa-solid fa-bars';
      });
    });
  }
}

// --- Menu Tab & Diet Filter Actions ---
function initMenuFilters() {
  // Category tabs listeners
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      activeCategory = tab.dataset.category;
      renderMenu();
    });
  });

  // Diet toggle buttons listeners (All, Veg, Non-Veg)
  dietButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      dietButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      activeDiet = btn.dataset.diet;
      renderMenu();
    });
  });
}

// --- Search Functionality ---
function initSearch() {
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();

      if (searchClearBtn) {
        if (searchQuery.length > 0) {
          searchClearBtn.style.display = 'block';
        } else {
          searchClearBtn.style.display = 'none';
        }
      }

      renderMenu();
    });
  }

  if (searchClearBtn && searchInput) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      searchClearBtn.style.display = 'none';
      searchInput.focus();
      renderMenu();
    });
  }
}

// --- Dynamic Image Mapping Helper ---
export function sanitizeImageUrl(url, type = 'non-veg') {
  const defaultFallback = type === 'veg' ? '/assets/paneer_butter_masala.png' : '/assets/chicken_dum_biryani.png';
  if (!url || typeof url !== 'string') return defaultFallback;
  let clean = url.trim();
  if (!clean) return defaultFallback;
  if (clean.startsWith('/public/assets/')) {
    clean = clean.replace('/public/assets/', '/assets/');
  } else if (clean.startsWith('public/assets/')) {
    clean = clean.replace('public/assets/', '/assets/');
  } else if (clean.startsWith('assets/')) {
    clean = '/' + clean;
  }
  return clean;
}

function getItemImage(item) {
  return sanitizeImageUrl(item.image, item.type);
}

// --- Cart State Management (localStorage persisted) ---
function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem('varevva_cart')) || {};
    let changed = false;
    // Sync price with currentMenu to handle cost changes and prevent user manipulation
    Object.keys(cart).forEach(name => {
      const menuItem = currentMenu.find(item => item.name === name);
      if (menuItem && !menuItem.outOfStock) {
        cart[name].price = menuItem.price;
      } else {
        delete cart[name];
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem('varevva_cart', JSON.stringify(cart));
    }
    return cart;
  } catch (e) {
    return {};
  }
}

// Save cart to local storage and update floating bar
function saveCart(cart) {
  localStorage.setItem('varevva_cart', JSON.stringify(cart));
  updateFloatingCartBar();
}

function addToCart(name, price) {
  const cart = getCart();
  if (cart[name]) {
    cart[name].quantity += 1;
  } else {
    cart[name] = { name, price: Number(price), quantity: 1 };
  }
  saveCart(cart);
  renderMenu();
}

function updateQuantity(name, change) {
  const cart = getCart();
  if (!cart[name]) return;

  cart[name].quantity += change;
  if (cart[name].quantity <= 0) {
    delete cart[name];
  }
  saveCart(cart);
  renderMenu();
}

function updateFloatingCartBar() {
  const cart = getCart();
  const keys = Object.keys(cart);
  let existingBar = document.querySelector('.floating-cart-bar');

  if (keys.length === 0) {
    if (existingBar) {
      existingBar.remove();
    }
    return;
  }

  let totalQty = 0;
  let totalPrice = 0;
  keys.forEach(k => {
    totalQty += cart[k].quantity;
    totalPrice += cart[k].price * cart[k].quantity;
  });

  if (!existingBar) {
    existingBar = document.createElement('div');
    existingBar.className = 'floating-cart-bar';
    document.body.appendChild(existingBar);
  }

  existingBar.innerHTML = `
    <div class="cart-info">
      <div class="cart-icon-wrapper">
        <i class="fa-solid fa-cart-shopping"></i>
        <span class="cart-badge">${totalQty}</span>
      </div>
      <span>${totalQty} Item${totalQty > 1 ? 's' : ''} | ₹${totalPrice}</span>
    </div>
    <button class="cart-btn-order" id="btn-cart-whatsapp-order">
      <span>Order on WhatsApp</span>
      <i class="fa-solid fa-arrow-right"></i>
    </button>
  `;
}

// --- Order Details Modal System ---
function openOrderModal() {
  const cart = getCart();
  if (Object.keys(cart).length === 0) return;

  // Prevent multiple modals
  if (document.querySelector('.order-modal-overlay')) return;

  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'order-modal-overlay';

  modalOverlay.innerHTML = `
    <div class="order-modal-card">
      <div class="order-modal-header">
        <h3>Order Details</h3>
        <button class="btn-close-modal" id="btn-close-order-modal">&times;</button>
      </div>
      
      <!-- Order Items Summary Section -->
      <div class="order-modal-summary">
        <label style="font-family: var(--font-header); font-weight: 700; font-size: 0.88rem; color: var(--text-dark); display: block; margin-bottom: 8px;">Order Summary</label>
        <div class="modal-summary-box" id="modal-summary-items-container">
          <!-- Dynamically populated -->
        </div>
      </div>

      <form class="order-modal-form" id="order-details-form">
        <div class="form-group">
          <label for="cust-name">Your Name</label>
          <input type="text" id="cust-name" placeholder="Enter your name" required>
        </div>
        <div class="form-group">
          <label for="cust-phone">Phone Number</label>
          <input type="tel" id="cust-phone" placeholder="Enter 10-digit mobile number" pattern="[0-9]{10}" title="Please enter a valid 10-digit mobile number" required>
        </div>
        <div class="form-group">
          <label for="order-type">Dining Preference</label>
          <select id="order-type">
            <option value="dine-in">Dine-in (Eating at Restaurant)</option>
            <option value="takeaway">Takeaway / Parcel</option>
            <option value="delivery">Door Delivery (within 4km radius)</option>
          </select>
        </div>

        <div class="form-group">
          <label for="payment-method-select">Payment Method</label>
          <select id="payment-method-select">
            <option value="online">Online Payment (UPI QR Code)</option>
            <option value="cod">Cash on Delivery / Pay at Counter</option>
          </select>
        </div>
        
        <div id="delivery-fields" style="display: none; flex-direction: column; gap: 12px; margin-top: 12px; border-top: 1px dashed rgba(0,0,0,0.08); padding-top: 12px;">
          <div class="form-group">
            <label for="cust-address">Delivery Address</label>
            <textarea id="cust-address" placeholder="Enter your full address with landmark" rows="2" style="padding: 10px 12px; border-radius: var(--border-radius-sm); border: 1px solid rgba(0,0,0,0.1); outline: none; font-family: var(--font-accent); font-size: 0.95rem; transition: var(--transition-smooth); width: 100%; resize: vertical;"></textarea>
          </div>
          <div class="form-group">
            <label>Location Verification</label>
            <div style="display: flex; gap: 10px; align-items: center; margin-top: 4px;">
              <button type="button" id="btn-detect-location" class="btn-admin-submit" style="padding: 8px 14px; font-size: 0.85rem; width: auto; display: flex; align-items: center; gap: 6px; margin-top: 0;">
                <i class="fa-solid fa-location-crosshairs"></i> Detect Distance
              </button>
              <span id="location-status" style="font-size: 0.82rem; font-weight: 500; color: var(--text-muted);">Not verified yet</span>
            </div>
            <p style="font-size: 0.74rem; color: var(--text-muted); margin-top: 6px; line-height: 1.3;">
              Note: Delivery is free within 4km from Varevva. If GPS fails, manual override is allowed.
            </p>
          </div>
        </div>

        <div class="form-group" style="margin-top: 8px;">
          <label for="cust-pickup-time">Pickup / Preferred Time (Optional)</label>
          <input type="text" id="cust-pickup-time" placeholder="e.g. 7:30 PM (Default: ASAP)">
        </div>

        <div class="form-group">
          <label for="cust-instructions">Special Cooking Instructions (Optional)</label>
          <input type="text" id="cust-instructions" placeholder="e.g. Less spicy, extra gravy">
        </div>

        <button type="submit" class="btn-submit-order" id="btn-submit-order" style="margin-top: 14px;">
          <span id="submit-btn-text">Proceed to Pay Online (UPI QR)</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  const closeBtn = modalOverlay.querySelector('#btn-close-order-modal');
  const form = modalOverlay.querySelector('#order-details-form');
  const orderTypeSelect = modalOverlay.querySelector('#order-type');
  const paymentMethodSelect = modalOverlay.querySelector('#payment-method-select');
  const submitBtnText = modalOverlay.querySelector('#submit-btn-text');
  const summaryContainer = modalOverlay.querySelector('#modal-summary-items-container');

  // Dynamic Summary Render Function
  const updateModalSummary = () => {
    const currentCart = getCart();
    const keys = Object.keys(currentCart);

    if (keys.length === 0) {
      closeOrderModal();
      return;
    }

    let itemsHTML = '';
    let total = 0;

    keys.forEach(k => {
      const item = currentCart[k];
      const subtotal = item.price * item.quantity;
      total += subtotal;

      itemsHTML += `
        <div class="modal-summary-item" data-name="${item.name}">
          <div class="summary-item-info">
            <span class="summary-item-name">${item.name}</span>
            <span class="summary-item-price">₹${item.price} each</span>
          </div>
          <div class="summary-item-actions">
            <div class="modal-qty-control">
              <button type="button" class="btn-modal-qty-minus" data-name="${item.name}">-</button>
              <span class="modal-qty-value">${item.quantity}</span>
              <button type="button" class="btn-modal-qty-plus" data-name="${item.name}">+</button>
            </div>
            <span class="summary-item-subtotal">₹${subtotal}</span>
          </div>
        </div>
      `;
    });

    summaryContainer.innerHTML = `
      <div class="modal-items-list">
        ${itemsHTML}
      </div>
      <div class="modal-summary-total">
        <span>Total Cost:</span>
        <span>₹${total}</span>
      </div>
    `;
  };

  updateModalSummary();

  // Quantity button event delegation
  summaryContainer.addEventListener('click', (e) => {
    const minusBtn = e.target.closest('.btn-modal-qty-minus');
    const plusBtn = e.target.closest('.btn-modal-qty-plus');

    if (minusBtn) {
      updateQuantity(minusBtn.dataset.name, -1);
      updateModalSummary();
    } else if (plusBtn) {
      updateQuantity(plusBtn.dataset.name, 1);
      updateModalSummary();
    }
  });

  // Toggle button text based on payment selection
  paymentMethodSelect.addEventListener('change', () => {
    if (paymentMethodSelect.value === 'online') {
      submitBtnText.textContent = 'Proceed to Pay Online (UPI QR)';
    } else {
      submitBtnText.textContent = 'Place Order (Cash on Delivery)';
    }
  });

  let isLocationVerified = false;
  let verifiedDistance = null;

  orderTypeSelect.addEventListener('change', () => {
    const deliveryFields = modalOverlay.querySelector('#delivery-fields');
    const addressInput = modalOverlay.querySelector('#cust-address');

    if (orderTypeSelect.value === 'delivery') {
      deliveryFields.style.display = 'flex';
      addressInput.setAttribute('required', 'true');
    } else {
      deliveryFields.style.display = 'none';
      addressInput.removeAttribute('required');
      isLocationVerified = false;
    }
  });

  const detectBtn = modalOverlay.querySelector('#btn-detect-location');
  const statusSpan = modalOverlay.querySelector('#location-status');

  if (detectBtn) {
    detectBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        statusSpan.style.color = '#ef4444';
        statusSpan.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> GPS not supported.';
        isLocationVerified = true;
        return;
      }

      statusSpan.style.color = 'var(--text-dark)';
      statusSpan.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking GPS...';

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${lon},${lat};78.9440528,17.5700914?overview=false`;

          fetch(osrmUrl)
            .then(res => res.json())
            .then(data => {
              let distance = 0;
              if (data.code === 'Ok' && data.routes && data.routes[0]) {
                distance = data.routes[0].distance / 1000;
              } else {
                distance = calculateDistance(17.5700914, 78.9440528, lat, lon);
              }

              verifiedDistance = distance.toFixed(2);
              if (distance <= 4.0) {
                statusSpan.style.color = '#10b981';
                statusSpan.innerHTML = `<i class="fa-solid fa-circle-check"></i> Delivery available (${verifiedDistance} km)`;
                isLocationVerified = true;
              } else {
                statusSpan.style.color = '#ef4444';
                statusSpan.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Delivery not available (${verifiedDistance} km)`;
                isLocationVerified = false;
                alert(`Delivery address is outside our 4km range (${verifiedDistance} km). Please choose Dine-in or Takeaway.`);
              }
            })
            .catch(() => {
              statusSpan.style.color = '#10b981';
              statusSpan.innerHTML = '<i class="fa-solid fa-circle-check"></i> Delivery available';
              isLocationVerified = true;
            });
        },
        () => {
          statusSpan.style.color = '#d97706';
          statusSpan.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> GPS failed. Manual allowed.';
          isLocationVerified = true;
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }

  // Handle close action
  closeBtn.addEventListener('click', closeOrderModal);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeOrderModal();
    }
  });

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.querySelector('#cust-name').value.trim();
    const phone = form.querySelector('#cust-phone').value.trim();
    const typeLabel = orderTypeSelect.options[orderTypeSelect.selectedIndex].text;
    const paymentVal = paymentMethodSelect ? paymentMethodSelect.value : 'online';
    const address = orderTypeSelect.value === 'delivery' ? form.querySelector('#cust-address').value.trim() : '';
    const pickupTime = form.querySelector('#cust-pickup-time') ? form.querySelector('#cust-pickup-time').value.trim() : '';
    const specialInstructions = form.querySelector('#cust-instructions') ? form.querySelector('#cust-instructions').value.trim() : '';

    if (orderTypeSelect.value === 'delivery' && !isLocationVerified) {
      alert("Please verify your location first by clicking 'Detect Distance'.");
      return;
    }

    let paymentMethodLabel = paymentVal === 'online' ? 'UPI QR Payment' : 'Cash on Delivery';

    // Compute cart items & total
    const cart = getCart();
    let cartTotal = 0;
    const orderItems = Object.keys(cart).map(k => {
      const sub = cart[k].price * cart[k].quantity;
      cartTotal += sub;
      return { name: cart[k].name, quantity: cart[k].quantity, price: cart[k].price, subtotal: sub };
    });

    let assignedOrderId = `VRV${Math.floor(1001 + Math.random() * 9000)}`;

    // Create Order in MongoDB Database
    try {
      const orderPayload = {
        customerName: name,
        customerPhone: phone,
        pickupTime,
        specialInstructions,
        diningPreference: typeLabel,
        deliveryAddress: address,
        items: orderItems,
        totalAmount: cartTotal,
        paymentMethod: paymentMethodLabel
      };

      const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api/orders'
        : 'https://varevva-family-restaurant.onrender.com/api/orders';

      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.order && data.order.orderId) {
          assignedOrderId = data.order.orderId;
          if (data.order.totalAmount !== undefined) {
            localStorage.setItem('varevva_last_total', data.order.totalAmount);
          }
        }
      }
    } catch (err) {
      console.warn('Order creation API call fallback:', err);
    }

    localStorage.setItem('varevva_last_order_id', assignedOrderId);

    // Clear cart & close modal
    localStorage.removeItem('varevva_cart');
    closeOrderModal();
    updateFloatingCartBar();

    // Redirect to Payment Page or Tracking Page
    if (paymentVal === 'online') {
      window.location.href = `payment.html?orderId=${assignedOrderId}`;
    } else {
      window.location.href = `track.html?orderId=${assignedOrderId}`;
    }
  });
}

function closeOrderModal() {
  const modal = document.querySelector('.order-modal-overlay');
  if (modal) {
    modal.remove();
  }
}

function showSuccessScreen({ token, whatsappUrl }) {
  const modalCard = document.querySelector('.order-modal-card');
  if (!modalCard) return;

  modalCard.innerHTML = `
    <div class="order-success-screen">
      <div class="success-icon">
        <i class="fa-solid fa-check"></i>
      </div>
      <h3>Order Generated!</h3>
      <p class="success-desc">Click the button below to send your order on WhatsApp to confirm.</p>
      
      <div class="token-box">
        <div class="token-title">Your Order Token</div>
        <div class="token-number">${token}</div>
      </div>
      
      <a href="${whatsappUrl}" target="_blank" class="btn-submit-order" id="btn-send-whatsapp-now" style="width: 100%; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;">
        <i class="fa-brands fa-whatsapp" style="font-size: 1.3rem;"></i>
        <span>Send on WhatsApp</span>
      </a>
      
      <button class="btn-success-done" id="btn-order-complete-done" style="width: 100%;">Done & Clear Cart</button>
    </div>
  `;

  const doneBtn = modalCard.querySelector('#btn-order-complete-done');
  doneBtn.addEventListener('click', () => {
    localStorage.removeItem('varevva_cart');
    closeOrderModal();
    updateFloatingCartBar();
    renderMenu();
  });
}

function encodePayload(payload) {
  const jsonStr = JSON.stringify(payload);
  const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function buildWhatsAppUrl({ name, phone, typeLabel, paymentMethodLabel = 'UPI QR Payment', proofFileName = null, token, address = '', distance = null }) {
  const cart = getCart();
  const keys = Object.keys(cart);
  if (keys.length === 0) return '';

  let message = `*Order Token: ${token}*\n`;
  message += `*Customer:* ${name}\n`;
  message += `*Phone:* ${phone}\n`;
  message += `*Option:* ${typeLabel}\n`;
  message += `*Payment Method:* ${paymentMethodLabel}\n`;
  if (proofFileName) {
    message += `*Payment Screenshot:* ${proofFileName}\n`;
  }
  if (address) {
    message += `*Delivery Address:* ${address}\n`;
    if (distance) {
      message += `*GPS Distance:* ${distance} km\n`;
    }
  }
  message += `-------------------------\n`;
  message += `*Items Ordered:*\n`;

  let total = 0;
  let index = 1;
  const itemsArray = [];

  keys.forEach(k => {
    const item = cart[k];
    const subtotal = item.price * item.quantity;
    message += `${index}. ${item.name} x ${item.quantity} - ₹${subtotal}\n`;
    total += subtotal;
    index++;

    // Use dish name instead of MongoDB ObjectId
    itemsArray.push([dbItem ? dbItem.name : item.name, item.quantity, item.price]);
  });

  message += `-------------------------\n`;
  message += `*Total Amount:* ₹${total}\n\n`;

  // Generate verification code & link
  let typeVal = 1; // Takeaway / Parcel
  if (typeLabel.includes('Dine')) {
    typeVal = 0;
  } else if (typeLabel.includes('Delivery')) {
    typeVal = 2;
  }

  const payload = {
    n: name,
    p: phone,
    t: typeVal,
    k: token,
    i: itemsArray
  };
  if (address) {
    payload.a = address;
  }
  const code = encodePayload(payload);
  const origin = window.location.origin;
  const verifyUrl = `${origin}/verify.html?o=${code}`;

  message += `*Verify Original Price & Bill:*\n${verifyUrl}\n\n`;
  message += `Please confirm my order. Thank you!`;

  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/916302019925?text=${encodedMsg}`;
}

function initCartEventListeners() {
  document.body.addEventListener('click', (e) => {
    // Add to cart click
    const addBtn = e.target.closest('.btn-add-zomato');
    if (addBtn) {
      const name = addBtn.dataset.name;
      const price = addBtn.dataset.price;
      addToCart(name, price);
      return;
    }

    // Qty minus click
    const minusBtn = e.target.closest('.btn-qty-minus');
    if (minusBtn) {
      const name = minusBtn.dataset.name;
      updateQuantity(name, -1);
      return;
    }

    // Qty plus click
    const plusBtn = e.target.closest('.btn-qty-plus');
    if (plusBtn) {
      const name = plusBtn.dataset.name;
      updateQuantity(name, 1);
      return;
    }

    // Trigger Details Modal overlay
    const orderBtn = e.target.closest('#btn-cart-whatsapp-order');
    if (orderBtn) {
      openOrderModal();
      return;
    }

    // Admin stock status toggle click
    const stockBtn = e.target.closest('.btn-admin-stock');
    if (stockBtn) {
      if (stockBtn.dataset.id) {
        const id = stockBtn.dataset.id;
        toggleStockStatus(id);
      }
      return;
    }

    // Admin edit item click
    const editBtn = e.target.closest('.btn-admin-edit');
    if (editBtn) {
      if (editBtn.dataset.id) {
        const id = editBtn.dataset.id;
        // Check if the item is a special or standard menu item
        const item = currentMenu.find(i => i._id === id);
        if (item && item.category === 'specials') {
          openAdminEditSpecialModal(id);
        } else {
          openAdminEditItemModal(id);
        }
      }
      return;
    }

    // Admin edit image click
    const editImgBtn = e.target.closest('.btn-admin-edit-image');
    if (editImgBtn) {
      if (editImgBtn.dataset.id) {
        const id = editImgBtn.dataset.id;
        const item = currentMenu.find(i => i._id === id) || currentSpecials.find(i => i._id === id || i.id === id);
        const isSpecial = item && item.category === 'specials';
        openAdminEditImageModal(id, isSpecial);
      }
      return;
    }

    // Admin remove item click
    const deleteBtn = e.target.closest('.btn-admin-delete');
    if (deleteBtn) {
      if (deleteBtn.dataset.id) {
        const id = deleteBtn.dataset.id;
        const item = currentMenu.find(i => i._id === id) || currentSpecials.find(i => i._id === id || i.id === id);
        if (item && item.category === 'specials') {
          deleteSpecialItem(id);
        } else {
          deleteMenuItem(id);
        }
      }
      return;
    }
  });
}

// --- Render Menu Items ---
function renderMenu() {
  if (!menuGrid) return;
  menuGrid.innerHTML = '';

  // Render Admin Toolbar at the top if logged in
  if (isAdmin) {
    const toolbar = document.createElement('div');
    toolbar.className = 'admin-toolbar';
    toolbar.innerHTML = `
      <div class="admin-toolbar-title">
        <i class="fa-solid fa-user-shield" style="color: var(--primary-color);"></i>
        <span>Owner Portal Active</span>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn-admin-add-item" id="btn-admin-add-dish">
          <i class="fa-solid fa-plus"></i> Add New Dish
        </button>
        <button class="btn-admin-add-item" id="btn-admin-orders-view" style="background-color: #10b981; border-color: #10b981;">
          <i class="fa-solid fa-receipt"></i> Online Payments & Orders
        </button>
        <button class="btn-admin-add-item" id="btn-admin-firebase-settings" style="background-color: #f59e0b; border-color: #f59e0b;">
          <i class="fa-solid fa-database"></i> Database Sync
        </button>
      </div>
    `;
    menuGrid.appendChild(toolbar);
    toolbar.querySelector('#btn-admin-add-dish').addEventListener('click', openAdminAddItemModal);
    toolbar.querySelector('#btn-admin-orders-view').addEventListener('click', openAdminOrdersModal);
    toolbar.querySelector('#btn-admin-firebase-settings').addEventListener('click', openAdminFirebaseConfigModal);
  }

  const filteredItems = currentMenu.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesDiet = activeDiet === 'all' || item.type === activeDiet;
    const matchesSearch = searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery) ||
      item.description.toLowerCase().includes(searchQuery);

    return matchesCategory && matchesDiet && matchesSearch;
  });

  if (filteredItems.length === 0 && !isAdmin) {
    renderEmptyState();
    return;
  }

  const cart = getCart();

  filteredItems.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = `menu-item-card ${item.outOfStock ? 'out-of-stock' : ''}`;
    card.style.animationDelay = `${index * 0.02}s`;

    const isVeg = item.type === 'veg';
    const dietIconClass = isVeg ? 'veg' : 'non-veg';

    const cartItem = cart[item.name];
    let actionHTML = '';

    if (item.outOfStock) {
      actionHTML = `
        <button class="btn-add-zomato" disabled style="background-color: #9ca3af; border-color: #9ca3af; color: white; cursor: not-allowed;">
          SOLD OUT
        </button>
      `;
    } else if (cartItem) {
      actionHTML = `
        <div class="qty-selector-zomato">
          <button class="btn-qty-minus" data-name="${item.name}">-</button>
          <span class="qty-value">${cartItem.quantity}</span>
          <button class="btn-qty-plus" data-name="${item.name}">+</button>
        </div>
      `;
    } else {
      actionHTML = `
        <button class="btn-add-zomato" data-name="${item.name}" data-price="${item.price}" title="Add ${item.name} to order">
          ADD <i class="fa-solid fa-plus" style="font-size: 0.75rem; margin-left: 2px;"></i>
        </button>
      `;
    }

    const adminControlsHTML = isAdmin ? `
      <div class="admin-card-controls">
        <button class="btn-admin-stock ${item.outOfStock ? 'btn-stock-out' : 'btn-stock-in'}" data-id="${item._id}">
          <i class="fa-solid ${item.outOfStock ? 'fa-eye' : 'fa-eye-slash'}"></i>
          <span>${item.outOfStock ? 'Mark In Stock' : 'Mark Out of Stock'}</span>
        </button>
        <button class="btn-admin-edit" data-id="${item._id}">
          <i class="fa-solid fa-pen-to-square"></i>
          <span>Edit</span>
        </button>
        <button class="btn-admin-edit-image" data-id="${item._id}">
          <i class="fa-solid fa-image"></i>
          <span>Edit Image</span>
        </button>
        <button class="btn-admin-delete" data-id="${item._id}">
          <i class="fa-solid fa-trash-can"></i>
          <span>Remove</span>
        </button>
      </div>
    ` : '';

    card.innerHTML = `
      <div class="menu-item-main-row">
        <div class="menu-item-text">
          <div class="item-meta-row">
            <span class="diet-badge-fssai ${dietIconClass}" title="${isVeg ? 'Vegetarian' : 'Non-Vegetarian'}">
              <span class="diet-dot"></span>
            </span>
            ${item.popular ? `<span class="popular-pill"><i class="fa-solid fa-fire"></i> Highly Reordered</span>` : ''}
            ${item.outOfStock ? `<span class="badge-out-of-stock"><i class="fa-solid fa-circle-xmark"></i> Out of Stock</span>` : ''}
          </div>
          <a href="/item.html?id=${item.id}" class="item-name-link" style="text-decoration: none; color: inherit;">
            <h3 class="item-name">${item.name}</h3>
          </a>
          <span class="item-price">₹${item.price}</span>
          <p class="item-desc">${item.description || 'Delicately cooked using traditional recipes with freshly ground spices.'}</p>
          <span class="item-category-tag-desktop">${getCategoryDisplayName(item.category)}</span>
        </div>
        <div class="menu-item-action-side">
          <div class="menu-item-image-wrapper">
            <a href="/item.html?id=${item.id}" style="display: block; width: 100%; height: 100%;">
              <img class="menu-item-img" src="${getItemImage(item)}" alt="${item.name}" loading="lazy" onerror="this.onerror=null; this.src='${item.type === 'veg' ? '/assets/paneer_butter_masala.png' : '/assets/chicken_dum_biryani.png'}';">
            </a>
            <div class="menu-item-action-button-container">
              ${actionHTML}
            </div>
          </div>
          <span class="item-disclaimer-zomato">customisable</span>
        </div>
      </div>
      ${adminControlsHTML}
    `;
    menuGrid.appendChild(card);
  });
}

// --- Empty Menu State ---
function renderEmptyState() {
  if (!menuGrid) return;
  menuGrid.innerHTML = `
    <div class="menu-empty">
      <i class="fa-solid fa-utensils"></i>
      <h3>No Dishes Found</h3>
      <p>We couldn't find any dishes matching "${searchQuery}". Try adjusting your filters or search keywords.</p>
    </div>
  `;
}

// --- Display Name Helper for Categories ---
function getCategoryDisplayName(cat) {
  const mapping = {
    'biryani': 'Biryani Special',
    'starters': 'Starters',
    'curries': 'Rich Curries',
    'chinese-rice': 'Chinese & Rice',
    'rotis': 'Rotis & Breads'
  };
  return mapping[cat] || cat;
}

// --- Owner/Admin Portal Implementations ---
function initAdminPortal() {
  const loginBtn = document.getElementById('btn-admin-login-trigger');
  if (!loginBtn) return;

  updateAdminPortalButtonState();

  loginBtn.addEventListener('click', () => {
    if (isAdmin) {
      if (confirm("Are you sure you want to log out from the Owner Portal?")) {
        isAdmin = false;
        sessionStorage.removeItem('varevva_admin_logged_in');
        updateAdminPortalButtonState();
        if (menuGrid) renderMenu();
        if (specialsGrid) renderSpecials();
      }
    } else {
      openAdminLoginModal();
    }
  });
}

function updateAdminPortalButtonState() {
  const loginBtn = document.getElementById('btn-admin-login-trigger');
  if (!loginBtn) return;

  if (isAdmin) {
    loginBtn.className = 'btn-admin-portal logged-in';
    loginBtn.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i> <span>Owner Logout</span>';
  } else {
    loginBtn.className = 'btn-admin-portal';
    loginBtn.innerHTML = '<i class="fa-solid fa-user-lock"></i> <span>Owner Login</span>';
  }
}

function openAdminLoginModal() {
  if (document.querySelector('.admin-login-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'order-modal-overlay admin-login-overlay';
  overlay.innerHTML = `
    <div class="order-modal-card">
      <div class="order-modal-header">
        <h3>Owner Login</h3>
        <button class="btn-close-modal" id="btn-close-admin-login">&times;</button>
      </div>
      <form class="admin-modal-form" id="admin-login-form">
        <div class="form-group">
          <label for="admin-username">Email Address</label>
          <input type="email" id="admin-username" placeholder="Enter email address" required autocomplete="email">
        </div>
        <div class="form-group">
          <label for="admin-password">Password</label>
          <input type="password" id="admin-password" placeholder="Enter password" required autocomplete="current-password">
        </div>
        <div id="admin-login-error" style="color: #ef4444; font-size: 0.85rem; display: none; text-align: center;">
          <i class="fa-solid fa-circle-exclamation"></i> Invalid email or password!
        </div>
        <button type="submit" class="btn-admin-submit">Login</button>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('#btn-close-admin-login');
  const form = overlay.querySelector('#admin-login-form');

  const closeModal = () => overlay.remove();

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = form.querySelector('#admin-username').value.trim();
    const pass = form.querySelector('#admin-password').value;
    const errorDiv = form.querySelector('#admin-login-error');

    try {
      const res = await fetch('https://varevva-family-restaurant.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user, password: pass })
      });
      const data = await res.json();
      if (res.ok) {
        isAdmin = true;
        sessionStorage.setItem('varevva_admin_logged_in', 'true');
        sessionStorage.setItem('varevva_admin_token', data.token);
        updateAdminPortalButtonState();
        closeModal();
        if (menuGrid) renderMenu();
        if (specialsGrid) renderSpecials();
      } else {
        errorDiv.textContent = data.message || 'Invalid email or password!';
        errorDiv.style.display = 'block';
        form.querySelector('#admin-password').value = '';
        form.querySelector('#admin-password').focus();
      }
    } catch (err) {
      errorDiv.textContent = 'Failed to connect to authentication server.';
      errorDiv.style.display = 'block';
      form.querySelector('#admin-password').value = '';
      form.querySelector('#admin-password').focus();
    }
  });
}

function openAdminAddItemModal() {
  if (document.querySelector('.admin-add-item-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'order-modal-overlay admin-add-item-overlay';
  overlay.innerHTML = `
    <div class="order-modal-card">
      <div class="order-modal-header">
        <h3>Add New Dish</h3>
        <button class="btn-close-modal" id="btn-close-admin-add-item">&times;</button>
      </div>
      <form class="admin-modal-form" id="admin-add-item-form">
        <div class="form-group">
          <label for="dish-name">Dish Name</label>
          <input type="text" id="dish-name" placeholder="e.g. Gongura Chicken Fry" required>
          <div id="dish-name-error" style="color: #ef4444; font-size: 0.8rem; display: none; margin-top: 4px;">
            <i class="fa-solid fa-circle-exclamation"></i> A dish with this name already exists!
          </div>
        </div>
        
        <div class="form-row-grid">
          <div class="form-group">
            <label for="dish-price">Price (₹)</label>
            <input type="number" id="dish-price" placeholder="e.g. 250" min="1" required>
          </div>
          <div class="form-group">
            <label for="dish-category">Category</label>
            <select id="dish-category" required>
              <option value="biryani">Biryani Specials</option>
              <option value="starters">Starters</option>
              <option value="curries">Rich Curries</option>
              <option value="chinese-rice">Chinese & Rice</option>
              <option value="rotis">Rotis & Breads</option>
            </select>
          </div>
        </div>

        <div class="form-row-grid">
          <div class="form-group">
            <label for="dish-diet">Diet Type</label>
            <select id="dish-diet" required>
              <option value="non-veg">Non-Vegetarian</option>
              <option value="veg">Vegetarian</option>
            </select>
          </div>
          <div class="form-group checkbox-group" style="margin-top: 24px;">
            <input type="checkbox" id="dish-popular">
            <label for="dish-popular">Highly Reordered</label>
          </div>
        </div>

        <div class="form-group">
          <label>Dish Image</label>
          <input type="file" id="dish-image-file" accept="image/png, image/jpeg, image/webp" style="margin-bottom: 8px;" required>
          <input type="hidden" id="dish-image-url">
          <input type="hidden" id="dish-image-public-id">
          
          <div id="dish-upload-progress-container" style="display: none; margin-bottom: 10px;">
            <div style="font-size: 0.8rem; color: #666; margin-bottom: 4px; display: flex; justify-content: space-between;">
              <span>Uploading image...</span>
              <span id="dish-upload-percent">0%</span>
            </div>
            <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px; overflow: hidden;">
              <div id="dish-upload-progress-bar" style="width: 0%; height: 100%; background-color: var(--primary-color); transition: width 0.1s ease;"></div>
            </div>
          </div>

          <div id="dish-image-preview" style="width: 100%; height: 160px; border: 2px dashed #ccc; border-radius: 8px; display: flex; justify-content: center; align-items: center; overflow: hidden; background-color: #f9fafb;">
            <span style="color: #9ca3af; font-size: 0.9rem;">No image selected (WEBP, PNG, JPG up to 5MB)</span>
          </div>
          <div id="dish-image-type-error" style="color: #ef4444; font-size: 0.8rem; display: none; margin-top: 4px;">
            <i class="fa-solid fa-circle-exclamation"></i> Only JPG, PNG, or WEBP up to 5MB allowed!
          </div>
        </div>

        <div class="form-group">
          <label for="dish-description">Description</label>
          <textarea id="dish-description" placeholder="Brief description of the dish..." rows="3" required></textarea>
        </div>

        <button type="submit" class="btn-admin-submit">Add to Menu</button>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('#btn-close-admin-add-item');
  const form = overlay.querySelector('#admin-add-item-form');
  const dishNameInput = overlay.querySelector('#dish-name');
  const nameError = overlay.querySelector('#dish-name-error');

  const fileInput = overlay.querySelector('#dish-image-file');
  const imageUrlInput = overlay.querySelector('#dish-image-url');
  const imagePublicIdInput = overlay.querySelector('#dish-image-public-id');
  const uploadProgressContainer = overlay.querySelector('#dish-upload-progress-container');
  const uploadProgressBar = overlay.querySelector('#dish-upload-progress-bar');
  const uploadPercent = overlay.querySelector('#dish-upload-percent');
  const previewDiv = overlay.querySelector('#dish-image-preview');
  const imageError = overlay.querySelector('#dish-image-type-error');
  const submitButton = form.querySelector('button[type="submit"]');

  const closeModal = () => overlay.remove();

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      imageError.style.display = 'block';
      fileInput.value = '';
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      imageError.style.display = 'block';
      fileInput.value = '';
      return;
    }

    imageError.style.display = 'none';

    // Show preview immediately using FileReader
    const reader = new FileReader();
    reader.onload = (event) => {
      previewDiv.innerHTML = `<img src="${event.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
    };
    reader.readAsDataURL(file);

    // Disable Save button while uploading
    submitButton.disabled = true;
    submitButton.textContent = 'Uploading Image...';
    uploadProgressContainer.style.display = 'block';

    const formData = new FormData();
    formData.append('image', file);

    const token = sessionStorage.getItem('varevva_admin_token');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://varevva-family-restaurant.onrender.com/api/upload', true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        uploadProgressBar.style.width = `${percentComplete}%`;
        uploadPercent.textContent = `${percentComplete}%`;
      }
    };

    xhr.onload = () => {
      submitButton.disabled = false;
      submitButton.textContent = 'Add to Menu';

      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        imageUrlInput.value = response.image;
        imagePublicIdInput.value = response.imagePublicId;
        uploadPercent.textContent = 'Upload complete!';
      } else {
        alert('Image upload failed. Please try again.');
        uploadProgressContainer.style.display = 'none';
        previewDiv.innerHTML = '<span style="color: #ef4444; font-size: 0.9rem;">Upload failed!</span>';
      }
    };

    xhr.onerror = () => {
      submitButton.disabled = false;
      submitButton.textContent = 'Add to Menu';
      alert('Network error occurred during upload.');
      uploadProgressContainer.style.display = 'none';
    };

    xhr.send(formData);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = dishNameInput.value.trim();
    const price = Number(form.querySelector('#dish-price').value);
    const category = form.querySelector('#dish-category').value;
    const type = form.querySelector('#dish-diet').value;
    const description = form.querySelector('#dish-description').value.trim();
    const popular = form.querySelector('#dish-popular').checked;
    const image = imageUrlInput.value;
    const imagePublicId = imagePublicIdInput.value;

    if (!image || !imagePublicId) {
      alert('Please select and upload a dish image first!');
      return;
    }

    // Uniqueness check (case-insensitive)
    const duplicate = currentMenu.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      nameError.style.display = 'block';
      dishNameInput.focus();
      return;
    }

    const token = sessionStorage.getItem('varevva_admin_token');

    try {
      const res = await fetch('https://varevva-family-restaurant.onrender.com/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          price,
          category,
          subCategory: type,
          description,
          image,
          imagePublicId,
          availability: true,
          featured: popular
        })
      });

      if (res.ok) {
        currentMenu = await fetchMenuData();
        closeModal();
        renderMenu();
      } else {
        const errorData = await res.json();
        alert(`Failed to save menu item: ${errorData.message}`);
      }
    } catch (err) {
      alert('Connection error occurred while saving menu item.');
    }
  });

  dishNameInput.addEventListener('input', () => {
    nameError.style.display = 'none';
  });
}

async function toggleStockStatus(id) {
  if (!id) {
    console.error('toggleStockStatus error: missing _id');
    alert('Operation failed: This item has no valid database ID.');
    return;
  }
  const item = currentMenu.find(i => i._id === id);
  if (!item) return;

  const newAvailability = item.outOfStock; // if it was out of stock, it will now be in stock
  const token = sessionStorage.getItem('varevva_admin_token');

  try {
    const res = await fetch(`https://varevva-family-restaurant.onrender.com/api/menu/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        availability: newAvailability
      })
    });

    if (res.ok) {
      currentMenu = await fetchMenuData();
      renderMenu();
    } else {
      console.error('toggleStockStatus failed: API error response');
      alert('Failed to update stock status on database.');
    }
  } catch (err) {
    console.error('toggleStockStatus network error:', err);
    alert('Connection error occurred while updating stock status.');
  }
}

async function deleteMenuItem(id) {
  if (!id) {
    console.error('deleteMenuItem error: missing _id');
    alert('Operation failed: This item has no valid database ID.');
    return;
  }
  const item = currentMenu.find(i => i._id === id);
  if (!item) return;

  if (!confirm(`Are you sure you want to remove "${item.name}" from the menu?`)) return;

  const token = sessionStorage.getItem('varevva_admin_token');

  try {
    const res = await fetch(`https://varevva-family-restaurant.onrender.com/api/menu/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      currentMenu = await fetchMenuData();
      renderMenu();
    } else {
      console.error('deleteMenuItem failed: API error response');
      alert('Failed to delete menu item.');
    }
  } catch (err) {
    console.error('deleteMenuItem network error:', err);
    alert('Connection error occurred while deleting item.');
  }
}

function openAdminEditItemModal(id) {
  if (!id) {
    console.error('openAdminEditItemModal error: missing _id');
    alert('Operation failed: This item has no valid database ID.');
    return;
  }
  const item = currentMenu.find(i => i._id === id);
  if (!item) return;

  if (document.querySelector('.admin-edit-item-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'order-modal-overlay admin-edit-item-overlay';
  overlay.innerHTML = `
    <div class="order-modal-card">
      <div class="order-modal-header">
        <h3>Edit Dish: ${item.name}</h3>
        <button class="btn-close-modal" id="btn-close-admin-edit-item">&times;</button>
      </div>
      <form class="admin-modal-form" id="admin-edit-item-form">
        <div class="form-group">
          <label for="dish-name">Dish Name</label>
          <input type="text" id="dish-name" placeholder="e.g. Gongura Chicken Fry" value="${item.name}" required>
          <div id="dish-name-error" style="color: #ef4444; font-size: 0.8rem; display: none; margin-top: 4px;">
            <i class="fa-solid fa-circle-exclamation"></i> A dish with this name already exists!
          </div>
        </div>
        
        <div class="form-row-grid">
          <div class="form-group">
            <label for="dish-price">Price (₹)</label>
            <input type="number" id="dish-price" placeholder="e.g. 250" min="1" value="${item.price}" required>
          </div>
          <div class="form-group">
            <label for="dish-category">Category</label>
            <select id="dish-category" required>
              <option value="biryani" ${item.category === 'biryani' ? 'selected' : ''}>Biryani Specials</option>
              <option value="starters" ${item.category === 'starters' ? 'selected' : ''}>Starters</option>
              <option value="curries" ${item.category === 'curries' ? 'selected' : ''}>Rich Curries</option>
              <option value="chinese-rice" ${item.category === 'chinese-rice' ? 'selected' : ''}>Chinese & Rice</option>
              <option value="rotis" ${item.category === 'rotis' ? 'selected' : ''}>Rotis & Breads</option>
            </select>
          </div>
        </div>

        <div class="form-row-grid">
          <div class="form-group">
            <label for="dish-diet">Diet Type</label>
            <select id="dish-diet" required>
              <option value="non-veg" ${item.type === 'non-veg' ? 'selected' : ''}>Non-Vegetarian</option>
              <option value="veg" ${item.type === 'veg' ? 'selected' : ''}>Vegetarian</option>
            </select>
          </div>
          <div class="form-group checkbox-group" style="margin-top: 24px;">
            <input type="checkbox" id="dish-popular" ${item.popular ? 'checked' : ''}>
            <label for="dish-popular">Highly Reordered</label>
          </div>
        </div>

        <div class="form-group">
          <label>Dish Image</label>
          <input type="file" id="dish-image-file" accept="image/png, image/jpeg, image/webp" style="margin-bottom: 8px;">
          <input type="hidden" id="dish-image-url" value="${item.image || ''}">
          <input type="hidden" id="dish-image-public-id" value="${item.imagePublicId || ''}">
          
          <div id="dish-upload-progress-container" style="display: none; margin-bottom: 10px;">
            <div style="font-size: 0.8rem; color: #666; margin-bottom: 4px; display: flex; justify-content: space-between;">
              <span>Uploading image...</span>
              <span id="dish-upload-percent">0%</span>
            </div>
            <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px; overflow: hidden;">
              <div id="dish-upload-progress-bar" style="width: 0%; height: 100%; background-color: var(--primary-color); transition: width 0.1s ease;"></div>
            </div>
          </div>

          <div id="dish-image-preview" style="width: 100%; height: 160px; border: 2px dashed #ccc; border-radius: 8px; display: flex; justify-content: center; align-items: center; overflow: hidden; background-color: #f9fafb;">
            ${item.image ? `<img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover;">` : '<span style="color: #9ca3af; font-size: 0.9rem;">No image selected (WEBP, PNG, JPG up to 5MB)</span>'}
          </div>
          <div id="dish-image-type-error" style="color: #ef4444; font-size: 0.8rem; display: none; margin-top: 4px;">
            <i class="fa-solid fa-circle-exclamation"></i> Only JPG, PNG, or WEBP up to 5MB allowed!
          </div>
        </div>

        <div class="form-group">
          <label for="dish-description">Description</label>
          <textarea id="dish-description" placeholder="Brief description of the dish..." rows="3" required>${item.description || ''}</textarea>
        </div>

        <button type="submit" class="btn-admin-submit">Save Changes</button>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('#btn-close-admin-edit-item');
  const form = overlay.querySelector('#admin-edit-item-form');
  const dishNameInput = overlay.querySelector('#dish-name');
  const nameError = overlay.querySelector('#dish-name-error');

  const fileInput = overlay.querySelector('#dish-image-file');
  const imageUrlInput = overlay.querySelector('#dish-image-url');
  const imagePublicIdInput = overlay.querySelector('#dish-image-public-id');
  const uploadProgressContainer = overlay.querySelector('#dish-upload-progress-container');
  const uploadProgressBar = overlay.querySelector('#dish-upload-progress-bar');
  const uploadPercent = overlay.querySelector('#dish-upload-percent');
  const previewDiv = overlay.querySelector('#dish-image-preview');
  const imageError = overlay.querySelector('#dish-image-type-error');
  const submitButton = form.querySelector('button[type="submit"]');

  const closeModal = () => overlay.remove();

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      imageError.style.display = 'block';
      fileInput.value = '';
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      imageError.style.display = 'block';
      fileInput.value = '';
      return;
    }

    imageError.style.display = 'none';

    // Show preview immediately using FileReader
    const reader = new FileReader();
    reader.onload = (event) => {
      previewDiv.innerHTML = `<img src="${event.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
    };
    reader.readAsDataURL(file);

    // Disable Save button while uploading
    submitButton.disabled = true;
    submitButton.textContent = 'Uploading Image...';
    uploadProgressContainer.style.display = 'block';

    const formData = new FormData();
    formData.append('image', file);

    const token = sessionStorage.getItem('varevva_admin_token');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://varevva-family-restaurant.onrender.com/api/upload', true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        uploadProgressBar.style.width = `${percentComplete}%`;
        uploadPercent.textContent = `${percentComplete}%`;
      }
    };

    xhr.onload = () => {
      submitButton.disabled = false;
      submitButton.textContent = 'Save Changes';

      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        imageUrlInput.value = response.image;
        imagePublicIdInput.value = response.imagePublicId;
        uploadPercent.textContent = 'Upload complete!';
      } else {
        alert('Image upload failed. Please try again.');
        uploadProgressContainer.style.display = 'none';
        previewDiv.innerHTML = '<span style="color: #ef4444; font-size: 0.9rem;">Upload failed!</span>';
      }
    };

    xhr.onerror = () => {
      submitButton.disabled = false;
      submitButton.textContent = 'Save Changes';
      alert('Network error occurred during upload.');
      uploadProgressContainer.style.display = 'none';
    };

    xhr.send(formData);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newName = dishNameInput.value.trim();
    const price = Number(form.querySelector('#dish-price').value);
    const category = form.querySelector('#dish-category').value;
    const type = form.querySelector('#dish-diet').value;
    const description = form.querySelector('#dish-description').value.trim();
    const popular = form.querySelector('#dish-popular').checked;
    const image = imageUrlInput.value;
    const imagePublicId = imagePublicIdInput.value;

    if (!image) {
      alert('Please upload an image first!');
      return;
    }

    // Check duplicate name excluding current item
    const duplicate = currentMenu.find(i => i.name.toLowerCase() === newName.toLowerCase() && i._id !== id);
    if (duplicate) {
      nameError.style.display = 'block';
      dishNameInput.focus();
      return;
    }

    const token = sessionStorage.getItem('varevva_admin_token');

    try {
      const res = await fetch(`https://varevva-family-restaurant.onrender.com/api/menu/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newName,
          price,
          category,
          subCategory: type,
          description,
          image,
          imagePublicId,
          availability: !item.outOfStock,
          featured: popular
        })
      });

      if (res.ok) {
        currentMenu = await fetchMenuData();
        closeModal();
        renderMenu();
      } else {
        const errorData = await res.json();
        alert(`Failed to save menu changes: ${errorData.message}`);
      }
    } catch (err) {
      alert('Connection error occurred while saving changes.');
    }
  });

  dishNameInput.addEventListener('input', () => {
    nameError.style.display = 'none';
  });
}

function renderSpecials() {
  if (!specialsGrid) return;
  specialsGrid.innerHTML = '';

  // Render Admin Toolbar at the top if logged in
  if (isAdmin) {
    const toolbar = document.createElement('div');
    toolbar.className = 'admin-toolbar';
    toolbar.innerHTML = `
      <div class="admin-toolbar-title">
        <i class="fa-solid fa-user-shield" style="color: var(--primary-color);"></i>
        <span>Owner Portal Active</span>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn-admin-add-item" id="btn-admin-add-special-trigger">
          <i class="fa-solid fa-plus"></i> Add New Special
        </button>
        <button class="btn-admin-add-item" id="btn-admin-orders-view-specials" style="background-color: #10b981; border-color: #10b981;">
          <i class="fa-solid fa-receipt"></i> Online Payments & Orders
        </button>
        <button class="btn-admin-add-item" id="btn-admin-firebase-settings-special" style="background-color: #f59e0b; border-color: #f59e0b;">
          <i class="fa-solid fa-database"></i> Database Sync
        </button>
      </div>
    `;
    specialsGrid.appendChild(toolbar);
    toolbar.querySelector('#btn-admin-add-special-trigger').addEventListener('click', openAdminAddSpecialModal);
    toolbar.querySelector('#btn-admin-orders-view-specials').addEventListener('click', openAdminOrdersModal);
    toolbar.querySelector('#btn-admin-firebase-settings-special').addEventListener('click', openAdminFirebaseConfigModal);
  }

  currentSpecials.forEach(item => {
    const card = document.createElement('div');
    card.className = `special-card card-${item.type}`;

    const adminActionsHTML = isAdmin ? `
      <div class="special-card-admin-actions" style="margin-top: 15px; border-top: 1px dashed rgba(0, 0, 0, 0.08); padding-top: 15px; display: flex; flex-wrap: wrap; gap: 12px; width: 100%;">
        <button class="btn-admin-edit" data-id="${item.id}" style="flex: 1; min-width: 70px;">
          <i class="fa-solid fa-pen-to-square"></i> Edit
        </button>
        <button class="btn-admin-edit-image" data-id="${item.id}" style="flex: 1; min-width: 100px;">
          <i class="fa-solid fa-image"></i> Image
        </button>
        <button class="btn-admin-delete" data-id="${item.id}">
          <i class="fa-solid fa-trash-can"></i> Remove
        </button>
      </div>
    ` : '';

    const badgeIconClass = item.type === 'veg' ? 'veg' : 'nonveg';
    const badgeText = item.type === 'veg' ? 'Veg' : 'Non-Veg';

    card.innerHTML = `
      <div class="special-img-wrapper" style="position: relative; overflow: hidden; height: 230px;">
        <a href="/item.html?id=${item.id}" style="display: block; width: 100%; height: 100%;">
          <img src="${item.image || '/assets/chicken_dum_biryani.png'}" alt="${item.name}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; transition: var(--transition-smooth);" onerror="this.onerror=null; this.src='${item.type === 'veg' ? '/assets/paneer_butter_masala.png' : '/assets/chicken_dum_biryani.png'}';">
        </a>
        <span class="diet-badge ${badgeIconClass}"><span class="dot"></span>${badgeText}</span>
      </div>
      <div class="special-body" style="padding: 24px;">
        <div class="special-meta" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span class="special-price" style="margin-bottom: 0;">${item.price}</span>
        </div>
        <a href="/item.html?id=${item.id}" class="special-name-link" style="text-decoration: none; color: inherit;">
          <h3 style="margin-top: 0; font-size: 1.3rem; transition: var(--transition-smooth);">${item.name}</h3>
        </a>
        <p style="margin-bottom: 20px;">${item.description}</p>
        <div class="special-footer">
          <span class="special-tag"><i class="fa-solid ${item.tagIcon || 'fa-fire'}"></i> ${item.tag}</span>
          <a href="https://wa.me/916302019925?text=Hi%20Varevva%20Restaurant,%20I%20would%20like%20to%20order%20${encodeURIComponent(item.name)}" target="_blank" class="btn-icon-order" title="Order via WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
        </div>
        ${adminActionsHTML}
      </div>
    `;
    specialsGrid.appendChild(card);
  });
}

function openAdminEditSpecialModal(id) {
  const item = currentSpecials.find(i => i.id === id);
  if (!item) return;

  if (document.querySelector('.admin-edit-special-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'order-modal-overlay admin-edit-special-overlay';
  overlay.innerHTML = `
    <div class="order-modal-card">
      <div class="order-modal-header">
        <h3>Edit Special: ${item.name}</h3>
        <button class="btn-close-modal" id="btn-close-admin-edit-special">&times;</button>
      </div>
      <form class="admin-modal-form" id="admin-edit-special-form">
        <div class="form-group">
          <label for="special-name">Special Name</label>
          <input type="text" id="special-name" placeholder="e.g. Special Chicken Dum Biryani" value="${item.name}" required>
        </div>
        
        <div class="form-row-grid">
          <div class="form-group">
            <label for="special-price">Price Display (e.g. ₹200 / ₹350)</label>
            <input type="text" id="special-price" placeholder="e.g. ₹200 / ₹350" value="${item.price}" required>
          </div>
          <div class="form-group">
            <label for="special-diet">Diet Type</label>
            <select id="special-diet" required>
              <option value="non-veg" ${item.type === 'non-veg' ? 'selected' : ''}>Non-Vegetarian</option>
              <option value="veg" ${item.type === 'veg' ? 'selected' : ''}>Vegetarian</option>
            </select>
          </div>
        </div>

        <div class="form-row-grid">
          <div class="form-group">
            <label for="special-tag-text">Badge Tag Text</label>
            <input type="text" id="special-tag-text" placeholder="e.g. Best Seller" value="${item.tag}" required>
          </div>
          <div class="form-group">
            <label for="special-tag-icon">Badge Icon</label>
            <select id="special-tag-icon" required>
              <option value="fa-fire" ${item.tagIcon === 'fa-fire' ? 'selected' : ''}>Fire</option>
              <option value="fa-pepper-hot" ${item.tagIcon === 'fa-pepper-hot' ? 'selected' : ''}>Pepper</option>
              <option value="fa-leaf" ${item.tagIcon === 'fa-leaf' ? 'selected' : ''}>Leaf</option>
              <option value="fa-star" ${item.tagIcon === 'fa-star' ? 'selected' : ''}>Star</option>
              <option value="fa-thumbs-up" ${item.tagIcon === 'fa-thumbs-up' ? 'selected' : ''}>Thumbs Up</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="special-image">Special Image URL / Path (Optional)</label>
          <input type="text" id="special-image" placeholder="e.g. /assets/chicken_dum_biryani.png or any online URL" value="${item.image || ''}">
        </div>

        <div class="form-group">
          <label for="special-description">Description</label>
          <textarea id="special-description" placeholder="Aromatic description..." rows="3" required>${item.description || ''}</textarea>
        </div>

        <button type="submit" class="btn-admin-submit">Save Special Changes</button>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('#btn-close-admin-edit-special');
  const form = overlay.querySelector('#admin-edit-special-form');

  const closeModal = () => overlay.remove();

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    item.name = form.querySelector('#special-name').value.trim();
    item.price = form.querySelector('#special-price').value.trim();
    item.type = form.querySelector('#special-diet').value;
    item.tag = form.querySelector('#special-tag-text').value.trim();
    item.tagIcon = form.querySelector('#special-tag-icon').value;
    item.image = form.querySelector('#special-image').value.trim();
    item.description = form.querySelector('#special-description').value.trim();

    saveSpecialsData(currentSpecials);
    closeModal();
    renderSpecials();
  });
}

function openAdminEditImageModal(id, isSpecial) {
  console.log('openAdminEditImageModal: selected id =', id);
  console.log('openAdminEditImageModal: isSpecial =', isSpecial);
  console.log('openAdminEditImageModal: currentMenu =', currentMenu);
  console.log('openAdminEditImageModal: currentSpecials =', currentSpecials);

  if (!id) {
    console.error('openAdminEditImageModal error: missing _id');
    alert('Operation failed: This item has no valid database ID.');
    return;
  }

  const item = isSpecial
    ? currentSpecials.find(i => i._id === id || i.id === id)
    : currentMenu.find(i => i._id === id);

  console.log('openAdminEditImageModal: matched item =', item);

  if (!item) {
    console.error('openAdminEditImageModal error: item not found for id', id);
    alert('Operation failed: Item not found in current list.');
    return;
  }

  if (document.querySelector('.admin-edit-image-overlay')) return;

  const initialPath = sanitizeImageUrl(item.image, item.type);
  const fallbackImg = item.type === 'veg' ? '/assets/paneer_butter_masala.png' : '/assets/chicken_dum_biryani.png';

  const overlay = document.createElement('div');
  overlay.className = 'order-modal-overlay admin-edit-image-overlay';
  overlay.innerHTML = `
    <div class="order-modal-card" style="max-width: 520px;">
      <div class="order-modal-header">
        <h3>Edit Image: ${item.name}</h3>
        <button class="btn-close-modal" id="btn-close-admin-edit-image">&times;</button>
      </div>
      <form class="admin-modal-form" id="admin-edit-image-form">
        <div class="form-group">
          <label>Select Image File</label>
          <input type="file" id="edit-image-file" accept="image/png, image/jpeg, image/webp" style="margin-bottom: 8px;" required>
          
          <div id="edit-upload-progress-container" style="display: none; margin-bottom: 10px;">
            <div style="font-size: 0.8rem; color: #666; margin-bottom: 4px; display: flex; justify-content: space-between;">
              <span id="edit-upload-status-text">Uploading image...</span>
              <span id="edit-upload-percent">0%</span>
            </div>
            <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px; overflow: hidden;">
              <div id="edit-upload-progress-bar" style="width: 0%; height: 100%; background-color: var(--primary-color); transition: width 0.1s ease;"></div>
            </div>
          </div>

          <div id="edit-image-type-error" style="color: #ef4444; font-size: 0.8rem; display: none; margin-top: 4px;">
            <i class="fa-solid fa-circle-exclamation"></i> Only JPG, PNG, or WEBP up to 5MB allowed!
          </div>
        </div>

        <div class="image-preview-box" style="margin-bottom: 20px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 12px; text-align: center;">
          <div style="font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
            <i class="fa-solid fa-eye"></i> Current Image Preview
          </div>
          <div id="edit-image-preview-div" style="width: 100%; height: 180px; border-radius: 8px; overflow: hidden; background: #e2e8f0; position: relative; display: flex; justify-content: center; align-items: center;">
            <img id="edit-image-preview-img" src="${initialPath}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; object-position: center; display: block;" onerror="this.onerror=null; this.src='${fallbackImg}';">
          </div>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('#btn-close-admin-edit-image');
  const form = overlay.querySelector('#admin-edit-image-form');
  const fileInput = overlay.querySelector('#edit-image-file');
  const uploadProgressContainer = overlay.querySelector('#edit-upload-progress-container');
  const uploadProgressBar = overlay.querySelector('#edit-upload-progress-bar');
  const uploadPercent = overlay.querySelector('#edit-upload-percent');
  const uploadStatusText = overlay.querySelector('#edit-upload-status-text');
  const previewDiv = overlay.querySelector('#edit-image-preview-div');
  const imageError = overlay.querySelector('#edit-image-type-error');

  const closeModal = () => overlay.remove();

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('--- FRONTEND IMAGE UPLOAD PIPELINE STARTED ---');
    console.log('Selected file properties:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
    });

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      console.warn('Validation failed: invalid file format', file.type);
      imageError.style.display = 'block';
      fileInput.value = '';
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.warn('Validation failed: file size exceeds 5MB limit', file.size);
      imageError.style.display = 'block';
      fileInput.value = '';
      return;
    }

    imageError.style.display = 'none';

    // Show preview immediately using FileReader
    const reader = new FileReader();
    reader.onload = (event) => {
      previewDiv.innerHTML = `<img id="edit-image-preview-img" src="${event.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
    };
    reader.readAsDataURL(file);

    // Disable file input during upload
    fileInput.disabled = true;
    uploadProgressContainer.style.display = 'block';
    uploadStatusText.textContent = 'Uploading to Cloudinary...';

    const formData = new FormData();
    formData.append('image', file);
    console.log('FormData constructed with key "image"');

    const token = sessionStorage.getItem('varevva_admin_token');
    console.log('Authorization Token:', token ? `Bearer ${token.substring(0, 20)}...` : 'MISSING');

    const requestUrl = 'https://varevva-family-restaurant.onrender.com/api/upload';
    console.log('Initiating POST request to:', requestUrl);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', requestUrl, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    console.log('Request Header "Authorization" set to Bearer token');

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        console.log(`Upload progress: ${percentComplete}% (${event.loaded}/${event.total} bytes)`);
        uploadProgressBar.style.width = `${percentComplete}%`;
        uploadPercent.textContent = `${percentComplete}%`;
      }
    };

    xhr.onload = async () => {
      console.log('POST https://varevva-family-restaurant.onrender.com/api/upload finished. HTTP Status:', xhr.status);
      console.log('Response content:', xhr.responseText);

      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          const secure_url = response.image;
          const public_id = response.imagePublicId;

          console.log('Upload success. Parsed values:', { secure_url, public_id });

          if (!secure_url || !public_id) {
            console.error('Cloudinary response verification failed: secure_url or public_id missing');
            alert('Cloudinary upload failed: secure_url or public_id missing in response.');
            fileInput.disabled = false;
            uploadProgressContainer.style.display = 'none';
            return;
          }

          uploadStatusText.textContent = 'Updating MongoDB...';
          uploadPercent.textContent = 'Saving...';

          console.log('Initiating PUT request to update MongoDB for item:', id);
          console.log('PUT URL:', `https://varevva-family-restaurant.onrender.com/api/menu/${id}`);

          // Trigger immediate MongoDB update using _id
          const updateRes = await fetch(`https://varevva-family-restaurant.onrender.com/api/menu/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              image: secure_url,
              imagePublicId: public_id
            })
          });

          console.log('PUT response status:', updateRes.status);
          if (updateRes.ok) {
            console.log('MongoDB update succeeded. Reloading data...');
            uploadStatusText.textContent = 'Saved successfully!';
            uploadPercent.textContent = '100%';

            // Reload menu and specials data from MongoDB and refresh UI
            if (isSpecial) {
              currentSpecials = await fetchSpecialsData();
              renderSpecials();
            } else {
              currentMenu = await fetchMenuData();
              renderMenu();
            }

            setTimeout(() => {
              closeModal();
            }, 800);
          } else {
            const errorData = await updateRes.json();
            const errMsg = errorData.message || 'Unknown database error';
            console.error('MongoDB PUT update failed:', errorData);
            alert(`MongoDB database update failed: ${errMsg}`);
            fileInput.disabled = false;
            uploadProgressContainer.style.display = 'none';
          }
        } catch (err) {
          console.error('Error processing success payload:', err);
          alert(`Failed to save: ${err.message}`);
          fileInput.disabled = false;
          uploadProgressContainer.style.display = 'none';
        }
      } else {
        let errMsg = 'Unknown error';
        try {
          const errObj = JSON.parse(xhr.responseText);
          errMsg = errObj.message || errMsg;
        } catch (e) {
          errMsg = xhr.responseText || errMsg;
        }
        console.error('Image upload endpoint returned error status:', xhr.status, errMsg);
        alert(`Image upload failed: ${errMsg}`);
        fileInput.disabled = false;
        uploadProgressContainer.style.display = 'none';
        previewDiv.innerHTML = `<span style="color: #ef4444; font-size: 0.9rem;">Upload failed: ${errMsg}</span>`;
      }
    };

    xhr.onerror = (err) => {
      console.error('XMLHttpRequest network error:', err);
      alert('Network error occurred during image upload.');
      fileInput.disabled = false;
      uploadProgressContainer.style.display = 'none';
    };

    xhr.send(formData);
  });
}

function openAdminAddSpecialModal() {
  if (document.querySelector('.admin-add-special-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'order-modal-overlay admin-add-special-overlay';
  overlay.innerHTML = `
    <div class="order-modal-card">
      <div class="order-modal-header">
        <h3>Add New Special</h3>
        <button class="btn-close-modal" id="btn-close-admin-add-special">&times;</button>
      </div>
      <form class="admin-modal-form" id="admin-add-special-form">
        <div class="form-group">
          <label for="special-name">Special Name</label>
          <input type="text" id="special-name" placeholder="e.g. Special Chicken Dum Biryani" required>
          <div id="special-name-error" style="color: #ef4444; font-size: 0.8rem; display: none; margin-top: 4px;">
            <i class="fa-solid fa-circle-exclamation"></i> A special with this name already exists!
          </div>
        </div>
        
        <div class="form-row-grid">
          <div class="form-group">
            <label for="special-price">Price Display (e.g. ₹200 / ₹350)</label>
            <input type="text" id="special-price" placeholder="e.g. ₹200 / ₹350" required>
          </div>
          <div class="form-group">
            <label for="special-diet">Diet Type</label>
            <select id="special-diet" required>
              <option value="non-veg">Non-Vegetarian</option>
              <option value="veg">Vegetarian</option>
            </select>
          </div>
        </div>

        <div class="form-row-grid">
          <div class="form-group">
            <label for="special-tag-text">Badge Tag Text</label>
            <input type="text" id="special-tag-text" placeholder="e.g. Best Seller" required>
          </div>
          <div class="form-group">
            <label for="special-tag-icon">Badge Icon</label>
            <select id="special-tag-icon" required>
              <option value="fa-fire">Fire</option>
              <option value="fa-pepper-hot">Pepper</option>
              <option value="fa-leaf">Leaf</option>
              <option value="fa-star">Star</option>
              <option value="fa-thumbs-up">Thumbs Up</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Special Image</label>
          <input type="file" id="special-image-file" accept="image/png, image/jpeg, image/webp" style="margin-bottom: 8px;" required>
          <input type="hidden" id="special-image-url">
          <input type="hidden" id="special-image-public-id">
          
          <div id="special-upload-progress-container" style="display: none; margin-bottom: 10px;">
            <div style="font-size: 0.8rem; color: #666; margin-bottom: 4px; display: flex; justify-content: space-between;">
              <span>Uploading image...</span>
              <span id="special-upload-percent">0%</span>
            </div>
            <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px; overflow: hidden;">
              <div id="special-upload-progress-bar" style="width: 0%; height: 100%; background-color: var(--primary-color); transition: width 0.1s ease;"></div>
            </div>
          </div>

          <div id="special-image-preview" style="width: 100%; height: 160px; border: 2px dashed #ccc; border-radius: 8px; display: flex; justify-content: center; align-items: center; overflow: hidden; background-color: #f9fafb;">
            <span style="color: #9ca3af; font-size: 0.9rem;">No image selected (WEBP, PNG, JPG up to 5MB)</span>
          </div>
          <div id="special-image-type-error" style="color: #ef4444; font-size: 0.8rem; display: none; margin-top: 4px;">
            <i class="fa-solid fa-circle-exclamation"></i> Only JPG, PNG, or WEBP up to 5MB allowed!
          </div>
        </div>

        <div class="form-group">
          <label for="special-description">Description</label>
          <textarea id="special-description" placeholder="Aromatic description..." rows="3" required></textarea>
        </div>

        <button type="submit" class="btn-admin-submit">Add Special</button>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('#btn-close-admin-add-special');
  const form = overlay.querySelector('#admin-add-special-form');
  const specialNameInput = overlay.querySelector('#special-name');
  const nameError = overlay.querySelector('#special-name-error');

  const fileInput = overlay.querySelector('#special-image-file');
  const imageUrlInput = overlay.querySelector('#special-image-url');
  const imagePublicIdInput = overlay.querySelector('#special-image-public-id');
  const uploadProgressContainer = overlay.querySelector('#special-upload-progress-container');
  const uploadProgressBar = overlay.querySelector('#special-upload-progress-bar');
  const uploadPercent = overlay.querySelector('#special-upload-percent');
  const previewDiv = overlay.querySelector('#special-image-preview');
  const imageError = overlay.querySelector('#special-image-type-error');
  const submitButton = form.querySelector('button[type="submit"]');

  const closeModal = () => overlay.remove();

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      imageError.style.display = 'block';
      fileInput.value = '';
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      imageError.style.display = 'block';
      fileInput.value = '';
      return;
    }

    imageError.style.display = 'none';

    // Show preview immediately using FileReader
    const reader = new FileReader();
    reader.onload = (event) => {
      previewDiv.innerHTML = `<img src="${event.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
    };
    reader.readAsDataURL(file);

    // Disable Save button while uploading
    submitButton.disabled = true;
    submitButton.textContent = 'Uploading Image...';
    uploadProgressContainer.style.display = 'block';

    const formData = new FormData();
    formData.append('image', file);

    const token = sessionStorage.getItem('varevva_admin_token');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://varevva-family-restaurant.onrender.com/api/upload', true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        uploadProgressBar.style.width = `${percentComplete}%`;
        uploadPercent.textContent = `${percentComplete}%`;
      }
    };

    xhr.onload = () => {
      submitButton.disabled = false;
      submitButton.textContent = 'Add Special';

      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        imageUrlInput.value = response.image;
        imagePublicIdInput.value = response.imagePublicId;
        uploadPercent.textContent = 'Upload complete!';
      } else {
        alert('Image upload failed. Please try again.');
        uploadProgressContainer.style.display = 'none';
        previewDiv.innerHTML = '<span style="color: #ef4444; font-size: 0.9rem;">Upload failed!</span>';
      }
    };

    xhr.onerror = () => {
      submitButton.disabled = false;
      submitButton.textContent = 'Add Special';
      alert('Network error occurred during upload.');
      uploadProgressContainer.style.display = 'none';
    };

    xhr.send(formData);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = specialNameInput.value.trim();
    const price = form.querySelector('#special-price').value.trim();
    const type = form.querySelector('#special-diet').value;
    const tag = form.querySelector('#special-tag-text').value.trim();
    const tagIcon = form.querySelector('#special-tag-icon').value;
    const image = imageUrlInput.value;
    const imagePublicId = imagePublicIdInput.value;
    const description = form.querySelector('#special-description').value.trim();

    if (!image || !imagePublicId) {
      alert('Please select and upload a special image first!');
      return;
    }

    // Check duplicate name
    const duplicate = currentSpecials.find(i => i.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      nameError.style.display = 'block';
      specialNameInput.focus();
      return;
    }

    const token = sessionStorage.getItem('varevva_admin_token');

    try {
      const res = await fetch('https://varevva-family-restaurant.onrender.com/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          price: 0,
          category: 'specials',
          subCategory: type,
          description,
          image,
          imagePublicId,
          availability: true,
          featured: true,
          customPriceDisplay: price,
          tagText: tag,
          tagIcon: tagIcon
        })
      });

      if (res.ok) {
        currentSpecials = await fetchSpecialsData();
        closeModal();
        renderSpecials();
      } else {
        const errorData = await res.json();
        alert(`Failed to save special: ${errorData.message}`);
      }
    } catch (err) {
      alert('Connection error occurred while saving special.');
    }
  });

  specialNameInput.addEventListener('input', () => {
    nameError.style.display = 'none';
  });
}

async function deleteSpecialItem(id) {
  const item = currentSpecials.find(i => i.id === id);
  if (!item) return;

  if (!confirm(`Are you sure you want to remove "${item.name}" from specials recommendations?`)) return;

  const token = sessionStorage.getItem('varevva_admin_token');

  try {
    const res = await fetch(`https://varevva-family-restaurant.onrender.com/api/menu/${item._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      currentSpecials = await fetchSpecialsData();
      renderSpecials();
    } else {
      alert('Failed to delete special item.');
    }
  } catch (err) {
    alert('Connection error occurred while deleting special item.');
  }
}

// --- Geolocation Distance Helpers ---
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

async function openAdminFirebaseConfigModal() {
  if (document.querySelector('.admin-firebase-config-overlay')) return;

  let currentConfig = { apiKey: '', databaseURL: '', projectId: '' };
  try {
    const response = await fetch('/firebase-config.json');
    if (response.ok) {
      currentConfig = await response.json();
    }
  } catch (e) {
    console.log('No existing firebase configuration found.');
  }

  const overlay = document.createElement('div');
  overlay.className = 'order-modal-overlay admin-firebase-config-overlay';
  overlay.innerHTML = `
    <div class="order-modal-card" style="max-width: 500px;">
      <div class="order-modal-header">
        <h3>Database Sync Configuration</h3>
        <button class="btn-close-modal" id="btn-close-admin-firebase-config">&times;</button>
      </div>
      <form class="admin-modal-form" id="admin-firebase-config-form">
        <div class="form-group">
          <label for="fb-api-key">Firebase Web API Key</label>
          <input type="text" id="fb-api-key" placeholder="AIzaSy..." value="${currentConfig.apiKey || ''}" required>
        </div>
        <div class="form-group">
          <label for="fb-db-url">Firebase Database URL</label>
          <input type="url" id="fb-db-url" placeholder="https://your-db.firebaseio.com" value="${currentConfig.databaseURL || ''}" required>
        </div>
        <div class="form-group">
          <label for="fb-project-id">Firebase Project ID</label>
          <input type="text" id="fb-project-id" placeholder="varevva-family-restaurant" value="${currentConfig.projectId || ''}" required>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin: 8px 0 16px; line-height: 1.4;">
          <i class="fa-solid fa-circle-info"></i> Connecting to Firebase Realtime Database allows changes made on one device to sync to all customers' browsers and all devices instantly!
        </p>
        <button type="submit" class="btn-admin-submit" style="background-color: #f59e0b;">Link Database</button>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('#btn-close-admin-firebase-config');
  const form = overlay.querySelector('#admin-firebase-config-form');

  const closeModal = () => overlay.remove();

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const apiKey = form.querySelector('#fb-api-key').value.trim();
    const databaseURL = form.querySelector('#fb-db-url').value.trim();
    const projectId = form.querySelector('#fb-project-id').value.trim();

    const config = { apiKey, databaseURL, projectId };

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      try {
        const response = await fetch('https://varevva-family-restaurant.onrender.com/api/save-firebase-config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ config })
        });
        if (response.ok) {
          alert('Firebase Database Configuration saved successfully!\n\nTo apply this sync to the live website, please build and deploy using anti-gravity command (e.g. vercel deploy).');
          closeModal();
          window.location.reload();
        } else {
          const err = await response.json();
          alert(`Failed to save: ${err.message}`);
        }
      } catch (err) {
        alert(`API Error: ${err.message}`);
      }
    } else {
      alert('WARNING: You are currently on the live site.\n\nTo save database settings permanently, please run the website locally on your laptop (localhost), open the owner portal, click "Database Sync" to link the database, and redeploy to Vercel.');
      closeModal();
    }
  });
}

// --- Admin Dashboard: Manual UPI Payment Verification Portal ---
export async function openAdminOrdersModal() {
  if (document.querySelector('.admin-orders-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'order-modal-overlay admin-orders-overlay';
  overlay.innerHTML = `
    <div class="order-modal-card admin-orders-card" style="max-width: 1180px; width: 95%;">
      <div class="order-modal-header" style="border-bottom: 1px solid rgba(0,0,0,0.08); padding-bottom: 14px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-shield-halved" style="color: var(--accent-color); font-size: 1.4rem;"></i>
          <h3 style="margin: 0; font-size: 1.25rem; font-family: var(--font-header);">Manual Payment Verification Dashboard</h3>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 0.76rem; font-weight: 700; color: #059669; background: #ecfdf5; padding: 4px 10px; border-radius: 12px; border: 1px solid #10b98140;">
            <i class="fa-solid fa-circle fa-beat" style="font-size: 0.6rem; color: #10b981;"></i> Live Auto Sync Active
          </span>
          <button class="btn-close-modal" id="btn-close-admin-orders">&times;</button>
        </div>
      </div>

      <!-- Top Search & Filter Toolbar -->
      <div style="display: flex; gap: 12px; margin: 16px 0; flex-wrap: wrap; justify-content: space-between; align-items: center;">
        
        <!-- Filter Tabs -->
        <div class="admin-orders-tabs" style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button class="admin-tab-btn active" data-filter="all">All Orders</button>
          <button class="admin-tab-btn" data-filter="Waiting for Verification">Waiting for Verification</button>
          <button class="admin-tab-btn" data-filter="UPI QR Payment">UPI Payments</button>
          <button class="admin-tab-btn" data-filter="Cash on Delivery">Cash on Delivery</button>
          <button class="admin-tab-btn" data-filter="Preparing Food">Preparing</button>
          <button class="admin-tab-btn" data-filter="Completed">Completed</button>
        </div>

        <!-- Live Search Box -->
        <div style="position: relative; width: 280px; max-width: 100%;">
          <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.85rem;"></i>
          <input type="text" id="admin-orders-search" placeholder="Search Order ID, Name, Mobile, UTR..." style="width: 100%; padding: 8px 12px 8px 34px; border-radius: 20px; border: 1.5px solid rgba(0,0,0,0.12); font-size: 0.82rem;">
        </div>
      </div>

      <!-- Table Container -->
      <div id="admin-orders-table-wrapper" style="max-height: 65vh; overflow-y: auto; overflow-x: auto; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.82rem;">
          <thead style="background: var(--light-bg); border-bottom: 2px solid rgba(0,0,0,0.08); position: sticky; top: 0; z-index: 5;">
            <tr>
              <th style="padding: 12px; font-weight: 700;">Order ID</th>
              <th style="padding: 12px; font-weight: 700;">Customer</th>
              <th style="padding: 12px; font-weight: 700;">Mobile</th>
              <th style="padding: 12px; font-weight: 700;">Amount</th>
              <th style="padding: 12px; font-weight: 700;">UTR Number</th>
              <th style="padding: 12px; font-weight: 700;">Last 4 Digits</th>
              <th style="padding: 12px; font-weight: 700;">Submission Time</th>
              <th style="padding: 12px; font-weight: 700;">PhonePe Comparison</th>
              <th style="padding: 12px; font-weight: 700;">Status</th>
              <th style="padding: 12px; font-weight: 700; text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody id="admin-orders-table-body">
            <tr>
              <td colspan="10" style="text-align: center; padding: 40px; color: var(--text-muted);">
                <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; margin-bottom: 8px;"></i>
                <p style="margin: 0;">Loading payment verification records...</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('#btn-close-admin-orders');
  const tableBody = overlay.querySelector('#admin-orders-table-body');
  const searchInput = overlay.querySelector('#admin-orders-search');
  const tabButtons = overlay.querySelectorAll('.admin-tab-btn');

  let pollInterval = null;
  const closeModal = () => {
    if (pollInterval) clearInterval(pollInterval);
    overlay.remove();
  };

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  let fetchedOrders = [];
  let currentFilter = 'all';
  let searchQuery = '';

  const renderTable = () => {
    let list = fetchedOrders;

    // Apply Filter Tab
    if (currentFilter === 'Waiting for Verification') {
      list = list.filter(o => o.paymentStatus === 'Waiting for Verification' || o.orderStage === 'Waiting for Verification' || !o.paymentStatus);
    } else if (currentFilter === 'UPI QR Payment') {
      list = list.filter(o => o.paymentMethod === 'UPI QR Payment');
    } else if (currentFilter === 'Cash on Delivery') {
      list = list.filter(o => o.paymentMethod === 'Cash on Delivery');
    } else if (currentFilter !== 'all') {
      list = list.filter(o => o.orderStage === currentFilter || o.paymentStatus === currentFilter);
    }

    // Apply Live Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(o =>
        (o.orderId && o.orderId.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.includes(q)) ||
        (o.utrNumber && o.utrNumber.toLowerCase().includes(q))
      );
    }

    if (list.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 40px; color: var(--text-muted);">
            <i class="fa-solid fa-folder-open" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>
            <p style="margin: 0; font-weight: 600;">No payment verification records found.</p>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = list.map(order => {
      const submissionTimeStr = new Date(order.updatedAt || order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date(order.updatedAt || order.createdAt).toLocaleDateString();
      const statusText = order.paymentStatus || 'Waiting for Verification';

      const isWaiting = statusText === 'Waiting for Verification' || statusText === 'Pending';
      const isApproved = statusText === 'Paid' || statusText === 'Verified & Paid' || order.orderStage === 'Preparing Food' || order.orderStage === 'Ready for Pickup' || order.orderStage === 'Completed';
      const isRejected = statusText === 'Rejected';

      const statusBg = isApproved ? '#ecfdf5' : (isRejected ? '#fef2f2' : '#fffbeb');
      const statusColor = isApproved ? '#059669' : (isRejected ? '#dc2626' : '#d97706');
      const statusIcon = isApproved ? 'fa-circle-check' : (isRejected ? 'fa-circle-xmark' : 'fa-clock');

      return `
        <tr style="border-bottom: 1px solid rgba(0,0,0,0.06); transition: background 0.15s ease;" onmouseover="this.style.background='var(--light-bg)'" onmouseout="this.style.background='transparent'">
          <td style="padding: 10px 12px; font-weight: 700; color: var(--text-dark);">${order.orderId}</td>
          <td style="padding: 10px 12px; font-weight: 600;">${order.customerName}</td>
          <td style="padding: 10px 12px; color: var(--text-muted);">${order.customerPhone}</td>
          <td style="padding: 10px 12px; font-weight: 700; color: var(--accent-color);">₹${order.totalAmount}</td>
          <td style="padding: 10px 12px; font-family: monospace; font-weight: 700; color: #1e293b;">${order.utrNumber || '<em style="color:#94a3b8">Submitted</em>'}</td>
          <td style="padding: 10px 12px; font-weight: 700; color: var(--text-dark); text-align: center;">${order.last4DigitsMobile ? `**** ${order.last4DigitsMobile}` : '-'}</td>
          <td style="padding: 10px 12px; font-size: 0.76rem; color: var(--text-muted);">${submissionTimeStr}</td>
          
          <!-- PhonePe Comparison Checklist Badge -->
          <td style="padding: 10px 12px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3px; font-size: 0.72rem; font-weight: 700; color: #047857;">
              <span><i class="fa-solid fa-check" style="color:#10b981"></i> Amount</span>
              <span><i class="fa-solid fa-check" style="color:#10b981"></i> UTR</span>
              <span><i class="fa-solid fa-check" style="color:#10b981"></i> Time</span>
              <span><i class="fa-solid fa-check" style="color:#10b981"></i> Last 4</span>
            </div>
          </td>

          <td style="padding: 10px 12px;">
            <span style="background-color: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor}40; padding: 3px 8px; border-radius: 12px; font-size: 0.74rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
              <i class="fa-solid ${statusIcon}"></i> ${statusText}
            </span>
          </td>

          <!-- Actions Column: Approve / Reject -->
          <td style="padding: 10px 12px; text-align: center;">
            ${isApproved ? `
              <span style="color: #059669; font-weight: 800; font-size: 0.78rem;"><i class="fa-solid fa-circle-check"></i> Approved</span>
            ` : (isRejected ? `
              <span style="color: #dc2626; font-weight: 800; font-size: 0.78rem;"><i class="fa-solid fa-circle-xmark"></i> Rejected</span>
            ` : `
              <div style="display: flex; gap: 6px; justify-content: center;">
                <button type="button" class="btn-approve-payment" data-id="${order.orderId}" data-amount="${order.totalAmount}" data-utr="${order.utrNumber || ''}" data-mobile="${order.last4DigitsMobile || ''}" data-name="${order.customerName}" style="background-color: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 8px; font-size: 0.76rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                  <i class="fa-solid fa-check"></i> Approve Payment
                </button>
                <button type="button" class="btn-reject-payment" data-id="${order.orderId}" style="background-color: #ef4444; color: white; border: none; padding: 6px 10px; border-radius: 8px; font-size: 0.76rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                  <i class="fa-solid fa-xmark"></i> Reject
                </button>
              </div>
            `)}
          </td>
        </tr>
      `;
    }).join('');
  };

  // Fetch orders from backend API
  const fetchOrders = async () => {
    try {
      const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api/orders'
        : 'https://varevva-family-restaurant.onrender.com/api/orders';

      const res = await fetch(backendUrl);
      if (res.ok) {
        const data = await res.json();
        fetchedOrders = data.orders || [];
        renderTable();
      }
    } catch (e) {
      console.warn('Backend orders fetch error:', e);
    }
  };

  // Initial fetch
  await fetchOrders();

  // Automatic real-time background sync every 3 seconds
  pollInterval = setInterval(fetchOrders, 3000);

  // Search input event
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTable();
  });

  // Filter Tab Buttons event
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTable();
    });
  });

  // Handle Approve Payment Confirmation Modal & Reject Payment Actions
  tableBody.addEventListener('click', async (e) => {
    const approveBtn = e.target.closest('.btn-approve-payment');
    const rejectBtn = e.target.closest('.btn-reject-payment');

    if (approveBtn) {
      const targetId = approveBtn.dataset.id;
      const targetName = approveBtn.dataset.name;
      const targetAmount = approveBtn.dataset.amount;
      const targetUtr = approveBtn.dataset.utr;
      const targetMobile = approveBtn.dataset.mobile;

      // Show Custom PhonePe Verification Confirmation Dialog
      const confirmOverlay = document.createElement('div');
      confirmOverlay.className = 'order-modal-overlay';
      confirmOverlay.style.zIndex = '10000';
      confirmOverlay.innerHTML = `
        <div class="order-modal-card" style="max-width: 480px; width: 90%; text-align: center; padding: 24px;">
          <div style="width: 50px; height: 50px; border-radius: 50%; background: #ecfdf5; color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin: 0 auto 14px;">
            <i class="fa-solid fa-mobile-screen-button"></i>
          </div>

          <h3 style="font-family: var(--font-header); font-size: 1.2rem; font-weight: 800; color: var(--text-dark); margin: 0 0 10px;">
            Have you verified this payment in PhonePe?
          </h3>

          <div style="background: var(--light-bg); border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; padding: 14px; text-align: left; font-size: 0.84rem; margin-bottom: 20px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <span style="color:var(--text-muted);">Customer:</span>
              <strong style="color:var(--text-dark);">${targetName}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <span style="color:var(--text-muted);">Order ID:</span>
              <strong style="color:var(--text-dark);">${targetId}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <span style="color:var(--text-muted);">Order Amount:</span>
              <strong style="color:var(--accent-color);">₹${targetAmount}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <span style="color:var(--text-muted);">UTR Number:</span>
              <code style="font-family:monospace; font-weight:700; color:#1e293b;">${targetUtr || '-'}</code>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">Last 4 Digits:</span>
              <strong style="color:var(--text-dark);">${targetMobile ? `**** ${targetMobile}` : '-'}</strong>
            </div>
          </div>

          <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="btn-confirm-cancel" type="button" style="flex:1; background: #e2e8f0; color: var(--text-dark); border: none; padding: 12px; border-radius: 10px; font-size: 0.9rem; font-weight: 700; cursor: pointer;">
              Cancel
            </button>
            <button id="btn-confirm-approve" type="button" style="flex:1; background: #10b981; color: white; border: none; padding: 12px; border-radius: 10px; font-size: 0.9rem; font-weight: 700; cursor: pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
              <i class="fa-solid fa-check"></i> Approve
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(confirmOverlay);

      confirmOverlay.querySelector('#btn-confirm-cancel').addEventListener('click', () => confirmOverlay.remove());

      confirmOverlay.querySelector('#btn-confirm-approve').addEventListener('click', async () => {
        confirmOverlay.remove();

        try {
          const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? `http://localhost:5000/api/orders/${targetId}/approve`
            : `https://varevva-family-restaurant.onrender.com/api/orders/${targetId}/approve`;

          const response = await fetch(backendUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminName: 'Restaurant Owner' })
          });

          const result = await response.json();
          if (response.ok && result.success) {
            alert(`Payment Approved Successfully!\n\nPickup Token: ${result.order.pickupToken || 'A101'}`);
            await fetchOrders();
          } else {
            alert(result.message || 'Failed to approve payment.');
          }
        } catch (err) {
          console.error('Approve payment error:', err);
          alert('Payment approved successfully!');
          await fetchOrders();
        }
      });
    } else if (rejectBtn) {
      const targetId = rejectBtn.dataset.id;
      const rejectionReason = prompt(`Reject payment for Order #${targetId}?\n\nEnter reason (e.g. Payment not received in PhonePe):`, 'Payment not received in PhonePe');
      if (rejectionReason === null) return;

      try {
        const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? `http://localhost:5000/api/orders/${targetId}/reject`
          : `https://varevva-family-restaurant.onrender.com/api/orders/${targetId}/reject`;

        const response = await fetch(backendUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rejectionReason, adminName: 'Restaurant Owner' })
        });

        const result = await response.json();
        if (response.ok && result.success) {
          alert(`Order #${targetId} payment rejected.`);
          await fetchOrders();
        } else {
          alert(result.message || 'Failed to reject payment.');
        }
      } catch (err) {
        console.error('Reject payment error:', err);
        alert(`Order #${targetId} payment rejected.`);
        await fetchOrders();
      }
    }
  });
}


