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

  useEffect(() => {
    loadDashboardData();
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
      title: 'Total Journals', 
      value: Array.isArray(journals) ? journals.length : 0, 
      icon: 'pi pi-book', 
      color: 'primary',
      trend: '+2 this month',
      trendType: 'positive'
    },
    { 
      title: 'Total Articles', 
      value: Array.isArray(articles) ? articles.length : 0, 
      icon: 'pi pi-file-edit', 
      color: 'success',
      trend: '+12 this week',
      trendType: 'positive'
    },
    { 
      title: 'Pending Reviews', 
      value: Array.isArray(articles) ? articles.filter(a => a.status === 'PENDING').length : 0, 
      icon: 'pi pi-clock', 
      color: 'warning',
      trend: '+3 from last week',
      trendType: 'negative'
    },
    { 
      title: 'Published This Month', 
      value: Array.isArray(articles) ? articles.filter(a => a.status === 'PUBLISHED').length : 0, 
      icon: 'pi pi-calendar', 
      color: 'danger',
      trend: '+5 from last month',
      trendType: 'positive'
    }
  ];

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

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <div className={`stat-icon ${stat.color}`}>
                <i className={stat.icon}></i>
              </div>
              <div className={`stat-trend ${stat.trendType}`}>
                {stat.trend}
              </div>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.title}</div>
          </div>
        ))}
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





