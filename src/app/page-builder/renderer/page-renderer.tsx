'use client';

import React, { useMemo } from 'react';
import {
  BsCardChecklist,
  BsGrid,
  BsDash,
  BsType,
  BsTextLeft,
  BsImage,
  BsPlayCircle,
  BsCardImage,
  BsHandIndex,
  BsEnvelope,
  BsShop,
  BsChatQuote,
  BsImages,
  BsLayers,
  BsLayoutTextWindow,
  BsChat,
  BsWindowDock,
} from 'react-icons/bs';

import { ComponentInstance, PageConfig } from '../interfaces/page-config.interface';
import { getComponent } from '../registry/component-registry';

// Icon map for component icons
const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  BsCardChecklist,
  BsGrid,
  BsDash,
  BsType,
  BsTextLeft,
  BsImage,
  BsPlayCircle,
  BsCardImage,
  BsHandIndex,
  BsEnvelope,
  BsShop,
  BsChatQuote,
  BsImages,
  BsLayers,
  BsLayoutTextWindow,
  BsChat,
  BsWindowDock,
};

interface PageRendererProps {
  config: PageConfig;
  isEditing?: boolean;
  onComponentClick?: (_id: string) => void;
  selectedComponentId?: string;
  onDragStart?: (_componentId: string) => void;
  onDragEnd?: () => void;
  draggingComponentId?: string | null;
  onDropIntoContainer?: (_containerId: string, _componentType?: string, _existingId?: string) => void;
  onContextMenu?: (_e: React.MouseEvent, _componentId: string) => void;
  onDropBetween?: (_index: number, _componentType?: string, _existingId?: string) => void;
  isDraggingExternal?: boolean;
}

/**
 * Editor Wrapper Component
 * Wraps components in edit mode to enable selection and interaction
 */
interface EditorWrapperProps {
  componentId: string;
  componentType: string;
  displayName: string;
  icon?: string;
  isSelected: boolean;
  onClick?: (_id: string) => void;
  onContextMenu?: (_e: React.MouseEvent, _componentId: string) => void;
  locked?: boolean;
  children: React.ReactNode;
  onDragStart?: (_componentId: string) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  acceptsChildren?: boolean;
  onDropIntoContainer?: (_containerId: string, _componentType?: string, _existingId?: string) => void;
  onDropBetween?: (_index: number, _componentType?: string, _existingId?: string) => void;
  componentIndex: number;
  depth: number;
  spacingStyle?: React.CSSProperties;
  isDraggingExternal?: boolean;
}

