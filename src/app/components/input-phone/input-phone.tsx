import React, { useEffect, useState } from 'react';
import { callingCountries } from 'country-data';

import DynamicIcon from '../dynamic-icon/dynamic-icon';
import Separator from '../separator/separator';
import InputText from '../input-text/input-text';

import './input-phone.scss';

interface PhoneCode {
  name: string;
  value: string;
  code: string;
}

interface InputPhoneProps {
  color?: 'error' | 'black';
}

type Country = typeof callingCountries.all[0];

export default function InputPhone({color = 'black'}: InputPhoneProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const [currentCode, setCurrentCode] = useState<PhoneCode | null>(null);
  const [isCodesListVisible, setIsCodesListVisible] = useState<boolean>(false);
  const [phoneCodesList, setPhoneCodesList] = useState<Country[]>([]);

  useEffect(() => {
    setPhoneCodesList([...callingCountries.all]);
    const found = callingCountries.all.find(country => country.name === 'Belgium');
    if (found) {
      setCurrentCode(formatPhoneCode(found));
    }
  }, []);

  const switchCodesListVisibility = () => {
    setIsCodesListVisible(prevState => !prevState);
  };

  const formatPhoneCode = (country: Country) => {
    return {
      name: country.name,
      value: country.alpha2,
      code: country.countryCallingCodes[0]
    };
  };

  const getPhoneCodesList = () => {
    return phoneCodesList.map(country => formatPhoneCode(country));
  };

  const refreshPhoneCodes = (value: string) => {
    const newPhoneCodes = callingCountries.all.filter(country => country.name.toLowerCase().includes(value));
    setPhoneCodesList(newPhoneCodes);
  };

  const selectPhoneCode = (phoneCode: PhoneCode) => {
    setCurrentCode(phoneCode);
    setIsCodesListVisible(false);
    setPhoneCodesList([...callingCountries.all]);
  };

  if (!currentCode) return;

  return (
    <div className={`input-phone flex flex-row justify-between input-phone-${color} relative`}>
      <div className='input-phone-codes flex flex-row gap-2 justify-center items-center absolute cursor-pointer' onClick={switchCodesListVisibility}>
        <div className='input-phone-codes-flag'>
          <img src={`icons/flags/${currentCode.value.toLowerCase()}.svg`}/>
        </div>
        <div className='input-phone-codes-code'>
          {currentCode.code}
        </div>
        <div className='input-phone-codes-actiopn'>
          <DynamicIcon iconName={isCodesListVisible ? 'BsChevronUp' : 'BsChevronDown'}/>
        </div>
      </div>
      {isCodesListVisible && (
        <div className='input-phone-codes-list absolute flex flex-col gap-1'>
          <div className='input-phone-codes-list-search flex flex-row gap-2 items-center'>
            <DynamicIcon iconName='BsSearch'/>
            <div className='input-phone-codes-list-search-text'>
              <InputText name='search' placeholder='Rechercher' onChange={refreshPhoneCodes}/>
            </div>
          </div>
          <Separator/>
          {getPhoneCodesList().map(phoneCode => (
            <div
              className='input-phone-codes-list-code cursor-pointer'
              onClick={() => selectPhoneCode(phoneCode)}
              key={phoneCode.value}>
              {phoneCode.name} ({phoneCode.code})
            </div>
          ))}
        </div>
      )}
      <input
        className='flex-1'
        type='tel'
        placeholder={'1 23 45 67 89'}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}/>
    </div>
  );
}
