import React, { useState } from 'react';

import { capitalizeFirstLetter } from '@/app/services/formatter';

import './checkbox.scss';

interface CheckboxProps {
  title: string;
  defaultValue?: boolean;
  value?: boolean;
  onClick: () => void;
}

export default function Checkbox({title, defaultValue, value, onClick}: CheckboxProps) {
  const [isChecked, setIsChecked] = useState<boolean>(defaultValue ?? false);

  const onCheckboxClick = () => {
    if (!value) {
      setIsChecked(!isChecked);
    }
    onClick();
  };

  return (
    <div className='checkbox flex flex-row gap-2'>
      <input id={`checkbox-${title}`} type='checkbox' onChange={onCheckboxClick} checked={value !== null ? value : isChecked}/>
      <label className='checkbox-title' htmlFor={`checkbox-${title}`}>
        {capitalizeFirstLetter(title)}
      </label>
    </div>
  );
}
