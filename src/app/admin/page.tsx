'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BsPlus, BsPencil, BsTrash, BsEye, BsGrid, BsFileEarmarkText, BsBoxSeam, BsChatQuote } from 'react-icons/bs';

import { PageConfig } from '../page-builder/interfaces/page-config.interface';
import { getAllPages, deletePage, createPage } from '../page-builder/services/page-service';
import './admin.scss';

export default function AdminDashboard() {
  const [pages, setPages] = useState<PageConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');

  const loadPages = useCallback(async () => {
    setLoading(true);

    try {
      const allPages = await getAllPages();

      setPages(allPages);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    await deletePage(pageId);
    loadPages();
  };

  const handleCreatePage = async () => {
    if (!newPageTitle.trim() || !newPageSlug.trim()) return;

    const slug = newPageSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const newPage: PageConfig = {
      id: `page-${Date.now()}`,
      slug,
      metadata: {
        title: newPageTitle,
        description: '',
      },
      components: [],
      settings: {
        layout: 'default',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    await createPage(newPage);
    setShowCreateModal(false);
    setNewPageTitle('');
    setNewPageSlug('');
    loadPages();
  };

  const handleTitleChange = (value: string) => {
    setNewPageTitle(value);
    // Auto-generate slug from title
    setNewPageSlug(value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  };

  return (
    <div className='admin-dashboard'>
      <header className='admin-header'>
        <div className='admin-header-left'>
          <BsGrid className='admin-header-icon'/>
          <h1>Page Builder</h1>
        </div>
        <div className='admin-header-actions'>
          <Link href='/admin/products' className='admin-header-btn admin-header-btn--secondary'>
            <BsBoxSeam/>
            Products
          </Link>
          <Link href='/admin/testimonials' className='admin-header-btn admin-header-btn--secondary'>
            <BsChatQuote/>
            Testimonials
          </Link>
          <button
            className='admin-header-btn'
            onClick={() => setShowCreateModal(true)}
          >
            <BsPlus/>
            New Page
          </button>
        </div>
      </header>

      <main className='admin-content'>
        {loading ? (
          <div className='admin-loading'>
            <div className='admin-loading-spinner'/>
            <p>Loading pages...</p>
          </div>
        ) : pages.length === 0 ? (
          <div className='admin-empty'>
            <BsFileEarmarkText className='admin-empty-icon'/>
            <h2>No pages yet</h2>
            <p>Create your first page to get started</p>
            <button
              className='admin-empty-btn'
              onClick={() => setShowCreateModal(true)}
            >
              <BsPlus/>
              Create Page
            </button>
          </div>
        ) : (
          <div className='admin-pages-grid'>
            {pages.map((page) => (
              <div key={page.id} className='admin-page-card'>
                <div className='admin-page-card-header'>
                  <h3>{page.metadata.title}</h3>
                  <span className='admin-page-card-slug'>/{page.slug}</span>
                </div>
                <div className='admin-page-card-meta'>
                  <span>{page.components.length} components</span>
                  <span>v{page.version}</span>
                </div>
                <div className='admin-page-card-actions'>
                  <Link
                    href={`/admin/editor/${page.id}`}
                    className='admin-page-card-btn admin-page-card-btn--primary'
                  >
                    <BsPencil/>
                    Edit
                  </Link>
                  <Link
                    href={`/${page.slug}`}
                    className='admin-page-card-btn'
                    target='_blank'
                  >
                    <BsEye/>
                    View
                  </Link>
                  <button
                    className='admin-page-card-btn admin-page-card-btn--danger'
                    onClick={() => handleDeletePage(page.id)}
                  >
                    <BsTrash/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Page Modal */}
      {showCreateModal && (
        <div className='admin-modal-overlay' onClick={() => setShowCreateModal(false)}>
          <div className='admin-modal' onClick={(e) => e.stopPropagation()}>
            <h2>Create New Page</h2>
            <div className='admin-modal-field'>
              <label>Page Title</label>
              <input
                type='text'
                value={newPageTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder='My New Page'
                autoFocus
              />
            </div>
            <div className='admin-modal-field'>
              <label>URL Slug</label>
              <input
                type='text'
                value={newPageSlug}
                onChange={(e) => setNewPageSlug(e.target.value)}
                placeholder='my-new-page'
              />
              <span className='admin-modal-field-hint'>
                Your page will be available at /{newPageSlug || 'slug'}
              </span>
            </div>
            <div className='admin-modal-actions'>
              <button
                className='admin-modal-btn'
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                className='admin-modal-btn admin-modal-btn--primary'
                onClick={handleCreatePage}
                disabled={!newPageTitle.trim() || !newPageSlug.trim()}
              >
                Create Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
