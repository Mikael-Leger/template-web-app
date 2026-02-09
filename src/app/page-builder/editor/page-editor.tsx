'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { EditorProvider, useEditor } from '../contexts/editor-context';
import { PageConfig } from '../interfaces/page-config.interface';
import { getPage, savePage } from '../services/page-service';
import PageRenderer from '../renderer/page-renderer';
import EditorHeader from './components/editor-header';
import ComponentSidebar from './components/component-sidebar';
import EditorCanvas from './components/editor-canvas';
import PropertyPanel from './components/property-panel';
import ContextMenu from './components/context-menu';
import ConfirmationModal from '../../components/modal/confirmation-modal';
import './page-editor.scss';

interface PageEditorProps {
  pageId: string;
  onExit?: () => void;
}

function EditorContent({ pageId, onExit }: PageEditorProps) {
  const { state, dispatch, getComponentParentInfo } = useEditor();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Load page on mount
  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        setError(null);
        const page = await getPage(pageId);

        if (page) {
          dispatch({ type: 'SET_PAGE', payload: page });
        } else {
          setError(`Page "${pageId}" not found`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [pageId, dispatch]);

  const handleSave = useCallback(async () => {
    if (!state.page) return;

    const updatedPage: PageConfig = {
      ...state.page,
      updatedAt: new Date().toISOString(),
      version: state.page.version + 1,
    };

    await savePage(updatedPage);
  }, [state.page]);

  const handleExit = useCallback(() => {
    if (state.hasUnsavedChanges) {
      setShowExitConfirm(true);

      return;
    }

    onExit?.();
  }, [state.hasUnsavedChanges, onExit]);

  const handleExitConfirm = useCallback(() => {
    setShowExitConfirm(false);
    onExit?.();
  }, [onExit]);

  const handleExitCancel = useCallback(() => {
    setShowExitConfirm(false);
  }, []);

  // Handle keyboard shortcuts (Delete, F2, Ctrl+C, Ctrl+X, Ctrl+V)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if typing in an input field (except for rename input)
      const target = e.target as HTMLElement;
      const isRenameInput = target.classList.contains('editor-wrapper-rename-input');

      if ((target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) && !isRenameInput) {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Copy (Ctrl+C)
      if (isCtrlOrCmd && e.key === 'c' && state.selectedComponentId && !state.renamingComponentId) {
        e.preventDefault();
        dispatch({ type: 'COPY_COMPONENT', payload: state.selectedComponentId });
      }
      // Cut (Ctrl+X)
      else if (isCtrlOrCmd && e.key === 'x' && state.selectedComponentId && !state.renamingComponentId) {
        e.preventDefault();
        dispatch({ type: 'CUT_COMPONENT', payload: state.selectedComponentId });
      }
      // Paste (Ctrl+V)
      else if (isCtrlOrCmd && e.key === 'v' && state.clipboard.component && !state.renamingComponentId) {
        e.preventDefault();
        // Paste in the same scope as the selected component (as a sibling after it)
        let parentId: string | null = null;
        let index = state.page?.components.length || 0;

        if (state.selectedComponentId) {
          const parentInfo = getComponentParentInfo(state.selectedComponentId);
          if (parentInfo) {
            parentId = parentInfo.parentId;
            index = parentInfo.index + 1; // Insert after the selected component
          }
        }

        dispatch({ type: 'PASTE_COMPONENT', payload: { parentId, index } });
      }
      // Delete
      else if (e.key === 'Delete' && state.selectedComponentId && !state.renamingComponentId) {
        dispatch({ type: 'REMOVE_COMPONENT', payload: state.selectedComponentId });
      }
      // Rename (F2)
      else if (e.key === 'F2' && state.selectedComponentId && !state.renamingComponentId) {
        e.preventDefault();
        dispatch({ type: 'SET_SIDEBAR_TAB', payload: 'layers' });
        dispatch({ type: 'START_RENAME', payload: state.selectedComponentId });
      }
      // Cancel rename (Escape)
      else if (e.key === 'Escape' && state.renamingComponentId) {
        e.preventDefault();
        dispatch({ type: 'STOP_RENAME' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.selectedComponentId, state.renamingComponentId, state.clipboard.component, state.page?.components.length, getComponentParentInfo, dispatch]);

  // Context menu handlers - must be defined before any conditional returns
  const handleContextMenuCopy = useCallback(() => {
    if (state.contextMenu.componentId) {
      dispatch({ type: 'COPY_COMPONENT', payload: state.contextMenu.componentId });
    }
  }, [state.contextMenu.componentId, dispatch]);

  const handleContextMenuCut = useCallback(() => {
    if (state.contextMenu.componentId) {
      dispatch({ type: 'CUT_COMPONENT', payload: state.contextMenu.componentId });
    }
  }, [state.contextMenu.componentId, dispatch]);

  const handleContextMenuPaste = useCallback(() => {
    if (state.clipboard.component) {
      // Paste in the same scope as the context menu component (as a sibling after it)
      let parentId: string | null = null;
      let index = state.page?.components.length || 0;

      if (state.contextMenu.componentId) {
        const parentInfo = getComponentParentInfo(state.contextMenu.componentId);
        if (parentInfo) {
          parentId = parentInfo.parentId;
          index = parentInfo.index + 1; // Insert after the right-clicked component
        }
      }

      dispatch({ type: 'PASTE_COMPONENT', payload: { parentId, index } });
    }
  }, [state.clipboard.component, state.page?.components.length, state.contextMenu.componentId, getComponentParentInfo, dispatch]);

  const handleContextMenuRename = useCallback(() => {
    if (state.contextMenu.componentId) {
      dispatch({ type: 'SET_SIDEBAR_TAB', payload: 'layers' });
      dispatch({ type: 'START_RENAME', payload: state.contextMenu.componentId });
    }
  }, [state.contextMenu.componentId, dispatch]);

  const handleContextMenuDelete = useCallback(() => {
    if (state.contextMenu.componentId) {
      dispatch({ type: 'REMOVE_COMPONENT', payload: state.contextMenu.componentId });
    }
  }, [state.contextMenu.componentId, dispatch]);

  const handleContextMenuClose = useCallback(() => {
    dispatch({ type: 'CLOSE_CONTEXT_MENU' });
  }, [dispatch]);

  // Loading state
  if (loading) {
    return (
      <div className='page-editor'>
        <div className='page-editor-loading'>
          <div className='page-editor-loading-spinner'/>
          <p>Loading page...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='page-editor'>
        <div className='page-editor-error'>
          <h2>Error Loading Page</h2>
          <p>{error}</p>
          <button onClick={() => onExit?.()}>Go Back</button>
        </div>
      </div>
    );
  }

  // Preview mode
  if (state.previewMode && state.page) {
    return (
      <div className='editor-preview'>
        <EditorHeader
          pageTitle={state.page.metadata.title}
          pageSlug={state.page.slug}
          onSave={handleSave}
          onExit={handleExit}
        />
        <PageRenderer config={state.page} isEditing={false}/>
        <ConfirmationModal
          isOpen={showExitConfirm}
          title='Unsaved Changes'
          message='You have unsaved changes. Are you sure you want to exit?'
          confirmLabel='Exit'
          cancelLabel='Cancel'
          variant='danger'
          onConfirm={handleExitConfirm}
          onCancel={handleExitCancel}
        />
      </div>
    );
  }

  // Editor mode
  return (
    <div className='page-editor'>
      <EditorHeader
        pageTitle={state.page?.metadata.title || 'Untitled'}
        pageSlug={state.page?.slug || ''}
        onSave={handleSave}
        onExit={handleExit}
      />
      <div className='editor-content'>
        <ComponentSidebar/>
        <EditorCanvas/>
        <PropertyPanel/>
      </div>
      {state.contextMenu.isOpen && (
        <ContextMenu
          x={state.contextMenu.x}
          y={state.contextMenu.y}
          onCopy={handleContextMenuCopy}
          onCut={handleContextMenuCut}
          onPaste={handleContextMenuPaste}
          onRename={handleContextMenuRename}
          onDelete={handleContextMenuDelete}
          onClose={handleContextMenuClose}
          canPaste={state.clipboard.component !== null}
        />
      )}
      <ConfirmationModal
        isOpen={showExitConfirm}
        title='Unsaved Changes'
        message='You have unsaved changes. Are you sure you want to exit?'
        confirmLabel='Exit'
        cancelLabel='Cancel'
        variant='danger'
        onConfirm={handleExitConfirm}
        onCancel={handleExitCancel}
      />
    </div>
  );
}

export default function PageEditor(props: PageEditorProps) {
  return (
    <EditorProvider>
      <EditorContent {...props}/>
    </EditorProvider>
  );
}
