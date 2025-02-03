import React from 'react';

import { PriceType } from '@/app/interfaces/product.interface';

import './price.scss';

interface PriceProps {
  price: PriceType;
  priceByDosage?: string;
}

export default function Price({price, priceByDosage}: PriceProps) {
  const renderPriceByDosage = () => {
    if (!priceByDosage) return;

    return (
      <div className='price-dosage'>
        {priceByDosage}
      </div>
    );
  };
  
  if (typeof price === 'number') {
    return (
      <>
        <div className='price-current'>
          {price}€
        </div>
        {renderPriceByDosage()}
      </>
    );
  }

  return (
    <>
      <div className='price-current'>
        {price?.new}€
      </div>
      <div className='price-old'>
        {price?.old}€
      </div>
      {renderPriceByDosage()}
    </>
  );
}