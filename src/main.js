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
function getItemImage(item) {
  if (item.image) return item.image;
  return item.type === 'veg' ? '/assets/paneer_butter_masala.png' : '/assets/chicken_dum_biryani.png';
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

        <button type="submit" class="btn-submit-order">
          <span>Get Token & Order on WhatsApp</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  const closeBtn = modalOverlay.querySelector('#btn-close-order-modal');
  const form = modalOverlay.querySelector('#order-details-form');
  const orderTypeSelect = modalOverlay.querySelector('#order-type');
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

  // Initial render of summary
  updateModalSummary();

  // Quantity button event delegation
  summaryContainer.addEventListener('click', (e) => {
    const minusBtn = e.target.closest('.btn-modal-qty-minus');
    const plusBtn = e.target.closest('.btn-modal-qty-plus');
    
    if (minusBtn) {
      const name = minusBtn.dataset.name;
      updateQuantity(name, -1);
      updateModalSummary();
    } else if (plusBtn) {
      const name = plusBtn.dataset.name;
      updateQuantity(name, 1);
      updateModalSummary();
    }
  });

  let isLocationVerified = false;
  let verifiedDistance = null;
  let verifiedLat = null;
  let verifiedLon = null;

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
      verifiedDistance = null;
      verifiedLat = null;
      verifiedLon = null;
      statusSpan.style.color = 'var(--text-muted)';
      statusSpan.innerHTML = 'Not verified yet';
    }
  });

  const detectBtn = modalOverlay.querySelector('#btn-detect-location');
  const statusSpan = modalOverlay.querySelector('#location-status');
  
  detectBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      statusSpan.style.color = '#ef4444';
      statusSpan.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> GPS not supported. Manual allowed.';
      isLocationVerified = true;
      return;
    }
    
    statusSpan.style.color = 'var(--text-dark)';
    statusSpan.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking GPS...';
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        // Query OSRM routing API for the actual driving distance (original road distance)
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${lon},${lat};78.9440528,17.5700914?overview=false`;
        
        fetch(osrmUrl)
          .then(res => res.json())
          .then(data => {
            let distance = 0;
            if (data.code === 'Ok' && data.routes && data.routes[0]) {
              distance = data.routes[0].distance / 1000; // convert meters to km
            } else {
              // Fallback to Haversine straight-line distance
              distance = calculateDistance(17.5700914, 78.9440528, lat, lon);
            }
            
            verifiedLat = lat;
            verifiedLon = lon;
            verifiedDistance = distance.toFixed(2);
            
            if (distance <= 4.0) {
              statusSpan.style.color = '#10b981';
              statusSpan.innerHTML = `<i class="fa-solid fa-circle-check"></i> Delivery available (${verifiedDistance} km)`;
              isLocationVerified = true;
            } else {
              statusSpan.style.color = '#ef4444';
              statusSpan.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Delivery not available (${verifiedDistance} km)`;
              isLocationVerified = false;
              alert(`Delivery address is outside our 4km delivery range. Distance calculated: ${verifiedDistance} km from restaurant. Please choose Dine-in or Takeaway instead.`);
            }
          })
          .catch(err => {
            console.error("OSRM fetch error, falling back to Haversine:", err);
            const distance = calculateDistance(17.5700914, 78.9440528, lat, lon);
            verifiedLat = lat;
            verifiedLon = lon;
            verifiedDistance = distance.toFixed(2);
            
            if (distance <= 4.0) {
              statusSpan.style.color = '#10b981';
              statusSpan.innerHTML = `<i class="fa-solid fa-circle-check"></i> Delivery available (${verifiedDistance} km)`;
              isLocationVerified = true;
            } else {
              statusSpan.style.color = '#ef4444';
              statusSpan.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Delivery not available (${verifiedDistance} km)`;
              isLocationVerified = false;
              alert(`Delivery address is outside our 4km delivery range. Distance calculated: ${verifiedDistance} km from restaurant. Please choose Dine-in or Takeaway instead.`);
            }
          });
      },
      (error) => {
        console.error("Geolocation error:", error);
        statusSpan.style.color = '#d97706';
        statusSpan.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> GPS failed. Manual allowed.';
        isLocationVerified = true; // allow manual override if GPS fails
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });

  // Handle close action
  closeBtn.addEventListener('click', closeOrderModal);
  
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeOrderModal();
    }
  });

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('#cust-name').value.trim();
    const phone = form.querySelector('#cust-phone').value.trim();
    const typeLabel = orderTypeSelect.options[orderTypeSelect.selectedIndex].text;
    const address = orderTypeSelect.value === 'delivery' ? form.querySelector('#cust-address').value.trim() : '';

    if (orderTypeSelect.value === 'delivery' && !isLocationVerified) {
      alert("Please verify your location first by clicking 'Detect Distance'.");
      return;
    }

    // Generate Unique Token
    const tokenNum = Math.floor(1000 + Math.random() * 9000);
    const token = `VRV-${tokenNum}`;

    const whatsappUrl = buildWhatsAppUrl({ name, phone, typeLabel, token, address, distance: verifiedDistance });
    showSuccessScreen({ token, whatsappUrl });
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

function buildWhatsAppUrl({ name, phone, typeLabel, token, address = '', distance = null }) {
  const cart = getCart();
  const keys = Object.keys(cart);
  if (keys.length === 0) return '';
  
  let message = `*Order Token: ${token}*\n`;
  message += `*Customer:* ${name}\n`;
  message += `*Phone:* ${phone}\n`;
  message += `*Option:* ${typeLabel}\n`;
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
    
    // Find item ID for encoding
    const dbItem = currentMenu.find(d => d.name === item.name);
    itemsArray.push([dbItem ? dbItem.id : item.name, item.quantity, item.price]);
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
      const name = stockBtn.dataset.name;
      toggleStockStatus(name);
      return;
    }
    
    // Admin edit item click
    const editBtn = e.target.closest('.btn-admin-edit');
    if (editBtn) {
      if (editBtn.dataset.name) {
        const name = editBtn.dataset.name;
        openAdminEditItemModal(name);
      } else if (editBtn.dataset.id) {
        const id = editBtn.dataset.id;
        openAdminEditSpecialModal(id);
      }
      return;
    }

    // Admin edit image click
    const editImgBtn = e.target.closest('.btn-admin-edit-image');
    if (editImgBtn) {
      if (editImgBtn.dataset.name) {
        const name = editImgBtn.dataset.name;
        openAdminEditImageModal(name, false);
      } else if (editImgBtn.dataset.id) {
        const id = editImgBtn.dataset.id;
        openAdminEditImageModal(id, true);
      }
      return;
    }
    
    // Admin remove item click
    const deleteBtn = e.target.closest('.btn-admin-delete');
    if (deleteBtn) {
      if (deleteBtn.dataset.name) {
        const name = deleteBtn.dataset.name;
        deleteMenuItem(name);
      } else if (deleteBtn.dataset.id) {
        const id = deleteBtn.dataset.id;
        deleteSpecialItem(id);
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
        <button class="btn-admin-add-item" id="btn-admin-firebase-settings" style="background-color: #f59e0b; border-color: #f59e0b;">
          <i class="fa-solid fa-database"></i> Database Sync
        </button>
      </div>
    `;
    menuGrid.appendChild(toolbar);
    toolbar.querySelector('#btn-admin-add-dish').addEventListener('click', openAdminAddItemModal);
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
        <button class="btn-admin-stock ${item.outOfStock ? 'btn-stock-out' : 'btn-stock-in'}" data-name="${item.name}">
          <i class="fa-solid ${item.outOfStock ? 'fa-eye' : 'fa-eye-slash'}"></i>
          <span>${item.outOfStock ? 'Mark In Stock' : 'Mark Out of Stock'}</span>
        </button>
        <button class="btn-admin-edit" data-name="${item.name}">
          <i class="fa-solid fa-pen-to-square"></i>
          <span>Edit</span>
        </button>
        <button class="btn-admin-edit-image" data-name="${item.name}">
          <i class="fa-solid fa-image"></i>
          <span>Edit Image</span>
        </button>
        <button class="btn-admin-delete" data-name="${item.name}">
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
          <label for="admin-username">Username</label>
          <input type="text" id="admin-username" placeholder="Enter username" required autocomplete="username">
        </div>
        <div class="form-group">
          <label for="admin-password">Password</label>
          <input type="password" id="admin-password" placeholder="Enter password" required autocomplete="current-password">
        </div>
        <div id="admin-login-error" style="color: #ef4444; font-size: 0.85rem; display: none; text-align: center;">
          <i class="fa-solid fa-circle-exclamation"></i> Invalid username or password!
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

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = form.querySelector('#admin-username').value.trim();
    const pass = form.querySelector('#admin-password').value;

    if (user === 'admin' && pass === 'varevva123') {
      isAdmin = true;
      sessionStorage.setItem('varevva_admin_logged_in', 'true');
      updateAdminPortalButtonState();
      closeModal();
      if (menuGrid) renderMenu();
      if (specialsGrid) renderSpecials();
    } else {
      const errorDiv = form.querySelector('#admin-login-error');
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
          <label for="dish-image">Dish Image URL / Path (Optional)</label>
          <input type="text" id="dish-image" placeholder="e.g. /assets/spicy_chicken_fry.png or any online URL">
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

  const closeModal = () => overlay.remove();

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = dishNameInput.value.trim();
    const price = Number(form.querySelector('#dish-price').value);
    const category = form.querySelector('#dish-category').value;
    const type = form.querySelector('#dish-diet').value;
    const description = form.querySelector('#dish-description').value.trim();
    const popular = form.querySelector('#dish-popular').checked;
    const image = form.querySelector('#dish-image').value.trim();

    // Uniqueness check (case-insensitive)
    const duplicate = currentMenu.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      nameError.style.display = 'block';
      dishNameInput.focus();
      return;
    }

    // Generate ID
    const prefix = type === 'veg' ? 'v' : 'nv';
    const catCode = category.substring(0, 3);
    const customId = `cust-${prefix}-${catCode}-${Date.now()}`;

    const newItem = {
      id: customId,
      name,
      price,
      category,
      type,
      description,
      popular,
      image: image || "",
      outOfStock: false
    };

    currentMenu.push(newItem);
    saveMenuData(currentMenu);
    
    closeModal();
    renderMenu();
  });

  dishNameInput.addEventListener('input', () => {
    nameError.style.display = 'none';
  });
}

