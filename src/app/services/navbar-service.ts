/**
 * Navbar Service
 *
 * Handles CRUD operations for navbar configuration.
 * Uses localStorage for persistence.
 */

import { NavbarConfig, NavbarItem, NavbarGroup, JustifyContent } from '../interfaces/navbar.interface';
import navbarItemsJson from '../data/navbar-items.json';

const STORAGE_KEY = 'navbar-config';
const DEFAULT_GROUP_ID = 'default-group';

/**
 * Get default navbar configuration from JSON data
 */
export function getDefaultNavbarConfig(): NavbarConfig {
  const defaultGroup: NavbarGroup = {
    id: DEFAULT_GROUP_ID,
    name: 'Main',
    justify: 'center',
    order: 0,
    gap: '8px',
  };

  const items: NavbarItem[] = navbarItemsJson.map((item, index) => ({
    id: `item-${index}`,
    title: item.title,
    url: item.url,
    main: item.main,
    image: item.image,
    icon: item.icon,
    separator: item.separator,
    order: index,
    groupId: DEFAULT_GROUP_ID,
  }));

  return {
    id: 'default-navbar',
    logo: {
      type: 'image',
      imageUrl: '/logo/logo-1.png',
      text: 'La Pâte Dorée',
      height: '50px',
    },
    groups: [defaultGroup],
    containerJustify: 'center',
    containerGap: '24px',
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
 * Migrate old config to new format with groups
 */
function migrateConfig(config: NavbarConfig): NavbarConfig {
  // If config already has groups, return as-is
  if (config.groups && config.groups.length > 0) {
    // Ensure all items have groupId
    const defaultGroupId = config.groups[0].id;
    const migratedItems = config.items.map(item => ({
      ...item,
      groupId: item.groupId || defaultGroupId,
    }));
    return { ...config, items: migratedItems };
  }

  // Create default group for old configs
  const defaultGroup: NavbarGroup = {
    id: DEFAULT_GROUP_ID,
    name: 'Main',
    justify: 'center',
    order: 0,
    gap: '8px',
  };

  // Assign all items to default group
  const migratedItems = config.items.map(item => ({
    ...item,
    groupId: DEFAULT_GROUP_ID,
  }));

  return {
    ...config,
    groups: [defaultGroup],
    containerJustify: config.containerJustify || 'center',
    containerGap: config.containerGap || '24px',
    items: migratedItems,
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
      const config = JSON.parse(stored);
      return migrateConfig(config);
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

// ============ Group Management ============

/**
 * Add a new group
 */
export function addNavbarGroup(config: NavbarConfig, group: Partial<NavbarGroup>): NavbarConfig {
  const newGroup: NavbarGroup = {
    id: crypto.randomUUID(),
    name: group.name || 'New Group',
    justify: group.justify || 'center',
    order: config.groups.length,
    gap: group.gap || '8px',
  };

  return {
    ...config,
    groups: [...config.groups, newGroup],
  };
}

/**
 * Update a group
 */
export function updateNavbarGroup(
  config: NavbarConfig,
  groupId: string,
  updates: Partial<NavbarGroup>
): NavbarConfig {
  return {
    ...config,
    groups: config.groups.map((group) =>
      group.id === groupId ? { ...group, ...updates } : group
    ),
  };
}

/**
 * Remove a group (moves items to first group)
 */
export function removeNavbarGroup(config: NavbarConfig, groupId: string): NavbarConfig {
  // Can't remove the last group
  if (config.groups.length <= 1) {
    return config;
  }

  const remainingGroups = config.groups.filter((g) => g.id !== groupId);
  const firstGroupId = remainingGroups[0].id;

  // Move items from deleted group to first group
  const updatedItems = config.items.map((item) =>
    item.groupId === groupId ? { ...item, groupId: firstGroupId } : item
  );

  return {
    ...config,
    groups: remainingGroups.map((g, index) => ({ ...g, order: index })),
    items: updatedItems,
  };
}

/**
 * Reorder groups
 */
export function reorderNavbarGroups(config: NavbarConfig, groupIds: string[]): NavbarConfig {
  const groupMap = new Map(config.groups.map((group) => [group.id, group]));
  const reorderedGroups = groupIds
    .map((id, index) => {
      const group = groupMap.get(id);
      return group ? { ...group, order: index } : null;
    })
    .filter((group): group is NavbarGroup => group !== null);

  return {
    ...config,
    groups: reorderedGroups,
  };
}

// ============ Item Management ============

/**
 * Add a new menu item
 */
export function addNavbarItem(config: NavbarConfig, item: Partial<NavbarItem>): NavbarConfig {
  const groupId = item.groupId || config.groups[0]?.id || DEFAULT_GROUP_ID;
  const groupItems = config.items.filter((i) => i.groupId === groupId);

  const newItem: NavbarItem = {
    id: crypto.randomUUID(),
    title: item.title || 'New Item',
    url: item.url || '/',
    main: item.main || false,
    image: item.image,
    icon: item.icon || 'BsLink45Deg',
    separator: item.separator || false,
    order: groupItems.length,
    groupId,
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
  const itemToRemove = config.items.find((i) => i.id === itemId);
  if (!itemToRemove) return config;

  const groupId = itemToRemove.groupId;

  return {
    ...config,
    items: config.items
      .filter((item) => item.id !== itemId)
      .map((item) => {
        // Reorder items within the same group
        if (item.groupId === groupId) {
          const groupItems = config.items
            .filter((i) => i.groupId === groupId && i.id !== itemId)
            .sort((a, b) => a.order - b.order);
          const newOrder = groupItems.findIndex((i) => i.id === item.id);
          return { ...item, order: newOrder };
        }
        return item;
      }),
  };
}

/**
 * Move item to a different group
 */
export function moveItemToGroup(
  config: NavbarConfig,
  itemId: string,
  targetGroupId: string
): NavbarConfig {
  const item = config.items.find((i) => i.id === itemId);
  if (!item || item.groupId === targetGroupId) return config;

  const targetGroupItems = config.items.filter((i) => i.groupId === targetGroupId);

  return {
    ...config,
    items: config.items.map((i) =>
      i.id === itemId
        ? { ...i, groupId: targetGroupId, order: targetGroupItems.length }
        : i
    ),
  };
}

/**
 * Reorder items within a group
 */
export function reorderNavbarItems(config: NavbarConfig, itemIds: string[]): NavbarConfig {
  const itemMap = new Map(config.items.map((item) => [item.id, item]));

  // Get the group of the first item to determine which group we're reordering
  const firstItem = itemMap.get(itemIds[0]);
  if (!firstItem) return config;

  const groupId = firstItem.groupId;

  // Update order only for items in this group
  const updatedItems = config.items.map((item) => {
    if (item.groupId === groupId) {
      const newOrder = itemIds.indexOf(item.id);
      return newOrder >= 0 ? { ...item, order: newOrder } : item;
    }
    return item;
  });

  return {
    ...config,
    items: updatedItems,
  };
}

/**
 * Get items for a specific group, sorted by order
 */
export function getGroupItems(config: NavbarConfig, groupId: string): NavbarItem[] {
  return config.items
    .filter((item) => item.groupId === groupId)
    .sort((a, b) => a.order - b.order);
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
  return migrateConfig(config);
}
