'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BsList } from 'react-icons/bs';

import { NavbarItem } from '@/app/interfaces/navbar.interface';
import navbarItemsJson from '@/app/data/navbar-items.json'; 
import languageItemsJson from '@/app/data/languages.json'; 
import { LanguageItem } from '@/app/interfaces/language.interface';
import { useIsMobile } from '@/app/contexts/mobile-context';
import DynamicIcon from '../dynamic-icon/dynamic-icon';
import Separator from '../separator/separator';

import './navbar.scss';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface NavbarProps {
  marginTop: number;
}

export default function Navbar({marginTop}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {isMobile} = useIsMobile();
  
  const [language, setLanguage] = useState<string>('fr');
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(false);

  const navbarRef = useRef<HTMLDivElement | null>(null);
  
  const navbarItems: NavbarItem[] = navbarItemsJson;

  const languageItems: LanguageItem[] = languageItemsJson;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);

      const navbarDefaultHeight = navbarRef.current?.offsetHeight ?? 0;
      const heightRes = marginTop + 30 - (navbarDefaultHeight);
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: navbarRef.current,
          start: `${heightRes} top`,
          end: `${heightRes + (navbarDefaultHeight / 2)} top`,
          scrub: true
        },
        
      });

      tl.to(navbarRef.current, {
        height: `${(navbarDefaultHeight) / 2}`
      }, 0);

      tl.to('.navbar-content-title', {
        fontSize: '-=6'
      }, 0);
    });

    return () => ctx.revert();
  }, []);

  const handleItemClick = (url: string) => {
    router.push(url);
    setIsSidebarVisible(false);
  };

  const handleFlagClick = (itemValue: string) => {
    setLanguage(itemValue);
  };

  const getNavbarItemHeight = (sidebar: boolean) => {
    if (sidebar) return undefined;

    return isMobile ? 'h-[70%]' : 'h-full';
  };

  const renderNavbarItem = (item: NavbarItem, sidebar: boolean = false) => {
    return (
      <React.Fragment key={item.title}>
        <div
          className={`navbar${sidebar ? '-sidebar' : ''}-content-title ${getNavbarItemHeight(sidebar)} flex items-center ${item.main && 'main'} ${item.url === pathname && 'active'}`}
          onClick={() => handleItemClick(item.url)}
          key={item.title}>
          {sidebar && item.icon && <DynamicIcon iconName={item.icon}/>}
          {item.image ? <img className='h-full' src={item.image} alt={item.title}/> : item.title}
        </div>
        {sidebar && item.separator && <Separator/>}
      </React.Fragment>
    );
  };

  const renderNavbarItems = () => {
    const mainItem = navbarItems.find(navbarItem => navbarItem.main);

    return isMobile
      ? (
        <>
          <div className='navbar-burger' onClick={() => setIsSidebarVisible(true)}>
            <BsList size={48}/>
          </div>
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

  const renderFlagItems = (sidebar = false) => {
    if (!isMobile || sidebar) return languageItems.map(item => renderFlagItem(item));
  };

  const renderSidebarContent = () => {
    const mainItem = navbarItems.find(navbarItem => navbarItem.main);

    return (
      <div
        className='navbar-sidebar-content flex flex-col fixed top-0 left-0'
        style={{
          left: isSidebarVisible ? undefined : '-120%'
        }}>
        {mainItem && renderNavbarItem(mainItem, true)}
        <Separator height={2} width={80}/>
        <div className='navbar-sidebar-content-items flex flex-col'>
          {navbarItems
            .filter(item => !item.main)
            .map(item => renderNavbarItem(item, true))}
        </div>
        <div className='navbar-sidebar-content-bottom absolute bottom-0 flex flex-row justify-center w-full'>
          {renderFlagItems(true)}
        </div>
      </div>
    );
  };

  const renderSidebar = () => {
    if (!isMobile) return;

    return (
      <div className='navbar-sidebar'>
        <div
          className='navbar-sidebar-shadow fixed top-0 left-0 h-full w-full'
          style={{
            width: isSidebarVisible ? undefined : '0',
            opacity: isSidebarVisible ? undefined : '0'
          }}
          onClick={() => setIsSidebarVisible(false)}/>
        {renderSidebarContent()}
      </div>
    );
  };

  const getJustifyStyle = () => {
    return (isMobile) ? 'justify-start' : 'justify-center';
  };

  return (
    <div className='navbar w-full fixed top-0' ref={navbarRef}>
      <div className={`navbar-content h-full w-full flex flex-row ${getJustifyStyle()} items-center`}>
        {renderNavbarItems()}
      </div>
      {renderSidebar()}
    </div>
  );
}
