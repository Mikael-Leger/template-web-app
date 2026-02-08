'use client';

import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { BsSliders, BsTrash, BsPlus, BsX, BsChevronDown, BsChevronRight, BsArrowUp, BsArrowDown } from 'react-icons/bs';

import { useEditor } from '../../contexts/editor-context';
import { getComponent } from '../../registry/component-registry';
import { PropDefinition } from '../../interfaces/page-config.interface';
import { getAllShowcases } from '@/app/services/showcase-service';
import { getAllForms } from '@/app/services/form-service';
import RatioEditor from './ratio-editor';
import SpacingEditor, { SpacingValue, DEFAULT_SPACING } from './spacing-editor';
import DimensionEditor from './dimension-editor';

const dataSourceResolvers: Record<string, () => { label: string; value: string }[]> = {
  'showcases': () => getAllShowcases().filter(s => !s.hide).map(s => ({ label: s.title, value: s.id! })),
  'forms': () => getAllForms().filter(f => !f.hide).map(f => ({ label: f.name, value: f.id! })),
};

/**
 * ObjectArrayEditor - Renders an array of objects with collapsible sections
 */
function ObjectArrayEditor({
  items,
  objectSchema,
  onAdd,
  onRemove,
  onFieldChange,
  onMove,
  itemLabel,
}: {
  items: Record<string, unknown>[];
  objectSchema: Record<string, PropDefinition>;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onFieldChange: (index: number, fieldName: string, value: unknown) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  itemLabel: string;
}) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const renderObjectField = (
    item: Record<string, unknown>,
    index: number,
    fieldName: string,
    fieldDef: PropDefinition
  ) => {
    const fieldValue = item[fieldName] ?? fieldDef.defaultValue;

    // Nested array (e.g., descriptions)
    if (fieldDef.type === 'array') {
      const nestedItems = (fieldValue as unknown[]) || [];
      const nestedSchema = fieldDef.arrayItemSchema;

      const handleAddNested = () => {
        onFieldChange(index, fieldName, [...nestedItems, nestedSchema?.defaultValue ?? '']);
      };

      const handleRemoveNested = (ni: number) => {
        onFieldChange(index, fieldName, nestedItems.filter((_, i) => i !== ni));
      };

      const handleUpdateNested = (ni: number, val: unknown) => {
        const updated = [...nestedItems];
        updated[ni] = val;
        onFieldChange(index, fieldName, updated);
      };

      return (
        <div className='editor-panel-field' key={fieldName}>
          <label className='editor-panel-field-label'>{fieldDef.label}</label>
          <div className='editor-panel-field-array'>
            {nestedItems.map((nestedItem, ni) => (
              <div key={ni} className='editor-panel-field-array-row'>
                <input
                  type='text'
                  className='editor-panel-field-input'
                  value={String(nestedItem ?? '')}
                  onChange={(e) => handleUpdateNested(ni, e.target.value)}
                />
                <button
                  className='editor-panel-field-array-remove'
                  onClick={() => handleRemoveNested(ni)}
                  title='Remove'
                >
                  <BsX />
                </button>
              </div>
            ))}
            <button className='editor-panel-field-array-add' onClick={handleAddNested}>
              <BsPlus /> Add
            </button>
          </div>
        </div>
      );
    }

    // String, icon, image, color, number fields
    let input: React.ReactNode;
    switch (fieldDef.type) {
    case 'icon':
    case 'string':
    case 'image':
      input = (
        <input
          type='text'
          className='editor-panel-field-input'
          value={(fieldValue as string) || ''}
          onChange={(e) => onFieldChange(index, fieldName, e.target.value)}
          placeholder={fieldDef.type === 'image' ? '/images/example.png' : (fieldDef.defaultValue as string)}
        />
      );
      break;
    case 'color':
      input = (
        <input
          type='color'
          className='editor-panel-field-input'
          value={(fieldValue as string) || '#000000'}
          onChange={(e) => onFieldChange(index, fieldName, e.target.value)}
          style={{ padding: '2px', height: '36px' }}
        />
      );
      break;
    case 'number':
      input = (
        <input
          type='number'
          className='editor-panel-field-input'
          value={(fieldValue as number) ?? ''}
          min={fieldDef.min}
          max={fieldDef.max}
          onChange={(e) => onFieldChange(index, fieldName, Number(e.target.value))}
        />
      );
      break;
    case 'boolean':
      input = (
        <div className='editor-panel-field-checkbox'>
          <input
            type='checkbox'
            id={`obj-${index}-${fieldName}`}
            checked={(fieldValue as boolean) || false}
            onChange={(e) => onFieldChange(index, fieldName, e.target.checked)}
          />
          <label htmlFor={`obj-${index}-${fieldName}`}>{fieldDef.label}</label>
        </div>
      );
      break;
    case 'select': {
      const opts = fieldDef.options || [];
      input = (
        <select
          className='editor-panel-field-select'
          value={(fieldValue as string) || ''}
          onChange={(e) => onFieldChange(index, fieldName, e.target.value)}
        >
          {opts.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      );
      break;
    }
    default:
      input = (
        <input
          type='text'
          className='editor-panel-field-input'
          value={String(fieldValue || '')}
          onChange={(e) => onFieldChange(index, fieldName, e.target.value)}
        />
      );
    }

    if (fieldDef.type === 'boolean') {
      return <div className='editor-panel-field' key={fieldName}>{input}</div>;
    }

    return (
      <div className='editor-panel-field' key={fieldName}>
        <label className='editor-panel-field-label'>{fieldDef.label}</label>
        {input}
      </div>
    );
  };

  return (
    <div className='editor-panel-field-object-array'>
      {items.map((item, index) => {
        const isExpanded = expandedItems.has(index);
        const title = (item.title as string) || (item.name as string) || `${itemLabel} ${index + 1}`;

        return (
          <div key={index} className='editor-panel-field-object-array-item'>
            <div className='editor-panel-field-object-array-item-header' onClick={() => toggleExpanded(index)}>
              <span className='editor-panel-field-object-array-item-header-chevron'>
                {isExpanded ? <BsChevronDown /> : <BsChevronRight />}
              </span>
              <span className='editor-panel-field-object-array-item-header-title'>{title}</span>
              <div className='editor-panel-field-object-array-item-header-actions'>
                <button
                  onClick={(e) => { e.stopPropagation(); onMove(index, 'up'); }}
                  disabled={index === 0}
                  title='Move up'
                >
                  <BsArrowUp />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onMove(index, 'down'); }}
                  disabled={index === items.length - 1}
                  title='Move down'
                >
                  <BsArrowDown />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                  title='Remove'
                  className='editor-panel-field-object-array-item-header-actions-remove'
                >
                  <BsX />
                </button>
              </div>
            </div>
            {isExpanded && (
              <div className='editor-panel-field-object-array-item-body'>
                {Object.entries(objectSchema).map(([fieldName, fieldDef]) =>
                  renderObjectField(item, index, fieldName, fieldDef)
                )}
              </div>
            )}
          </div>
        );
      })}
      <button className='editor-panel-field-array-add' onClick={onAdd}>
        <BsPlus /> Add {itemLabel}
      </button>
    </div>
  );
}

