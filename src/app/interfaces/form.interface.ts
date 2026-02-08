export type FormFieldType = 'text' | 'email' | 'textarea' | 'number' | 'phone' | 'select';

export type FormFieldSize = 'full' | '1/2' | '1/3';

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldDefinition {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  type: FormFieldType;
  size: FormFieldSize;
  required?: boolean;
  options?: FormFieldOption[];
  order: number;
}

export interface FormStorageItem {
  id?: string;
  name: string;
  description?: string;
  fields: FormFieldDefinition[];
  successMessage: string;
  buttonLabel: string;
  hide?: boolean;
  _isStatic?: boolean;
}
