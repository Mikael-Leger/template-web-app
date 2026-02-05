/**
 * Navbar Service
 *
 * Handles CRUD operations for navbar configuration.
 * Uses localStorage for persistence.
 */

import { NavbarConfig, NavbarItem } from '../interfaces/navbar.interface';
import navbarItemsJson from '../data/navbar-items.json';

const STORAGE_KEY = 'navbar-config';

/**
 * Get default navbar configuration from JSON data
 */
export function getDefaultNavbarConfig(): NavbarConfig {
  const items: NavbarItem[] = navbarItemsJson.map((item, index) => ({
    id: `item-${index}`,
    title: item.title,
    url: item.url,
    main: item.main,
    image: item.image,
    icon: item.icon,
    separator: item.separator,
    order: index,
  }));

  return {
    id: 'default-navbar',
    logo: {
      type: 'image',
      imageUrl: '/logo/logo-1.png',
      text: 'La Pâte Dorée',
      height: '50px',
    },
    items,
    appearance: {
      height: '80px',
      heightScrolled: '60px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backgroundColorScrolled: 'rgba(255, 255, 255, 0.98)',
      textColor: '#1a1a2e',
      textColorScrolled: '#1a1a2e',
      activeColor: '#e94560',
      hoverColor: '#e94560',
      borderBottom: true,
      backdropBlur: true,
      shadow: 'sm',
    },
    behavior: {
      sticky: true,
      scrollEffect: 'shrink',
      scrollThreshold: 50,
      mobileBreakpoint: 768,
    },
    typography: {
      fontSize: '14px',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Load navbar config from localStorage
 */
export function loadNavbarFromStorage(): NavbarConfig | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading navbar config from localStorage:', e);
  }

  return null;
}

/**
 * Get navbar configuration
 * Returns stored config or default if none exists
 */
export function getNavbarConfig(): NavbarConfig {
  const stored = loadNavbarFromStorage();
  if (stored) {
    return stored;
  }
  return getDefaultNavbarConfig();
}

/**
 * Save navbar configuration to localStorage
 */
export function saveNavbarConfig(config: NavbarConfig): void {
  if (typeof window === 'undefined') {
    throw new Error('saveNavbarConfig can only be called on the client');
  }

  config.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/**
 * Reset navbar configuration to defaults
 */
export function resetNavbarConfig(): NavbarConfig {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return getDefaultNavbarConfig();
}

/**
 * Add a new menu item
 */
export function addNavbarItem(config: NavbarConfig, item: Partial<NavbarItem>): NavbarConfig {
  const newItem: NavbarItem = {
    id: crypto.randomUUID(),
    title: item.title || 'New Item',
    url: item.url || '/',
    main: item.main || false,
    image: item.image,
    icon: item.icon || 'BsLink45Deg',
    separator: item.separator || false,
    order: config.items.length,
  };

  return {
    ...config,
    items: [...config.items, newItem],
  };
}

/**
 * Update a menu item
 */
export function updateNavbarItem(
  config: NavbarConfig,
  itemId: string,
  updates: Partial<NavbarItem>
): NavbarConfig {
  return {
    ...config,
    items: config.items.map((item) =>
      item.id === itemId ? { ...item, ...updates } : item
    ),
  };
}

/**
 * Remove a menu item
 */
export function removeNavbarItem(config: NavbarConfig, itemId: string): NavbarConfig {
  return {
    ...config,
    items: config.items
      .filter((item) => item.id !== itemId)
      .map((item, index) => ({ ...item, order: index })),
  };
}

/**
 * Reorder menu items
 */
export function reorderNavbarItems(config: NavbarConfig, itemIds: string[]): NavbarConfig {
  const itemMap = new Map(config.items.map((item) => [item.id, item]));
  const reorderedItems = itemIds
    .map((id, index) => {
      const item = itemMap.get(id);
      return item ? { ...item, order: index } : null;
    })
    .filter((item): item is NavbarItem => item !== null);

  return {
    ...config,
    items: reorderedItems,
  };
}

/**
 * Export navbar config as JSON string
 */
export function exportNavbarConfig(config: NavbarConfig): string {
  return JSON.stringify(config, null, 2);
}

/**
 * Import navbar config from JSON string
 */
export function importNavbarConfig(json: string): NavbarConfig {
  const config = JSON.parse(json) as NavbarConfig;
  config.id = crypto.randomUUID();
  config.updatedAt = new Date().toISOString();
  return config;
}
