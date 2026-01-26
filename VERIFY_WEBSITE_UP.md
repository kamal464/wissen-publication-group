# ✅ Verify Website is Fully Operational

## **COMPLETE VERIFICATION**

Run this to verify everything is working:

```bash
cd /var/www/wissen-publication-group && \
echo "==========================================" && \
echo "✅ COMPLETE WEBSITE VERIFICATION" && \
echo "==========================================" && \
echo "" && \
echo "=== 1. PM2 Status ===" && \
pm2 list && \
echo "" && \
echo "=== 2. Service Health ===" && \
echo "Backend:" && \
curl -s http://localhost:3001/health && echo "" && \
echo "Frontend:" && \
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000 && \
echo "" && \
echo "=== 3. Nginx Status ===" && \
sudo systemctl is-active nginx && \
echo "" && \
echo "=== 4. Test Public URL ===" && \
curl -s -o /dev/null -w "Public IP: HTTP %{http_code}\n" --max-time 10 http://54.165.116.208 && \
echo "" && \
echo "=== 5. Test Domain (if DNS configured) ===" && \
curl -s -o /dev/null -w "Domain: HTTP %{http_code}\n" --max-time 10 http://wissenpublicationgroup.com || echo "Domain not accessible (DNS may not be configured)" && \
echo "" && \
echo "=== 6. Test Static Files ===" && \
curl -s -o /dev/null -w "Static CSS: HTTP %{http_code}\n" --max-time 5 http://localhost:3000/_next/static/css/app.css 2>/dev/null || echo "Static file test (404 is OK if file doesn't exist)" && \
echo "" && \
echo "=== 7. Port Status ===" && \
sudo ss -tlnp | grep -E ":3000|:3001|:80" && \
echo "" && \
echo "==========================================" && \
echo "✅ Verification Complete" && \
echo "==========================================" && \
echo "" && \
echo "If all services show HTTP 200 and PM2 shows 'online', your website is UP! 🎉"
```

---

## **QUICK STATUS CHECK**

```bash
pm2 list && \
echo "" && \
echo "Backend: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/health)" && \
echo "Frontend: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000)" && \
echo "Nginx: $(sudo systemctl is-active nginx)" && \
echo "Public: $(curl -s -o /dev/null -w '%{http_code}' --max-time 5 http://54.165.116.208)"
```

---

## **IF FRONTEND STILL SHOWS ERRORED**

If PM2 still shows frontend as "errored" but it's responding:

```bash
cd /var/www/wissen-publication-group && \
pm2 delete wissen-frontend && \
cd frontend && \
pm2 start npm --name wissen-frontend \
  --max-memory-restart 400M \
  --update-env \
  -- start && \
cd .. && \
pm2 save && \
sleep 10 && \
pm2 list
```

---

## **TEST FROM BROWSER**

1. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Visit:** `https://wissenpublicationgroup.com` or `http://54.165.116.208`
3. **Check browser console** (F12) for any errors
4. **Verify static files load** (no 400 errors)

---

**Your services are responding! Run the verification to confirm everything is fully operational.** ✅
