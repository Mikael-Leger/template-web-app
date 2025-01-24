import React from 'react';

import './card.scss';

interface CardProps {
  children: React.ReactNode;
  orientation?: 'start' | 'center' | 'end';
  size?: 'small' | 'medium' | 'big';
  width?: number;
  height?: number;
  background?: 'default' | 'gradient';
  padding?: 'none' | 'inner' | 'outer';
  margin?: 'none' | 'inner' | 'outer';
  className?: string;
  borderColor?: 'primary' | 'black';
  id?: string;
}

export default function Card({children, width, height, className, id, orientation = 'center', size = 'small', background = 'default', padding = 'outer', margin = 'outer', borderColor = 'primary'}: CardProps) {

  return (
    <div
      id={id}
      className={`flex ${className} card card-${size} card-${background} card-padding-${padding} card-margin-${margin} card-border-${borderColor} ${!className?.includes('flex-row') && 'flex-col'}`}
      style={{alignSelf: orientation, width, height}}>
      {children}
    </div>
  );
}
