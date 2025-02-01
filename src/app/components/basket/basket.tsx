'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';

import DynamicIcon from '../dynamic-icon/dynamic-icon';
import { useBasket } from '@/app/contexts/basket-context';

import './basket.scss';

export default function Basket() {
  const {getNumberOfItemsInBasket} = useBasket();

  const router = useRouter();
  const pathname = usePathname();

  const numberOfItems = getNumberOfItemsInBasket();

  if (numberOfItems <= 0 || pathname === '/order') return;

  const handleClick = () => {
    const url = '/order';
    router.push(url);
  };

  return (
    <div className='basket fixed'>
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
