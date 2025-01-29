import React from 'react';

import { ProductItem } from '@/app/interfaces/product.interface';
import { useIsMobile } from '@/app/contexts/mobile-context';
import DynamicIcon from '../dynamic-icon/dynamic-icon';
import Button from '../button/button';
import { capitalizeFirstLetter } from '@/app/services/formatter';

import './product.scss';

interface ProductProps {
  item: ProductItem;
}

interface Action {
  iconName: string,
  onClick: () => void
}

export default function Product({item}: ProductProps) {
  const {isMobile} = useIsMobile();

  const getImageHeight = () => {
    return isMobile ? 200 : 300;
  };

  const getProductWidth = () => {
    return isMobile ? 125 : 200;
  };

  const getActions = (): Action[] => {
    return [
      {
        iconName: 'BsBasket',
        onClick: () => {}
      },
      {
        iconName: 'BsEye',
        onClick: () => {}
      }
    ];
  };

  return (
    <div className='product' style={{width: getProductWidth()}}>
      <div className='product-image' style={{height: getImageHeight()}}>
        {item.image && <img src={`images/catalog/${item.image}`} style={{height: getImageHeight()}}/>}
        {item.tags?.includes('new') && (
          <div className='product-image-new relative'>
            <div className='product-image-new-icon absolute'>
              <DynamicIcon iconName='BsStars' color='red' size={isMobile ? 32: 48}/>
            </div>
            <div
              className='product-image-new-text absolute flex justify-center items-center'
              style={{
                width: isMobile ? '32px': '48px',
                height: isMobile ? '32px': '48px',
                fontSize: isMobile ? '12px': '20px'
              }}>
              NEW
            </div>
          </div>
        )}
        <div className='product-image-actions absolute flex flex-row'>
          {getActions().map(action => (
            <Button
              icon={{
                node: <DynamicIcon iconName={action.iconName}/>
              }}
              round
              onClick={() => {}}
              key={action.iconName}/>
          ))}
        </div>
      </div>
      <div className='product-details flex flex-col justify-center items-center'>
        <div className='product-details-title'>
          {capitalizeFirstLetter(item.title)}
        </div>
        <div className='product-details-price'>
          {item.price}€
        </div>
        <div className='product-details-description'>
          {item.short_description}
        </div>
      </div>
    </div>
  );
}
