import React, { useState } from 'react';

import Button from '../button/button';

import './input-text.scss';

interface InputTextProps {
  placeholder?: string;
  color?: 'error' | 'black';
  submit?: (_payload: any) => void;
}

export default function InputText({placeholder, color = 'black', submit}: InputTextProps) {
  const [inputValue, setInputValue] = useState<string>('');

  return (
    <div className={`input-text flex flex-row justify-between input-text-${color}`}>
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
