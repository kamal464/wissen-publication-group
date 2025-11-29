'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { adminAPI } from '@/lib/api';
import '@/styles/admin-global.scss';

interface AdminLayoutProps {
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

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const toast = useRef<Toast>(null);

  // Early return for login page - don't render layout at all
  const isLoginPage = pathname === '/admin/login' || pathname === '/admin/login/';
  if (isLoginPage) {
    return <>{children}</>;
  }

  const menuItems: MenuItem[] = [
    {
      id: 'welcome',
      label: 'Welcome',
      icon: 'pi pi-home',
      href: '/admin/dashboard'
    },
    {
      id: 'users',
      label: 'Users',
      icon: 'pi pi-users',
      href: '/admin/users'
    },
    {
      id: 'submissions',
      label: 'Online Submissions',
      icon: 'pi pi-file-edit',
      href: '/admin/submissions'
    },
    {
      id: 'shortcode',
      label: 'Create Journal Shortcode',
      icon: 'pi pi-code',
      href: '/admin/journal-shortcode'
    },

  ];

  useEffect(() => {
    // Skip auth check if already on login page (shouldn't happen due to layout wrapper, but safety check)
    const isLoginPage = pathname === '/admin/login' || pathname === '/admin/login/';
    
    if (isLoginPage) {
      setLoading(false);
      setIsAuthenticated(false);
      return;
    }

    const checkAuth = () => {
      const auth = localStorage.getItem('adminAuth');

      if (!auth) {
        // Not authenticated - redirect to login
        router.push('/admin/login');
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

  useEffect(() => {
    // Load notifications only after authentication is confirmed
    if (isAuthenticated && pathname !== '/admin/login' && !loading) {
      loadNotifications();
    }
  }, [isAuthenticated, pathname, loading]);

  const loadNotifications = async () => {
    try {
      const response = await adminAPI.getNotifications(true);
      const notificationsData = Array.isArray(response.data) ? response.data : [];
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.length);
    } catch (error: any) {
      // Silently fail for notifications - don't break the UI if backend is down
      console.error('Error loading notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
      // Only show error toast if it's not a network error (backend down)
      if (error.code !== 'ERR_NETWORK' && error.code !== 'ECONNREFUSED') {
        // Only log, don't show toast for network errors to avoid spam
      }
    }
  };

  const handleGlobalSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    try {
      const response = await adminAPI.globalSearch(searchQuery);
      setSearchResults(response.data);
      setShowSearchDialog(true);
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Search failed' });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await adminAPI.markAllNotificationsAsRead();
      loadNotifications();
      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'All notifications marked as read' });
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to mark notifications as read' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const getBreadcrumb = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs = ['Admin'];

    if (pathSegments.length > 1) {
      const section = pathSegments[1];
      switch (section) {
        case 'dashboard':
          breadcrumbs.push('Welcome');
          break;
        case 'users':
          breadcrumbs.push('Users');
          break;
        case 'submissions':
          breadcrumbs.push('Online Submissions');
          break;
        case 'journal-shortcode':
          breadcrumbs.push('Create Journal Shortcode');
          break;
        case 'pending-fulltexts':
          breadcrumbs.push('Pending Fulltexts');
          break;
        case 'web-pages':
          breadcrumbs.push('Manage Main Web Pages');
          break;
        case 'board-members':
          breadcrumbs.push('Board Members');
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
              <span className={`menu-badge ${item.badge === '8' ? 'danger' :
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

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="admin-layout">
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
            <p className="mt-4 text-gray-600">Loading Admin Panel...</p>
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
          <Link href="/admin/dashboard" className="logo">
            <div className="logo-icon">
              <i className="pi pi-shield"></i>
            </div>
            <div>
              <div className="logo-text">Wissen Publication Group</div>
              <div className="logo-subtitle">Admin Panel</div>
            </div>
          </Link>
        </div>

        <div className="sidebar-menu">
          {menuItems.map(item => renderMenuItem(item))}
        </div>

        <div className="sidebar-footer">
          <div className="admin-info">
            <div className="admin-avatar">
              {localStorage.getItem('adminUser')?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="admin-details">
              <div className="admin-name">{localStorage.getItem('adminUser') || 'Admin'}</div>
              <div className="admin-role">Administrator</div>
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
          <div className="topbar-left flex flex-wrap gap-2">
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

            <div className="breadcrumb overflow-x-auto whitespace-nowrap">
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

          <div className="topbar-right flex flex-wrap items-center gap-2 min-w-0">
            <div className="search-box w-full sm:w-80 flex-1 min-w-[160px]">
              <i className="pi pi-search search-icon"></i>
              <input
                type="text"
                className="search-input w-full"
                placeholder="Search journals, articles, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGlobalSearch()}
              />
              {searchQuery && (
                <i
                  className="pi pi-times search-clear"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '10px', cursor: 'pointer' }}
                />
              )}
            </div>

            <button
              className="notifications flex-shrink-0"
              title="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <i className="pi pi-bell"></i>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>

            <button onClick={handleLogout} className="logout-button flex-shrink-0">
              <span>Logout</span>
              <i className="pi pi-sign-out"></i>
            </button>
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

      {/* Notifications Dropdown */}
      {showNotifications && (
        <>
          <div
            className="mobile-overlay"
            onClick={() => setShowNotifications(false)}
            style={{ zIndex: 998 }}
          />
          <div style={{
            position: 'fixed',
            top: '80px',
            right: '2rem',
            width: '350px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            zIndex: 999,
            maxHeight: '500px',
            overflow: 'auto'
          }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  label="Mark all read"
                  className="p-button-text p-button-sm"
                  onClick={handleMarkAllRead}
                />
              )}
            </div>
            <div>
              {notifications.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  No notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: notif.isRead ? 'white' : '#f8fafc',
                      cursor: 'pointer'
                    }}
                    onClick={async () => {
                      if (!notif.isRead) {
                        await adminAPI.markNotificationAsRead(notif.id);
                        loadNotifications();
                      }
                    }}
                  >
                    <div style={{ fontWeight: notif.isRead ? '400' : '600', fontSize: '0.875rem' }}>
                      {notif.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                      {new Date(notif.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Global Search Dialog */}
      <Dialog
        header="Search Results"
        visible={showSearchDialog}
        style={{ width: '80vw', maxWidth: '900px' }}
        onHide={() => setShowSearchDialog(false)}
      >
        {searchResults && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {searchResults.users && searchResults.users.length > 0 && (
              <div>
                <h3>Users ({searchResults.users.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {searchResults.users.map((user: any) => (
                    <div key={user.id} style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                      {user.userName} - {user.journalName || '-'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.articles && searchResults.articles.length > 0 && (
              <div>
                <h3>Articles ({searchResults.articles.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {searchResults.articles.map((article: any) => (
                    <div key={article.id} style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                      <strong>{article.title}</strong>
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        {article.journal?.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.journals && searchResults.journals.length > 0 && (
              <div>
                <h3>Journals ({searchResults.journals.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {searchResults.journals.map((journal: any) => (
                    <div key={journal.id} style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                      {journal.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.webPages && searchResults.webPages.length > 0 && (
              <div>
                <h3>Web Pages ({searchResults.webPages.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {searchResults.webPages.map((page: any) => (
                    <div key={page.id} style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                      {page.pageName}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!searchResults.users?.length && !searchResults.articles?.length &&
              !searchResults.journals?.length && !searchResults.webPages?.length) && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No results found
                </div>
              )}
          </div>
        )}
      </Dialog>

      <Toast ref={toast} />

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
