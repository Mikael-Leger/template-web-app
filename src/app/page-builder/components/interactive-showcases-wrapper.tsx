'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { InteractiveShowcases } from '@/app/components/interactive-showcase/interactive-showcase';
import { getAllShowcases } from '@/app/services/showcase-service';
import { ShowcaseStorageItem } from '@/app/interfaces/showcase.interface';

interface InteractiveShowcasesWrapperProps {
  showcases?: string[];
  cardWidth?: number;
  cardHeight?: number;
  backgroundColor?: 'default' | 'gradient';
}

export default function InteractiveShowcasesWrapper({
  showcases: showcaseIds = [],
  cardWidth = 250,
  cardHeight = 250,
  backgroundColor = 'gradient',
}: InteractiveShowcasesWrapperProps) {
  const router = useRouter();
  const [allShowcases, setAllShowcases] = useState<ShowcaseStorageItem[]>([]);

  useEffect(() => {
    setAllShowcases(getAllShowcases());
  }, []);

  const filteredIds = showcaseIds.filter(id => !!id && id !== '');

  const resolvedShowcases = filteredIds
    .map(id => allShowcases.find(s => s.id === id))
    .filter((s): s is ShowcaseStorageItem => !!s)
    .map(s => ({
      title: s.title,
      onClick: () => {
        if (s.url) router.push(s.url);
      },
      images: s.images.map(img => ({
        path: img.path,
        style: img.style as object | undefined,
        alt: img.alt,
        animations: img.animations as { to: object }[] | undefined,
      })),
    }));

  if (resolvedShowcases.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--gray-400)' }}>
        Select showcases from the property panel
      </div>
    );
  }

  return (
    <InteractiveShowcases
      showcases={resolvedShowcases}
      cardWidth={cardWidth}
      cardHeight={cardHeight}
      backgroundColor={backgroundColor}
    />
  );
}
