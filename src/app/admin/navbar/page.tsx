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
  BsFolder,
  BsArrowRight,
} from 'react-icons/bs';

import {
  NavbarConfig,
  NavbarItem,
  NavbarGroup,
  JustifyContent,
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
  addNavbarGroup,
  updateNavbarGroup,
  removeNavbarGroup,
  moveItemToGroup,
  getGroupItems,
} from '@/app/services/navbar-service';
import ConfirmationModal from '@/app/components/modal/confirmation-modal';

import './navbar-admin.scss';

type TabType = 'groups' | 'logo' | 'appearance' | 'scroll' | 'typography';

const justifyOptions: { value: JustifyContent; label: string }[] = [
  { value: 'flex-start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'End' },
  { value: 'space-between', label: 'Space Between' },
  { value: 'space-around', label: 'Space Around' },
  { value: 'space-evenly', label: 'Space Evenly' },
];

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
  const [activeTab, setActiveTab] = useState<TabType>('groups');
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NavbarItem | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<NavbarGroup | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [mouseDownOnOverlay, setMouseDownOnOverlay] = useState(false);

  useEffect(() => {
    const loadedConfig = getNavbarConfig();
    setConfig(loadedConfig);
    // Expand all groups by default
    setExpandedGroups(new Set(loadedConfig.groups.map(g => g.id)));
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
    setExpandedGroups(new Set(defaultConfig.groups.map(g => g.id)));
    setHasChanges(false);
    setShowResetModal(false);
  }, []);

  // Group management
  const handleAddGroup = useCallback(() => {
    setEditingGroup({
      id: '',
      name: '',
      justify: 'center',
      order: config?.groups.length || 0,
      gap: '8px',
    });
    setShowGroupModal(true);
  }, [config]);

  const handleEditGroup = useCallback((group: NavbarGroup) => {
    setEditingGroup({ ...group });
    setShowGroupModal(true);
  }, []);

  const handleSaveGroup = useCallback(() => {
    if (!config || !editingGroup) return;

    let newConfig: NavbarConfig;
    if (editingGroup.id) {
      newConfig = updateNavbarGroup(config, editingGroup.id, editingGroup);
    } else {
      newConfig = addNavbarGroup(config, editingGroup);
    }

    handleConfigChange(newConfig);
    setShowGroupModal(false);
    setEditingGroup(null);
  }, [config, editingGroup, handleConfigChange]);

  const handleDeleteGroup = useCallback(
    (groupId: string) => {
      if (!config || config.groups.length <= 1) return;
      const newConfig = removeNavbarGroup(config, groupId);
      handleConfigChange(newConfig);
      setExpandedGroups(prev => {
        const next = new Set(prev);
        next.delete(groupId);
        return next;
      });
    },
    [config, handleConfigChange]
  );

  const toggleGroupExpanded = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  // Item management
  const handleAddItem = useCallback((groupId: string) => {
    setEditingItem({
      id: '',
      title: '',
      url: '/',
      main: false,
      icon: 'BsLink45Deg',
      separator: false,
      order: 0,
      groupId,
    });
    setShowItemModal(true);
  }, []);

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

  const handleMoveItemToGroup = useCallback(
    (itemId: string, targetGroupId: string) => {
      if (!config) return;
      const newConfig = moveItemToGroup(config, itemId, targetGroupId);
      handleConfigChange(newConfig);
    },
    [config, handleConfigChange]
  );

  const handleMoveItemInGroup = useCallback(
    (groupId: string, itemIndex: number, direction: 'up' | 'down') => {
      if (!config) return;

      const groupItems = getGroupItems(config, groupId);
      const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
      if (newIndex < 0 || newIndex >= groupItems.length) return;

      // Swap orders
      const item1 = groupItems[itemIndex];
      const item2 = groupItems[newIndex];

      let newConfig = updateNavbarItem(config, item1.id, { order: item2.order });
      newConfig = updateNavbarItem(newConfig, item2.id, { order: item1.order });

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

  const sortedGroups = [...config.groups].sort((a, b) => a.order - b.order);

  const renderPreview = () => (
    <div className="navbar-admin-preview">
      <div
        className="navbar-admin-preview-bar"
        style={{
          height: config.appearance.height,
          backgroundColor: config.appearance.backgroundColor,
          color: config.appearance.textColor,
          borderBottom: config.appearance.borderBottom ? '1px solid rgba(0,0,0,0.1)' : 'none',
          justifyContent: config.containerJustify,
          gap: config.containerGap || '24px',
        }}
      >
        {sortedGroups.map((group) => {
          const items = getGroupItems(config, group.id);
          return (
            <div
              key={group.id}
              className="navbar-admin-preview-group"
              style={{ justifyContent: group.justify, gap: group.gap || '8px' }}
            >
              {items.map((item) =>
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
          );
        })}
      </div>
    </div>
  );

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

      {hasChanges && <div className="navbar-admin-unsaved">You have unsaved changes</div>}

      {renderPreview()}

      {/* Tabs */}
      <div className="navbar-admin-tabs">
        <button
          className={`navbar-admin-tab ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          Groups & Items
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
        {activeTab === 'groups' && (
          <div className="navbar-admin-groups">
            {/* Container Settings */}
            <div className="navbar-admin-container-settings">
              <h3>Container Layout</h3>
              <div className="navbar-admin-field-row">
                <div className="navbar-admin-field">
                  <label>Container Justify</label>
                  <select
                    value={config.containerJustify}
                    onChange={(e) =>
                      handleConfigChange({
                        ...config,
                        containerJustify: e.target.value as JustifyContent,
                      })
                    }
                  >
                    {justifyOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="navbar-admin-field">
                  <label>Container Gap</label>
                  <input
                    type="text"
                    value={config.containerGap || '24px'}
                    onChange={(e) =>
                      handleConfigChange({ ...config, containerGap: e.target.value })
                    }
                    placeholder="24px"
                  />
                </div>
              </div>
            </div>

            {/* Groups */}
            <div className="navbar-admin-groups-header">
              <h3>Groups</h3>
              <button className="navbar-admin-btn" onClick={handleAddGroup}>
                <BsPlus /> Add Group
              </button>
            </div>

            <div className="navbar-admin-groups-list">
              {sortedGroups.map((group) => {
                const groupItems = getGroupItems(config, group.id);
                const isExpanded = expandedGroups.has(group.id);

                return (
                  <div key={group.id} className={`navbar-admin-group ${isExpanded ? 'expanded' : ''}`}>
                    <div
                      className="navbar-admin-group-header"
                      onClick={() => toggleGroupExpanded(group.id)}
                    >
                      <div className="navbar-admin-group-info">
                        <BsFolder />
                        <span className="navbar-admin-group-name">{group.name}</span>
                        <span className="navbar-admin-group-meta">
                          {groupItems.length} items · {justifyOptions.find((o) => o.value === group.justify)?.label}
                        </span>
                      </div>
                      <div className="navbar-admin-group-actions">
                        <button
                          className="navbar-admin-item-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditGroup(group);
                          }}
                        >
                          <BsPencil />
                        </button>
                        <button
                          className="navbar-admin-item-btn danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGroup(group.id);
                          }}
                          disabled={config.groups.length <= 1}
                        >
                          <BsTrash />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="navbar-admin-group-items">
                        <div className="navbar-admin-group-items-header">
                          <span>Items in this group</span>
                          <button
                            className="navbar-admin-btn navbar-admin-btn--small"
                            onClick={() => handleAddItem(group.id)}
                          >
                            <BsPlus /> Add Item
                          </button>
                        </div>

                        {groupItems.length === 0 ? (
                          <div className="navbar-admin-group-empty">No items in this group</div>
                        ) : (
                          groupItems.map((item, index) => (
                            <div key={item.id} className={`navbar-admin-item ${item.main ? 'main' : ''}`}>
                              <div className="navbar-admin-item-grip">
                                <BsGripVertical />
                              </div>
                              <div className="navbar-admin-item-info">
                                <span className="navbar-admin-item-title">
                                  {item.title}
                                  {item.main && <span className="navbar-admin-item-badge">Logo</span>}
                                </span>
                                <span className="navbar-admin-item-url">{item.url}</span>
                              </div>
                              <div className="navbar-admin-item-actions">
                                {config.groups.length > 1 && (
                                  <select
                                    className="navbar-admin-item-move"
                                    value=""
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        handleMoveItemToGroup(item.id, e.target.value);
                                      }
                                    }}
                                    title="Move to group"
                                  >
                                    <option value="">Move to...</option>
                                    {config.groups
                                      .filter((g) => g.id !== group.id)
                                      .map((g) => (
                                        <option key={g.id} value={g.id}>
                                          {g.name}
                                        </option>
                                      ))}
                                  </select>
                                )}
                                <button
                                  className="navbar-admin-item-btn"
                                  onClick={() => handleMoveItemInGroup(group.id, index, 'up')}
                                  disabled={index === 0}
                                >
                                  <BsArrowUp />
                                </button>
                                <button
                                  className="navbar-admin-item-btn"
                                  onClick={() => handleMoveItemInGroup(group.id, index, 'down')}
                                  disabled={index === groupItems.length - 1}
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
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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
                      appearance: { ...config.appearance, backgroundColorScrolled: e.target.value },
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
                    behavior: { ...config.behavior, mobileBreakpoint: parseInt(e.target.value) || 768 },
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
                      typography: { ...config.typography, textTransform: e.target.value as TextTransform },
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

      {/* Reset Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        title="Reset Navbar"
        message="Are you sure you want to reset the navbar to default settings?"
        confirmLabel="Reset"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleReset}
        onCancel={() => setShowResetModal(false)}
      />

      {/* Group Edit Modal */}
      {showGroupModal && editingGroup && (
        <div
          className="navbar-admin-modal-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && setMouseDownOnOverlay(true)}
          onMouseUp={(e) => {
            if (mouseDownOnOverlay && e.target === e.currentTarget) setShowGroupModal(false);
            setMouseDownOnOverlay(false);
          }}
        >
          <div className="navbar-admin-modal" onMouseDown={(e) => e.stopPropagation()}>
            <h2>{editingGroup.id ? 'Edit Group' : 'Add Group'}</h2>
            <div className="navbar-admin-modal-form">
              <div className="navbar-admin-field">
                <label>Group Name *</label>
                <input
                  type="text"
                  value={editingGroup.name}
                  onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                  placeholder="Group name"
                />
              </div>
              <div className="navbar-admin-field">
                <label>Justify Content</label>
                <select
                  value={editingGroup.justify}
                  onChange={(e) =>
                    setEditingGroup({ ...editingGroup, justify: e.target.value as JustifyContent })
                  }
                >
                  {justifyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="navbar-admin-field">
                <label>Gap</label>
                <input
                  type="text"
                  value={editingGroup.gap || '8px'}
                  onChange={(e) => setEditingGroup({ ...editingGroup, gap: e.target.value })}
                  placeholder="8px"
                />
              </div>
            </div>
            <div className="navbar-admin-modal-actions">
              <button className="navbar-admin-btn" onClick={() => setShowGroupModal(false)}>
                Cancel
              </button>
              <button
                className="navbar-admin-btn navbar-admin-btn--primary"
                onClick={handleSaveGroup}
                disabled={!editingGroup.name}
              >
                {editingGroup.id ? 'Save Changes' : 'Add Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Edit Modal */}
      {showItemModal && editingItem && (
        <div
          className="navbar-admin-modal-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && setMouseDownOnOverlay(true)}
          onMouseUp={(e) => {
            if (mouseDownOnOverlay && e.target === e.currentTarget) setShowItemModal(false);
            setMouseDownOnOverlay(false);
          }}
        >
          <div className="navbar-admin-modal" onMouseDown={(e) => e.stopPropagation()}>
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
                      onChange={(e) => setEditingItem({ ...editingItem, separator: e.target.checked })}
                    />
                    Add Separator (mobile)
                  </label>
                </div>
              </div>
            </div>
            <div className="navbar-admin-modal-actions">
              <button className="navbar-admin-btn" onClick={() => setShowItemModal(false)}>
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
