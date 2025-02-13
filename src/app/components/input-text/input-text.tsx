import React, { RefObject, useEffect, useState } from 'react';

import Button from '../button/button';
import DynamicIcon from '../dynamic-icon/dynamic-icon';
import Tooltip from '../tooltip/tooltip';
import { FullAddress } from '@/app/interfaces/address.interface';

import './input-text.scss';

export interface InputTextProps {
  name: string;
  title?: string;
  placeholder?: string;
  value?: string;
  color?: 'error' | 'black';
  border?: boolean;
  textarea?: boolean;
  required?: boolean;
  disabled?: boolean;
  hide?: boolean;
  ref?: RefObject<HTMLDivElement | null>;
  submit?: (_payload: any) => void;
  onBlur?: () => void;
  onChange?: (_value: string) => void;
  onClick?: (_value: FullAddress) => void;
}

export default function InputText({name, title, placeholder, value, textarea, required, disabled, color = 'black', border = false, submit, onBlur, onChange}: InputTextProps) {
  const [inputValue, setInputValue] = useState<string>(value ?? '');

  useEffect(() => {
    if (onChange) {
      onChange(inputValue);
    }
  }, [inputValue]);

  useEffect(() => {
    if (onChange && value) {
      onChange(value );
    }
  }, [value]);

  const inputObject = {
    className: 'flex-1 resize-none',
    style: {height: textarea ? 150 : undefined},
    name: name,
    placeholder: placeholder,
    value: value ? value : inputValue,
    onChange: (e: any) => setInputValue(e.target.value),
    required: required,
    onBlur: () => onBlur && onBlur(),
    disabled: disabled
  };

  return (
    <div className={'input-text flex flex-col gap-1'}>
      {title && (
        <div className='input-text-title'>
          {title} {required && '*'}
        </div>
      )}
      <div className={`input-text-content flex flex-row justify-between relative input-text-${color} ${border && 'input-text-content-border'}`}>
        {textarea ? (
          <textarea
            {...inputObject}/>
        ): (
          <input
            type='text'
            {...inputObject}/>
        )}
        {disabled && (
          <div className='input-text-content-disabled absolute'>
            <Tooltip text='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'>
              <DynamicIcon iconName='BsDashCircle'/>
            </Tooltip>
          </div>
        )}
        {submit && (
          <div className='input-text-content-button'>
            <Button title={'OK'} onClick={() => submit(inputValue)} fullHeight/>
          </div>
        )}
      </div>
    </div>
  );
}
