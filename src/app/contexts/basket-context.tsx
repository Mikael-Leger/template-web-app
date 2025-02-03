'use client';

import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';
import { ProductItem } from '../interfaces/product.interface';
import productItems from '@/app/data/products.json';

interface Action {
  title?: string | number;
  iconName?: string;
  round?: boolean;
  hide?: boolean;
  left?: string;
  right?: string;
  zIndex?: number;
  input?: 'number' | undefined;
  maxChars?: number;
  size?: 'small' | 'medium' | 'big';
  onClick?: (_payload: any) => any;
  onChange?: (_payload: any) => any;
}

interface BasketItem {
  productName: string,
  number: number
}

interface BasketContextType {
  items: BasketItem[];
  getItem: (_itemName: string) => BasketItem | null;
  updateItem: (_itemName: string, _value: number | string) => void;
  deleteItem: (_itemName: string) => void;
  clearItems: () => void;
  getActions: (_itemName: string, _displayBuy?: boolean) => Action[];
  getNumberOfItemsInBasket: () => number;
  getItemsInBasket: () => {product: ProductItem, number: number}[];
  getSubTotalPrice: (_promotion?: number) => string;
  getTotalPrice: (_promotion?: number) => string;
  getServiceCostPrice: () => string;
  getDeliveryCostPrice: (_number?: number) => string;
  getReductionsPrice: (_promotion?: number) => string;
  getPromotionsPrice: (_promotion?: number) => string;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

export const useBasket = (): BasketContextType => {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error('useBasket must be used within a BasketProvider');
  }

  return context;
};

interface BasketProviderProps {
    children: ReactNode;
}

const COST_SERVICE = 2.05;
const COST_DELIVERY: Record<string, number> = {
  5: 1.45,
  10: 2.10,
  20: 3.55
};

