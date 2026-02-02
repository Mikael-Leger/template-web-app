'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  BsChevronDown,
  BsChevronRight,
  BsChatQuote,
  BsImages,
  BsLayers,
  BsLayoutTextWindow,
  BsChat,
  BsWindowDock,
} from 'react-icons/bs';

import { useEditor } from '../../contexts/editor-context';
import { getComponent } from '../../registry/component-registry';
import { ComponentInstance } from '../../interfaces/page-config.interface';

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

interface LayerNodeProps {
  component: ComponentInstance;
  depth: number;
  selectedId: string | null;
  renamingId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, newParentId: string | null, newIndex: number) => void;
  onRename: (id: string, name: string) => void;
  onStopRename: () => void;
  onContextMenu: (e: React.MouseEvent, componentId: string) => void;
  parentId: string | null;
  index: number;
  siblings: ComponentInstance[];
  allComponents: ComponentInstance[];
}

function LayerNode({
  component,
  depth,
  selectedId,
  renamingId,
  onSelect,
  onMove,
  onRename,
  onStopRename,
  onContextMenu,
  parentId,
  index,
  siblings,
  allComponents,
}: LayerNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dropPosition, setDropPosition] = useState<'before' | 'inside' | 'after' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const hasChildren = component.children && component.children.length > 0;
  const registryEntry = getComponent(component.componentType);
  const canAcceptChildren = registryEntry?.acceptsChildren ?? false;
  const isRenaming = renamingId === component.id;
  const displayName = component.name || registryEntry?.displayName || component.componentType;

  const IconComponent = registryEntry?.icon ? iconMap[registryEntry.icon] : null;

  // Focus input when renaming starts
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      setRenameValue(displayName);
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming, displayName]);

  const handleRenameSubmit = () => {
    if (renameValue.trim()) {
      onRename(component.id, renameValue.trim());
    }
    onStopRename();
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onStopRename();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e, component.id);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('layerComponentId', component.id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedId = e.dataTransfer.types.includes('layercomponentid');
    if (!draggedId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    if (y < height * 0.25) {
      setDropPosition('before');
    } else if (y > height * 0.75) {
      setDropPosition('after');
    } else if (canAcceptChildren) {
      setDropPosition('inside');
    } else {
      setDropPosition(y < height * 0.5 ? 'before' : 'after');
    }
  };

  const handleDragLeave = () => {
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedId = e.dataTransfer.getData('layerComponentId');
    if (!draggedId || draggedId === component.id) {
      setDropPosition(null);
      return;
    }

    // Find the dragged component in the tree
    const draggedComponent = findComponentById(allComponents, draggedId);

    // Prevent dropping a parent into its own descendant
    if (draggedComponent && isDescendantOf(draggedComponent, component.id)) {
      setDropPosition(null);
      return;
    }

    let newParentId: string | null;
    let newIndex: number;

    switch (dropPosition) {
    case 'before':
      newParentId = parentId;
      newIndex = index;
      break;
    case 'after':
      newParentId = parentId;
      newIndex = index + 1;
      break;
    case 'inside':
      newParentId = component.id;
      newIndex = component.children?.length || 0;
      break;
    default:
      setDropPosition(null);
      return;
    }

    // Adjust index if moving within same parent and after current position
    if (newParentId === parentId) {
      const draggedIndex = siblings.findIndex((s) => s.id === draggedId);
      if (draggedIndex !== -1 && draggedIndex < newIndex) {
        newIndex--;
      }
    }

    onMove(draggedId, newParentId, newIndex);
    setDropPosition(null);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleClick = () => {
    onSelect(component.id);
  };

  const isSelected = selectedId === component.id;

  return (
    <div
      className={`layer-node ${isSelected ? 'layer-node-selected' : ''} ${isDragging ? 'layer-node-dragging' : ''}`}
    >
      <div
        className={`layer-node-header ${dropPosition ? `layer-node-drop-${dropPosition}` : ''}`}
        draggable
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <span
          className={`layer-node-toggle ${!hasChildren ? 'layer-node-toggle-hidden' : ''}`}
          onClick={hasChildren ? handleToggle : undefined}
        >
          {hasChildren && (isExpanded ? <BsChevronDown size={12} /> : <BsChevronRight size={12} />)}
        </span>
        <span className='layer-node-icon'>
          {IconComponent && <IconComponent size={14} />}
        </span>
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            className="layer-node-rename-input"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleRenameKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className='layer-node-name'>
            {displayName}
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className='layer-node-children'>
          {component.children!.map((child, childIndex) => (
            <LayerNode
              key={child.id}
              component={child}
              depth={depth + 1}
              selectedId={selectedId}
              renamingId={renamingId}
              onSelect={onSelect}
              onMove={onMove}
              onRename={onRename}
              onStopRename={onStopRename}
              onContextMenu={onContextMenu}
              parentId={component.id}
              index={childIndex}
              siblings={component.children!}
              allComponents={allComponents}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Find a component by ID in a component tree
 */
function findComponentById(components: ComponentInstance[], id: string): ComponentInstance | null {
  for (const comp of components) {
    if (comp.id === id) return comp;
    if (comp.children) {
      const found = findComponentById(comp.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Check if targetId is the component itself or any of its descendants
 * Used to prevent dropping a parent into its own child
 */
function isDescendantOf(component: ComponentInstance, targetId: string): boolean {
  if (component.id === targetId) return true;
  if (component.children) {
    for (const child of component.children) {
      if (isDescendantOf(child, targetId)) return true;
    }
  }
  return false;
}

export default function LayerTree() {
  const { state, selectComponent, moveComponent, renameComponent, stopRename, openContextMenu } = useEditor();

  const components = state.page?.components || [];

  const handleSelect = (id: string) => {
    selectComponent(id);
  };

  const handleMove = (id: string, newParentId: string | null, newIndex: number) => {
    moveComponent(id, newParentId, newIndex);
  };

  const handleRename = (id: string, name: string) => {
    renameComponent(id, name);
  };

  const handleStopRename = () => {
    stopRename();
  };

  const handleContextMenu = (e: React.MouseEvent, componentId: string) => {
    openContextMenu(e.clientX, e.clientY, componentId);
  };

  if (components.length === 0) {
    return (
      <div className='layer-tree'>
        <div className='layer-tree-empty'>
          No components on page.
          <br />
          Drag components from the Components tab.
        </div>
      </div>
    );
  }

  return (
    <div className='layer-tree'>
      {components.map((component, index) => (
        <LayerNode
          key={component.id}
          component={component}
          depth={0}
          selectedId={state.selectedComponentId}
          renamingId={state.renamingComponentId}
          onSelect={handleSelect}
          onMove={handleMove}
          onRename={handleRename}
          onStopRename={handleStopRename}
          onContextMenu={handleContextMenu}
          parentId={null}
          index={index}
          siblings={components}
          allComponents={components}
        />
      ))}
    </div>
  );
}
