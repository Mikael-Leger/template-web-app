import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

import './parallax-cover.scss';

interface ParallaxCoverProps {
  imagePath: string;
  height?: number;
}

export default function ParallaxCover({imagePath, height = 300}: ParallaxCoverProps) {
  const parallaxCoverRef = useRef<HTMLDivElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: parallaxCoverRef.current,
          start: '-10% bottom',
          end: '210% top',
          scrub: true
        },
      });
      
      tl.to(imageContainerRef.current, { clipPath: 'inset(0% 0% 0% 0%)' })
        .to(imageContainerRef.current, { clipPath: 'inset(0% 0% 100% 0%)' });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      className='parallax-cover w-full'
      style={{height}}
      ref={parallaxCoverRef}>
      <div
        className='parallax-cover-container w-full fixed bottom-0'
        ref={imageContainerRef}>
        <img
          className='w-full'
          src={imagePath}
          ref={imageRef}/>
      </div>
    </div>
  );
}
