import React from 'react';

import './text.scss';

interface TextProps {
  content: string;
  orientation?: 'start' | 'center' | 'end';
  size?: 'small' | 'medium' | 'big';
  className?: string;
}

export default function Text({ content, className, orientation = 'start', size = 'medium' }: TextProps) {
  const getClassNames = () => {
    const sizeClassMap: Record<string, string> = {
      small: 'text-size-small',
      medium: 'text-size-medium',
      big: 'text-size-big',
    };

    const orientationClassMap: Record<string, string> = {
      start: 'text-start',
      center: 'text-center',
      end: 'text-end',
    };

    return [
      sizeClassMap[size] || '',
      orientationClassMap[orientation] || '',
    ]
      .filter(Boolean)
      .join(' ');
  };

  return (
    <p className={`text-component ${getClassNames()} ${className || ''}`}>
      {content}
    </p>
  );
}
