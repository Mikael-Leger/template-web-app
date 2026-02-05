'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BsUpload, BsFileEarmarkText, BsCheck2, BsX, BsArrowLeft, BsPencil, BsTrash, BsPlus, BsEyeSlash, BsEye } from 'react-icons/bs';
import Link from 'next/link';

import { ProductItem, PriceType } from '@/app/interfaces/product.interface';
import ConfirmationModal from '@/app/components/modal/confirmation-modal';
import productsData from '@/app/data/products.json';

import './products-admin.scss';

const STORAGE_KEY = 'products-bakery:data';

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ParseResult {
  products: ProductItem[];
  errors: ValidationError[];
}

type TabType = 'import' | 'list';

export default function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('list');

  // Import state
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Product list state
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mouseDownOnOverlay, setMouseDownOnOverlay] = useState(false);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    // Get static products
    const staticProducts = [...productsData] as ProductItem[];

    // Get imported products from localStorage
    let importedProducts: ProductItem[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        importedProducts = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading products:', e);
    }

    // Mark static products
    const markedStatic = staticProducts.map(p => ({ ...p, _isStatic: true }));
    const markedImported = importedProducts.map(p => ({ ...p, _isStatic: false }));

    setProducts([...markedStatic, ...markedImported] as ProductItem[]);
  };

  const saveImportedProducts = (importedProducts: ProductItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(importedProducts));
  };

  const getImportedProducts = (): ProductItem[] => {
    return products.filter(p => !(p as unknown as {_isStatic: boolean})._isStatic);
  };

  const parseCSV = useCallback((content: string): ParseResult => {
    const lines = content.trim().split('\n');
    const parsedProducts: ProductItem[] = [];
    const errors: ValidationError[] = [];

    if (lines.length < 2) {
      errors.push({ row: 0, field: 'file', message: 'CSV must have header row and at least one data row' });
      return { products: parsedProducts, errors };
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['title', 'image'];

    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        errors.push({ row: 0, field: required, message: `Missing required column: ${required}` });
      }
    }

    if (errors.length > 0) return { products: parsedProducts, errors };

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
      if (!row.image) {
        errors.push({ row: i, field: 'image', message: 'Image is required' });
        continue;
      }

      const product: ProductItem = {
        title: row.title,
        image: row.image,
        short_description: row.short_description || undefined,
        long_description: row.long_description || undefined,
        quantity: row.quantity || undefined,
        priceByDosage: row.pricebydosage || undefined,
        tags: row.tags ? row.tags.split(';').map(t => t.trim()) : undefined,
        hide: row.hide === 'true',
      };

      if (row.price_new && row.price_old) {
        product.price = {
          new: parseFloat(row.price_new),
          old: parseFloat(row.price_old),
        };
      } else if (row.price) {
        product.price = parseFloat(row.price);
      }

      parsedProducts.push(product);
    }

    return { products: parsedProducts, errors };
  }, []);

  const parseJSON = useCallback((content: string): ParseResult => {
    const parsedProducts: ProductItem[] = [];
    const errors: ValidationError[] = [];

    try {
      const data = JSON.parse(content);
      const items = Array.isArray(data) ? data : [data];

      items.forEach((item, idx) => {
        if (!item.title) {
          errors.push({ row: idx, field: 'title', message: 'Title is required' });
          return;
        }
        if (!item.image) {
          errors.push({ row: idx, field: 'image', message: 'Image is required' });
          return;
        }

        parsedProducts.push({
          title: item.title,
          image: item.image,
          short_description: item.short_description,
          long_description: item.long_description,
          price: item.price,
          priceByDosage: item.priceByDosage,
          quantity: item.quantity,
          tags: item.tags,
          hide: item.hide,
        });
      });
    } catch (e) {
      errors.push({ row: 0, field: 'file', message: 'Invalid JSON format' });
    }

    return { products: parsedProducts, errors };
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
    if (!parseResult || parseResult.products.length === 0) return;
    setShowConfirmModal(true);
  }, [parseResult]);

  const confirmImport = useCallback(() => {
    if (!parseResult) return;

    setIsImporting(true);

    try {
      let existingImported: ProductItem[] = [];

      if (importMode === 'append') {
        existingImported = getImportedProducts();
      }

      const newImported = [...existingImported, ...parseResult.products];
      saveImportedProducts(newImported);

      setImportSuccess(true);
      setFile(null);
      setParseResult(null);
      loadProducts();
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

  // Product editing
  const handleEdit = (product: ProductItem, index: number) => {
    setEditingProduct({ ...product });
    setEditIndex(index);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingProduct || editIndex === null) return;

    const isStatic = (products[editIndex] as unknown as {_isStatic: boolean})._isStatic;

    if (isStatic) {
      // For static products, we save an override in localStorage
      const importedProducts = getImportedProducts();
      // Remove existing override if any
      const filtered = importedProducts.filter(p => p.title !== products[editIndex].title);
      // Add the edited version
      filtered.push({ ...editingProduct, _isStatic: false } as ProductItem);
      saveImportedProducts(filtered);
    } else {
      // For imported products, update directly
      const importedProducts = getImportedProducts();
      const importIndex = importedProducts.findIndex(p => p.title === products[editIndex].title);
      if (importIndex >= 0) {
        importedProducts[importIndex] = editingProduct;
        saveImportedProducts(importedProducts);
      }
    }

    loadProducts();
    setShowEditModal(false);
    setEditingProduct(null);
    setEditIndex(null);
  };

  const handleDelete = (index: number) => {
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteIndex === null) return;

    const product = products[deleteIndex];
    const isStatic = (product as unknown as {_isStatic: boolean})._isStatic;

    if (isStatic) {
      // For static products, mark as hidden in localStorage
      const importedProducts = getImportedProducts();
      importedProducts.push({ ...product, hide: true, _isStatic: false } as ProductItem);
      saveImportedProducts(importedProducts);
    } else {
      // For imported products, remove from localStorage
      const importedProducts = getImportedProducts();
      const filtered = importedProducts.filter(p => p.title !== product.title);
      saveImportedProducts(filtered);
    }

    loadProducts();
    setShowDeleteModal(false);
    setDeleteIndex(null);
  };

  const handleToggleVisibility = (index: number) => {
    const product = products[index];
    const isStatic = (product as unknown as {_isStatic: boolean})._isStatic;

    if (isStatic) {
      // For static products, save visibility override in localStorage
      const importedProducts = getImportedProducts();
      const existing = importedProducts.findIndex(p => p.title === product.title);
      if (existing >= 0) {
        importedProducts[existing].hide = !product.hide;
      } else {
        importedProducts.push({ ...product, hide: !product.hide, _isStatic: false } as ProductItem);
      }
      saveImportedProducts(importedProducts);
    } else {
      // For imported products, toggle directly
      const importedProducts = getImportedProducts();
      const idx = importedProducts.findIndex(p => p.title === product.title);
      if (idx >= 0) {
        importedProducts[idx].hide = !importedProducts[idx].hide;
        saveImportedProducts(importedProducts);
      }
    }

    loadProducts();
  };

  const handleAddNew = () => {
    setEditingProduct({
      title: '',
      image: '',
      short_description: '',
      long_description: '',
      tags: [],
      hide: false,
    });
    setEditIndex(null);
    setShowEditModal(true);
  };

  const handleSaveNew = () => {
    if (!editingProduct || !editingProduct.title || !editingProduct.image) {
      alert('Title and Image are required');
      return;
    }

    const importedProducts = getImportedProducts();
    importedProducts.push(editingProduct);
    saveImportedProducts(importedProducts);

    loadProducts();
    setShowEditModal(false);
    setEditingProduct(null);
  };

  const updateEditingProduct = (field: keyof ProductItem, value: unknown) => {
    if (!editingProduct) return;
    setEditingProduct({ ...editingProduct, [field]: value });
  };

  const updatePrice = (type: 'simple' | 'sale', value: string, field?: 'new' | 'old') => {
    if (!editingProduct) return;

    if (type === 'simple') {
      const num = parseFloat(value);
      setEditingProduct({
        ...editingProduct,
        price: isNaN(num) ? undefined : num
      });
    } else if (field) {
      const currentPrice = editingProduct.price;
      const isObject = typeof currentPrice === 'object' && currentPrice !== null;
      const num = parseFloat(value);

      setEditingProduct({
        ...editingProduct,
        price: {
          new: field === 'new' ? (isNaN(num) ? 0 : num) : (isObject ? currentPrice.new : 0),
          old: field === 'old' ? (isNaN(num) ? 0 : num) : (isObject ? currentPrice.old : 0),
        }
      });
    }
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatPrice = (price?: PriceType): string => {
    if (!price) return '-';
    if (typeof price === 'number') return `${price}€`;
    return `${price.new}€ (was ${price.old}€)`;
  };

  return (
    <div className="admin-products">
      <div className="admin-products-header">
        <Link href="/admin" className="admin-products-back">
          <BsArrowLeft /> Back to Pages
        </Link>
        <h1>Product Management</h1>
        <p>Import products or manage your catalog manually.</p>
      </div>

      {/* Tab Navigation */}
      <div className="admin-products-tabs">
        <button
          className={`admin-products-tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          Products List
        </button>
        <button
          className={`admin-products-tab ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
        >
          Import
        </button>
      </div>

      {activeTab === 'list' && (
        <>
          {/* Search and Add */}
          <div className="admin-products-toolbar">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-products-search"
            />
            <button className="admin-products-add-btn" onClick={handleAddNew}>
              <BsPlus /> Add Product
            </button>
          </div>

          {/* Products List */}
          <div className="admin-products-list">
            {filteredProducts.length === 0 ? (
              <div className="admin-products-empty">
                <p>No products found. Import some or add manually.</p>
              </div>
            ) : (
              <div className="admin-products-table-wrapper">
                <table className="admin-products-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Price</th>
                      <th>Tags</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product, idx) => {
                      const isStatic = (product as unknown as {_isStatic: boolean})._isStatic;
                      return (
                        <tr key={idx} className={product.hide ? 'hidden-product' : ''}>
                          <td>
                            <img
                              src={product.image.startsWith('/') ? product.image : `/images/catalog/${product.image}`}
                              alt={product.title}
                              className="admin-products-thumb"
                            />
                          </td>
                          <td>
                            <span className="admin-products-title">{product.title}</span>
                            {isStatic && <span className="admin-products-badge">Static</span>}
                          </td>
                          <td>{formatPrice(product.price)}</td>
                          <td>
                            <div className="admin-products-tags">
                              {product.tags?.map((tag, i) => (
                                <span key={i} className="admin-products-tag">{tag}</span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <span className={`admin-products-status ${product.hide ? 'hidden' : 'visible'}`}>
                              {product.hide ? 'Hidden' : 'Visible'}
                            </span>
                          </td>
                          <td>
                            <div className="admin-products-row-actions">
                              <button
                                className="admin-products-row-btn"
                                onClick={() => handleToggleVisibility(idx)}
                                title={product.hide ? 'Show' : 'Hide'}
                              >
                                {product.hide ? <BsEye /> : <BsEyeSlash />}
                              </button>
                              <button
                                className="admin-products-row-btn"
                                onClick={() => handleEdit(product, idx)}
                                title="Edit"
                              >
                                <BsPencil />
                              </button>
                              <button
                                className="admin-products-row-btn danger"
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
          <div className="admin-products-upload">
            <div
              className="admin-products-dropzone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <BsUpload className="admin-products-dropzone-icon" />
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
              <div className="admin-products-file">
                <BsFileEarmarkText />
                <span>{file.name}</span>
                <button onClick={() => { setFile(null); setParseResult(null); }}>
                  <BsX />
                </button>
              </div>
            )}
          </div>

          {/* Import Mode */}
          {parseResult && parseResult.products.length > 0 && (
            <div className="admin-products-mode">
              <label>
                <input
                  type="radio"
                  name="importMode"
                  value="append"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                />
                Append to existing products
              </label>
              <label>
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                />
                Replace all imported products
              </label>
            </div>
          )}

          {/* Validation Errors */}
          {parseResult && parseResult.errors.length > 0 && (
            <div className="admin-products-errors">
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
          {parseResult && parseResult.products.length > 0 && (
            <div className="admin-products-preview">
              <h3>Preview ({parseResult.products.length} products)</h3>
              <div className="admin-products-table-wrapper">
                <table className="admin-products-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Image</th>
                      <th>Price</th>
                      <th>Tags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parseResult.products.slice(0, 10).map((product, idx) => (
                      <tr key={idx}>
                        <td>{product.title}</td>
                        <td>{product.image}</td>
                        <td>{formatPrice(product.price)}</td>
                        <td>{product.tags?.join(', ') || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parseResult.products.length > 10 && (
                <p className="admin-products-more">
                  And {parseResult.products.length - 10} more products...
                </p>
              )}
            </div>
          )}

          {/* Import Button */}
          {parseResult && parseResult.products.length > 0 && (
            <div className="admin-products-actions">
              <button
                className="admin-products-import-btn"
                onClick={handleImport}
                disabled={isImporting}
              >
                {isImporting ? 'Importing...' : `Import ${parseResult.products.length} Products`}
              </button>
            </div>
          )}

          {/* Success Message */}
          {importSuccess && (
            <div className="admin-products-success">
              <BsCheck2 />
              <span>Products imported successfully!</span>
            </div>
          )}

          {/* Format Help */}
          <div className="admin-products-help">
            <h3>File Format</h3>
            <div className="admin-products-help-section">
              <h4>CSV Format</h4>
              <pre>
{`title,image,short_description,price,price_new,price_old,tags
Baguette,sample_1.png,Fresh bread,0.99,,,boulangerie
Cookie,sample_3.png,Chocolate chip,,0.89,1.29,nouveau;patisserie`}
              </pre>
            </div>
            <div className="admin-products-help-section">
              <h4>JSON Format</h4>
              <pre>
{`[
  {
    "title": "Baguette",
    "image": "sample_1.png",
    "price": 0.99,
    "tags": ["boulangerie"]
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
        message={`Are you sure you want to ${importMode === 'replace' ? 'replace all products with' : 'add'} ${parseResult?.products.length || 0} products?`}
        confirmLabel="Import"
        cancelLabel="Cancel"
        variant="info"
        onConfirm={confirmImport}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteIndex !== null ? products[deleteIndex]?.title : ''}"?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Edit Modal */}
      {showEditModal && editingProduct && (
        <div
          className="admin-products-modal-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && setMouseDownOnOverlay(true)}
          onMouseUp={(e) => {
            if (mouseDownOnOverlay && e.target === e.currentTarget) setShowEditModal(false);
            setMouseDownOnOverlay(false);
          }}
        >
          <div className="admin-products-modal" onMouseDown={(e) => e.stopPropagation()}>
            <h2>{editIndex !== null ? 'Edit Product' : 'Add Product'}</h2>

            <div className="admin-products-modal-form">
              <div className="admin-products-modal-field">
                <label>Title *</label>
                <input
                  type="text"
                  value={editingProduct.title}
                  onChange={(e) => updateEditingProduct('title', e.target.value)}
                  placeholder="Product title"
                />
              </div>

              <div className="admin-products-modal-field">
                <label>Image *</label>
                <input
                  type="text"
                  value={editingProduct.image}
                  onChange={(e) => updateEditingProduct('image', e.target.value)}
                  placeholder="sample_1.png or /images/product.jpg"
                />
              </div>

              <div className="admin-products-modal-field">
                <label>Short Description</label>
                <input
                  type="text"
                  value={editingProduct.short_description || ''}
                  onChange={(e) => updateEditingProduct('short_description', e.target.value)}
                  placeholder="Brief description"
                />
              </div>

              <div className="admin-products-modal-field">
                <label>Long Description</label>
                <textarea
                  value={editingProduct.long_description || ''}
                  onChange={(e) => updateEditingProduct('long_description', e.target.value)}
                  placeholder="Detailed description"
                  rows={3}
                />
              </div>

              <div className="admin-products-modal-row">
                <div className="admin-products-modal-field">
                  <label>Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={typeof editingProduct.price === 'number' ? editingProduct.price : ''}
                    onChange={(e) => updatePrice('simple', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="admin-products-modal-field">
                  <label>Sale Price (New)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={typeof editingProduct.price === 'object' ? editingProduct.price.new : ''}
                    onChange={(e) => updatePrice('sale', e.target.value, 'new')}
                    placeholder="0.00"
                  />
                </div>
                <div className="admin-products-modal-field">
                  <label>Old Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={typeof editingProduct.price === 'object' ? editingProduct.price.old : ''}
                    onChange={(e) => updatePrice('sale', e.target.value, 'old')}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="admin-products-modal-row">
                <div className="admin-products-modal-field">
                  <label>Price by Dosage</label>
                  <input
                    type="text"
                    value={editingProduct.priceByDosage || ''}
                    onChange={(e) => updateEditingProduct('priceByDosage', e.target.value)}
                    placeholder="0.25€/Kg"
                  />
                </div>
                <div className="admin-products-modal-field">
                  <label>Quantity</label>
                  <input
                    type="text"
                    value={editingProduct.quantity || ''}
                    onChange={(e) => updateEditingProduct('quantity', e.target.value)}
                    placeholder="La pièce"
                  />
                </div>
              </div>

              <div className="admin-products-modal-field">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  value={editingProduct.tags?.join(', ') || ''}
                  onChange={(e) => updateEditingProduct('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                  placeholder="boulangerie, nouveau"
                />
              </div>

              <div className="admin-products-modal-field checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={editingProduct.hide || false}
                    onChange={(e) => updateEditingProduct('hide', e.target.checked)}
                  />
                  Hidden (not visible in catalog)
                </label>
              </div>
            </div>

            <div className="admin-products-modal-actions">
              <button
                className="admin-products-modal-btn"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="admin-products-modal-btn primary"
                onClick={editIndex !== null ? handleSaveEdit : handleSaveNew}
              >
                {editIndex !== null ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
