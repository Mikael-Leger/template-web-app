'use client';

import React, { useEffect } from 'react';
import OrderProcess from '@/app/components/order-process/order-process';
import { useBasket } from '@/app/contexts/basket-context';
import productItems from '@/app/data/products.json';

interface OrderProcessWrapperProps {
  defaultProductCount?: number;
}

export default function OrderProcessWrapper({
  defaultProductCount = 1,
}: OrderProcessWrapperProps) {
  const { getNumberOfItemsInBasket, updateItem } = useBasket();

  // Pre-populate basket with default product if empty
  useEffect(() => {
    const itemsInBasket = getNumberOfItemsInBasket();
    if (itemsInBasket === 0 && defaultProductCount > 0 && productItems.length > 0) {
      const firstProduct = productItems[0];
      updateItem(firstProduct.title.toLowerCase(), defaultProductCount);
    }
  }, []);

  return <OrderProcess editorMode />;
}
