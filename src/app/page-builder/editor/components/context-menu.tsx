'use client';

import React, { useEffect, useRef } from 'react';
import { BsPencil, BsTrash, BsCopy, BsScissors, BsClipboard } from 'react-icons/bs';

interface ContextMenuProps {
  x: number;
  y: number;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
  canPaste: boolean;
}

export default function ContextMenu({ x, y, onCopy, onCut, onPaste, onRename, onDelete, onClose, canPaste }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Adjust position to keep menu within viewport
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (rect.right > viewportWidth) {
        menuRef.current.style.left = `${x - rect.width}px`;
      }
      if (rect.bottom > viewportHeight) {
        menuRef.current.style.top = `${y - rect.height}px`;
      }
    }
  }, [x, y]);

  const handleCopy = () => {
    onCopy();
    onClose();
  };

  const handleCut = () => {
    onCut();
    onClose();
  };

  const handlePaste = () => {
    onPaste();
    onClose();
  };

  const handleRename = () => {
    onRename();
    onClose();
  };

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ left: x, top: y }}
    >
      <button className="context-menu-item" onClick={handleCopy}>
        <BsCopy size={14} />
        <span>Copy</span>
        <span className="context-menu-shortcut">Ctrl+C</span>
      </button>
      <button className="context-menu-item" onClick={handleCut}>
        <BsScissors size={14} />
        <span>Cut</span>
        <span className="context-menu-shortcut">Ctrl+X</span>
      </button>
      <button
        className={`context-menu-item ${!canPaste ? 'context-menu-item-disabled' : ''}`}
        onClick={handlePaste}
        disabled={!canPaste}
      >
        <BsClipboard size={14} />
        <span>Paste</span>
        <span className="context-menu-shortcut">Ctrl+V</span>
      </button>
      <div className="context-menu-divider" />
      <button className="context-menu-item" onClick={handleRename}>
        <BsPencil size={14} />
        <span>Rename</span>
        <span className="context-menu-shortcut">F2</span>
      </button>
      <button className="context-menu-item context-menu-item-danger" onClick={handleDelete}>
        <BsTrash size={14} />
        <span>Delete</span>
        <span className="context-menu-shortcut">Del</span>
      </button>
    </div>
  );
}
