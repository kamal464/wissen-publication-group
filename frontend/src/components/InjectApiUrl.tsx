'use client';

import { useEffect } from 'react';

/**
 * Client component to inject API URL at runtime
 * Runs only on client side after hydration to avoid any server/client mismatches
 */
export function InjectApiUrl() {
  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window === 'undefined') return;
    
    // Inject immediately on client side
    const injectApiUrl = () => {
      // First, try to read from meta tag (set by server)
      let apiUrl: string | null = null;
      const metaTag = document.querySelector('meta[name="api-base-url"]');
      if (metaTag) {
        apiUrl = metaTag.getAttribute('content');
      }
      
      // If not found, try to infer from current location (production)
      if (!apiUrl && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        // We're in production, construct API URL from backend URL
        const backendUrl = 'https://wissen-api-285326281784.us-central1.run.app';
        apiUrl = `${backendUrl}/api`;
      }
      
      // Fallback to localhost for development
      if (!apiUrl) {
        apiUrl = 'http://localhost:3001/api';
      }
      
      // Inject the API URL
      if (apiUrl && !(window as any).__API_BASE_URL__) {
        (window as any).__API_BASE_URL__ = apiUrl;
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ API URL injected:', apiUrl);
        }
      }
    };
    
    // Run immediately (after hydration)
    injectApiUrl();
  }, []);

  return null; // This component doesn't render anything
}

