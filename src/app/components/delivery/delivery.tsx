import React, { useEffect, useState } from 'react';

import Title from '../title/title';
import InputPhone from '../input-phone/input-phone';
import InputAddress from '../input-address/input-address';
import { FullAddress } from '@/app/interfaces/address.interface';
import { StepErrors } from '@/app/interfaces/step.interface';

import './delivery.scss';

type DeliveryProps = StepErrors;

export default function Delivery({hasErrors}: DeliveryProps) {
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
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  const isFullAddressValid = (fullAddress: FullAddress) => {
    return (fullAddress.address !== '' && fullAddress.zipCode !== '' && fullAddress.city !== '');
  };

  useEffect(() => {
    const phoneLocal = localStorage.getItem('phone');
    setPhoneNumber(phoneLocal ?? '');
  }, []);

  useEffect(() => {
    localStorage.setItem('phone', phoneNumber);
  }, [phoneNumber]);

  useEffect(() => {
    if (!isFullAddressValid(address)) {
      hasErrors('L\'adresse de livraison n\'est pas valide');

    } else if (!isFullAddressValid(addressPayment)) {
      hasErrors('L\'adresse de facturation n\'est pas valide');

    } else if (phoneNumber === '') {
      hasErrors('Le numéro de téléphone n\'est pas valide');

    } else {
      hasErrors('');

    }
  }, [address, addressPayment, phoneNumber]);

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
            <InputPhone leftGap defaultValue={phoneNumber} onChange={setPhoneNumber}/>
          </div>
        </div>
      </div>
    </div>
  );
}
