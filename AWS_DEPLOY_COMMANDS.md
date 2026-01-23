# 🚀 Quick AWS Deploy Commands

**Copy and paste these commands in AWS Systems Manager Session Manager or SSH terminal**

## 🔌 **HOW TO CONNECT:**

### Option 1: AWS Session Manager (Recommended - No SSH Key!)
1. EC2 Console → Select instance → **Connect** → **Session Manager** tab → **Connect**
2. Opens browser terminal - no SSH keys needed!

### Option 2: EC2 Instance Connect (Browser Terminal)
1. EC2 Console → Select instance → **Connect** → **EC2 Instance Connect** tab → **Connect**
2. Opens browser terminal directly

### Option 3: SSH (Requires Key File)
```bash
# Windows PowerShell
ssh -i "$env:USERPROFILE\.ssh\Ec2-Tutorial.pem" ubuntu@54.165.116.208

# Linux/Mac
ssh -i ~/.ssh/Ec2-Tutorial.pem ubuntu@54.165.116.208
```

**Having connection issues?** See `AWS_CONNECTION_TROUBLESHOOTING.md`

---

## ⚠️ **STUCK COMMAND? CTRL+C NOT WORKING?**

**Quick Fix: Open a NEW terminal session and kill the process**

1. **Open NEW terminal**: EC2 Console → Connect → **Open in new tab/window**
2. **Kill stuck process**:
```bash
# Kill npm processes
pkill -9 npm

# Kill git processes  
pkill -9 git

# Or find and kill specific process
ps aux | grep -E "npm|git|node" | grep -v grep
# Then: sudo kill -9 <PID>
```

3. **Go back to original terminal** - it should be responsive now

---

## 🚨 **INSTANCE REACHABILITY CHECK FAILED?**

**This means the instance is not responding. Quick fix:**

1. **Reboot instance**: EC2 Console → Instances → Select instance → **Instance state** → **Reboot instance**
2. Wait 3-5 minutes
3. Check status again
4. If still failing: **Stop instance**, wait 2 min, then **Start instance** (⚠️ gets new IP!)

**After reboot, if accessible:**
- Check disk space: `df -h /`
- Clean up if full (see cleanup commands below)
- Restart services: `pm2 restart all && sudo systemctl restart nginx`

**See `INSTANCE_REACHABILITY_FIX.md` for detailed troubleshooting**

---

## 💾 **CHECK DISK SPACE (Run First!):**

```bash
df -h && \
echo "---" && \
du -sh /var/www/wissen-publication-group/* 2>/dev/null | sort -h
```

---

## 🧹 **CLEANUP DISK SPACE (If Full):**

```bash
cd /var/www/wissen-publication-group && \
echo "Cleaning npm cache..." && \
npm cache clean --force && \
echo "Cleaning backend..." && \
cd backend && rm -rf node_modules dist && \
echo "Cleaning frontend..." && \
cd ../frontend && rm -rf node_modules .next && \
echo "Cleaning logs..." && \
cd .. && \
sudo journalctl --vacuum-time=7d && \
sudo find /var/log -type f -name "*.log" -mtime +7 -delete 2>/dev/null && \
echo "Cleaning PM2 logs..." && \
pm2 flush && \
echo "✅ Cleanup complete!" && \
df -h
```

---

## 🚨 **NPM INSTALL STUCK? FIX IT:**

### Step 1: Cancel the stuck command

**If Ctrl+C doesn't work in browser terminal:**

**Option A: Open a NEW terminal session**
1. EC2 Console → Select instance → **Connect** → Open a **NEW** Session Manager/EC2 Instance Connect window
2. In the NEW terminal, kill the stuck process:
```bash
# Find the stuck npm process
ps aux | grep npm | grep -v grep

# Kill it (replace PID with actual process ID)
sudo kill -9 <PID>

# Or kill all npm processes
pkill -9 npm
```

