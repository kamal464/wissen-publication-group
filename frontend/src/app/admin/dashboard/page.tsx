'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import '@/styles/admin-global.scss';

interface Statistic {
  title: string;
  value: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Statistic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      const data = response.data;

      setStats([
        { title: 'Users', value: data.users || 0 },
        { title: 'Online Submissions', value: data.onlineSubmissions || 0 },
        { title: 'Create Journal Shortcode', value: data.journalShortcodes || 0 },
        { title: 'Manage Main Web Pages', value: data.webPages || 0 },
      ]);
    } catch (error: any) {
      console.error('Error loading dashboard stats:', error);
      // Set zeros on error - don't show toast on dashboard as it loads automatically
      setStats([
        { title: 'Users', value: 0 },
        { title: 'Online Submissions', value: 0 },
        { title: 'Create Journal Shortcode', value: 0 },
        // { title: 'Manage Main Web Pages', value: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for bar chart
  const chartData = stats.map((stat, index) => ({
    label: stat.title,
    value: stat.value
  }));

  const maxValue = Math.max(...stats.map(s => s.value), 1); // Avoid division by zero

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard min-h-screen bg-slate-50 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Dashboard</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow border border-slate-200">
            <div className="text-slate-500 text-sm mb-2 font-medium">{stat.title}</div>
            <div className="text-blue-600 text-2xl font-bold">{stat.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bg-white p-8 rounded-lg shadow border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Statistics Overview</h2>
        <div className="flex flex-col gap-4">
          {chartData.map((item, index) => {
            const percentage = (item.value / maxValue) * 100;
            return (
              <div key={index} className="flex items-center gap-4">
                <div className="min-w-[200px] text-sm text-slate-500">{item.label}</div>
                <div className="flex-1 flex items-center gap-4">
                  <div className="flex-1 h-7 bg-slate-200 rounded overflow-hidden relative">
                    <div className="h-full bg-blue-600 transition-[width] duration-300" style={{ width: `${percentage}%` }} />
                  </div>
                  <div className="min-w-[80px] text-right font-bold text-slate-800">
                    {item.value.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