export const BasketProvider: React.FC<BasketProviderProps> = ({ children }) => {
  const [items, setItems] = useState<BasketItem[]>([]);

  useEffect(() => {
    const productsLocalStr = localStorage.getItem('products');
    if (productsLocalStr) {
      const productsLocal = JSON.parse(productsLocalStr);
      setItems(productsLocal);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(items));
  }, [items]);

  const clearItems = () => {
    setItems([]);
  };

  const getItem = (itemName: string) => {
    const itemIndexFound = items.findIndex(item => item.productName === itemName);

    return (itemIndexFound !== -1) ? items[itemIndexFound] : null;
  };

  const getNumberOfItemsInBasket = () => {
    return items.reduce((acc, item) => acc + item.number, 0);
  };

  const getItemsInBasket = () => {
    const namesList = items.map(item => item.productName);

    return productItems.filter(product => namesList.includes(product.title))
      .map(product => {
        const basketItem = items.find(item => item.productName === product.title);

        return {
          product: product,
          number: basketItem ? basketItem.number : 0
        };
      })
      .sort((a, b) => a.product.title.localeCompare(b.product.title));
  };

  const getSubTotal = (promotion: number = 0) => {
    const subtotal = getItemsInBasket().reduce((acc, item) => {
      const {price} = item.product;
      const currentPrice = (typeof price === 'number') ? price : price.new;

      return acc + currentPrice * item.number;
    }, 0);

    return promotion === 0 ? subtotal : subtotal - subtotal * promotion;
  };

  const getSubTotalPrice = (promotion: number = 0) => {
    return `${getSubTotal(promotion).toFixed(2)}€`;
  };

  const getReductions = () => {
    return getItemsInBasket().reduce((acc, item) => {
      const {price} = item.product;
      if (typeof price === 'number') return acc + 0;

      const reduction = price.old - price.new;

      return acc + reduction * item.number;
    }, 0);
  };

  const getReductionsPrice = () => {
    return `${getReductions().toFixed(2)}€`;
  };

  const getPromotions = (promotion: number = 0) => {
    const subTotal = getSubTotal();

    return subTotal * promotion;
  };

  const getPromotionsPrice = (promotion: number = 0) => {
    return `${getPromotions(promotion).toFixed(2)}€`;
  };

  const getTotal = (promotion: number = 0) => {
    return getSubTotal(promotion) + getServiceCost() + (getDeliveryCost() ?? 0);
  };

  const getTotalPrice = (promotion: number = 0) => {
    return `${getTotal(promotion).toFixed(2)}€`;
  };

  const getServiceCost = () => {
    return COST_SERVICE;
  };

  const getServiceCostPrice = () => {
    return `${getServiceCost()}€`;
  };

  const adjustDistance = (distance: number): number | null => {
    if (distance === 0) {
      return null;
    } else if (distance < 5) {
      return 5;
    } else if (distance >= 5 && distance <= 10) {
      return 10;
    } else {
      return 20;
    }
  };

  const getDeliveryCost = (distance: number = 0) => {
    const adjustedDistance = adjustDistance(distance);

    return adjustedDistance ? COST_DELIVERY[adjustedDistance] : null;
  };

  const getDeliveryCostPrice = (distance: number = 0) => {
    const deliveryCost = getDeliveryCost(distance);

    return deliveryCost ? `${deliveryCost}€` : '--';
  };

  const updateItem = (itemName: string, value: number | string) => {
    if (typeof value === 'string') {
      if (value === '') value = '0';
      
      value = parseInt(value);
    }

    const itemIndexFound = items.findIndex(item => item.productName === itemName);
    if (itemIndexFound !== -1) {
      if (items[itemIndexFound].number >= 999 && value > 0) return;

      if (items[itemIndexFound].number + value < 0) {
        deleteItem(itemName);

      } else {
        setItems(prevItems => {
          const updatedItems = [...prevItems];
          updatedItems[itemIndexFound].number += value;

          return updatedItems;
        });
      }

    } else {
      setItems(prevItems => {
        const updatedItems = [...prevItems];
        updatedItems.push({
          productName: itemName,
          number: value
        });

        return updatedItems;
      });
    }
  };

  const deleteItem = (itemName: string) => {
    const itemIndexFound = items.findIndex(item => item.productName === itemName);
    if (itemIndexFound === -1) return;

    setItems(prevItems => {
      const updatedItems = [...prevItems];
      updatedItems.splice(itemIndexFound, 1);

      return updatedItems;
    });
  };

  const getActions = (itemName: string, displayBuy: boolean = false): Action[] => {
    const itemNameFormatted = itemName.toLowerCase();
    const itemInBasket = getItem(itemNameFormatted);

    const actions: Action[] = [
      {
        iconName: 'BsDash',
        hide: itemInBasket === null || (!displayBuy && itemInBasket?.number === 0),
        left: '20px',
        onClick: () => updateItem(itemNameFormatted, -1),
        size: 'small',
        round: true
      },
      {
        title: itemInBasket?.number,
        hide: itemInBasket === null,
        input: 'number',
        maxChars: 3,
        onChange: (targetValue: string) => {
          const currentNumber = itemInBasket?.number ?? 0;
          const newValue = (targetValue === '') ? -currentNumber : parseInt(targetValue) - currentNumber;
          updateItem(itemNameFormatted, newValue);
        },
      },
      {
        iconName: 'BsPlusLg',
        hide: itemInBasket === null || itemInBasket?.number === 999,
        right: '20px',
        onClick: () => updateItem(itemNameFormatted, 1),
        size: 'small',
        round: true
      }
    ];

    if (displayBuy) {
      actions.push({
        title: 'Acheter',
        iconName: 'BsBasket',
        hide: itemInBasket !== null,
        onClick: () => updateItem(itemNameFormatted, 1),
      });
    }

    return actions;
  };

  return (
    <BasketContext.Provider value={{
      items,
      getItem,
      updateItem,
      deleteItem,
      clearItems,
      getActions,
      getNumberOfItemsInBasket,
      getItemsInBasket,
      getSubTotalPrice,
      getTotalPrice,
      getServiceCostPrice,
      getDeliveryCostPrice,
      getReductionsPrice,
      getPromotionsPrice
    }}>
      {children}
    </BasketContext.Provider>
  );
};

export default BasketContext;
