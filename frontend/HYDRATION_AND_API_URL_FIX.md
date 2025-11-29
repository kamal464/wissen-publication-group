# Robust Hydration and Backend URL Configuration

This document explains the comprehensive fixes implemented for React hydration errors and backend URL configuration.

## Overview

The solution provides:
1. **Robust hydration handling** - Prevents React error #418 (hydration mismatches)
2. **Reliable API URL injection** - Multiple fallback mechanisms for backend URL
3. **Error boundaries** - Prevents app crashes from hydration errors
4. **Client-only rendering** - Utility component for components that must render only on client

## Components

### 1. `ClientOnly` Component (`frontend/src/components/ClientOnly.tsx`)

Wraps components that should only render on the client side to prevent hydration mismatches.

**Usage:**
```tsx
import { ClientOnly } from '@/components/ClientOnly';

<ClientOnly fallback={<div>Loading...</div>}>
  <ComponentThatUsesWindow />
</ClientOnly>
```

### 2. `InjectApiUrl` Component (`frontend/src/components/InjectApiUrl.tsx`)

Robust API URL injection with multiple fallback mechanisms:
- Priority 1: `window.__API_BASE_URL__` (already injected)
- Priority 2: Meta tag from server (`<meta name="api-base-url">`)
- Priority 3: `process.env.NEXT_PUBLIC_API_URL` (build-time)
- Priority 4: `__NEXT_DATA__.env` (Next.js runtime)
- Priority 5: Production fallback (based on hostname)
- Priority 6: Development fallback (`localhost:3001`)

**Features:**
- Runs only on client side (no SSR)
- Uses `useRef` to prevent multiple injections
- Silent error handling
- No rendering (returns `null`)

### 3. `ErrorBoundary` Component (`frontend/src/components/ErrorBoundary.tsx`)

Catches React errors (including hydration errors) and displays a fallback UI.

**Features:**
- Prevents entire app from crashing
- Provides user-friendly error message
- Reload button for recovery
- Development logging

### 4. Enhanced `apiConfig.ts` (`frontend/src/lib/apiConfig.ts`)

Robust API URL resolution with:
- Multiple fallback mechanisms
- Server-side and client-side support
- URL normalization (ensures `/api` suffix)
- File URL helpers
- API verification utility

**Functions:**
- `getApiBaseUrl()` - Get API base URL with fallbacks
- `getFileBaseUrl()` - Get file base URL (without `/api`)
- `getApiUrl(endpoint)` - Construct full API URL
- `getFileUrl(path)` - Construct full file URL
- `verifyApiUrl()` - Verify API is accessible (client-side)

## Layout Configuration

### `layout.tsx` Updates

1. **suppressHydrationWarning** on `<html>` and `<body>` tags
2. **Meta tag** for API URL (server-side injection)
3. **ErrorBoundary** wrapping the app
4. **Hydration marker** script to prevent FOUC

## Environment Variables

### Required

- `NEXT_PUBLIC_API_URL` - Backend API URL (should include `/api` or it will be added)

### Example Values

**Development:**
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Production:**
```
NEXT_PUBLIC_API_URL=https://wissen-api-285326281784.us-central1.run.app/api
```

## Usage Examples

### Using API URL in Components

```tsx
import { getApiBaseUrl, getApiUrl } from '@/lib/apiConfig';

// Get base URL
const apiUrl = getApiBaseUrl(); // Returns: https://api.example.com/api

// Construct full endpoint URL
const journalsUrl = getApiUrl('/journals'); // Returns: https://api.example.com/api/journals
```

### Using File URLs

```tsx
import { getFileUrl } from '@/lib/apiConfig';

const imageUrl = getFileUrl('/uploads/image.jpg');
// Returns: https://api.example.com/uploads/image.jpg
```

### Client-Only Components

```tsx
import { ClientOnly } from '@/components/ClientOnly';

export default function MyComponent() {
  return (
    <div>
      <h1>Always Rendered</h1>
      <ClientOnly fallback={<div>Loading...</div>}>
        <ComponentThatUsesWindow />
      </ClientOnly>
    </div>
  );
}
```

## Hydration Best Practices

1. **Avoid conditional rendering based on `window`** - Use `ClientOnly` wrapper
2. **Use `suppressHydrationWarning`** for elements that may differ (dates, timestamps)
3. **Keep server and client rendering consistent** - Same props = same output
4. **Use static values** when possible (e.g., static year instead of `new Date().getFullYear()`)
5. **Wrap error-prone components** in `ErrorBoundary`

## Troubleshooting

### Hydration Error Still Occurs

1. Check browser console for specific component causing the error
2. Look for components using `Date.now()`, `Math.random()`, or `window` in render
3. Wrap problematic components in `ClientOnly`
4. Add `suppressHydrationWarning` to specific elements

### API URL Not Working

1. Check `NEXT_PUBLIC_API_URL` is set in environment
2. Verify meta tag is present in HTML (`<meta name="api-base-url">`)
3. Check browser console for injection logs (development only)
4. Use `verifyApiUrl()` to test connectivity

### Backend Not Accessible

1. Verify backend is running and accessible
2. Check CORS configuration on backend
3. Verify network connectivity
4. Check Cloud Run logs for backend errors

## Deployment Checklist

- [ ] `NEXT_PUBLIC_API_URL` is set in Cloud Run environment variables
- [ ] Backend CORS allows frontend origin
- [ ] Backend health endpoint is accessible
- [ ] All components using `window` are wrapped in `ClientOnly`
- [ ] Error boundaries are in place
- [ ] Test hydration in production build

## Files Modified

1. `frontend/src/components/ClientOnly.tsx` - New
2. `frontend/src/components/InjectApiUrl.tsx` - Enhanced
3. `frontend/src/components/ErrorBoundary.tsx` - New
4. `frontend/src/lib/apiConfig.ts` - Enhanced
5. `frontend/src/app/layout.tsx` - Enhanced
6. `frontend/src/components/layout/Footer.tsx` - Updated

## Testing

### Local Development

```bash
# Set environment variable
export NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Run frontend
cd frontend
npm run dev
```

### Production Build

```bash
# Build with environment variable
NEXT_PUBLIC_API_URL=https://wissen-api-285326281784.us-central1.run.app/api npm run build

# Test build locally
npm start
```

## Support

For issues or questions:
1. Check browser console for errors
2. Verify environment variables are set
3. Check network tab for API requests
4. Review Cloud Run logs for backend errors

