import React from 'react';

import { useIsMobile } from '@/app/contexts/mobile-context';

import './layout.scss';

interface LayoutProps {
  orientation?: 'row' | 'col';
  items: {
    space?: number,
    node: React.ReactNode;
  }[];
}

export default function Layout({items, orientation = 'row'}: LayoutProps) {
  const {isMobile} = useIsMobile();

  const getFlexOrientation = () => {
    if (isMobile) return 'flex-col';

    return `flex-${orientation}`;
  };

  return (
    <div className={`layout flex ${getFlexOrientation()}`}>
      {items.map((item, index) => (
        <div className='flex flex-col' style={{flex: item.space}} key={index}>{item.node}</div>
      ))}
    </div>
  );
}
