import React, { useEffect, useState } from 'react';
import gsap from 'gsap';

import productsJson from '@/app/data/products.json';
import { ProductItem } from '@/app/interfaces/product.interface';
import Product from '../product/product';
import Button from '../button/button';
import Separator from '../separator/separator';
import { useBasket } from '@/app/contexts/basket-context';

import './catalog.scss';

export default function Catalog() {
  const {updateItem} = useBasket();

  const [itemsFiltered, setItemsFiltered] = useState<ProductItem[]>([]);

  const productItems: ProductItem[] = productsJson.sort((a, b) => (a.tags.includes('new') ? -1 : b.tags.includes('new') ? 1 : 0));

  useEffect(() => {
    setItemsFiltered(productItems);
  }, []);

  useEffect(() => {
    if (itemsFiltered.length === 0) return;

    refreshAnimation();
  }, [itemsFiltered]);

  const onBasketChange = (productName: string, value: number) => {
    updateItem(productName, value);
  };

  const refreshAnimation = () => {
    gsap.fromTo('.product', {
      opacity: 0
    },
    {
      opacity: 1
    });
  };

  const filterItemsByTag = (tag: string = '') => {
    if (tag === '') {
      setItemsFiltered(productItems);

      return;

    }

    const itemsByTag = productItems.filter(productItem => productItem.tags?.includes(tag));
    setItemsFiltered(itemsByTag);
  };

  const getAllTags = () => {
    return [...new Set(productItems.flatMap(item => item.tags || []))].sort((a, b) => (a === 'new' ? -1 : b === 'new' ? 1 : 0));
  };

  return (
    <div className='catalog flex flex-col'>
      <div className='catalog-filters flex flex-row flex-wrap justify-center items-center'>
        <div className='catalog-filters-tags flex flex-wrap justify-center'>
          <Button title={'All'} onClick={() => filterItemsByTag()}/>
          {getAllTags().map(tag => (
            <Button title={tag} onClick={() => filterItemsByTag(tag)} key={tag}/>
          ))}
        </div>
      </div>
      <Separator height={2}/>
      <div className='catalog-products flex flex-row flex-wrap justify-center'>
        {itemsFiltered.map(productItem => (
          <Product
            item={productItem}
            key={productItem.title}
            onBasketChange={onBasketChange}/>
        ))}
      </div>
      <Separator height={2}/>
    </div>
  );
}
