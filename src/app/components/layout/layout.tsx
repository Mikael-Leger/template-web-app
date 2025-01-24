import React from 'react';

import './layout.scss';

interface LayoutProps {
  orientation?: 'row' | 'col';
  items: {
    space?: number,
    node: React.ReactNode;
  }[];
}

export default function Layout({items, orientation = 'row'}: LayoutProps) {

  return (
    <div className={`layout flex flex-${orientation}`}>
      {items.map((item, index) => (
        <div className='flex flex-col' style={{flex: item.space}} key={index}>{item.node}</div>
      ))}
    </div>
  );
}
