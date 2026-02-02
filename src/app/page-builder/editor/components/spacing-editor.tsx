'use client';

import React, { useCallback } from 'react';

export interface SpacingValue {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

interface SpacingEditorProps {
  label: string;
  value: SpacingValue;
  onChange: (value: SpacingValue) => void;
}

const DEFAULT_SPACING: SpacingValue = {
  top: '0px',
  right: '0px',
  bottom: '0px',
  left: '0px',
};

function parseSpacingValue(val: string): { num: number; unit: 'px' | '%' } {
  const match = val.match(/^(-?\d*\.?\d+)(px|%)$/);
  if (match) {
    return { num: parseFloat(match[1]), unit: match[2] as 'px' | '%' };
  }
  return { num: 0, unit: 'px' };
}

function formatSpacingValue(num: number, unit: 'px' | '%'): string {
  return `${num}${unit}`;
}

export default function SpacingEditor({ label, value, onChange }: SpacingEditorProps) {
  const spacing = { ...DEFAULT_SPACING, ...value };

  const handleChange = useCallback((side: keyof SpacingValue, numValue: number, unit: 'px' | '%') => {
    onChange({
      ...spacing,
      [side]: formatSpacingValue(numValue, unit),
    });
  }, [spacing, onChange]);

  const handleUnitChange = useCallback((side: keyof SpacingValue, newUnit: 'px' | '%') => {
    const parsed = parseSpacingValue(spacing[side]);
    onChange({
      ...spacing,
      [side]: formatSpacingValue(parsed.num, newUnit),
    });
  }, [spacing, onChange]);

  const renderInput = (side: keyof SpacingValue, sideLabel: string) => {
    const parsed = parseSpacingValue(spacing[side]);

    return (
      <div className="spacing-editor-input-group">
        <label className="spacing-editor-input-label">{sideLabel}</label>
        <div className="spacing-editor-input-row">
          <input
            type="number"
            className="spacing-editor-input"
            value={parsed.num}
            onChange={(e) => handleChange(side, parseFloat(e.target.value) || 0, parsed.unit)}
          />
          <select
            className="spacing-editor-unit"
            value={parsed.unit}
            onChange={(e) => handleUnitChange(side, e.target.value as 'px' | '%')}
          >
            <option value="px">px</option>
            <option value="%">%</option>
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="spacing-editor">
      <div className="spacing-editor-label">{label}</div>
      <div className="spacing-editor-grid">
        {renderInput('top', 'Top')}
        {renderInput('right', 'Right')}
        {renderInput('bottom', 'Bottom')}
        {renderInput('left', 'Left')}
      </div>
    </div>
  );
}

export { DEFAULT_SPACING };
