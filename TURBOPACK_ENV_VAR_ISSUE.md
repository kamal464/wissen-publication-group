# Turbopack Environment Variable Issue

## The Problem

The debug logs show:
- `process.env.NEXT_PUBLIC_API_URL: undefined`
- `All NEXT_PUBLIC_* vars: []`

This means **Turbopack is NOT replacing `NEXT_PUBLIC_*` environment variables** at build time.

## Root Cause

Next.js 15.5.4 with Turbopack (`--turbopack` flag) has a known issue where it doesn't properly replace `NEXT_PUBLIC_*` variables in the client-side code.

## Solution Applied

I've removed `--turbopack` from the build command:
- **Before**: `"build": "next build --turbopack"`
- **After**: `"build": "next build"`

The standard Next.js build (Webpack) properly handles `NEXT_PUBLIC_*` variables.

## What This Means

- ✅ **Development**: Still uses Turbopack (`next dev --turbopack`) - faster dev server
- ✅ **Production Build**: Uses standard Webpack build - proper env var replacement
- ✅ **Result**: Environment variables will be correctly replaced

## After Next Build

The build will:
1. Use standard Next.js build (Webpack)
2. Properly replace `NEXT_PUBLIC_API_URL` at build time
3. Bake the value into the JavaScript bundle
4. Work correctly in production

## Trade-offs

- **Build time**: Slightly slower (Webpack vs Turbopack)
- **Reliability**: ✅ Environment variables work correctly
- **Dev experience**: Still fast (Turbopack in dev mode)

## Next Steps

1. Wait for the new build to complete
2. Hard refresh: `Ctrl+Shift+R`
3. Check console - should see `✅ Using API URL: https://...`
4. Check Network tab - API calls should go to Cloud Run URL

The standard Next.js build should fix this issue! 🚀

