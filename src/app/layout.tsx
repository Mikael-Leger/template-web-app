import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import React from 'react';

import { IsMobileProvider } from './contexts/mobile-context';
import { LanguageProvider } from './contexts/language-context';
import { BasketProvider } from './contexts/basket-context';
import { IconsProvider } from './contexts/icons-context';
import { SidebarProvider } from './contexts/sidebar-context';
import Navbar from './components/navbar/navbar';
import PageContent from './components/page-content/page-content';
import Basket from './components/basket/basket';
import Footer from './components/footer/footer';
import ErrorBoundary from './components/error-boundary/error-boundary';

import './globals.scss';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Template Web App',
    template: '%s | Template Web App',
  },
  description: 'A modern e-commerce web application template built with Next.js, React, and TypeScript',
  keywords: ['e-commerce', 'web app', 'Next.js', 'React', 'TypeScript', 'template'],
  authors: [{ name: 'Template Web App' }],
  creator: 'Template Web App',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Template Web App',
    title: 'Template Web App',
    description: 'A modern e-commerce web application template built with Next.js, React, and TypeScript',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Template Web App',
    description: 'A modern e-commerce web application template built with Next.js, React, and TypeScript',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a href='#main-content' className='skip-to-content'>
          Skip to main content
        </a>
        <IsMobileProvider>
          <LanguageProvider>
            <IconsProvider>
              <BasketProvider>
                <SidebarProvider>
                  <Navbar/>
                  <ErrorBoundary>
                    <PageContent>
                      {children}
                    </PageContent>
                  </ErrorBoundary>
                  <Basket/>
                  <Footer/>
                </SidebarProvider>
              </BasketProvider>
            </IconsProvider>
          </LanguageProvider>
        </IsMobileProvider>
      </body>
    </html>
  );
}
