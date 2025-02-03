import React from 'react';

import './separator.scss';

interface SeparatorProps {
  height?: number
  width?: number
}

export default function Separator({height = 1, width = 100}: SeparatorProps) {

  return (
    <div className='separator' style={{
      minHeight: height,
      height: height,
      width: `${width}%`
    }}>
    </div>
  );
}
