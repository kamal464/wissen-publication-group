'use client';

import { useEffect } from 'react';

/**
 * Client component to inject API URL at runtime
 * This works around the limitation that NEXT_PUBLIC_* vars aren't replaced
 * in standalone SSR builds
 */
export function InjectApiUrl() {
  useEffect(() => {
    // Get API URL from environment (available at runtime in Cloud Run)
    // In local dev, this comes from .env.local
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (apiUrl && typeof window !== 'undefined') {
      // Inject into window for client-side access
      (window as any).__API_BASE_URL__ = apiUrl;
      console.log('✅ Injected API URL:', apiUrl);
    } else if (typeof window !== 'undefined') {
      console.warn('⚠️ NEXT_PUBLIC_API_URL not available for injection');
    }
  }, []);

  return null; // This component doesn't render anything
}

