import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import InputText, { InputTextProps } from '../input-text/input-text';
import Button from '../button/button';
import DynamicIcon from '../dynamic-icon/dynamic-icon';
import { FullAddress } from '@/app/interfaces/address.interface';
import Checkbox from '../checkbox/checkbox';
import { autocompleteAddress, getDistanceBetweenAddresses } from '@/app/services/address';
import { useBasket } from '@/app/contexts/basket-context';
import Loading from '../loading/loading';

import './input-address.scss';

interface InputAddressProps {
  defaultAddress?: FullAddress;
  calculateDeliveryCost?: boolean;
  onSubmit: (_fullAddress: FullAddress) => void;
}

export default function InputAddress({defaultAddress, calculateDeliveryCost, onSubmit}: InputAddressProps) {
  const {updateDistance} = useBasket();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDefaultAddress, setIsDefaultAddress] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');
  const [zipCode, setZipCode] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [isAddressAutocompleteVisible, setAddressIsAutocompleteVisible] = useState<boolean>(false);

  const refAddress = useRef<HTMLDivElement | null>(null);
  const refFullAddressValid = useRef<boolean>(false);

  useEffect(() => {
    if (!isFullAddressValid()) {
      setIsEditing(true);
    }
  }, []);
  
  useEffect(() => {
    if (defaultAddress) {
      const addressLocal = localStorage.getItem('payment-address');
      const zipCodeLocal = localStorage.getItem('payment-zipCode');
      const cityLocal = localStorage.getItem('payment-city');
      const defaultAddressLocal = localStorage.getItem('payment-default');

      setAddress(addressLocal ?? '');
      setZipCode(zipCodeLocal ?? '');
      setCity(cityLocal ?? '');

      if (addressLocal && zipCodeLocal && cityLocal) {
        setIsEditing(false);

        const fullAddress: FullAddress = {
          address: addressLocal,
          zipCode: zipCodeLocal,
          city: cityLocal
        };
        submitAddress(fullAddress);

      }
      setIsDefaultAddress(defaultAddressLocal !== null);

    } else {
      const addressLocal = localStorage.getItem('delivery-address');
      const zipCodeLocal = localStorage.getItem('delivery-zipCode');
      const cityLocal = localStorage.getItem('delivery-city');

      setAddress(addressLocal ?? '');
      setZipCode(zipCodeLocal ?? '');
      setCity(cityLocal ?? '');

      if (addressLocal && zipCodeLocal && cityLocal) {
        setIsEditing(false);

        const fullAddress: FullAddress = {
          address: addressLocal,
          zipCode: zipCodeLocal,
          city: cityLocal
        };
        submitAddress(fullAddress);

      }
    }
  }, []);
  
  useEffect(() => {
    if (defaultAddress) {
      localStorage.setItem('payment-address', address);

    } else {
      localStorage.setItem('delivery-address', address);

    }
  }, [address]);
  
  useEffect(() => {
    if (defaultAddress) {
      localStorage.setItem('payment-zipCode', zipCode);

    } else {
      localStorage.setItem('delivery-zipCode', zipCode);

    }
  }, [zipCode]);
  
  useEffect(() => {
    if (defaultAddress) {
      localStorage.setItem('payment-city', city);

    } else {
      localStorage.setItem('delivery-city', city);

    }
  }, [city]);

  useEffect(() => {
    if (defaultAddress) {
      if (isDefaultAddress) {
        onSubmit(defaultAddress);
        localStorage.setItem('payment-default', 'true');

      } else {
        onSubmit({
          address: '',
          zipCode: '',
          city: ''
        });
        localStorage.removeItem('payment-default');
        
      }
    }
  }, [isDefaultAddress]);

  const isFullAddressValid = (fullAddressLocal?: FullAddress) => {
    if (fullAddressLocal) {
      return !(fullAddressLocal.address === '' || fullAddressLocal.zipCode === '' || fullAddressLocal.city === '');
    }

    return !(address === '' || zipCode === '' || city === '');
  };
 
  const renderAddress = () => {
    return (
      <div className='input-address-content flex flex-row items-center justify-between'>
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
            if (formField.name === 'address' && formField.onClick) {
              autocompleteAddress(formField.value, refAddress.current, formField.onClick);
            } 
            if (formField.onChange) {
              formField.onChange(value);
            }
          }}
          onBlur={() => setTimeout(() => formField.name === 'address' && setAddressIsAutocompleteVisible(false), 150)}
          border
          required={formField.required}
          disabled={formField.disabled}/>
        <div
          className='input-address-content-field-list absolute flex flex-col gap-1'
          style={{
            opacity: formField.hide ? 0 : 1,
            zIndex: formField.hide ? -1 : 1
          }}
          ref={formField.name === 'address' ? refAddress : undefined}/>
      </div>
    );
  };

  const submitAddress = async (fullAddressLocal?: FullAddress) => {
    if (!isFullAddressValid(fullAddressLocal)) return;
    
    if (!calculateDeliveryCost) {
      setIsEditing(false);

      return;
    }

    if (!fullAddressLocal) {
      flushSync(() => {
        setIsLoading(true);
      });
    }

    const fullAddress: FullAddress = fullAddressLocal ? fullAddressLocal : {
      number: '1',
      address,
      zipCode,
      city
    };
    onSubmit(fullAddress);
    const companyFullAddress: FullAddress = {
      number: '16',
      address: 'Rue Brederode',
      zipCode: '1000',
      city: 'Brussels'
    };
    const data = await getDistanceBetweenAddresses(fullAddress, companyFullAddress);
    updateDistance(data.distance);

    if (!fullAddressLocal) {
      flushSync(() => {
        setIsLoading(false);
        setIsEditing(false);
      });
    }
  };

  const renderLoading = () => {
    return (
      <div className='input-address-content-loading w-full h-full absolute'>
        <Loading/>
      </div>
    );
  };

  const renderEdit = () => {
    return (
      <form className='input-address-content flex flex-col flex-gap relative' action={() => submitAddress()}>
        {!isDefaultAddress && formFields.map(formField => renderFormField(formField))}
        {renderCheckbox()}
        {!isDefaultAddress && (<Button title={'valider'} buttonType={'submit'}/>)}
        {isLoading && renderLoading()}
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