**Option B: Try these key combinations:**
- `Ctrl + Z` (suspend, then `kill %1`)
- `Ctrl + \` (force quit)
- `Ctrl + D` (exit)
- `Esc` then type `:q!` (if in vim-like mode)

**Option C: Close and reopen the terminal**
- Close the browser terminal tab/window
- Reconnect via EC2 Console → Connect
- Kill the stuck process from new session

### Step 2: Check what's happening
```bash
cd /var/www/wissen-publication-group/backend
# Check if npm is actually running
ps aux | grep npm

# Check disk space
df -h /

# Check npm cache
npm cache verify
```

### Step 3: Use npm install with progress and timeout
```bash
cd /var/www/wissen-publication-group/backend && \
npm install --loglevel=verbose --progress=true --no-audit --no-fund
```

### Step 4: If still stuck, clean and retry
```bash
cd /var/www/wissen-publication-group/backend && \
rm -rf node_modules package-lock.json && \
npm cache clean --force && \
npm install --no-audit --no-fund
```

### Step 5: If npm error ENOTEMPTY (corrupted node_modules)
```bash
cd /var/www/wissen-publication-group/backend && \
echo "Removing corrupted node_modules..." && \
sudo rm -rf node_modules package-lock.json && \
npm cache clean --force && \
echo "Reinstalling dependencies..." && \
npm install --no-audit --no-fund --loglevel=error
```

### Step 6: If Prisma migration error P3005 (database not empty)
```bash
cd /var/www/wissen-publication-group/backend && \
echo "Resolving Prisma migration baseline..." && \
npx prisma migrate resolve --applied 0_init || true && \
npx prisma migrate deploy || \
echo "⚠️ Migration issue - database may already be up to date. Continuing..."
```

### Step 7: If TypeScript build error (e.g., 'tags' does not exist)
```bash
cd /var/www/wissen-publication-group/backend && \
echo "Fixing TypeScript error..." && \
# Remove tags field from BoardMember create (if it exists)
sed -i '/tags: memberData.tags,/d' src/admin/admin.service.ts && \
echo "✅ Fixed - rebuilding..." && \
npm run build
```

### Step 8: If PM2 process not found (use start instead of restart)
```bash
cd /var/www/wissen-publication-group/backend && \
pm2 start dist/src/main.js --name wissen-backend --update-env && \
pm2 save
```

---

## 🚨 **GIT PULL STUCK? FIX IT:**

### Step 1: Cancel the stuck command

**If Ctrl+C doesn't work:**
1. **Open a NEW terminal session** (EC2 Console → Connect → New session)
2. **Kill the stuck git process:**
```bash
# Find stuck git process
ps aux | grep git | grep -v grep

# Kill it
sudo kill -9 <PID>
# Or kill all git processes
pkill -9 git
```

**Or try:** `Ctrl + Z` then `kill %1` or `Ctrl + \`

### Step 2: Check git status
```bash
cd /var/www/wissen-publication-group
git status
```

### Step 3: Fix and pull again
```bash
# If there are local changes, stash them
git stash

# Or if you want to discard local changes (CAREFUL!)
# git reset --hard HEAD

# Configure git to not prompt (if using HTTPS)
git config --global credential.helper store
git config --global pull.rebase false

# Pull with timeout and no prompts
GIT_TERMINAL_PROMPT=0 timeout 30 git pull origin main

# If still stuck, use fetch + merge instead
git fetch origin main
git merge origin/main
```

### Step 4: If merge conflict
```bash
# Check what files have conflicts
git status

# If you want to keep remote version (CAREFUL - loses local changes!)
git reset --hard origin/main

