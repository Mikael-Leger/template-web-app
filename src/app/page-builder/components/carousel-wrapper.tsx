'use client';

import React from 'react';
import Carousel from '@/app/components/carousel/carousel';

interface CarouselWrapperProps {
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  transition?: 'swipe' | 'circle';
  autoRotate?: boolean;
  delayMs?: number;
}

export default function CarouselWrapper({
  image1,
  image2,
  image3,
  image4,
  transition = 'swipe',
  autoRotate = false,
  delayMs,
}: CarouselWrapperProps) {
  // Build images array from individual image props
  const images = [image1, image2, image3, image4]
    .filter((path): path is string => !!path && path.trim() !== '')
    .map(path => ({ path }));

  // Need at least 1 image
  if (images.length === 0) {
    images.push({ path: '/images/placeholder.png' });
  }

  return (
    <Carousel
      images={images}
      transition={transition}
      autoRotate={autoRotate}
      delayMs={delayMs}
    />
  );
}
