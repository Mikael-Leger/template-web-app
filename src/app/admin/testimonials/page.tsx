'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BsUpload, BsFileEarmarkText, BsCheck2, BsX, BsArrowLeft, BsPencil, BsTrash, BsPlus, BsEyeSlash, BsEye } from 'react-icons/bs';
import Link from 'next/link';

import { TestimonialStorageItem } from '@/app/interfaces/testimonial.interface';
import ConfirmationModal from '@/app/components/modal/confirmation-modal';
import testimonialsData from '@/app/data/testimonials.json';

import './testimonials-admin.scss';

const STORAGE_KEY = 'testimonials-bakery:data';

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ParseResult {
  testimonials: TestimonialStorageItem[];
  errors: ValidationError[];
}

type TabType = 'import' | 'list';

function generateTestimonialId(testimonial: TestimonialStorageItem, index: number): string {
  const base = `${testimonial.author || 'anon'}-${index}`;
  return base.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

export default function AdminTestimonialsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('list');

  // Import state
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Testimonial list state
  const [testimonials, setTestimonials] = useState<TestimonialStorageItem[]>([]);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialStorageItem | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mouseDownOnOverlay, setMouseDownOnOverlay] = useState(false);

  // Load testimonials on mount
  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = () => {
    // Get static testimonials
    const staticTestimonials = (testimonialsData as TestimonialStorageItem[]).map((t, index) => ({
      ...t,
      id: generateTestimonialId(t, index),
      _isStatic: true,
      hide: false,
    }));

    // Get imported testimonials from localStorage
    let importedTestimonials: TestimonialStorageItem[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        importedTestimonials = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading testimonials:', e);
    }

    // Filter out static testimonials that have been overridden
    const storageIds = new Set(importedTestimonials.map(t => t.id));
    const filteredStatic = staticTestimonials.filter(t => !storageIds.has(t.id));

    setTestimonials([...filteredStatic, ...importedTestimonials]);
  };

  const saveImportedTestimonials = (importedTestimonials: TestimonialStorageItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(importedTestimonials));
  };

  const getImportedTestimonials = (): TestimonialStorageItem[] => {
    return testimonials.filter(t => !t._isStatic);
  };

  const parseCSV = useCallback((content: string): ParseResult => {
    const lines = content.trim().split('\n');
    const parsedTestimonials: TestimonialStorageItem[] = [];
    const errors: ValidationError[] = [];

    if (lines.length < 2) {
      errors.push({ row: 0, field: 'file', message: 'CSV must have header row and at least one data row' });
      return { testimonials: parsedTestimonials, errors };
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    if (!headers.includes('text')) {
      errors.push({ row: 0, field: 'text', message: 'Missing required column: text' });
    }

    if (errors.length > 0) return { testimonials: parsedTestimonials, errors };

    for (let i = 1; i < lines.length; i++) {
      // Simple CSV parsing (doesn't handle quoted commas)
      const values = lines[i].split(',').map(v => v.trim());
      const row: Record<string, string> = {};

      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });

      if (!row.text) {
        errors.push({ row: i, field: 'text', message: 'Text is required' });
        continue;
      }

      const testimonial: TestimonialStorageItem = {
        id: `imported-${Date.now()}-${i}`,
        text: row.text,
        imagePath: row.imagepath || undefined,
        author: row.author || undefined,
        role: row.role || undefined,
        company: row.company || undefined,
        date: row.date || undefined,
        hide: row.hide === 'true',
        _isStatic: false,
      };

      parsedTestimonials.push(testimonial);
    }

    return { testimonials: parsedTestimonials, errors };
  }, []);

  const parseJSON = useCallback((content: string): ParseResult => {
    const parsedTestimonials: TestimonialStorageItem[] = [];
    const errors: ValidationError[] = [];

    try {
      const data = JSON.parse(content);
      const items = Array.isArray(data) ? data : [data];

      items.forEach((item, idx) => {
        if (!item.text) {
          errors.push({ row: idx, field: 'text', message: 'Text is required' });
          return;
        }

        parsedTestimonials.push({
          id: `imported-${Date.now()}-${idx}`,
          text: item.text,
          imagePath: item.imagePath,
          author: item.author,
          role: item.role,
          company: item.company,
          date: item.date,
          hide: item.hide || false,
          _isStatic: false,
        });
      });
    } catch (e) {
      errors.push({ row: 0, field: 'file', message: 'Invalid JSON format' });
    }

    return { testimonials: parsedTestimonials, errors };
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
    if (!parseResult || parseResult.testimonials.length === 0) return;
    setShowConfirmModal(true);
  }, [parseResult]);

  const confirmImport = useCallback(() => {
    if (!parseResult) return;

    setIsImporting(true);

    try {
      let existingImported: TestimonialStorageItem[] = [];

      if (importMode === 'append') {
        existingImported = getImportedTestimonials();
      }

      const newImported = [...existingImported, ...parseResult.testimonials];
      saveImportedTestimonials(newImported);

      setImportSuccess(true);
      setFile(null);
      setParseResult(null);
      loadTestimonials();
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

  // Testimonial editing
  const handleEdit = (testimonial: TestimonialStorageItem, index: number) => {
    setEditingTestimonial({ ...testimonial });
    setEditIndex(index);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingTestimonial || editIndex === null) return;

    const isStatic = testimonials[editIndex]._isStatic;

    if (isStatic) {
      // For static testimonials, save an override in localStorage
      const importedTestimonials = getImportedTestimonials();
      // Remove existing override if any
      const filtered = importedTestimonials.filter(t => t.id !== testimonials[editIndex].id);
      // Add the edited version
      filtered.push({ ...editingTestimonial, _isStatic: false });
      saveImportedTestimonials(filtered);
    } else {
      // For imported testimonials, update directly
      const importedTestimonials = getImportedTestimonials();
      const importIndex = importedTestimonials.findIndex(t => t.id === testimonials[editIndex].id);
      if (importIndex >= 0) {
        importedTestimonials[importIndex] = editingTestimonial;
        saveImportedTestimonials(importedTestimonials);
      }
    }

    loadTestimonials();
    setShowEditModal(false);
    setEditingTestimonial(null);
    setEditIndex(null);
  };

  const handleDelete = (index: number) => {
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteIndex === null) return;

    const testimonial = testimonials[deleteIndex];
    const isStatic = testimonial._isStatic;

    if (isStatic) {
      // For static testimonials, mark as hidden in localStorage
      const importedTestimonials = getImportedTestimonials();
      importedTestimonials.push({ ...testimonial, hide: true, _isStatic: false });
      saveImportedTestimonials(importedTestimonials);
    } else {
      // For imported testimonials, remove from localStorage
      const importedTestimonials = getImportedTestimonials();
      const filtered = importedTestimonials.filter(t => t.id !== testimonial.id);
      saveImportedTestimonials(filtered);
    }

    loadTestimonials();
    setShowDeleteModal(false);
    setDeleteIndex(null);
  };

  const handleToggleVisibility = (index: number) => {
    const testimonial = testimonials[index];
    const isStatic = testimonial._isStatic;

    if (isStatic) {
      // For static testimonials, save visibility override in localStorage
      const importedTestimonials = getImportedTestimonials();
      const existing = importedTestimonials.findIndex(t => t.id === testimonial.id);
      if (existing >= 0) {
        importedTestimonials[existing].hide = !testimonial.hide;
      } else {
        importedTestimonials.push({ ...testimonial, hide: !testimonial.hide, _isStatic: false });
      }
      saveImportedTestimonials(importedTestimonials);
    } else {
      // For imported testimonials, toggle directly
      const importedTestimonials = getImportedTestimonials();
      const idx = importedTestimonials.findIndex(t => t.id === testimonial.id);
      if (idx >= 0) {
        importedTestimonials[idx].hide = !importedTestimonials[idx].hide;
        saveImportedTestimonials(importedTestimonials);
      }
    }

    loadTestimonials();
  };

  const handleAddNew = () => {
    setEditingTestimonial({
      id: `new-${Date.now()}`,
      text: '',
      imagePath: '',
      author: '',
      role: '',
      company: '',
      date: '',
      hide: false,
      _isStatic: false,
    });
    setEditIndex(null);
    setShowEditModal(true);
  };

  const handleSaveNew = () => {
    if (!editingTestimonial || !editingTestimonial.text) {
      alert('Text is required');
      return;
    }

    const importedTestimonials = getImportedTestimonials();
    importedTestimonials.push(editingTestimonial);
    saveImportedTestimonials(importedTestimonials);

    loadTestimonials();
    setShowEditModal(false);
    setEditingTestimonial(null);
  };

  const updateEditingTestimonial = (field: keyof TestimonialStorageItem, value: unknown) => {
    if (!editingTestimonial) return;
    setEditingTestimonial({ ...editingTestimonial, [field]: value });
  };

  const filteredTestimonials = testimonials.filter(t =>
    t.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatRoleCompany = (testimonial: TestimonialStorageItem): string => {
    const parts = [];
    if (testimonial.role) parts.push(testimonial.role);
    if (testimonial.company) parts.push(`at ${testimonial.company}`);
    return parts.join(' ') || '-';
  };

  return (
    <div className="admin-testimonials">
      <div className="admin-testimonials-header">
        <Link href="/admin" className="admin-testimonials-back">
          <BsArrowLeft /> Back to Pages
        </Link>
        <h1>Testimonial Management</h1>
        <p>Import testimonials or manage them manually.</p>
      </div>

      {/* Tab Navigation */}
      <div className="admin-testimonials-tabs">
        <button
          className={`admin-testimonials-tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          Testimonials List
        </button>
        <button
          className={`admin-testimonials-tab ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
        >
          Import
        </button>
      </div>

      {activeTab === 'list' && (
        <>
          {/* Search and Add */}
          <div className="admin-testimonials-toolbar">
            <input
              type="text"
              placeholder="Search testimonials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-testimonials-search"
            />
            <button className="admin-testimonials-add-btn" onClick={handleAddNew}>
              <BsPlus /> Add Testimonial
            </button>
          </div>

          {/* Testimonials List */}
          <div className="admin-testimonials-list">
            {filteredTestimonials.length === 0 ? (
              <div className="admin-testimonials-empty">
                <p>No testimonials found. Import some or add manually.</p>
              </div>
            ) : (
              <div className="admin-testimonials-table-wrapper">
                <table className="admin-testimonials-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Author</th>
                      <th>Role / Company</th>
                      <th>Text</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTestimonials.map((testimonial, idx) => {
                      const isStatic = testimonial._isStatic;
                      return (
                        <tr key={testimonial.id || idx} className={testimonial.hide ? 'hidden-testimonial' : ''}>
                          <td>
                            {testimonial.imagePath ? (
                              <img
                                src={testimonial.imagePath.startsWith('/') ? testimonial.imagePath : `/images/testimonials/${testimonial.imagePath}`}
                                alt={testimonial.author || 'Testimonial'}
                                className="admin-testimonials-thumb"
                              />
                            ) : (
                              <div className="admin-testimonials-thumb" style={{ backgroundColor: 'var(--gray-200)' }} />
                            )}
                          </td>
                          <td>
                            <span className="admin-testimonials-author">{testimonial.author || 'Anonymous'}</span>
                            {isStatic && <span className="admin-testimonials-badge">Static</span>}
                          </td>
                          <td>
                            <span className="admin-testimonials-role-company">{formatRoleCompany(testimonial)}</span>
                          </td>
                          <td>
                            <span className="admin-testimonials-text-preview">{testimonial.text}</span>
                          </td>
                          <td>{testimonial.date || '-'}</td>
                          <td>
                            <span className={`admin-testimonials-status ${testimonial.hide ? 'hidden' : 'visible'}`}>
                              {testimonial.hide ? 'Hidden' : 'Visible'}
                            </span>
                          </td>
                          <td>
                            <div className="admin-testimonials-row-actions">
                              <button
                                className="admin-testimonials-row-btn"
                                onClick={() => handleToggleVisibility(idx)}
                                title={testimonial.hide ? 'Show' : 'Hide'}
                              >
                                {testimonial.hide ? <BsEye /> : <BsEyeSlash />}
                              </button>
                              <button
                                className="admin-testimonials-row-btn"
                                onClick={() => handleEdit(testimonial, idx)}
                                title="Edit"
                              >
                                <BsPencil />
                              </button>
                              <button
                                className="admin-testimonials-row-btn danger"
                                onClick={() => handleDelete(idx)}
                                title="Delete"
                              >
                                <BsTrash />
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
          <div className="admin-testimonials-upload">
            <div
              className="admin-testimonials-dropzone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <BsUpload className="admin-testimonials-dropzone-icon" />
              <p>Drag and drop a file here, or click to select</p>
              <span>Supports CSV and JSON formats</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            {file && (
              <div className="admin-testimonials-file">
                <BsFileEarmarkText />
                <span>{file.name}</span>
                <button onClick={() => { setFile(null); setParseResult(null); }}>
                  <BsX />
                </button>
              </div>
            )}
          </div>

          {/* Import Mode */}
          {parseResult && parseResult.testimonials.length > 0 && (
            <div className="admin-testimonials-mode">
              <label>
                <input
                  type="radio"
                  name="importMode"
                  value="append"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                />
                Append to existing testimonials
              </label>
              <label>
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                />
                Replace all imported testimonials
              </label>
            </div>
          )}

          {/* Validation Errors */}
          {parseResult && parseResult.errors.length > 0 && (
            <div className="admin-testimonials-errors">
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
          {parseResult && parseResult.testimonials.length > 0 && (
            <div className="admin-testimonials-preview">
              <h3>Preview ({parseResult.testimonials.length} testimonials)</h3>
              <div className="admin-testimonials-table-wrapper">
                <table className="admin-testimonials-table">
                  <thead>
                    <tr>
                      <th>Author</th>
                      <th>Role / Company</th>
                      <th>Text</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parseResult.testimonials.slice(0, 10).map((testimonial, idx) => (
                      <tr key={idx}>
                        <td>{testimonial.author || 'Anonymous'}</td>
                        <td>{formatRoleCompany(testimonial)}</td>
                        <td><span className="admin-testimonials-text-preview">{testimonial.text}</span></td>
                        <td>{testimonial.date || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parseResult.testimonials.length > 10 && (
                <p className="admin-testimonials-more">
                  And {parseResult.testimonials.length - 10} more testimonials...
                </p>
              )}
            </div>
          )}

          {/* Import Button */}
          {parseResult && parseResult.testimonials.length > 0 && (
            <div className="admin-testimonials-actions">
              <button
                className="admin-testimonials-import-btn"
                onClick={handleImport}
                disabled={isImporting}
              >
                {isImporting ? 'Importing...' : `Import ${parseResult.testimonials.length} Testimonials`}
              </button>
            </div>
          )}

          {/* Success Message */}
          {importSuccess && (
            <div className="admin-testimonials-success">
              <BsCheck2 />
              <span>Testimonials imported successfully!</span>
            </div>
          )}

          {/* Format Help */}
          <div className="admin-testimonials-help">
            <h3>File Format</h3>
            <div className="admin-testimonials-help-section">
              <h4>CSV Format</h4>
              <pre>
{`text,imagePath,author,role,company,date
"Great service!",customer1.png,John Doe,CEO,Acme Corp,15/01/2025
"Amazing products",customer2.png,Jane Smith,Customer,,20/01/2025`}
              </pre>
            </div>
            <div className="admin-testimonials-help-section">
              <h4>JSON Format</h4>
              <pre>
{`[
  {
    "text": "Great service!",
    "imagePath": "customer1.png",
    "author": "John Doe",
    "role": "CEO",
    "company": "Acme Corp",
    "date": "15/01/2025"
  }
]`}
              </pre>
            </div>
          </div>
        </>
      )}

      {/* Import Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Confirm Import"
        message={`Are you sure you want to ${importMode === 'replace' ? 'replace all testimonials with' : 'add'} ${parseResult?.testimonials.length || 0} testimonials?`}
        confirmLabel="Import"
        cancelLabel="Cancel"
        variant="info"
        onConfirm={confirmImport}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Testimonial"
        message={`Are you sure you want to delete this testimonial from "${deleteIndex !== null ? testimonials[deleteIndex]?.author || 'Anonymous' : ''}"?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Edit Modal */}
      {showEditModal && editingTestimonial && (
        <div
          className="admin-testimonials-modal-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && setMouseDownOnOverlay(true)}
          onMouseUp={(e) => {
            if (mouseDownOnOverlay && e.target === e.currentTarget) setShowEditModal(false);
            setMouseDownOnOverlay(false);
          }}
        >
          <div className="admin-testimonials-modal" onMouseDown={(e) => e.stopPropagation()}>
            <h2>{editIndex !== null ? 'Edit Testimonial' : 'Add Testimonial'}</h2>

            <div className="admin-testimonials-modal-form">
              <div className="admin-testimonials-modal-field">
                <label>Text *</label>
                <textarea
                  value={editingTestimonial.text}
                  onChange={(e) => updateEditingTestimonial('text', e.target.value)}
                  placeholder="Testimonial text..."
                  rows={4}
                />
              </div>

              <div className="admin-testimonials-modal-field">
                <label>Image Path</label>
                <input
                  type="text"
                  value={editingTestimonial.imagePath || ''}
                  onChange={(e) => updateEditingTestimonial('imagePath', e.target.value)}
                  placeholder="customer1.png or /images/testimonials/photo.jpg"
                />
                <span className="admin-testimonials-modal-field-hint">
                  Images should be placed in /public/images/testimonials/
                </span>
              </div>

              <div className="admin-testimonials-modal-row">
                <div className="admin-testimonials-modal-field">
                  <label>Author Name</label>
                  <input
                    type="text"
                    value={editingTestimonial.author || ''}
                    onChange={(e) => updateEditingTestimonial('author', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>

                <div className="admin-testimonials-modal-field">
                  <label>Date (DD/MM/YYYY)</label>
                  <input
                    type="text"
                    value={editingTestimonial.date || ''}
                    onChange={(e) => updateEditingTestimonial('date', e.target.value)}
                    placeholder="15/01/2025"
                  />
                </div>
              </div>

              <div className="admin-testimonials-modal-row">
                <div className="admin-testimonials-modal-field">
                  <label>Role</label>
                  <input
                    type="text"
                    value={editingTestimonial.role || ''}
                    onChange={(e) => updateEditingTestimonial('role', e.target.value)}
                    placeholder="CEO"
                  />
                </div>

                <div className="admin-testimonials-modal-field">
                  <label>Company</label>
                  <input
                    type="text"
                    value={editingTestimonial.company || ''}
                    onChange={(e) => updateEditingTestimonial('company', e.target.value)}
                    placeholder="Acme Corp"
                  />
                </div>
              </div>

              <div className="admin-testimonials-modal-field checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={editingTestimonial.hide || false}
                    onChange={(e) => updateEditingTestimonial('hide', e.target.checked)}
                  />
                  Hidden (not visible on the website)
                </label>
              </div>
            </div>

            <div className="admin-testimonials-modal-actions">
              <button
                className="admin-testimonials-modal-btn"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="admin-testimonials-modal-btn primary"
                onClick={editIndex !== null ? handleSaveEdit : handleSaveNew}
              >
                {editIndex !== null ? 'Save Changes' : 'Add Testimonial'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
