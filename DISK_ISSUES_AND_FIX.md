# Why disk fills and how to fix it

Disk on the server keeps filling because of **logs and caches**. Fix by (1) **increasing disk size** when needed and (2) **automatic cleanup** so it doesn’t fill again.

---

## Why disk fills

| What | Where | Why it grows |
|------|--------|--------------|
| System journal | `/var/log/journal/` | All systemd logs; never rotated by default on some setups |
| PM2 logs | `~/.pm2/logs/` or app `backend/logs`, `frontend/logs` | App stdout/stderr; no rotation by default |
| Apt cache | `/var/cache/apt/` | Downloaded packages |
| Health monitor log | `/var/log/health-monitor.log` | One line per check (every 3–5 min) |
| Nginx logs | `/var/log/nginx/` | Access/error logs |

Once usage is high (~90%+), the app can slow down or crash. So: **increase space** and **run cleanup regularly**.

---

## 1. Increase disk (EBS volume) when required

Your root volume is small (e.g. 8 GB). You can resize it in AWS, then grow the partition and filesystem on the server.

### In AWS Console

1. **EC2 → Volumes** → select the volume attached to your instance.
2. **Actions → Modify volume** → set new size (e.g. **20** or **30** GB) → **Modify**.
3. Wait until state is **in-use** and **optimizing** finishes.
4. On the server, **grow partition and filesystem** (see commands below).

### On the server (after resizing in AWS)

Run **one line at a time** (copy only the command):

**See current disk and partition:**
```bash
lsblk && df -h /
```

**Grow partition (Ubuntu 22.04, common case – one partition on root disk):**
```bash
sudo growpart /dev/nvme0n1 1
```

(If your root device is different, e.g. `/dev/xvda`, use that: `sudo growpart /dev/xvda 1`. Use `lsblk` to confirm.)

**Grow filesystem:**
```bash
sudo resize2fs /dev/nvme0n1p1
```

(Again, use the correct partition from `lsblk`, e.g. `/dev/xvda1`.)

**Check:**
```bash
df -h /
```

You should see the new size. No reboot needed.

---

## 2. Prevent disk from filling (automatic cleanup)

A **weekly cleanup** keeps logs and caches under control so disk doesn’t creep back to 98%.

### Option A – Run cleanup script weekly (recommended)

On the server, the script `disk-cleanup.sh` is in the repo. After deploy, run once:

**Create log file and add cron (copy one line):**
```bash
sudo touch /var/log/disk-cleanup.log && sudo chown ubuntu:ubuntu /var/log/disk-cleanup.log
```
```bash
(crontab -l 2>/dev/null | grep -v disk-cleanup; echo "0 3 * * 0 /var/www/wissen-publication-group/disk-cleanup.sh") | crontab -
```

This runs cleanup every **Sunday at 3:00 AM**: trims journal (7 days), runs `apt-get clean`, flushes PM2 logs, trims health-monitor log.

### Option B – One-off manual cleanup

When disk is already high, run (copy one line at a time):

```bash
sudo journalctl --vacuum-time=7d
```
```bash
sudo apt-get clean
```
```bash
pm2 flush
```
```bash
df -h /
```

---

## 3. Quick reference

| Goal | Action |
|------|--------|
| **Why is disk full?** | `du -sh /var/log/* ~/.pm2/logs /var/www/wissen-publication-group/*/logs 2>/dev/null` |
| **Free space now** | `sudo journalctl --vacuum-time=7d` then `sudo apt-get clean` then `pm2 flush` |
| **Increase disk** | AWS: EC2 → Volumes → Modify volume. Then on server: `growpart` + `resize2fs` (see above). |
| **Prevent filling** | Add weekly cron for `disk-cleanup.sh` (see Option A). |

After increasing the volume and enabling weekly cleanup, disk should stop being a recurring issue.
