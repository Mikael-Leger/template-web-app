import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import Title from '../title/title';
import Layout from '../layout/layout';
import ProductsList from '../products-list/products-list';
import Delivery from '../delivery/delivery';
import Checkout from '../checkout/checkout';
import Payment from '../payment/payment';
import Progression from '../progression/progression';
import { Step } from '@/app/interfaces/step.interface';
import DynamicIcon from '../dynamic-icon/dynamic-icon';
import Button from '../button/button';

import './order-process.scss';

export default function OrderProcess() {
  const router = useRouter();

  const [currentProcessus, setCurrentProcessus] = useState<Step>();

  const goToPrevProcess = () => {
    setCurrentProcessus(prevState => processuses[(prevState?.number ?? 1) - 1]);
  };
  
  const goToNextProcess = () => {
    setCurrentProcessus(prevState => {
      if (!prevState || prevState.error) return prevState;
  
      return processuses[(prevState?.number ?? 0) + 1];
    });
  };

  const processHasErrors = (stepNumber: number, error: string) => {
    setCurrentProcessus(prevState => {
      if (!prevState || prevState.number !== stepNumber) return prevState;

      const updatedState = {...prevState};
      updatedState.error = error;

      return updatedState;
    });
  };

  const renderBasket = () => {
    return (
      <Layout
        className={'justify-between flex-gap-outer'}
        orientation='row'
        items={[
          {
            node: <ProductsList hasErrors={(value: string) => processHasErrors(0, value)}/>,
            className: 'flex-1'
          },
          {
            node: <Checkout submit={goToNextProcess} error={currentProcessus?.error}/>
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
            node: <Delivery hasErrors={(value: string) => processHasErrors(1, value)}/>,
            className: 'flex-1'
          },
          {
            node: <Checkout submit={goToNextProcess} error={currentProcessus?.error}/>
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
            node: <Checkout submit={goToNextProcess} error={currentProcessus?.error}/>
          }
        ]}/>
    );
  };
  
  const processuses: Step[] = [
    {
      number: 0,
      title: 'Votre panier',
      node: () => renderBasket()
    },
    {
      number: 1,
      title: 'Livraison',
      node: () => renderDelivery()
    },
    {
      number: 2,
      title: 'Paiement',
      node: () => renderPayment()
    },
    {
      number: 3,
      title: 'Succès',
      node: () => 'Succès !'
    }
  ];

  useEffect(() => {
    setCurrentProcessus(processuses[2]);
  }, []);

  const onStepProgressClick = (stepNumber: number) => {
    if (currentProcessus && stepNumber < currentProcessus.number) {
      setCurrentProcessus(processuses[stepNumber]);
    }
  };

  if (!currentProcessus) return;

  return (
    <div className='order-process'>
      <div className='order-process-progression flex flex-row'>
        <div className='order-process-progression-back'>
          {currentProcessus.number > 0 && currentProcessus.number < processuses.length - 1 && (
            <Button
              title={'Revenir en arrière'}
              onClick={goToPrevProcess}
              underline
              icon={{node: <DynamicIcon iconName='BsArrowLeft'/>, orientation: 'start'}}/>
          )}
          {currentProcessus.number === 0 && (
            <Button
              title={'Continuez vos achats'}
              onClick={() => router.push('/products')}
              underline
              icon={{node: <DynamicIcon iconName='BsArrowLeft'/>, orientation: 'start'}}/>
          )}
        </div>
        <Progression
          steps={processuses}
          currentStep={currentProcessus.number}
          onClick={onStepProgressClick}/>
        <div className='order-process-progression-secure flex flex-row gap-2 justify-center items-center'>
          <DynamicIcon iconName='BsLock'/>
          <div className='order-process-progression-secure-text'>
            {'Paiement 100% sécurisé'}
          </div>
        </div>
      </div>
      <Title text={currentProcessus.title} size='big' orientation='start' underline/>
      {processuses.find(step => step.number === currentProcessus?.number)?.node()}
    </div>
  );
}