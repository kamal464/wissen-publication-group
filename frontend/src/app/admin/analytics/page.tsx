'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';

export default function AnalyticsDashboard() {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuth');
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    loadAnalytics();
  }, [router]);

  const loadAnalytics = () => {
    // Mock analytics data
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    // Articles by Status Chart
    setChartData({
      labels: ['Published', 'Under Review', 'Pending', 'Rejected'],
      datasets: [
        {
          data: [45, 23, 12, 8],
          backgroundColor: [
            documentStyle.getPropertyValue('--green-500'),
            documentStyle.getPropertyValue('--blue-500'),
            documentStyle.getPropertyValue('--orange-500'),
            documentStyle.getPropertyValue('--red-500'),
          ],
          hoverBackgroundColor: [
            documentStyle.getPropertyValue('--green-400'),
            documentStyle.getPropertyValue('--blue-400'),
            documentStyle.getPropertyValue('--orange-400'),
            documentStyle.getPropertyValue('--red-400'),
          ]
        }
      ]
    });

    setChartOptions({
      plugins: {
        legend: {
          labels: {
            usePointStyle: true
          }
        }
      }
    });

    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  const monthlyStats = [
    { month: 'January', articles: 12, journals: 2, submissions: 25 },
    { month: 'February', articles: 15, journals: 1, submissions: 30 },
    { month: 'March', articles: 18, journals: 3, submissions: 35 },
    { month: 'April', articles: 22, journals: 2, submissions: 40 },
    { month: 'May', articles: 20, journals: 4, submissions: 38 },
    { month: 'June', articles: 25, journals: 3, submissions: 45 }
  ];

  const topJournals = [
    { name: 'Journal of Advanced Research', articles: 45, impact: 2.5 },
    { name: 'International Journal of Engineering', articles: 32, impact: 2.1 },
    { name: 'Medical Research Quarterly', articles: 28, impact: 1.8 },
    { name: 'Social Science Review', articles: 24, impact: 1.6 }
  ];

  const recentSubmissions = [
    { title: 'AI in Healthcare', author: 'Dr. John Smith', journal: 'Journal of Advanced Research', date: '2024-01-15', status: 'Under Review' },
    { title: 'Sustainable Energy', author: 'Dr. Jane Doe', journal: 'International Journal of Engineering', date: '2024-01-14', status: 'Pending' },
    { title: 'Social Media Impact', author: 'Dr. Mike Johnson', journal: 'Social Science Review', date: '2024-01-13', status: 'Accepted' }
  ];

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <i className="pi pi-chart-bar mr-3"></i>
            Analytics Dashboard
          </h1>
          <p className="page-subtitle">
            Comprehensive analytics and insights for your publishing platform
          </p>
        </div>
        <div className="header-actions">
          <Button
            label="Export Report"
            icon="pi pi-download"
            className="btn btn-outline btn-sm"
          />
          <Button
            label="Refresh Data"
            icon="pi pi-refresh"
            className="btn btn-primary btn-sm"
            onClick={loadAnalytics}
          />
        </div>
      </div>

      <div className="analytics-grid">
        {/* Key Metrics */}
        <div className="analytics-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="pi pi-chart-line mr-2"></i>
              Key Metrics
            </h2>
            <p className="section-description">
              Overview of platform performance and activity
            </p>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon primary">
                  <i className="pi pi-file-edit"></i>
                </div>
                <div className="stat-title">Total Articles</div>
              </div>
              <div className="stat-value">88</div>
              <div className="stat-change positive">
                <i className="pi pi-arrow-up"></i>
                +12% from last month
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon success">
                  <i className="pi pi-check-circle"></i>
                </div>
                <div className="stat-title">Published Articles</div>
              </div>
              <div className="stat-value">45</div>
              <div className="stat-change positive">
                <i className="pi pi-arrow-up"></i>
                +8% from last month
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon warning">
                  <i className="pi pi-eye"></i>
                </div>
                <div className="stat-title">Under Review</div>
              </div>
              <div className="stat-value">23</div>
              <div className="stat-change negative">
                <i className="pi pi-arrow-down"></i>
                +3 from last week
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon danger">
                  <i className="pi pi-book"></i>
                </div>
                <div className="stat-title">New Submissions</div>
              </div>
              <div className="stat-value">12</div>
              <div className="stat-change positive">
                <i className="pi pi-arrow-up"></i>
                +5 from last week
              </div>
            </div>
          </div>
        </div>

        <TabView className="analytics-tabs">
          <TabPanel header="Overview">
            <div className="admin-grid grid-2">
              {/* Articles by Status Chart */}
              <div className="admin-card">
                <div className="card-header">
                  <div className="card-title">
                    <i className="pi pi-chart-pie"></i>
                    Articles by Status
                  </div>
                  <div className="card-subtitle">
                    Distribution of articles across different statuses
                  </div>
                </div>
                <div className="card-content">
                  <div className="chart-container">
                    <Chart type="doughnut" data={chartData} options={chartOptions} />
                  </div>
                </div>
              </div>

              {/* Monthly Trends */}
              <div className="admin-card">
                <div className="card-header">
                  <div className="card-title">
                    <i className="pi pi-chart-line"></i>
                    Monthly Trends
                  </div>
                  <div className="card-subtitle">
                    Article submissions over the past 6 months
                  </div>
                </div>
                <div className="card-content">
                  <div className="space-y-3">
                    {monthlyStats.slice(-6).map((stat, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                        <span className="font-semibold text-gray-700">{stat.month}</span>
                        <div className="flex gap-6 text-sm">
                          <span className="flex items-center gap-1 text-blue-600 font-medium">
                            <i className="pi pi-file-edit"></i>
                            {stat.articles} articles
                          </span>
                          <span className="flex items-center gap-1 text-green-600 font-medium">
                            <i className="pi pi-send"></i>
                            {stat.submissions} submissions
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performing Journals */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Top Performing Journals</h3>
              <DataTable
                value={topJournals}
                loading={loading}
                className="p-datatable-sm"
              >
                <Column field="name" header="Journal Name" />
                <Column field="articles" header="Articles" />
                <Column field="impact" header="Impact Factor" />
                <Column
                  header="Performance"
                  body={(rowData) => (
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(rowData.articles / 50) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {Math.round((rowData.articles / 50) * 100)}%
                      </span>
                    </div>
                  )}
                />
              </DataTable>
            </Card>
          </TabPanel>

          <TabPanel header="Submissions">
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Recent Submissions</h3>
                <Dropdown
                  options={[
                    { label: 'Last 7 days', value: '7' },
                    { label: 'Last 30 days', value: '30' },
                    { label: 'Last 90 days', value: '90' }
                  ]}
                  placeholder="Filter by period"
                  className="w-48"
                />
              </div>
              <DataTable
                value={recentSubmissions}
                loading={loading}
                paginator
                rows={10}
                className="p-datatable-sm"
              >
                <Column field="title" header="Title" />
                <Column field="author" header="Author" />
                <Column field="journal" header="Journal" />
                <Column field="date" header="Submitted" />
                <Column 
                  field="status" 
                  header="Status" 
                  body={(rowData) => (
                    <span className={`px-2 py-1 rounded text-xs ${
                      rowData.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                      rowData.status === 'Pending' ? 'bg-orange-100 text-orange-800' :
                      rowData.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {rowData.status}
                    </span>
                  )}
                />
              </DataTable>
            </Card>
          </TabPanel>

          <TabPanel header="Journal Analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold mb-4">Journal Performance</h3>
                <div className="space-y-4">
                  {topJournals.map((journal, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{journal.name}</h4>
                        <span className="text-sm text-gray-600">Impact: {journal.impact}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{journal.articles} articles</span>
                        <span>Avg. 3.2 reviews/article</span>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(journal.articles / 50) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold mb-4">Review Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span>Average Review Time</span>
                    <span className="font-semibold">14 days</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span>Acceptance Rate</span>
                    <span className="font-semibold">68%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span>Rejection Rate</span>
                    <span className="font-semibold">22%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span>Revision Requests</span>
                    <span className="font-semibold">10%</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabPanel>

          <TabPanel header="Search Analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold mb-4">Popular Search Terms</h3>
                <div className="space-y-2">
                  {[
                    { term: 'machine learning', count: 245 },
                    { term: 'artificial intelligence', count: 189 },
                    { term: 'sustainable energy', count: 156 },
                    { term: 'healthcare technology', count: 134 },
                    { term: 'data science', count: 112 }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{item.term}</span>
                      <span className="text-sm text-gray-600">{item.count} searches</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold mb-4">Article Views</h3>
                <div className="space-y-2">
                  {[
                    { title: 'Machine Learning Applications in Healthcare', views: 1250 },
                    { title: 'Sustainable Energy Solutions', views: 980 },
                    { title: 'Social Media Impact on Education', views: 756 },
                    { title: 'AI in Medical Diagnosis', views: 634 },
                    { title: 'Renewable Energy Technologies', views: 512 }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm truncate flex-1 mr-2">{item.title}</span>
                      <span className="text-sm text-gray-600">{item.views}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
}
