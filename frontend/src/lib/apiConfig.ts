/**
 * Robust API Configuration Utility
 * Handles all scenarios: SSR, CSR, production, development
 * Multiple fallback mechanisms for maximum reliability
 */

// Production backend URL (fallback)
const PRODUCTION_BACKEND_URL = 'https://wissen-api-285326281784.us-central1.run.app';
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

    // Priority 5: Production fallback based on hostname
    if (!apiUrl) {
      const hostname = window.location.hostname;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('localhost')) {
        apiUrl = `${PRODUCTION_BACKEND_URL}/api`;
        // Cache it
        (window as any).__API_BASE_URL__ = apiUrl;
      }
    }
  } else {
    // Server-side: Use process.env directly
    apiUrl = process.env.NEXT_PUBLIC_API_URL;
  }

  // Normalize the URL
  if (apiUrl) {
    // Ensure it ends with /api
    if (apiUrl.endsWith('/api')) {
      return apiUrl;
    } else if (apiUrl.endsWith('/')) {
      return `${apiUrl}api`;
    } else {
      return `${apiUrl}/api`;
    }
  }

  // Final fallback: development localhost
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
 * Construct full URL for file/image paths
 */
export const getFileUrl = (path: string): string => {
  // If path already starts with http, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If path is a data URI, return as is (don't try to fetch from server)
  if (path.startsWith('data:')) {
    return path;
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
