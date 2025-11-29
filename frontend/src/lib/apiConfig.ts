/**
 * API Configuration Utility
 * Centralized place to get API base URL and construct full URLs
 */

// Get API base URL from environment variable
// If NEXT_PUBLIC_API_URL is set, use it (should include /api if needed)
// Otherwise fallback to localhost for development
// For SSR with standalone output, we need to inject the env var at runtime
// This function will be called both server-side and client-side
export const getApiBaseUrl = (): string => {
  // Try multiple ways to get the env var (for different Next.js versions and deployment scenarios)
  let apiUrl: string | undefined;
  
  // First, try to get from a global variable that we'll inject at runtime via script tag
  // The script tag is injected in layout.tsx (server-side) and should be available immediately
  if (typeof window !== 'undefined') {
    // Browser: Check for runtime-injected value (from layout.tsx script tag)
    let injectedUrl = (window as any).__API_BASE_URL__;
    
    // Fallback 1: Try to read from meta tag
    if (!injectedUrl) {
      const metaTag = document.querySelector('meta[name="api-base-url"]');
      if (metaTag) {
        injectedUrl = metaTag.getAttribute('content');
        if (injectedUrl) {
          // Cache it in window for future use
          (window as any).__API_BASE_URL__ = injectedUrl;
        }
      }
    }
    
    // Fallback 2: If in production and still no URL, use known backend URL
    if (!injectedUrl && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      const productionBackendUrl = 'https://wissen-api-285326281784.us-central1.run.app';
      injectedUrl = `${productionBackendUrl}/api`;
      (window as any).__API_BASE_URL__ = injectedUrl;
      console.warn('⚠️ Using hardcoded production backend URL fallback:', injectedUrl);
    }
    
    if (injectedUrl) {
      // Ensure the URL ends with /api
      const finalUrl = injectedUrl.endsWith('/api') ? injectedUrl : `${injectedUrl}/api`;
      console.log('✅ Using API URL:', finalUrl);
      return finalUrl;
    } else {
      console.warn('⚠️ window.__API_BASE_URL__ not found, script tag may not have executed yet');
    }
  }
  
  // Try standard Next.js env var replacement (works at build time for client code)
  if (typeof window !== 'undefined') {
    // Browser: Try Next.js runtime env
    apiUrl = (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_API_URL;
    // Fallback to process.env (Next.js injects NEXT_PUBLIC_* vars here at build time)
    if (!apiUrl) {
      apiUrl = process.env.NEXT_PUBLIC_API_URL;
    }
  } else {
    // Server-side: Use process.env directly (from Cloud Run env vars)
    apiUrl = process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Debug logging (only in browser)
  if (typeof window !== 'undefined') {
    if (!apiUrl) {
      console.warn('⚠️ NEXT_PUBLIC_API_URL not set, using localhost fallback');
      console.warn('process.env.NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
      console.warn('__NEXT_DATA__.env:', (window as any).__NEXT_DATA__?.env);
      console.warn('window.__API_BASE_URL__:', (window as any).__API_BASE_URL__);
      console.warn('All NEXT_PUBLIC_* vars:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC')));
    } else {
      console.log('✅ Using API URL:', apiUrl);
    }
  }
  
  if (apiUrl) {
    // If the URL already includes /api, use it as is
    // Otherwise, append /api
    if (apiUrl.endsWith('/api')) {
      return apiUrl;
    } else if (apiUrl.endsWith('/')) {
      return `${apiUrl}api`;
    } else {
      return `${apiUrl}/api`;
    }
  }
  
  // Fallback to localhost for local development
  // In production, this should never be reached if NEXT_PUBLIC_API_URL is set
  return 'http://localhost:3001/api';
};

// Get base URL for file uploads/images (without /api)
export const getFileBaseUrl = (): string => {
  const envUrl = 
    typeof window !== 'undefined' 
      ? (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_API_URL 
      : process.env.NEXT_PUBLIC_API_URL;
  const apiUrl = envUrl || process.env.NEXT_PUBLIC_API_URL;
  
  if (apiUrl) {
    // Remove /api if present, or trailing slash
    if (apiUrl.endsWith('/api')) {
      return apiUrl.replace('/api', '');
    } else if (apiUrl.endsWith('/')) {
      return apiUrl.slice(0, -1);
    }
    return apiUrl;
  }
  
  // Fallback to localhost for local development
  // In production, this should never be reached if NEXT_PUBLIC_API_URL is set
  return 'http://localhost:3001';
};

// Construct full URL for API endpoints
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Construct full URL for file/image paths
export const getFileUrl = (path: string): string => {
  const baseUrl = getFileBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // If path already starts with http, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  return `${baseUrl}${cleanPath}`;
};

