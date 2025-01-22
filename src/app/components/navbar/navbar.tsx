'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { NavbarItem } from '@/app/interfaces/navbar.interface';
import navbarItemsJson from '@/app/data/navbar-items.json'; 
import languageItemsJson from '@/app/data/languages.json'; 
import { LanguageItem } from '@/app/interfaces/language.interface';

import './navbar.scss';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  
  const [language, setLanguage] = useState<string>('FR');
  
  const navbarItems: NavbarItem[] = navbarItemsJson;

  const languageItems: LanguageItem[] = languageItemsJson;

  const handleItemClick = (url: string) => {
    router.push(url);
  };

  const handleFlagClick = (itemValue: string) => {
    setLanguage(itemValue);
  };

  return (
    <div className='navbar'>
      <div className='navbar-content h-full w-full flex flex-row justify-center items-center'>
        {navbarItems.map(item => (
          <div
            className={`navbar-content-title h-full flex items-center ${item.main && 'main'} ${item.url === pathname && 'active'}`}
            onClick={() => handleItemClick(item.url)}
            key={item.title}>
            {item.image ? <img className='h-full' src={item.image} alt={item.title}/> : item.title}
          </div>
        ))}
      </div>
      <div className='navbar-flags h-full flex flex-row justify-center items-center absolute top-0'>
        {languageItems.map(item => (
          <div
            className={`navbar-flags-flag ${item.value === language && 'active'}`}
            onClick={() => handleFlagClick(item.value)}
            key={item.value}>
            {item.value}
          </div>
        ))}
      </div>
    </div>
  );
}
