# Why the server (PM2) stopped – find the reason

When `pm2 list` is **empty**, the PM2 daemon is running but no apps are registered. Below are the most likely causes and how to check them **on the server** (after `ssh ubuntu@your-ec2-ip`).

---

## 1. Server reboot + PM2 not resurrecting

**Cause:** The instance was rebooted (AWS maintenance, crash, or manual reboot). PM2’s saved list lives in `~/.pm2/dump.pm2`. If `pm2 startup` was never run (or failed), or `dump.pm2` was missing/corrupt, PM2 starts with an empty list after reboot.

**Check on server:**
```bash
# Was PM2 startup configured for this user?
pm2 startup 2>&1 | head -5
# If it says "already launched" or shows a systemd command, it was configured.

# Is there a saved process list?
ls -la ~/.pm2/dump.pm2 2>/dev/null && echo "Found" || echo "No dump.pm2"

# When did the system last boot?
uptime
who -b
```

**Fix:** Start apps and save, then ensure startup is configured:
```bash
cd /var/www/wissen-publication-group
pm2 start ecosystem.config.js --update-env
pm2 save
pm2 startup
# Run the command it prints (sudo env PATH=...)
pm2 save
```

---

## 2. PM2 daemon was killed (`pm2 kill` or system)

**Cause:** Someone ran `pm2 kill`, or the system killed the PM2 process (OOM, `kill -9`). The next `pm2 list` starts a **new** daemon with no apps.

**Check on server:**
```bash
# Health monitor log (restarts only; doesn’t show why list was empty)
sudo cat /var/log/health-monitor.log 2>/dev/null | tail -30

# System log for OOM or kills (optional)
sudo dmesg 2>/dev/null | grep -i "kill\|oom" | tail -10
```

**Fix:** Same as above – `pm2 start ecosystem.config.js`, `pm2 save`, and `pm2 startup` if needed.

---

## 3. `pm2 delete all` without starting again

**Cause:** A script or manual run did `pm2 delete all` (or deleted the apps) and never ran `pm2 start` again. Some deploy scripts do `pm2 delete all` then `pm2 start ecosystem.config.js`; if the start step failed (e.g. missing `ecosystem.config.js`, wrong path, build missing), the list stays empty.

**Check on server:**
```bash
# Is the app and config there?
ls -la /var/www/wissen-publication-group/ecosystem.config.js
ls -la /var/www/wissen-publication-group/backend/dist/src/main.js
ls -la /var/www/wissen-publication-group/frontend/package.json
```

**Fix:** From project dir: `pm2 start ecosystem.config.js --update-env` then `pm2 save`. If `backend/dist` or frontend build is missing, run a full deploy from your machine (`./quick-deploy.sh`).

---

## 4. Wrong user or different $HOME

**Cause:** PM2 state is per-user (`~/.pm2`). If you previously ran PM2 as `root` or another user, `ubuntu`’s `pm2 list` can be empty.

**Check on server:**
```bash
whoami
echo $HOME
ls -la ~/.pm2/ 2>/dev/null || echo "No .pm2 dir"
```

**Fix:** Always use the same user (e.g. `ubuntu`). Run `pm2 start` and `pm2 save` as that user.

---

## 5. Disk full or read-only

**Cause:** If the disk filled up or the filesystem was read-only, PM2 might not have been able to write `dump.pm2` or logs, so state was lost after a restart or daemon restart.

**Check on server:**
```bash
df -h /
df -h /var
```

**Fix:** Free space (e.g. clear old logs, `pm2 flush`), then `pm2 start ecosystem.config.js`, `pm2 save`, and `pm2 startup` if needed.

---

## 6. New / replaced server

**Cause:** New EC2 instance, restored from snapshot, or new AMI. No PM2 state exists yet.

**Fix:** Deploy from your machine so code and env are correct, then on server:
```bash
cd /var/www/wissen-publication-group
pm2 start ecosystem.config.js --update-env
pm2 save
pm2 startup
# run the printed command, then:
pm2 save
```

---

## Quick “get back online” (on server)

```bash
cd /var/www/wissen-publication-group
pm2 start ecosystem.config.js --update-env
pm2 save
pm2 list
curl -s http://localhost:3001/health
```

Then ensure PM2 starts on reboot:
```bash
pm2 startup
# Run the sudo command it prints
pm2 save
```

---

## Summary

| Likely reason              | What to check on server                          | Fix |
|----------------------------|---------------------------------------------------|-----|
| Reboot, no PM2 startup     | `pm2 startup`, `ls ~/.pm2/dump.pm2`, `uptime`     | Start apps, `pm2 save`, `pm2 startup` |
| Daemon killed              | `pm2` was restarted with no apps                  | Start apps, `pm2 save` |
| `pm2 delete all` only      | Missing or failed `pm2 start` after delete        | `pm2 start ecosystem.config.js`, `pm2 save` |
| Wrong user                 | `whoami`, `~/.pm2`                                | Use same user, start + save |
| Disk full                  | `df -h /`                                         | Free space, then start + save |
| New server                 | No app code or no previous PM2                   | Deploy, then start + save + startup |

Running the “Quick get back online” commands and then the checks above will both restore the server and narrow down why it stopped.
