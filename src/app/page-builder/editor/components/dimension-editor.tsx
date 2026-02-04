'use client';

import React, { useCallback } from 'react';

interface DimensionEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function parseDimensionValue(val: string): { num: number | ''; unit: 'px' | '%' } {
  if (!val) return { num: '', unit: 'px' };
  const match = val.match(/^(-?\d*\.?\d+)(px|%)$/);
  if (match) {
    return { num: parseFloat(match[1]), unit: match[2] as 'px' | '%' };
  }
  // Try parsing as just a number (assume px)
  const numOnly = parseFloat(val);
  if (!isNaN(numOnly)) {
    return { num: numOnly, unit: 'px' };
  }
  return { num: '', unit: 'px' };
}

function formatDimensionValue(num: number | '', unit: 'px' | '%'): string {
  if (num === '' || num === undefined) return '';
  return `${num}${unit}`;
}

export default function DimensionEditor({ label, value, onChange, placeholder }: DimensionEditorProps) {
  const parsed = parseDimensionValue(value);

  const handleNumChange = useCallback((newNum: string) => {
    const num = newNum === '' ? '' : parseFloat(newNum);
    if (num === '' || isNaN(num as number)) {
      onChange('');
    } else {
      onChange(formatDimensionValue(num, parsed.unit));
    }
  }, [parsed.unit, onChange]);

  const handleUnitChange = useCallback((newUnit: 'px' | '%') => {
    if (parsed.num === '' || parsed.num === undefined) {
      onChange('');
    } else {
      onChange(formatDimensionValue(parsed.num, newUnit));
    }
  }, [parsed.num, onChange]);

  return (
    <div className="dimension-editor">
      <label className="dimension-editor-label">{label}</label>
      <div className="dimension-editor-row">
        <input
          type="number"
          className="dimension-editor-input"
          value={parsed.num}
          placeholder={placeholder}
          onChange={(e) => handleNumChange(e.target.value)}
        />
        <select
          className="dimension-editor-unit"
          value={parsed.unit}
          onChange={(e) => handleUnitChange(e.target.value as 'px' | '%')}
        >
          <option value="px">px</option>
          <option value="%">%</option>
        </select>
      </div>
    </div>
  );
}
