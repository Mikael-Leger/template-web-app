'use client';

import React from 'react';

import Title from './components/title/title';

import './home.scss';

export default function HomePage() {
  return (
    <div className='home w-full h-full flex'>
      <Title text='Lorem Ipsum' orientation='start' size='big' underline/>
    </div>
  );
}
