# Run the server non-stop for years (no daily checks)

This checklist makes the server **self-healing** so it keeps running without you checking or restarting it daily. Do the **one-time setup** after each deploy; the rest is automatic.

---

## What keeps it running (already in your setup)

| Layer | What it does |
|-------|----------------|
| **PM2** | Restarts backend/frontend if they crash (autorestart). |
| **PM2 startup** | Starts all apps again after a server reboot. |
| **Health monitor (every 3 min)** | If backend or frontend doesn’t respond, restarts it. If a process is missing from PM2, starts it. |
| **Disk self-heal** | When disk usage ≥ 90%, health monitor runs a quick cleanup (journal, apt, PM2 logs) so disk doesn’t hit 100% and crash the app. |
| **Weekly disk cleanup** | Every Sunday 3 AM: full cleanup (journal 7d, apt, PM2 flush, trim health log). |
| **Daily restart (4 AM)** | Restarts all PM2 apps once a day to clear slowness and memory creep. |
| **Swap** | Reduces OOM kills when RAM is low. |
| **Memory limits** | PM2 restarts a process if it exceeds 500M (backend) / 1G (frontend). |

Together these give: **crash → restart**, **no response → restart**, **disk full → cleanup**, **daily refresh**, **reboot → apps come back**.

---

## One-time setup (do once after deploy)

Run these **on the server** (e.g. AWS Session Manager). Copy **one line at a time**.

**1. Run master setup (PM2, health monitor, disk cleanup cron, firewall, etc.)**
```bash
cd /var/www/wissen-publication-group && bash MASTER_SETUP.sh
```

**2. Ensure swap exists (if not already done)**
```bash
swapon --show || (sudo fallocate -l 1G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile && echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab)
```

**3. Ensure health-monitor log exists**
```bash
sudo touch /var/log/health-monitor.log && sudo chown ubuntu:ubuntu /var/log/health-monitor.log
```

**4. (Optional) Stop Ubuntu from rebooting the server for updates**  
If you want **zero** reboots from automatic updates:
```bash
echo 'Unattended-Upgrade::Automatic-Reboot "false";' | sudo tee /etc/apt/apt.conf.d/99no-reboot
```

**5. (Optional) Increase disk so it never fills**  
In AWS: EC2 → Volumes → Modify volume (e.g. 20–30 GB). Then on the server (use your device from `lsblk`):
```bash
sudo growpart /dev/nvme0n1 1 && sudo resize2fs /dev/nvme0n1p1
```

After this one-time setup you don’t need to check or restart the server daily. It will:

- Restart crashed or stuck apps (health monitor every 3 min).
- Clean disk when it gets high (health monitor) and weekly (Sunday 3 AM).
- Restart all apps once a day (4 AM) to avoid long-term slowness.
- Survive reboots (PM2 startup).

---

## When the whole site is down (rare)

If the **entire** server or Node is down, the in-app “Restart services” button can’t run (no API). Use one of these **without logging in daily**:

1. **Bookmark the Lambda restart URL** (see `lambda-restart-server/README.md`). When the site is down, open the bookmark; Lambda runs the restart via SSM. No SSH needed.
2. Or use **AWS Session Manager** and run:  
   `cd /var/www/wissen-publication-group && pm2 restart all && pm2 save`

---

## Optional: EC2 recovery on hardware failure

If the **instance** itself fails (hardware), AWS can start a new one from the same AMI. You can add a **CloudWatch alarm** that triggers **EC2 recover** (or an Auto Scaling group with min=1). That’s optional and configured in AWS Console (EC2 / CloudWatch), not in this repo.

---

## Summary

- **Do once after deploy:** Run `MASTER_SETUP.sh` on the server, ensure swap and health log, optionally disable auto-reboot and increase disk.
- **No daily checks:** Health monitor + disk self-heal + weekly cleanup + daily 4 AM restart keep the app and disk under control.
- **If site is fully down:** Use the Lambda restart URL (bookmark) or Session Manager once; no need to “check daily.”
