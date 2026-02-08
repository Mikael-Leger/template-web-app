import React from 'react';

import { useIsMobile } from '@/app/contexts/mobile-context';
import DynamicIcon from '../dynamic-icon/dynamic-icon';

import './details-section.scss';

export interface DetailsInterface {
  title: string;
  icon?: string;
  image?: string;
  content: string[];
}

interface DetailsSectionProps {
  items: DetailsInterface[];
  alreadyLooping?: boolean;
  backgroundColor?: string;
  iconBackgroundColor?: string;
  textColor?: string;
}

export default function DetailsSection({
  items,
  alreadyLooping,
  backgroundColor,
  iconBackgroundColor,
  textColor,
}: DetailsSectionProps) {
  const {isMobile} = useIsMobile();

  if (isMobile && !alreadyLooping) {
    return items.map(item => (
      <DetailsSection
        items={[item]}
        alreadyLooping
        key={item.title}
        backgroundColor={backgroundColor}
        iconBackgroundColor={iconBackgroundColor}
        textColor={textColor}
      />
    ));
  }

  const sectionStyle: React.CSSProperties = backgroundColor ? { backgroundColor } : {};
  const iconBgStyle: React.CSSProperties = iconBackgroundColor ? { backgroundColor: iconBackgroundColor } : {};
  const iconColorStyle: React.CSSProperties = textColor ? { color: textColor } : {};
  const textStyle: React.CSSProperties = textColor ? { color: textColor } : {};

  return (
    <div
      className='details-section flex flex-row flex-gap justify-center padding-inner'
      style={sectionStyle}
    >
      {items.map(item => (
        <div
          className='details-section-item flex flex-col flex-gap relative flex-1'
          key={item.title}>
          <div
            className='details-section-item-icon flex flex-row flex-gap items-center justify-center padding-inner absolute'
            style={{ ...iconBgStyle, ...iconColorStyle }}
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.title}
                style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : item.icon ? (
              <DynamicIcon iconName={item.icon} size={32}/>
            ) : null}
          </div>
          <div
            className='details-section-item-title flex flex-row flex-gap justify-center'
            style={textStyle}
          >
            {item.title}
          </div>
          <div className='details-section-item-content flex flex-col items-center'>
            {item.content.map(text => (
              <div className='details-section-item-content-text' key={text} style={textStyle}>
                {text}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
