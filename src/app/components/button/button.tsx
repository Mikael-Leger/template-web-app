import React from 'react';

import { ButtonInterface } from '@/app/interfaces/button.interface';

import './button.scss';

export default function Button({title, icon, onClick, borderColor = 'black', type = 'primary', size = 'small', underline = false}: ButtonInterface) {
  return (
    <button
      className={`button button-${size} ${underline ? 'underline' : 'background'} button-${type}`}
      role='button'
      style={{ outlineColor: borderColor }}
      onClick={onClick}
    >
      <div className='button-front text flex flex-row'>
        {icon && icon.orientation === 'start' && (
          <div className='button-front-icon flex flex-col justify-center'>
            {icon.node}
          </div>
        )}
        <div className='button-front-text'>
          {title}
        </div>
        {icon && icon.orientation !== 'start' && (
          <div className='button-front-icon flex flex-col justify-center'>
            {icon.node}
          </div>
        )}
      </div>
    </button>
  );
}
