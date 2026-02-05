#!/bin/bash
# Run this ON THE SERVER (after SSH) to fix libssl.so.10 / LD_LIBRARY_PATH issue
# Paste line by line if needed, or run: bash fix-server-libssl.sh (after copying file to server)

echo "=== 1. Unset bad env in this session ==="
unset LD_LIBRARY_PATH
unset LD_PRELOAD
export LD_LIBRARY_PATH=""
export LD_PRELOAD=""

echo "=== 2. Test basic commands ==="
ls /var/www/wissen-publication-group 2>/dev/null && echo "ls OK" || echo "ls still broken"
curl -s -o /dev/null -w "" http://localhost:3001/health 2>/dev/null && echo "curl OK" || echo "curl still broken"

echo ""
echo "=== 3. Where is the bad LD_* set? ==="
grep -n "LD_LIBRARY_PATH\|LD_PRELOAD" ~/.bashrc ~/.profile ~/.bash_profile 2>/dev/null || true
grep -n "LD_LIBRARY_PATH\|LD_PRELOAD" /etc/environment 2>/dev/null || true

echo ""
echo "=== 4. Remove from ~/.bashrc ==="
if grep -q "LD_LIBRARY_PATH\|LD_PRELOAD" ~/.bashrc 2>/dev/null; then
  sed -i.bak '/LD_LIBRARY_PATH/d; /LD_PRELOAD/d' ~/.bashrc
  echo "Removed from .bashrc (backup: .bashrc.bak)"
else
  echo "Not found in .bashrc"
fi

echo "=== 5. Remove from ~/.profile ==="
if grep -q "LD_LIBRARY_PATH\|LD_PRELOAD" ~/.profile 2>/dev/null; then
  sed -i.bak '/LD_LIBRARY_PATH/d; /LD_PRELOAD/d' ~/.profile
  echo "Removed from .profile (backup: .profile.bak)"
else
  echo "Not found in .profile"
fi

echo ""
echo "=== 6. Check /etc/environment (sudo needed to edit) ==="
if grep -q "LD_LIBRARY_PATH\|LD_PRELOAD" /etc/environment 2>/dev/null; then
  echo "Found in /etc/environment. Run: sudo sed -i.bak '/LD_LIBRARY_PATH/d; /LD_PRELOAD/d' /etc/environment"
else
  echo "Not in /etc/environment"
fi

echo ""
echo "=== 7. PM2 status and restart ==="
cd /var/www/wissen-publication-group 2>/dev/null && pm2 list && pm2 restart all && pm2 save && echo "PM2 restarted OK" || echo "Fix env first then run: cd /var/www/wissen-publication-group && pm2 restart all && pm2 save"
echo ""
echo "Done. Open a NEW SSH session to confirm login is clean, then check: pm2 list && curl -s http://localhost:3001/health"
