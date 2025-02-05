import React, { useState } from 'react';

import DynamicIcon from '../dynamic-icon/dynamic-icon';
import { formatDate, getNextBusinessDay } from '@/app/services/date';
import { useBasket } from '@/app/contexts/basket-context';
import Button from '../button/button';
import InputText from '../input-text/input-text';

import './checkout.scss';

interface CheckoutProps {
  submit: () => void;
}

export default function Checkout({submit}: CheckoutProps) {
  const {
    getNumberOfItemsInBasket,
    getSubTotalPrice,
    getTotalPrice,
    getServiceCostPrice,
    getDeliveryCostPrice,
    getReductionsPrice,
    getPromotionsPrice
  } = useBasket();

  const [promotion, setPromotion] = useState<number | null>(0);

  const checkPromoCode = (code: string) => {
    let newPromotion = null;
    if (code === 'LAPATEDOREE10') newPromotion = .1;
    if (code === 'LAPATEDOREE30') newPromotion = .3;
    if (code === 'UNICORN') newPromotion = .9999;

    setPromotion(newPromotion);
  };

  return (
    <div className='checkout flex flex-col'>
      <div className='checkout-content flex flex-col'>
        <div className='checkout-content-details'>
          <div className='checkout-content-details-title flex flex-row items-center'>
            <div className='checkout-icon mr-2'>
              <DynamicIcon iconName='BsTruck' color='primary' size={24}/>
            </div>
            <div className='checkout-title'>
              {'La Pâte dorée - Livraison'}
            </div>
          </div>
          <div className='checkout-content-details-address'>
            {'0113 Lorem, Ipsum'}
          </div>
          <div className='checkout-content-details-date'>
            {formatDate(getNextBusinessDay())}
          </div>
        </div>
        <div className='checkout-content-subtotal'>
          <div className='checkout-title'>
            <div className='checkout-title-1'>
              {`Sous-total (${getNumberOfItemsInBasket()} articles)`}
            </div>
            <div className='checkout-title-2'>
              {getSubTotalPrice(promotion ? promotion : undefined)}
            </div>
          </div>
          <div className='checkout-content-subtotal-costs flex flex-col'>
            <div className='checkout-content-subtotal-costs-cost flex flex-row justify-between'>
              <div className='checkout-content-subtotal-costs-cost-title'>
                {'Réductions'}
              </div>
              <div className='checkout-content-subtotal-costs-cost-money'>
                {'- ' + getReductionsPrice(promotion ?? undefined)}
              </div>
            </div>
            {promotion !== null && promotion !== 0 && (
              <div className='checkout-content-subtotal-costs-cost flex flex-row justify-between'>
                <div className='checkout-content-subtotal-costs-cost-title'>
                  {'Code promo'}
                </div>
                <div className='checkout-content-subtotal-costs-cost-money'>
                  {'- ' + getPromotionsPrice(promotion ?? undefined)}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className='checkout-content-total'>
          <div className='checkout-content-total-title'>
            <div className='checkout-title'>
              <div className='checkout-title-1'>
                {'Total'}
              </div>
              <div className='checkout-title-2'>
                {getTotalPrice(promotion ?? undefined)}
              </div>
            </div>
          </div>
          <div className='checkout-content-total-costs flex flex-col'>
            <div className='checkout-content-total-costs-cost'>
              {'Frais de service ' + getServiceCostPrice()}
            </div>
            <div className='checkout-content-total-costs-cost'>
              {'Frais de livraison ' + getDeliveryCostPrice()}
            </div>
          </div>
        </div>
        <div className='checkout-content-promo'>
          <div className='checkout-content-promo-title'>
            <div className='checkout-title'>
              {'Code Promo'}
            </div>
          </div>
          <div className='checkout-content-promo-code'>
            <InputText
              name='promo'
              border
              placeholder={'Saisir un code promo'}
              submit={checkPromoCode}
              color={promotion === null ? 'error' : undefined}/>
            <div className='checkout-content-promo-code-details'>
              <div className='checkout-content-promo-code-details-error'>
                {promotion === null && (
                  'Ce code promo est invalide'
                )}
              </div>
              <div className='checkout-content-promo-code-details-success'>
                {promotion !== null && promotion > 0 && (
                  `Vous bénificiez d'une réduction de ${(promotion * 100).toFixed(2)}%`
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='checkout-actions'>
        <Button title={'Continuer'} fullWidth onClick={submit}/>
      </div>
    </div>
  );
}