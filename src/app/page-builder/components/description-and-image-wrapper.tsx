'use client';

import React from 'react';
import DescriptionAndImage from '@/app/components/description-and-image/description-and-image';

interface DescriptionAndImageWrapperProps {
  text?: string;
  orientation?: 'start' | 'center' | 'end';
  axis?: 'row' | 'col';
  imagePath?: string;
  imageCaption?: string;
  shape?: 'none' | 'circle';
  flip?: boolean;
  fullWidth?: boolean;
}

export default function DescriptionAndImageWrapper({
  text,
  orientation,
  axis,
  imagePath,
  imageCaption,
  shape,
  flip,
  fullWidth,
}: DescriptionAndImageWrapperProps) {
  // Transform single image props into images array
  const images = imagePath ? [{ path: imagePath, caption: imageCaption }] : undefined;

  return (
    <DescriptionAndImage
      text={text}
      orientation={orientation}
      axis={axis}
      images={images}
      shape={shape}
      flip={flip}
      fullWidth={fullWidth}
    />
  );
}
