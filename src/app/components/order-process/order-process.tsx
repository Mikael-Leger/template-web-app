import React, { useState } from 'react';

import Title from '../title/title';
import Layout from '../layout/layout';
import ProductsList from '../products-list/products-list';
import Delivery from '../delivery/delivery';
import Checkout from '../checkout/checkout';

import './order-process.scss';

export default function OrderProcess() {
  const goToNextProcess = () => {
    setCurrentProcessus(prevState => processuses[prevState.step + 1]);
  };

  const renderBasket = () => {
    return (
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
            <Checkout submit={goToNextProcess}/>
          }
        ]}/>
    );
  };

  const renderDelivery = () => {
    return (
      <Layout
        className={'justify-between flex-gap-outer'}
        orientation='row'
        items={[
          {
            node:
            <Delivery/>,
            className: 'flex-1'
          },
          {
            node:
            <Checkout submit={goToNextProcess}/>
          }
        ]}/>
    );
  };
  
  const processuses = [
    {
      step: 0,
      title: 'Votre panier',
      node: renderBasket()
    },
    {
      step: 1,
      title: 'Livraison',
      node: renderDelivery()
    }
  ];

  const [currentProcessus, setCurrentProcessus] = useState(processuses[0]);

  return (
    <div className='order-process'>
      <Title text={currentProcessus.title} size='big' orientation='start' underline/>
      {currentProcessus.node}
    </div>
  );
}