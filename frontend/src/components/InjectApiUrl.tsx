'use client';

import { useEffect, useRef } from 'react';

/**
 * Robust API URL injection component
 * Handles all scenarios: SSR, CSR, production, development
 * No rendering to avoid hydration issues
 */
export function InjectApiUrl() {
  const injectedRef = useRef(false);

  useEffect(() => {
    // Only run once on client side after hydration
    if (typeof window === 'undefined' || injectedRef.current) return;
    
    const injectApiUrl = () => {
      try {
        // Priority 1: Check if already injected
        if ((window as any).__API_BASE_URL__) {
          injectedRef.current = true;
          return;
        }

        // Priority 2: Read from meta tag (set by server in layout.tsx)
        let apiUrl: string | null = null;
        const metaTag = document.querySelector('meta[name="api-base-url"]');
        if (metaTag) {
          apiUrl = metaTag.getAttribute('content');
        }

        // Priority 3: Try process.env (for build-time replacement)
        if (!apiUrl) {
          apiUrl = process.env.NEXT_PUBLIC_API_URL || null;
        }

        // Priority 4: Try __NEXT_DATA__ (Next.js runtime env)
        if (!apiUrl && (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_API_URL) {
          apiUrl = (window as any).__NEXT_DATA__.env.NEXT_PUBLIC_API_URL;
        }

        // Priority 5: Infer from current location (production fallback)
        if (!apiUrl) {
          const hostname = window.location.hostname;
          if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('localhost')) {
            // Production environment - use same host as frontend
            const productionBackendUrl = `${window.location.protocol}//${window.location.host}`;
            apiUrl = `${productionBackendUrl}/api`;
          }
        }

        // Priority 6: Development fallback
        if (!apiUrl) {
          apiUrl = 'http://localhost:3001/api';
        }

        // Normalize the URL (ensure it ends with /api)
        if (apiUrl && !apiUrl.endsWith('/api')) {
          if (apiUrl.endsWith('/')) {
            apiUrl = `${apiUrl}api`;
          } else {
            apiUrl = `${apiUrl}/api`;
          }
        }

        // Inject the API URL
        if (apiUrl) {
          (window as any).__API_BASE_URL__ = apiUrl;
          injectedRef.current = true;

          // Only log in development
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ API URL injected:', apiUrl);
          }
        }
      } catch (error) {
        // Silently fail - fallback will be used
        if (process.env.NODE_ENV === 'development') {
          console.error('Error injecting API URL:', error);
        }
      }
    };

    // Use microtask to ensure DOM is ready
    Promise.resolve().then(() => {
      injectApiUrl();
    });
  }, []);

  // This component never renders anything
  return null;
}
