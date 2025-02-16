import React from 'react';

import { useIsMobile } from '@/app/contexts/mobile-context';
import { CardContext, useIsInCard } from '@/app/contexts/card-context';

import './card.scss';

interface CardProps {
  children: React.ReactNode;
  orientation?: 'start' | 'center' | 'end';
  size?: 'small' | 'medium' | 'big';
  width?: number;
  height?: number;
  background?: 'default' | 'gradient';
  padding?: 'none' | 'inner' | 'outer';
  margin?: 'none' | 'inner' | 'outer';
  className?: string;
  borderColor?: 'primary' | 'black';
  id?: string;
  style?: object;
}

export default function Card({children, width, height, className, id, style, orientation = 'center', size = 'small', background = 'default', padding = 'outer', margin = 'outer', borderColor = 'primary'}: CardProps) {
  const {isMobile} = useIsMobile();
  const isInCard = useIsInCard();

  const getSize = () => {
    return (isInCard || !isMobile) ? `card-${size}` : 'card-big';
  };

  const getResponsiveDimension = (dimension: number | undefined) => {
    // if (isMobile && isInCard) return '100%';

    return dimension;
  };

  const getDimensionStyles = () => {
    const widthStyle = getResponsiveDimension(width);
    const heightStyle = isMobile ? undefined : getResponsiveDimension(height);

    return {
      width: widthStyle,
      height: heightStyle
    };
  };

  return (
    <CardContext.Provider value={true}>
      <div
        id={id}
        className={`flex card ${getSize()} card-${background} card-padding-${isMobile ? 'mobile' : padding} ${isInCard && 'aspect-[1/1]'} card-margin-${margin} card-border-${borderColor} ${!className?.includes('flex-row') && 'flex-col'} ${className}`}
        style={{
          ...style,
          ...getDimensionStyles(),
          alignSelf: orientation
        }}>
        {children}
      </div>
    </CardContext.Provider>
  );
}
