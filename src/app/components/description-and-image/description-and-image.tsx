import React from 'react';

import Carousel from '../carousel/carousel';
import Button from '../button/button';
import { DescriptionAndImageButton } from '@/app/interfaces/button.interface';

import './description-and-image.scss';

interface DescriptionAndImageProps {
  text?: string;
  orientation?: 'start' | 'center' | 'end';
  axis?: 'row' | 'col';
  images?: {
    path: string;
    caption?: string;
  }[];
  opacity?: number;
  absolute?: boolean;
  shape?: 'none' | 'circle';
  transition?: 'swipe' | 'circle';
  delayMs?: number;
  buttons?: DescriptionAndImageButton[];
}

type TextAlign = 'start' |'center' |'end';

export default function DescriptionAndImage({text, images, buttons, shape = 'none', transition = 'swipe', delayMs = -1, orientation = 'center', axis = 'row', opacity = 1, absolute = false}: DescriptionAndImageProps) {
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

  const renderPanel = () => {
    if (!text && !buttons) return;
    
    const isRow = axis === 'row';

    return (
      <div
        className={`description-and-image-panel flex flex-col ${isRow && 'panel-row'} ${absolute && 'self-center absolute shadowed w-1/2'}`}
        style={{textAlign: orientation as TextAlign}}
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
      <div className={`description-and-image-image flex flex-col items-center ${absolute ? 'w-full' : 'w-1/2'}`} key='img'>
        <img
          src={image.path}
          style={{opacity, clipPath}}/>
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

  const renderContent = (orientation: string) => {
    const orientationMap: Record<string, React.ReactNode[]> = {
      start: [renderPanel(), renderImage()],
      center: [renderPanel(), renderImage()],
      end: [renderImage(), renderPanel()],
      top: [renderPanel(), renderImage()],
      bottom: [renderImage(), renderPanel()],
    };
  
    const isRow = axis === 'row';
    const flexDirection = isRow ? 'flex-row' : 'flex-col';

    return (
      <div className={`description-and-image-container flex ${flexDirection} ${!isRow && 'items-center'} ${absolute && 'items-center justify-center'}`}>
        {orientationMap[orientation] || null}
      </div>
    );
  };

  return (
    <div className={'description-and-image flex flex-col w-full'} style={{alignSelf: orientation}}>
      {renderContent(orientation)}
    </div>
  );
}
