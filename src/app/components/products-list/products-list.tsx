import React from 'react';

import { useBasket } from '@/app/contexts/basket-context';
import { capitalizeFirstLetter } from '@/app/services/formatter';
import DynamicIcon from '../dynamic-icon/dynamic-icon';
import Button from '../button/button';
import Price from '../price/price';
import Separator from '../separator/separator';

import './products-list.scss';

export default function ProductsList() {
  const {getItemsInBasket, getActions, deleteItem} = useBasket();

  return (
    <div className='products-list flex flex-col flex-1'>
      {
        getItemsInBasket().map((item, itemIndex) => (
          <React.Fragment key={item.product.title}>
            {itemIndex !== 0 && (
              <Separator/>
            )}
            <div className='products-list-item padding-inner flex flex-row flex-gap justify-end'>
              <div className='products-list-item-image flex flex-col'>
                <img src={`images/catalog/${item.product.image}`}/>
              </div>
              <div className='products-list-item-content flex flex-col flex-1'>
                <div className='products-list-item-content-title'>
                  {capitalizeFirstLetter(item.product.title) + ' '}
                  {item.product.quantity && (
                    <div className='products-list-item-content-quantity inline-flex'>
                      {`(${item.product.quantity})`}
                    </div>
                  )}
                </div>
                <div className='products-list-item-content-description'>
                  {item.product.short_description}
                </div>
              </div>
              <div className='products-list-item-price flex flex-col justify-between items-end'>
                {item.product.price && (<Price price={item.product.price} priceByDosage={item.product.priceByDosage}/>)}
              </div>
              <div className='products-list-item-actions flex flex-col justify-between items-center'>
                <div className='products-list-item-actions-number flex flex-row items-center'>
                  {getActions(item.product.title).map((action, index) => {
                    return (
                      <div
                        className={'products-list-item-actions-container-button flex justify-center'}
                        key={index}>
                        <Button
                          icon={{
                            node: action.iconName ? <DynamicIcon iconName={action.iconName} size={18}/> : undefined
                          }}
                          type='black'
                          input={action.input}
                          backgroundColor= 'secondary'
                          maxChars={action.maxChars}
                          title={action.title}
                          round={action.round}
                          underline
                          padding={false}
                          disabled={action.hide}
                          onClick={action.onClick}
                          onChange={action.onChange}/>
                      </div>
                    );}
                  )}
                </div>
                <Button
                  title={'Supprimer'}
                  type='error'
                  size='small'
                  onClick={() => deleteItem(item.product.title)}
                  underline/>
              </div>
            </div>
          </React.Fragment>
        ))
      }
    </div>
  );
}
