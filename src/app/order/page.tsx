'use client';

import React from 'react';
import { useBasket } from '../contexts/basket-context';
import { useRouter } from 'next/navigation';

import Card from '../components/card/card';
import PageBackground from '../components/page-background/page-background';
import Layout from '../components/layout/layout';
import ProductsList from '../components/products-list/products-list';
import Checkout from '../components/checkout/checkout';
import Title from '../components/title/title';

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
        <Title text='Votre Panier' size='big' orientation='start' underline/>
        <Layout
          className={'justify-between flex-gap-outer'}
          orientation='row'
          items={[
            {
              node:
              <ProductsList/>,
              className: 'flex-1'
            },
            {
              node:
              <Checkout/>
            }
          ]}/>
      </Card>
    </div>
  );
}