function toggleStockStatus(name) {
  const item = currentMenu.find(i => i.name === name);
  if (!item) return;

  item.outOfStock = !item.outOfStock;
  
  // Save currentMenu to localStorage/database
  saveMenuData(currentMenu);
  
  // Sync cart (remove the item from cart if it's marked out of stock)
  if (item.outOfStock) {
    const cart = getCart();
    if (cart[name]) {
      delete cart[name];
      saveCart(cart);
    }
  }
  
  renderMenu();
}

function deleteMenuItem(name) {
  if (!confirm(`Are you sure you want to remove "${name}" from the menu?`)) return;

  currentMenu = currentMenu.filter(i => i.name !== name);
  saveMenuData(currentMenu);

  // Also remove from cart if present
  const cart = getCart();
  if (cart[name]) {
    delete cart[name];
    saveCart(cart);
  }

  renderMenu();
}

function openAdminEditItemModal(name) {
  const item = currentMenu.find(i => i.name === name);
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
          <label for="dish-image">Dish Image URL / Path (Optional)</label>
          <input type="text" id="dish-image" placeholder="e.g. /assets/spicy_chicken_fry.png or any online URL" value="${item.image || ''}">
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

  const closeModal = () => overlay.remove();

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newName = dishNameInput.value.trim();
    const price = Number(form.querySelector('#dish-price').value);
    const category = form.querySelector('#dish-category').value;
    const type = form.querySelector('#dish-diet').value;
    const description = form.querySelector('#dish-description').value.trim();
    const popular = form.querySelector('#dish-popular').checked;
    const image = form.querySelector('#dish-image').value.trim();

    // Check duplicate name excluding current item
    const duplicate = currentMenu.find(i => i.name.toLowerCase() === newName.toLowerCase() && i.name.toLowerCase() !== name.toLowerCase());
    if (duplicate) {
      nameError.style.display = 'block';
      dishNameInput.focus();
      return;
    }

    const oldName = item.name;
    item.name = newName;
    item.price = price;
    item.category = category;
    item.type = type;
    item.description = description;
    item.popular = popular;
    item.image = image || "";

    // Sync updated properties to cart if it was in the cart
    const cart = getCart();
    if (cart[oldName]) {
      const cartQty = cart[oldName].quantity;
      delete cart[oldName];
      cart[newName] = { name: newName, price, quantity: cartQty };
      saveCart(cart);
    }

    saveMenuData(currentMenu);
    closeModal();
    renderMenu();
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
        <button class="btn-admin-add-item" id="btn-admin-firebase-settings-special" style="background-color: #f59e0b; border-color: #f59e0b;">
          <i class="fa-solid fa-database"></i> Database Sync
        </button>
      </div>
    `;
    specialsGrid.appendChild(toolbar);
    toolbar.querySelector('#btn-admin-add-special-trigger').addEventListener('click', openAdminAddSpecialModal);
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

function openAdminEditImageModal(identifier, isSpecial) {
  const item = isSpecial 
    ? currentSpecials.find(i => i.id === identifier)
    : currentMenu.find(i => i.name === identifier);
  
  if (!item) return;

  if (document.querySelector('.admin-edit-image-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'order-modal-overlay admin-edit-image-overlay';
  overlay.innerHTML = `
    <div class="order-modal-card" style="max-width: 500px;">
      <div class="order-modal-header">
        <h3>Edit Image: ${item.name}</h3>
        <button class="btn-close-modal" id="btn-close-admin-edit-image">&times;</button>
      </div>
      <form class="admin-modal-form" id="admin-edit-image-form">
        <div class="form-group">
          <label for="edit-image-url">Image URL or Local Path</label>
          <input type="text" id="edit-image-url" placeholder="e.g. /assets/dish.png or online URL" value="${item.image || ''}" required>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 8px; line-height: 1.4;">
            <i class="fa-solid fa-info-circle"></i> Enter an online link (e.g. <code>https://images.unsplash.com/...</code>) or a local static path (e.g. <code>/assets/my_dish.png</code>). This will be saved permanently.
          </p>
        </div>
        <button type="submit" class="btn-admin-submit" style="background-color: #8b5cf6;">Save Image</button>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('#btn-close-admin-edit-image');
  const form = overlay.querySelector('#admin-edit-image-form');

  const closeModal = () => overlay.remove();

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newImageUrl = form.querySelector('#edit-image-url').value.trim();
    item.image = newImageUrl;

    if (isSpecial) {
      saveSpecialsData(currentSpecials);
      renderSpecials();
    } else {
      saveMenuData(currentMenu);
      renderMenu();
    }

    closeModal();
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
          <label for="special-image">Special Image URL / Path (Optional)</label>
          <input type="text" id="special-image" placeholder="e.g. /assets/chicken_dum_biryani.png or any online URL">
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

  const closeModal = () => overlay.remove();

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = specialNameInput.value.trim();
    const price = form.querySelector('#special-price').value.trim();
    const type = form.querySelector('#special-diet').value;
    const tag = form.querySelector('#special-tag-text').value.trim();
    const tagIcon = form.querySelector('#special-tag-icon').value;
    const image = form.querySelector('#special-image').value.trim();
    const description = form.querySelector('#special-description').value.trim();

    // Check duplicate name
    const duplicate = currentSpecials.find(i => i.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      nameError.style.display = 'block';
      specialNameInput.focus();
      return;
    }

    const newId = `special-cust-${Date.now()}`;
    const newSpecial = {
      id: newId,
      name,
      price,
      type,
      tag,
      tagIcon,
      image: image || "/assets/chicken_dum_biryani.png",
      description
    };

    currentSpecials.push(newSpecial);
    saveSpecialsData(currentSpecials);
    closeModal();
    renderSpecials();
  });

  specialNameInput.addEventListener('input', () => {
    nameError.style.display = 'none';
  });
}

function deleteSpecialItem(id) {
  const item = currentSpecials.find(i => i.id === id);
  if (!item) return;

  if (!confirm(`Are you sure you want to remove "${item.name}" from specials recommendations?`)) return;

  currentSpecials = currentSpecials.filter(i => i.id !== id);
  saveSpecialsData(currentSpecials);

  renderSpecials();
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
        const response = await fetch('/api/save-firebase-config', {
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
