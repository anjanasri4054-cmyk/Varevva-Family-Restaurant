import { menuData } from './menuData.js';
import { defaultSpecials } from './specialsData.js';
import { initDatabase, fetchMenuData, fetchSpecialsData } from './db.js';

// --- DOM Element References ---
const navbar = document.getElementById('navbar');
const navMenu = document.getElementById('nav-menu');
const mobileNavToggle = document.getElementById('mobile-nav-toggle');
const detailsContainer = document.getElementById('item-details-container');
const relatedItemsSection = document.getElementById('related-items-section');
const relatedItemsGrid = document.getElementById('related-items-grid');

// --- Load Menu Data & Specials ---
let currentMenu = [];
let currentSpecials = [];

// --- Parse URL Parameter ---
const urlParams = new URLSearchParams(window.location.search);
const itemId = urlParams.get('id');

// --- Main Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
  await initDatabase();
  currentMenu = await fetchMenuData();
  currentSpecials = await fetchSpecialsData();

  initNavbarScroll();
  initMobileNav();
  
  if (itemId) {
    const item = findItemById(itemId);
    if (item) {
      renderItemDetails(item);
      renderRelatedItems(item);
    } else {
      renderNotFound();
    }
  } else {
    renderNotFound();
  }
  
  updateFloatingCartBar();
  initCartEventListeners();
});

// --- Find Item Helper ---
function findItemById(id) {
  // Check main menu
  let item = currentMenu.find(i => i.id === id);
  if (item) return item;
  
  // Check specials menu
  item = currentSpecials.find(i => i.id === id);
  if (item) {
    // Standardize specials schema to match menu schema if needed
    return {
      id: item.id,
      name: item.name,
      price: item.price.includes('/') ? 200 : parseInt(item.price.replace(/[^\d]/g, '')) || 200, // Handle range vs standard price
      category: 'biryani', // default category for specials
      type: item.type,
      image: item.image,
      description: item.description,
      popular: true
    };
  }
  return null;
}

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
      const icon = mobileNavToggle.querySelector('i');
      if (navMenu.classList.contains('open')) {
        icon.className = 'fa-solid fa-xmark';
      } else {
        icon.className = 'fa-solid fa-bars';
      }
    });

    const links = navMenu.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileNavToggle.querySelector('i').className = 'fa-solid fa-bars';
      });
    });
  }
}

// --- Render Item Details ---
function renderItemDetails(item) {
  // Dynamic Title & SEO
  document.title = `${item.name} | Varevva Family Restaurant`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', `Savor our delicious ${item.name} at Varevva Family Restaurant, Yadagirigutta. ${item.description || ''}`);
  }

  const isVeg = item.type === 'veg';
  const dietBadgeClass = isVeg ? 'veg' : 'non-veg';
  const fallbackImage = isVeg ? '/assets/paneer_butter_masala.png' : '/assets/chicken_dum_biryani.png';
  
  const cart = getCart();
  const cartItem = cart[item.name];
  
  let cartActionHTML = '';
  if (item.outOfStock) {
    cartActionHTML = `
      <button class="btn-detail-add btn-detail-add-disabled" disabled style="background-color: #9ca3af; border-color: #9ca3af; color: white; cursor: not-allowed;">
        SOLD OUT
      </button>
    `;
  } else if (cartItem) {
    cartActionHTML = `
      <div class="detail-qty-selector">
        <button class="btn-qty-minus detail-qty-btn" data-name="${item.name}" style="background: none; border: none; font-size: 1.5rem; color: var(--primary-color); font-weight: 700; cursor: pointer; padding: 0 10px;">-</button>
        <span class="qty-value" style="font-family: var(--font-header); font-weight: 700; font-size: 1.2rem;">${cartItem.quantity}</span>
        <button class="btn-qty-plus detail-qty-btn" data-name="${item.name}" style="background: none; border: none; font-size: 1.5rem; color: var(--primary-color); font-weight: 700; cursor: pointer; padding: 0 10px;">+</button>
      </div>
    `;
  } else {
    cartActionHTML = `
      <button class="btn-detail-add" data-name="${item.name}" data-price="${item.price}">
        ADD TO ORDER <i class="fa-solid fa-plus"></i>
      </button>
    `;
  }

  // Pre-fill direct WhatsApp Order link
  const directWhatsAppUrl = `https://wa.me/916302019925?text=Hi%20Varevva%20Restaurant,%20I%20would%20like%20to%20order%20${encodeURIComponent(item.name)}%20(Price:%20₹${item.price})%20from%20your%20website.`;

