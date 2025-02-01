'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';

import languagesTexts from '@/app/data/languages_texts.json';
import LanguageText from '@/app/interfaces/language-text.interface';

export type LanguageType = 'en' | 'baguette';

interface LanguageContextType {
  language: LanguageType;
  setLanguage: (_value: LanguageType) => void;
  getTextByComponent: (_component: string, _index: number) => string;
  getText: (_index: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = (component?: string): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  if (component === undefined) return context;

  context.getText = (index: number) => {
    return context.getTextByComponent(component, index);
  };

  return context;
};

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<LanguageType>('en');
  const [texts, setTexts] = useState<LanguageText[]>([]);

  useEffect(() => {
    setTexts(languagesTexts);

    const localLanguage = localStorage.getItem('lang') as LanguageType;
    if (localLanguage !== null) {
      setLanguage(localLanguage);

      return;
    }

    const navigatorLanguage = navigator.language;
    if (navigatorLanguage !== null && navigatorLanguage.includes('fr')) {
      setLanguage('baguette');

      return;
    }
  }, []);

  const getTextByComponent = (component: string, index: number) => {
    return texts.find(text => text.component === component)?.texts[index][language] ?? '';
  };

  useEffect(() => {
    localStorage.setItem('lang', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, getTextByComponent, getText: (index: number) => '' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
