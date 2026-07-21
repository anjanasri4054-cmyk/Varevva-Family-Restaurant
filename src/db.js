import { menuData } from './menuData.js';
import { defaultSpecials } from './specialsData.js';

let firebaseDb = null;
let useFirebase = false;

// Dynamic Script Loader Helper
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Initialize Database Layer
export async function initDatabase() {
  try {
    const response = await fetch('/firebase-config.json');
    if (!response.ok) {
      console.log('Firebase config not found or invalid. Falling back to local storage.');
      return false;
    }
    const config = await response.json();
    if (!config.apiKey || !config.databaseURL) {
      console.warn('Firebase config found but missing required fields.');
      return false;
    }

    // Load Firebase Compat SDK from CDN
    await loadScript('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
    await loadScript('https://www.gstatic.com/firebasejs/10.8.0/firebase-database-compat.js');

    // Initialize Firebase app
    if (!window.firebase.apps.length) {
      window.firebase.initializeApp(config);
    }
    firebaseDb = window.firebase.database();
    useFirebase = true;
    console.log('Firebase Realtime Database initialized successfully.');
    return true;
  } catch (error) {
    console.log('Error initializing Firebase:', error.message, 'Falling back to local storage.');
    return false;
  }
}

// Fetch Menu Data
export async function fetchMenuData() {
  if (useFirebase && firebaseDb) {
    try {
      const snapshot = await firebaseDb.ref('menu').once('value');
      const data = snapshot.val();
      if (data && Array.isArray(data) && data.length > 0) {
        return data;
      } else {
        console.log('Firebase menu is empty. Seeding with menuData.');
        await saveMenuData(menuData);
        return [...menuData];
      }
    } catch (e) {
      console.error('Error fetching menu from Firebase:', e);
    }
  }

  // Fallback: LocalStorage or static menuData
  let localMenu = [];
  try {
    localMenu = JSON.parse(localStorage.getItem('varevva_menu_data_v3'));
  } catch (e) {
    console.error('Error reading localStorage:', e);
  }

  if (!localMenu || !Array.isArray(localMenu) || localMenu.length === 0) {
    localMenu = menuData.map(item => ({ ...item }));
    localStorage.setItem('varevva_menu_data_v3', JSON.stringify(localMenu));
  } else {
    // Sync static images from menuData to reflect latest commits
    localMenu = localMenu.map(localItem => {
      const staticItem = menuData.find(m => m.name === localItem.name);
      if (staticItem && staticItem.image) {
        localItem.image = staticItem.image;
      }
      return localItem;
    });
    localStorage.setItem('varevva_menu_data_v3', JSON.stringify(localMenu));
  }
  return localMenu;
}

// Save Menu Data
export async function saveMenuData(menu) {
  localStorage.setItem('varevva_menu_data_v3', JSON.stringify(menu));

  if (useFirebase && firebaseDb) {
    try {
      await firebaseDb.ref('menu').set(menu);
      console.log('Synced menu to Firebase.');
    } catch (e) {
      console.error('Error syncing menu to Firebase:', e);
    }
  }

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    try {
      const response = await fetch('/api/save-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ menu })
      });
      if (response.ok) {
        console.log('Saved menu changes back to src/menuData.js via dev API.');
      } else {
        const err = await response.json();
        console.warn('Vite dev API save failed:', err.message);
      }
    } catch (e) {
      console.log('Vite dev API not active or unreachable.');
    }
  }
}

// Fetch Specials Data
export async function fetchSpecialsData() {
  if (useFirebase && firebaseDb) {
    try {
      const snapshot = await firebaseDb.ref('specials').once('value');
      const data = snapshot.val();
      if (data && Array.isArray(data) && data.length > 0) {
        return data;
      } else {
        console.log('Firebase specials are empty. Seeding with defaultSpecials.');
        await saveSpecialsData(defaultSpecials);
        return [...defaultSpecials];
      }
    } catch (e) {
      console.error('Error fetching specials from Firebase:', e);
    }
  }

  let localSpecials = [];
  try {
    localSpecials = JSON.parse(localStorage.getItem('varevva_specials_data_v3'));
  } catch (e) {
    console.error('Error reading localStorage:', e);
  }

  if (!localSpecials || !Array.isArray(localSpecials) || localSpecials.length === 0) {
    localSpecials = defaultSpecials.map(item => ({ ...item }));
    localStorage.setItem('varevva_specials_data_v3', JSON.stringify(localSpecials));
  } else {
    localSpecials = localSpecials.map(localItem => {
      const staticItem = defaultSpecials.find(s => s.id === localItem.id);
      if (staticItem && staticItem.image) {
        localItem.image = staticItem.image;
      }
      return localItem;
    });
    localStorage.setItem('varevva_specials_data_v3', JSON.stringify(localSpecials));
  }
  return localSpecials;
}

// Save Specials Data
export async function saveSpecialsData(specials) {
  localStorage.setItem('varevva_specials_data', JSON.stringify(specials));

  if (useFirebase && firebaseDb) {
    try {
      await firebaseDb.ref('specials').set(specials);
      console.log('Synced specials to Firebase.');
    } catch (e) {
      console.error('Error syncing specials to Firebase:', e);
    }
  }

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    try {
      const response = await fetch('/api/save-specials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ specials })
      });
      if (response.ok) {
        console.log('Saved specials changes back to src/specialsData.js via dev API.');
      } else {
        const err = await response.json();
        console.warn('Vite dev API specials save failed:', err.message);
      }
    } catch (e) {
      console.log('Vite dev API not active or unreachable.');
    }
  }
}
