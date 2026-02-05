import React, { useEffect, useState } from 'react';

import Title from '../title/title';
import InputPhone from '../input-phone/input-phone';
import InputAddress from '../input-address/input-address';
import { FullAddress } from '@/app/interfaces/address.interface';
import { StepErrors } from '@/app/interfaces/step.interface';

import './delivery.scss';

interface DeliveryProps extends StepErrors {
  editorMode?: boolean;
}

export default function Delivery({hasErrors, editorMode = false}: DeliveryProps) {
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
  const [isPhoneValid, setIsPhoneValid] = useState<boolean>(false);

  const isFullAddressValid = (fullAddress: FullAddress) => {
    return (fullAddress.address !== '' && fullAddress.zipCode !== '' && fullAddress.city !== '');
  };

  useEffect(() => {
    if (editorMode) {
      // Use test phone number in editor mode
      setPhoneNumber('486 12 34 56');
    } else {
      const phoneLocal = localStorage.getItem('phone');
      setPhoneNumber(phoneLocal ?? '');
    }
  }, [editorMode]);

  useEffect(() => {
    if (!editorMode) {
      localStorage.setItem('phone', phoneNumber);
    }
  }, [phoneNumber, editorMode]);

  useEffect(() => {
    if (!isFullAddressValid(address)) {
      hasErrors('L\'adresse de livraison n\'est pas valide');

    } else if (!isFullAddressValid(addressPayment)) {
      hasErrors('L\'adresse de facturation n\'est pas valide');

    } else if (!isPhoneValid) {
      hasErrors('Le numéro de téléphone n\'est pas valide');

    } else {
      hasErrors('');

    }
  }, [address, addressPayment, isPhoneValid]);

  return (
    <div className='delivery'>
      <div className='delivery-title'>
        <Title text='Informations' orientation='start' size='medium'/>
      </div>
      <div className='delivery-container'>
        <div className='delivery-container-content'>
          <Title text='Adresse de livraison' orientation='start'/>
          <div className='delivery-container-content-text'>
            <InputAddress onSubmit={(fullAddress: FullAddress) => setAddress(fullAddress)} calculateDeliveryCost editorMode={editorMode}/>
          </div>
        </div>
        <div className='delivery-container-content'>
          <Title text='Adresse de facturation' orientation='start'/>
          <div className='delivery-container-content-text'>
            <InputAddress onSubmit={(fullAddress: FullAddress) => setAddressPayment(fullAddress)} defaultAddress={address} editorMode={editorMode}/>
          </div>
        </div>
        <div className='delivery-container-content'>
          <Title text='Numéro de téléphone' orientation='start'/>
          <div className='delivery-container-content-text'>
            <InputPhone leftGap defaultValue={phoneNumber} onChange={setPhoneNumber} onValidationChange={setIsPhoneValid}/>
          </div>
        </div>
      </div>
    </div>
  );
}
