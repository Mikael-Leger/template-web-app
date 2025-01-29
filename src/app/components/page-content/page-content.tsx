'use client';

import React from 'react';
import './page-content.scss';

interface PageContentProps {
  children: React.ReactNode;
}

export default function PageContent({children}: PageContentProps) {
  return (
    <div className='page-content'>
      {children}
    </div>
  );
}
