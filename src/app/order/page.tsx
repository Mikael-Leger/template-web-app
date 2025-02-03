'use client';

import React from 'react';
import { useBasket } from '../contexts/basket-context';
import { useRouter } from 'next/navigation';

import Card from '../components/card/card';
import PageBackground from '../components/page-background/page-background';
import OrderProcess from '../components/order-process/order-process';

export default function OrderPage() {
  const router = useRouter();

  const {clearItems} = useBasket();

  const routeToProducts = () => {
    router.push('/products');
  };

  const showPayment = () => {
    // router.push('/routeToPayment');
  };

  const clearAllProducts = () => {
    clearItems();
  };

  return (
    <div className='order flex flex-col'>
      <PageBackground imagePath='images/order/sample_1.png'/>
      <Card size='big'>
        <OrderProcess/>
      </Card>
    </div>
  );
}
