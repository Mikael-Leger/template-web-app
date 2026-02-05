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
  defaultValue: string;
  title?: string;
  required?: boolean;
  leftGap?: boolean;
  onChange?: (_value: string) => void;
  onValidationChange?: (_isValid: boolean) => void;
  color?: 'error' | 'black';
}

/**
 * Validates a phone number based on common international formats
 * Allows digits, spaces, dashes, dots, and parentheses
 * After stripping formatting, checks for valid digit count (4-15 digits)
 */
function isValidPhoneNumber(phoneNumber: string): boolean {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return false;
  }

  // Remove all formatting characters (spaces, dashes, dots, parentheses)
  const digitsOnly = phoneNumber.replace(/[\s\-.()\u00A0]/g, '');

  // Check if all remaining characters are digits
  if (!/^\d+$/.test(digitsOnly)) {
    return false;
  }

  // Phone numbers typically have 4-15 digits (national number without country code)
  // Minimum 4 for short numbers (some countries have 4-digit numbers)
  // Maximum 15 as per ITU-T E.164 standard (including country code, but we're validating national part)
  const minDigits = 4;
  const maxDigits = 15;

  return digitsOnly.length >= minDigits && digitsOnly.length <= maxDigits;
}

type Country = typeof callingCountries.all[0];

export default function InputPhone({defaultValue, required, title, leftGap, color = 'black', onChange, onValidationChange}: InputPhoneProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const [currentCode, setCurrentCode] = useState<PhoneCode | null>(null);
  const [isCodesListVisible, setIsCodesListVisible] = useState<boolean>(false);
  const [phoneCodesList, setPhoneCodesList] = useState<Country[]>([]);
  const [isTouched, setIsTouched] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    setPhoneCodesList([...callingCountries.all]);
    const found = callingCountries.all.find(country => country.name === 'Belgium');
    if (found) {
      setCurrentCode(formatPhoneCode(found));
    }
  }, []);

  useEffect(() => {
    setInputValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (onChange) {
      onChange(inputValue);
    }
  }, [inputValue]);

  useEffect(() => {
    const valid = isValidPhoneNumber(inputValue);
    setIsValid(valid);
    if (onValidationChange) {
      onValidationChange(valid);
    }
  }, [inputValue, onValidationChange]);

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
    <div className='input-phone-container flex flex-col gap-1'>
      {title && (
        <div className='input-phone-title'>
          {title} {required && '*'}
        </div>
      )}
      <div className={`input-phone flex flex-row justify-between input-phone-${color} ${isTouched && !isValid ? 'input-phone-invalid' : ''} relative`}>
        <div className='input-phone-codes flex flex-row gap-2 justify-center items-center absolute cursor-pointer' onClick={switchCodesListVisibility}>
          <div className='input-phone-codes-flag'>
            <img src={`/icons/flags/${currentCode.value.toLowerCase()}.svg`}/>
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
          className={`flex-1 ${leftGap && 'left-gap'} w-full`}
          type='tel'
          placeholder={'1 23 45 67 89'}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => {
            setIsCodesListVisible(false);
            setIsTouched(true);
          }}/>
      </div>
      {isTouched && !isValid && (
        <div className='input-phone-error'>
          Veuillez entrer un numéro de téléphone valide
        </div>
      )}
    </div>
  );
}
