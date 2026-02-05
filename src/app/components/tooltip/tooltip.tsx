'use client';

import React, { useState } from 'react';

import './tooltip.scss';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
type TooltipOverflow = 'scroll' | 'truncate' | 'visible';

type SizeMode = 'auto' | 'custom';
type AutoSize = 'fit-content' | 'max-content';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
  position?: TooltipPosition;
  opacity?: number;
  maxWidthMode?: SizeMode;
  maxWidthAuto?: AutoSize;
  maxWidthCustom?: string;
  maxHeightMode?: SizeMode;
  maxHeightAuto?: AutoSize;
  maxHeightCustom?: string;
  overflow?: TooltipOverflow;
  link?: string;
}

export default function Tooltip({
  children,
  text,
  position = 'bottom',
  opacity = 100,
  maxWidthMode = 'auto',
  maxWidthAuto = 'fit-content',
  maxWidthCustom = '250px',
  maxHeightMode = 'auto',
  maxHeightAuto = 'fit-content',
  maxHeightCustom = '150px',
  overflow = 'visible',
  link,
}: TooltipProps) {
  const maxWidth = maxWidthMode === 'auto' ? maxWidthAuto : maxWidthCustom;
  const maxHeight = maxHeightMode === 'auto' ? maxHeightAuto : maxHeightCustom;
  const [isTooltipVisible, setIsTooltipVisible] = useState<boolean>(false);

  const handleTooltipClick = () => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  const getOverflowStyle = (): React.CSSProperties => {
    switch (overflow) {
      case 'scroll':
        return { overflow: 'auto' };
      case 'truncate':
        return { overflow: 'hidden', textOverflow: 'ellipsis' };
      default:
        return { overflow: 'visible' };
    }
  };

  return (
    <div
      className='tooltip relative'
      onMouseEnter={() => setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}
    >
      {children}
      <div
        className={`tooltip-content tooltip-content-${position} absolute`}
        style={{
          opacity: isTooltipVisible ? opacity / 100 : 0,
          pointerEvents: isTooltipVisible ? 'auto' : 'none',
          maxWidth: maxWidth,
          maxHeight: maxHeight,
          cursor: link ? 'pointer' : 'default',
          ...getOverflowStyle(),
        }}
        onMouseEnter={() => setIsTooltipVisible(true)}
        onMouseLeave={() => setIsTooltipVisible(false)}
        onClick={handleTooltipClick}
      >
        <div className='tooltip-content-text'>
          {isTooltipVisible && text}
        </div>
      </div>
    </div>
  );
}
