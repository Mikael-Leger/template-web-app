'use client';

import React from 'react';
import { useBasket } from '../contexts/basket-context';
import { useRouter } from 'next/navigation';

import productsJson from '@/app/data/products.json';
import { ProductItem } from '../interfaces/product.interface';
import Sheet from '../components/sheet/sheet';
import { capitalizeFirstLetter } from '../services/formatter';
import Card from '../components/card/card';
import PageBackground from '../components/page-background/page-background';
import Button from '../components/button/button';
import Layout from '../components/layout/layout';

export default function OrderPage() {
  const router = useRouter();

  const {items, getItem, clearItems, deleteItem} = useBasket();

  const getProductFromName = (productName: string) => {
    const productFound = productsJson.find(product => product.title === productName);
    if (!productFound) {
      throw new Error(`Product with name *${productName}* not found`);
    }

    return productFound;
  };

  const getOrderItemFromName = (productName: string) => {
    const item = getItem(productName);
    const product: ProductItem = getProductFromName(productName);

    if (!item || !product) return [];

    const orderItem = [];
    orderItem.push({title: capitalizeFirstLetter(product.title)});
    orderItem.push({title: item.number, editable: true});
    if (product.price) {
      orderItem.push({title: `${product.price.toFixed(2)}€`});
      orderItem.push({title: `${(product.price * item.number).toFixed(2)}€`});
    }
    orderItem.push({icon: 'BsTrash3', onClick:(() => deleteItem(productName))});

    return orderItem;
  };

  const getTotalPrice = () => {
    return items.reduce((acc, item) =>
      acc + (getProductFromName(item.productName).price * item.number), 0)
      .toFixed(2);
  };

  const getAllProducts = () => {
    return items.map(item => getOrderItemFromName(item.productName));
  };

  const routeToProducts = () => {
    router.push('/products');
  };

  const showPayment = () => {
    // router.push('/routeToPayment');
  };

  const clearAllProducts = () => {
    clearItems();
  };

  return (
    <div className='order flex flex-col'>
      <PageBackground imagePath='images/order/sample_1.png'/>
      <Card size='big'>
        <Layout
          className={'justify-end flex-gap items-center'}
          orientation='col'
          items={[
            {
              node:
              <Sheet
                items={getAllProducts()}
                headers={['Nom', 'Nombre', 'Prix', 'Prix total', 'Actions']}
                footers={[`Prix total de la commande : ${getTotalPrice()}€`]}
                colWidth={15}
                width={50}/>
            },
            {
              node:
              <Layout
                className={'justify-end flex-gap'}
                items={[
                  {
                    node: <Button title={'Ajouter d\'autres produits'} type='info' onClick={routeToProducts}/>
                  },
                  {
                    node: <Button title={'Tout supprimer'} type='error' onClick={clearAllProducts}/>
                  },
                  {
                    node: <Button title={'Valider et payer'} type='success' onClick={showPayment}/>
                  }
                ]}/>
            }
          ]}/>
      </Card>
    </div>
  );
}
