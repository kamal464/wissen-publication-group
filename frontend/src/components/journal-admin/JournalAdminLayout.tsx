'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import '@/styles/admin-global.scss';

interface JournalAdminLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  badge?: string;
  children?: MenuItem[];
}

export default function JournalAdminLayout({ children }: JournalAdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'pi pi-home',
      href: '/journal-admin/dashboard'
    },
    {
      id: 'journals',
      label: 'Journal Management',
      icon: 'pi pi-book',
      children: [
        {
          id: 'journal-info',
          label: 'Manage Journal Information',
          icon: 'pi pi-info-circle',
          href: '/journal-admin/journals'
        },
        {
          id: 'journal-meta',
          label: 'Manage Meta Information',
          icon: 'pi pi-tags',
          href: '/journal-admin/journals/meta'
        },
        {
          id: 'journal-home',
          label: 'Journal Home Page',
          icon: 'pi pi-globe',
          href: '/journal-admin/journals/home'
        },
        {
          id: 'aims-scope',
          label: 'Aims & Scope',
          icon: 'pi pi-compass',
          href: '/journal-admin/journals/aims-scope'
        },
        {
          id: 'guidelines',
          label: 'Guidelines',
          icon: 'pi pi-book',
          href: '/journal-admin/journals/guidelines'
        },
        {
          id: 'editorial-board',
          label: 'Editorial Board',
          icon: 'pi pi-users',
          href: '/journal-admin/journals/editorial-board'
        },
        {
          id: 'articles-press',
          label: 'Articles in Press',
          icon: 'pi pi-clock',
          href: '/journal-admin/journals/articles-press'
        },
        {
          id: 'current-issue',
          label: 'Current Issue',
          icon: 'pi pi-calendar',
          href: '/journal-admin/journals/current-issue'
        },
        {
          id: 'archive',
          label: 'Archive Page',
          icon: 'pi pi-archive',
          href: '/journal-admin/journals/archive'
        }
      ]
    },
    {
      id: 'articles',
      label: 'Article Management',
      icon: 'pi pi-file-edit',
      children: [
        {
          id: 'all-articles',
          label: 'All Articles',
          icon: 'pi pi-list',
          href: '/journal-admin/articles',
          badge: '45'
        },
        {
          id: 'search-articles',
          label: 'Search Articles',
          icon: 'pi pi-search',
          href: '/journal-admin/articles/search'
        },
        {
          id: 'review-articles',
          label: 'Review Articles',
          icon: 'pi pi-eye',
          href: '/journal-admin/articles/review',
          badge: '12'
        },
        {
          id: 'pending-articles',
          label: 'Pending Submissions',
          icon: 'pi pi-clock',
          href: '/journal-admin/articles/pending',
          badge: '8'
        }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'pi pi-chart-bar',
      href: '/journal-admin/analytics'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'pi pi-cog',
      href: '/journal-admin/settings'
    }
  ];

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('journalAdminAuth');
      const isLoginPage = pathname === '/journal-admin/login';
      
      if (!auth && !isLoginPage) {
        router.push('/journal-admin/login');
      } else if (auth && isLoginPage) {
        router.push('/journal-admin/dashboard');
      } else {
        setIsAuthenticated(!!auth);
      }
      setLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('journalAdminAuth');
    localStorage.removeItem('journalAdminUser');
    router.push('/journal-admin/login');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const getBreadcrumb = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs = ['Journal Admin'];
    
    if (pathSegments.length > 1) {
      const section = pathSegments[1];
      switch (section) {
        case 'dashboard':
          breadcrumbs.push('Dashboard');
          break;
        case 'journals':
          breadcrumbs.push('Journal Management');
          if (pathSegments.length > 2) {
            const subsection = pathSegments[2];
            switch (subsection) {
              case 'meta':
                breadcrumbs.push('Meta Information');
                break;
              case 'home':
                breadcrumbs.push('Home Page');
                break;
              case 'aims-scope':
                breadcrumbs.push('Aims & Scope');
                break;
              case 'guidelines':
                breadcrumbs.push('Guidelines');
                break;
              case 'editorial-board':
                breadcrumbs.push('Editorial Board');
                break;
              case 'articles-press':
                breadcrumbs.push('Articles in Press');
                break;
              case 'current-issue':
                breadcrumbs.push('Current Issue');
                break;
              case 'archive':
                breadcrumbs.push('Archive');
                break;
            }
          }
          break;
        case 'articles':
          breadcrumbs.push('Article Management');
          if (pathSegments.length > 2) {
            const subsection = pathSegments[2];
            switch (subsection) {
              case 'search':
                breadcrumbs.push('Search Articles');
                break;
              case 'review':
                breadcrumbs.push('Review Articles');
                break;
            }
          }
          break;
        case 'analytics':
          breadcrumbs.push('Analytics');
          break;
        case 'settings':
          breadcrumbs.push('Settings');
          break;
      }
    }
    
    return breadcrumbs;
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isActive = item.href === pathname;
    const hasChildren = item.children && item.children.length > 0;
    
    return (
      <div key={item.id} className={`menu-item-wrapper ${level > 0 ? 'submenu' : ''}`}>
        {hasChildren ? (
          <div className="menu-section">
            <div className="section-title">{item.label}</div>
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        ) : (
          <Link
            href={item.href || '#'}
            className={`menu-item standalone ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <i className={`menu-icon ${item.icon}`}></i>
            <span className="menu-text">{item.label}</span>
            {item.badge && (
              <span className={`menu-badge ${
                item.badge === '8' ? 'danger' : 
                item.badge === '12' ? 'warning' : 
                item.badge === '45' ? 'success' : ''
              }`}>
                {item.badge}
              </span>
            )}
            {hasChildren && <i className="menu-arrow pi pi-chevron-right"></i>}
          </Link>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
            <p className="mt-4 text-gray-600">Loading Journal Admin Panel...</p>
          </div>
        </div>
      </div>
    );
  }

  if (pathname === '/journal-admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/journal-admin/dashboard" className="logo">
            <div className="logo-icon">
              <i className="pi pi-shield"></i>
            </div>
            <div>
              <div className="logo-text">Universal Publishers</div>
              <div className="logo-subtitle">Journal Admin</div>
            </div>
          </Link>
        </div>
        
        <div className="sidebar-menu">
          {menuItems.map(item => renderMenuItem(item))}
        </div>
        
        <div className="sidebar-footer">
          <div className="admin-info">
            <div className="admin-avatar">
              {localStorage.getItem('journalAdminUser')?.charAt(0).toUpperCase() || 'J'}
            </div>
            <div className="admin-details">
              <div className="admin-name">{localStorage.getItem('journalAdminUser') || 'Journal Admin'}</div>
              <div className="admin-role">Journal Administrator</div>
            </div>
            <button 
              className="logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              <i className="pi pi-sign-out"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top Bar */}
        <div className="admin-topbar">
          <div className="topbar-left">
            <button
              className="sidebar-toggle"
              onClick={toggleSidebar}
              title="Toggle Sidebar"
            >
              <i className="pi pi-bars"></i>
            </button>
            
            <button
              className="sidebar-toggle mobile-only"
              onClick={toggleMobileMenu}
              title="Toggle Mobile Menu"
            >
              <i className="pi pi-bars"></i>
            </button>
            
            <div className="breadcrumb">
              {getBreadcrumb().map((item, index) => (
                <span
                  key={index}
                  className={`breadcrumb-item ${index === getBreadcrumb().length - 1 ? 'active' : ''}`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          
          <div className="topbar-right">
            <div className="search-box">
              <i className="pi pi-search search-icon"></i>
              <input
                type="text"
                className="search-input"
                placeholder="Search journals, articles..."
              />
            </div>
            
            <button className="notifications" title="Notifications">
              <i className="pi pi-bell"></i>
              <span className="notification-badge">3</span>
            </button>
            
            <div className="admin-profile" onClick={handleLogout}>
              <div className="profile-avatar">
                {localStorage.getItem('journalAdminUser')?.charAt(0).toUpperCase() || 'J'}
              </div>
              <div className="profile-info">
                <div className="profile-name">{localStorage.getItem('journalAdminUser') || 'Journal Admin'}</div>
                <div className="profile-role">Journal Administrator</div>
              </div>
              <i className="pi pi-sign-out profile-dropdown"></i>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="admin-content">
          {children}
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      <style jsx>{`
        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #f8fafc;
        }
        
        .loading-spinner {
          text-align: center;
        }
        
        .mobile-only {
          display: none;
        }
        
        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }
        
        @media (max-width: 1024px) {
          .mobile-only {
            display: block;
          }
          
          .admin-sidebar {
            transform: translateX(-100%);
          }
          
          .admin-sidebar.mobile-open {
            transform: translateX(0);
          }
          
          .admin-main {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
}


