#!/bin/bash
# ==========================================
# Disk cleanup - run weekly on server to prevent disk from filling.
# Install: copy to server, chmod +x, add to crontab: 0 3 * * 0 /var/www/wissen-publication-group/disk-cleanup.sh
# ==========================================

LOG="/var/log/disk-cleanup.log"
exec >> "$LOG" 2>&1

echo "[$(date)] Starting disk cleanup..."

# Trim system journal (keep 7 days)
if command -v journalctl &>/dev/null; then
    sudo journalctl --vacuum-time=7d 2>/dev/null && echo "  journalctl vacuum done" || true
fi

# Apt cache
sudo apt-get clean 2>/dev/null && echo "  apt clean done" || true

# PM2 log files (flush content, keeps PM2 running)
if command -v pm2 &>/dev/null; then
    pm2 flush 2>/dev/null && echo "  pm2 flush done" || true
fi

# Trim health-monitor log (keep last 500 lines)
if [ -f /var/log/health-monitor.log ]; then
    tail -500 /var/log/health-monitor.log > /var/log/health-monitor.log.tmp
    mv /var/log/health-monitor.log.tmp /var/log/health-monitor.log
    echo "  health-monitor log trimmed"
fi

echo "[$(date)] Cleanup done. $(df -h / | awk 'NR==2 {print "Disk: " $5 " used, " $4 " free"}')"
