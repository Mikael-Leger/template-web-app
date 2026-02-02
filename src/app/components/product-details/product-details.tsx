'use client';

import React from 'react';
import Link from 'next/link';

import { ProductItem } from '@/app/interfaces/product.interface';
import { capitalizeFirstLetter, slugify } from '@/app/services/formatter';
import { useBasket } from '@/app/contexts/basket-context';
import Price from '../price/price';
import Button from '../button/button';
import Product from '../product/product';
import DynamicIcon from '../dynamic-icon/dynamic-icon';

import './product-details.scss';

interface ProductDetailsProps {
  product: ProductItem;
  relatedProducts: ProductItem[];
}

export default function ProductDetails({ product, relatedProducts }: ProductDetailsProps) {
  const { addToBasket } = useBasket();

  const handleAddToCart = () => {
    addToBasket(product.title);
  };

  return (
    <div className="product-details">
      {/* Breadcrumb */}
      <nav className="product-details-breadcrumb">
        <Link href="/">Home</Link>
        <span className="product-details-breadcrumb-separator">/</span>
        <Link href="/products">Products</Link>
        <span className="product-details-breadcrumb-separator">/</span>
        <span className="product-details-breadcrumb-current">
          {capitalizeFirstLetter(product.title)}
        </span>
      </nav>

      {/* Main content */}
      <div className="product-details-main">
        {/* Image section */}
        <div className="product-details-image-section">
          <div className="product-details-image">
            {product.image && (
              <img
                src={`/images/catalog/${product.image}`}
                alt={product.title}
              />
            )}
            {product.tags?.includes('nouveau') && (
              <span className="product-details-badge">NEW</span>
            )}
          </div>
        </div>

        {/* Info section */}
        <div className="product-details-info">
          <h1 className="product-details-title">
            {capitalizeFirstLetter(product.title)}
          </h1>

          <div className="product-details-price">
            {product.price && (
              <Price price={product.price} priceByDosage={product.priceByDosage} />
            )}
          </div>

          {product.quantity && (
            <p className="product-details-quantity">{product.quantity}</p>
          )}

          {product.short_description && (
            <p className="product-details-description">
              {product.short_description}
            </p>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="product-details-tags">
              {product.tags.map((tag) => (
                <span key={tag} className="product-details-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Add to cart */}
          <div className="product-details-actions">
            <Button
              title="Add to Cart"
              type="primary"
              size="big"
              onClick={handleAddToCart}
              icon={{
                node: <DynamicIcon iconName="BsCart" size={20} />,
              }}
            />
          </div>
        </div>
      </div>

      {/* Long description */}
      {product.long_description && (
        <div className="product-details-long-description">
          <h2>Description</h2>
          <p>{product.long_description}</p>
        </div>
      )}

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="product-details-related">
          <h2>Related Products</h2>
          <div className="product-details-related-grid">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.title}
                href={`/products/${slugify(relatedProduct.title)}`}
                className="product-details-related-link"
              >
                <Product item={relatedProduct} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
