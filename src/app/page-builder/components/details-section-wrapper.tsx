'use client';

import React from 'react';
import DetailsSection from '@/app/components/details-section/details-section';
import { DetailsInterface } from '@/app/components/details-section/details-section';

interface DetailsSectionWrapperProps {
  item1Title?: string;
  item1Icon?: string;
  item1Line1?: string;
  item1Line2?: string;
  item1Line3?: string;
  item1Line4?: string;

  item2Title?: string;
  item2Icon?: string;
  item2Line1?: string;
  item2Line2?: string;
  item2Line3?: string;
  item2Line4?: string;

  item3Title?: string;
  item3Icon?: string;
  item3Line1?: string;
  item3Line2?: string;
  item3Line3?: string;
  item3Line4?: string;

  item4Title?: string;
  item4Icon?: string;
  item4Line1?: string;
  item4Line2?: string;
  item4Line3?: string;
  item4Line4?: string;
}

function buildItem(title: string | undefined, icon: string | undefined, ...lines: (string | undefined)[]): DetailsInterface | null {
  if (!title) return null;
  const content = lines.filter((l): l is string => !!l && l.trim() !== '');
  return {
    title,
    icon: icon || 'BsInfoCircle',
    content: content.length > 0 ? content : [' '],
  };
}

export default function DetailsSectionWrapper({
  item1Title = 'Adresse',
  item1Icon = 'BsPinMap',
  item1Line1 = 'Rue Brederode, 16',
  item1Line2 = '1000 Bruxelles, Belgique',
  item1Line3 = '',
  item1Line4 = '',

  item2Title = 'Téléphone',
  item2Icon = 'BsTelephone',
  item2Line1 = '01 23 45 67 89',
  item2Line2 = '',
  item2Line3 = '',
  item2Line4 = '',

  item3Title = 'Horaires',
  item3Icon = 'BsClock',
  item3Line1 = 'Lundi - Vendredi',
  item3Line2 = '9h-18h',
  item3Line3 = 'Samedi et Dimanche',
  item3Line4 = '10h-12h',

  item4Title = '',
  item4Icon = 'BsInfoCircle',
  item4Line1 = '',
  item4Line2 = '',
  item4Line3 = '',
  item4Line4 = '',
}: DetailsSectionWrapperProps) {
  const items = [
    buildItem(item1Title, item1Icon, item1Line1, item1Line2, item1Line3, item1Line4),
    buildItem(item2Title, item2Icon, item2Line1, item2Line2, item2Line3, item2Line4),
    buildItem(item3Title, item3Icon, item3Line1, item3Line2, item3Line3, item3Line4),
    buildItem(item4Title, item4Icon, item4Line1, item4Line2, item4Line3, item4Line4),
  ].filter((item): item is DetailsInterface => item !== null);

  if (items.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--gray-400)' }}>
        Configure details items in the property panel
      </div>
    );
  }

  return <DetailsSection items={items} />;
}
