'use client';

import React, { useMemo, useCallback, useState, useRef } from 'react';
import { BsArrowsCollapse } from 'react-icons/bs';

interface RatioEditorProps {
  ratios: number[];
  onChange: (ratios: number[]) => void;
  childrenCount: number;
}

// Common presets based on number of children
const PRESETS: Record<number, { label: string; ratios: number[] }[]> = {
  2: [
    { label: 'Equal', ratios: [1, 1] },
    { label: '1:2', ratios: [1, 2] },
    { label: '2:1', ratios: [2, 1] },
    { label: '1:3', ratios: [1, 3] },
    { label: '3:1', ratios: [3, 1] },
    { label: '2:3', ratios: [2, 3] },
  ],
  3: [
    { label: 'Equal', ratios: [1, 1, 1] },
    { label: '1:2:1', ratios: [1, 2, 1] },
    { label: '2:1:1', ratios: [2, 1, 1] },
    { label: '1:1:2', ratios: [1, 1, 2] },
    { label: '1:3:1', ratios: [1, 3, 1] },
  ],
  4: [
    { label: 'Equal', ratios: [1, 1, 1, 1] },
    { label: '2:1:1:2', ratios: [2, 1, 1, 2] },
    { label: '1:2:2:1', ratios: [1, 2, 2, 1] },
  ],
};

// Generate default presets for any count
function getPresets(count: number) {
  if (PRESETS[count]) return PRESETS[count];
  // Default: just equal distribution
  return [{ label: 'Equal', ratios: Array(count).fill(1) }];
}

export default function RatioEditor({ ratios, onChange, childrenCount }: RatioEditorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate total and percentages
  const total = useMemo(() => ratios.reduce((sum, r) => sum + r, 0), [ratios]);
  const percentages = useMemo(
    () => ratios.map((r) => (total > 0 ? (r / total) * 100 : 100 / ratios.length)),
    [ratios, total]
  );

  // Available presets for current child count
  const presets = useMemo(() => getPresets(childrenCount), [childrenCount]);

  // Check if current ratios match a preset
  const activePreset = useMemo(() => {
    const normalizedCurrent = ratios.map((r) => r / Math.min(...ratios));
    return presets.find((preset) => {
      const normalizedPreset = preset.ratios.map((r) => r / Math.min(...preset.ratios));
      return normalizedCurrent.every((v, i) => Math.abs(v - normalizedPreset[i]) < 0.01);
    })?.label;
  }, [ratios, presets]);

  // Handle preset click
  const handlePresetClick = useCallback(
    (presetRatios: number[]) => {
      onChange([...presetRatios]);
    },
    [onChange]
  );

  // Handle divider drag
  const handleMouseDown = useCallback(
    (index: number) => (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setDragIndex(index);
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || dragIndex === null || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const totalWidth = rect.width;

      // Calculate where the divider should be as a percentage
      const targetPercent = (x / totalWidth) * 100;

      // Calculate cumulative percentages up to the drag index
      let cumulativeBefore = 0;
      for (let i = 0; i < dragIndex; i++) {
        cumulativeBefore += percentages[i];
      }

      // The new percentage for the item before the divider
      const newPercentBefore = Math.max(10, Math.min(90, targetPercent - cumulativeBefore + percentages[dragIndex]));
      const newPercentAfter = percentages[dragIndex] + percentages[dragIndex + 1] - newPercentBefore + percentages[dragIndex];

      if (newPercentBefore < 10 || newPercentAfter < 10) return;

      // Convert percentages back to ratios (keep total the same)
      const newRatios = [...ratios];
      const combinedRatio = ratios[dragIndex] + ratios[dragIndex + 1];
      const ratio = newPercentBefore / (newPercentBefore + newPercentAfter - percentages[dragIndex]);

      newRatios[dragIndex] = Math.round(combinedRatio * ratio * 10) / 10;
      newRatios[dragIndex + 1] = Math.round((combinedRatio - newRatios[dragIndex]) * 10) / 10;

      // Ensure minimum values
      if (newRatios[dragIndex] >= 0.5 && newRatios[dragIndex + 1] >= 0.5) {
        onChange(newRatios);
      }
    },
    [isDragging, dragIndex, percentages, ratios, onChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragIndex(null);
  }, []);

  // Set up global mouse listeners for dragging
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle direct percentage input
  const handlePercentageChange = useCallback(
    (index: number, newPercent: number) => {
      const clampedPercent = Math.max(5, Math.min(95, newPercent));
      const oldPercent = percentages[index];
      const diff = clampedPercent - oldPercent;

      // Distribute the difference among other items proportionally
      const newRatios = ratios.map((r, i) => {
        if (i === index) {
          return (clampedPercent / 100) * total;
        }
        const otherTotal = 100 - oldPercent;
        const proportion = percentages[i] / otherTotal;
        return ((percentages[i] - diff * proportion) / 100) * total;
      });

      // Round and ensure minimums
      const roundedRatios = newRatios.map((r) => Math.max(0.5, Math.round(r * 10) / 10));
      onChange(roundedRatios);
    },
    [percentages, ratios, total, onChange]
  );

  // Reset to equal
  const handleReset = useCallback(() => {
    onChange(Array(childrenCount).fill(1));
  }, [childrenCount, onChange]);

  return (
    <div className="ratio-editor">
      {/* Presets */}
      <div className="ratio-editor-presets">
        {presets.map((preset) => (
          <button
            key={preset.label}
            className={`ratio-editor-preset ${activePreset === preset.label ? 'active' : ''}`}
            onClick={() => handlePresetClick(preset.ratios)}
            title={preset.ratios.join(':')}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Visual preview bar */}
      <div className="ratio-editor-preview" ref={containerRef}>
        {ratios.map((ratio, index) => (
          <React.Fragment key={index}>
            <div
              className="ratio-editor-segment"
              style={{ flex: ratio }}
            >
              <span className="ratio-editor-segment-label">
                {Math.round(percentages[index])}%
              </span>
            </div>
            {index < ratios.length - 1 && (
              <div
                className={`ratio-editor-divider ${isDragging && dragIndex === index ? 'dragging' : ''}`}
                onMouseDown={handleMouseDown(index)}
                title="Drag to adjust"
              >
                <div className="ratio-editor-divider-handle" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Individual controls */}
      <div className="ratio-editor-controls">
        {ratios.map((ratio, index) => (
          <div key={index} className="ratio-editor-control">
            <label className="ratio-editor-control-label">
              Child {index + 1}
            </label>
            <div className="ratio-editor-control-input-wrapper">
              <input
                type="range"
                className="ratio-editor-slider"
                value={percentages[index]}
                min={5}
                max={95}
                step={1}
                onChange={(e) => handlePercentageChange(index, Number(e.target.value))}
              />
              <span className="ratio-editor-control-value">
                {Math.round(percentages[index])}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Reset button */}
      <button className="ratio-editor-reset" onClick={handleReset}>
        <BsArrowsCollapse size={12} />
        Reset to Equal
      </button>
    </div>
  );
}
