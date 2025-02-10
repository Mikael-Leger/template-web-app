import React from 'react';

import { RadioboxesContainer, RadioboxProps } from '../radiobox/radiobox';
import DynamicIcon from '../dynamic-icon/dynamic-icon';

import './payment.scss';

export default function Payment() {
  const methods: RadioboxProps[] = [
    {
      title: 'Carte Bancaire',
      icons: [
        {
          path: '/icons/payment/mastercard.svg',
        },
        {
          path:  '/icons/payment/visa.svg',
        }
      ]
    },
    {
      title: 'Bancontact',
      icons: [
        {
          path: '/icons/payment/bancontact.svg',
        }
      ]
    },
    {
      title: 'Paypal',
      icons: [
        {
          path: '/icons/payment/paypal.svg',
          style: {
            width: 64
          }
        }
      ]
    }
  ];

  return (
    <div className='payment flex flex-col flex-gap justify-center'>
      <RadioboxesContainer items={methods}/>
      <div className='payment-secure flex flex-row items-center self-center gap-2'>
        <DynamicIcon iconName='BsLock'/>
        <div className='payment-secure-text'>
          {'Paiement 100% sécurisé'}
        </div>
      </div>
    </div>
  );
}
