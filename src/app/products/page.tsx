'use client';

import React, { useState, useEffect } from 'react';

import PageRenderer from '../page-builder/renderer/page-renderer';
import { PageConfig } from '../page-builder/interfaces/page-config.interface';
import { getAllPages } from '../page-builder/services/page-service';

export default function ProductsPage() {
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      const allPages = await getAllPages();
      const page = allPages.find((p) => p.slug === 'products');

      if (page) {
        setPageConfig(page);
      }

      setLoading(false);
    }

    loadPage();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!pageConfig) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', gap: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>No Products Page</h1>
        <p>Create a page with the slug &quot;products&quot; in the editor.</p>
      </div>
    );
  }

  return <PageRenderer config={pageConfig} />;
}
