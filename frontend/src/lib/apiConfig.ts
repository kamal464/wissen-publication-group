/**
 * API Configuration Utility
 * Centralized place to get API base URL and construct full URLs
 */

// Get API base URL from environment variable
// If NEXT_PUBLIC_API_URL is set, use it (should include /api if needed)
// Otherwise fallback to localhost for development
export const getApiBaseUrl = (): string => {
  // Try multiple ways to get the env var (for different Next.js versions and deployment scenarios)
  let apiUrl: string | undefined;
  
  if (typeof window !== 'undefined') {
    // Browser: Try Next.js runtime env
    apiUrl = (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_API_URL;
    // Fallback to process.env (Next.js injects NEXT_PUBLIC_* vars here)
    if (!apiUrl) {
      apiUrl = process.env.NEXT_PUBLIC_API_URL;
    }
  } else {
    // Server-side: Use process.env directly
    apiUrl = process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Debug logging (only in browser)
  if (typeof window !== 'undefined') {
    if (!apiUrl) {
      console.warn('⚠️ NEXT_PUBLIC_API_URL not set, using localhost fallback');
      console.warn('process.env.NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
      console.warn('__NEXT_DATA__.env:', (window as any).__NEXT_DATA__?.env);
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

