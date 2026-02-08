'use client';

import React, { useState, useEffect } from 'react';
import Form, { FormField } from '@/app/components/form/form';
import { getFormById } from '@/app/services/form-service';
import { FormStorageItem, FormFieldDefinition } from '@/app/interfaces/form.interface';

interface ContactFormWrapperProps {
  formId?: string;
  successMessage?: string;
  buttonLabel?: string;
}

export default function ContactFormWrapper({
  formId,
  successMessage,
  buttonLabel,
}: ContactFormWrapperProps) {
  const [form, setForm] = useState<FormStorageItem | null>(null);

  useEffect(() => {
    if (formId) {
      const loaded = getFormById(formId);
      setForm(loaded || null);
    } else {
      setForm(null);
    }
  }, [formId]);

  if (!formId || !form) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--gray-400)' }}>
        Select a form in the property panel
      </div>
    );
  }

  // Sort fields by order
  const sortedFields = [...form.fields].sort((a, b) => a.order - b.order);

  // Group fields into rows based on size
  const fieldsByRows: FormField[] = [];
  let currentRow: FormFieldDefinition[] = [];
  let currentRowWidth = 0;

  for (const field of sortedFields) {
    const fieldWidth = field.size === 'full' ? 1 : field.size === '1/2' ? 0.5 : 1 / 3;

    // Textarea always gets its own row
    if (field.type === 'textarea') {
      if (currentRow.length > 0) {
        fieldsByRows.push({ items: currentRow.map(toFormItem) });
        currentRow = [];
        currentRowWidth = 0;
      }
      fieldsByRows.push({ items: [toFormItem(field)] });
      continue;
    }

    if (currentRowWidth + fieldWidth > 1.01) {
      fieldsByRows.push({ items: currentRow.map(toFormItem) });
      currentRow = [];
      currentRowWidth = 0;
    }

    currentRow.push(field);
    currentRowWidth += fieldWidth;

    if (currentRowWidth >= 0.99) {
      fieldsByRows.push({ items: currentRow.map(toFormItem) });
      currentRow = [];
      currentRowWidth = 0;
    }
  }

  if (currentRow.length > 0) {
    fieldsByRows.push({ items: currentRow.map(toFormItem) });
  }

  const onFormSubmit = async (): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 2000));

    return true;
  };

  const resolvedSuccessMessage = successMessage || form.successMessage;
  const resolvedButtonLabel = buttonLabel || form.buttonLabel;

  return (
    <Form
      fieldsByRows={fieldsByRows}
      onSubmit={onFormSubmit}
      successMessage={resolvedSuccessMessage}
      buttonLabel={resolvedButtonLabel}
    />
  );
}

function toFormItem(field: FormFieldDefinition) {
  return {
    name: field.name,
    title: field.label,
    placeholder: field.placeholder || '',
    type: field.type as 'text' | 'email' | 'textarea',
    required: field.required || false,
    options: field.options,
  };
}
