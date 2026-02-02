'use client';

import React, { useMemo } from 'react';

import { ComponentInstance, PageConfig } from '../interfaces/page-config.interface';
import { getComponent } from '../registry/component-registry';

interface PageRendererProps {
  config: PageConfig;
  isEditing?: boolean;
  onComponentClick?: (_id: string) => void;
  selectedComponentId?: string;
  onDragStart?: (_componentId: string) => void;
  onDragEnd?: () => void;
  draggingComponentId?: string | null;
  onDropIntoContainer?: (_containerId: string, _componentType?: string, _existingId?: string) => void;
}

/**
 * Editor Wrapper Component
 * Wraps components in edit mode to enable selection and interaction
 */
interface EditorWrapperProps {
  componentId: string;
  componentType: string;
  displayName: string;
  isSelected: boolean;
  onClick?: (_id: string) => void;
  locked?: boolean;
  children: React.ReactNode;
  onDragStart?: (_componentId: string) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  acceptsChildren?: boolean;
  onDropIntoContainer?: (_containerId: string, _componentType?: string, _existingId?: string) => void;
  depth: number;
}

function EditorWrapper({
  componentId,
  componentType,
  displayName,
  isSelected,
  onClick,
  locked,
  children,
  onDragStart,
  onDragEnd,
  isDragging,
  acceptsChildren,
  onDropIntoContainer,
  depth,
}: EditorWrapperProps) {
  const [isDropTarget, setIsDropTarget] = React.useState(false);
  const [isLabelDropTarget, setIsLabelDropTarget] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick && !locked) {
      onClick(componentId);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('existingComponentId', componentId);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(componentId);
  };

  const handleDragEnd = () => {
    onDragEnd?.();
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!acceptsChildren) return;
    e.preventDefault();
    e.stopPropagation();

    // Don't allow dropping into self
    const existingId = e.dataTransfer.types.includes('existingcomponentid');
    if (existingId) {
      e.dataTransfer.dropEffect = 'move';
    } else {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    if (!acceptsChildren) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!acceptsChildren) return;
    e.stopPropagation();
    // Only set to false if we're leaving the wrapper itself
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDropTarget(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!acceptsChildren || !onDropIntoContainer) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);

    const componentTypeData = e.dataTransfer.getData('componentType');
    const existingComponentId = e.dataTransfer.getData('existingComponentId');

    // Don't allow dropping into self
    if (existingComponentId === componentId) return;

    onDropIntoContainer(componentId, componentTypeData || undefined, existingComponentId || undefined);
  };

  // Label-specific drop handlers for containers
  const handleLabelDragOver = (e: React.DragEvent) => {
    if (!acceptsChildren) return;
    e.preventDefault();
    e.stopPropagation();
    const existingId = e.dataTransfer.types.includes('existingcomponentid');
    e.dataTransfer.dropEffect = existingId ? 'move' : 'copy';
  };

  const handleLabelDragEnter = (e: React.DragEvent) => {
    if (!acceptsChildren) return;
    e.preventDefault();
    e.stopPropagation();
    setIsLabelDropTarget(true);
  };

  const handleLabelDragLeave = (e: React.DragEvent) => {
    if (!acceptsChildren) return;
    e.stopPropagation();
    setIsLabelDropTarget(false);
  };

  const handleLabelDrop = (e: React.DragEvent) => {
    if (!acceptsChildren || !onDropIntoContainer) return;
    e.preventDefault();
    e.stopPropagation();
    setIsLabelDropTarget(false);

    const componentTypeData = e.dataTransfer.getData('componentType');
    const existingComponentId = e.dataTransfer.getData('existingComponentId');

    // Don't allow dropping into self
    if (existingComponentId === componentId) return;

    onDropIntoContainer(componentId, componentTypeData || undefined, existingComponentId || undefined);
  };

  // Calculate label offset for stacking
  const labelStyle = {
    top: `${depth * 22}px`,
  };

  return (
    <div
      className={`editor-wrapper ${isSelected ? 'editor-wrapper-selected' : ''} ${locked ? 'editor-wrapper-locked' : ''} ${isDragging ? 'editor-wrapper-dragging' : ''} ${isDropTarget ? 'editor-wrapper-drop-target' : ''} ${acceptsChildren ? 'editor-wrapper-container' : ''}`}
      onClick={handleClick}
      draggable={!locked}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-component-id={componentId}
      data-component-type={componentType}
      data-accepts-children={acceptsChildren}
    >
      {children}
      {/* Always show label for containers, with drop target functionality */}
      {acceptsChildren && (
        <div
          className={`editor-wrapper-label editor-wrapper-label-container ${isSelected ? 'editor-wrapper-label-selected' : ''} ${isLabelDropTarget ? 'editor-wrapper-label-drop-target' : ''}`}
          style={labelStyle}
          onClick={handleClick}
          onDragOver={handleLabelDragOver}
          onDragEnter={handleLabelDragEnter}
          onDragLeave={handleLabelDragLeave}
          onDrop={handleLabelDrop}
        >
          {displayName}
        </div>
      )}
      {/* Show label for non-containers only when selected */}
      {!acceptsChildren && isSelected && !locked && (
        <div className='editor-wrapper-label' style={labelStyle}>
          {displayName}
        </div>
      )}
      {isDropTarget && !isLabelDropTarget && (
        <div className='editor-wrapper-drop-indicator'>
          Drop inside {displayName}
        </div>
      )}
    </div>
  );
}

