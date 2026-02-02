import React from 'react';
import { Metadata } from 'next';
import './admin.scss';

export const metadata: Metadata = {
  title: 'Admin - Page Builder',
  description: 'Manage and edit your pages',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='admin-layout-wrapper'>
      {children}
    </div>
  );
}
