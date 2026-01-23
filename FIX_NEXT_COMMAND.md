# 🔧 Fix "next command not found" Error

## ❌ **Problem:**
`Command 'next' not found` - This means Next.js isn't installed or not in PATH.

## ✅ **Solution: Use npm run build instead**

The `next` command should be run via `npm run build` or `npx next build`, not directly.

---

## 🚀 **CORRECTED FAST BUILD COMMAND:**

```bash
# Kill any stuck processes
pkill -9 node

# Wait a moment
sleep 5

# Fast build (using npm run build)
cd /var/www/wissen-publication-group/frontend && \
rm -rf .next node_modules/.cache && \
echo "=== Installing dependencies ===" && \
npm install --no-audit --no-fund --loglevel=error && \
echo "" && \
echo "=== Starting fast build (no lint) ===" && \
NODE_OPTIONS="--max-old-space-size=2048" npm run build -- --no-lint && \
echo "✅ Build complete!" && \
cd /var/www/wissen-publication-group && \
pm2 restart wissen-frontend && \
pm2 save && \
sudo systemctl reload nginx && \
echo "✅ Deployment complete!"
```

---

## ⚡ **EVEN FASTER: Skip Dependencies if Already Installed**

If `node_modules` exists and is up to date:

```bash
pkill -9 node && \
sleep 5 && \
cd /var/www/wissen-publication-group/frontend && \
rm -rf .next node_modules/.cache && \
NODE_OPTIONS="--max-old-space-size=2048" npm run build && \
cd /var/www/wissen-publication-group && \
pm2 restart wissen-frontend && \
pm2 save && \
sudo systemctl reload nginx && \
echo "✅ Deployment complete!"
```

---

## 🔍 **Alternative: Use npx**

If you prefer using `next` directly:

```bash
cd /var/www/wissen-publication-group/frontend && \
npm install --no-audit --no-fund --loglevel=error && \
NODE_OPTIONS="--max-old-space-size=2048" npx next build --no-lint
```

---

## 📝 **Why This Happens:**

- `next` is a local dependency in `node_modules/.bin/`
- It's only available via `npm run build` or `npx next build`
- Direct `next` command requires it to be globally installed (not recommended)

---

## ✅ **RECOMMENDED: Full Command with Dependencies**

**Copy and paste this entire block:**

```bash
pkill -9 node && \
sleep 5 && \
cd /var/www/wissen-publication-group/frontend && \
rm -rf .next node_modules/.cache && \
echo "=== Installing dependencies ===" && \
npm install --no-audit --no-fund --loglevel=error && \
echo "" && \
echo "=== Building frontend ===" && \
NODE_OPTIONS="--max-old-space-size=2048" npm run build && \
echo "" && \
echo "=== Restarting services ===" && \
cd /var/www/wissen-publication-group && \
pm2 restart wissen-frontend && \
pm2 save && \
sudo systemctl reload nginx && \
echo "✅ Deployment complete!"
```

This will:
1. Kill stuck processes
2. Clean build cache
3. Install/update dependencies
4. Build frontend
5. Restart services

**This should work!** ✅
