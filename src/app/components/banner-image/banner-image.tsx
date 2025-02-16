import React from 'react';

import { useIsMobile } from '@/app/contexts/mobile-context';
import Image from '../image/image';

import './banner-image.scss';

interface BannerImageProps {
  path: string;
  className?: string;
  height?: string;
  onClick?: () => void;
}

export default function BannerImage({path, className, height, onClick}: BannerImageProps) {
  const {isMobile} = useIsMobile();
  
  return (
    <div className='banner-image' style={{height: height && isMobile ? parseInt(height) / 2 : height}} onClick={onClick}>
      <Image path={path} className={`w-full h-full ${className}`} objectFit='cover' objectPosition={isMobile ? '100% 30%' : '80% 30%'}/>
    </div>
  );
}