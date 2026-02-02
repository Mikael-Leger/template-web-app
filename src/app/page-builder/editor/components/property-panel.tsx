'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BsSliders, BsTrash } from 'react-icons/bs';

import { useEditor } from '../../contexts/editor-context';
import { getComponent } from '../../registry/component-registry';
import { PropDefinition } from '../../interfaces/page-config.interface';
import ConfirmationModal from '@/app/components/modal/confirmation-modal';
import RatioEditor from './ratio-editor';

export default function PropertyPanel() {
  const { selectedComponent, updateComponentProps, removeComponent } = useEditor();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Get registry entry (memoized to avoid recalculation)
  const registryEntry = useMemo(() => {
    if (!selectedComponent) return null;
    return getComponent(selectedComponent.componentType);
  }, [selectedComponent]);

  // Get children count for Layout components
  const childrenCount = selectedComponent?.children?.length || 0;
  const isLayoutComponent = selectedComponent?.componentType === 'Layout';

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
    setShowDeleteModal(true);
  }, []);

  // Confirm delete
  const confirmDelete = useCallback(() => {
    if (!selectedComponent) return;
    removeComponent(selectedComponent.id);
    setShowDeleteModal(false);
  }, [selectedComponent, removeComponent]);

  // Handle ratio change from the RatioEditor
  const handleRatiosChange = useCallback((newRatios: number[]) => {
    if (!selectedComponent) return;
    updateComponentProps(selectedComponent.id, { childRatios: newRatios });
  }, [selectedComponent, updateComponentProps]);

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
          <span>{definition.label}</span>
        </div>
      );

    case 'select':
      return (
        <select
          className='editor-panel-field-select'
          value={(value as string) || ''}
          onChange={(e) => handlePropChange(propName, e.target.value)}
        >
          {definition.options?.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      );

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
        <h3 className='editor-panel-header-title'>{registryEntry.displayName}</h3>
        <p className='editor-panel-header-type'>{selectedComponent.componentType}</p>
      </div>

      <div className='editor-panel-content'>
        <div className='editor-panel-section'>
          <div className='editor-panel-section-title'>Properties</div>

          {propEntries.map(([propName, definition]) => {
            // Skip childRatios - we render it separately
            if (propName === 'childRatios') return null;

            // Skip rendering checkbox differently
            if (definition.type === 'boolean') {
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

      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Component"
        message="Are you sure you want to delete this component? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </aside>
  );
}
