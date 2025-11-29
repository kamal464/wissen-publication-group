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
  
  // Early return for login page - don't render layout at all
  const isLoginPage = pathname === '/journal-admin/login' || pathname === '/journal-admin/login/';
  if (isLoginPage) {
    return <>{children}</>;
  }

  const menuItems: MenuItem[] = [
    // ✔ Welcome
    {
      id: 'dashboard',
      label: 'Welcome',
      icon: 'pi pi-home',
      href: '/journal-admin/dashboard'
    },
    // Group: Journal Management
    {
      id: 'journals',
      label: 'Journal Management',
      icon: 'pi pi-book',
      children: [
        // ✔ Manage Journal Information
        {
          id: 'journal-info',
          label: 'Manage Journal Information',
          icon: 'pi pi-info-circle',
          href: '/journal-admin/journals'
        },
        // ✔ Manage Meta Information
        {
          id: 'journal-meta',
          label: 'Manage Meta Information',
          icon: 'pi pi-tags',
          href: '/journal-admin/journals/meta'
        },
        // ✔ Journal Home Page
        {
          id: 'journal-home',
          label: 'Journal Home Page',
          icon: 'pi pi-globe',
          href: '/journal-admin/journals/home'
        },
        // ✔ Aims & Scope
        {
          id: 'aims-scope',
          label: 'Aims & Scope',
          icon: 'pi pi-compass',
          href: '/journal-admin/journals/aims-scope'
        },
        // ✔ Guidelines
        {
          id: 'guidelines',
          label: 'Guidelines',
          icon: 'pi pi-book',
          href: '/journal-admin/journals/guidelines'
        },
        // ✔ Editorial Board
        {
          id: 'editorial-board',
          label: 'Editorial Board',
          icon: 'pi pi-users',
          href: '/journal-admin/journals/editorial-board'
        },
        // ✔ Articles in Press
        {
          id: 'articles-press',
          label: 'Articles in Press',
          icon: 'pi pi-clock',
          href: '/journal-admin/journals/articles-press'
        },
        // ✔ Current Issue
        {
          id: 'current-issue',
          label: 'Current Issue',
          icon: 'pi pi-calendar',
          href: '/journal-admin/journals/current-issue'
        },
        // ✔ Archive Page
        {
          id: 'archive',
          label: 'Archive Page',
          icon: 'pi pi-archive',
          href: '/journal-admin/journals/archive'
        }
      ]
    },
    // ✔ Search Articles
    {
      id: 'search-articles',
      label: 'Search Articles',
      icon: 'pi pi-search',
      href: '/journal-admin/articles/search'
    }
    // NOT ALLOWED removed: User Management, Shortcodes, Site/SEO Settings, Analytics, etc.
  ];

  useEffect(() => {
    // Skip auth check if already on login page (shouldn't happen due to layout wrapper, but safety check)
    const isLoginPageCheck = pathname === '/journal-admin/login' || pathname === '/journal-admin/login/';
    
    if (isLoginPageCheck) {
      setLoading(false);
      setIsAuthenticated(false);
      return;
    }

    const checkAuth = () => {
      const auth = localStorage.getItem('journalAdminAuth');

      if (!auth) {
        // Not authenticated - redirect to login
        router.push('/journal-admin/login');
        setLoading(false);
        return;
      } else {
        // Authenticated - set state and continue
        setIsAuthenticated(true);
        setLoading(false);
      }
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

  // Show loading state while checking authentication
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

  // Not authenticated - show redirect message (redirect is happening in useEffect)
  if (!isAuthenticated) {
    return (
      <div className="admin-layout">
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
            <p className="mt-4 text-gray-600">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated - show full layout
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
              <div className="logo-text">Wissen Publication Group</div>
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


