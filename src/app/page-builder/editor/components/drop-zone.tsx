'use client';

import React from 'react';

interface DropZoneProps {
  parentId: string | null;
  index: number;
  isActive: boolean;
  isContainer?: boolean;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

export default function DropZone({
  parentId,
  index,
  isActive,
  isContainer = false,
  onDragEnter,
  onDragLeave,
  onDrop,
}: DropZoneProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDragEnter();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    // Only trigger leave if we're actually leaving the element
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      onDragLeave();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDrop(e);
  };

  return (
    <div
      className={`drop-zone ${isActive ? 'drop-zone-active' : ''} ${isContainer ? 'drop-zone-container' : ''}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-parent-id={parentId || 'root'}
      data-index={index}
    >
      {isActive && <span className="drop-zone-label">Drop here</span>}
    </div>
  );
}
