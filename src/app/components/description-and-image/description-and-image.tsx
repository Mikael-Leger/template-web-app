import React from 'react';

import './description-and-image.scss';

interface DescriptionAndImageProps {
  text?: string;
  orientation?: 'start' | 'center' | 'end' | 'top' | 'bottom';
  imagePaths?: string[];
  opacity?: number;
  absolute?: boolean;
  button?: {
    title: string;
    position: 'start' | 'center' | 'end';
    onClick: (_payload?: any) => any};
}

export default function DescriptionAndImage({text, imagePaths, button, orientation = 'center', opacity = 1, absolute = false}: DescriptionAndImageProps) {
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

    const justifyPosition = `justify-${button.position}`;

    return (
      <div className={`description-and-image-button flex ${justifyPosition}`} onClick={button.onClick}>
        <button>
          {button.title}
        </button>
      </div>
    );
  };

  const renderPanel = () => {
    if (!text && !button) return;

    const textOrientation = `text-${orientation}`;

    return (
      <div className={`description-and-image-panel flex flex-col ${textOrientation} ${absolute && 'self-center absolute z-10 shadowed w-1/2'}`} key='panel'>
        {renderText()}
        {renderButton()}
      </div>
    );
  };

  const renderImage = () => {
    if (!imagePaths) return;
    const opacityStyle = `opacity-${opacity * 100}`;

    if (imagePaths.length === 1) return (
      <img className={`${opacityStyle} ${absolute ? 'w-full' : 'w-1/2'}`} src={imagePaths[0]} key='img'/>
    );

    return <div></div>;
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
