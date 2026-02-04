import { TestimonialFormatted, TestimonialStorageItem, TestimonialJson } from '@/app/interfaces/testimonial.interface';
import { parseDate } from './date';
import testimonialsJson from '@/app/data/testimonials.json';

const STORAGE_KEY = 'testimonials-bakery:data';

function generateTestimonialId(testimonial: TestimonialJson, index: number): string {
  const base = `${testimonial.author || 'anon'}-${index}`;
  return base.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

export function getAllTestimonials(): TestimonialStorageItem[] {
  const staticTestimonials = (testimonialsJson as TestimonialJson[]).map((t, index) => ({
    ...t,
    id: generateTestimonialId(t, index),
    _isStatic: true,
    hide: false,
  }));

  let storageTestimonials: TestimonialStorageItem[] = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        storageTestimonials = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading testimonials from localStorage:', e);
    }
  }

  const storageIds = new Set(storageTestimonials.map(t => t.id));
  const merged = staticTestimonials.filter(t => !storageIds.has(t.id));

  return [...merged, ...storageTestimonials];
}

export function getVisibleTestimonials(): TestimonialFormatted[] {
  const allTestimonials = getAllTestimonials();

  return allTestimonials
    .filter(t => !t.hide)
    .map(t => ({
      text: t.text,
      imagePath: t.imagePath,
      author: t.author,
      role: t.role,
      company: t.company,
      date: t.date ? parseDate(t.date) : undefined,
    }));
}

export function saveTestimonialsToStorage(testimonials: TestimonialStorageItem[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(testimonials));
  }
}

export function getStorageTestimonials(): TestimonialStorageItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading testimonials from localStorage:', e);
  }

  return [];
}
