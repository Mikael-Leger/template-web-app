'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  BsArrowLeft,
  BsPlus,
  BsPencil,
  BsTrash,
  BsGripVertical,
  BsArrowUp,
  BsArrowDown,
  BsSave,
  BsArrowCounterclockwise,
} from 'react-icons/bs';

import {
  NavbarConfig,
  NavbarItem,
  ScrollEffect,
  ShadowSize,
  TextTransform,
} from '@/app/interfaces/navbar.interface';
import {
  getNavbarConfig,
  saveNavbarConfig,
  resetNavbarConfig,
  addNavbarItem,
  updateNavbarItem,
  removeNavbarItem,
  reorderNavbarItems,
} from '@/app/services/navbar-service';
import ConfirmationModal from '@/app/components/modal/confirmation-modal';

import './navbar-admin.scss';

type TabType = 'items' | 'logo' | 'appearance' | 'scroll' | 'typography';

const scrollEffectOptions: { value: ScrollEffect; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'shrink', label: 'Shrink' },
  { value: 'color-change', label: 'Color Change' },
  { value: 'hide-on-scroll', label: 'Hide on Scroll' },
  { value: 'shrink-and-color', label: 'Shrink & Color Change' },
];

const shadowOptions: { value: ShadowSize; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

const textTransformOptions: { value: TextTransform; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'uppercase', label: 'Uppercase' },
  { value: 'capitalize', label: 'Capitalize' },
];

