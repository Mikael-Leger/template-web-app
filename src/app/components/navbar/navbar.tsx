'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BsList } from 'react-icons/bs';

import { NavbarItem } from '@/app/interfaces/navbar.interface';
import navbarItemsJson from '@/app/data/navbar-items.json'; 
import languageItemsJson from '@/app/data/languages.json'; 
import { LanguageItem } from '@/app/interfaces/language.interface';
import { useIsMobile } from '@/app/contexts/mobile-context';

import './navbar.scss';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const {isMobile} = useIsMobile();
  
  const [language, setLanguage] = useState<string>('fr');
  
  const navbarItems: NavbarItem[] = navbarItemsJson;

  const languageItems: LanguageItem[] = languageItemsJson;

  const handleItemClick = (url: string) => {
    router.push(url);
  };

  const handleFlagClick = (itemValue: string) => {
    setLanguage(itemValue);
  };

  const renderNavbarItem = (item: NavbarItem) => {
    return (
      <div
        className={`navbar-content-title ${isMobile ? 'h-[70%]' : 'h-full'} flex items-center ${item.main && 'main'} ${item.url === pathname && 'active'}`}
        onClick={() => handleItemClick(item.url)}
        key={item.title}>
        {item.image ? <img className='h-full' src={item.image} alt={item.title}/> : item.title}
      </div>
    );
  };

  const renderNavbarItems = () => {
    const mainItem = navbarItems.find(navbarItem => navbarItem.main);

    return isMobile
      ? (
        <>
          <BsList size={48}/>
          {mainItem && renderNavbarItem(mainItem)}
        </>
      )
      : navbarItems.map(item => renderNavbarItem(item));
  };

  const renderFlagItem = (item: LanguageItem) => {
    return (
      <div
        className={`navbar-flags-flag ${item.value === language && 'active'}`}
        onClick={() => handleFlagClick(item.value)}
        key={item.value}>
        {item.value.toUpperCase()}
      </div>
    );
  };

  const renderFlagItems = () => {
    const currentItem = languageItems.find(languageItem => languageItem.value === language) ?? languageItems[0];

    return isMobile
      ? renderFlagItem(currentItem)
      : languageItems.map(item => renderFlagItem(item));
  };

  return (
    <div className='navbar'>
      <div className='navbar-content h-full w-full flex flex-row justify-center items-center'>
        {renderNavbarItems()}
        {renderFlagItems()}
      </div>
    </div>
  );
}
