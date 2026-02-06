#!/bin/bash
# Run this ON THE SERVER when PM2 list is empty (server "down").
# Usage: ssh to server, then: bash server-recover-pm2.sh
# Or from local: ssh -i key ubuntu@IP 'bash -s' < server-recover-pm2.sh

set -e
cd /var/www/wissen-publication-group

echo "=== Starting apps from ecosystem.config.js ==="
pm2 start ecosystem.config.js --update-env

echo "=== Saving process list (so reboot restores them) ==="
pm2 save

echo "=== PM2 list ==="
pm2 list

echo "=== Quick health check ==="
curl -s -m 3 http://localhost:3001/health && echo "" || echo "Backend not responding yet (wait a few seconds)"
curl -s -o /dev/null -w "Frontend HTTP: %{http_code}\n" -m 3 http://localhost:3000/ || true

echo ""
echo "Done. If you see both apps 'online', server is back up."
echo "Run 'pm2 save' again after any manual pm2 start so reboot restores correctly."
