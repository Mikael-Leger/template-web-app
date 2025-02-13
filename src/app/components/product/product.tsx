import React from 'react';

import { ProductItem } from '@/app/interfaces/product.interface';
import { useIsMobile } from '@/app/contexts/mobile-context';
import { useBasket } from '@/app/contexts/basket-context';
import DynamicIcon from '../dynamic-icon/dynamic-icon';
import Button from '../button/button';
import { capitalizeFirstLetter } from '@/app/services/formatter';

import './product.scss';
import Price from '../price/price';

interface ProductProps {
  item: ProductItem;
}

export default function Product({item}: ProductProps) {
  const {isMobile} = useIsMobile();
  const {getActions} = useBasket();

  const getImageHeight = () => {
    return isMobile ? 200 : 300;
  };

  const getProductWidth = () => {
    return isMobile ? 125 : 200;
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
        <div className='product-image-actions absolute flex flex-row w-full'>
          <div className='product-image-actions-container relative w-full'>
            {getActions(item.title, true).map((action, index) => {
              return (
                <div
                  className={`product-image-actions-container-button absolute ${!action.left && !action.right && 'centered'}`}
                  style={{
                    bottom: action.hide ? '-150px' : 0,
                    left: action.left,
                    right: action.right
                  }}
                  key={index}>
                  <Button
                    icon={{
                      node: action.iconName ? <DynamicIcon iconName={action.iconName} size={16}/> : undefined
                    }}
                    size={action.size}
                    input={action.input}
                    maxChars={action.maxChars}
                    title={action.title}
                    round={action.round}
                    onClick={action.onClick}
                    onChange={action.onChange}/>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className='product-details flex flex-col justify-center items-center'>
        <div className='product-details-title'>
          {capitalizeFirstLetter(item.title)}
        </div>
        <div className='product-details-price'>
          {item.price && (
            <Price price={item.price} priceByDosage={item.priceByDosage}/>
          )}
        </div>
        <div className='product-details-description'>
          {item.short_description}
        </div>
      </div>
    </div>
  );
}
