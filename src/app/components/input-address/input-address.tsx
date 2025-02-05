import React, { useEffect, useRef, useState } from 'react';

import InputText, { InputTextProps } from '../input-text/input-text';
import Button from '../button/button';
import DynamicIcon from '../dynamic-icon/dynamic-icon';
import { FullAddress } from '@/app/interfaces/address.interface';
import Checkbox from '../checkbox/checkbox';
import { autocompleteAddress } from '@/app/services/address';

import './input-address.scss';

interface InputAddressProps {
  onSubmit?: (_fullAddress: FullAddress) => void;
  defaultAddress?: FullAddress;
}

export default function InputAddress({onSubmit, defaultAddress}: InputAddressProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDefaultAddress, setIsDefaultAddress] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');
  const [zipCode, setZipCode] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [isAddressAutocompleteVisible, setAddressIsAutocompleteVisible] = useState<boolean>(false);

  const refAddress = useRef<HTMLDivElement | null>(null);
  const refZipCode = useRef<HTMLDivElement | null>(null);
  const refCity = useRef<HTMLDivElement | null>(null);
  const refFullAddressValid = useRef<boolean>(false);

  useEffect(() => {
    if (!isFullAddressValid()) {
      setIsEditing(true);
    }
  }, []);

  const isFullAddressValid = () => {
    return !(address === '' || zipCode === '' || city === '');
  };
 
  const renderAddress = () => {
    return (
      <div className='input-address-content'>
        <div className='input-address-content-address'>
          {address} - ({zipCode}) {city}
        </div>
        <div className='input-address-content-actions'>
          <Button title={'modifier'} icon={{node: <DynamicIcon iconName='BsPencil'/>}} underline onClick={() => setIsEditing(true)}/>
        </div>
      </div>
    );
  };

  const renderFormField = (formField: InputTextProps) => {
    return (
      <div
        className='input-address-content-field flex flex-col gap-1 relative'
        key={formField.name}
      >
        <InputText
          name={formField.name}
          title={formField.title}
          placeholder={formField.placeholder}
          value={formField.value}
          onChange={(value: string) => {
            if (formField.ref && formField.onClick) {
              autocompleteAddress(formField.value, formField.ref.current, formField.onClick);
            } 
            if (formField.onChange) {
              formField.onChange(value);
            }
          }}
          border
          required={formField.required}
          disabled={formField.disabled}/>
        <div
          className='input-address-content-field-list absolute flex flex-col gap-1'
          style={{
            opacity: formField.hide ? 0 : 1,
            zIndex: formField.hide ? -1 : 0
          }}
          ref={formField.ref}/>
      </div>
    );
  };

  const submitAddress = () => {
    if (!isFullAddressValid()) return;

    setIsEditing(false);

    if (!onSubmit) return;

    const fullAddress: FullAddress = {
      address,
      zipCode,
      city
    };
    onSubmit(fullAddress);
  };

  const renderEdit = () => {
    return (
      <form className='input-address-content flex flex-col flex-gap' action={submitAddress}>
        {!isDefaultAddress && formFields.map(formField => renderFormField(formField))}
        {renderCheckbox()}
        <Button title={'valider'} buttonType={'submit'}/>
      </form>
    );
  };

  const setDefaultAddress = () => {
    if (!defaultAddress) return;
    
    setIsDefaultAddress(prevState => !prevState);
  };

  const renderCheckbox = () => {
    if (!defaultAddress) return;

    return (
      <Checkbox
        title={'Utiliser l\'adresse de livraison'}
        onClick={setDefaultAddress}
        value={isDefaultAddress}/>
    );
  };

  const formFields: InputTextProps[] = [
    {
      name: 'address',
      title: 'Adresse',
      placeholder: 'Ex: Rue du la Pâte Dorée, 12',
      value: address,
      required: true,
      ref: refAddress,
      hide: !isAddressAutocompleteVisible,
      onChange: (value: string) => {
        if (refFullAddressValid.current) {
          refFullAddressValid.current = false;

          return;
        }
        if (value.length >= 3) {
          setAddressIsAutocompleteVisible(true);
        }
        setAddress(value);
      },
      onClick: (fullAddress: FullAddress) => {
        refFullAddressValid.current = true;
        setAddressIsAutocompleteVisible(false);
        setAddress(fullAddress.address);
        setZipCode(fullAddress.zipCode);
        setCity(fullAddress.city);
      }
    },
    {
      name: 'zipcode',
      title: 'Code postal',
      placeholder: 'Ex: 1040',
      value: zipCode,
      required: true,
      ref: refZipCode,
      hide: true,
      onChange: (value: string) => {
        setZipCode(value);
      },
    },
    {
      name: 'city',
      title: 'Ville',
      placeholder: 'Ex: Bruxelles',
      value: city,
      required: true,
      ref: refCity,
      hide: true,
      onChange: (value: string) => {
        setCity(value);
      },
    },
    {
      name: 'country',
      title: 'Pays',
      value: 'Belgium',
      hide: true,
      disabled: true
    }
  ];

  return (
    <div className={'input-address'}>
      {isEditing ? renderEdit() : renderAddress()}
    </div>
  );
}
