'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Breakpoint = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface IsMobileContextType {
    isMobile: boolean;
    breakpoint: Breakpoint;
    getBreakpointValue: () => number;
}

const IsMobileContext = createContext<IsMobileContextType | undefined>(undefined);

export const useIsMobile = (): IsMobileContextType => {
  const context = useContext(IsMobileContext);
  if (!context) {
    throw new Error('useIsMobile must be used within a IsMobileProvider');
  }

  return context;
};

interface IsMobileProviderProps {
    children: ReactNode;
}

export const IsMobileProvider: React.FC<IsMobileProviderProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('xl');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);

      let breakpointInfix: Breakpoint = 'xl';
      if (window.innerWidth < 480) {
        breakpointInfix = 'xxs';
      } else if (window.innerWidth < 576) {
        breakpointInfix = 'xs';
      } else if (window.innerWidth < 768) {
        breakpointInfix = 'sm';
      } else if (window.innerWidth < 992) {
        breakpointInfix = 'md';
      } else if (window.innerWidth < 1200) {
        breakpointInfix = 'lg';
      }

      setBreakpoint(breakpointInfix);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };

  }, []);

  const getBreakpointValue = (): number => {
    switch (breakpoint) {
    case 'xs':
      return 0;
    case 'sm':
      return 1;
    case 'md':
      return 2;
    case 'lg':
      return 3;
    default:
      return 4;
    }
  };

  return (
    <IsMobileContext.Provider value={{ isMobile, breakpoint, getBreakpointValue }}>
      {children}
    </IsMobileContext.Provider>
  );
};
