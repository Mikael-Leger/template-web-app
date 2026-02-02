'use client';

import React, { useCallback, useState } from 'react';
import { BsPlus } from 'react-icons/bs';

import { useEditor } from '../../contexts/editor-context';
import PageRenderer from '../../renderer/page-renderer';
import DropZone from './drop-zone';

export default function EditorCanvas() {
  const { state, selectComponent, addComponent, moveComponent, openContextMenu, dispatch } = useEditor();
  const [draggingComponentId, setDraggingComponentId] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [activeDropZone, setActiveDropZone] = useState<{
    parentId: string | null;
    index: number;
  } | null>(null);

  const handleComponentClick = useCallback((componentId: string) => {
    selectComponent(componentId);
  }, [selectComponent]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Only deselect if clicking directly on canvas, not on a component
    if (e.target === e.currentTarget) {
      selectComponent(null);
    }
  }, [selectComponent]);

  const handleDragStart = useCallback((componentId: string) => {
    setDraggingComponentId(componentId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingComponentId(null);
    setActiveDropZone(null);
    setIsDraggingOver(false);
    dispatch({ type: 'END_DRAG' });
  }, [dispatch]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const existingId = e.dataTransfer.types.includes('existingcomponentid');
    e.dataTransfer.dropEffect = existingId ? 'move' : 'copy';
  }, []);

  const handleCanvasDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  }, []);

  const handleCanvasDragLeave = useCallback((e: React.DragEvent) => {
    // Only set false if leaving the canvas entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDraggingOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, parentId: string | null = null, index?: number) => {
    e.preventDefault();

    const componentType = e.dataTransfer.getData('componentType');
    const existingComponentId = e.dataTransfer.getData('existingComponentId');

    const targetIndex = index ?? (state.page?.components.length || 0);

    if (existingComponentId) {
      // Moving an existing component
      moveComponent(existingComponentId, parentId, targetIndex);
    } else if (componentType) {
      // Adding a new component
      addComponent(componentType, parentId, targetIndex);
    }

    setActiveDropZone(null);
    setDraggingComponentId(null);
  }, [addComponent, moveComponent, state.page?.components.length]);

  const handleDropIntoContainer = useCallback((containerId: string, componentType?: string, existingId?: string) => {
    if (existingId) {
      // Moving existing component into container
      moveComponent(existingId, containerId, 0);
    } else if (componentType) {
      // Adding new component into container
      addComponent(componentType, containerId, 0);
    }
    setDraggingComponentId(null);
  }, [addComponent, moveComponent]);

  const handleDropZoneDrop = useCallback((e: React.DragEvent) => {
    if (activeDropZone) {
      handleDrop(e, activeDropZone.parentId, activeDropZone.index);
    }
    setIsDraggingOver(false);
  }, [activeDropZone, handleDrop]);

  const handleContextMenu = useCallback((e: React.MouseEvent, componentId: string) => {
    openContextMenu(e.clientX, e.clientY, componentId);
  }, [openContextMenu]);

  // Render components with drop zones between them
  const renderWithDropZones = () => {
    if (!state.page) return null;

    const components = state.page.components;
    const elements: React.ReactNode[] = [];

    // Drop zone at the start
    elements.push(
      <DropZone
        key="drop-start"
        parentId={null}
        index={0}
        isActive={activeDropZone?.parentId === null && activeDropZone?.index === 0}
        onDragEnter={() => setActiveDropZone({ parentId: null, index: 0 })}
        onDragLeave={() => {}}
        onDrop={handleDropZoneDrop}
      />
    );

    // Render each component with a drop zone after it
    components.forEach((component, idx) => {
      // Drop zone after the component
      elements.push(
        <DropZone
          key={`drop-${idx + 1}`}
          parentId={null}
          index={idx + 1}
          isActive={activeDropZone?.parentId === null && activeDropZone?.index === idx + 1}
          onDragEnter={() => setActiveDropZone({ parentId: null, index: idx + 1 })}
          onDragLeave={() => {}}
          onDrop={handleDropZoneDrop}
        />
      );
    });

    return elements;
  };

  // Render all components in a single PageRenderer to maintain proper layout
  const renderComponents = () => {
    if (!state.page || state.page.components.length === 0) return null;

    return (
      <PageRenderer
        config={state.page}
        isEditing={true}
        onComponentClick={handleComponentClick}
        selectedComponentId={state.selectedComponentId || undefined}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        draggingComponentId={draggingComponentId}
        onDropIntoContainer={handleDropIntoContainer}
        onContextMenu={handleContextMenu}
      />
    );
  };

  if (!state.page) {
    return (
      <main className='editor-canvas'>
        <div className='editor-canvas-inner'>
          <div className='editor-canvas-empty'>
            <BsPlus className='editor-canvas-empty-icon'/>
            <div className='editor-canvas-empty-title'>No page loaded</div>
            <div className='editor-canvas-empty-desc'>
              Please select a page to edit
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (state.page.components.length === 0) {
    return (
      <main
        className='editor-canvas'
        onClick={handleCanvasClick}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e)}
      >
        <div className='editor-canvas-inner'>
          <div className='editor-canvas-empty'>
            <BsPlus className='editor-canvas-empty-icon'/>
            <div className='editor-canvas-empty-title'>Empty Page</div>
            <div className='editor-canvas-empty-desc'>
              Drag components from the sidebar or click them to add
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Check if we're dragging (either from sidebar or moving existing component)
  const isAnyDragging = isDraggingOver || draggingComponentId !== null || state.isDragging;
  const componentCount = state.page?.components.length || 0;

  return (
    <main
      className={`editor-canvas ${isAnyDragging ? 'editor-canvas-dragging' : ''}`}
      onClick={handleCanvasClick}
      onDragOver={handleDragOver}
      onDragEnter={handleCanvasDragEnter}
      onDragLeave={handleCanvasDragLeave}
    >
      <div className='editor-canvas-inner'>
        {/* Drop zone at the very beginning - always visible when dragging */}
        {isAnyDragging && (
          <DropZone
            key="drop-first"
            parentId={null}
            index={0}
            isActive={activeDropZone?.parentId === null && activeDropZone?.index === 0}
            onDragEnter={() => setActiveDropZone({ parentId: null, index: 0 })}
            onDragLeave={() => {}}
            onDrop={handleDropZoneDrop}
          />
        )}

        {renderComponents()}

        {/* Drop zone at the very end - always visible when dragging */}
        {isAnyDragging && componentCount > 0 && (
          <DropZone
            key="drop-last"
            parentId={null}
            index={componentCount}
            isActive={activeDropZone?.parentId === null && activeDropZone?.index === componentCount}
            onDragEnter={() => setActiveDropZone({ parentId: null, index: componentCount })}
            onDragLeave={() => {}}
            onDrop={handleDropZoneDrop}
          />
        )}
      </div>
    </main>
  );
}
