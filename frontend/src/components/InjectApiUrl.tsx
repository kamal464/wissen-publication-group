'use client';

import { useEffect } from 'react';

/**
 * Client component to verify API URL injection
 * The actual injection happens via script tag in layout.tsx (server-side)
 * This component just logs for debugging
 */
export function InjectApiUrl() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const injectedUrl = (window as any).__API_BASE_URL__;
      if (injectedUrl) {
        console.log('✅ API URL injected successfully:', injectedUrl);
      } else {
        console.warn('⚠️ API URL not injected - check server-side script tag');
      }
    }
  }, []);

  return null; // This component doesn't render anything
}

