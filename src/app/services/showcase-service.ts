import { ShowcaseStorageItem } from '@/app/interfaces/showcase.interface';
import showcasesJson from '@/app/data/showcases.json';

const STORAGE_KEY = 'showcases-bakery:data';

function generateShowcaseId(showcase: ShowcaseStorageItem, index: number): string {
  const base = `${showcase.title || 'showcase'}-${index}`;
  return base.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

export function getAllShowcases(): ShowcaseStorageItem[] {
  const staticShowcases = (showcasesJson as ShowcaseStorageItem[]).map((s, index) => ({
    ...s,
    id: generateShowcaseId(s, index),
    _isStatic: true,
    hide: false,
  }));

  let storageShowcases: ShowcaseStorageItem[] = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        storageShowcases = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading showcases from localStorage:', e);
    }
  }

  const storageIds = new Set(storageShowcases.map(s => s.id));
  const merged = staticShowcases.filter(s => !storageIds.has(s.id));

  return [...merged, ...storageShowcases];
}

export function getVisibleShowcases(): ShowcaseStorageItem[] {
  return getAllShowcases().filter(s => !s.hide);
}

export function saveShowcasesToStorage(showcases: ShowcaseStorageItem[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(showcases));
  }
}

export function getStorageShowcases(): ShowcaseStorageItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading showcases from localStorage:', e);
  }

  return [];
}
