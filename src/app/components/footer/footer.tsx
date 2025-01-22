'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BsFacebook, BsInstagram } from 'react-icons/bs';

import { FooterItem } from '@/app/interfaces/footer.interface';
import footerItemsJson from '@/app/data/footer-items.json'; 

import './footer.scss';

export default function Footer() {
  const router = useRouter();
  
  const footerItems: FooterItem[] = footerItemsJson;

  const handleItemClick = (url: string) => {
    router.push(url);
  };

  const renderItem = (item: FooterItem) => {
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

  return (
    <div className='footer w-full absolute bottom-0'>
      <div className='footer-content h-full w-full flex flex-row justify-center items-center'>
        {footerItems.map((item, index) => (
          <div className='footer-content-container flex flex-row justify-center items-center'
            key={item.title}>
            {item.url && item.url.includes('http') ? (
              <a
                target='_blank'
                className={`footer-content-container-title h-full flex items-center ${item.url && 'clickable'}`}
                href={item.url} rel='noreferrer'>
                {renderItem(item)}
              </a>
            ) : (
              <div
                className={`footer-content-container-title h-full flex items-center ${item.url && 'clickable'}`}
                onClick={() => item.url && handleItemClick(item.url)}>
                {renderItem(item)}
              </div>

            )}
            {!item.media && index < footerItems.length - 1 && (
              <div className='footer-content-container-separator flex items-center'>
                •
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
