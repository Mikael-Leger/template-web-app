import React from 'react';

import DynamicIcon from '../dynamic-icon/dynamic-icon';
import { formatDate, getNextBusinessDay } from '@/app/services/date';

import './checkout-main-details.scss';

export default function CheckoutMainDetails() {
  return (
    <div className='checkout-main-details'>
      <div className='checkout-main-details-title flex flex-row items-center'>
        <div className='checkout-icon mr-2'>
          <DynamicIcon iconName='BsTruck' color='primary' size={24}/>
        </div>
        <div className='checkout-title'>
          {'La Pâte dorée - Livraison'}
        </div>
      </div>
      <div className='checkout-main-details-address'>
        {'0113 Lorem, Ipsum'}
      </div>
      <div className='checkout-main-details-date'>
        {formatDate(getNextBusinessDay())}
      </div>
    </div>
  );
}