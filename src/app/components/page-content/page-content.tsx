'use client';

import React, { useEffect, useRef } from 'react';

import { calculateMarginTop } from '@/app/services/page-content';

import './page-content.scss';

interface PageContentProps {
  children: React.ReactNode;
}

export default function PageContent({children}: PageContentProps) {
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!pageRef.current) return;

    const applyMargin = () => {
      Array.from(pageRef.current!.children).forEach((child) => {
        (child as HTMLElement).style.marginTop = `${calculateMarginTop()}px`;
      });
    };

    applyMargin();

    const observer = new MutationObserver(() => {
      applyMargin();
    });

    observer.observe(pageRef.current, { childList: true });

    return () => observer.disconnect();
  }, []);

  return (
    <main id='main-content' className='page-content' ref={pageRef} role='main'>
      {children}
    </main>
  );
}
