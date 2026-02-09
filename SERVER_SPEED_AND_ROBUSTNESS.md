# Server speed and robustness

**DO NOT paste this page into the terminal.** Copy only a single line from inside a code block (the line that starts with a command like `free` or `sudo`). Pasting the whole page corrupts your shell config.

**Want the server to run non-stop for years without daily checks?** See **`RUN_FOREVER.md`** for the full checklist and one-time setup.

Fix shell errors, find why the server is slow or goes down, and harden so it stays up under load.

---

## 1. Fix shell errors (.profile and .bashrc)

Run **on the server** in the AWS browser terminal.

**Option A – One-off fix (comment out the bad lines):**
```bash
# Fix .profile line 10
sudo sed -i '10s/^/# FIXED: /' /home/ubuntu/.profile

# Fix .bashrc line 31
sudo sed -i '31s/^/# FIXED: /' /home/ubuntu/.bashrc
```

**Option B – Use the fix script (after it’s on the server):**
```bash
cd /var/www/wissen-publication-group && bash fix-server-shell.sh
```

Then open a **new** session or run:
```bash
source /home/ubuntu/.profile
source /home/ubuntu/.bashrc
```

---

## 2. Commands to find why the server is slow or down

Run these **on the server** to see what’s wrong.

**Memory and load:**
```bash
free -h && echo "---" && uptime
```

**Disk:**
```bash
df -h
```

**PM2 status and restart counts (high restarts = crashing):**
```bash
pm2 list
pm2 show wissen-backend | grep -E "restart|memory|uptime"
pm2 show wissen-frontend | grep -E "restart|memory|uptime"
```

**Recent health monitor and PM2 logs:**
```bash
tail -50 /var/log/health-monitor.log
pm2 logs --lines 30 --nostream
```

**Backend errors:**
```bash
tail -100 /var/www/wissen-publication-group/backend/logs/backend-error.log
```

**Swap (if no swap, OOM can kill the app):**
```bash
swapon --show
```

**One-shot diagnostic (copy-paste):**
```bash
echo "=== Memory ===" && free -h && echo "=== Load ===" && uptime && echo "=== Disk ===" && df -h / && echo "=== PM2 ===" && pm2 list && echo "=== Health log ===" && (tail -20 /var/log/health-monitor.log 2>/dev/null || echo "No health log yet (run: sudo touch /var/log/health-monitor.log && sudo chown ubuntu:ubuntu /var/log/health-monitor.log)")
```

---

## 3. Why the server might stop at midnight

**What we added:** A **daily PM2 restart at 4:00 AM** server time (`0 4 * * *`), not midnight. If your server uses UTC and you are in a different timezone, 4 AM UTC can feel like “night” (e.g. 9:30 AM IST).

**Other common causes of “stops at midnight”:**

| Cause | What happens |
|-------|----------------|
| **Daily PM2 restart** | We restart at **4 AM** server time. If that matches “midnight” in your timezone, that’s the restart. |
| **Unattended-upgrades** | Ubuntu can run security updates (and optionally **reboot**) in the early hours. That can look like “server stopped at midnight”. |
| **OOM killer** | A nightly job (updates, backups) uses a lot of memory; the kernel kills Node and the app stops. |
| **System cron** | Something in `/etc/cron.d/` or root’s crontab runs at 00:00 and affects the app. |

**Commands to run on the server (copy one at a time):**

See your scheduled jobs (user + our daily restart):
```bash
crontab -l
```

See server time and timezone (so you know what “4 AM” or “midnight” is):
```bash
date && timedatectl
```

See if unattended-upgrades is allowed to reboot (can cause “stop” at night):
```bash
grep -r Reboot /etc/apt/apt.conf.d/ 2>/dev/null || true
```

See recent reboots:
```bash
last reboot
```

See if the kernel killed a process (OOM) recently:
```bash
sudo dmesg -T | grep -i "out of memory\|oom\|killed process" | tail -20
```

**Change or remove the daily 4 AM restart:**  
To remove it, run `crontab -e` and delete the line with `pm2 restart`.  
To move it to a different time (e.g. 5:30 AM), replace `0 4` with `30 5` in that line (minute hour).

**Stop unattended-upgrades from rebooting the server:**  
If you see `Unattended-Upgrade::Automatic-Reboot "true"` in the grep above and want to disable reboots:
```bash
echo 'Unattended-Upgrade::Automatic-Reboot "false";' | sudo tee /etc/apt/apt.conf.d/99no-reboot
```

---

## 4. Make the server faster and more robust

Already in place (from `MASTER_SETUP.sh`):

- PM2 auto-restart on crash  
- PM2 auto-start on reboot  
- Health monitor every 5 minutes  
- Firewall, fail2ban, auto-updates  
- Memory limits (backend 500M, frontend 1G)

**Run on the server:**

**A. Add swap (reduces OOM kills when memory is low):**
```bash
sudo fallocate -l 1G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile && echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab && free -h
```

**B. Slightly lower PM2 memory limits (restart earlier, avoid big spikes):**  
After next deploy, your `ecosystem.config.js` already has `max_memory_restart`. If the server has limited RAM (e.g. 1GB), consider lowering to 400M / 800M so PM2 restarts before the system runs out of memory.

**C. Restart apps once daily (clears slow memory leaks):**  
Add a cron job on the server:
```bash
(crontab -l 2>/dev/null | grep -v "pm2 restart"; echo "0 4 * * * cd /var/www/wissen-publication-group && pm2 restart all && pm2 save") | crontab -
```
(Restarts at 4:00 AM server time.)

**D. Re-run master setup (reapply PM2, health monitor, firewall):**
```bash
cd /var/www/wissen-publication-group && bash MASTER_SETUP.sh
```

---

## 5. Quick reference

| Goal                    | Command |
|-------------------------|--------|
| Fix .profile /.bashrc   | `sudo sed -i '10s/^/# FIXED: /' /home/ubuntu/.profile` then `sudo sed -i '31s/^/# FIXED: /' /home/ubuntu/.bashrc` |
| Restart app when slow   | `cd /var/www/wissen-publication-group && pm2 restart all && pm2 save && pm2 status` |
| Restart when site is **down** | Use **Lambda + SSM** (no app needed). See **`lambda-restart-server/README.md`**. |
| **Disk full / always an issue** | Increase EBS size in AWS, then run `growpart` + `resize2fs`. Use **`disk-cleanup.sh`** + weekly cron. See **`DISK_ISSUES_AND_FIX.md`**. |
| Check why slow/down     | `free -h; uptime; pm2 list; tail -30 /var/log/health-monitor.log` |
| Add swap                | See section 3A above |
| Daily restart at 4 AM   | See section 3C above |

---

**Important:** When copying from this doc, copy **only the bash code blocks**, not the surrounding markdown (headers, bullets, or backticks). Pasting full markdown into the terminal causes "command not found" errors.
