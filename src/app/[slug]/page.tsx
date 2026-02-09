'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

import PageRenderer from '../page-builder/renderer/page-renderer';
import { PageConfig } from '../page-builder/interfaces/page-config.interface';
import { getAllPages } from '../page-builder/services/page-service';

export default function DynamicPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? '';

  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadPage() {
      setLoading(true);

      const allPages = await getAllPages();
      const page = allPages.find((p) => p.slug === slug);

      if (page) {
        setPageConfig(page);
      } else {
        setNotFound(true);
      }

      setLoading(false);
    }

    loadPage();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (notFound || !pageConfig) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', gap: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>404</h1>
        <p>Page not found</p>
      </div>
    );
  }

  return <PageRenderer config={pageConfig} />;
}
