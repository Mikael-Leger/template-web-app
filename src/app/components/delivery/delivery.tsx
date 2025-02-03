import React from 'react';

import Title from '../title/title';
import InputPhone from '../input-phone/input-phone';

import './delivery.scss';

export default function Delivery() {
  return (
    <div className='delivery'>
      <div className='delivery-title'>
        <Title text='Informations' orientation='start' size='medium'/>
      </div>
      <div className='delivery-container'>
        <div className='delivery-container-content'>
          <Title text='Adresse de livraison' orientation='start'/>
          <div className='delivery-container-content-text'>
            ICI
          </div>
        </div>
        <div className='delivery-container-content'>
          <Title text='Adresse de facturation' orientation='start'/>
          <div className='delivery-container-content-text'>
            ICI
          </div>
        </div>
        <div className='delivery-container-content'>
          <Title text='Numéro de téléphone' orientation='start'/>
          <div className='delivery-container-content-text'>
            <InputPhone/>
          </div>
        </div>
      </div>
    </div>
  );
}
