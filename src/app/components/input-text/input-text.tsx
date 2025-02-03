import React, { useEffect, useState } from 'react';

import Button from '../button/button';

import './input-text.scss';

interface InputTextProps {
  placeholder?: string;
  color?: 'error' | 'black';
  border?: boolean;
  submit?: (_payload: any) => void;
  onChange?: (_value: string) => void;
}

export default function InputText({placeholder, color = 'black', border = false, submit, onChange}: InputTextProps) {
  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    if (onChange) {
      onChange(inputValue);
    }
  }, [inputValue]);

  return (
    <div className={`input-text flex flex-row justify-between input-text-${color} ${border && 'input-text-border'}`}>
      <input
        className='flex-1'
        type='text'
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}/>
      {submit && (
        <div className='input-text-button'>
          <Button title={'OK'} onClick={() => submit(inputValue)} fullHeight/>
        </div>
      )}
    </div>
  );
}