export default function NavbarAdminPage() {
  const [config, setConfig] = useState<NavbarConfig | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('items');
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NavbarItem | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);

  useEffect(() => {
    setConfig(getNavbarConfig());
  }, []);

  const handleConfigChange = useCallback((newConfig: NavbarConfig) => {
    setConfig(newConfig);
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(() => {
    if (config) {
      saveNavbarConfig(config);
      setHasChanges(false);
    }
  }, [config]);

  const handleReset = useCallback(() => {
    const defaultConfig = resetNavbarConfig();
    setConfig(defaultConfig);
    setHasChanges(false);
    setShowResetModal(false);
  }, []);

  // Item management
  const handleAddItem = useCallback(() => {
    setEditingItem({
      id: '',
      title: '',
      url: '/',
      main: false,
      icon: 'BsLink45Deg',
      separator: false,
      order: config?.items.length || 0,
    });
    setShowItemModal(true);
  }, [config]);

  const handleEditItem = useCallback((item: NavbarItem) => {
    setEditingItem({ ...item });
    setShowItemModal(true);
  }, []);

  const handleSaveItem = useCallback(() => {
    if (!config || !editingItem) return;

    let newConfig: NavbarConfig;
    if (editingItem.id) {
      newConfig = updateNavbarItem(config, editingItem.id, editingItem);
    } else {
      newConfig = addNavbarItem(config, editingItem);
    }

    handleConfigChange(newConfig);
    setShowItemModal(false);
    setEditingItem(null);
  }, [config, editingItem, handleConfigChange]);

  const handleDeleteItem = useCallback(
    (itemId: string) => {
      if (!config) return;
      const newConfig = removeNavbarItem(config, itemId);
      handleConfigChange(newConfig);
    },
    [config, handleConfigChange]
  );

  const handleMoveItem = useCallback(
    (index: number, direction: 'up' | 'down') => {
      if (!config) return;
      const items = [...config.items].sort((a, b) => a.order - b.order);
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= items.length) return;

      [items[index], items[newIndex]] = [items[newIndex], items[index]];
      const newConfig = reorderNavbarItems(
        config,
        items.map((i) => i.id)
      );
      handleConfigChange(newConfig);
    },
    [config, handleConfigChange]
  );

  if (!config) {
    return (
      <div className="navbar-admin">
        <div className="navbar-admin-loading">Loading...</div>
      </div>
    );
  }

  const sortedItems = [...config.items].sort((a, b) => a.order - b.order);

  return (
    <div className="navbar-admin">
      <div className="navbar-admin-header">
        <div className="navbar-admin-header-left">
          <Link href="/admin" className="navbar-admin-back">
            <BsArrowLeft /> Back
          </Link>
          <h1>Navbar Editor</h1>
        </div>
        <div className="navbar-admin-header-actions">
          <button
            className="navbar-admin-btn navbar-admin-btn--secondary"
            onClick={() => setShowResetModal(true)}
          >
            <BsArrowCounterclockwise /> Reset
          </button>
          <button
            className="navbar-admin-btn navbar-admin-btn--primary"
            onClick={handleSave}
            disabled={!hasChanges}
          >
            <BsSave /> Save
          </button>
        </div>
      </div>

      {hasChanges && (
        <div className="navbar-admin-unsaved">You have unsaved changes</div>
      )}

      {/* Preview */}
      <div className="navbar-admin-preview">
        <div
          className="navbar-admin-preview-bar"
          style={{
            height: config.appearance.height,
            backgroundColor: config.appearance.backgroundColor,
            color: config.appearance.textColor,
            borderBottom: config.appearance.borderBottom
              ? '1px solid rgba(0,0,0,0.1)'
              : 'none',
          }}
        >
          {sortedItems.map((item) =>
            item.main ? (
              config.logo.type === 'image' ? (
                <img
                  key={item.id}
                  src={config.logo.imageUrl}
                  alt="Logo"
                  style={{ height: config.logo.height }}
                />
              ) : (
                <span key={item.id} className="navbar-admin-preview-logo">
                  {config.logo.text}
                </span>
              )
            ) : (
              <span
                key={item.id}
                className="navbar-admin-preview-item"
                style={{
                  fontSize: config.typography.fontSize,
                  fontWeight: config.typography.fontWeight,
                  textTransform: config.typography.textTransform as React.CSSProperties['textTransform'],
                  letterSpacing: config.typography.letterSpacing,
                }}
              >
                {item.title}
              </span>
            )
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="navbar-admin-tabs">
        <button
          className={`navbar-admin-tab ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => setActiveTab('items')}
        >
          Menu Items
        </button>
        <button
          className={`navbar-admin-tab ${activeTab === 'logo' ? 'active' : ''}`}
          onClick={() => setActiveTab('logo')}
        >
          Logo
        </button>
        <button
          className={`navbar-admin-tab ${activeTab === 'appearance' ? 'active' : ''}`}
          onClick={() => setActiveTab('appearance')}
        >
          Appearance
        </button>
        <button
          className={`navbar-admin-tab ${activeTab === 'scroll' ? 'active' : ''}`}
          onClick={() => setActiveTab('scroll')}
        >
          Scroll
        </button>
        <button
          className={`navbar-admin-tab ${activeTab === 'typography' ? 'active' : ''}`}
          onClick={() => setActiveTab('typography')}
        >
          Typography
        </button>
      </div>

      {/* Tab Content */}
      <div className="navbar-admin-content">
        {activeTab === 'items' && (
          <div className="navbar-admin-items">
            <div className="navbar-admin-items-header">
              <h2>Menu Items</h2>
              <button className="navbar-admin-btn" onClick={handleAddItem}>
                <BsPlus /> Add Item
              </button>
            </div>
            <div className="navbar-admin-items-list">
              {sortedItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`navbar-admin-item ${item.main ? 'main' : ''}`}
                >
                  <div className="navbar-admin-item-grip">
                    <BsGripVertical />
                  </div>
                  <div className="navbar-admin-item-info">
                    <span className="navbar-admin-item-title">
                      {item.title}
                      {item.main && (
                        <span className="navbar-admin-item-badge">Logo</span>
                      )}
                    </span>
                    <span className="navbar-admin-item-url">{item.url}</span>
                  </div>
                  <div className="navbar-admin-item-actions">
                    <button
                      className="navbar-admin-item-btn"
                      onClick={() => handleMoveItem(index, 'up')}
                      disabled={index === 0}
                    >
                      <BsArrowUp />
                    </button>
                    <button
                      className="navbar-admin-item-btn"
                      onClick={() => handleMoveItem(index, 'down')}
                      disabled={index === sortedItems.length - 1}
                    >
                      <BsArrowDown />
                    </button>
                    <button
                      className="navbar-admin-item-btn"
                      onClick={() => handleEditItem(item)}
                    >
                      <BsPencil />
                    </button>
                    <button
                      className="navbar-admin-item-btn danger"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <BsTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logo' && (
          <div className="navbar-admin-panel">
            <h2>Logo Settings</h2>
            <div className="navbar-admin-field">
              <label>Logo Type</label>
              <select
                value={config.logo.type}
                onChange={(e) =>
                  handleConfigChange({
                    ...config,
                    logo: { ...config.logo, type: e.target.value as 'image' | 'text' },
                  })
                }
              >
                <option value="image">Image</option>
                <option value="text">Text</option>
              </select>
            </div>
            {config.logo.type === 'image' && (
              <div className="navbar-admin-field">
                <label>Image URL</label>
                <input
                  type="text"
                  value={config.logo.imageUrl}
                  onChange={(e) =>
                    handleConfigChange({
                      ...config,
                      logo: { ...config.logo, imageUrl: e.target.value },
                    })
                  }
                  placeholder="/logo/logo.png"
                />
              </div>
            )}
            {config.logo.type === 'text' && (
              <div className="navbar-admin-field">
                <label>Text</label>
                <input
                  type="text"
                  value={config.logo.text}
                  onChange={(e) =>
                    handleConfigChange({
                      ...config,
                      logo: { ...config.logo, text: e.target.value },
                    })
                  }
                  placeholder="My Brand"
                />
              </div>
            )}
            <div className="navbar-admin-field">
              <label>Logo Height</label>
              <input
                type="text"
                value={config.logo.height}
                onChange={(e) =>
                  handleConfigChange({
                    ...config,
                    logo: { ...config.logo, height: e.target.value },
                  })
                }
                placeholder="50px"
              />
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="navbar-admin-panel">
            <h2>Appearance</h2>
            <div className="navbar-admin-field-row">
              <div className="navbar-admin-field">
                <label>Height</label>
                <input
                  type="text"
                  value={config.appearance.height}
                  onChange={(e) =>
                    handleConfigChange({
                      ...config,
                      appearance: { ...config.appearance, height: e.target.value },
                    })
                  }
                  placeholder="80px"
                />
              </div>
              <div className="navbar-admin-field">
                <label>Height (Scrolled)</label>
                <input
                  type="text"
                  value={config.appearance.heightScrolled}
                  onChange={(e) =>
                    handleConfigChange({
                      ...config,
                      appearance: { ...config.appearance, heightScrolled: e.target.value },
                    })
                  }
                  placeholder="60px"
                />
              </div>
            </div>
            <div className="navbar-admin-field-row">
              <div className="navbar-admin-field">
                <label>Background Color</label>
                <input
                  type="text"
                  value={config.appearance.backgroundColor}
                  onChange={(e) =>
                    handleConfigChange({
                      ...config,
                      appearance: { ...config.appearance, backgroundColor: e.target.value },
                    })
                  }
                  placeholder="rgba(255, 255, 255, 0.95)"
                />
              </div>
              <div className="navbar-admin-field">
                <label>Background (Scrolled)</label>
                <input
                  type="text"
                  value={config.appearance.backgroundColorScrolled}
                  onChange={(e) =>
                    handleConfigChange({
                      ...config,
                      appearance: {
                        ...config.appearance,
                        backgroundColorScrolled: e.target.value,
                      },
                    })
                  }
                  placeholder="rgba(255, 255, 255, 0.98)"
                />
              </div>
            </div>
            <div className="navbar-admin-field-row">
              <div className="navbar-admin-field">
                <label>Text Color</label>
                <input
                  type="text"
                  value={config.appearance.textColor}
                  onChange={(e) =>
                    handleConfigChange({
                      ...config,
                      appearance: { ...config.appearance, textColor: e.target.value },
                    })
                  }
                  placeholder="#1a1a2e"
                />
              </div>
              <div className="navbar-admin-field">
                <label>Text (Scrolled)</label>
                <input
                  type="text"
                  value={config.appearance.textColorScrolled}
                  onChange={(e) =>
                    handleConfigChange({
                      ...config,
                      appearance: { ...config.appearance, textColorScrolled: e.target.value },
                    })
                  }
                  placeholder="#1a1a2e"
                />
              </div>
            </div>
            <div className="navbar-admin-field-row">
              <div className="navbar-admin-field">
                <label>Active Color</label>
                <input
                  type="text"
                  value={config.appearance.activeColor}
                  onChange={(e) =>
                    handleConfigChange({
                      ...config,
                      appearance: { ...config.appearance, activeColor: e.target.value },
                    })
                  }
                  placeholder="#e94560"
                />
              </div>
              <div className="navbar-admin-field">
                <label>Hover Color</label>
                <input
                  type="text"
                  value={config.appearance.hoverColor}
                  onChange={(e) =>
                    handleConfigChange({
                      ...config,
                      appearance: { ...config.appearance, hoverColor: e.target.value },
                    })
                  }
                  placeholder="#e94560"
                />
              </div>
            </div>
            <div className="navbar-admin-field">
              <label>Shadow</label>
              <select
                value={config.appearance.shadow}
                onChange={(e) =>
                  handleConfigChange({
                    ...config,
                    appearance: { ...config.appearance, shadow: e.target.value as ShadowSize },
                  })
                }
              >
                {shadowOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="navbar-admin-field-row">
              <div className="navbar-admin-field checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={config.appearance.borderBottom}
                    onChange={(e) =>
                      handleConfigChange({
                        ...config,
                        appearance: { ...config.appearance, borderBottom: e.target.checked },
                      })
                    }
                  />
                  Border Bottom
                </label>
              </div>
              <div className="navbar-admin-field checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={config.appearance.backdropBlur}
                    onChange={(e) =>
                      handleConfigChange({
                        ...config,
                        appearance: { ...config.appearance, backdropBlur: e.target.checked },
                      })
                    }
                  />
                  Backdrop Blur
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scroll' && (
          <div className="navbar-admin-panel">
            <h2>Scroll Behavior</h2>
            <div className="navbar-admin-field checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={config.behavior.sticky}
                  onChange={(e) =>
                    handleConfigChange({
                      ...config,
                      behavior: { ...config.behavior, sticky: e.target.checked },
                    })
                  }
                />
                Sticky (Fixed to top)
              </label>
            </div>
            <div className="navbar-admin-field">
              <label>Scroll Effect</label>
              <select
                value={config.behavior.scrollEffect}
                onChange={(e) =>
                  handleConfigChange({
                    ...config,
                    behavior: { ...config.behavior, scrollEffect: e.target.value as ScrollEffect },
                  })
                }
              >
                {scrollEffectOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="navbar-admin-field">
              <label>Scroll Threshold (px)</label>
              <input
                type="number"
                value={config.behavior.scrollThreshold}
                onChange={(e) =>
                  handleConfigChange({
                    ...config,
                    behavior: { ...config.behavior, scrollThreshold: parseInt(e.target.value) || 0 },
                  })
                }
                placeholder="50"
              />
            </div>
            <div className="navbar-admin-field">
              <label>Mobile Breakpoint (px)</label>
              <input
                type="number"
                value={config.behavior.mobileBreakpoint}
                onChange={(e) =>
                  handleConfigChange({
                    ...config,
                    behavior: {
                      ...config.behavior,
                      mobileBreakpoint: parseInt(e.target.value) || 768,
                    },
                  })
                }
                placeholder="768"
              />
            </div>
          </div>
        )}

        {activeTab === 'typography' && (
          <div className="navbar-admin-panel">
            <h2>Typography</h2>
            <div className="navbar-admin-field-row">
              <div className="navbar-admin-field">
                <label>Font Size</label>
                <input
                  type="text"
                  value={config.typography.fontSize}
                  onChange={(e) =>
                    handleConfigChange({
                      ...config,
                      typography: { ...config.typography, fontSize: e.target.value },
                    })
                  }
                  placeholder="14px"
                />
              </div>
              <div className="navbar-admin-field">
                <label>Font Weight</label>
                <input
                  type="text"
                  value={config.typography.fontWeight}
                  onChange={(e) =>
                    handleConfigChange({
                      ...config,
                      typography: { ...config.typography, fontWeight: e.target.value },
                    })
                  }
                  placeholder="500"
                />
              </div>
            </div>
            <div className="navbar-admin-field-row">
              <div className="navbar-admin-field">
                <label>Text Transform</label>
                <select
                  value={config.typography.textTransform}
                  onChange={(e) =>
                    handleConfigChange({
                      ...config,
                      typography: {
                        ...config.typography,
                        textTransform: e.target.value as TextTransform,
                      },
                    })
                  }
                >
                  {textTransformOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="navbar-admin-field">
                <label>Letter Spacing</label>
                <input
                  type="text"
                  value={config.typography.letterSpacing}
                  onChange={(e) =>
                    handleConfigChange({
                      ...config,
                      typography: { ...config.typography, letterSpacing: e.target.value },
                    })
                  }
                  placeholder="0.5px"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        title="Reset Navbar"
        message="Are you sure you want to reset the navbar to default settings? This will discard all your customizations."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleReset}
        onCancel={() => setShowResetModal(false)}
      />

      {/* Item Edit Modal */}
      {showItemModal && editingItem && (
        <div className="navbar-admin-modal-overlay" onClick={() => setShowItemModal(false)}>
          <div className="navbar-admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingItem.id ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
            <div className="navbar-admin-modal-form">
              <div className="navbar-admin-field">
                <label>Title *</label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="Menu item title"
                />
              </div>
              <div className="navbar-admin-field">
                <label>URL *</label>
                <input
                  type="text"
                  value={editingItem.url}
                  onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                  placeholder="/page-url"
                />
              </div>
              <div className="navbar-admin-field">
                <label>Icon (React Icons name)</label>
                <input
                  type="text"
                  value={editingItem.icon || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                  placeholder="BsHouse"
                />
              </div>
              <div className="navbar-admin-field">
                <label>Image URL (optional)</label>
                <input
                  type="text"
                  value={editingItem.image || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                  placeholder="/images/item.png"
                />
              </div>
              <div className="navbar-admin-field-row">
                <div className="navbar-admin-field checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={editingItem.main || false}
                      onChange={(e) => setEditingItem({ ...editingItem, main: e.target.checked })}
                    />
                    Is Logo Position
                  </label>
                </div>
                <div className="navbar-admin-field checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={editingItem.separator || false}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, separator: e.target.checked })
                      }
                    />
                    Add Separator (mobile)
                  </label>
                </div>
              </div>
            </div>
            <div className="navbar-admin-modal-actions">
              <button
                className="navbar-admin-btn"
                onClick={() => setShowItemModal(false)}
              >
                Cancel
              </button>
              <button
                className="navbar-admin-btn navbar-admin-btn--primary"
                onClick={handleSaveItem}
                disabled={!editingItem.title || !editingItem.url}
              >
                {editingItem.id ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