function cleanPath(url, fallback) {
  if (!url || typeof url !== 'string') return fallback;
  let clean = url.trim();
  if (clean.startsWith('/public/assets/')) {
    clean = clean.replace('/public/assets/', '/assets/');
  } else if (clean.startsWith('public/assets/')) {
    clean = clean.replace('public/assets/', '/assets/');
  } else if (clean.startsWith('assets/')) {
    clean = '/' + clean;
  }
  return clean || fallback;
}

  const mainImgUrl = cleanPath(item.image, fallbackImage);

  detailsContainer.innerHTML = `
    <div class="item-detail-card">
      
      <!-- Left Column: Product Photo -->
      <div class="item-detail-img-wrapper">
        <img class="item-detail-img" src="${mainImgUrl}" alt="${item.name}" onerror="this.onerror=null; this.src='${fallbackImage}';">
        <span class="detail-diet-badge ${dietBadgeClass}" title="${isVeg ? 'Vegetarian' : 'Non-Vegetarian'}">
          <span class="diet-dot"></span>
          ${isVeg ? 'Veg' : 'Non-Veg'}
        </span>
        ${item.popular ? `<span style="position: absolute; top: 16px; right: 16px; background-color: var(--accent-color); color: white; padding: 6px 12px; border-radius: 8px; font-family: var(--font-header); font-weight: 700; font-size: 0.8rem; box-shadow: var(--shadow-small); display: flex; align-items: center; gap: 6px;"><i class="fa-solid fa-fire"></i> Best Seller</span>` : ''}
      </div>

      <!-- Right Column: Info & Actions -->
      <div class="item-detail-info">
        <div>
          <span class="item-detail-category">
            ${getCategoryDisplayName(item.category)}
          </span>
          <h2 class="item-detail-title">
            ${item.name}
          </h2>
          <div class="item-detail-price">
            ₹${item.price}
          </div>
          <p class="item-detail-desc">
            ${item.description || 'Delicately prepared using age-old traditional recipes with premium freshly sourced ingredients and hand-ground spices. Infused with rich authentic Telangana flavors.'}
          </p>
          
          <div class="item-detail-meta-tags">
            <span class="item-detail-meta-tag"><i class="fa-solid fa-clock" style="color: var(--primary-color);"></i> 15-20 Mins Prep Time</span>
            <span class="item-detail-meta-tag"><i class="fa-solid fa-leaf" style="color: #24963f;"></i> No Added Color</span>
            <span class="item-detail-meta-tag"><i class="fa-solid fa-shield-halved" style="color: var(--accent-color);"></i> 100% Hygienic</span>
          </div>
        </div>

        <div class="item-detail-actions-divider">
          <!-- Primary Actions -->
          <div class="item-detail-actions-row">
            ${cartActionHTML}
            
            <a href="${directWhatsAppUrl}" target="_blank" class="btn-whatsapp-direct">
              <i class="fa-brands fa-whatsapp" style="font-size: 1.3rem;"></i> ORDER VIA WHATSAPP
            </a>
          </div>

          <!-- Share Action -->
          <button id="btn-share-dish" class="btn-share-dish">
            <i class="fa-solid fa-share-nodes"></i> Share this dish with friends
          </button>
        </div>

      </div>
    </div>
  `;

  // Bind share button click event
  const shareBtn = document.getElementById('btn-share-dish');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const shareUrl = window.location.href;
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          showShareToast(`Link copied to clipboard!`);
        })
        .catch(() => {
          showShareToast(`Failed to copy link. Please copy URL manually.`);
        });
    });
  }
}

