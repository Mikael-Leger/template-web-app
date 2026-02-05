/**
 * Page Service
 *
 * Handles CRUD operations for page configurations.
 * Currently uses JSON files stored in src/app/data/pages/
 *
 * In production, this would be replaced with API calls to a backend.
 */

import { PageConfig, createPageConfig } from '../interfaces/page-config.interface';

// Import page configs statically (for static site generation)
// These imports will be resolved at build time
import homePageConfig from '@/app/data/pages/home.json';
import deliveryPageConfig from '@/app/data/pages/delivery.json';

/**
 * Cache for loaded pages
 */
const pageCache: Map<string, PageConfig> = new Map();

/**
 * Available pages registry
 * Maps slug to the imported config
 */
const availablePages: Record<string, PageConfig> = {
  'home': homePageConfig as unknown as PageConfig,
  'delivery': deliveryPageConfig as unknown as PageConfig,
};

/**
 * Get a page by its slug
 */
export async function getPageBySlug(slug: string): Promise<PageConfig | null> {
  // Check cache first
  if (pageCache.has(slug)) {
    return pageCache.get(slug)!;
  }

  // Look up in available pages
  const page = availablePages[slug];

  if (page) {
    pageCache.set(slug, page);

    return page;
  }

  return null;
}

/**
 * Get a page by its ID
 */
export async function getPageById(id: string): Promise<PageConfig | null> {
  // Check localStorage first (for client-side edits)
  if (typeof window !== 'undefined') {
    const key = `page-builder:page:${id}`;
    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Fall through to default
      }
    }
  }

  // Search through all pages
  for (const page of Object.values(availablePages)) {
    if (page.id === id) {
      return page;
    }
  }

  return null;
}

/**
 * Get a page by ID (alias for getPageById)
 */
export async function getPage(id: string): Promise<PageConfig | null> {
  return getPageById(id);
}

/**
 * Get all page slugs (for static generation)
 */
export async function getAllPageSlugs(): Promise<string[]> {
  return Object.keys(availablePages);
}

/**
 * Get all pages
 */
export async function getAllPages(): Promise<PageConfig[]> {
  const pages = new Map<string, PageConfig>();

  // Add static pages
  for (const page of Object.values(availablePages)) {
    pages.set(page.id, page);
  }

  // Add pages from localStorage (these override static pages)
  if (typeof window !== 'undefined') {
    const storedPages = loadPagesFromStorage();

    for (const page of storedPages) {
      pages.set(page.id, page);
    }
  }

  return Array.from(pages.values());
}

/**
 * Save a page (client-side only - stores in localStorage for now)
 * In production, this would POST to an API
 */
export async function savePage(page: PageConfig, incrementVersion = false): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('savePage can only be called on the client');
  }

  // Update timestamps
  page.updatedAt = new Date().toISOString();

  if (incrementVersion) {
    page.version += 1;
  }

  // Store in localStorage
  const key = `page-builder:page:${page.id}`;

  localStorage.setItem(key, JSON.stringify(page));

  // Update cache
  pageCache.set(page.slug, page);
}

/**
 * Create a new page
 */
export async function createPage(
  pageOrSlug: PageConfig | string,
  metadata?: { title: string; description?: string }
): Promise<PageConfig> {
  let page: PageConfig;

  if (typeof pageOrSlug === 'string') {
    // Called with slug and metadata
    page = createPageConfig({
      slug: pageOrSlug,
      metadata: {
        title: metadata?.title || 'Untitled',
        description: metadata?.description || '',
      },
    });
  } else {
    // Called with full PageConfig
    page = pageOrSlug;
  }

  await savePage(page);

  return page;
}

/**
 * Delete a page (client-side only)
 */
export async function deletePage(id: string): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('deletePage can only be called on the client');
  }

  const key = `page-builder:page:${id}`;

  localStorage.removeItem(key);

  // Remove from cache
  for (const [slug, page] of pageCache.entries()) {
    if (page.id === id) {
      pageCache.delete(slug);
      break;
    }
  }
}

/**
 * Load pages from localStorage (for client-side editing)
 */
export function loadPagesFromStorage(): PageConfig[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const pages: PageConfig[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key?.startsWith('page-builder:page:')) {
      try {
        const data = localStorage.getItem(key);

        if (data) {
          pages.push(JSON.parse(data));
        }
      } catch {
        // Skip invalid entries
      }
    }
  }

  return pages;
}

/**
 * Export page as JSON string
 */
export function exportPageAsJson(page: PageConfig): string {
  return JSON.stringify(page, null, 2);
}

/**
 * Import page from JSON string
 */
export function importPageFromJson(json: string): PageConfig {
  const page = JSON.parse(json) as PageConfig;

  // Generate new ID to avoid conflicts
  page.id = crypto.randomUUID();
  page.createdAt = new Date().toISOString();
  page.updatedAt = new Date().toISOString();
  page.version = 1;

  return page;
}
