# 🔧 Fix npm ENOTEMPTY Error

## Problem
`npm install` fails with `ENOTEMPTY: directory not empty` error. This happens when `node_modules` is in a corrupted state.

## Quick Fix

Run this on your server:

```bash
cd /var/www/wissen-publication-group/backend && \
echo "=== Cleaning node_modules ===" && \
rm -rf node_modules package-lock.json && \
echo "✅ Cleaned, now installing..." && \
npm install --no-audit --no-fund --loglevel=error
```

## Complete Backend Deployment Fix

```bash
cd /var/www/wissen-publication-group/backend && \
echo "=== Cleaning and reinstalling backend dependencies ===" && \
rm -rf node_modules package-lock.json dist && \
npm install --no-audit --no-fund --loglevel=error && \
npx prisma generate && \
npx prisma migrate deploy && \
npm run build && \
echo "✅ Backend deployment complete"
```

## If Error Persists

Try with cache clearing:

```bash
cd /var/www/wissen-publication-group/backend && \
rm -rf node_modules package-lock.json dist && \
npm cache clean --force && \
npm install --no-audit --no-fund --loglevel=error
```

---

**⚠️ REMINDER:** You're on the compromised instance. After this deployment, you should still plan to rebuild on a clean instance following `QUICK_REBUILD_GUIDE.md`.
