'use client';

import React from 'react';

import Card from '../components/card/card';
import PageBackground from '../components/page-background/page-background';
import OrderProcess from '../components/order-process/order-process';

export default function OrderPage() {
  return (
    <div className='order flex flex-col'>
      <PageBackground imagePath='images/order/sample_1.png'/>
      <Card size='big'>
        <OrderProcess/>
      </Card>
    </div>
  );
}
