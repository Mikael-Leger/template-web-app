import React from 'react';

import './title.scss';

interface TitleProps {
  text: string;
  orientation?: 'start' | 'center' | 'end';
  size?: 'small' | 'medium' |'big';
  underline?: boolean;
  margin?: 'none' | 'inner' | 'outer';
}

export default function Title({text, underline, orientation = 'center', size = 'small', margin = 'inner'}: TitleProps) {
  const getClassNames = () => {
    const sizeClassMap: Record<string, string> = {
      small: 'title-small',
      medium: 'title-medium',
      big: 'title-big',
    };

    const orientationClassMap: Record<string, string> = {
      start: 'text-start',
      center: 'text-center',
      end: 'text-end',
    };

    return [
      sizeClassMap[size] || '',
      orientationClassMap[orientation] || '',
    ]
      .filter(Boolean)
      .join(' ');
  };

  return (
    <div className={`title ${getClassNames()} title-margin-${margin} flex flex-col`} style={{alignSelf: orientation}}>
      {text}
      {underline && (
        <div className='title-underline'/>
      )}
    </div>
  );
}
