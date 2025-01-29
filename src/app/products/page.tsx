'use client';

import React from 'react';
import Catalog from '../components/catalog/catalog';
import Card from '../components/card/card';

export default function ProductsPage() {
  return (
    <div className='products w-full h-full flex'>
      <Card size='big' padding='none'>
        <Catalog/>
      </Card>
    </div>
  );
}
