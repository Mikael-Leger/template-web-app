import React, { useState } from 'react';

import './tooltip.scss';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
}

export default function Tooltip({children, text}: TooltipProps) {
  const [isTooltipVisible, setIsTooltipVisible] = useState<boolean>(false);

  return (
    <div
      className='tooltip relative'
      onMouseEnter={() => setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}
    >
      {children}
      <div className='tooltip-content w-full absolute' style={{
        opacity: isTooltipVisible ? 1 : 0,
        borderWidth: isTooltipVisible ? 1 : 0,
        outlineWidth: isTooltipVisible ? 1 : 0,

      }}>
        <div className='tooltip-content-text'>
          {isTooltipVisible && text}
        </div>
      </div>
    </div>
  );
}
