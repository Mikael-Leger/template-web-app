import React, { useState } from 'react';

import { useBasket } from '@/app/contexts/basket-context';
import Button from '../button/button';
import InputText from '../input-text/input-text';
import CheckoutMainDetails from '../checkout-main-details/checkout-main-details';
import Tooltip from '../tooltip/tooltip';

import './checkout.scss';

interface CheckoutProps {
  error?: string;
  submit: () => void;
}

export default function Checkout({error, submit}: CheckoutProps) {
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

  const reductionsPrice = getReductionsPrice(promotion ?? undefined);

  const renderActions = () => {
    return (
      <div className='checkout-actions'>
        {error ? (
          <Tooltip text={error}>
            <Button title={'Continuer'} fullWidth onClick={submit} disabled/>
          </Tooltip>
        ) : (
          <Button title={'Continuer'} fullWidth onClick={submit}/>
        )}
      </div>
    );
  };

  return (
    <div className='checkout flex flex-col padding-inner'>
      <div className='checkout-content flex flex-col'>
        <CheckoutMainDetails/>
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
            {reductionsPrice !== '0.00€' && (
              <div className='checkout-content-subtotal-costs-cost flex flex-row justify-between'>
                <div className='checkout-content-subtotal-costs-cost-title'>
                  {'Réductions'}
                </div>
                <div className='checkout-content-subtotal-costs-cost-money'>
                  {'- ' + reductionsPrice}
                </div>
              </div>
            )}
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
      {renderActions()}
    </div>
  );
}