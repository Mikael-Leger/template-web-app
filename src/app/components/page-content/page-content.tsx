'use client';

import React, { useEffect, useRef } from 'react';
import './page-content.scss';

interface PageContentProps {
  marginTop: number;
  children: React.ReactNode;
}

export default function PageContent({children, marginTop}: PageContentProps) {
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (pageRef.current) {
      Array.from(pageRef.current.children).forEach((child) => {
        (child as HTMLElement).style.marginTop = `${marginTop}px`;
      });
    }
  }, []);

  return (
    <div className='page-content' ref={pageRef}>
      {children}
    </div>
  );
}
