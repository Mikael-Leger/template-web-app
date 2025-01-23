import React from 'react';

import Carousel from '../carousel/carousel';

import './description-and-image.scss';

interface DescriptionAndImageProps {
  text?: string;
  orientation?: 'start' | 'center' | 'end' | 'top' | 'bottom';
  imagePaths?: string[];
  opacity?: number;
  absolute?: boolean;
  transition?: 'swipe' | 'circle';
  delayMs?: number;
  button?: {
    title: string;
    position: 'start' | 'center' | 'end';
    onClick: (_payload?: any) => any};
}

type TextAlign = 'start' |'center' |'end';

export default function DescriptionAndImage({text, imagePaths, button, transition = 'swipe', delayMs = -1, orientation = 'center', opacity = 1, absolute = false}: DescriptionAndImageProps) {
  const renderText = () => {
    if (!text) return;

    return (
      <div className='description-and-image-text flex-1'>
        {text}
      </div>
    );
  };

  const renderButton = () => {
    if (!button) return;

    return (
      <div
        className={'description-and-image-button flex'}
        style={{justifyContent: button.position}}
        onClick={button.onClick}>
        <button>
          {button.title}
        </button>
      </div>
    );
  };

  const renderPanel = () => {
    if (!text && !button) return;

    return (
      <div
        className={`description-and-image-panel flex flex-col ${absolute && 'self-center absolute shadowed w-1/2'}`}
        style={{textAlign: orientation as TextAlign}}
        key='panel'>
        {renderText()}
        {renderButton()}
      </div>
    );
  };

  const renderImage = () => {
    if (!imagePaths) return;

    if (imagePaths.length === 1) return (
      <img
        className={`${absolute ? 'w-full' : 'w-1/2'}`}
        src={imagePaths[0]}
        style={{opacity}}
        key='img'/>
    );

    return (
      <div className={`${absolute ? 'w-full' : 'w-1/2'}`} key='img'>
        <Carousel
          imagePaths={imagePaths}
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
  
    const isRow = ['start', 'center', 'end'].includes(orientation);
    const flexDirection = isRow ? 'flex-row' : 'flex-col';

    const isTopOrBot = orientation === 'top' || orientation === 'bottom';
  
    return (
      <div className={`description-and-image-container flex ${flexDirection} ${isTopOrBot && 'items-center'} ${absolute && 'items-center justify-center'}`}>
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
