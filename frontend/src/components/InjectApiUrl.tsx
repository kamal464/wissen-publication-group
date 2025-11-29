'use client';

import { useEffect, useState } from 'react';

/**
 * Client component to inject API URL at runtime
 * This works as a fallback if the Script component doesn't execute in time
 */
export function InjectApiUrl() {
  const [injected, setInjected] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // First check if already injected by Script component
      let apiUrl = (window as any).__API_BASE_URL__;
      
      // If not found, try to get from server-side rendered data
      if (!apiUrl) {
        // Try to read from a data attribute or meta tag
        const metaTag = document.querySelector('meta[name="api-base-url"]');
        if (metaTag) {
          apiUrl = metaTag.getAttribute('content');
        }
      }
      
      // If still not found, try to infer from current location (production)
      if (!apiUrl && window.location.hostname !== 'localhost') {
        // We're in production, construct API URL from backend URL
        // This is a fallback - ideally the env var should be set
        const backendUrl = 'https://wissen-api-285326281784.us-central1.run.app';
        apiUrl = `${backendUrl}/api`;
        console.warn('⚠️ Using fallback API URL construction:', apiUrl);
      }
      
      // If we found or constructed an API URL, inject it
      if (apiUrl && !(window as any).__API_BASE_URL__) {
        (window as any).__API_BASE_URL__ = apiUrl;
        console.log('✅ API URL injected via client component:', apiUrl);
        setInjected(true);
      } else if ((window as any).__API_BASE_URL__) {
        console.log('✅ API URL already injected:', (window as any).__API_BASE_URL__);
        setInjected(true);
      } else {
        console.warn('⚠️ API URL not available - using localhost fallback');
      }
    }
  }, []);

  return null; // This component doesn't render anything
}

