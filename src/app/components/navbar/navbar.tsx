'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BsList } from 'react-icons/bs';

import { NavbarItem, NavbarConfig, NavbarGroup } from '@/app/interfaces/navbar.interface';
import languageItemsJson from '@/app/data/languages.json';
import { LanguageItem } from '@/app/interfaces/language.interface';
import { useIsMobile } from '@/app/contexts/mobile-context';
import DynamicIcon from '../dynamic-icon/dynamic-icon';
import Separator from '../separator/separator';
import { useSidebar } from '@/app/contexts/sidebar-context';
import { useLanguage, LanguageType } from '@/app/contexts/language-context';
import { getNavbarConfig, getGroupItems } from '@/app/services/navbar-service';

import './navbar.scss';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile } = useIsMobile();
  const { isSidebarVisible, setIsSidebarVisible } = useSidebar();
  const { language, setLanguage } = useLanguage();

  const navbarRef = useRef<HTMLDivElement | null>(null);
  const [config, setConfig] = useState<NavbarConfig | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  const languageItems = languageItemsJson as LanguageItem[];

  // Load config on mount
  useEffect(() => {
    setConfig(getNavbarConfig());
  }, []);

  // Handle scroll effects
  const handleScroll = useCallback(() => {
    if (!config) return;

    const currentScrollY = window.scrollY;
    const threshold = config.behavior.scrollThreshold;
    const scrollEffect = config.behavior.scrollEffect;

    // Determine if scrolled past threshold
    const scrolledPastThreshold = currentScrollY > threshold;
    setIsScrolled(scrolledPastThreshold);

    // Handle hide-on-scroll effect
    if (scrollEffect === 'hide-on-scroll') {
      if (currentScrollY > lastScrollY.current && currentScrollY > threshold) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
    }

    lastScrollY.current = currentScrollY;
  }, [config]);

  useEffect(() => {
    if (!config?.behavior.sticky) return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [config, handleScroll]);

  // Apply CSS variables based on config
  useEffect(() => {
    if (!config || !navbarRef.current) return;

    const navbar = navbarRef.current;
    const { appearance, typography } = config;

    // Set CSS variables
    navbar.style.setProperty('--navbar-height', appearance.height);
    navbar.style.setProperty('--navbar-height-scrolled', appearance.heightScrolled);
    navbar.style.setProperty('--navbar-bg', appearance.backgroundColor);
    navbar.style.setProperty('--navbar-bg-scrolled', appearance.backgroundColorScrolled);
    navbar.style.setProperty('--navbar-text', appearance.textColor);
    navbar.style.setProperty('--navbar-text-scrolled', appearance.textColorScrolled);
    navbar.style.setProperty('--navbar-active', appearance.activeColor);
    navbar.style.setProperty('--navbar-hover', appearance.hoverColor);
    navbar.style.setProperty('--navbar-font-size', typography.fontSize);
    navbar.style.setProperty('--navbar-font-weight', typography.fontWeight);
    navbar.style.setProperty('--navbar-text-transform', typography.textTransform);
    navbar.style.setProperty('--navbar-letter-spacing', typography.letterSpacing);
    navbar.style.setProperty('--navbar-logo-height', config.logo.height);
    navbar.style.setProperty('--navbar-container-gap', config.containerGap || '24px');
  }, [config]);

  if (!config) return null;

  const handleItemClick = (url: string) => {
    router.push(url);
    setIsSidebarVisible(false);
  };

  const handleFlagClick = (itemValue: LanguageType) => {
    setLanguage(itemValue);
  };

  const getScrollEffectClasses = (): string => {
    const classes: string[] = [];
    const effect = config.behavior.scrollEffect;

    if (isScrolled) {
      classes.push('navbar--scrolled');

      if (effect === 'shrink' || effect === 'shrink-and-color') {
        classes.push('navbar--shrink');
      }
      if (effect === 'color-change' || effect === 'shrink-and-color') {
        classes.push('navbar--color-change');
      }
    }

    if (isHidden && effect === 'hide-on-scroll') {
      classes.push('navbar--hidden');
    }

    return classes.join(' ');
  };

  const getAppearanceClasses = (): string => {
    const classes: string[] = [];
    const { appearance, behavior } = config;

    if (appearance.backdropBlur) classes.push('navbar--blur');
    if (appearance.borderBottom) classes.push('navbar--border');
    if (appearance.shadow !== 'none') classes.push(`navbar--shadow-${appearance.shadow}`);
    if (behavior.sticky) classes.push('navbar--sticky');

    return classes.join(' ');
  };

  const renderLogo = () => {
    const { logo } = config;

    if (logo.type === 'image' && logo.imageUrl) {
      return (
        <div
          className="navbar-logo cursor-pointer"
          onClick={() => handleItemClick('/')}
        >
          <img src={logo.imageUrl} alt={logo.text || 'Logo'} />
        </div>
      );
    }

    return (
      <div
        className="navbar-logo navbar-logo--text cursor-pointer"
        onClick={() => handleItemClick('/')}
      >
        {logo.text}
      </div>
    );
  };

  const renderNavbarItem = (item: NavbarItem, sidebar: boolean = false) => {
    const isActive = item.url === pathname;
    const isMain = item.main;

    if (isMain && !sidebar) {
      return (
        <React.Fragment key={item.id}>
          {renderLogo()}
        </React.Fragment>
      );
    }

    return (
      <React.Fragment key={item.id}>
        <div
          className={`navbar${sidebar ? '-sidebar' : ''}-item ${isMain ? 'main' : ''} ${isActive ? 'active' : ''}`}
          onClick={() => handleItemClick(item.url)}
        >
          {sidebar && item.icon && <DynamicIcon iconName={item.icon} />}
          {item.image ? (
            <img className="navbar-item-image" src={item.image} alt={item.title} />
          ) : (
            item.title
          )}
        </div>
        {sidebar && item.separator && <Separator />}
      </React.Fragment>
    );
  };

  const renderGroup = (group: NavbarGroup) => {
    const items = getGroupItems(config, group.id);

    return (
      <div
        key={group.id}
        className="navbar-group"
        style={{
          justifyContent: group.justify,
          gap: group.gap || '8px',
        }}
      >
        {items.map((item) => renderNavbarItem(item))}
      </div>
    );
  };

  const renderNavbarContent = () => {
    const sortedGroups = [...config.groups].sort((a, b) => a.order - b.order);

    return isMobile ? (
      <>
        <div className="navbar-burger" onClick={() => setIsSidebarVisible(true)}>
          <BsList size={32} />
        </div>
        {/* On mobile, just show the logo */}
        {renderLogo()}
      </>
    ) : (
      <div
        className="navbar-groups"
        style={{
          justifyContent: config.containerJustify,
          gap: config.containerGap || '24px',
        }}
      >
        {sortedGroups.map((group) => renderGroup(group))}
      </div>
    );
  };

  const renderFlagItem = (item: LanguageItem) => {
    return (
      <div
        className={`navbar-flags-flag ${item.value === language ? 'active' : ''}`}
        onClick={() => handleFlagClick(item.value)}
        key={item.value}
      >
        {item.value.toUpperCase()}
      </div>
    );
  };

  const renderFlagItems = (sidebar = false) => {
    if (!isMobile || sidebar) return languageItems.map((item) => renderFlagItem(item));
    return null;
  };

  const renderSidebarContent = () => {
    const allItems = config.items;
    const mainItem = allItems.find((item) => item.main);

    return (
      <div
        className="navbar-sidebar-content"
        style={{ transform: isSidebarVisible ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        {mainItem && renderNavbarItem(mainItem, true)}
        <Separator height={2} width={80} />
        <div className="navbar-sidebar-items">
          {allItems
            .filter((item) => !item.main)
            .sort((a, b) => a.order - b.order)
            .map((item) => renderNavbarItem(item, true))}
        </div>
        <div className="navbar-sidebar-bottom">
          {renderFlagItems(true)}
        </div>
      </div>
    );
  };

  const renderSidebar = () => {
    if (!isMobile) return null;

    return (
      <div className={`navbar-sidebar ${isSidebarVisible ? 'visible' : ''}`}>
        <div
          className="navbar-sidebar-shadow"
          style={{ opacity: isSidebarVisible ? 1 : 0, pointerEvents: isSidebarVisible ? 'auto' : 'none' }}
          onClick={() => setIsSidebarVisible(false)}
        />
        {renderSidebarContent()}
      </div>
    );
  };

  return (
    <nav
      className={`navbar ${getAppearanceClasses()} ${getScrollEffectClasses()}`}
      ref={navbarRef}
    >
      <div className={`navbar-content ${isMobile ? 'navbar-content--mobile' : ''}`}>
        {renderNavbarContent()}
        {!isMobile && <div className="navbar-flags">{renderFlagItems()}</div>}
      </div>
      {renderSidebar()}
    </nav>
  );
}
