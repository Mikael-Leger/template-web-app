import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

import './parallax-cover.scss';

interface ParallaxCoverProps {
  imagePath?: string;
  height?: number;
  objectFit?: 'cover' | 'contain' | 'fill';
  objectPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  overlayColor?: string;
  overlayOpacity?: number;
  scrollStart?: number;
  scrollEnd?: number;
  useMaskImage?: boolean;
  maskImagePath?: string;
  isEditing?: boolean;
}

export default function ParallaxCover({
  imagePath = '/images/placeholder.png',
  height = 300,
  objectFit = 'cover',
  objectPosition = 'center',
  overlayColor = '',
  overlayOpacity = 0,
  scrollStart = -10,
  scrollEnd = 210,
  useMaskImage = false,
  maskImagePath = '',
  isEditing = false
}: ParallaxCoverProps) {
  const parallaxCoverRef = useRef<HTMLDivElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const maskImageRef = useRef<HTMLImageElement | null>(null);
  const [isInPageBuilder, setIsInPageBuilder] = useState(false);

  // Detect if we're inside the page builder (editor or preview)
  useEffect(() => {
    if (parallaxCoverRef.current) {
      const inEditor = !!parallaxCoverRef.current.closest('.editor-canvas');
      const inPreview = !!parallaxCoverRef.current.closest('.editor-preview');
      setIsInPageBuilder(inEditor || inPreview || isEditing);
    }
  }, [isEditing]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Find the scroll container based on context
    let scroller: Element | undefined;
    if (parallaxCoverRef.current) {
      const editorCanvas = parallaxCoverRef.current.closest('.editor-canvas');
      const pageRenderer = parallaxCoverRef.current.closest('.page-renderer');
      scroller = editorCanvas || pageRenderer || undefined;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: parallaxCoverRef.current,
          scroller: scroller || undefined,
          start: `${scrollStart}% bottom`,
          end: `${scrollEnd}% top`,
          scrub: true
        },
      });

      // Background image: reveal from top, then hide to bottom
      tl.to(imageContainerRef.current, { clipPath: 'inset(0% 0% 0% 0%)' })
        .to(imageContainerRef.current, { clipPath: 'inset(0% 0% 100% 0%)' });

      // Mask image: starts visible, hides to bottom as bg reveals (reverse parallax)
      if (useMaskImage && maskImageRef.current) {
        gsap.to(maskImageRef.current, {
          clipPath: 'inset(0% 0% 100% 0%)',
          scrollTrigger: {
            trigger: parallaxCoverRef.current,
            scroller: scroller || undefined,
            start: `${scrollStart}% bottom`,
            end: `${(scrollStart + scrollEnd) / 2}% top`,
            scrub: true
          },
        });
      }
    });

    return () => ctx.revert();
  }, [isInPageBuilder, scrollStart, scrollEnd, useMaskImage]);

  const imageStyle: React.CSSProperties = {
    objectFit,
    objectPosition,
  };

  const hasOverlay = !!overlayColor || overlayOpacity > 0;
  const overlayStyle: React.CSSProperties = {
    backgroundColor: overlayColor || '#000000',
    opacity: overlayOpacity / 100,
  };

  const showMaskImage = useMaskImage && maskImagePath;

  // Page builder mode (editor or preview) - use absolute positioning within container
  if (isInPageBuilder || isEditing) {
    return (
      <div
        className='parallax-cover parallax-cover-editor w-full'
        style={{height}}
        ref={parallaxCoverRef}>
        <div
          className='parallax-cover-container w-full'
          ref={imageContainerRef}>
          <img
            className='w-full'
            style={imageStyle}
            src={imagePath}
            alt="Parallax cover"/>
          {hasOverlay && <div className='parallax-cover-overlay' style={overlayStyle}/>}
        </div>
        {showMaskImage && (
          <img
            className='parallax-cover-mask w-full'
            ref={maskImageRef}
            src={maskImagePath}
            alt="Parallax mask"/>
        )}
      </div>
    );
  }

  // Live site mode - use fixed positioning
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
          style={imageStyle}
          src={imagePath}
          alt="Parallax cover"/>
        {hasOverlay && <div className='parallax-cover-overlay' style={overlayStyle}/>}
      </div>
      {showMaskImage && (
        <img
          className='parallax-cover-mask w-full'
          ref={maskImageRef}
          src={maskImagePath}
          alt="Parallax mask"/>
      )}
    </div>
  );
}
