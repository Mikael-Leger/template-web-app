'use client';

import React from 'react';

import Catalog from '../components/catalog/catalog';
import Card from '../components/card/card';
import { Testimonials } from '../components/testimonial/testimonial';

export default function ProductsPage() {

  return (
    <div className='products w-full h-full flex'>
      <Card size='big' padding='none'>
        <Catalog/>
        <Testimonials delayMs={2500}/>
      </Card>
    </div>
  );
}
