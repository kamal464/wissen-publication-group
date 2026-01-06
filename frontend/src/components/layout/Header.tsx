'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sidebar } from 'primereact/sidebar';
import TopNewsBar from './TopNewsBar';
import NavMenu from './NavMenu';
import type { NavMenuItemProps } from './NavMenuItem';

const menuItems: NavMenuItemProps[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Journals', href: '/journals' },
  { label: 'Guidelines', href: '/instructions' }, // Using /instructions as guidelines page
  { label: 'Submit Manuscript', href: '/submit-manuscript', variant: 'cta' },
  { label: 'Contact Us', href: '/contact' },
  // Commented out items:
  // { label: 'Articles', href: '/articles' },
  // { label: 'Editorial Board', href: '/editorial-board' },
  // { label: 'Instructions to Authors', href: '/instructions' },
];

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Placeholder search handler – integrate with actual search logic as needed.
    if (searchTerm.trim()) {
      console.info('Searching for:', searchTerm);
    }
  };

  return (
    <header className="header-wrapper">
      {!isSearchOpen && <TopNewsBar />}

      <div className="header">
        <div className="header__container">
          {!isSearchOpen && (
            <Link href="/" className="header__logo" aria-label="Wissen Publication Group homepage">
              <img 
                src="/wissen-logo.png" 
                alt="Wissen Publication Group" 
                className="header__logo-image"
              />
            </Link>
          )}

          {!isSearchOpen && <NavMenu items={menuItems} />}

          <div className="header__actions">
            {!isSearchOpen && (
              <>
                <button
                  type="button"
                  className="header__search-btn"
                  aria-label="Open search"
                  onClick={() => setIsSearchOpen(true)}
                  suppressHydrationWarning
                >
                  <i className="pi pi-search" />
                </button>
                <button
                  type="button"
                  className="header__mobile-btn"
                  aria-label="Open navigation menu"
                  onClick={() => setIsMobileMenuOpen(true)}
                  suppressHydrationWarning
                >
                  <i className="pi pi-bars" />
                </button>
              </>
            )}
          </div>
        </div>

        {isSearchOpen && (
          <div className="header__search-overlay" role="dialog" aria-modal="true" aria-label="Site search">
            <form className="header__search-container" onSubmit={handleSearchSubmit}>
              <i className="pi pi-search header__search-icon" />
              <input
                type="search"
                placeholder="Search journals, books, or articles..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="header__search-input"
                autoFocus
              />
              <button type="submit" className="header__search-submit">
                Search
              </button>
              <button
                type="button"
                className="header__search-close"
                aria-label="Close search"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchTerm('');
                }}
              >
                <i className="pi pi-times" />
              </button>
            </form>
          </div>
        )}
      </div>

      <Sidebar
        visible={isMobileMenuOpen}
        onHide={() => setIsMobileMenuOpen(false)}
        position="right"
        className="header__mobile-sidebar"
        modal
        blockScroll
      >
        <nav className="header__mobile-nav" aria-label="Mobile navigation">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`header__mobile-link${item.variant ? ` header__mobile-link--${item.variant}` : ''}${
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                  ? ' header__mobile-link--active'
                  : ''
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Sidebar>
    </header>
  );
}
