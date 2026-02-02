import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Order',
  description: 'Complete your order and checkout securely',
  openGraph: {
    title: 'Order | Template Web App',
    description: 'Complete your order',
  },
};

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
