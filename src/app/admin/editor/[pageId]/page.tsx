'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';

import PageEditor from '../../../page-builder/editor/page-editor';

export default function EditorPage() {
  const router = useRouter();
  const params = useParams();
  const pageId = params?.pageId as string;

  const handleExit = () => {
    router.push('/admin');
  };

  if (!pageId) {
    return <div>Loading...</div>;
  }

  return <PageEditor pageId={pageId} onExit={handleExit}/>;
}
