'use client';

import React, { createContext, useState, ReactNode, useContext } from 'react';

interface BasketItem {
  productName: string,
  number: number
}

interface BasketContextType {
  items: BasketItem[];
  updateItem: (_itemName: string, _value: number) => void;
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

  const updateItem = (itemName: string, value: number) => {
    const itemIndexFound = items.findIndex(item => item.productName === itemName);
    if (itemIndexFound !== -1) {
      if (items[itemIndexFound].number + value <= 0) {
        setItems(prevItems => {
          const updatedItems = [...prevItems];
          updatedItems.splice(itemIndexFound, 1);

          return updatedItems;
        });
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

  return (
    <BasketContext.Provider value={{ items, updateItem }}>
      {children}
    </BasketContext.Provider>
  );
};

export default BasketContext;
