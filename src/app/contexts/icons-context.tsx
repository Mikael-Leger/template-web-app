'use client';

import React, { createContext, ReactNode, useContext } from 'react';
import {
  BsArrowRight,
  BsArrowLeft,
  BsBasket,
  BsChevronLeft,
  BsChevronRight,
  BsFacebook,
  BsInstagram,
  BsList,
  BsStars,
  BsQuote,
  BsDash,
  BsPlusLg,
  BsHouseDoor,
  BsSearch,
  BsTelephone
} from 'react-icons/bs';

interface IconsContextType {
  icons: object;
}

const IconsContext = createContext<IconsContextType | undefined>(undefined);

export const useIcons = (): IconsContextType => {
  const context = useContext(IconsContext);
  if (!context) {
    throw new Error('useIcons must be used within a IconsProvider');
  }

  return context;
};

interface IconsProviderProps {
  children: ReactNode;
}

export const IconsProvider: React.FC<IconsProviderProps> = ({ children }) => {
  
  const getUsedIcons = () => {
    return {
      BsArrowRight,
      BsArrowLeft,
      BsBasket,
      BsChevronLeft,
      BsChevronRight,
      BsFacebook,
      BsInstagram,
      BsList,
      BsStars,
      BsQuote,
      BsDash,
      BsPlusLg,
      BsHouseDoor,
      BsSearch,
      BsTelephone
    };
  };

  return (
    <IconsContext.Provider value={{ icons: getUsedIcons() }}>
      {children}
    </IconsContext.Provider>
  );
};