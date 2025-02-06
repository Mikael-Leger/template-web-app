import React, { useEffect, useState } from 'react';

import Title from '../title/title';
import Layout from '../layout/layout';
import ProductsList from '../products-list/products-list';
import Delivery from '../delivery/delivery';
import Checkout from '../checkout/checkout';
import Payment from '../payment/payment';
import Progression from '../progression/progression';
import { Step } from '@/app/interfaces/step.interface';

import './order-process.scss';

export default function OrderProcess() {
  const [currentProcessus, setCurrentProcessus] = useState<Step>();
  
  const goToNextProcess = () => {
    setCurrentProcessus(prevState => processuses[(prevState?.number ?? 0) + 1]);
  };

  const renderBasket = () => {
    return (
      <Layout
        className={'justify-between flex-gap-outer'}
        orientation='row'
        items={[
          {
            node: <ProductsList/>,
            className: 'flex-1'
          },
          {
            node: <Checkout submit={goToNextProcess}/>
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
            node: <Delivery/>,
            className: 'flex-1'
          },
          {
            node: <Checkout submit={goToNextProcess}/>
          }
        ]}/>
    );
  };

  const renderPayment = () => {
    return (
      <Layout
        className={'justify-between flex-gap-outer'}
        orientation='row'
        items={[
          {
            node: <Payment/>,
            className: 'flex-1'
          },
          {
            node: <Checkout submit={goToNextProcess}/>
          }
        ]}/>
    );
  };
  
  const processuses: Step[] = [
    {
      number: 0,
      title: 'Votre panier',
      node: renderBasket()
    },
    {
      number: 1,
      title: 'Livraison',
      node: renderDelivery()
    },
    {
      number: 2,
      title: 'Paiement',
      node: renderPayment()
    },
    {
      number: 3,
      title: 'Succès',
      node: 'Succès !'
    }
  ];

  useEffect(() => {
    setCurrentProcessus(processuses[0]);
  }, []);

  if (!currentProcessus) return;

  return (
    <div className='order-process'>
      <Progression steps={processuses} currentStep={currentProcessus.number}/>
      <Title text={currentProcessus.title} size='big' orientation='start' underline/>
      {currentProcessus.node}
    </div>
  );
}