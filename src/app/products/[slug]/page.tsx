'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

import { findProductBySlug, findRelatedProducts } from '@/app/services/product-service';
import ProductDetails from '@/app/components/product-details/product-details';
import PageContent from '@/app/components/page-content/page-content';

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;

  const product = useMemo(() => findProductBySlug(slug), [slug]);
  const relatedProducts = useMemo(
    () => (product ? findRelatedProducts(product, 4) : []),
    [product]
  );

  if (!product) {
    return (
      <PageContent>
        <div className="product-not-found">
          <h1>Product Not Found</h1>
          <p>The product you&apos;re looking for doesn&apos;t exist.</p>
          <a href="/products">Back to Products</a>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <ProductDetails product={product} relatedProducts={relatedProducts} />
    </PageContent>
  );
}
