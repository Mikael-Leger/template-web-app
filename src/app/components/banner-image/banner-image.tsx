import React from 'react';

import { useIsMobile } from '@/app/contexts/mobile-context';
import Image from '../image/image';

import './banner-image.scss';

interface BannerImageProps {
  path: string;
  className?: string;
  height?: number | string;
  onClick?: () => void;
}

export default function BannerImage({path, className, height = 400, onClick}: BannerImageProps) {
  const {isMobile} = useIsMobile();
  const heightValue = typeof height === 'number' ? height : parseInt(height);
  const finalHeight = isMobile ? heightValue / 2 : heightValue;

  return (
    <div className='banner-image' style={{height: `${finalHeight}px`}} onClick={onClick}>
      <Image path={path} className={`w-full h-full ${className}`} objectFit='cover' objectPosition={isMobile ? '100% 30%' : '80% 30%'}/>
    </div>
  );
}