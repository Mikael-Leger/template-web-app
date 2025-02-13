'use client';

import React, { useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';

import DynamicIcon from '../dynamic-icon/dynamic-icon';
import { useBasket } from '@/app/contexts/basket-context';
import { useSidebar } from '@/app/contexts/sidebar-context';

import './basket.scss';

export default function Basket() {
  const {getNumberOfItemsInBasket} = useBasket();
  const {isSidebarVisible} = useSidebar();

  const router = useRouter();
  const pathname = usePathname();

  const basketRef = useRef(null);

  const numberOfItems = getNumberOfItemsInBasket();

  if (numberOfItems <= 0 || pathname === '/order' || pathname === '/contact') return;

  const handleClick = () => {
    const url = '/order';
    router.push(url);
  };

  if (basketRef.current) {
    if (isSidebarVisible) {
      gsap.to(basketRef.current, {
        opacity: 0
      });
    } else {
      gsap.to(basketRef.current, {
        opacity: 1
      });
    }
  }

  return (
    <div className='basket fixed' ref={basketRef}>
      <div className='basket-content flex flex-row flex-gap items-center justify-center' onClick={handleClick}>
        <div className='basket-content-icon text-center flex flex-col items-center justify-center'>
          {numberOfItems}
          <DynamicIcon iconName='BsBasket' size={24}/>
        </div>
        <div className='basket-content-title'>
          Commander maintenant !
        </div>
      </div>
    </div>
  );
}
