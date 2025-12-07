'use client';

import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import Link from 'next/link';
import '@/styles/admin-global.scss';
import { adminAPI } from '@/lib/api';
import { loadJournalData } from '@/lib/journalAdminUtils';

interface Journal {
  id: number;
  title: string;
  description: string;
  issn: string;
  category: string;
  status: string;
  articleCount: number;
  createdAt: string;
}

interface Article {
  id: number;
  title: string;
  status: string;
  journalTitle: string;
  submittedAt: string;
  authors: string[];
}

export default function JournalAdminDashboard() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorsCount, setEditorsCount] = useState(0);
  const [issuesCount, setIssuesCount] = useState(0);
  const [articlesCount, setArticlesCount] = useState(0);

  useEffect(() => {
    loadDashboardData();
    // Load counts from database
    const loadCounts = async () => {
      try {
        const username = localStorage.getItem('journalAdminUser');
        if (!username) return;

        const usersResponse = await adminAPI.getUsers();
        const users = (usersResponse.data as any[]) || [];
        const user = users.find((u: any) => u.userName === username || u.journalShort === username);
        
        if (user) {
          // Use loadJournalData() which correctly finds journal via JournalShortcode table
          // This ensures we get the correct journal linked to the user's shortcode, not by title
          const journalData = await loadJournalData();
          
          if (journalData) {
            const journalResponse = await adminAPI.getJournal(journalData.journalId);
            const journal = journalResponse.data as any;
            
            if (journal) {
              // Get articles count
              const articlesResponse = await adminAPI.getArticles({ journalId: journal.id });
              setArticlesCount(Array.isArray(articlesResponse.data) ? articlesResponse.data.length : 0);
              
              // Load board members count
              try {
                const boardMembersResponse = await adminAPI.getBoardMembers(journal.id);
                setEditorsCount(Array.isArray(boardMembersResponse.data) ? boardMembersResponse.data.length : 0);
              } catch (err) {
                setEditorsCount(0);
              }
              
              // Load published articles count for issues
              try {
                const publishedResponse = await adminAPI.getArticles({ journalId: journal.id, status: 'PUBLISHED' });
                const publishedArticles = Array.isArray(publishedResponse.data) ? publishedResponse.data : [];
                // Count unique volume/issue combinations
                const uniqueIssues = new Set<string>();
                publishedArticles.forEach((article: any) => {
                  if (article.volumeNo && article.issueNo) {
                    uniqueIssues.add(`${article.volumeNo}-${article.issueNo}`);
                  }
                });
                setIssuesCount(uniqueIssues.size);
              } catch (err) {
                setIssuesCount(0);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading counts:', error);
      }
    };
    loadCounts();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [journalsResponse, articlesResponse] = await Promise.all([
        adminAPI.getJournals(),
        adminAPI.getArticles({ limit: 10 })
      ]);

      setJournals(Array.isArray(journalsResponse.data) ? journalsResponse.data : []);
      setArticles(Array.isArray(articlesResponse.data) ? articlesResponse.data : []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      
      setJournals([
        {
          id: 1,
          title: "Journal of Advanced Research",
          description: "A multidisciplinary journal covering cutting-edge research",
          issn: "2090-1234",
          category: "Science",
          status: "Active",
          articleCount: 45,
          createdAt: "2024-01-01"
        }
      ]);

      setArticles([
        {
          id: 1,
          title: "Machine Learning Applications in Healthcare",
          status: "UNDER_REVIEW",
          journalTitle: "Journal of Advanced Research",
          submittedAt: "2024-01-15",
          authors: ["Dr. John Smith", "Dr. Jane Doe"]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'PENDING': return 'warning';
      case 'UNDER_REVIEW': return 'info';
      case 'PUBLISHED': return 'success';
      case 'REJECTED': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'UNDER_REVIEW': return 'Under Review';
      case 'PENDING': return 'Pending';
      case 'PUBLISHED': return 'Published';
      case 'REJECTED': return 'Rejected';
      default: return status;
    }
  };


  const stats = [
    { 
      title: 'Editors', 
      value: editorsCount, 
      icon: 'pi pi-users', 
      color: 'primary'
    },
    { 
      title: 'Issues', 
      value: issuesCount, 
      icon: 'pi pi-calendar', 
      color: 'success'
    },
    { 
      title: 'Articles', 
      value: articlesCount, 
      icon: 'pi pi-file-edit', 
      color: 'info'
    }
  ];

  const maxValue = Math.max(...stats.map(s => s.value), 1);

  return (
    <div className="admin-dashboard">
      <div className="content-card mb-6">
        <div className="card-content">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {typeof window !== 'undefined' ? localStorage.getItem('journalAdminUser') || 'Journal Admin' : 'Journal Admin'}!
              </h1>
              <p className="text-gray-600">
                Manage your journals and articles from here.
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Last updated</div>
              <div className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-${stat.color === 'primary' ? 'blue' : stat.color === 'success' ? 'green' : 'blue'}-100 flex items-center justify-center`}>
                <i className={`${stat.icon} text-${stat.color === 'primary' ? 'blue' : stat.color === 'success' ? 'green' : 'blue'}-600 text-xl`}></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value.toLocaleString()}</div>
            <div className="text-sm text-gray-600">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics Overview</h2>
        <div className="space-y-4">
          {stats.map((stat, index) => {
            const percentage = (stat.value / maxValue) * 100;
            return (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-700 font-medium">{stat.title}</div>
                <div className="flex-1 h-8 bg-gray-200 rounded overflow-hidden">
                  <div 
                    className={`h-full bg-${stat.color === 'primary' ? 'blue' : stat.color === 'success' ? 'green' : 'blue'}-600 transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="w-16 text-right font-bold text-gray-900">{stat.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="data-table-container">
          <div className="table-header">
            <h3 className="table-title">Recent Journals</h3>
            <div className="table-actions">
              <Link href="/journal-admin/journals">
                <Button label="View All" className="btn btn-outline btn-sm" />
              </Link>
            </div>
          </div>
          <DataTable
            value={Array.isArray(journals) ? journals.slice(0, 5) : []}
            loading={loading}
            className="p-datatable-sm"
          >
            <Column field="title" header="Title" />
            <Column field="category" header="Category" />
            <Column 
              field="status" 
              header="Status" 
              body={(rowData) => (
                <Tag value={rowData.status} severity={getStatusSeverity(rowData.status)} />
              )}
            />
            <Column field="articleCount" header="Articles" />
          </DataTable>
        </div>

        <div className="data-table-container">
          <div className="table-header">
            <h3 className="table-title">Recent Articles</h3>
            <div className="table-actions">
              <Link href="/journal-admin/articles">
                <Button label="View All" className="btn btn-outline btn-sm" />
              </Link>
            </div>
          </div>
          <DataTable
            value={Array.isArray(articles) ? articles.slice(0, 5) : []}
            loading={loading}
            className="p-datatable-sm"
          >
            <Column field="title" header="Title" />
            <Column field="journalTitle" header="Journal" />
            <Column 
              field="status" 
              header="Status" 
              body={(rowData) => (
                <Tag value={getStatusLabel(rowData.status)} severity={getStatusSeverity(rowData.status)} />
              )}
            />
            <Column field="submittedAt" header="Submitted" />
          </DataTable>
        </div>
      </div>

      <div className="content-card mt-6">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
          <p className="card-subtitle">Common administrative tasks</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/journal-admin/journals">
              <Button 
                label="Manage Journals" 
                icon="pi pi-book" 
                className="btn btn-primary w-full"
              />
            </Link>
            <Link href="/journal-admin/articles">
              <Button 
                label="Review Articles" 
                icon="pi pi-eye" 
                className="btn btn-success w-full"
              />
            </Link>
            <Link href="/journal-admin/analytics">
              <Button 
                label="View Analytics" 
                icon="pi pi-chart-bar" 
                className="btn btn-secondary w-full"
              />
            </Link>
            <Link href="/journal-admin/settings">
              <Button 
                label="Settings" 
                icon="pi pi-cog" 
                className="btn btn-outline w-full"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}





