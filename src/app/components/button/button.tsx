import React from 'react';

import { ButtonInterface } from '@/app/interfaces/button.interface';
import { capitalizeFirstLetter } from '@/app/services/formatter';

import './button.scss';

export default function Button({
  title,
  icon,
  round,
  buttonType,
  width,
  fullHeight,
  fullWidth,
  underline,
  disabled,
  outline,
  input,
  maxChars,
  className,
  borderColor = 'black',
  backgroundColor = 'white',
  type = 'primary',
  size = 'medium',
  padding = true,
  onClick,
  onChange,
}: ButtonInterface) {
  const onButtonClick = () => {
    if (!onClick || disabled) return;
    
    onClick();
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      let targetValue = e.target.value.replace(/\D/g, '');
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
          <div className='button-front-text resize-none min-w-0 truncate'>
            {capitalizeFirstLetter(title.toString())}
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

  if (input === 'number') {
    return (
      <div className={`button input background input-${type} input-${backgroundColor}`}>
        <input
          type='text'
          inputMode='numeric'
          pattern='[0-9]*'
          value={capitalizeFirstLetter(title?.toString() ?? '')}
          min={0}
          max={maxChars ? Number('9'.repeat(maxChars)) : undefined}
          onChange={onInputChange}
          className={`button-front button-${size} ${fullWidth && 'button-full-width'} ${fullHeight && 'button-full-height'} ${round && 'round'} ${underline ? 'underline' : 'background'} input-${backgroundColor} text-center appearance-none p-2`}
          role='button'
          style={{
            outlineColor: borderColor,
            width: 50,
          }}
        />
      </div>
    );
  }

  return (
    <button
      className={`button button-${size} ${outline && 'button-outline'} ${fullWidth && 'button-full-width'} ${fullHeight && 'button-full-height'} ${padding && 'button-padding'} ${round && 'round'} ${underline ? 'underline' : 'background'} button-${type} ${disabled && 'disabled'} ${className}`}
      role='button'
      style={{ outlineColor: borderColor, width: width ? width : 'fit-content' }}
      onClick={onButtonClick}
      disabled={disabled}
      type={buttonType}
    >
      {buttonContent()}
    </button>
  );
}
