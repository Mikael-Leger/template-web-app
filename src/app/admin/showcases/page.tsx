'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BsUpload, BsFileEarmarkText, BsCheck2, BsX, BsArrowLeft, BsPencil, BsTrash, BsPlus, BsEyeSlash, BsEye } from 'react-icons/bs';
import Link from 'next/link';

import { ShowcaseStorageItem, ShowcaseImage } from '@/app/interfaces/showcase.interface';
import ConfirmationModal from '@/app/components/modal/confirmation-modal';
import showcasesData from '@/app/data/showcases.json';

import './showcases-admin.scss';

const STORAGE_KEY = 'showcases-bakery:data';

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ParseResult {
  showcases: ShowcaseStorageItem[];
  errors: ValidationError[];
}

type TabType = 'import' | 'list';

function generateShowcaseId(showcase: ShowcaseStorageItem, index: number): string {
  const base = `${showcase.title || 'showcase'}-${index}`;
  return base.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

export default function AdminShowcasesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('list');

  // Import state
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Showcase list state
  const [showcases, setShowcases] = useState<ShowcaseStorageItem[]>([]);
  const [editingShowcase, setEditingShowcase] = useState<ShowcaseStorageItem | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mouseDownOnOverlay, setMouseDownOnOverlay] = useState(false);

  useEffect(() => {
    loadShowcases();
  }, []);

  const loadShowcases = () => {
    const staticShowcases = (showcasesData as ShowcaseStorageItem[]).map((s, index) => ({
      ...s,
      id: generateShowcaseId(s, index),
      _isStatic: true,
      hide: false,
    }));

    let importedShowcases: ShowcaseStorageItem[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        importedShowcases = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading showcases:', e);
    }

    const storageIds = new Set(importedShowcases.map(s => s.id));
    const filteredStatic = staticShowcases.filter(s => !storageIds.has(s.id));

    setShowcases([...filteredStatic, ...importedShowcases]);
  };

  const saveImportedShowcases = (importedShowcases: ShowcaseStorageItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(importedShowcases));
  };

  const getImportedShowcases = (): ShowcaseStorageItem[] => {
    return showcases.filter(s => !s._isStatic);
  };

  const parseJSON = useCallback((content: string): ParseResult => {
    const parsedShowcases: ShowcaseStorageItem[] = [];
    const errors: ValidationError[] = [];

    try {
      const data = JSON.parse(content);
      const items = Array.isArray(data) ? data : [data];

      items.forEach((item, idx) => {
        if (!item.title) {
          errors.push({ row: idx, field: 'title', message: 'Title is required' });
          return;
        }

        parsedShowcases.push({
          id: `imported-${Date.now()}-${idx}`,
          title: item.title,
          url: item.url || '',
          images: item.images || [],
          cardWidth: item.cardWidth,
          cardHeight: item.cardHeight,
          backgroundColor: item.backgroundColor,
          hide: item.hide || false,
          _isStatic: false,
        });
      });
    } catch {
      errors.push({ row: 0, field: 'file', message: 'Invalid JSON format' });
    }

    return { showcases: parsedShowcases, errors };
  }, []);

  const parseCSV = useCallback((content: string): ParseResult => {
    const lines = content.trim().split('\n');
    const parsedShowcases: ShowcaseStorageItem[] = [];
    const errors: ValidationError[] = [];

    if (lines.length < 2) {
      errors.push({ row: 0, field: 'file', message: 'CSV must have header row and at least one data row' });
      return { showcases: parsedShowcases, errors };
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    if (!headers.includes('title')) {
      errors.push({ row: 0, field: 'title', message: 'Missing required column: title' });
    }

    if (errors.length > 0) return { showcases: parsedShowcases, errors };

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: Record<string, string> = {};

      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });

      if (!row.title) {
        errors.push({ row: i, field: 'title', message: 'Title is required' });
        continue;
      }

      parsedShowcases.push({
        id: `imported-${Date.now()}-${i}`,
        title: row.title,
        url: row.url || '',
        images: [],
        cardWidth: row.cardwidth ? Number(row.cardwidth) : undefined,
        cardHeight: row.cardheight ? Number(row.cardheight) : undefined,
        backgroundColor: row.backgroundcolor || undefined,
        hide: row.hide === 'true',
        _isStatic: false,
      });
    }

    return { showcases: parsedShowcases, errors };
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
    if (!parseResult || parseResult.showcases.length === 0) return;
    setShowConfirmModal(true);
  }, [parseResult]);

  const confirmImport = useCallback(() => {
    if (!parseResult) return;

    setIsImporting(true);

    try {
      let existingImported: ShowcaseStorageItem[] = [];

      if (importMode === 'append') {
        existingImported = getImportedShowcases();
      }

      const newImported = [...existingImported, ...parseResult.showcases];
      saveImportedShowcases(newImported);

      setImportSuccess(true);
      setFile(null);
      setParseResult(null);
      loadShowcases();
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

  // Showcase editing
  const handleEdit = (showcase: ShowcaseStorageItem, index: number) => {
    setEditingShowcase({ ...showcase, images: showcase.images.map(img => ({ ...img })) });
    setEditIndex(index);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingShowcase || editIndex === null) return;

    const isStatic = showcases[editIndex]._isStatic;

    if (isStatic) {
      const importedShowcases = getImportedShowcases();
      const filtered = importedShowcases.filter(s => s.id !== showcases[editIndex].id);
      filtered.push({ ...editingShowcase, _isStatic: false });
      saveImportedShowcases(filtered);
    } else {
      const importedShowcases = getImportedShowcases();
      const importIndex = importedShowcases.findIndex(s => s.id === showcases[editIndex].id);
      if (importIndex >= 0) {
        importedShowcases[importIndex] = editingShowcase;
        saveImportedShowcases(importedShowcases);
      }
    }

    loadShowcases();
    setShowEditModal(false);
    setEditingShowcase(null);
    setEditIndex(null);
  };

  const handleDelete = (index: number) => {
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteIndex === null) return;

    const showcase = showcases[deleteIndex];
    const isStatic = showcase._isStatic;

    if (isStatic) {
      const importedShowcases = getImportedShowcases();
      importedShowcases.push({ ...showcase, hide: true, _isStatic: false });
      saveImportedShowcases(importedShowcases);
    } else {
      const importedShowcases = getImportedShowcases();
      const filtered = importedShowcases.filter(s => s.id !== showcase.id);
      saveImportedShowcases(filtered);
    }

    loadShowcases();
    setShowDeleteModal(false);
    setDeleteIndex(null);
  };

  const handleToggleVisibility = (index: number) => {
    const showcase = showcases[index];
    const isStatic = showcase._isStatic;

    if (isStatic) {
      const importedShowcases = getImportedShowcases();
      const existing = importedShowcases.findIndex(s => s.id === showcase.id);
      if (existing >= 0) {
        importedShowcases[existing].hide = !showcase.hide;
      } else {
        importedShowcases.push({ ...showcase, hide: !showcase.hide, _isStatic: false });
      }
      saveImportedShowcases(importedShowcases);
    } else {
      const importedShowcases = getImportedShowcases();
      const idx = importedShowcases.findIndex(s => s.id === showcase.id);
      if (idx >= 0) {
        importedShowcases[idx].hide = !importedShowcases[idx].hide;
        saveImportedShowcases(importedShowcases);
      }
    }

    loadShowcases();
  };

  const handleAddNew = () => {
    setEditingShowcase({
      id: `new-${Date.now()}`,
      title: '',
      url: '',
      images: [],
      cardWidth: 250,
      cardHeight: 250,
      backgroundColor: 'gradient',
      hide: false,
      _isStatic: false,
    });
    setEditIndex(null);
    setShowEditModal(true);
  };

  const handleSaveNew = () => {
    if (!editingShowcase || !editingShowcase.title) {
      alert('Title is required');
      return;
    }

    const importedShowcases = getImportedShowcases();
    importedShowcases.push(editingShowcase);
    saveImportedShowcases(importedShowcases);

    loadShowcases();
    setShowEditModal(false);
    setEditingShowcase(null);
  };

  const updateEditingShowcase = (field: keyof ShowcaseStorageItem, value: unknown) => {
    if (!editingShowcase) return;
    setEditingShowcase({ ...editingShowcase, [field]: value });
  };

  // Image editing helpers
  const addImage = () => {
    if (!editingShowcase) return;
    const newImage: ShowcaseImage = {
      path: '',
      style: {},
      animations: [],
    };
    setEditingShowcase({
      ...editingShowcase,
      images: [...editingShowcase.images, newImage],
    });
  };

  const removeImage = (imgIndex: number) => {
    if (!editingShowcase) return;
    setEditingShowcase({
      ...editingShowcase,
      images: editingShowcase.images.filter((_, i) => i !== imgIndex),
    });
  };

  const updateImage = (imgIndex: number, field: keyof ShowcaseImage, value: unknown) => {
    if (!editingShowcase) return;
    const newImages = [...editingShowcase.images];
    newImages[imgIndex] = { ...newImages[imgIndex], [field]: value };
    setEditingShowcase({ ...editingShowcase, images: newImages });
  };

  const updateImageStyleJson = (imgIndex: number, jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      updateImage(imgIndex, 'style', parsed);
    } catch {
      // Invalid JSON, don't update
    }
  };

  const updateImageAnimationsJson = (imgIndex: number, jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      updateImage(imgIndex, 'animations', parsed);
    } catch {
      // Invalid JSON, don't update
    }
  };

  const filteredShowcases = showcases.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.url?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-showcases">
      <div className="admin-showcases-header">
        <Link href="/admin" className="admin-showcases-back">
          <BsArrowLeft /> Back to Pages
        </Link>
        <h1>Showcase Management</h1>
        <p>Manage interactive showcase cards or import them.</p>
      </div>

      {/* Tab Navigation */}
      <div className="admin-showcases-tabs">
        <button
          className={`admin-showcases-tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          Showcases List
        </button>
        <button
          className={`admin-showcases-tab ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
        >
          Import
        </button>
      </div>

      {activeTab === 'list' && (
        <>
          {/* Search and Add */}
          <div className="admin-showcases-toolbar">
            <input
              type="text"
              placeholder="Search showcases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-showcases-search"
            />
            <button className="admin-showcases-add-btn" onClick={handleAddNew}>
              <BsPlus /> Add Showcase
            </button>
          </div>

          {/* Showcases List */}
          <div className="admin-showcases-list">
            {filteredShowcases.length === 0 ? (
              <div className="admin-showcases-empty">
                <p>No showcases found. Import some or add manually.</p>
              </div>
            ) : (
              <div className="admin-showcases-table-wrapper">
                <table className="admin-showcases-table">
                  <thead>
                    <tr>
                      <th>Images</th>
                      <th>Title</th>
                      <th>URL</th>
                      <th>Card Size</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShowcases.map((showcase, idx) => {
                      const isStatic = showcase._isStatic;
                      return (
                        <tr key={showcase.id || idx} className={showcase.hide ? 'hidden-showcase' : ''}>
                          <td>
                            <div className="admin-showcases-images-preview">
                              {showcase.images.slice(0, 3).map((img, imgIdx) => (
                                <img
                                  key={imgIdx}
                                  src={img.path}
                                  alt={img.alt || `Image ${imgIdx + 1}`}
                                />
                              ))}
                              {showcase.images.length === 0 && <span style={{ color: 'var(--gray-400)', fontSize: 'var(--font-size-xs)' }}>No images</span>}
                            </div>
                          </td>
                          <td>
                            <span className="admin-showcases-title-cell">{showcase.title}</span>
                            {isStatic && <span className="admin-showcases-badge">Static</span>}
                          </td>
                          <td>{showcase.url || '-'}</td>
                          <td>{showcase.cardWidth || 250} x {showcase.cardHeight || 250}</td>
                          <td>
                            <span className={`admin-showcases-status ${showcase.hide ? 'hidden' : 'visible'}`}>
                              {showcase.hide ? 'Hidden' : 'Visible'}
                            </span>
                          </td>
                          <td>
                            <div className="admin-showcases-row-actions">
                              <button
                                className="admin-showcases-row-btn"
                                onClick={() => handleToggleVisibility(idx)}
                                title={showcase.hide ? 'Show' : 'Hide'}
                              >
                                {showcase.hide ? <BsEye /> : <BsEyeSlash />}
                              </button>
                              <button
                                className="admin-showcases-row-btn"
                                onClick={() => handleEdit(showcase, idx)}
                                title="Edit"
                              >
                                <BsPencil />
                              </button>
                              <button
                                className="admin-showcases-row-btn danger"
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
          <div className="admin-showcases-upload">
            <div
              className="admin-showcases-dropzone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <BsUpload className="admin-showcases-dropzone-icon" />
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
              <div className="admin-showcases-file">
                <BsFileEarmarkText />
                <span>{file.name}</span>
                <button onClick={() => { setFile(null); setParseResult(null); }}>
                  <BsX />
                </button>
              </div>
            )}
          </div>

          {/* Import Mode */}
          {parseResult && parseResult.showcases.length > 0 && (
            <div className="admin-showcases-mode">
              <label>
                <input
                  type="radio"
                  name="importMode"
                  value="append"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                />
                Append to existing showcases
              </label>
              <label>
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                />
                Replace all imported showcases
              </label>
            </div>
          )}

          {/* Validation Errors */}
          {parseResult && parseResult.errors.length > 0 && (
            <div className="admin-showcases-errors">
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
          {parseResult && parseResult.showcases.length > 0 && (
            <div className="admin-showcases-preview">
              <h3>Preview ({parseResult.showcases.length} showcases)</h3>
              <div className="admin-showcases-table-wrapper">
                <table className="admin-showcases-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>URL</th>
                      <th>Images</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parseResult.showcases.slice(0, 10).map((showcase, idx) => (
                      <tr key={idx}>
                        <td>{showcase.title}</td>
                        <td>{showcase.url || '-'}</td>
                        <td>{showcase.images.length} images</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parseResult.showcases.length > 10 && (
                <p className="admin-showcases-more">
                  And {parseResult.showcases.length - 10} more showcases...
                </p>
              )}
            </div>
          )}

          {/* Import Button */}
          {parseResult && parseResult.showcases.length > 0 && (
            <div className="admin-showcases-actions">
              <button
                className="admin-showcases-import-btn"
                onClick={handleImport}
                disabled={isImporting}
              >
                {isImporting ? 'Importing...' : `Import ${parseResult.showcases.length} Showcases`}
              </button>
            </div>
          )}

          {/* Success Message */}
          {importSuccess && (
            <div className="admin-showcases-success">
              <BsCheck2 />
              <span>Showcases imported successfully!</span>
            </div>
          )}

          {/* Format Help */}
          <div className="admin-showcases-help">
            <h3>File Format</h3>
            <div className="admin-showcases-help-section">
              <h4>JSON Format (recommended for images)</h4>
              <pre>
{`[
  {
    "title": "My Showcase",
    "url": "/my-page",
    "images": [
      {
        "path": "/images/showcases/img.png",
        "style": { "width": 100, "top": 20 },
        "animations": [{ "to": { "y": -10 } }]
      }
    ],
    "cardWidth": 250,
    "cardHeight": 250,
    "backgroundColor": "gradient"
  }
]`}
              </pre>
            </div>
            <div className="admin-showcases-help-section">
              <h4>CSV Format (without images)</h4>
              <pre>
{`title,url,cardWidth,cardHeight,backgroundColor
My Showcase,/my-page,250,250,gradient`}
              </pre>
            </div>
          </div>
        </>
      )}

      {/* Import Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Confirm Import"
        message={`Are you sure you want to ${importMode === 'replace' ? 'replace all showcases with' : 'add'} ${parseResult?.showcases.length || 0} showcases?`}
        confirmLabel="Import"
        cancelLabel="Cancel"
        variant="info"
        onConfirm={confirmImport}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Showcase"
        message={`Are you sure you want to delete the showcase "${deleteIndex !== null ? showcases[deleteIndex]?.title || 'Untitled' : ''}"?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Edit Modal */}
      {showEditModal && editingShowcase && (
        <div
          className="admin-showcases-modal-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && setMouseDownOnOverlay(true)}
          onMouseUp={(e) => {
            if (mouseDownOnOverlay && e.target === e.currentTarget) setShowEditModal(false);
            setMouseDownOnOverlay(false);
          }}
        >
          <div className="admin-showcases-modal" onMouseDown={(e) => e.stopPropagation()}>
            <h2>{editIndex !== null ? 'Edit Showcase' : 'Add Showcase'}</h2>

            <div className="admin-showcases-modal-form">
              <div className="admin-showcases-modal-field">
                <label>Title *</label>
                <input
                  type="text"
                  value={editingShowcase.title}
                  onChange={(e) => updateEditingShowcase('title', e.target.value)}
                  placeholder="Showcase title"
                />
              </div>

              <div className="admin-showcases-modal-field">
                <label>URL</label>
                <input
                  type="text"
                  value={editingShowcase.url || ''}
                  onChange={(e) => updateEditingShowcase('url', e.target.value)}
                  placeholder="/products"
                />
                <span className="admin-showcases-modal-field-hint">
                  Page to navigate to when clicked
                </span>
              </div>

              <div className="admin-showcases-modal-row">
                <div className="admin-showcases-modal-field">
                  <label>Card Width</label>
                  <input
                    type="number"
                    value={editingShowcase.cardWidth || 250}
                    onChange={(e) => updateEditingShowcase('cardWidth', Number(e.target.value))}
                    min={100}
                    max={600}
                  />
                </div>

                <div className="admin-showcases-modal-field">
                  <label>Card Height</label>
                  <input
                    type="number"
                    value={editingShowcase.cardHeight || 250}
                    onChange={(e) => updateEditingShowcase('cardHeight', Number(e.target.value))}
                    min={100}
                    max={600}
                  />
                </div>
              </div>

              <div className="admin-showcases-modal-field">
                <label>Background Color</label>
                <input
                  type="text"
                  value={editingShowcase.backgroundColor || 'gradient'}
                  onChange={(e) => updateEditingShowcase('backgroundColor', e.target.value)}
                  placeholder="gradient, #ffffff, or any CSS color"
                />
              </div>

              {/* Images Editor */}
              <div className="admin-showcases-images-editor">
                <div className="admin-showcases-images-editor-header">
                  <h4>Images ({editingShowcase.images.length})</h4>
                  <button onClick={addImage}>
                    <BsPlus /> Add Image
                  </button>
                </div>

                {editingShowcase.images.map((image, imgIndex) => (
                  <div key={imgIndex} className="admin-showcases-images-editor-item">
                    <div className="admin-showcases-images-editor-item-header">
                      <span>Image {imgIndex + 1}</span>
                      <button onClick={() => removeImage(imgIndex)}>
                        <BsTrash />
                      </button>
                    </div>
                    <div className="admin-showcases-images-editor-item-fields">
                      <label>Path</label>
                      <input
                        type="text"
                        value={image.path}
                        onChange={(e) => updateImage(imgIndex, 'path', e.target.value)}
                        placeholder="/images/showcases/image.png"
                      />

                      <label>Style (JSON)</label>
                      <textarea
                        defaultValue={JSON.stringify(image.style || {}, null, 2)}
                        onBlur={(e) => updateImageStyleJson(imgIndex, e.target.value)}
                        placeholder='{"width": 100, "top": 20}'
                      />

                      <label>Animations (JSON)</label>
                      <textarea
                        defaultValue={JSON.stringify(image.animations || [], null, 2)}
                        onBlur={(e) => updateImageAnimationsJson(imgIndex, e.target.value)}
                        placeholder='[{"to": {"y": -10}}]'
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="admin-showcases-modal-field checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={editingShowcase.hide || false}
                    onChange={(e) => updateEditingShowcase('hide', e.target.checked)}
                  />
                  Hidden (not visible on the website)
                </label>
              </div>
            </div>

            <div className="admin-showcases-modal-actions">
              <button
                className="admin-showcases-modal-btn"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="admin-showcases-modal-btn primary"
                onClick={editIndex !== null ? handleSaveEdit : handleSaveNew}
              >
                {editIndex !== null ? 'Save Changes' : 'Add Showcase'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