export default function PropertyPanel() {
  const { selectedComponent, updateComponentProps, removeComponent } = useEditor();

  // Get registry entry (memoized to avoid recalculation)
  const registryEntry = useMemo(() => {
    if (!selectedComponent) return null;
    return getComponent(selectedComponent.componentType);
  }, [selectedComponent]);

  // Get children count for Layout components
  const childrenCount = selectedComponent?.children?.length || 0;
  const isLayoutComponent = selectedComponent?.componentType === 'Layout';
  const isCardComponent = selectedComponent?.componentType === 'Card';
  const hideSpacing = registryEntry?.hideSpacing || isCardComponent;

  // Extract childRatios from props for proper dependency tracking
  const childRatiosFromProps = selectedComponent?.props.childRatios as number[] | undefined;

  // Get current ratios or initialize with defaults
  const currentRatios = useMemo(() => {
    if (!selectedComponent) return [];
    const ratios = childRatiosFromProps || [];
    // If no ratios set or count mismatch, return array of 1s
    if (ratios.length !== childrenCount) {
      return Array(childrenCount).fill(1);
    }
    return ratios;
  }, [selectedComponent, childrenCount, childRatiosFromProps]);

  // Initialize ratios if needed when component is selected
  useEffect(() => {
    if (!selectedComponent || !isLayoutComponent || childrenCount === 0) return;

    const existingRatios = (selectedComponent.props.childRatios as number[]) || [];
    if (existingRatios.length !== childrenCount) {
      // Initialize with equal ratios
      updateComponentProps(selectedComponent.id, { childRatios: Array(childrenCount).fill(1) });
    }
  }, [selectedComponent?.id, isLayoutComponent, childrenCount, selectedComponent?.props.childRatios, updateComponentProps, selectedComponent]);

  // Handle prop change
  const handlePropChange = useCallback((propName: string, value: unknown) => {
    if (!selectedComponent) return;
    updateComponentProps(selectedComponent.id, { [propName]: value });
  }, [selectedComponent, updateComponentProps]);

  // Handle delete
  const handleDelete = useCallback(() => {
    if (!selectedComponent) return;
    removeComponent(selectedComponent.id);
  }, [selectedComponent, removeComponent]);

  // Handle ratio change from the RatioEditor
  const handleRatiosChange = useCallback((newRatios: number[]) => {
    if (!selectedComponent) return;
    updateComponentProps(selectedComponent.id, { childRatios: newRatios });
  }, [selectedComponent, updateComponentProps]);

  // Handle padding change
  const handlePaddingChange = useCallback((padding: SpacingValue) => {
    if (!selectedComponent) return;
    updateComponentProps(selectedComponent.id, { _padding: padding });
  }, [selectedComponent, updateComponentProps]);

  // Handle margin change
  const handleMarginChange = useCallback((margin: SpacingValue) => {
    if (!selectedComponent) return;
    updateComponentProps(selectedComponent.id, { _margin: margin });
  }, [selectedComponent, updateComponentProps]);

  // Get current padding and margin values
  const currentPadding = (selectedComponent?.props._padding as SpacingValue) || DEFAULT_SPACING;
  const currentMargin = (selectedComponent?.props._margin as SpacingValue) || DEFAULT_SPACING;

  // Render field helper
  const renderField = useCallback((propName: string, definition: PropDefinition) => {
    if (!selectedComponent) return null;
    const value = selectedComponent.props[propName] ?? definition.defaultValue;

    switch (definition.type) {
    case 'string':
      return (
        <input
          type='text'
          className='editor-panel-field-input'
          value={(value as string) || ''}
          onChange={(e) => handlePropChange(propName, e.target.value)}
          placeholder={definition.defaultValue as string}
        />
      );

    case 'textarea':
      return (
        <textarea
          className='editor-panel-field-textarea'
          value={(value as string) || ''}
          onChange={(e) => handlePropChange(propName, e.target.value)}
          placeholder={definition.defaultValue as string}
          rows={4}
        />
      );

    case 'number':
      return (
        <input
          type='number'
          className='editor-panel-field-input'
          value={(value as number) ?? ''}
          min={definition.min}
          max={definition.max}
          onChange={(e) => handlePropChange(propName, Number(e.target.value))}
        />
      );

    case 'boolean':
      return (
        <div className='editor-panel-field-checkbox'>
          <input
            type='checkbox'
            id={`prop-${propName}`}
            checked={(value as boolean) || false}
            onChange={(e) => handlePropChange(propName, e.target.checked)}
          />
          <label htmlFor={`prop-${propName}`}>{definition.label}</label>
        </div>
      );

    case 'select': {
      let selectOptions = definition.options || [];
      if (definition.dataSource && dataSourceResolvers[definition.dataSource]) {
        const dynamicOptions = dataSourceResolvers[definition.dataSource]();
        selectOptions = [{ label: 'None', value: '' }, ...dynamicOptions, ...selectOptions.filter(o => !dynamicOptions.some(d => d.value === o.value))];
      }
      return (
        <select
          className='editor-panel-field-select'
          value={(value as string) || ''}
          onChange={(e) => handlePropChange(propName, e.target.value)}
        >
          {selectOptions.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    case 'image':
      return (
        <input
          type='text'
          className='editor-panel-field-input'
          value={(value as string) || ''}
          onChange={(e) => handlePropChange(propName, e.target.value)}
          placeholder='/images/example.png'
        />
      );

    case 'color':
      return (
        <input
          type='color'
          className='editor-panel-field-input'
          value={(value as string) || '#000000'}
          onChange={(e) => handlePropChange(propName, e.target.value)}
          style={{ padding: '2px', height: '36px' }}
        />
      );

    case 'dimension':
      return (
        <DimensionEditor
          label={definition.label}
          value={(value as string) || ''}
          onChange={(val) => handlePropChange(propName, val)}
          placeholder={definition.defaultValue as string}
        />
      );

    case 'array': {
      const items = (value as unknown[]) || [];
      const itemSchema = definition.arrayItemSchema;

      // Object array: items are objects with objectSchema
      if (itemSchema?.type === 'object' && itemSchema.objectSchema) {
        const objectSchema = itemSchema.objectSchema;

        const handleAddObjectItem = () => {
          const newItem: Record<string, unknown> = {};
          for (const [fieldName, fieldDef] of Object.entries(objectSchema)) {
            if (fieldDef.type === 'array') {
              newItem[fieldName] = fieldDef.defaultValue ?? [''];
            } else {
              newItem[fieldName] = fieldDef.defaultValue ?? '';
            }
          }
          handlePropChange(propName, [...items, newItem]);
        };

        const handleRemoveObjectItem = (index: number) => {
          handlePropChange(propName, items.filter((_, i) => i !== index));
        };

        const handleObjectFieldChange = (index: number, fieldName: string, fieldValue: unknown) => {
          const updated = [...items];
          updated[index] = { ...(updated[index] as Record<string, unknown>), [fieldName]: fieldValue };
          handlePropChange(propName, updated);
        };

        const handleMoveItem = (index: number, direction: 'up' | 'down') => {
          const updated = [...items];
          const targetIndex = direction === 'up' ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= updated.length) return;
          [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
          handlePropChange(propName, updated);
        };

        return (
          <ObjectArrayEditor
            items={items as Record<string, unknown>[]}
            objectSchema={objectSchema}
            onAdd={handleAddObjectItem}
            onRemove={handleRemoveObjectItem}
            onFieldChange={handleObjectFieldChange}
            onMove={handleMoveItem}
            itemLabel={itemSchema.label || 'Item'}
          />
        );
      }

      const handleAddItem = () => {
        const defaultVal = itemSchema?.defaultValue ?? '';
        handlePropChange(propName, [...items, defaultVal]);
      };

      const handleRemoveItem = (index: number) => {
        handlePropChange(propName, items.filter((_, i) => i !== index));
      };

      const handleUpdateItem = (index: number, newVal: unknown) => {
        const updated = [...items];
        updated[index] = newVal;
        handlePropChange(propName, updated);
      };

      // Resolve options for select items with dataSource
      let itemOptions: { label: string; value: unknown }[] | undefined;
      if (itemSchema?.type === 'select') {
        itemOptions = itemSchema.options || [];
        if (itemSchema.dataSource && dataSourceResolvers[itemSchema.dataSource]) {
          const dynamicOptions = dataSourceResolvers[itemSchema.dataSource]();
          itemOptions = [...dynamicOptions, ...itemOptions.filter(o => !dynamicOptions.some(d => d.value === o.value))];
        }
      }

      return (
        <div className='editor-panel-field-array'>
          {items.map((item, index) => (
            <div key={index} className='editor-panel-field-array-row'>
              {itemSchema?.type === 'select' && itemOptions ? (
                <select
                  className='editor-panel-field-select'
                  value={String(item || '')}
                  onChange={(e) => handleUpdateItem(index, e.target.value)}
                >
                  <option value=''>Select...</option>
                  {itemOptions.map((opt) => (
                    <option key={String(opt.value)} value={String(opt.value)}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={itemSchema?.type === 'number' ? 'number' : 'text'}
                  className='editor-panel-field-input'
                  value={String(item ?? '')}
                  onChange={(e) => handleUpdateItem(index, itemSchema?.type === 'number' ? Number(e.target.value) : e.target.value)}
                />
              )}
              <button
                className='editor-panel-field-array-remove'
                onClick={() => handleRemoveItem(index)}
                title='Remove'
              >
                <BsX />
              </button>
            </div>
          ))}
          <button
            className='editor-panel-field-array-add'
            onClick={handleAddItem}
          >
            <BsPlus /> Add
          </button>
        </div>
      );
    }

    default:
      return (
        <input
          type='text'
          className='editor-panel-field-input'
          value={String(value || '')}
          onChange={(e) => handlePropChange(propName, e.target.value)}
        />
      );
    }
  }, [selectedComponent, handlePropChange]);

  // Early return for no selection
  if (!selectedComponent) {
    return (
      <aside className='editor-panel'>
        <div className='editor-panel-empty'>
          <BsSliders className='editor-panel-empty-icon'/>
          <p className='editor-panel-empty-text'>
            Select a component to edit its properties
          </p>
        </div>
      </aside>
    );
  }

  // Early return for unknown component
  if (!registryEntry) {
    return (
      <aside className='editor-panel'>
        <div className='editor-panel-empty'>
          <p>Unknown component type</p>
        </div>
      </aside>
    );
  }

  // Group props by type for organization
  const propEntries = Object.entries(registryEntry.propsSchema);

  return (
    <aside className='editor-panel'>
      <div className='editor-panel-header'>
        <h3 className='editor-panel-header-title'>{selectedComponent.name || registryEntry.displayName}</h3>
        <p className='editor-panel-header-type'>{selectedComponent.componentType}</p>
      </div>

      <div className='editor-panel-content'>
        <div className='editor-panel-section'>
          <div className='editor-panel-section-title'>Properties</div>

          {propEntries.map(([propName, definition]) => {
            // Skip childRatios - we render it separately
            if (propName === 'childRatios') return null;

            // Check conditional visibility
            if (definition.showWhen) {
              const conditionPropValue = selectedComponent.props[definition.showWhen.prop];
              if (conditionPropValue !== definition.showWhen.equals) {
                return null;
              }
            }

            // Skip rendering label for types that have their own label
            if (definition.type === 'boolean' || definition.type === 'dimension') {
              return (
                <div key={propName} className='editor-panel-field'>
                  {renderField(propName, definition)}
                </div>
              );
            }

            return (
              <div key={propName} className='editor-panel-field'>
                <label className='editor-panel-field-label'>
                  {definition.label}
                  {definition.required && <span style={{ color: 'var(--error)' }}> *</span>}
                </label>
                {renderField(propName, definition)}
              </div>
            );
          })}
        </div>

        {/* Spacing Section - available for components without their own spacing props */}
        {!hideSpacing && (
          <div className='editor-panel-section'>
            <div className='editor-panel-section-title'>Spacing</div>
            <SpacingEditor
              label="Padding"
              value={currentPadding}
              onChange={handlePaddingChange}
            />
            <SpacingEditor
              label="Margin"
              value={currentMargin}
              onChange={handleMarginChange}
            />
          </div>
        )}

        {/* Child Ratios Section for Layout components */}
        {isLayoutComponent && childrenCount > 0 && (
          <div className='editor-panel-section'>
            <div className='editor-panel-section-title'>Layout Proportions</div>
            <RatioEditor
              ratios={currentRatios}
              onChange={handleRatiosChange}
              childrenCount={childrenCount}
            />
          </div>
        )}

        {isLayoutComponent && childrenCount === 0 && (
          <div className='editor-panel-section'>
            <div className='editor-panel-section-title'>Child Ratios</div>
            <p className='editor-panel-field-description'>
              Add children to this layout to configure their ratios.
            </p>
          </div>
        )}
      </div>

      <div className='editor-panel-actions'>
        <button
          className='editor-panel-actions-btn'
          onClick={handleDelete}
        >
          <BsTrash style={{ marginRight: '8px' }}/>
          Delete Component
        </button>
      </div>
    </aside>
  );
}
