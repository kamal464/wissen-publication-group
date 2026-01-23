# ⚡ Fast Frontend Build - AWS Browser Commands

**Optimized commands to speed up frontend builds on AWS**

---

## 🔍 **CHECK RESOURCES FIRST:**

```bash
# Check CPU and memory
top -bn1 | head -20

# Check disk space
df -h /

# Check if build is actually running
ps aux | grep -E "next|npm|node" | grep -v grep
```

---

## ⚡ **OPTIMIZED FRONTEND BUILD (Faster):**

```bash
cd /var/www/wissen-publication-group/frontend && \
echo "=== Cleaning old build ===" && \
rm -rf .next node_modules/.cache && \
echo "" && \
echo "=== Installing dependencies (skip optional) ===" && \
npm ci --prefer-offline --no-audit --no-fund --loglevel=error || \
npm install --no-audit --no-fund --no-optional --loglevel=error && \
echo "" && \
echo "=== Building frontend (production mode) ===" && \
NODE_OPTIONS="--max-old-space-size=2048" npm run build && \
echo "✅ Frontend built!"
```

---

## 🚀 **EVEN FASTER: Skip Type Checking (If Not Needed):**

```bash
cd /var/www/wissen-publication-group/frontend && \
echo "=== Quick build (skip type check) ===" && \
rm -rf .next && \
npm install --no-audit --no-fund --loglevel=error && \
SKIP_ENV_VALIDATION=true NODE_OPTIONS="--max-old-space-size=2048" next build --no-lint && \
echo "✅ Fast build complete!"
```

---

## 🔧 **IF BUILD IS STUCK:**

### Option 1: Kill and Restart
```bash
# Kill all node processes
pkill -9 node

# Wait 5 seconds
sleep 5

# Try build again
cd /var/www/wissen-publication-group/frontend && \
rm -rf .next node_modules/.cache && \
npm run build
```

### Option 2: Build in Background
```bash
cd /var/www/wissen-publication-group/frontend && \
nohup npm run build > /tmp/frontend-build.log 2>&1 &

# Check progress
tail -f /tmp/frontend-build.log

# Check if still running
ps aux | grep "next build"
```

---

## 💾 **FREE UP MEMORY BEFORE BUILD:**

```bash
# Clear caches
npm cache clean --force && \
rm -rf ~/.npm && \
rm -rf /var/www/wissen-publication-group/frontend/.next && \
rm -rf /var/www/wissen-publication-group/frontend/node_modules/.cache && \

# Free up memory
sync && \
echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null && \

echo "✅ Memory freed!"
```

---

## ⚙️ **OPTIMIZE NEXT.JS CONFIG FOR FASTER BUILDS:**

If builds are consistently slow, you can optimize `next.config.ts`:

```typescript
// Add to next.config.ts
const nextConfig = {
  // ... existing config
  swcMinify: true, // Use SWC instead of Terser (faster)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Remove console logs in prod
  },
  // Reduce build output
  output: 'standalone', // Smaller output
}
```

---

## 📊 **MONITOR BUILD PROGRESS:**

```bash
# Watch build progress in real-time
cd /var/www/wissen-publication-group/frontend && \
npm run build 2>&1 | tee /tmp/build.log

# In another terminal, watch the log:
tail -f /tmp/build.log
```

---

## 🎯 **RECOMMENDED: Full Optimized Deployment**

```bash
cd /var/www/wissen-publication-group && \
echo "=== Pull Code ===" && \
GIT_TERMINAL_PROMPT=0 git fetch origin main && \
git reset --hard origin/main && \
echo "" && \
echo "=== Backend (Quick) ===" && \
cd backend && \
npm install --no-audit --no-fund --loglevel=error && \
npx prisma generate && \
npm run build && \
echo "" && \
echo "=== Frontend (Optimized) ===" && \
cd ../frontend && \
rm -rf .next node_modules/.cache && \
npm install --no-audit --no-fund --loglevel=error && \
NODE_OPTIONS="--max-old-space-size=2048" npm run build && \
echo "" && \
echo "=== Restart Services ===" && \
cd .. && \
pm2 restart all && \
sleep 3 && \
pm2 save && \
sudo systemctl reload nginx && \
echo "✅ Deployment complete!"
```

---

## ⚠️ **IF BUILD TAKES MORE THAN 10 MINUTES:**

1. **Check instance size**: Consider upgrading to a larger instance (t3.medium or t3.large)
2. **Check disk I/O**: `iostat -x 1 5`
3. **Check if swap is being used**: `free -h`
4. **Consider building locally and uploading**: Build on your local machine, then upload `.next` folder

---

## 🔄 **ALTERNATIVE: Build Locally and Upload**

If AWS build is too slow:

```bash
# On your local machine (after building):
# 1. Build locally: npm run build
# 2. Compress .next folder: tar -czf next-build.tar.gz .next
# 3. Upload to AWS: scp next-build.tar.gz ubuntu@YOUR_IP:/tmp/
# 4. On AWS, extract: cd /var/www/wissen-publication-group/frontend && tar -xzf /tmp/next-build.tar.gz
```

---

## 📝 **TYPICAL BUILD TIMES:**

- **Small instance (t3.micro)**: 8-15 minutes
- **Medium instance (t3.small)**: 5-10 minutes  
- **Large instance (t3.medium)**: 3-5 minutes

If your build takes longer, use the optimized commands above or consider upgrading the instance.
