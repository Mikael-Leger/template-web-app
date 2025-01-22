'use client';

import React from 'react';

import './title.scss';

interface TitleProps {
  text: string;
  orientation?: 'start' | 'center' | 'end';
  size?: 'small' | 'medium' |'big';
  underline?: boolean;
}

export default function Title({text, underline, orientation = 'center', size = 'small'}: TitleProps) {

  return (
    <div className={`title title-${size} flex flex-col`} style={{alignSelf: orientation}}>
      {text}
      {underline && (
        <div className='title-underline'/>
      )}
    </div>
  );
}
