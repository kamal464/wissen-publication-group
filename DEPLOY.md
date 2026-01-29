# Deploy: Build locally → deploy to AWS

**Why:** Build runs on your machine (no OOM on EC2, no 15–25 min server build). Deploy is just sync + restart (~1–2 min).

## One-time on server

Run **once** on the EC2 instance (e.g. via SSH) so PM2 and the app dir exist:

```bash
# Clone repo (if not done), then:
cd /var/www/wissen-publication-group
./MASTER_SETUP.sh
```

Or: clone manually, install Node/PM2, create `/var/www/wissen-publication-group`, and run the app start commands from `MASTER_SETUP.sh`. After that, use the local deploy script for all future updates.

## Every deploy (from your machine)

1. **Set env vars** (use your EC2 host and key):

   ```bash
   export DEPLOY_HOST=ubuntu@ec2-xx-xx-xx-xx.compute.amazonaws.com
   export DEPLOY_KEY=~/.ssh/your-key.pem
   export REMOTE_PATH=/var/www/wissen-publication-group   # optional; default is this
   ```

   Optional: put these in a file and source before deploy (do not commit):

   ```bash
   # .env.deploy (add to .gitignore if you create it)
   export DEPLOY_HOST=ubuntu@your-ec2-dns
   export DEPLOY_KEY=~/.ssh/wissen-secure-key.pem
   ```

   Then: `source .env.deploy` before running the script.

2. **Run the deploy script** (builds locally, syncs, restarts on server):

   ```bash
   ./deploy-to-aws.sh
   ```

   **Windows:** Use **Git Bash** or **WSL** so `bash` and `rsync` are available. Or install `rsync` (e.g. Chocolatey) and run in Git Bash.

## What the script does

1. Builds **backend** (`npm run build` in `backend/`).
2. Builds **frontend** (`npm run build` in `frontend/`).
3. **Rsyncs** project to EC2 (includes `frontend/.next` and `backend/dist`; excludes `node_modules` and `.git`).
4. **SSH** into EC2: `npm install --omit=dev` in backend and frontend, then `pm2 restart all`.

Total time is roughly: your local build time + 1–2 min sync + ~30 s install/restart.

## Requirements

- **Local:** Node 18+, npm, bash, rsync, ssh.
- **Server:** Node 18+, PM2, app already set up once (e.g. via `MASTER_SETUP.sh`).
- **Server .env:** Backend and frontend `.env` must exist on the server (create/copy them once; the script does not overwrite `.env`).
