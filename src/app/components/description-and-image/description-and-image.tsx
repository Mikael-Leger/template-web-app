import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

import Carousel from '../carousel/carousel';
import Button from '../button/button';
import { DescriptionAndImageButton } from '@/app/interfaces/button.interface';
import { useIsMobile } from '@/app/contexts/mobile-context';

import './description-and-image.scss';

interface DescriptionAndImageProps {
  text?: string;
  orientation?: 'start' | 'center' | 'end';
  axis?: 'row' | 'col';
  images?: {
    path: string;
    caption?: string;
  }[];
  flip?: boolean;
  opacity?: number;
  absolute?: boolean;
  shape?: 'none' | 'circle';
  transition?: 'swipe' | 'circle';
  delayMs?: number;
  buttons?: DescriptionAndImageButton[];
  noBottomPadding?: boolean;
}

type TextAlign = 'start' |'center' |'end';

export default function DescriptionAndImage({
  text,
  images,
  buttons,
  delayMs,
  shape = 'none',
  transition = 'swipe',
  orientation = 'center',
  axis = 'row',
  flip = false,
  opacity = 1,
  absolute = false,
  noBottomPadding = false
}: DescriptionAndImageProps) {
  const {isMobile} = useIsMobile();

  const [isHovered, setIsHovered] = useState(false);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const currentImageAnimation = useRef<{
    isAnimating: boolean,
    rotateX: number
  }>({
    isAnimating: true,
    rotateX: 0
  });

  useEffect(() => {
    setTimeout(() => {
      currentImageAnimation.current.isAnimating = false;
    }, 50);
  }, []);

  useEffect(() => {
    if (!flip || currentImageAnimation.current.isAnimating) return;

    currentImageAnimation.current.isAnimating = true;

    const duration = .8;
    const ease = 'power2';

    if (isHovered) {
      gsap.to(imageRef.current, {rotateY: '+=360', duration, ease: `${ease}.out`});
    }

    setTimeout(() => {
      currentImageAnimation.current.isAnimating = false;
    }, duration * 1000);
  }, [isHovered]);

  const renderText = () => {
    if (!text) return;

    return (
      <div className='description-and-image-text flex-1'>
        {text}
      </div>
    );
  };

  const renderButton = () => {
    if (!buttons) return;

    return (
      <div
        className='description-and-image-buttons flex flex-row flex-wrap items-end'
        style={{justifyContent: buttons[0].position}}>
        {buttons.map(button => (
          <div
            className={'description-and-image-buttons-button flex'}
            key={button.title}>
            <Button {...button}/>
          </div>

        ))}
      </div>
    );
  };

  const getPanelWidth = () => {
    if (absolute && isMobile) return '80%';
    if (isMobile) return '100%';

    return '50%';
  };

  const renderPanel = () => {
    if (!text && !buttons) return;
    
    const isRow = axis === 'row';

    return (
      <div
        className={`description-and-image-panel flex flex-col ${isRow && 'flex-row'} ${absolute && 'self-center absolute shadowed'}`}
        style={{
          textAlign: orientation as TextAlign,
          width: getPanelWidth()
        }}
        key='panel'>
        {renderText()}
        {renderButton()}
      </div>
    );
  };

  const renderImage = () => {
    if (!images) return;

    const image = images[0];

    const clipPath = shape === 'circle' ? 'circle(33%)' : undefined;

    if (images.length === 1) return (
      <div className={`description-and-image-image flex flex-col items-center ${absolute || isMobile ? 'w-full' : 'w-1/2'}`} key='img'>
        <img
          src={image.path}
          style={{opacity, clipPath}}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          ref={imageRef}/>
        {image.caption && (
          <div className='description-and-image-caption'>
            {image.caption}
          </div>
        )}
      </div>
    );

    return (
      <div className={`description-and-image-image ${absolute ? 'w-full' : 'w-1/2'}`} key='img'>
        <Carousel
          images={images}
          transition={transition}
          delayMs={delayMs}/>
      </div>
    );
  };

  const renderContent = () => {
    const orientationMap: Record<string, React.ReactNode[]> = {
      start: [renderPanel(), renderImage()],
      center: [renderPanel(), renderImage()],
      end: [renderImage(), renderPanel()],
      top: [renderPanel(), renderImage()],
      bottom: [renderImage(), renderPanel()],
    };
  
    const isRow = axis === 'row';
    const flexDirection = isRow && (!isMobile || orientation === 'center') ? 'flex-row' : 'flex-col';

    return (
      <div className={`description-and-image-container flex ${flexDirection} ${!isRow && 'items-center'} ${absolute && 'items-center justify-center'}`}>
        {orientationMap[orientation] || null}
      </div>
    );
  };

  return (
    <div
      className={'description-and-image flex flex-col w-full'}
      style={{
        alignSelf: orientation,
        paddingBottom: noBottomPadding ? '0' : undefined
      }}>
      {renderContent()}
    </div>
  );
}
