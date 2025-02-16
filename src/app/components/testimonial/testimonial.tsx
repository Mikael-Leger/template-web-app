import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { BsQuote } from 'react-icons/bs';

import { formatDate, parseDate } from '@/app/services/date';
import { TestimonialFormatted, TestimonialJson, TestimonialProps } from '@/app/interfaces/testimonial.interface';
import testimonialsJson from '@/app/data/testimonials.json';
import { useIsMobile } from '@/app/contexts/mobile-context';

import './testimonial.scss';

export default function Testimonial({text, imagePath, author, role, company, date, index}: TestimonialProps) {
  const {breakpoint, isMobile} = useIsMobile();

  const getWidth = () => {
    switch (breakpoint) {
    case 'xs':
      return '90vw';
    case 'sm':
      return '80vw';
    case 'md':
      return '70vw';
    case 'lg':
      return '60vw';
    case 'xl':
      return '40vw';
    }
  };

  return (
    <div
      className='testimonial absolute'
      id={`testimonial-${index}`}
      style={{
        width: getWidth()
      }}>
      <div className='testimonial-profile absolute top-0'>
        <img src={`/images/testimonials/${imagePath}`}/>
      </div>
      <div className='testimonial-content flex flex-col justify-between'>
        <div
          className='testimonial-content-text'
          style={{
            fontSize: isMobile ? '12px' : undefined,
            lineHeight: isMobile ? '24px' : undefined
          }}>
          <div className='testimonial-content-text-quote'>
            <BsQuote size={32} className={isMobile ? 'top-[5px]' : ''}/>
          </div>
          {text}
          <div className='testimonial-content-text-quote'>
            <BsQuote size={32} className={isMobile ? 'top-[-5px]' : ''}/>
          </div>
        </div>
        <div className='testimonial-content-author flex flex-row items-baseline justify-center'>
          <div className='testimonial-content-author-name'>
            {author ? author : 'Anonymous'}
          </div>
          <div className='testimonial-content-author-position flex flex-row'>
            <div className='testimonial-content-author-position-role'>
              {role ? role : 'Customer'}
            </div>
            {company && (
              <>
                <span className='mx-1'>at</span>
                <div className='testimonial-content-author-position-company'>
                  {company}
                </div>
              </>
            )}
          </div>
        </div>
        {date && (
          <div className='testimonial-content-date text-end'>
            {formatDate(date)}
          </div>
        )}
      </div>
    </div>
  );
}

interface TestimonialsProps {
  delayMs?: number;
}

export function Testimonials({delayMs}: TestimonialsProps) {
  const {breakpoint} = useIsMobile();

  const isAnimating = useRef<boolean>(false);

  const [itemIndex, setItemIndex] = useState<{
    current: number,
    direction: 'left' | 'right'
  }>({
    current: 0,
    direction: 'left'
  });

  const itemIndexRef = useRef<{
    current: number,
    direction: 'left' | 'right'
  }>(itemIndex);
  const itemSwitched = useRef<boolean>(false);
  
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const [testimonials, setTestimonials] = useState<TestimonialFormatted[]>([]);

  useEffect(() => {
    const testimonialsFormatted = (testimonialsJson as TestimonialJson[]).map(testimonialJson => {
      const testimonialFormatted: TestimonialFormatted = { 
        text: testimonialJson.text,
        imagePath: testimonialJson.imagePath,
        author: testimonialJson.author,
        role: testimonialJson.role,
        company: testimonialJson.company,
        date: testimonialJson.date ? parseDate(testimonialJson.date) : undefined
      };
      
      return testimonialFormatted;
    });
    setTestimonials(testimonialsFormatted);
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;

    itemRefs.current = itemRefs.current.slice(0, testimonials.length);

    initializeItemsPosition();

    if (delayMs) {
      const interval = setInterval(() => {
        if (itemSwitched.current) {
          itemSwitched.current = false;

          return;
        }
        handleNewIndex();
      }, delayMs);

      return () => clearInterval(interval);
    }
  }, [testimonials]);

  useEffect(() => {
    itemIndexRef.current = itemIndex;
    animate();
  }, [itemIndex]);

  const getOffset = () => {
    switch (breakpoint) {
    case 'xs':
      return 300;
    case 'sm':
      return 500;
    case 'md':
      return 700;
    case 'lg':
      return 800;
    case 'xl':
      return 1100;
    default:
      return 300;
    }
  };

  const initializeItemsPosition = () => {
    testimonials.forEach((item, index) => {
      const element = `#testimonial-${index}`;

      const baseOffset = getOffset();
      const offsetValue = (index * baseOffset);

      const baseRotate = 50;
      const rotateValue = (index * baseRotate);

      const neighbour = itemIndexRef.current.current === index - 1
      || itemIndexRef.current.current === index
      || itemIndexRef.current.current === index + 1;

      gsap.set(element, {
        x: `+=${offsetValue}`,
        rotateY: parseFloat(gsap.getProperty(element, 'rotateY') as string) + rotateValue,
        scale: itemIndexRef.current.current === index ? 1 : .85,
        opacity: neighbour ? 1 : 0
      });
    });
  };

  const onItemClick = () => {
    if (isAnimating.current) return;
    handleNewIndex();
  };

  const handleNewIndex = () => {
    let newIndex = (itemIndexRef.current.direction === 'left') ? itemIndexRef.current.current + 1 : itemIndexRef.current.current - 1;
    
    let newDirection = itemIndexRef.current.direction;
    if (newIndex < 0) {
      newDirection = 'left';
      newIndex+=2;
    }
    if (newIndex >= testimonials.length) {
      newDirection = 'right';
      newIndex-=2;
    }

    setItemIndex({
      current: newIndex,
      direction: newDirection 
    });
  };

  const animate = () => {
    itemSwitched.current = true;
    const elements = Array.from(document.getElementsByClassName('testimonial'));

    const offsetValue = getOffset();
    const rotateValue = 50;

    const duration = .8;

    elements.forEach((element, index) => {
      const neighbour = itemIndexRef.current.current === index - 1
      || itemIndexRef.current.current === index
      || itemIndexRef.current.current === index + 1;

      isAnimating.current = true;

      gsap.to(element, {
        x: `${itemIndexRef.current.direction === 'right' ? '+' : '-'}=${offsetValue}`,
        rotateY: parseFloat(gsap.getProperty(element, 'rotateY') as string) - (itemIndexRef.current.direction === 'right' ? -rotateValue : rotateValue),
        scale: itemIndexRef.current.current === index ? 1 : .85,
        opacity: neighbour ? 1 : 0,
        ease: 'power3.inOut',
        duration
      });

      setTimeout(() => {
        isAnimating.current = false;
      }, duration * 1000);
    });
  };

  return (
    <div className='testimonials relative' onClick={onItemClick}>
      {testimonials.map((item: TestimonialFormatted, index) => (
        <Testimonial {...item} index={index} key={index}/>
      ))}
    </div>
  );
}