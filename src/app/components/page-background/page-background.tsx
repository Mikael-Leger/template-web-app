import React from 'react';

import './page-background.scss';

interface PageBackgroundProps {
  imagePath: string;
}

export default function PageBackground({imagePath}: PageBackgroundProps) {
  return (
    <div className='page-background fixed top-0'>
      <img className='w-full h-full' src={imagePath}/>
    </div>
  );
}
