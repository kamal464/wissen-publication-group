/**
 * API Configuration Utility
 * Centralized place to get API base URL and construct full URLs
 */

// Get API base URL from environment variable
// If NEXT_PUBLIC_API_URL is set, use it (should include /api if needed)
// Otherwise fallback to localhost for development
export const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (envUrl) {
    // If the URL already includes /api, use it as is
    // Otherwise, append /api
    if (envUrl.endsWith('/api')) {
      return envUrl;
    } else if (envUrl.endsWith('/')) {
      return `${envUrl}api`;
    } else {
      return `${envUrl}/api`;
    }
  }
  
  // Fallback to localhost for local development
  return 'http://localhost:3001/api';
};

// Get base URL for file uploads/images (without /api)
export const getFileBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (envUrl) {
    // Remove /api if present, or trailing slash
    if (envUrl.endsWith('/api')) {
      return envUrl.replace('/api', '');
    } else if (envUrl.endsWith('/')) {
      return envUrl.slice(0, -1);
    }
    return envUrl;
  }
  
  // Fallback to localhost for local development
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

