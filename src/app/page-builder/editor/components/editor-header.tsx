'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BsArrowLeft, BsArrowCounterclockwise, BsArrowClockwise, BsEye, BsCheck2, BsExclamationTriangle, BsPencil } from 'react-icons/bs';

import { useEditor } from '../../contexts/editor-context';

interface EditorHeaderProps {
  pageTitle: string;
  pageSlug: string;
  onSave: () => Promise<void>;
  onExit: () => void;
}

export default function EditorHeader({ pageTitle, pageSlug, onSave, onExit }: EditorHeaderProps) {
  const { state, dispatch, undo, redo, canUndo, canRedo, hasValidationErrors } = useEditor();
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [editTitle, setEditTitle] = useState(pageTitle);
  const [editSlug, setEditSlug] = useState(pageSlug);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditTitle(pageTitle);
    setEditSlug(pageSlug);
  }, [pageTitle, pageSlug]);

  useEffect(() => {
    if (isEditingMeta && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingMeta]);

  const handleSave = async () => {
    dispatch({ type: 'SET_SAVING', payload: true });

    try {
      await onSave();
      dispatch({ type: 'MARK_SAVED' });
    } catch {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  };

  const togglePreview = () => {
    dispatch({ type: 'TOGGLE_PREVIEW' });
  };

  const handleMetaSave = () => {
    const trimmedTitle = editTitle.trim();
    const trimmedSlug = editSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');

    if (!trimmedTitle || !trimmedSlug) return;

    dispatch({
      type: 'UPDATE_PAGE_META',
      payload: { title: trimmedTitle, slug: trimmedSlug },
    });
    setEditSlug(trimmedSlug);
    setIsEditingMeta(false);
  };

  const handleMetaCancel = () => {
    setEditTitle(pageTitle);
    setEditSlug(pageSlug);
    setIsEditingMeta(false);
  };

  const handleMetaKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleMetaSave();
    } else if (e.key === 'Escape') {
      handleMetaCancel();
    }
  };

  return (
    <header className='editor-header'>
      <div className='editor-header-left'>
        <button
          className='editor-header-btn editor-header-btn--icon'
          onClick={onExit}
          title='Exit Editor'
        >
          <BsArrowLeft/>
        </button>
        {isEditingMeta ? (
          <div className='editor-header-meta-edit'>
            <div className='editor-header-meta-field'>
              <label>Title</label>
              <input
                ref={titleInputRef}
                type='text'
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleMetaKeyDown}
                placeholder='Page title'
              />
            </div>
            <div className='editor-header-meta-field'>
              <label>Slug</label>
              <input
                type='text'
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value)}
                onKeyDown={handleMetaKeyDown}
                placeholder='page-slug'
              />
            </div>
            <button
              className='editor-header-btn editor-header-btn--primary editor-header-btn--sm'
              onClick={handleMetaSave}
              disabled={!editTitle.trim() || !editSlug.trim()}
            >
              <BsCheck2/>
            </button>
            <button
              className='editor-header-btn editor-header-btn--sm'
              onClick={handleMetaCancel}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className='editor-header-meta' onClick={() => setIsEditingMeta(true)} title='Click to edit title and slug'>
            <span className='editor-header-title'>{pageTitle}</span>
            <span className='editor-header-slug'>/{pageSlug}</span>
            <BsPencil className='editor-header-meta-icon'/>
          </div>
        )}
        {!isEditingMeta && state.hasUnsavedChanges && (
          <span className='editor-header-status editor-header-status--unsaved'>
            Unsaved changes
          </span>
        )}
      </div>

      <div className='editor-header-center'>
        <button
          className='editor-header-btn editor-header-btn--icon'
          onClick={undo}
          disabled={!canUndo}
          title='Undo'
        >
          <BsArrowCounterclockwise/>
        </button>
        <button
          className='editor-header-btn editor-header-btn--icon'
          onClick={redo}
          disabled={!canRedo}
          title='Redo'
        >
          <BsArrowClockwise/>
        </button>
        <div className='editor-header-divider'/>
        <button
          className={`editor-header-btn ${state.previewMode ? 'editor-header-btn--primary' : ''}`}
          onClick={togglePreview}
        >
          <BsEye/>
          {state.previewMode ? 'Exit Preview' : 'Preview'}
        </button>
      </div>

      <div className='editor-header-right'>
        {hasValidationErrors && (
          <span className='editor-header-validation-error' title={state.validationErrors.map(e => e.message).join('\n')}>
            <BsExclamationTriangle/>
            {state.validationErrors.length} error{state.validationErrors.length > 1 ? 's' : ''}
          </span>
        )}
        <button
          className='editor-header-btn editor-header-btn--primary'
          onClick={handleSave}
          disabled={state.isSaving || !state.hasUnsavedChanges || hasValidationErrors}
          title={hasValidationErrors ? 'Fix validation errors before saving' : undefined}
        >
          <BsCheck2/>
          {state.isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </header>
  );
}
