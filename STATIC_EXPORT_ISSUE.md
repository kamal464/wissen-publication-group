# Next.js Static Export Issue with Dynamic Routes

## Problem
Next.js 15.5.4 is not recognizing `generateStaticParams()` function even though it's correctly exported in the page files.

## Error Message
```
[Error: Page "/articles/[id]" is missing "generateStaticParams()" so it cannot be used with "output: export" config.]
```

## Files Affected
- `frontend/src/app/articles/[id]/page.tsx`
- `frontend/src/app/journals/[shortcode]/page.tsx`

## Current Implementation
Both files have:
```typescript
// Required for static export - export must be at top level
export async function generateStaticParams() {
  return [];
}

import ArticleClient from './ArticleClient'; // or JournalClient

export default function ArticlePage() {
  return <ArticleClient />;
}
```

## Attempted Fixes
1. ✅ Created server component wrappers
2. ✅ Moved client components to separate files
3. ✅ Added proper TypeScript types
4. ✅ Removed conflicting exports
5. ✅ Simplified function signature
6. ✅ Moved export before imports
7. ✅ Tested with and without Turbopack

## Possible Solutions

### Option 1: Use Catch-All Routes
Replace `[id]` and `[shortcode]` with `[...slug]` catch-all routes that handle routing client-side.

### Option 2: Switch to SSR Deployment
Deploy to Cloud Run with SSR instead of static export to Firebase Hosting.

### Option 3: Downgrade Next.js
Try Next.js 14.x which may have better static export support.

### Option 4: Temporary Workaround
Temporarily remove these dynamic routes and use query parameters instead.

## Recommendation
Given the persistent issue, recommend switching to **Option 2 (Cloud Run with SSR)** as it:
- Supports dynamic routes natively
- Provides better SEO
- Allows server-side data fetching
- More flexible for future features