# Or manually resolve conflicts, then:
git add .
git commit -m "Merge remote changes"
```

---

## 📥 **PULL & DEPLOY (Complete - All-in-One - Non-blocking with Progress):**

```bash
cd /var/www/wissen-publication-group && \
df -h / && \
echo "=== Fixing PostgreSQL (if needed) ===" && \
sudo systemctl restart postgresql && \
sleep 3 && \
echo "=== Pulling latest code ===" && \
GIT_TERMINAL_PROMPT=0 git fetch origin main && \
git reset --hard origin/main && \
cd backend && \
echo "Installing backend dependencies..." && \
npm install --no-audit --no-fund --loglevel=error && \
npx prisma generate && \
echo "Running migrations (fixes schema issues)..." && \
npx prisma migrate deploy && \
echo "Ensuring missing columns exist..." && \
psql $DATABASE_URL -c 'ALTER TABLE "Journal" ADD COLUMN IF NOT EXISTS "content" TEXT;' 2>/dev/null || true && \
echo "Building backend..." && \
npm run build && \
pm2 restart wissen-backend && \
cd ../frontend && \
echo "Installing frontend dependencies..." && \
npm install --no-audit --no-fund --loglevel=error && \
echo "Building frontend..." && \
npm run build && \
pm2 restart wissen-frontend && \
cd .. && \
sudo nginx -t && sudo systemctl reload nginx && \
echo "✅ Deployment complete!" && \
pm2 list
```

**Note:** This uses `git reset --hard` which discards local changes. The `--no-audit --no-fund` flags speed up npm install and prevent hanging on security audits. **Includes database schema fixes.**

---

## 📥 **PULL & DEPLOY (Step-by-Step):**

### 1. Navigate and Pull
```bash
cd /var/www/wissen-publication-group
git pull origin main
```

### 2. Backend Deployment
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart wissen-backend
```

### 3. Frontend Deployment
```bash
cd ../frontend
npm install
npm run build
pm2 restart wissen-frontend
```

### 4. Reload Nginx
```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 🔍 **VERIFY DEPLOYMENT:**

```bash
pm2 list && \
curl -s http://localhost:3001/api/health && echo "" && \
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:3000
```

---

## ⚡ **QUICK PULL ONLY (No Build - Non-blocking):**

```bash
cd /var/www/wissen-publication-group && \
GIT_TERMINAL_PROMPT=0 git fetch origin main && \
git reset --hard origin/main && \
pm2 restart all && \
sudo systemctl reload nginx
```

**Alternative (if you need to preserve local changes):**
```bash
cd /var/www/wissen-publication-group && \
git stash && \
GIT_TERMINAL_PROMPT=0 git pull origin main && \
pm2 restart all && \
sudo systemctl reload nginx
```

---

## 🔄 **PULL + REBUILD (Full Clean Build):**

```bash
cd /var/www/wissen-publication-group && \
df -h / && \
git pull origin main && \
cd backend && \
rm -rf node_modules dist && \
npm cache clean --force && \
npm install && \
npx prisma generate && \
npx prisma migrate deploy && \
npm run build && \
pm2 restart wissen-backend && \
cd ../frontend && \
rm -rf node_modules .next && \
npm cache clean --force && \
npm install && \
npm run build && \
pm2 restart wissen-frontend && \
cd .. && \
sudo nginx -t && sudo systemctl reload nginx && \
pm2 list && \
df -h /
```

---

## 📊 **CHECK STATUS:**

```bash
pm2 status && \
echo "---" && \
curl -s http://localhost:3001/api/health && echo "" && \
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:3000 && \
sudo systemctl status nginx | head -3
```

---

## 🆘 **IF DEPLOYMENT FAILS:**

```bash
cd /var/www/wissen-publication-group && \
pm2 logs --lines 20 && \
sudo tail -20 /var/log/nginx/error.log
```

---

## 🚨 **502 BAD GATEWAY? FIX IT:**

### Step 1: Check if services are listening on correct ports
```bash
# Check what ports are in use
sudo ss -tlnp | grep -E ':3000|:3001'

# Check PM2 status
pm2 list

# Check if services are actually running
curl -s http://localhost:3001/api/health || echo "Backend not responding"
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:3000 || echo "Frontend not responding"
```

### Step 2: Check PM2 logs for errors
```bash
# Backend logs
pm2 logs wissen-backend --lines 30 --nostream

# Frontend logs (check why it's crashing)
pm2 logs wissen-frontend --lines 50 --nostream

