import React from 'react';

import { useIsMobile } from '@/app/contexts/mobile-context';
import DynamicIcon from '../dynamic-icon/dynamic-icon';

import './details-section.scss';

export interface DetailsInterface {
  title: string;
  icon: string;
  content: string[];
}

interface DetailsSectionProps {
  items: DetailsInterface[];
  alreadyLooping?: boolean;
}

export default function DetailsSection({items, alreadyLooping}: DetailsSectionProps) {
  const {isMobile} = useIsMobile();

  if (isMobile && !alreadyLooping) {
    return items.map(item => (
      <DetailsSection items={[item]} alreadyLooping key={item.title}/>
    ));
  }

  return (
    <div className='details-section flex flex-row flex-gap justify-center padding-inner'>
      {items.map(item => (
        <div
          className='details-section-item flex flex-col flex-gap relative flex-1'
          key={item.title}>
          <div className='details-section-item-icon flex flex-row flex-gap items-center justify-center padding-inner absolute'>
            <DynamicIcon iconName={item.icon} size={32}/>
          </div>
          <div className='details-section-item-title flex flex-row flex-gap justify-center'>
            {item.title}
          </div>
          <div className='details-section-item-content flex flex-col items-center'>
            {item.content.map(text => (
              <div className='details-section-item-content-text' key={text}>
                {text}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
