'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { adminAPI } from '@/lib/api';
import { loadJournalData } from '@/lib/journalAdminUtils';

interface Author {
  id: number;
  name: string;
  email: string;
  affiliation?: string;
  createdAt?: string;
}

interface Article {
  id: number;
  title: string;
  authors: Author[] | string;
  journalTitle?: string;
  journal?: { title: string };
  volume?: string;
  volumeNo?: string;
  issue?: string;
  issueNo?: string;
  publishedAt?: string;
}

export default function SearchArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [journalId, setJournalId] = useState<number | null>(null);
  const toast = useRef<Toast>(null);

  const searchInAuthors = (article: Article, query: string): boolean => {
    if (Array.isArray(article.authors)) {
      return article.authors.some((author: Author) => 
        author.name.toLowerCase().includes(query.toLowerCase()) ||
        author.email.toLowerCase().includes(query.toLowerCase())
      );
    }
    return typeof article.authors === 'string' && article.authors.toLowerCase().includes(query.toLowerCase());
  };

  useEffect(() => {
    loadJournalAndArticles();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = articles.filter(article =>
        article.title.toLowerCase().includes(query) ||
        searchInAuthors(article, query)
      );
      setFilteredArticles(filtered);
    } else {
      setFilteredArticles(articles);
    }
  }, [searchQuery, articles]);

  const loadJournalAndArticles = async () => {
    try {
      setLoading(true);
      const username = localStorage.getItem('journalAdminUser');
      if (!username) return;

      // Use loadJournalData() which correctly finds journal via JournalShortcode table
      const journalData = await loadJournalData();
      
      if (journalData) {
        setJournalId(journalData.journalId);
        const journalResponse = await adminAPI.getJournal(journalData.journalId);
        const journal = journalResponse.data as any;
        
        if (journal) {
          // Load articles for this journal
          const articlesResponse = await adminAPI.getArticles({ journalId: journalData.journalId });
          const articlesData = (articlesResponse.data as any[]) || [];
          
          // Transform articles to handle authors properly
          const transformedArticles = articlesData.map((article: any) => ({
            ...article,
            authors: article.authors || [],
            journalTitle: article.journal?.title || article.journalTitle || journal.title,
          }));
          
          setArticles(transformedArticles);
          setFilteredArticles(transformedArticles);
        }
      }
    } catch (error: any) {
      console.error('Error loading articles:', error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load articles' });
    } finally {
      setLoading(false);
    }
  };

  const authorsBodyTemplate = (rowData: Article) => {
    if (Array.isArray(rowData.authors)) {
      return rowData.authors.map((author: Author) => author.name).join(', ') || '-';
    }
    return typeof rowData.authors === 'string' ? rowData.authors : '-';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <Toast ref={toast} />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Search Articles</h1>
        <p className="text-slate-600">Search and manage articles</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-4">
          <InputText
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter keyword or title..."
            className="flex-1"
          />
          <Button label="Search Now" icon="pi pi-search" className="p-button-success" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable value={filteredArticles} loading={loading} paginator rows={10}>
          <Column field="title" header="Title" sortable />
          <Column field="authors" header="Authors" body={authorsBodyTemplate} />
          <Column 
            field="volume" 
            header="Volume" 
            body={(rowData) => rowData.volumeNo || rowData.volume || '-'} 
          />
          <Column 
            field="issue" 
            header="Issue" 
            body={(rowData) => rowData.issueNo || rowData.issue || '-'} 
          />
          <Column 
            field="publishedAt" 
            header="Published" 
            sortable 
            body={(rowData) => rowData.publishedAt ? new Date(rowData.publishedAt).toLocaleDateString() : '-'}
          />
        </DataTable>
      </div>
    </div>
  );
}

