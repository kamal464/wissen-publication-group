# 🔍 Diagnose Frontend Error

## **IMMEDIATE DIAGNOSTIC**

Run this to see why frontend is crashing:

```bash
echo "=== Frontend Error Diagnostic ===" && \
echo "" && \
echo "1. Frontend Error Logs (last 50 lines):" && \
pm2 logs wissen-frontend --err --lines 50 --nostream && \
echo "" && \
echo "2. Frontend Output Logs (last 30 lines):" && \
pm2 logs wissen-frontend --out --lines 30 --nostream && \
echo "" && \
echo "3. Frontend Process Details:" && \
pm2 describe wissen-frontend && \
echo "" && \
echo "4. Check if .next build exists:" && \
ls -ld /var/www/wissen-publication-group/frontend/.next 2>/dev/null && echo "✅ Build exists" || echo "❌ Build missing!" && \
echo "" && \
echo "5. Check port 3000:" && \
sudo ss -tlnp | grep :3000 || echo "Port 3000 not listening" && \
echo "" && \
echo "6. Check .env.production:" && \
cat /var/www/wissen-publication-group/frontend/.env.production 2>/dev/null || echo "❌ Missing!"
```

---

## **COMMON FIXES**

### **Fix 1: Port Already in Use**

```bash
echo "Killing processes on port 3000..." && \
sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true && \
pkill -9 -f "next-server" 2>/dev/null || true && \
pkill -9 -f "node.*3000" 2>/dev/null || true && \
sleep 3 && \
echo "Restarting frontend..." && \
pm2 restart wissen-frontend && \
sleep 20 && \
pm2 list | grep wissen-frontend
```

### **Fix 2: Missing .env.production**

```bash
cd /var/www/wissen-publication-group/frontend && \
[ -f .env.production ] || echo "NEXT_PUBLIC_API_URL=https://wissenpublicationgroup.com/api" > .env.production && \
echo "✅ .env.production created/verified" && \
pm2 restart wissen-frontend && \
sleep 20 && \
pm2 list | grep wissen-frontend
```

### **Fix 3: Rebuild and Restart**

```bash
cd /var/www/wissen-publication-group && \
pm2 delete wissen-frontend && \
sleep 2 && \
cd frontend && \
pm2 start npm --name wissen-frontend \
  --max-memory-restart 400M \
  --update-env \
  -- start && \
cd .. && \
pm2 save && \
sleep 30 && \
pm2 list | grep wissen-frontend
```

---

## **SHARE ERROR LOGS**

Run the diagnostic command above and share the error logs so we can identify the exact issue.
