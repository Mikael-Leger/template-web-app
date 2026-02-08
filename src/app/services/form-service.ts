import { FormStorageItem } from '@/app/interfaces/form.interface';
import formsJson from '@/app/data/forms.json';

const STORAGE_KEY = 'forms-bakery:data';

function generateFormId(form: FormStorageItem, index: number): string {
  const base = `${form.name || 'form'}-${index}`;

  return base.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

export function getAllForms(): FormStorageItem[] {
  const staticForms = (formsJson as FormStorageItem[]).map((f, index) => ({
    ...f,
    id: generateFormId(f, index),
    _isStatic: true,
    hide: false,
  }));

  let storageForms: FormStorageItem[] = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        storageForms = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading forms from localStorage:', e);
    }
  }

  const storageIds = new Set(storageForms.map(f => f.id));
  const merged = staticForms.filter(f => !storageIds.has(f.id));

  return [...merged, ...storageForms];
}

export function getVisibleForms(): FormStorageItem[] {
  return getAllForms().filter(f => !f.hide);
}

export function getFormById(id: string): FormStorageItem | undefined {
  return getAllForms().find(f => f.id === id);
}

export function saveFormsToStorage(forms: FormStorageItem[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
  }
}

export function getStorageForms(): FormStorageItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading forms from localStorage:', e);
  }

  return [];
}
