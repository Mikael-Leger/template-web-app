import { ProductItem } from '@/app/interfaces/product.interface';
import { slugify } from './formatter';
import productsData from '@/app/data/products.json';

const STORAGE_KEY = 'products-bakery:data';

/**
 * Get all products (static + imported from localStorage)
 */
export function getAllProducts(): ProductItem[] {
  // Start with static products
  let products = [...productsData] as ProductItem[];

  // Merge with localStorage if available (client-side only)
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const importedProducts = JSON.parse(stored) as ProductItem[];
        // Merge: imported products override static by title
        const staticTitles = new Set(products.map(p => p.title.toLowerCase()));
        const newProducts = importedProducts.filter(
          p => !staticTitles.has(p.title.toLowerCase())
        );
        products = [...products, ...newProducts];
      }
    } catch (e) {
      console.error('Error loading products from localStorage:', e);
    }
  }

  // Filter out hidden products
  return products.filter(p => !p.hide);
}

/**
 * Find a product by its slug
 */
export function findProductBySlug(slug: string): ProductItem | undefined {
  const products = getAllProducts();
  return products.find(p => slugify(p.title) === slug);
}

/**
 * Find products with matching tags (for related products)
 */
export function findRelatedProducts(
  currentProduct: ProductItem,
  limit: number = 4
): ProductItem[] {
  const products = getAllProducts();
  const currentTags = currentProduct.tags || [];
  const currentSlug = slugify(currentProduct.title);

  return products
    .filter(p => {
      // Exclude current product
      if (slugify(p.title) === currentSlug) return false;
      // Must have at least one matching tag
      return p.tags?.some(tag => currentTags.includes(tag)) ?? false;
    })
    .slice(0, limit);
}

/**
 * Get all unique tags from products
 */
export function getAllTags(): string[] {
  const products = getAllProducts();
  const tags = new Set<string>();

  products.forEach(p => {
    p.tags?.forEach(tag => tags.add(tag));
  });

  return Array.from(tags);
}
