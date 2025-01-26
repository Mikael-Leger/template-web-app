import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';

import { useIsMobile } from '@/app/contexts/mobile-context';

import './carousel.scss';

interface CarouselProps {
  images: {
    path: string;
    caption?: string;
  }[];
  transition: 'swipe' | 'circle';
  delayMs: number;
}

const IMAGE_HEIGHT = 717;

export default function Carousel({images, transition, delayMs}: CarouselProps) {
  const {isMobile} = useIsMobile();

  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  const [imageIndexes, setImageIndex] = useState<{
    current: number;
    lastAction: 'left' | 'right' | 'none';
  }>({
    current: 0,
    lastAction: 'none'
  });

  const imageSwitched = useRef<boolean>(false);
  const actionsDisabledCpt = useRef<number>(0);

  useEffect(() => {
    imageRefs.current = imageRefs.current.slice(0, images.length);

    if (delayMs === -1) return;

    setInterval(() => {
      if (imageSwitched.current) {
        imageSwitched.current = false;

        return;
      }
      
      setImageIndex(prevstate => {
        const prevIndex = prevstate.current;
        const newIndex = (prevIndex === images.length -1) ? 0 : prevIndex + 1;
        
        return {
          current: newIndex,
          prev: prevIndex,
          lastAction: 'right'
        };});

    }, delayMs);    
  }, []);

  useEffect(() => {
    const prevImageIndex = (imageIndexes.current === 0) ? images.length - 1 : imageIndexes.current - 1;
    const nextImageIndex = (imageIndexes.current === images.length - 1) ? 0 : imageIndexes.current + 1;
  
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
  
    const duration = transition === 'swipe' ? .3 : .7;

    images.forEach((image, index) => {
      animationMethod(imageRefs.current[index], {
        clipPath: getClipPath(index),
        webkitMask: transition === 'circle' ? getMask(index) : undefined,
        mask: transition === 'circle' ? getMask(index) : undefined,
        opacity: 1,
        duration: duration,
        ease: 'power2.inOut'
      });
    });
  }, [imageIndexes, images]);

  const handleLeftClick = () => {
    imageSwitched.current = true;
    const prevIndex = imageIndexes.current;
    const newIndex = (prevIndex === 0) ? images.length -1 : prevIndex - 1;
    setImageIndex({
      current: newIndex,
      lastAction: 'left'
    });
    disableActions();
  };

  const handleRightClick = () => {
    imageSwitched.current = true;
    const prevIndex = imageIndexes.current;
    const newIndex = (prevIndex === images.length -1) ? 0 : prevIndex + 1;
    setImageIndex({
      current: newIndex,
      lastAction: 'right'
    });
    disableActions();
  };

  const disableActions = () => {
    actionsDisabledCpt.current++;

    const duration = transition === 'swipe' ? .3 : .7;

    gsap.set(['.carousel-actions-left', '.carousel-actions-right'], {
      pointerEvents: 'none'
    });

    setTimeout(() => {
      actionsDisabledCpt.current--;

      if (actionsDisabledCpt.current > 0) return;

      gsap.set(['.carousel-actions-left', '.carousel-actions-right'], {
        pointerEvents: 'auto'
      });
    }, duration * 1000);
  };

  return (
    <div className='carousel w-full' style={{height: `${IMAGE_HEIGHT}px`}}>
      {images.map((image, index) => {
        return (
          <img
            className={'carousel-image w-full h-full absolute top-0 left-0'}
            ref={(el: HTMLImageElement | null) => {
              imageRefs.current[index] = el;
            }}
            src={image.path}
            key={index}/>
        );})}
      {!isMobile && (
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
      )}
    </div>
  );
}