// --- Render Related Items ---
function renderRelatedItems(activeItem) {
  // Find other items in the same category
  const related = currentMenu.filter(item => item.category === activeItem.category && item.id !== activeItem.id && !item.outOfStock);
  
  if (related.length === 0) {
    relatedItemsSection.style.display = 'none';
    return;
  }
  
  // Show section
  relatedItemsSection.style.display = 'block';
  relatedItemsGrid.innerHTML = '';
  
  // Pick up to 3 items
  const sliceCount = 3;
  const itemsToShow = related.slice(0, sliceCount);
  
  itemsToShow.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'related-item-card';
    card.style.animationDelay = `${index * 0.05}s`;
    
    const isVeg = item.type === 'veg';
    const dietIconClass = isVeg ? 'veg' : 'non-veg';
    const fallbackImage = isVeg ? '/assets/paneer_butter_masala.png' : '/assets/chicken_dum_biryani.png';
    
    card.innerHTML = `
      <div class="related-item-text">
        <div class="item-meta-row" style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span class="diet-badge-fssai ${dietIconClass}" title="${isVeg ? 'Vegetarian' : 'Non-Vegetarian'}">
            <span class="diet-dot"></span>
          </span>
          ${item.popular ? `<span class="popular-pill"><i class="fa-solid fa-fire"></i> Popular</span>` : ''}
        </div>
        <a href="/item.html?id=${item.id}" style="text-decoration: none; color: inherit;">
          <h3 class="related-item-name">${item.name}</h3>
        </a>
        <span class="related-item-price">₹${item.price}</span>
      </div>
      <div class="related-item-img-box">
        <a href="/item.html?id=${item.id}">
          <img class="related-item-img" src="${cleanPath(item.image, fallbackImage)}" alt="${item.name}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImage}';">
        </a>
      </div>
    `;
    
    relatedItemsGrid.appendChild(card);
  });
}

// --- Render Not Found ---
function renderNotFound() {
  detailsContainer.innerHTML = `
    <div style="text-align: center; padding: 80px 24px; background: white; border-radius: 20px; box-shadow: var(--shadow-medium);">
      <i class="fa-solid fa-face-frown fa-4x" style="color: var(--primary-color); margin-bottom: 20px;"></i>
      <h2 style="font-family: var(--font-header); font-size: 2rem; color: var(--secondary-color); margin-bottom: 10px;">Dish Not Found</h2>
      <p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 30px;">We couldn't find the dish you are looking for. It might have been updated or removed.</p>
      <a href="/menu.html" class="btn-primary" style="display: inline-block; text-decoration: none; padding: 12px 30px; border-radius: 50px; font-weight: 700;">
        Browse Full Menu
      </a>
    </div>
  `;
}

// --- Share Toast UI Helper ---
function showShareToast(message) {
  const existingToast = document.querySelector('.share-toast');
  if (existingToast) existingToast.remove();
  
  const toast = document.createElement('div');
  toast.className = 'share-toast';
  toast.innerText = message;
  
  // Style toast inline for simplicity and reliability
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '90px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#333',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '50px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: '9999',
    fontFamily: 'var(--font-header)',
    fontSize: '0.95rem',
    fontWeight: '600',
    opacity: '0',
    transition: 'opacity 0.3s ease'
  });
  
  document.body.appendChild(toast);
  
  // Fade In
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);
  
  // Fade Out & Remove
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
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

// --- Cart System (local copy matching main.js) ---
function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem('varevva_cart')) || {};
    let changed = false;
    // Sync price with currentMenu to prevent manipulation
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

function saveCart(cart) {
  localStorage.setItem('varevva_cart', JSON.stringify(cart));
  updateFloatingCartBar();
  
  // Re-render item details to reflect updated cart buttons
  if (itemId) {
    const item = findItemById(itemId);
    if (item) renderItemDetails(item);
  }
}

function addToCart(name, price) {
  const cart = getCart();
  if (cart[name]) {
    cart[name].quantity += 1;
  } else {
    cart[name] = { name, price: Number(price), quantity: 1 };
  }
  saveCart(cart);
}

function updateQuantity(name, change) {
  const cart = getCart();
  if (!cart[name]) return;
  
  cart[name].quantity += change;
  if (cart[name].quantity <= 0) {
    delete cart[name];
  }
  saveCart(cart);
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

// --- Cart Listeners ---
function initCartEventListeners() {
  document.body.addEventListener('click', (e) => {
    // Add to cart
    const addBtn = e.target.closest('.btn-add-zomato, .btn-detail-add');
    if (addBtn) {
      const name = addBtn.dataset.name;
      const price = addBtn.dataset.price;
      addToCart(name, price);
      return;
    }
    
    // Quantity Minus
    const minusBtn = e.target.closest('.btn-qty-minus');
    if (minusBtn) {
      const name = minusBtn.dataset.name;
      updateQuantity(name, -1);
      return;
    }
    
    // Quantity Plus
    const plusBtn = e.target.closest('.btn-qty-plus');
    if (plusBtn) {
      const name = plusBtn.dataset.name;
      updateQuantity(name, 1);
      return;
    }
    
    // Floating bar checkout redirect
    const orderBtn = e.target.closest('#btn-cart-whatsapp-order');
    if (orderBtn) {
      window.location.href = '/menu.html?checkout=true';
      return;
    }
  });
}
