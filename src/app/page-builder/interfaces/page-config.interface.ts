/**
 * Page Builder Configuration Interfaces
 *
 * These interfaces define the structure for storing page configurations
 * as JSON, enabling a visual page builder experience.
 */

import React from 'react';

/**
 * Complete page configuration
 */
export interface PageConfig {
  id: string;
  slug: string;
  metadata: PageMetadata;
  components: ComponentInstance[];
  settings: PageSettings;
  createdAt: string;
  updatedAt: string;
  version: number;
}

/**
 * Page metadata for SEO and display
 */
export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
}

/**
 * Page-level settings
 */
export interface PageSettings {
  layout: 'default' | 'full-width' | 'sidebar';
  background?: {
    type: 'color' | 'image' | 'gradient';
    value: string;
  };
  spacing?: 'compact' | 'normal' | 'relaxed';
}

/**
 * A single component instance on a page
 */
export interface ComponentInstance {
  id: string;
  componentType: string;
  name?: string;
  props: Record<string, unknown>;
  children?: ComponentInstance[];
  order: number;
  locked?: boolean;
}

/**
 * Component categories for organization in the editor
 */
export type ComponentCategory =
  | 'layout'
  | 'content'
  | 'navigation'
  | 'interactive'
  | 'form'
  | 'business'
  | 'utility';

/**
 * Property definition for the component registry
 */
export interface PropDefinition {
  type: 'string' | 'textarea' | 'number' | 'boolean' | 'select' | 'color' | 'image' | 'array' | 'object' | 'icon' | 'dimension';
  label: string;
  description?: string;
  required?: boolean;
  defaultValue?: unknown;
  options?: { label: string; value: unknown }[];
  arrayItemSchema?: PropDefinition;
  objectSchema?: Record<string, PropDefinition>;
  min?: number;
  max?: number;
  showWhen?: { prop: string; equals: unknown }; // Conditional visibility
}

/**
 * Component registry entry with metadata
 */
export interface ComponentRegistryEntry {
  type?: string; // The registry key (e.g., 'Layout', 'Card')
  component: React.ComponentType<Record<string, unknown>>;
  displayName: string;
  category: ComponentCategory;
  icon: string;
  description: string;
  acceptsChildren: boolean;
  allowedChildren?: string[];
  propsSchema: Record<string, PropDefinition>;
  defaultProps: Record<string, unknown>;
  hideSpacing?: boolean; // Hide padding/margin controls in property panel
  isModifier?: boolean; // Component wraps existing components (can't be standalone)
}

/**
 * Create a new page config with defaults
 */

export function createPageConfig(overrides: Partial<PageConfig> = {}): PageConfig {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    slug: 'new-page',
    metadata: {
      title: 'New Page',
      description: '',
    },
    components: [],
    settings: {
      layout: 'default',
    },
    createdAt: now,
    updatedAt: now,
    version: 1,
    ...overrides,
  };
}

/**
 * Create a new component instance with defaults
 */
export function createComponentInstance(
  componentType: string,
  props: Record<string, unknown> = {},
  order: number = 0
): ComponentInstance {
  return {
    id: crypto.randomUUID(),
    componentType,
    props,
    order,
  };
}