# Check backend health (try different endpoints)
curl -s http://localhost:3001/health || curl -s http://localhost:3001/api/health || echo "Backend not responding"
```

### Step 3: Restart services if needed
```bash
cd /var/www/wissen-publication-group && \
pm2 restart all && \
sleep 5 && \
pm2 list && \
curl -s http://localhost:3001/api/health && echo "" && \
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:3000
```

### Step 4: Check Nginx configuration
```bash
# Test Nginx config
sudo nginx -t

# Check Nginx error log
sudo tail -30 /var/log/nginx/error.log

# Reload Nginx
sudo systemctl reload nginx
```

### Step 5: If services aren't starting, check environment variables
```bash
cd /var/www/wissen-publication-group/backend && \
# Check if .env exists
ls -la .env && \
# Check if frontend .env exists
cd ../frontend && \
ls -la .env.production .env.local
```

### Step 6: Fix frontend crash - "next: not found" error
```bash
cd /var/www/wissen-publication-group/frontend && \
echo "Checking dependencies..." && \
# Check if node_modules exists
[ ! -d node_modules ] && echo "Installing dependencies..." && npm install --no-audit --no-fund --loglevel=error || echo "Dependencies OK" && \
# Check if build exists
[ ! -d .next ] && echo "Building frontend..." && npm run build || echo "Build exists" && \
# Verify next is available
npx next --version && \
echo "✅ Frontend ready!"
```

### Step 7: Restart frontend after fixing
```bash
cd /var/www/wissen-publication-group && \
pm2 delete wissen-frontend && \
sleep 2 && \
cd frontend && \
# Make sure dependencies and build exist
npm install --no-audit --no-fund --loglevel=error && \
npm run build && \
# Start frontend
pm2 start npm --name wissen-frontend -- start --update-env && \
sleep 15 && \
pm2 save && \
pm2 list
```

### Step 7: Complete service restart (if all else fails)
```bash
cd /var/www/wissen-publication-group && \
pm2 delete all && \
sleep 2 && \
# Kill any processes on ports 3000/3001
sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true && \
sudo lsof -ti:3001 | xargs sudo kill -9 2>/dev/null || true && \
sleep 2 && \
# Start backend
cd backend && \
pm2 start dist/src/main.js --name wissen-backend --update-env && \
sleep 8 && \
# Start frontend (make sure .env.production exists)
cd ../frontend && \
pm2 start npm --name wissen-frontend -- start --update-env && \
sleep 15 && \
cd .. && \
pm2 save && \
sudo systemctl reload nginx && \
echo "✅ Services restarted!" && \
pm2 list && \
echo "Testing backend..." && \
curl -s http://localhost:3001/health || curl -s http://localhost:3001/api/health && echo "" && \
echo "Testing frontend..." && \
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:3000
```

---

## 🚨 **DATABASE SCHEMA ERRORS? FIX IT:**

### Issue 1: Missing Column Error (e.g., "Journal.content does not exist")

**Robust Fix:**
```bash
cd /var/www/wissen-publication-group && \
echo "=== STEP 1: Fix Disk Space (PostgreSQL needs space) ===" && \
df -h / && \
npm cache clean --force 2>/dev/null || true && \
sudo journalctl --vacuum-time=3d 2>/dev/null || true && \
pm2 flush 2>/dev/null || true && \
echo "" && \
echo "=== STEP 2: Fix PostgreSQL ===" && \
sudo systemctl restart postgresql && \
sleep 5 && \
echo "" && \
echo "=== STEP 3: Pull Latest Code (with migrations) ===" && \
GIT_TERMINAL_PROMPT=0 git fetch origin main && \
git reset --hard origin/main && \
echo "" && \
echo "=== STEP 4: Baseline Database (if P3005 error) ===" && \
cd backend && \
# Mark all existing migrations as applied (baseline) \
npx prisma migrate resolve --applied 20251006203133_init || true && \
npx prisma migrate resolve --applied 20251012045546_add_message_model || true && \
npx prisma migrate resolve --applied 20251012060000_add_journal_metadata || true && \
npx prisma migrate resolve --applied 20251013173529_add_keywords_to_article || true && \
npx prisma migrate resolve --applied 20251102144446_add_admin_models || true && \
npx prisma migrate resolve --applied 20251116092017_add_user_password || true && \
npx prisma migrate resolve --applied 20251126184536_add_journal_image_fields || true && \
npx prisma migrate resolve --applied 20251126194208_add_homepage_fields || true && \
npx prisma migrate resolve --applied 20251128161310_update_board_member_fields || true && \
npx prisma migrate resolve --applied 20251202191526_add_volume_issue_year_to_articles || true && \
echo "" && \
echo "=== STEP 5: Apply New Migrations ===" && \
npx prisma migrate deploy && \
npx prisma generate && \
echo "" && \
echo "=== STEP 6: Manually Add Missing Column (if migration doesn't exist) ===" && \
psql $DATABASE_URL -c 'ALTER TABLE "Journal" ADD COLUMN IF NOT EXISTS "content" TEXT;' 2>/dev/null || echo "Column may already exist or migration handled it" && \
echo "" && \
echo "=== STEP 7: Verify Schema ===" && \
psql $DATABASE_URL -c 'SELECT column_name FROM information_schema.columns WHERE table_name = '\''Journal'\'' AND column_name = '\''content'\'';' && \
echo "" && \
echo "=== STEP 8: Restart Backend ===" && \
cd .. && \
pm2 restart wissen-backend && \
sleep 5 && \
pm2 list && \
echo "✅ Database schema fixed!"
```

### Issue 1b: P3005 Error (Database schema not empty - Migration baseline needed)

**If you get `Error: P3005` when running `prisma migrate deploy`:**

```bash
cd /var/www/wissen-publication-group/backend && \
echo "=== Baselines existing migrations ===" && \
# Mark all existing migrations as applied (baseline the database) \
# Only mark migrations that actually exist on the server \
npx prisma migrate resolve --applied 20251006203133_init || true && \
npx prisma migrate resolve --applied 20251012045546_add_message_model || true && \
npx prisma migrate resolve --applied 20251012060000_add_journal_metadata || true && \
npx prisma migrate resolve --applied 20251013173529_add_keywords_to_article || true && \
npx prisma migrate resolve --applied 20251102144446_add_admin_models || true && \
npx prisma migrate resolve --applied 20251116092017_add_user_password || true && \
npx prisma migrate resolve --applied 20251126184536_add_journal_image_fields || true && \
npx prisma migrate resolve --applied 20251126194208_add_homepage_fields || true && \
npx prisma migrate resolve --applied 20251128161310_update_board_member_fields || true && \
# Skip missing migrations - only mark if directory exists \
[ -d "prisma/migrations/20251202191526_add_volume_issue_year_to_articles" ] && npx prisma migrate resolve --applied 20251202191526_add_volume_issue_year_to_articles || echo "Skipping missing migration 20251202191526" && \
echo "" && \
echo "=== Now apply new migrations ===" && \
npx prisma migrate deploy && \
npx prisma generate && \
echo "" && \
echo "=== Manually add missing Journal.content column ===" && \
# Use DATABASE_URL from .env file \
source .env 2>/dev/null || true && \
psql "$DATABASE_URL" -c 'ALTER TABLE "Journal" ADD COLUMN IF NOT EXISTS "content" TEXT;' 2>/dev/null || \
# Fallback: use postgres user if DATABASE_URL not set \
sudo -u postgres psql wissen_publication_group -c 'ALTER TABLE "Journal" ADD COLUMN IF NOT EXISTS "content" TEXT;' 2>/dev/null || \
echo "⚠️ Could not add column automatically - may already exist" && \
echo "" && \
echo "=== Verify column exists ===" && \
source .env 2>/dev/null || true && \
psql "$DATABASE_URL" -c 'SELECT column_name FROM information_schema.columns WHERE table_name = '\''Journal'\'' AND column_name = '\''content'\'';' 2>/dev/null || \
sudo -u postgres psql wissen_publication_group -c 'SELECT column_name FROM information_schema.columns WHERE table_name = '\''Journal'\'' AND column_name = '\''content'\'';' && \
echo "✅ Database baselined and migrations applied!"
```

### Issue 1c: P3017 Error (Migration file not found) + Missing Column

**If you get `Error: P3017` (migration could not be found) AND column still missing:**

```bash
cd /var/www/wissen-publication-group/backend && \
echo "=== Step 1: Skip missing migration and baseline ===" && \
# Only mark migrations that exist \
for migration in 20251006203133_init 20251012045546_add_message_model 20251012060000_add_journal_metadata 20251013173529_add_keywords_to_article 20251102144446_add_admin_models 20251116092017_add_user_password 20251126184536_add_journal_image_fields 20251126194208_add_homepage_fields 20251128161310_update_board_member_fields; do \
  [ -d "prisma/migrations/$migration" ] && npx prisma migrate resolve --applied "$migration" || echo "Skipping $migration"; \
