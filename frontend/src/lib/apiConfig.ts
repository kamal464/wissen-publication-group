/**
 * Robust API Configuration Utility
 * Handles all scenarios: SSR, CSR, production, development
 * Multiple fallback mechanisms for maximum reliability
 */

// Production backend URL (fallback)
// This will be overridden by NEXT_PUBLIC_API_URL if set
const PRODUCTION_BACKEND_URL = typeof window !== 'undefined' 
  ? `${window.location.protocol}//${window.location.host}`
  : 'http://localhost:3001';
const DEVELOPMENT_BACKEND_URL = 'http://localhost:3001';

/**
 * Get API base URL with multiple fallback mechanisms
 * Priority:
 * 1. window.__API_BASE_URL__ (injected by InjectApiUrl component)
 * 2. Meta tag (set by server in layout.tsx)
 * 3. process.env.NEXT_PUBLIC_API_URL (build-time or runtime)
 * 4. __NEXT_DATA__.env (Next.js runtime env)
 * 5. Production/development fallback based on hostname
 */
export const getApiBaseUrl = (): string => {
  let apiUrl: string | undefined;

  // Client-side: Try multiple sources
  if (typeof window !== 'undefined') {
    // Priority 1: Runtime-injected value
    apiUrl = (window as any).__API_BASE_URL__;

    // Priority 2: Meta tag (if not already injected)
    if (!apiUrl) {
      try {
        const metaTag = document.querySelector('meta[name="api-base-url"]');
        if (metaTag) {
          apiUrl = metaTag.getAttribute('content') || undefined;
          // Cache it for future use
          if (apiUrl) {
            (window as any).__API_BASE_URL__ = apiUrl;
          }
        }
      } catch (e) {
        // Silently fail if DOM access fails
      }
    }

    // Priority 3: Next.js runtime env
    if (!apiUrl) {
      apiUrl = (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_API_URL;
    }

    // Priority 4: process.env (build-time replacement)
    if (!apiUrl) {
      apiUrl = process.env.NEXT_PUBLIC_API_URL;
    }

    // Priority 4.5: If API URL is set but doesn't match current origin, handle appropriately
    // In development (localhost), allow different ports (e.g., frontend 3000, backend 3001)
    // In production, use current origin to avoid CORS
    if (apiUrl && typeof window !== 'undefined') {
      try {
        const apiUrlObj = new URL(apiUrl);
        const currentOrigin = `${window.location.protocol}//${window.location.host}`;
        const apiOrigin = `${apiUrlObj.protocol}//${apiUrlObj.host}`;
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        // Only override in production (not localhost) to allow different ports in development
        if (apiOrigin !== currentOrigin && !isLocalhost) {
          console.log(`[API] Origin mismatch detected. API URL origin: ${apiOrigin}, Current origin: ${currentOrigin}. Using current origin.`);
          apiUrl = `${currentOrigin}/api`;
          // Cache it
          (window as any).__API_BASE_URL__ = apiUrl;
        } else if (apiOrigin !== currentOrigin && isLocalhost) {
          // In development, keep the configured API URL (likely localhost:3001)
          console.log(`[API] Development mode: Using configured API URL: ${apiUrl}`);
          // Cache it
          (window as any).__API_BASE_URL__ = apiUrl;
        }
      } catch (e) {
        // If URL parsing fails, fall through to Priority 5
        console.warn('[API] Failed to parse API URL, using fallback:', e);
        apiUrl = undefined;
      }
    }

    // Priority 5: Production fallback based on hostname
    if (!apiUrl) {
      const hostname = window.location.hostname;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('localhost')) {
        // Use current host for production
        const protocol = window.location.protocol;
        const host = window.location.host;
        apiUrl = `${protocol}//${host}/api`;
        // Cache it
        (window as any).__API_BASE_URL__ = apiUrl;
      }
    }
  } else {
    // Server-side: Use process.env directly
    apiUrl = process.env.NEXT_PUBLIC_API_URL;
  }

  // Normalize the URL - CRITICAL: Always return absolute URL
  if (apiUrl) {
    // Ensure it's a full URL (starts with http:// or https://)
    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
      // If it's a relative URL, make it absolute using current host
      if (typeof window !== 'undefined') {
        const protocol = window.location.protocol;
        const host = window.location.host;
        // Handle both /api and api formats
        const cleanPath = apiUrl.startsWith('/') ? apiUrl : `/${apiUrl}`;
        apiUrl = `${protocol}//${host}${cleanPath}`;
      } else {
        // Server-side: can't determine host, return as-is (shouldn't happen)
        console.warn('API URL is relative on server-side:', apiUrl);
      }
    }
    
    // Ensure it ends with /api (but don't double it)
    if (apiUrl.endsWith('/api')) {
      return apiUrl;
    } else if (apiUrl.endsWith('/api/')) {
      return apiUrl.slice(0, -1); // Remove trailing slash
    } else if (apiUrl.endsWith('/')) {
      return `${apiUrl}api`;
    } else {
      return `${apiUrl}/api`;
    }
  }

  // Final fallback: development localhost
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If running on localhost, use the backend URL (port 3001)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${DEVELOPMENT_BACKEND_URL}/api`;
    }
    // Otherwise use current host (production)
    const protocol = window.location.protocol;
    const host = window.location.host;
    return `${protocol}//${host}/api`;
  }
  return `${DEVELOPMENT_BACKEND_URL}/api`;
};

/**
 * Get base URL for file uploads/images (without /api)
 */
export const getFileBaseUrl = (): string => {
  const apiUrl = getApiBaseUrl();
  
  // Remove /api from the end
  if (apiUrl.endsWith('/api')) {
    return apiUrl.replace('/api', '');
  }
  
  return apiUrl.replace(/\/api\/?$/, '');
};

/**
 * Construct full URL for API endpoints
 */
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

/**
 * Construct full URL for file/image paths.
 * If path looks like an S3 key (no leading / or http) and NEXT_PUBLIC_CDN_URL is set, use CDN (CloudFront).
 */
export const getFileUrl = (path: string): string => {
  // If path already starts with http, return as is (e.g. full CloudFront URL from API)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If path is a data URI, return as is (don't try to fetch from server)
  if (path.startsWith('data:')) {
    return path;
  }

  // S3/CloudFront key (e.g. "journals/123-banner.jpg") – use CDN if configured (production)
  const cdnUrl = typeof process.env.NEXT_PUBLIC_CDN_URL === 'string' && process.env.NEXT_PUBLIC_CDN_URL.trim();
  if (cdnUrl && !path.startsWith('/')) {
    const base = cdnUrl.replace(/\/$/, '');
    return `${base}/${path.replace(/^\//, '')}`;
  }

  const baseUrl = getFileBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * Verify API URL is accessible (client-side only)
 */
export const verifyApiUrl = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  try {
    const apiUrl = getApiBaseUrl();
    const response = await fetch(`${apiUrl.replace('/api', '')}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // Don't wait too long
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};
