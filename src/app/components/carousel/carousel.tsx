import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';

import './carousel.scss';

interface CarouselProps {
  imagePaths: string[];
  transition: 'swipe' | 'circle';
  delayMs: number;
}

const IMAGE_HEIGHT = 717;

export default function Carousel({imagePaths, transition, delayMs}: CarouselProps) {
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  const [imageIndexes, setImageIndex] = useState<{
    current: number;
    lastAction: 'left' | 'right' | 'none';
  }>({
    current: 0,
    lastAction: 'none'
  });

  const imageSwitched = useRef<boolean>(false);

  useEffect(() => {
    imageRefs.current = imageRefs.current.slice(0, imagePaths.length);

    if (delayMs === -1) return;

    setInterval(() => {
      if (imageSwitched.current) {
        imageSwitched.current = false;

        return;
      }
      
      setImageIndex(prevstate => {
        const prevIndex = prevstate.current;
        const newIndex = (prevIndex === imagePaths.length -1) ? 0 : prevIndex + 1;
        
        return {
          current: newIndex,
          prev: prevIndex,
          lastAction: 'right'
        };});

    }, delayMs);    
  }, []);

  useEffect(() => {
    const prevImageIndex = (imageIndexes.current === 0) ? imagePaths.length - 1 : imageIndexes.current - 1;
    const nextImageIndex = (imageIndexes.current === imagePaths.length - 1) ? 0 : imageIndexes.current + 1;
  
    const getClipPath = (index: number) => {
      if (transition === 'swipe') {
        if (index === imageIndexes.current) {
          return 'inset(0% 0% 0% 0%)';
        } else if (index === prevImageIndex) {
          return 'inset(0% 100% 0% 0%)';
        } else if (index === nextImageIndex) {
          return 'inset(0% 0% 0% 100%)';
        } else {
          return 'inset(0% 100% 0% 100%)';
        }
      }
      if (transition === 'circle') {
        if (index === imageIndexes.current) {
          return 'circle(100%)';
        } else if (index === prevImageIndex) {
          return imageIndexes.lastAction === 'none' ? 'circle(0%)' : 'circle(100%)';
        } else if (index === nextImageIndex) {
          return 'circle(0%)';
        } else {
          return 'circle(0%)';
        }
      }
    };

    const getMask = (index: number) => {
      if (index === imageIndexes.current) {
        return 'radial-gradient(0px, transparent 0%, rgb(0, 0, 0))';
      } else if (index === prevImageIndex) {
        return 'radial-gradient(2000px, transparent 98%, rgb(0, 0, 0))';
      } else if (index === nextImageIndex) {
        return 'radial-gradient(0px, transparent 98%, rgb(0, 0, 0))';
      }

      return 'radial-gradient(2000px, transparent 98%, rgb(0, 0, 0))';
    };
  
    const animationMethod = imageIndexes.lastAction === 'none' ? gsap.set : gsap.to;
  
    imagePaths.forEach((_, index) => {
      animationMethod(imageRefs.current[index], {
        clipPath: getClipPath(index),
        mask: transition === 'circle' ? getMask(index) : undefined,
        opacity: 1,
        duration: transition === 'swipe' ? .3 : .7,
        ease: 'power2.inOut'
      });
    });
  }, [imageIndexes, imagePaths]);

  const handleLeftClick = () => {
    imageSwitched.current = true;
    const prevIndex = imageIndexes.current;
    const newIndex = (prevIndex === 0) ? imagePaths.length -1 : prevIndex - 1;
    setImageIndex({
      current: newIndex,
      lastAction: 'left'
    });
  };

  const handleRightClick = () => {
    imageSwitched.current = true;
    const prevIndex = imageIndexes.current;
    const newIndex = (prevIndex === imagePaths.length -1) ? 0 : prevIndex + 1;
    setImageIndex({
      current: newIndex,
      lastAction: 'right'
    });
  };

  return (
    <div className='carousel' style={{height: `${IMAGE_HEIGHT}px`}}>
      {imagePaths.map((imagePath, index) => {
        return (
          <img
            className={'carousel-image w-full h-full absolute top-0 left-0'}
            ref={(el: HTMLImageElement | null) => {
              imageRefs.current[index] = el;
            }}
            src={imagePath}
            key={imagePath}/>
        );})}
      <div className='carousel-actions h-full relative'>
        <div
          className='carousel-actions-left absolute top-1/2 transform -translate-y-1/2'
          onClick={handleLeftClick}>
          <BsChevronLeft size={48} color='white'/>
        </div>
        <div
          className='carousel-actions-right absolute top-1/2 transform -translate-y-1/2'
          onClick={handleRightClick}>
          <BsChevronRight size={48} color='white'/>
        </div>
      </div>
    </div>
  );
}