/**
 * Page Renderer Component
 *
 * Renders a PageConfig by dynamically instantiating components
 * from the registry based on the configuration.
 */

export default function PageRenderer({
  config,
  isEditing = false,
  onComponentClick,
  selectedComponentId,
  onDragStart,
  onDragEnd,
  draggingComponentId,
  onDropIntoContainer,
}: PageRendererProps) {
  /**
   * Recursively render a component and its children
   */
  const renderComponent = (instance: ComponentInstance, depth: number = 0): React.ReactNode => {
    const registryEntry = getComponent(instance.componentType);

    if (!registryEntry) {
      return (
        <div key={instance.id} className='unknown-component'>
          Unknown component: {instance.componentType}
        </div>
      );
    }

    const { component: Component } = registryEntry;

    // Process props - filter out any undefined values
    const processedProps = Object.entries(instance.props).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }

        return acc;
      },
      {} as Record<string, unknown>
    );

    // Render children if component accepts them
    const children = instance.children?.length
      ? instance.children
        .sort((a, b) => a.order - b.order)
        .map((child) => renderComponent(child, depth + 1))
      : undefined;

    // In edit mode, wrap with editor wrapper
    if (isEditing) {
      return (
        <EditorWrapper
          key={instance.id}
          componentId={instance.id}
          componentType={instance.componentType}
          displayName={registryEntry.displayName}
          isSelected={selectedComponentId === instance.id}
          onClick={onComponentClick}
          locked={instance.locked}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          isDragging={draggingComponentId === instance.id}
          acceptsChildren={registryEntry.acceptsChildren}
          onDropIntoContainer={onDropIntoContainer}
          depth={depth}
        >
          <Component {...processedProps}>{children}</Component>
        </EditorWrapper>
      );
    }

    // Normal render
    return (
      <Component key={instance.id} {...processedProps}>
        {children}
      </Component>
    );
  };

  // Sort components by order
  const sortedComponents = useMemo(
    () => [...config.components].sort((a, b) => a.order - b.order),
    [config.components]
  );

  // Determine layout class based on settings
  const layoutClass = useMemo(() => {
    const classes = ['page-renderer'];

    classes.push(`page-layout-${config.settings.layout}`);

    if (config.settings.spacing) {
      classes.push(`page-spacing-${config.settings.spacing}`);
    }

    if (isEditing) {
      classes.push('page-renderer-editing');
    }

    return classes.join(' ');
  }, [config.settings, isEditing]);

  // Background style
  const backgroundStyle = useMemo(() => {
    if (!config.settings.background) return {};

    const { type, value } = config.settings.background;

    switch (type) {
    case 'color':
      return { backgroundColor: value };
    case 'image':
      return { backgroundImage: `url(${value})`, backgroundSize: 'cover' };
    case 'gradient':
      return { background: value };
    default:
      return {};
    }
  }, [config.settings.background]);

  return (
    <div className={layoutClass} style={backgroundStyle}>
      {sortedComponents.map(renderComponent)}
    </div>
  );
}

/**
 * Render a single component instance (for preview in editor)
 */

export function renderSingleComponent(
  instance: ComponentInstance
): React.ReactNode {
  const registryEntry = getComponent(instance.componentType);

  if (!registryEntry) {
    return null;
  }

  const { component: Component } = registryEntry;

  return <Component {...instance.props}/>;
}