done && \
echo "" && \
echo "=== Step 2: Apply new migrations ===" && \
npx prisma migrate deploy && \
npx prisma generate && \
echo "" && \
echo "=== Step 3: Manually add missing Journal.content column ===" && \
# Load DATABASE_URL from .env \
export $(grep -v '^#' .env | grep DATABASE_URL | xargs) && \
# Add column using DATABASE_URL \
psql "$DATABASE_URL" -c 'ALTER TABLE "Journal" ADD COLUMN IF NOT EXISTS "content" TEXT;' || \
# Fallback: direct postgres connection \
sudo -u postgres psql wissen_publication_group -c 'ALTER TABLE "Journal" ADD COLUMN IF NOT EXISTS "content" TEXT;' || \
echo "Column may already exist" && \
echo "" && \
echo "=== Step 4: Verify and restart ===" && \
psql "$DATABASE_URL" -c 'SELECT column_name FROM information_schema.columns WHERE table_name = '\''Journal'\'' AND column_name = '\''content'\'';' || \
sudo -u postgres psql wissen_publication_group -c 'SELECT column_name FROM information_schema.columns WHERE table_name = '\''Journal'\'' AND column_name = '\''content'\'';' && \
cd .. && \
pm2 restart wissen-backend && \
sleep 5 && \
pm2 list && \
echo "✅ Fixed!"
```

### Issue 2: PostgreSQL "could not write init file"

**Fix:**
```bash
echo "=== Fixing PostgreSQL Disk Space Issue ===" && \
# Check disk space
df -h / && \
# Clean up
sudo journalctl --vacuum-time=3d && \
sudo find /var/log -type f -name "*.log" -mtime +7 -delete 2>/dev/null || true && \
# Fix PostgreSQL permissions
sudo chown -R postgres:postgres /var/lib/postgresql 2>/dev/null || true && \
# Restart PostgreSQL
sudo systemctl restart postgresql && \
sleep 5 && \
sudo systemctl status postgresql | head -5 && \
echo "✅ PostgreSQL fixed!"
```

---

## 🚨 **DISK FULL? RUN THIS FIRST:**

```bash
cd /var/www/wissen-publication-group && \
echo "=== Current Disk Usage ===" && \
df -h / && \
echo "" && \
echo "=== Cleaning Up ===" && \
npm cache clean --force 2>/dev/null || true && \
cd backend && rm -rf node_modules dist 2>/dev/null || true && \
cd ../frontend && rm -rf node_modules .next 2>/dev/null || true && \
cd .. && \
sudo journalctl --vacuum-time=3d 2>/dev/null || true && \
pm2 flush 2>/dev/null || true && \
echo "" && \
echo "=== After Cleanup ===" && \
df -h / && \
echo "" && \
echo "✅ Ready to deploy! Run the deployment command now."
```

---

---

## 🗄️ **CLEAR DATABASE & DEPLOY (Production Reset):**

**⚠️ WARNING: This clears ALL data except admin user!**

```bash
cd /var/www/wissen-publication-group && \
echo "=== STEP 1: Fix Disk Space ===" && \
df -h / && \
npm cache clean --force 2>/dev/null || true && \
sudo journalctl --vacuum-time=3d 2>/dev/null || true && \
pm2 flush 2>/dev/null || true && \
echo "" && \
echo "=== STEP 2: Fix PostgreSQL ===" && \
sudo systemctl restart postgresql && \
sleep 5 && \
echo "" && \
echo "=== STEP 3: Pull Latest Code ===" && \
GIT_TERMINAL_PROMPT=0 git fetch origin main && \
git reset --hard origin/main && \
echo "" && \
echo "=== STEP 4: Backup and Clear Database (Keep Admin Only) ===" && \
cd backend && \
# Load DATABASE_URL from .env
export $(grep -v '^#' .env | grep DATABASE_URL | xargs) && \
# Extract connection details if DATABASE_URL is not set or doesn't work
if [ -z "$DATABASE_URL" ]; then
  DB_USER=$(grep DB_USER .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "postgres")
  DB_PASSWORD=$(grep DB_PASSWORD .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "")
  DB_NAME=$(grep DB_NAME .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "wissen_publication_group")
  DB_HOST=$(grep DB_HOST .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "localhost")
  DB_PORT=$(grep DB_PORT .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "5432")
  export PGPASSWORD="$DB_PASSWORD"
  DB_CONN="psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
