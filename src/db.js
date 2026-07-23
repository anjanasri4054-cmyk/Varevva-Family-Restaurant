import { menuData } from './menuData.js';
import { defaultSpecials } from './specialsData.js';

export async function initDatabase() {
  return true;
}

// Helper to adapt MongoDB MenuItem schema to existing front-end properties
function adaptMenuItem(item) {
  return {
    ...item,
    id: item._id,
    type: item.category === 'rotis' ? 'veg' : 'non-veg', // Simple diet mapping
    popular: item.featured || false,
    outOfStock: item.availability !== undefined ? !item.availability : false
  };
}

// Fetch Menu Data
export async function fetchMenuData() {
  try {
    const response = await fetch('/api/menu');
    if (response.ok) {
      const items = await response.json();
      if (Array.isArray(items) && items.length > 0) {
        return items.map(adaptMenuItem);
      }
    }
  } catch (e) {
    console.warn('Error fetching menu from MongoDB. Falling back to local storage.', e);
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
  }
  return localMenu;
}

// Fetch Specials Data
export async function fetchSpecialsData() {
  try {
    const response = await fetch('/api/menu');
    if (response.ok) {
      const items = await response.json();
      // Filter for featured specials
      const specials = items.filter(item => item.featured).map(adaptMenuItem);
      if (specials.length > 0) {
        return specials;
      }
    }
  } catch (e) {
    console.warn('Error fetching specials from MongoDB. Falling back to default specials.', e);
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
  }
  return localSpecials;
}

// Save mock helper for out of stock fallback states
export async function saveMenuData(menu) {
  localStorage.setItem('varevva_menu_data_v3', JSON.stringify(menu));
}

export async function saveSpecialsData(specials) {
  localStorage.setItem('varevva_specials_data_v3', JSON.stringify(specials));
}
