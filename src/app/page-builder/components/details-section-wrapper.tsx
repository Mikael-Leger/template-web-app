'use client';

import React from 'react';
import DetailsSection from '@/app/components/details-section/details-section';
import { DetailsInterface } from '@/app/components/details-section/details-section';

interface DetailsSectionItem {
  title: string;
  icon: string;
  image: string;
  descriptions: string[];
}

interface DetailsSectionWrapperProps {
  sections?: DetailsSectionItem[];
  backgroundColor?: string;
  iconBackgroundColor?: string;
  textColor?: string;
}

const defaultSections: DetailsSectionItem[] = [
  { title: 'Adresse', icon: 'BsPinMap', image: '', descriptions: ['Rue Brederode, 16', '1000 Bruxelles, Belgique'] },
  { title: 'Téléphone', icon: 'BsTelephone', image: '', descriptions: ['01 23 45 67 89'] },
  { title: 'Horaires', icon: 'BsClock', image: '', descriptions: ['Lundi - Vendredi', '9h-18h', 'Samedi et Dimanche', '10h-12h'] },
];

export default function DetailsSectionWrapper({
  sections = defaultSections,
  backgroundColor = '',
  iconBackgroundColor = '',
  textColor = '',
}: DetailsSectionWrapperProps) {
  const items: DetailsInterface[] = sections
    .filter(s => s.title && s.title.trim() !== '')
    .map(s => ({
      title: s.title,
      icon: s.icon || undefined,
      image: s.image || undefined,
      content: s.descriptions.filter(d => d && d.trim() !== ''),
    }))
    .filter(item => item.content.length > 0 || item.title);

  if (items.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--gray-400)' }}>
        Configure details sections in the property panel
      </div>
    );
  }

  return (
    <DetailsSection
      items={items}
      backgroundColor={backgroundColor || undefined}
      iconBackgroundColor={iconBackgroundColor || undefined}
      textColor={textColor || undefined}
    />
  );
}
