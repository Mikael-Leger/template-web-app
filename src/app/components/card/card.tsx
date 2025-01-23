import React from 'react';

import './card.scss';

interface CardProps {
  children: React.ReactNode;
  orientation?: 'start' | 'center' | 'end';
  size?: 'small' | 'medium' |'big';
}

export default function Card({children, orientation = 'center', size = 'small'}: CardProps) {

  return (
    <div className={`card card-${size} flex flex-col`} style={{alignSelf: orientation}}>
      {children}
    </div>
  );
}
