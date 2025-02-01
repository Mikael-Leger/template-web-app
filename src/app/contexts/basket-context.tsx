'use client';

import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';

interface Action {
  title?: string | number;
  iconName?: string;
  round?: boolean;
  onClick?: (_payload: any) => any;
  onChange?: (_payload: any) => any;
  hide?: boolean;
  left?: string;
  right?: string;
  zIndex?: number;
  input?: 'number' | undefined;
  maxChars?: number;
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
    <BasketContext.Provider value={{ items, getItem, updateItem, deleteItem, clearItems, getActions, getNumberOfItemsInBasket }}>
      {children}
    </BasketContext.Provider>
  );
};

export default BasketContext;
