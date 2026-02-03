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
  autoRotate?: boolean;
  delayMs?: number;
}

const IMAGE_HEIGHT = 717;

export default function Carousel({images, transition, autoRotate = false, delayMs}: CarouselProps) {
  const {isMobile} = useIsMobile();

  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const actionsDisabledCpt = useRef<number>(0);

  const [imageIndexes, setImageIndex] = useState<{
    current: number;
    lastAction: 'left' | 'right' | 'none';
  }>({
    current: 0,
    lastAction: 'none'
  });

  const startAutoRotate = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!autoRotate || !delayMs) return;

    intervalRef.current = setInterval(() => {
      setImageIndex(prevstate => {
        const prevIndex = prevstate.current;
        const newIndex = (prevIndex === images.length - 1) ? 0 : prevIndex + 1;

        return {
          current: newIndex,
          lastAction: 'right'
        };
      });
    }, delayMs);
  };

  useEffect(() => {
    imageRefs.current = imageRefs.current.slice(0, images.length);
    startAutoRotate();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRotate, delayMs, images.length]);

  useEffect(() => {
    const prevImageIndex = (imageIndexes.current === 0) ? images.length - 1 : imageIndexes.current - 1;
    const nextImageIndex = (imageIndexes.current === images.length - 1) ? 0 : imageIndexes.current + 1;
    const isInitial = imageIndexes.lastAction === 'none';
    const duration = transition === 'swipe' ? 0.3 : 0.7;

    images.forEach((image, index) => {
      const element = imageRefs.current[index];
      if (!element) return;

      if (transition === 'swipe') {
        let clipPath: string;
        if (index === imageIndexes.current) {
          clipPath = 'inset(0% 0% 0% 0%)';
        } else if (index === prevImageIndex) {
          clipPath = 'inset(0% 100% 0% 0%)';
        } else if (index === nextImageIndex) {
          clipPath = 'inset(0% 0% 0% 100%)';
        } else {
          clipPath = 'inset(0% 100% 0% 100%)';
        }

        if (isInitial) {
          gsap.set(element, { clipPath, zIndex: 'auto', webkitMask: 'none', mask: 'none', opacity: 1 });
        } else {
          gsap.to(element, { clipPath, zIndex: 'auto', webkitMask: 'none', mask: 'none', opacity: 1, duration, ease: 'power2.inOut' });
        }
      }

      if (transition === 'circle') {
        // Set z-index: current on top, prev underneath, others below
        let zIndex = 0;
        if (index === imageIndexes.current) {
          zIndex = 2;
        } else if (index === prevImageIndex) {
          zIndex = 1;
        }

        if (isInitial) {
          // On initial load, current is fully visible, others hidden
          const clipPath = index === imageIndexes.current ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)';
          gsap.set(element, { clipPath, zIndex, opacity: 1 });
        } else if (index === imageIndexes.current) {
          // New current image: animate circle expanding from center
          gsap.set(element, { zIndex, clipPath: 'circle(0% at 50% 50%)', opacity: 1 });
          gsap.to(element, { clipPath: 'circle(150% at 50% 50%)', duration, ease: 'power2.inOut' });
        } else if (index === prevImageIndex) {
          // Previous image stays fully visible underneath
          gsap.set(element, { zIndex, clipPath: 'circle(150% at 50% 50%)', opacity: 1 });
        } else {
          // Other images hidden
          gsap.set(element, { zIndex, clipPath: 'circle(0% at 50% 50%)', opacity: 1 });
        }
      }
    });
  }, [imageIndexes, images, transition]);

  const handleLeftClick = () => {
    if (actionsDisabledCpt.current > 0) return;

    actionsDisabledCpt.current++;
    const prevIndex = imageIndexes.current;
    const newIndex = (prevIndex === 0) ? images.length - 1 : prevIndex - 1;
    setImageIndex({
      current: newIndex,
      lastAction: 'left'
    });
    disableActions();
    startAutoRotate();
  };

  const handleRightClick = () => {
    if (actionsDisabledCpt.current > 0) return;

    actionsDisabledCpt.current++;
    const prevIndex = imageIndexes.current;
    const newIndex = (prevIndex === images.length - 1) ? 0 : prevIndex + 1;
    setImageIndex({
      current: newIndex,
      lastAction: 'right'
    });
    disableActions();
    startAutoRotate();
  };

  const disableActions = () => {
    const duration = transition === 'swipe' ? .3 : .7;

    setTimeout(() => {
      actionsDisabledCpt.current--;
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