else
  DB_CONN="psql \"$DATABASE_URL\""
fi && \
# Backup admin user
$DB_CONN -c "SELECT id, \"userName\", password, \"createdAt\", \"updatedAt\" FROM \"User\" WHERE \"userName\" = 'admin';" > /tmp/admin_backup.txt 2>/dev/null || echo "Admin backup skipped" && \
# Clear all tables except User - handle foreign keys properly
$DB_CONN << 'EOF'
-- Disable foreign key checks
SET session_replication_role = 'replica';

-- Delete in order: child tables first, then parent tables
DELETE FROM "Author";
DELETE FROM "Article";
DELETE FROM "BoardMember";
DELETE FROM "Journal";
DELETE FROM "Message";
DELETE FROM "Contact";
DELETE FROM "News";
DELETE FROM "Notification";
DELETE FROM "WebPage";
DELETE FROM "JournalShortcode";

-- Delete all users except admin
DELETE FROM "User" WHERE "userName" != 'admin';

-- Re-enable foreign key checks
SET session_replication_role = 'origin';
EOF
echo "" && \
echo "=== STEP 5: Verify Admin User ===" && \
$DB_CONN -c "SELECT id, \"userName\" FROM \"User\" WHERE \"userName\" = 'admin';" && \
echo "" && \
echo "=== STEP 6: Apply Migrations ===" && \
npx prisma migrate deploy || echo "Migration issue - continuing..." && \
npx prisma generate && \
echo "" && \
echo "=== STEP 7: Build Backend ===" && \
npm install --no-audit --no-fund --loglevel=error && \
npm run build && \
echo "" && \
echo "=== STEP 8: Build Frontend ===" && \
cd ../frontend && \
npm install --no-audit --no-fund --loglevel=error && \
npm run build && \
echo "" && \
echo "=== STEP 9: Restart Services ===" && \
cd .. && \
pm2 restart all || (pm2 start dist/src/main.js --name wissen-backend --update-env && cd frontend && pm2 start npm --name wissen-frontend -- start --update-env && cd ..) && \
sleep 5 && \
pm2 save && \
sudo systemctl reload nginx && \
echo "" && \
echo "=== STEP 10: Verify Deployment ===" && \
pm2 list && \
curl -s http://localhost:3001/api/health && echo "" && \
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:3000 && \
echo "" && \
echo "✅ Database cleared and deployment complete!"
```

---

**Server IP:** 54.165.116.208  
**Deployment Path:** /var/www/wissen-publication-group  
**PM2 Processes:** wissen-backend, wissen-frontend
