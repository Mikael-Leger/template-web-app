/**
 * Page Builder Module
 *
 * Central export for all page builder functionality.
 */

// Interfaces
export * from './interfaces/page-config.interface';

// Registry
export {
  getComponent,
  getComponentsByCategory,
  getAllComponents,
  getComponentTypes,
  getCategories,
  hasComponent,
} from './registry/component-registry';

// Renderer
export { default as PageRenderer } from './renderer/page-renderer';

// Services
export {
  getPageBySlug,
  getPageById,
  getAllPageSlugs,
  getAllPages,
  savePage,
  createPage,
  deletePage,
  loadPagesFromStorage,
  exportPageAsJson,
  importPageFromJson,
} from './services/page-service';
