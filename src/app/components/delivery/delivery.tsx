import React, { useState } from 'react';

import Title from '../title/title';
import InputPhone from '../input-phone/input-phone';
import InputAddress from '../input-address/input-address';
import { FullAddress } from '@/app/interfaces/address.interface';

import './delivery.scss';

export default function Delivery() {
  const [address, setAddress] = useState<FullAddress>({
    address: '',
    zipCode: '',
    city: ''
  });
  const [addressPayment, setAddressPayment] = useState<FullAddress>({
    address: '',
    zipCode: '',
    city: ''
  });

  return (
    <div className='delivery'>
      <div className='delivery-title'>
        <Title text='Informations' orientation='start' size='medium'/>
      </div>
      <div className='delivery-container'>
        <div className='delivery-container-content'>
          <Title text='Adresse de livraison' orientation='start'/>
          <div className='delivery-container-content-text'>
            <InputAddress onSubmit={(fullAddress: FullAddress) => setAddress(fullAddress)} calculateDeliveryCost/>
          </div>
        </div>
        <div className='delivery-container-content'>
          <Title text='Adresse de facturation' orientation='start'/>
          <div className='delivery-container-content-text'>
            <InputAddress onSubmit={(fullAddress: FullAddress) => setAddressPayment(fullAddress)} defaultAddress={address}/>
          </div>
        </div>
        <div className='delivery-container-content'>
          <Title text='Numéro de téléphone' orientation='start'/>
          <div className='delivery-container-content-text'>
            <InputPhone/>
          </div>
        </div>
      </div>
    </div>
  );
}
