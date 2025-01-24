import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

import Title from '../title/title';

import './interactive-showcase.scss';

interface InteractiveShowcaseProps {
  title: string;
  onClick: (_payload: any) => any;
  images: {
    path: string;
    style?: object;
    alt?: string;
    animations?: {
      to: object;
    }[];
  }[];
}

export default function InteractiveShowcase({title, onClick, images}: InteractiveShowcaseProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    imageRefs.current = imageRefs.current.slice(0, images.length);
  }, []);

  useEffect(() => {
    const duration = .4;
    const ease = 'power2';

    if (isHovered) {
      images.forEach((image, index) => {
        if (!image.animations) return;
  
        image.animations.forEach(animation => {
          gsap.to(imageRefs.current[index], {...animation.to, duration, ease: `${ease}.out`});
        });
      });
    } else {
      images.forEach((image, index) => {
        if (!image.animations || !image.style) return;
  
        gsap.to(imageRefs.current[index], {...image.style, duration, ease: `${ease}.in`});
      });
    }
  }, [isHovered]);

  return (
    <div
      className='interactive-showcase flex flex-col w-full h-full'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}>
      <div className='interactive-showcase-images w-full flex-1 relative'>
        {images.map((image, index) => (
          <img
            className='absolute'
            src={image.path}
            alt={image.alt}
            style={{...image.style, willChange: 'top, right, bottom, left, transform'}}
            ref={(el: HTMLImageElement | null) => {
              imageRefs.current[index] = el;
            }}
            key={index}/>
        ))}
      </div>
      <div className='interactive-showcase-text flex flex-col'>
        <Title text={title} size='medium' margin='none'/>
      </div>
    </div>
  );
}
