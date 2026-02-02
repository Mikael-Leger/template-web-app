import React from 'react';

import { useIsMobile } from '@/app/contexts/mobile-context';

interface LayoutProps {
  orientation?: 'row' | 'col';
  space?: 'around' | 'between' | 'evenly';
  childRatios?: number[]; // Flex ratios for each child (e.g., [1, 1, 1] for equal sizing)
  items?: {
    space?: number,
    node: React.ReactNode;
    className?: string;
  }[];
  className?: string;
  children?: React.ReactNode;
}

export default function Layout({items, className, orientation = 'row', space = 'between', childRatios, children}: LayoutProps) {
  const {isMobile} = useIsMobile();

  const getFlexOrientation = () => {
    if (isMobile) return 'flex-col';

    return `flex-${orientation}`;
  };

  const getJustify = () => {
    switch (space) {
    case 'around': return 'justify-around';
    case 'between': return 'justify-between';
    case 'evenly': return 'justify-evenly';
    default: return 'justify-between';
    }
  };

  // Apply flex ratios to children
  const applyRatiosToChildren = (childElements: React.ReactNode) => {
    const childArray = React.Children.toArray(childElements);

    return childArray.map((child, index) => {
      const ratio = childRatios?.[index] ?? 1; // Default to 1 if no ratio specified

      return (
        <div
          key={index}
          className="layout-child"
          style={{ flex: ratio, minWidth: 0 }}
        >
          {child}
        </div>
      );
    });
  };

  // Check if layout is empty (no children and no items)
  const isEmpty = !children && (!items || items.length === 0);

  // If children are passed (from page builder), render them with ratios
  if (children) {
    return (
      <div className={`layout flex ${getFlexOrientation()} ${getJustify()} gap-4 ${className || ''}`}>
        {applyRatiosToChildren(children)}
      </div>
    );
  }

  // If items are passed (for hardcoded usage like newsletter)
  if (items && items.length > 0) {
    return (
      <div className={`layout flex ${getFlexOrientation()} ${className || ''}`}>
        {items.map((item, index) => (
          <div className={`flex flex-col ${item.className || ''}`} style={{flex: item.space}} key={index}>{item.node}</div>
        ))}
      </div>
    );
  }

  // Empty layout - show placeholder
  return (
    <div className={`layout layout-empty flex ${getFlexOrientation()} ${getJustify()} gap-4 ${className || ''}`}>
      <span className="layout-placeholder">Drop components here</span>
    </div>
  );
}
