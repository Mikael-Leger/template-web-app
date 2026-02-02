import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our selection of delicious bakery products including baguettes, croissants, cookies and more',
  openGraph: {
    title: 'Products | Template Web App',
    description: 'Browse our selection of delicious bakery products',
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
