import React from 'react';
import Link from 'next/link';

import { ProductItem } from '@/app/interfaces/product.interface';
import { useIsMobile } from '@/app/contexts/mobile-context';
import { useBasket } from '@/app/contexts/basket-context';
import DynamicIcon from '../dynamic-icon/dynamic-icon';
import Button from '../button/button';
import { capitalizeFirstLetter, slugify } from '@/app/services/formatter';
import Price from '../price/price';

import './product.scss';

interface ProductProps {
  item: ProductItem;
}

export default function Product({item}: ProductProps) {
  const {breakpoint} = useIsMobile();
  const {getActions} = useBasket();

  const getImageHeight = () => {
    switch (breakpoint) {
    case 'xxs':
      return 300;
    case 'xs':
      return 300;
    case 'sm':
      return 320;
    case 'md':
      return 300;
    default:
      return 320;
    }
  };

  const getImageWidth = () => {
    switch (breakpoint) {
    case 'xxs':
      return 200;
    case 'xs':
      return 180;
    case 'sm':
      return 200;
    case 'md':
      return 180;
    default:
      return 200;
    }
  };

  return (
    <div className='product' style={{width: getImageWidth()}}>
      <div className='product-image' style={{height: getImageHeight()}}>
        {item.image && <img src={`/images/catalog/${item.image}`} style={{height: getImageHeight()}}/>}
        {item.tags?.includes('nouveau') && (
          <div className='product-image-new relative'>
            <div className='product-image-new-icon absolute'>
              <DynamicIcon iconName='BsStars' color='red' size={48}/>
            </div>
            <div className='product-image-new-text absolute flex justify-center items-center'>
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
      <div className='product-details flex flex-col items-center'>
        <Link href={`/products/${slugify(item.title)}`} className='product-details-title'>
          {capitalizeFirstLetter(item.title)}
        </Link>
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
