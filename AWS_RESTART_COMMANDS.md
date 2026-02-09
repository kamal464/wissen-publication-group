# Quick restart in AWS browser terminal

**Tip:** When copying commands from this doc, copy **only the lines inside the code blocks** (the `bash` lines). Do not paste the whole page or markdown—that causes "command not found" errors.

When the webapp is slow after not using it, restart the app on the EC2 instance.

## 1. Open terminal on the server

- **EC2**: Connect via **Session Manager** (browser) or **SSH** (browser client or your machine).
- You should be logged in as `ubuntu` (or the user that runs the app).

---

## 2. One-line restart (copy-paste)

```bash
cd /var/www/wissen-publication-group && pm2 restart all && pm2 save && pm2 status
```

If your app is in a different path (e.g. `/home/ubuntu/universal-publishers`), use that instead:

```bash
cd /home/ubuntu/universal-publishers && pm2 restart all && pm2 save && pm2 status
```

---

## 3. Using the restart script (after first deploy)

If `restart-on-server.sh` is on the server:

```bash
cd /var/www/wissen-publication-group && chmod +x restart-on-server.sh && ./restart-on-server.sh
```

---

## 4. Restart only backend or only frontend

```bash
cd /var/www/wissen-publication-group
pm2 restart wissen-backend && pm2 save
# or
pm2 restart wissen-frontend && pm2 save
pm2 status
```

---

## 5. If PM2 says "No process found"

Start apps from the ecosystem file, then save:

```bash
cd /var/www/wissen-publication-group
pm2 start ecosystem.config.js --update-env
pm2 save
pm2 status
```

---

**Summary:** In the AWS browser terminal, run:

```bash
cd /var/www/wissen-publication-group && pm2 restart all && pm2 save && pm2 status
```
