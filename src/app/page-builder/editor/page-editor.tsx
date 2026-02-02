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
import './page-editor.scss';

interface PageEditorProps {
  pageId: string;
  onExit?: () => void;
}

function EditorContent({ pageId, onExit }: PageEditorProps) {
  const { state, dispatch } = useEditor();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const confirmExit = window.confirm(
        'You have unsaved changes. Are you sure you want to exit?'
      );

      if (!confirmExit) return;
    }

    onExit?.();
  }, [state.hasUnsavedChanges, onExit]);

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
          onSave={handleSave}
          onExit={handleExit}
        />
        <PageRenderer config={state.page} isEditing={false}/>
      </div>
    );
  }

  // Editor mode
  return (
    <div className='page-editor'>
      <EditorHeader
        pageTitle={state.page?.metadata.title || 'Untitled'}
        onSave={handleSave}
        onExit={handleExit}
      />
      <div className='editor-content'>
        <ComponentSidebar/>
        <EditorCanvas/>
        <PropertyPanel/>
      </div>
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
