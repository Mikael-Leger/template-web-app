import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with us. Send us a message and we will respond as soon as possible',
  openGraph: {
    title: 'Contact | Template Web App',
    description: 'Get in touch with us',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
