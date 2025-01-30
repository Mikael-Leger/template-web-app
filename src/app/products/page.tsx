'use client';

import React from 'react';

import Catalog from '../components/catalog/catalog';
import Card from '../components/card/card';
import { Testimonials } from '../components/testimonial/testimonial';
import Title from '../components/title/title';
import DescriptionAndImage from '../components/description-and-image/description-and-image';

export default function ProductsPage() {

  return (
    <div className='products w-full h-full flex'>
      <Card size='big' padding='none'>
        <Catalog/>
      </Card>
      <Card size='big' padding='none'>
        <Testimonials delayMs={2500}/>
        <Title
          text='Text top and image'
          orientation='center'
          size='medium'/>
        <DescriptionAndImage
          text='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
          orientation='center'
          axis='col'
          images={[{path: '/images/sample_1.png'}]}/>
      </Card>
    </div>
  );
}
