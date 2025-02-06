import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

import './loading.scss';

interface LoadingProps {
}

export default function Loading({}: LoadingProps) {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loaderRef.current) return;

    const bars = loaderRef.current.getElementsByClassName('loading-loader-bar');

    for (let i = 0; i < bars.length; i++) {
      gsap.to(bars[i], {
        rotation: '+=360',
        duration: 2,
        repeat: -1,
        ease: 'power1.out',
        transformOrigin: 'center',
        delay: i * .2
      });
    }
  }, []);

  const showBars = () => {
    const bars = [];
    for (let i = 0; i <= 6; i++) {
      const bar = (
        <div className='loading-loader-bar absolute' key={i}>
          <div className='loading-loader-bar-dot'/>
        </div>
      );
      bars.push(bar);
    }

    return bars;
  };

  return (
    <div className='loading w-full h-full flex justify-center items-center'>
      <div className='loading-loader flex justify-center items-center' ref={loaderRef}>
        {showBars()}
      </div>
    </div>
  );
}