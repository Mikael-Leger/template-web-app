'use client';

import React from 'react';
import { BsArrowLeft, BsArrowCounterclockwise, BsArrowClockwise, BsEye, BsCheck2, BsExclamationTriangle } from 'react-icons/bs';

import { useEditor } from '../../contexts/editor-context';

interface EditorHeaderProps {
  pageTitle: string;
  onSave: () => Promise<void>;
  onExit: () => void;
}

export default function EditorHeader({ pageTitle, onSave, onExit }: EditorHeaderProps) {
  const { state, dispatch, undo, redo, canUndo, canRedo, hasValidationErrors } = useEditor();

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
        <span className='editor-header-title'>{pageTitle}</span>
        {state.hasUnsavedChanges && (
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
