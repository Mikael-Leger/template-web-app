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
import { useBasket } from '@/app/contexts/basket-context';

import './order-process.scss';

export default function OrderProcess() {
  const router = useRouter();

  const {clearItems} = useBasket();

  const [currentProcessus, setCurrentProcessus] = useState<Step | null>(null);

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
    return <ProductsList hasErrors={(value: string) => processHasErrors(0, value)}/>;
  };

  const renderDelivery = () => {
    return <Delivery hasErrors={(value: string) => processHasErrors(1, value)}/>;
  };

  const renderPayment = () => {
    return <Payment hasErrors={(value: string) => processHasErrors(2, value)}/>;
  };

  const renderSuccess = () => {
    return (
      <div className='succes-container padding-inner flex flex-row items-center justify-center'>
        <div className='succes-container-text'>La commande a bien été effectuée.</div>
        <Button title={'Revenir à la page d\'accueil'} underline onClick={() => router.push('/')}/>
      </div>
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
      title: 'Commande effectuée',
      node: () => renderSuccess()
    }
  ];

  useEffect(() => {
    setCurrentProcessus(processuses[0]);
  }, []);

  useEffect(() => {
    if (currentProcessus?.number === processuses.length - 1) {
      clearItems();
    }
  }, []);

  const onStepProgressClick = (stepNumber: number) => {
    if (currentProcessus && stepNumber < currentProcessus.number) {
      setCurrentProcessus(processuses[stepNumber]);
    }
  };

  if (!currentProcessus) return;

  return (
    <div className='order-process flex flex-col flex-gap'>
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
      <div className='order-process-current flex flex-col'>
        <Title text={currentProcessus.title} size='big' orientation={currentProcessus.number === processuses.length - 1 ? 'center' : 'start'} underline/>
        {currentProcessus.number !== processuses.length - 1 ? (
          <Layout
            className={'justify-between flex-gap-outer'}
            orientation='row'
            items={[
              {
                node: processuses.find(step => step.number === currentProcessus?.number)?.node(),
                className: 'flex-1'
              },
              {
                node: <Checkout submit={goToNextProcess} error={currentProcessus?.error}/>
              }
            ]}/>
        ) : (
          processuses.find(step => step.number === currentProcessus?.number)?.node()
        )}
      </div>
    </div>
  );
}