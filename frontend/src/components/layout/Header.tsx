'use client';

import { FormEvent, useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from 'primereact/sidebar';
import { ClientOnly } from '@/components/ClientOnly';
import TopNewsBar from './TopNewsBar';
import NavMenu from './NavMenu';
import type { NavMenuItemProps } from './NavMenuItem';
import { searchAPI } from '@/lib/api';

const menuItems: NavMenuItemProps[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Journals', href: '/journals' },
  { label: 'Guidelines', href: '/instructions' }, // Using /instructions as guidelines page
  { label: 'Submit Manuscript', href: '/submit-manuscript', variant: 'cta' },
  { label: 'Contact Us', href: '/contact' }, // ✅ DEPLOYMENT TEST v2
  // Commented out items:
  // { label: 'Articles', href: '/articles' },
  // { label: 'Editorial Board', href: '/editorial-board' },
  // { label: 'Instructions to Authors', href: '/instructions' },
];

interface SearchResult {
  articles: any[];
  journals: any[];
  total: number;
}

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults(null);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchAPI.globalSearch(query.trim());
      // Type assertion: axios wraps response in .data property
      const searchData = (response as any).data as SearchResult;
      setSearchResults(searchData);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input changes with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchTerm);
      }, 300); // 300ms debounce
    } else {
      setSearchResults(null);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, performSearch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      setShowSuggestions(false);
      setIsSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const handleSuggestionClick = () => {
    setShowSuggestions(false);
    setIsSearchOpen(false);
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  return (
    <header className="header-wrapper" suppressHydrationWarning>
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
          <div 
            className="header__search-overlay" 
            role="dialog" 
            aria-modal="true" 
            aria-label="Site search"
            ref={searchContainerRef}
          >
            <form className="header__search-container" onSubmit={handleSearchSubmit}>
              <i className="pi pi-search header__search-icon" />
              <input
                type="search"
                placeholder="Search journals, articles, or authors..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="header__search-input"
                autoFocus
              />
              {isSearching && (
                <i className="pi pi-spin pi-spinner header__search-spinner" />
              )}
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
                  setSearchResults(null);
                  setShowSuggestions(false);
                }}
              >
                <i className="pi pi-times" />
              </button>
            </form>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchResults && (
              <div className="header__search-suggestions">
                {searchResults.total === 0 ? (
                  <div className="header__search-suggestion-item header__search-suggestion-item--empty">
                    <i className="pi pi-info-circle" />
                    <span>No results found for "{searchTerm}"</span>
                  </div>
                ) : (
                  <>
                    {searchResults.journals.length > 0 && (
                      <div className="header__search-suggestions-section">
                        <div className="header__search-suggestions-header">
                          <i className="pi pi-book" />
                          <span>Journals ({searchResults.journals.length})</span>
                        </div>
                        {searchResults.journals.slice(0, 3).map((journal) => (
                          <Link
                            key={journal.id}
                            href={`/journals/${journal.shortcode || journal.id}`}
                            className="header__search-suggestion-item"
                            onClick={handleSuggestionClick}
                          >
                            <i className="pi pi-book" />
                            <div className="header__search-suggestion-content">
                              <div className="header__search-suggestion-title">{journal.title}</div>
                              {journal.description && (
                                <div className="header__search-suggestion-desc">
                                  {journal.description.substring(0, 60)}...
                                </div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {searchResults.articles.length > 0 && (
                      <div className="header__search-suggestions-section">
                        <div className="header__search-suggestions-header">
                          <i className="pi pi-file" />
                          <span>Articles ({searchResults.articles.length})</span>
                        </div>
                        {searchResults.articles.slice(0, 3).map((article) => (
                          <Link
                            key={article.id}
                            href={`/articles/${article.id}`}
                            className="header__search-suggestion-item"
                            onClick={handleSuggestionClick}
                          >
                            <i className="pi pi-file" />
                            <div className="header__search-suggestion-content">
                              <div className="header__search-suggestion-title">{article.title}</div>
                              {article.journal && (
                                <div className="header__search-suggestion-desc">
                                  {article.journal.title}
                                </div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {searchResults.total > 6 && (
                      <div className="header__search-suggestions-footer">
                        <button
                          type="button"
                          className="header__search-view-all"
                          onClick={handleSearchSubmit}
                        >
                          View all {searchResults.total} results
                          <i className="pi pi-arrow-right" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
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
