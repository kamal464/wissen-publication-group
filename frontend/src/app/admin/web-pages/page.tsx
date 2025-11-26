'use client';

import { useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import '@/styles/admin-global.scss';

interface WebPage {
  id: number;
  pageName: string;
  pageUrl: string;
  pageImage?: string;
}

export default function WebPagesPage() {
  const [webPages] = useState<WebPage[]>([
    { id: 1, pageName: 'Editorial & Peer Review Process', pageUrl: 'editorial-peer-review-process.html' },
    { id: 2, pageName: 'Peer Review Policy', pageUrl: 'peer-review-policy.html' },
    { id: 3, pageName: 'Conflict of Interest Policy', pageUrl: 'conflict-of-interest-policy.html' },
    { id: 4, pageName: 'Author\'s Rights and Obligations', pageUrl: 'author-s-rights-and-obligations.html' },
    { id: 5, pageName: 'Advertising Policy', pageUrl: 'advertising-policy.html' },
    { id: 6, pageName: 'Guidelines', pageUrl: 'guidelines.html' },
    { id: 7, pageName: 'Scientific Research and Community - Article Process', pageUrl: 'scientific-research-and-community-article-process.html' },
    { id: 8, pageName: 'About Scientific Research & Community', pageUrl: 'about-scientific-research-community.html' },
  ]);

  const imageBodyTemplate = (rowData: WebPage) => {
    if (rowData.pageImage) {
      return <img src={rowData.pageImage} alt={rowData.pageName} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />;
    }
    return <span style={{ color: '#94a3b8' }}>-</span>;
  };

  const actionBodyTemplate = (rowData: WebPage) => {
    return (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button
          icon="pi pi-pencil"
          className="p-button-warning p-button-rounded p-button-text"
          onClick={() => window.location.href = `/admin/web-pages/${rowData.id}/edit`}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-danger p-button-rounded p-button-text"
          onClick={() => {
            if (confirm('Are you sure you want to delete this page?')) {
              // Handle delete
            }
          }}
        />
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
          List of Web Pages
        </h1>
        <Button
          label="Add New Webpage"
          icon="pi pi-plus"
          className="p-button-info"
          onClick={() => window.location.href = '/admin/web-pages/new'}
        />
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <DataTable
          value={webPages}
          paginator
          rows={10}
          emptyMessage="No web pages found"
        >
          <Column field="id" header="#" style={{ width: '60px' }} />
          <Column field="pageName" header="Page Name" sortable />
          <Column field="pageUrl" header="Page URL" />
          <Column header="Page Image" body={imageBodyTemplate} style={{ width: '100px' }} />
          <Column header="Edit" body={actionBodyTemplate} style={{ width: '150px' }} />
          <Column header="Delete" body={actionBodyTemplate} style={{ width: '150px' }} />
        </DataTable>
      </div>
    </div>
  );
}


