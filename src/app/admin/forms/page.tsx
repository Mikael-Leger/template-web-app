'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BsUpload, BsFileEarmarkText, BsCheck2, BsX, BsArrowLeft, BsPencil, BsTrash, BsPlus, BsEyeSlash, BsEye, BsArrowUp, BsArrowDown } from 'react-icons/bs';
import Link from 'next/link';

import { FormStorageItem, FormFieldDefinition, FormFieldType, FormFieldSize, FormFieldOption } from '@/app/interfaces/form.interface';
import ConfirmationModal from '@/app/components/modal/confirmation-modal';
import formsData from '@/app/data/forms.json';

import './forms-admin.scss';

const STORAGE_KEY = 'forms-bakery:data';

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ParseResult {
  forms: FormStorageItem[];
  errors: ValidationError[];
}

type TabType = 'import' | 'list';

function generateFormId(form: FormStorageItem, index: number): string {
  const base = `${form.name || 'form'}-${index}`;

  return base.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

const FIELD_TYPE_OPTIONS: { label: string; value: FormFieldType }[] = [
  { label: 'Text', value: 'text' },
  { label: 'Email', value: 'email' },
  { label: 'Textarea', value: 'textarea' },
  { label: 'Number', value: 'number' },
  { label: 'Phone', value: 'phone' },
  { label: 'Select', value: 'select' },
];

const FIELD_SIZE_OPTIONS: { label: string; value: FormFieldSize }[] = [
  { label: 'Full Width', value: 'full' },
  { label: 'Half (1/2)', value: '1/2' },
  { label: 'Third (1/3)', value: '1/3' },
];

export default function AdminFormsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('list');

  // Import state
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form list state
  const [forms, setForms] = useState<FormStorageItem[]>([]);
  const [editingForm, setEditingForm] = useState<FormStorageItem | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mouseDownOnOverlay, setMouseDownOnOverlay] = useState(false);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = () => {
    const staticForms = (formsData as FormStorageItem[]).map((f, index) => ({
      ...f,
      id: generateFormId(f, index),
      _isStatic: true,
      hide: false,
    }));

    let importedForms: FormStorageItem[] = [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        importedForms = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading forms:', e);
    }

    const storageIds = new Set(importedForms.map(f => f.id));
    const filteredStatic = staticForms.filter(f => !storageIds.has(f.id));

    setForms([...filteredStatic, ...importedForms]);
  };

  const saveImportedForms = (importedForms: FormStorageItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(importedForms));
  };

  const getImportedForms = (): FormStorageItem[] => {
    return forms.filter(f => !f._isStatic);
  };

  const parseJSON = useCallback((content: string): ParseResult => {
    const parsedForms: FormStorageItem[] = [];
    const errors: ValidationError[] = [];

    try {
      const data = JSON.parse(content);
      const items = Array.isArray(data) ? data : [data];

      items.forEach((item, idx) => {
        if (!item.name) {
          errors.push({ row: idx, field: 'name', message: 'Name is required' });

          return;
        }

        parsedForms.push({
          id: `imported-${Date.now()}-${idx}`,
          name: item.name,
          description: item.description || '',
          fields: item.fields || [],
          successMessage: item.successMessage || '',
          buttonLabel: item.buttonLabel || 'Envoyer',
          hide: item.hide || false,
          _isStatic: false,
        });
      });
    } catch {
      errors.push({ row: 0, field: 'file', message: 'Invalid JSON format' });
    }

    return { forms: parsedForms, errors };
  }, []);

  const parseCSV = useCallback((content: string): ParseResult => {
    const lines = content.trim().split('\n');
    const parsedForms: FormStorageItem[] = [];
    const errors: ValidationError[] = [];

    if (lines.length < 2) {
      errors.push({ row: 0, field: 'file', message: 'CSV must have header row and at least one data row' });

      return { forms: parsedForms, errors };
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    if (!headers.includes('name')) {
      errors.push({ row: 0, field: 'name', message: 'Missing required column: name' });
    }

    if (errors.length > 0) return { forms: parsedForms, errors };

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: Record<string, string> = {};

      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });

      if (!row.name) {
        errors.push({ row: i, field: 'name', message: 'Name is required' });
        continue;
      }

      parsedForms.push({
        id: `imported-${Date.now()}-${i}`,
        name: row.name,
        description: row.description || '',
        fields: [],
        successMessage: row.successmessage || '',
        buttonLabel: row.buttonlabel || 'Envoyer',
        hide: row.hide === 'true',
        _isStatic: false,
      });
    }

    return { forms: parsedForms, errors };
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportSuccess(false);

    const content = await selectedFile.text();
    const isCSV = selectedFile.name.endsWith('.csv');
    const result = isCSV ? parseCSV(content) : parseJSON(content);

    setParseResult(result);
  }, [parseCSV, parseJSON]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    const isValid = droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.json');

    if (!isValid) {
      alert('Please drop a CSV or JSON file');

      return;
    }

    setFile(droppedFile);
    setImportSuccess(false);

    const content = await droppedFile.text();
    const isCSV = droppedFile.name.endsWith('.csv');
    const result = isCSV ? parseCSV(content) : parseJSON(content);

    setParseResult(result);
  }, [parseCSV, parseJSON]);

  const handleImport = useCallback(() => {
    if (!parseResult || parseResult.forms.length === 0) return;
    setShowConfirmModal(true);
  }, [parseResult]);

  const confirmImport = useCallback(() => {
    if (!parseResult) return;

    setIsImporting(true);

    try {
      let existingImported: FormStorageItem[] = [];

      if (importMode === 'append') {
        existingImported = getImportedForms();
      }

      const newImported = [...existingImported, ...parseResult.forms];

      saveImportedForms(newImported);

      setImportSuccess(true);
      setFile(null);
      setParseResult(null);
      loadForms();
    } catch (e) {
      console.error('Import failed:', e);
      alert('Import failed. Please try again.');
    } finally {
      setIsImporting(false);
      setShowConfirmModal(false);
    }
  }, [parseResult, importMode]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Form editing
  const handleEdit = (form: FormStorageItem, index: number) => {
    setEditingForm({
      ...form,
      fields: form.fields.map(f => ({ ...f, options: f.options ? f.options.map(o => ({ ...o })) : undefined })),
    });
    setEditIndex(index);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingForm || editIndex === null) return;

    const isStatic = forms[editIndex]._isStatic;

    if (isStatic) {
      const importedForms = getImportedForms();
      const filtered = importedForms.filter(f => f.id !== forms[editIndex].id);

      filtered.push({ ...editingForm, _isStatic: false });
      saveImportedForms(filtered);
    } else {
      const importedForms = getImportedForms();
      const importIndex = importedForms.findIndex(f => f.id === forms[editIndex].id);

      if (importIndex >= 0) {
        importedForms[importIndex] = editingForm;
        saveImportedForms(importedForms);
      }
    }

    loadForms();
    setShowEditModal(false);
    setEditingForm(null);
    setEditIndex(null);
  };

  const handleDelete = (index: number) => {
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteIndex === null) return;

    const form = forms[deleteIndex];
    const isStatic = form._isStatic;

    if (isStatic) {
      const importedForms = getImportedForms();

      importedForms.push({ ...form, hide: true, _isStatic: false });
      saveImportedForms(importedForms);
    } else {
      const importedForms = getImportedForms();
      const filtered = importedForms.filter(f => f.id !== form.id);

      saveImportedForms(filtered);
    }

    loadForms();
    setShowDeleteModal(false);
    setDeleteIndex(null);
  };

  const handleToggleVisibility = (index: number) => {
    const form = forms[index];
    const isStatic = form._isStatic;

    if (isStatic) {
      const importedForms = getImportedForms();
      const existing = importedForms.findIndex(f => f.id === form.id);

      if (existing >= 0) {
        importedForms[existing].hide = !form.hide;
      } else {
        importedForms.push({ ...form, hide: !form.hide, _isStatic: false });
      }
      saveImportedForms(importedForms);
    } else {
      const importedForms = getImportedForms();
      const idx = importedForms.findIndex(f => f.id === form.id);

      if (idx >= 0) {
        importedForms[idx].hide = !importedForms[idx].hide;
        saveImportedForms(importedForms);
      }
    }

    loadForms();
  };

  const handleAddNew = () => {
    setEditingForm({
      id: `new-${Date.now()}`,
      name: '',
      description: '',
      fields: [],
      successMessage: '',
      buttonLabel: 'Envoyer',
      hide: false,
      _isStatic: false,
    });
    setEditIndex(null);
    setShowEditModal(true);
  };

  const handleSaveNew = () => {
    if (!editingForm || !editingForm.name) {
      alert('Name is required');

      return;
    }

    const importedForms = getImportedForms();

    importedForms.push(editingForm);
    saveImportedForms(importedForms);

    loadForms();
    setShowEditModal(false);
    setEditingForm(null);
  };

  const updateEditingForm = (field: keyof FormStorageItem, value: unknown) => {
    if (!editingForm) return;
    setEditingForm({ ...editingForm, [field]: value });
  };

  // Field editing helpers
  const addField = () => {
    if (!editingForm) return;
    const newField: FormFieldDefinition = {
      id: `field-${Date.now()}`,
      name: '',
      label: '',
      placeholder: '',
      type: 'text',
      size: '1/2',
      required: false,
      order: editingForm.fields.length,
    };

    setEditingForm({
      ...editingForm,
      fields: [...editingForm.fields, newField],
    });
  };

  const removeField = (fieldIndex: number) => {
    if (!editingForm) return;
    const newFields = editingForm.fields.filter((_, i) => i !== fieldIndex);

    newFields.forEach((f, i) => f.order = i);
    setEditingForm({ ...editingForm, fields: newFields });
  };

  const updateField = (fieldIndex: number, key: keyof FormFieldDefinition, value: unknown) => {
    if (!editingForm) return;
    const newFields = [...editingForm.fields];

    newFields[fieldIndex] = { ...newFields[fieldIndex], [key]: value };
    setEditingForm({ ...editingForm, fields: newFields });
  };

  const moveField = (fieldIndex: number, direction: 'up' | 'down') => {
    if (!editingForm) return;
    const newFields = [...editingForm.fields];
    const targetIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;

    if (targetIndex < 0 || targetIndex >= newFields.length) return;

    [newFields[fieldIndex], newFields[targetIndex]] = [newFields[targetIndex], newFields[fieldIndex]];
    newFields.forEach((f, i) => f.order = i);
    setEditingForm({ ...editingForm, fields: newFields });
  };

  // Options helpers for select fields
  const addOption = (fieldIndex: number) => {
    if (!editingForm) return;
    const newFields = [...editingForm.fields];
    const field = { ...newFields[fieldIndex] };
    const options = field.options ? [...field.options] : [];

    options.push({ label: '', value: '' });
    field.options = options;
    newFields[fieldIndex] = field;
    setEditingForm({ ...editingForm, fields: newFields });
  };

  const removeOption = (fieldIndex: number, optIndex: number) => {
    if (!editingForm) return;
    const newFields = [...editingForm.fields];
    const field = { ...newFields[fieldIndex] };

    field.options = (field.options || []).filter((_, i) => i !== optIndex);
    newFields[fieldIndex] = field;
    setEditingForm({ ...editingForm, fields: newFields });
  };

  const updateOption = (fieldIndex: number, optIndex: number, key: keyof FormFieldOption, value: string) => {
    if (!editingForm) return;
    const newFields = [...editingForm.fields];
    const field = { ...newFields[fieldIndex] };
    const options = [...(field.options || [])];

    options[optIndex] = { ...options[optIndex], [key]: value };
    field.options = options;
    newFields[fieldIndex] = field;
    setEditingForm({ ...editingForm, fields: newFields });
  };

  const filteredForms = forms.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='admin-forms'>
      <div className='admin-forms-header'>
        <Link href='/admin' className='admin-forms-back'>
          <BsArrowLeft/> Back to Pages
        </Link>
        <h1>Form Management</h1>
        <p>Manage dynamic forms or import them.</p>
      </div>

      {/* Tab Navigation */}
      <div className='admin-forms-tabs'>
        <button
          className={`admin-forms-tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          Forms List
        </button>
        <button
          className={`admin-forms-tab ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
        >
          Import
        </button>
      </div>

      {activeTab === 'list' && (
        <>
          {/* Search and Add */}
          <div className='admin-forms-toolbar'>
            <input
              type='text'
              placeholder='Search forms...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='admin-forms-search'
            />
            <button className='admin-forms-add-btn' onClick={handleAddNew}>
              <BsPlus/> Add Form
            </button>
          </div>

          {/* Forms List */}
          <div className='admin-forms-list'>
            {filteredForms.length === 0 ? (
              <div className='admin-forms-empty'>
                <p>No forms found. Import some or add manually.</p>
              </div>
            ) : (
              <div className='admin-forms-table-wrapper'>
                <table className='admin-forms-table'>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Fields</th>
                      <th>Button Label</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredForms.map((form, idx) => {
                      const isStatic = form._isStatic;

                      return (
                        <tr key={form.id || idx} className={form.hide ? 'hidden-form' : ''}>
                          <td>
                            <span className='admin-forms-title-cell'>{form.name}</span>
                            {isStatic && <span className='admin-forms-badge'>Static</span>}
                          </td>
                          <td>{form.fields.length} fields</td>
                          <td>{form.buttonLabel || 'Envoyer'}</td>
                          <td>
                            <span className={`admin-forms-status ${form.hide ? 'hidden' : 'visible'}`}>
                              {form.hide ? 'Hidden' : 'Visible'}
                            </span>
                          </td>
                          <td>
                            <div className='admin-forms-row-actions'>
                              <button
                                className='admin-forms-row-btn'
                                onClick={() => handleToggleVisibility(idx)}
                                title={form.hide ? 'Show' : 'Hide'}
                              >
                                {form.hide ? <BsEye/> : <BsEyeSlash/>}
                              </button>
                              <button
                                className='admin-forms-row-btn'
                                onClick={() => handleEdit(form, idx)}
                                title='Edit'
                              >
                                <BsPencil/>
                              </button>
                              <button
                                className='admin-forms-row-btn danger'
                                onClick={() => handleDelete(idx)}
                                title='Delete'
                              >
                                <BsTrash/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'import' && (
        <>
          {/* Upload Section */}
          <div className='admin-forms-upload'>
            <div
              className='admin-forms-dropzone'
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <BsUpload className='admin-forms-dropzone-icon'/>
              <p>Drag and drop a file here, or click to select</p>
              <span>Supports CSV and JSON formats</span>
              <input
                ref={fileInputRef}
                type='file'
                accept='.csv,.json'
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            {file && (
              <div className='admin-forms-file'>
                <BsFileEarmarkText/>
                <span>{file.name}</span>
                <button onClick={() => { setFile(null); setParseResult(null); }}>
                  <BsX/>
                </button>
              </div>
            )}
          </div>

          {/* Import Mode */}
          {parseResult && parseResult.forms.length > 0 && (
            <div className='admin-forms-mode'>
              <label>
                <input
                  type='radio'
                  name='importMode'
                  value='append'
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                />
                Append to existing forms
              </label>
              <label>
                <input
                  type='radio'
                  name='importMode'
                  value='replace'
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                />
                Replace all imported forms
              </label>
            </div>
          )}

          {/* Validation Errors */}
          {parseResult && parseResult.errors.length > 0 && (
            <div className='admin-forms-errors'>
              <h3>Validation Errors</h3>
              <ul>
                {parseResult.errors.map((error, idx) => (
                  <li key={idx}>
                    Row {error.row + 1}: {error.field} - {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Table */}
          {parseResult && parseResult.forms.length > 0 && (
            <div className='admin-forms-preview'>
              <h3>Preview ({parseResult.forms.length} forms)</h3>
              <div className='admin-forms-table-wrapper'>
                <table className='admin-forms-table'>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Fields</th>
                      <th>Button Label</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parseResult.forms.slice(0, 10).map((form, idx) => (
                      <tr key={idx}>
                        <td>{form.name}</td>
                        <td>{form.fields.length} fields</td>
                        <td>{form.buttonLabel || 'Envoyer'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parseResult.forms.length > 10 && (
                <p className='admin-forms-more'>
                  And {parseResult.forms.length - 10} more forms...
                </p>
              )}
            </div>
          )}

          {/* Import Button */}
          {parseResult && parseResult.forms.length > 0 && (
            <div className='admin-forms-actions'>
              <button
                className='admin-forms-import-btn'
                onClick={handleImport}
                disabled={isImporting}
              >
                {isImporting ? 'Importing...' : `Import ${parseResult.forms.length} Forms`}
              </button>
            </div>
          )}

          {/* Success Message */}
          {importSuccess && (
            <div className='admin-forms-success'>
              <BsCheck2/>
              <span>Forms imported successfully!</span>
            </div>
          )}

          {/* Format Help */}
          <div className='admin-forms-help'>
            <h3>File Format</h3>
            <div className='admin-forms-help-section'>
              <h4>JSON Format (recommended)</h4>
              <pre>
                {JSON.stringify([{
                  name: 'Contact Form',
                  description: 'A contact form',
                  fields: [{
                    id: 'field-1', name: 'email', label: 'E-mail',
                    placeholder: 'john@example.com', type: 'email',
                    size: '1/2', required: true, order: 0,
                  }],
                  successMessage: 'Message sent!',
                  buttonLabel: 'Send',
                }], null, 2)}
              </pre>
            </div>
            <div className='admin-forms-help-section'>
              <h4>CSV Format (without fields)</h4>
              <pre>
                {'name,description,successMessage,buttonLabel\nContact Form,A contact form,Message sent!,Send'}
              </pre>
            </div>
          </div>
        </>
      )}

      {/* Import Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title='Confirm Import'
        message={`Are you sure you want to ${importMode === 'replace' ? 'replace all forms with' : 'add'} ${parseResult?.forms.length || 0} forms?`}
        confirmLabel='Import'
        cancelLabel='Cancel'
        variant='info'
        onConfirm={confirmImport}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title='Delete Form'
        message={`Are you sure you want to delete the form "${deleteIndex !== null ? forms[deleteIndex]?.name || 'Untitled' : ''}"?`}
        confirmLabel='Delete'
        cancelLabel='Cancel'
        variant='danger'
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Edit Modal */}
      {showEditModal && editingForm && (
        <div
          className='admin-forms-modal-overlay'
          onMouseDown={(e) => e.target === e.currentTarget && setMouseDownOnOverlay(true)}
          onMouseUp={(e) => {
            if (mouseDownOnOverlay && e.target === e.currentTarget) setShowEditModal(false);
            setMouseDownOnOverlay(false);
          }}
        >
          <div className='admin-forms-modal' onMouseDown={(e) => e.stopPropagation()}>
            <h2>{editIndex !== null ? 'Edit Form' : 'Add Form'}</h2>

            <div className='admin-forms-modal-form'>
              <div className='admin-forms-modal-field'>
                <label>Name *</label>
                <input
                  type='text'
                  value={editingForm.name}
                  onChange={(e) => updateEditingForm('name', e.target.value)}
                  placeholder='Form name'
                />
              </div>

              <div className='admin-forms-modal-field'>
                <label>Description</label>
                <input
                  type='text'
                  value={editingForm.description || ''}
                  onChange={(e) => updateEditingForm('description', e.target.value)}
                  placeholder='Optional description'
                />
              </div>

              <div className='admin-forms-modal-row'>
                <div className='admin-forms-modal-field'>
                  <label>Success Message</label>
                  <input
                    type='text'
                    value={editingForm.successMessage}
                    onChange={(e) => updateEditingForm('successMessage', e.target.value)}
                    placeholder='Message shown after submission'
                  />
                </div>

                <div className='admin-forms-modal-field'>
                  <label>Button Label</label>
                  <input
                    type='text'
                    value={editingForm.buttonLabel}
                    onChange={(e) => updateEditingForm('buttonLabel', e.target.value)}
                    placeholder='Envoyer'
                  />
                </div>
              </div>

              {/* Fields Editor */}
              <div className='admin-forms-fields-editor'>
                <div className='admin-forms-fields-editor-header'>
                  <h4>Fields ({editingForm.fields.length})</h4>
                  <button onClick={addField}>
                    <BsPlus/> Add Field
                  </button>
                </div>

                {editingForm.fields.map((field, fieldIndex) => (
                  <div key={field.id} className='admin-forms-fields-editor-item'>
                    <div className='admin-forms-fields-editor-item-header'>
                      <span>Field {fieldIndex + 1}{field.name ? ` - ${field.name}` : ''}</span>
                      <div className='admin-forms-fields-editor-item-header-actions'>
                        <button
                          onClick={() => moveField(fieldIndex, 'up')}
                          disabled={fieldIndex === 0}
                          title='Move up'
                        >
                          <BsArrowUp/>
                        </button>
                        <button
                          onClick={() => moveField(fieldIndex, 'down')}
                          disabled={fieldIndex === editingForm.fields.length - 1}
                          title='Move down'
                        >
                          <BsArrowDown/>
                        </button>
                        <button className='danger' onClick={() => removeField(fieldIndex)} title='Remove'>
                          <BsTrash/>
                        </button>
                      </div>
                    </div>
                    <div className='admin-forms-fields-editor-item-fields'>
                      <div className='field-col'>
                        <label>Name</label>
                        <input
                          type='text'
                          value={field.name}
                          onChange={(e) => updateField(fieldIndex, 'name', e.target.value)}
                          placeholder='email'
                        />
                      </div>
                      <div className='field-col'>
                        <label>Label</label>
                        <input
                          type='text'
                          value={field.label}
                          onChange={(e) => updateField(fieldIndex, 'label', e.target.value)}
                          placeholder='E-mail'
                        />
                      </div>
                      <div className='field-col'>
                        <label>Placeholder</label>
                        <input
                          type='text'
                          value={field.placeholder || ''}
                          onChange={(e) => updateField(fieldIndex, 'placeholder', e.target.value)}
                          placeholder='john@example.com'
                        />
                      </div>
                      <div className='field-col'>
                        <label>Type</label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(fieldIndex, 'type', e.target.value)}
                        >
                          {FIELD_TYPE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className='field-col'>
                        <label>Size</label>
                        <select
                          value={field.size}
                          onChange={(e) => updateField(fieldIndex, 'size', e.target.value)}
                        >
                          {FIELD_SIZE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className='field-checkbox'>
                        <input
                          type='checkbox'
                          id={`field-req-${fieldIndex}`}
                          checked={field.required || false}
                          onChange={(e) => updateField(fieldIndex, 'required', e.target.checked)}
                        />
                        <label htmlFor={`field-req-${fieldIndex}`}>Required</label>
                      </div>

                      {/* Options sub-editor for select type */}
                      {field.type === 'select' && (
                        <div className='admin-forms-fields-editor-options'>
                          <div className='admin-forms-fields-editor-options-header'>
                            <span>Options ({(field.options || []).length})</span>
                            <button onClick={() => addOption(fieldIndex)}>
                              <BsPlus/> Add
                            </button>
                          </div>
                          {(field.options || []).map((opt, optIndex) => (
                            <div key={optIndex} className='admin-forms-fields-editor-options-row'>
                              <input
                                type='text'
                                value={opt.label}
                                onChange={(e) => updateOption(fieldIndex, optIndex, 'label', e.target.value)}
                                placeholder='Label'
                              />
                              <input
                                type='text'
                                value={opt.value}
                                onChange={(e) => updateOption(fieldIndex, optIndex, 'value', e.target.value)}
                                placeholder='Value'
                              />
                              <button onClick={() => removeOption(fieldIndex, optIndex)}>
                                <BsX/>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className='admin-forms-modal-field checkbox'>
                <label>
                  <input
                    type='checkbox'
                    checked={editingForm.hide || false}
                    onChange={(e) => updateEditingForm('hide', e.target.checked)}
                  />
                  Hidden (not visible in the page builder)
                </label>
              </div>
            </div>

            <div className='admin-forms-modal-actions'>
              <button
                className='admin-forms-modal-btn'
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className='admin-forms-modal-btn primary'
                onClick={editIndex !== null ? handleSaveEdit : handleSaveNew}
              >
                {editIndex !== null ? 'Save Changes' : 'Add Form'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