function EditorWrapper({
  componentId,
  componentType,
  displayName,
  icon,
  isSelected,
  onClick,
  onContextMenu,
  locked,
  children,
  onDragStart,
  onDragEnd,
  isDragging,
  acceptsChildren,
  onDropIntoContainer,
  onDropBetween,
  componentIndex,
  depth,
  spacingStyle,
  isDraggingExternal,
}: EditorWrapperProps) {
  const IconComponent = icon ? iconMap[icon] : null;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu?.(e, componentId);
  };
  const [isDropTarget, setIsDropTarget] = React.useState(false);
  const [isLabelDropTarget, setIsLabelDropTarget] = React.useState(false);
  const [dropPosition, setDropPosition] = React.useState<'before' | 'after' | null>(null);

  // Reset drop states when dragging stops
  React.useEffect(() => {
    if (!isDraggingExternal) {
      setDropPosition(null);
      setIsDropTarget(false);
      setIsLabelDropTarget(false);
    }
  }, [isDraggingExternal]);

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
    e.preventDefault();
    e.stopPropagation();

    const existingId = e.dataTransfer.types.includes('existingcomponentid');
    e.dataTransfer.dropEffect = existingId ? 'move' : 'copy';

    // Show drop indicator when in bottom portion of component (for between-component drops)
    if (depth === 0 && !acceptsChildren) {
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY;
      const bottomThreshold = rect.bottom - rect.height * 0.35;
      setDropPosition(y > bottomThreshold ? 'after' : null);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (acceptsChildren) {
      setIsDropTarget(true);
    } else if (depth === 0) {
      // Calculate initial position for between-component indicator
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY;
      const bottomThreshold = rect.bottom - rect.height * 0.35;
      setDropPosition(y > bottomThreshold ? 'after' : null);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();

    // Check if we're entering a child element
    const relatedTarget = e.relatedTarget as Element | null;
    if (relatedTarget && e.currentTarget.contains(relatedTarget)) {
      // If entering a child that is also a container, clear our drop indicator
      // to avoid duplicate "Drop inside" messages on nested containers
      const childContainer = relatedTarget.closest('[data-accepts-children="true"]');
      if (childContainer && childContainer !== e.currentTarget) {
        setIsDropTarget(false);
      }
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    // Expand the check area to include drop indicators (40px above and below)
    const expandedTop = rect.top - 50;
    const expandedBottom = rect.bottom + 50;

    if (x < rect.left || x >= rect.right || y < expandedTop || y >= expandedBottom) {
      setIsDropTarget(false);
      setDropPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const componentTypeData = e.dataTransfer.getData('componentType');
    const existingComponentId = e.dataTransfer.getData('existingComponentId');

    // Don't allow dropping into self
    if (existingComponentId === componentId) {
      setIsDropTarget(false);
      setDropPosition(null);
      return;
    }

    // Handle drop into container
    if (acceptsChildren && onDropIntoContainer && isDropTarget) {
      setIsDropTarget(false);
      onDropIntoContainer(componentId, componentTypeData || undefined, existingComponentId || undefined);
      return;
    }

    // Handle drop between components (top-level only)
    if (depth === 0 && dropPosition && onDropBetween) {
      const insertIndex = dropPosition === 'before' ? componentIndex : componentIndex + 1;
      onDropBetween(insertIndex, componentTypeData || undefined, existingComponentId || undefined);
    }

    setIsDropTarget(false);
    setDropPosition(null);
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

  const showDropIndicator = depth === 0 && dropPosition && isDraggingExternal;

  const handleDropIndicatorDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDropIndicatorDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const componentTypeData = e.dataTransfer.getData('componentType');
    const existingComponentId = e.dataTransfer.getData('existingComponentId');

    if (existingComponentId === componentId) {
      setDropPosition(null);
      return;
    }

    if (depth === 0 && dropPosition && onDropBetween) {
      const insertIndex = dropPosition === 'before' ? componentIndex : componentIndex + 1;
      onDropBetween(insertIndex, componentTypeData || undefined, existingComponentId || undefined);
    }

    setDropPosition(null);
  };

  return (
    <div
      className={`editor-wrapper ${isSelected ? 'editor-wrapper-selected' : ''} ${locked ? 'editor-wrapper-locked' : ''} ${isDragging ? 'editor-wrapper-dragging' : ''} ${isDropTarget ? 'editor-wrapper-drop-target' : ''} ${acceptsChildren ? 'editor-wrapper-container' : ''}`}
      style={spacingStyle}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
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
      {/* Drop indicator after component - only show "after" to avoid duplicates */}
      {showDropIndicator && dropPosition === 'after' && (
        <div
          className='editor-wrapper-drop-between editor-wrapper-drop-between-after'
          onDragOver={handleDropIndicatorDragOver}
          onDrop={handleDropIndicatorDrop}
        >
          <span>Drop here</span>
        </div>
      )}
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
          {IconComponent && <IconComponent size={12} />}
          <span>{displayName}</span>
        </div>
      )}
      {/* Show label for non-containers only when selected */}
      {!acceptsChildren && isSelected && !locked && (
        <div className='editor-wrapper-label' style={labelStyle}>
          {IconComponent && <IconComponent size={12} />}
          <span>{displayName}</span>
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
  onContextMenu,
  onDropBetween,
  isDraggingExternal,
}: PageRendererProps) {
  /**
   * Recursively render a component and its children
   */
  const renderComponent = (instance: ComponentInstance, depth: number = 0, index: number = 0): React.ReactNode => {
    const registryEntry = getComponent(instance.componentType);

    if (!registryEntry) {
      return (
        <div key={instance.id} className='unknown-component'>
          Unknown component: {instance.componentType}
        </div>
      );
    }

    const { component: Component } = registryEntry;

    // Process props - filter out any undefined values and internal props
    const processedProps = Object.entries(instance.props).reduce(
      (acc, [key, value]) => {
        // Skip internal props (starting with _)
        if (key.startsWith('_')) return acc;
        if (value !== undefined) {
          acc[key] = value;
        }

        return acc;
      },
      {} as Record<string, unknown>
    );

    // Extract spacing props for inline styles
    const paddingProp = instance.props._padding as { top?: string; right?: string; bottom?: string; left?: string } | undefined;
    const marginProp = instance.props._margin as { top?: string; right?: string; bottom?: string; left?: string } | undefined;

    const spacingStyle: React.CSSProperties = {};
    if (paddingProp) {
      if (paddingProp.top && paddingProp.top !== '0px') spacingStyle.paddingTop = paddingProp.top;
      if (paddingProp.right && paddingProp.right !== '0px') spacingStyle.paddingRight = paddingProp.right;
      if (paddingProp.bottom && paddingProp.bottom !== '0px') spacingStyle.paddingBottom = paddingProp.bottom;
      if (paddingProp.left && paddingProp.left !== '0px') spacingStyle.paddingLeft = paddingProp.left;
    }
    if (marginProp) {
      if (marginProp.top && marginProp.top !== '0px') spacingStyle.marginTop = marginProp.top;
      if (marginProp.right && marginProp.right !== '0px') spacingStyle.marginRight = marginProp.right;
      if (marginProp.bottom && marginProp.bottom !== '0px') spacingStyle.marginBottom = marginProp.bottom;
      if (marginProp.left && marginProp.left !== '0px') spacingStyle.marginLeft = marginProp.left;
    }

    // Render children if component accepts them
    const children = instance.children?.length
      ? instance.children
        .sort((a, b) => a.order - b.order)
        .map((child, childIndex) => renderComponent(child, depth + 1, childIndex))
      : undefined;

    // Check if we have any spacing to apply
    const hasSpacing = Object.keys(spacingStyle).length > 0;

    // In edit mode, wrap with editor wrapper
    if (isEditing) {
      return (
        <EditorWrapper
          key={instance.id}
          componentId={instance.id}
          componentType={instance.componentType}
          displayName={instance.name || registryEntry.displayName}
          icon={registryEntry.icon}
          isSelected={selectedComponentId === instance.id}
          onClick={onComponentClick}
          onContextMenu={onContextMenu}
          locked={instance.locked}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          isDragging={draggingComponentId === instance.id}
          acceptsChildren={registryEntry.acceptsChildren}
          onDropIntoContainer={onDropIntoContainer}
          onDropBetween={onDropBetween}
          componentIndex={index}
          depth={depth}
          spacingStyle={spacingStyle}
          isDraggingExternal={isDraggingExternal}
        >
          <Component {...processedProps} isEditing={true}>{children}</Component>
        </EditorWrapper>
      );
    }

    // Normal render - wrap with spacing div if needed
    if (hasSpacing) {
      return (
        <div key={instance.id} style={spacingStyle}>
          <Component {...processedProps}>{children}</Component>
        </div>
      );
    }

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
      {sortedComponents.map((component, index) => renderComponent(component, 0, index))}
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
