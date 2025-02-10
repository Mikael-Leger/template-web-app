import React, { useEffect, useState } from 'react';

import { RadioboxesContainer, RadioboxProps } from '../radiobox/radiobox';
import DynamicIcon from '../dynamic-icon/dynamic-icon';
import { StepErrors } from '@/app/interfaces/step.interface';

import './payment.scss';

interface PaymentMethod {
  value: string,
  onSubmit: () => void
}

interface PaymentProps extends StepErrors {}

export default function Payment({hasErrors}: PaymentProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    if (paymentMethod === null) {
      hasErrors('Type de paiement invalide');
    } else {
      hasErrors('');
    }
  }, [paymentMethod]);

  const methods: PaymentMethod[] = [
    {
      value: 'cb',
      onSubmit: () => {}
    },
    {
      value: 'bc',
      onSubmit: () => {}
    },
    {
      value: 'pp',
      onSubmit: () => {}
    }
  ];

  const choices: RadioboxProps[] = [
    {
      title: 'Carte Bancaire',
      icons: [
        {
          path: '/icons/payment/mastercard.svg',
        },
        {
          path:  '/icons/payment/visa.svg',
          style: {
            height: 16
          }
        }
      ]
    },
    {
      title: 'Bancontact',
      icons: [
        {
          path: '/icons/payment/bancontact.svg',
          style: {
            height: 32
          }
        }
      ]
    },
    {
      title: 'Paypal',
      icons: [
        {
          path: '/icons/payment/paypal.svg',
          style: {
            height: 24
          }
        }
      ]
    }
  ];

  return (
    <div className='payment flex flex-col flex-gap justify-center'>
      <RadioboxesContainer items={choices} onSubmit={(index: number) => setPaymentMethod(methods[index])}/>
      <div className='payment-secure flex flex-row items-center self-center gap-2'>
        <DynamicIcon iconName='BsLock'/>
        <div className='payment-secure-text'>
          {'Paiement 100% sécurisé'}
        </div>
      </div>
    </div>
  );
}
