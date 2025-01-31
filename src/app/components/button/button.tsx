import React from 'react';

import { ButtonInterface } from '@/app/interfaces/button.interface';

import './button.scss';

export default function Button({
  title,
  icon,
  onClick,
  onChange,
  round,
  borderColor = 'black',
  type = 'primary',
  size = 'small',
  underline = false,
  input = undefined,
  maxChars = undefined,
}: ButtonInterface) {
  const onButtonClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      let targetValue = e.target.value;
      if (maxChars) {
        targetValue = targetValue.slice(0, maxChars);
      }
      onChange(targetValue);
    }
  };

  const buttonContent = () => {
    return (
      <div className='button-front text flex flex-row'>
        {icon && icon.orientation === 'start' && (
          <div className='button-front-icon flex flex-col justify-center'>
            {icon.node}
          </div>
        )}
        {title && (
          <div className='button-front-text'>
            {title}
          </div>
        )}
        {icon && icon.orientation !== 'start' && (
          <div className='button-front-icon flex flex-col justify-center'>
            {icon.node}
          </div>
        )}
      </div>
    );
  };

  if (input === 'textarea') {
    return (
      <input
        type='text'
        value={title}
        onChange={onInputChange}
        className={`button button-front button-${size} ${round && 'round'} ${underline ? 'underline' : 'background'} button-${type} text-center`}
        role='button'
        style={{
          outlineColor: borderColor,
          width: 50,
        }}
      />
    );
  }

  return (
    <button
      className={`button button-${size} ${round && 'round'} ${underline ? 'underline' : 'background'} button-${type}`}
      role='button'
      style={{ outlineColor: borderColor }}
      onClick={onButtonClick}
    >
      {buttonContent()}
    </button>
  );
}
