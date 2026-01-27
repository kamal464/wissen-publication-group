# 🚨 URGENT: Cleanup Suspicious Files & Free Disk Space

## ⚠️ IMMEDIATE ACTION REQUIRED

Your server has:
1. **Suspicious files** (XMRig cryptocurrency miner - indicates compromise)
2. **Disk space full** (preventing deployment)

## Run This Command NOW on Your EC2 Instance:

```bash
cd /var/www/wissen-publication-group && \
echo "🚨 URGENT CLEANUP STARTING..." && \
echo "" && \
echo "=== STEP 1: Remove Suspicious Files ===" && \
rm -rf frontend/xmrig* frontend/scanner_linux frontend/public/ids.php 2>/dev/null && \
rm -f backend/.env.backup.* backend/.env.save 2>/dev/null && \
echo "✅ Suspicious files removed" && \
echo "" && \
echo "=== STEP 2: Check for Running Miners ===" && \
ps aux | grep -E "xmrig|miner|crypto" | grep -v grep && echo "⚠️  MINING PROCESSES FOUND!" || echo "✅ No mining processes running" && \
echo "" && \
echo "=== STEP 3: Check Disk Space ===" && \
df -h / && \
echo "" && \
echo "=== STEP 4: Clean Disk Space ===" && \
npm cache clean --force 2>/dev/null || true && \
cd backend && rm -rf node_modules dist 2>/dev/null || true && \
cd ../frontend && rm -rf node_modules .next 2>/dev/null || true && \
cd .. && \
sudo journalctl --vacuum-time=3d 2>/dev/null || true && \
sudo find /var/log -type f -name "*.log" -mtime +7 -delete 2>/dev/null || true && \
pm2 flush 2>/dev/null || true && \
echo "" && \
echo "=== STEP 5: After Cleanup ===" && \
df -h / && \
echo "" && \
echo "=== STEP 6: Check Suspicious Processes Again ===" && \
ps aux | grep -E "xmrig|miner|crypto" | grep -v grep && echo "⚠️  STILL RUNNING - KILL MANUALLY!" || echo "✅ No mining processes" && \
echo "" && \
echo "✅ Cleanup complete! Disk space should be freed."
```

## If Mining Processes Are Still Running:

```bash
# Find and kill mining processes
ps aux | grep -E "xmrig|miner" | grep -v grep | awk '{print $2}' | xargs sudo kill -9 2>/dev/null

# Check again
ps aux | grep -E "xmrig|miner" | grep -v grep || echo "✅ All miners killed"
```

## After Cleanup, Continue Deployment:

```bash
cd /var/www/wissen-publication-group && \
echo "=== STEP 2: Deploy Backend ===" && \
cd backend && \
npm install --no-audit --no-fund --loglevel=error && \
npx prisma generate && \
npx prisma migrate deploy && \
npm run build && \
echo "" && \
echo "=== STEP 3: Deploy Frontend ===" && \
cd ../frontend && \
npm install --no-audit --no-fund --loglevel=error && \
npm run build && \
echo "" && \
echo "=== STEP 4: Restart Services ===" && \
cd /var/www/wissen-publication-group && \
pm2 delete all 2>/dev/null || true && \
sleep 2 && \
cd backend && \
pm2 start dist/src/main.js --name wissen-backend \
  --max-memory-restart 400M \
  --update-env && \
cd ../frontend && \
pm2 start npm --name wissen-frontend \
  --max-memory-restart 400M \
  --update-env \
  -- start && \
cd .. && \
sleep 5 && \
pm2 save && \
pm2 startup && \
sudo systemctl reload nginx && \
echo "" && \
echo "=== STEP 5: Verify ===" && \
pm2 list && \
curl -s http://localhost:3001/api/health && echo "" && \
echo "✅ Deployment complete!"
```

## Security Follow-Up:

**After deployment, review `SECURITY_ALERT_SUSPICIOUS_FILES.md` for:**
- How to secure your server
- How to prevent future compromises
- Monitoring recommendations

---

**⚠️ This cleanup removes the immediate threat, but you should still:**
1. Review security settings
2. Change all passwords
3. Review SSH access
4. Set up firewall
5. Consider rebuilding if heavily compromised
