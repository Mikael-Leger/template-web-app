'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BsFacebook, BsInstagram } from 'react-icons/bs';

import { FooterItem } from '@/app/interfaces/footer.interface';
import footerItemsJson from '@/app/data/footer-items.json'; 
import { useIsMobile } from '@/app/contexts/mobile-context';

import './footer.scss';

export default function Footer() {
  const router = useRouter();
  const {isMobile} = useIsMobile();

  const lastItemIsMedia = useRef<boolean>(false);
  
  const footerItems: FooterItem[] = footerItemsJson;

  const handleItemClick = (url: string) => {
    router.push(url);
  };

  const renderMediaItem = (item: FooterItem) => {
    if (item.image) {
      return <img className='h-full' src={item.image} alt={item.title}/>; 
    }
    if (item.title === 'Facebook') {
      return <BsFacebook size={24}/>; 
    }
    if (item.title === 'Instagram') {
      return <BsInstagram size={24}/>; 
    }

    return item.title;
  };

  const renderFooterItem = (item: FooterItem, index: number) => {
    return (
      <div className={`footer-content-container flex flex-row justify-center items-center ${isMobile && !item.media && 'w-full'}`}
        key={item.title}>
        {item.url && item.url.includes('http') ? (
          <a
            target='_blank'
            className={`footer-content-container-title h-full flex items-center ${item.url && 'clickable'}`}
            href={item.url} rel='noreferrer'>
            {renderMediaItem(item)}
          </a>
        ) : (
          <div
            className={`footer-content-container-title h-full flex items-center ${item.url && 'clickable'}`}
            onClick={() => item.url && handleItemClick(item.url)}>
            {renderMediaItem(item)}
          </div>

        )}
        {!isMobile && lastItemIsMedia.current && index < footerItems.length - 1 && (
          <div className='footer-content-container-separator flex items-center'>
        •
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='footer w-full flex flex-col justify-center'>
      <div className='footer-content h-full w-full flex flex-row flex-wrap justify-center items-center'>
        {footerItems.map((item, index) => {
          const footerItem = renderFooterItem(item, index);

          lastItemIsMedia.current = item.media as boolean;

          return footerItem;
        })}
      </div>
    </div>
  );
}
