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

  return (
    <div className={`title title-${size} text-${orientation} title-margin-${margin} flex flex-col`} style={{alignSelf: orientation}}>
      {text}
      {underline && (
        <div className='title-underline'/>
      )}
    </div>
  );
}
