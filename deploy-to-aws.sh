#!/bin/bash
# ==========================================
# Build locally + deploy to AWS EC2
# Run this on your machine (Git Bash / WSL / macOS / Linux)
# No build on server = no OOM, faster deploys
#
# Production credentials (Postgres on EC2): keep in backend/prod.env
#   cp backend/prod.env.example backend/prod.env
#   nano backend/prod.env   # set DATABASE_URL (postgres on localhost), AWS vars
# This script pushes backend/prod.env to server as backend/.env
# ==========================================

set -e

# --- Configure (use env vars or edit) ---
# Example: export DEPLOY_HOST=ubuntu@ec2-3-110-xx-xx.compute.amazonaws.com
# Example: export DEPLOY_KEY=~/.ssh/wissen-secure-key-2.pem
# Example: export REMOTE_PATH=/var/www/wissen-publication-group
DEPLOY_HOST="${DEPLOY_HOST:-}"
DEPLOY_KEY="${DEPLOY_KEY:-}"
REMOTE_PATH="${REMOTE_PATH:-/var/www/wissen-publication-group}"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ -z "$DEPLOY_HOST" ]; then
    echo -e "${RED}Set DEPLOY_HOST (e.g. ubuntu@your-ec2-ip-or-dns)${NC}"
    echo "  export DEPLOY_HOST=ubuntu@ec2-xx-xx-xx-xx.compute.amazonaws.com"
    exit 1
fi

# SSH base: optional key + keepalives so long scp/rsync don't drop
SSH_OPTS="-o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30 -o ServerAliveCountMax=10 -o ConnectTimeout=15"
[ -n "$DEPLOY_KEY" ] && SSH_OPTS="$SSH_OPTS -i $DEPLOY_KEY"
SSH_CMD="ssh $SSH_OPTS $DEPLOY_HOST"
# Build -e for rsync (same as SSH_CMD)
RSYNC_SSH="ssh $SSH_OPTS"

echo "=========================================="
echo "Build locally + deploy to AWS"
echo "=========================================="
echo "Host: $DEPLOY_HOST"
echo "Path: $REMOTE_PATH"
echo ""

# Remind: keep backend/prod.env so credentials are pushed every deploy (no re-entering on server)
if [ ! -f "$(dirname "$0")/backend/prod.env" ]; then
    echo -e "${YELLOW}💡 Tip: Create backend/prod.env (from prod.env.example) with real DATABASE_URL and AWS keys.${NC}"
    echo "   Then every deploy will push it to the server and you won't lose .env when syncing from Git Bash."
    echo ""
fi

# Step 1: Build backend
echo -e "${YELLOW}🔨 Building backend...${NC}"
cd "$(dirname "$0")/backend"
npm run build
cd ..
echo -e "${GREEN}✅ Backend built${NC}"
echo ""

# Step 2: Build frontend (no BUILD_LOW_DISK needed locally)
echo -e "${YELLOW}🔨 Building frontend...${NC}"
cd frontend
npm run build
cd ..
echo -e "${GREEN}✅ Frontend built${NC}"
echo ""

# Step 3: Sync to EC2 (code + .next + dist; exclude node_modules, .git, and .env so prod credentials are never overwritten)
# Use --filter P to PROTECT backend/.env and .env on server (don't delete them when using --delete)
echo -e "${YELLOW}📤 Syncing to server...${NC}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"
if command -v rsync &>/dev/null; then
    rsync -avz --delete \
        -e "$RSYNC_SSH" \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=frontend/.next/cache \
        --exclude=backend/.env \
        --exclude=.env \
        --filter 'P backend/.env' \
        --filter 'P .env' \
        ./ "$DEPLOY_HOST:$REMOTE_PATH/"
else
    # Fallback when rsync not installed (e.g. Git Bash on Windows): tar + scp
    # Preserve server backend/.env: backup before extract, restore after if we're not pushing prod.env
    PROD_ENV_CHECK="$(dirname "$0")/backend/prod.env"
    $SSH_CMD "test -f $REMOTE_PATH/backend/.env && cp $REMOTE_PATH/backend/.env /tmp/backend.env.bak.$$ || true"
    # Create archive outside project dir so "tar ." doesn't see file changed as we read it
    # Exclude backend/.env and .env so production DB credentials are never overwritten by local dev .env
    ARCHIVE_NAME="deploy-$$.tar.gz"
    ARCHIVE="$SCRIPT_DIR/../$ARCHIVE_NAME"
    tar --exclude=node_modules --exclude=.git --exclude=frontend/.next/cache --exclude=backend/.env --exclude=.env -czf "$ARCHIVE" -C "$SCRIPT_DIR" .
    SCP_OPTS="-o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30 -o ServerAliveCountMax=10"
    [ -n "$DEPLOY_KEY" ] && SCP_OPTS="$SCP_OPTS -i $DEPLOY_KEY"
    # Retry scp up to 3 times (connection often drops on slow/unstable networks)
    SCP_OK=0
    for attempt in 1 2 3; do
        if scp $SCP_OPTS "$ARCHIVE" "$DEPLOY_HOST:/tmp/$ARCHIVE_NAME"; then
            SCP_OK=1
            break
        fi
        echo -e "${YELLOW}⚠️ Upload failed (attempt $attempt/3). Retrying in 5s...${NC}"
        sleep 5
    done
    if [ "$SCP_OK" -eq 0 ]; then
        rm -f "$ARCHIVE"
        $SSH_CMD "rm -f /tmp/backend.env.bak.$$"
        echo -e "${RED}❌ Sync failed after 3 attempts. Try: different network, or install rsync.${NC}"
        exit 1
    fi
    $SSH_CMD "cd $REMOTE_PATH && tar -xzf /tmp/$ARCHIVE_NAME && rm /tmp/$ARCHIVE_NAME"
    # Restore server .env if we don't have prod.env to push (so we never lose credentials)
    if [ ! -f "$PROD_ENV_CHECK" ]; then
        $SSH_CMD "test -f /tmp/backend.env.bak.$$ && cp /tmp/backend.env.bak.$$ $REMOTE_PATH/backend/.env && rm /tmp/backend.env.bak.$$ && echo 'Restored backend/.env from backup' || rm -f /tmp/backend.env.bak.$$"
    else
        $SSH_CMD "rm -f /tmp/backend.env.bak.$$"
    fi
    rm -f "$ARCHIVE"
fi
echo -e "${GREEN}✅ Sync done${NC}"
echo ""

# Step 3b: Push production credentials (Postgres on EC2) – backend/prod.env → server backend/.env
# Keep backend/prod.env locally with real DATABASE_URL and AWS keys; it is pushed every deploy.
PROD_ENV="$(dirname "$0")/backend/prod.env"
if [ -f "$PROD_ENV" ]; then
    echo -e "${YELLOW}📤 Pushing prod.env to server as backend/.env...${NC}"
    SCP_OPTS="-o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30 -o ServerAliveCountMax=10"
    [ -n "$DEPLOY_KEY" ] && SCP_OPTS="$SCP_OPTS -i $DEPLOY_KEY"
    scp $SCP_OPTS "$PROD_ENV" "$DEPLOY_HOST:$REMOTE_PATH/backend/.env"
    echo -e "${GREEN}✅ Credentials updated on server${NC}"
else
    echo -e "${YELLOW}⚠️ backend/prod.env not found – server keeps existing backend/.env (or create it once on server)${NC}"
    echo "   To push credentials every deploy: cp backend/prod.env.example backend/prod.env && nano backend/prod.env"
fi
echo ""

# Step 4: On server – install prod deps and restart PM2
echo -e "${YELLOW}🔄 Installing deps and restarting on server...${NC}"
$SSH_CMD "cd $REMOTE_PATH/backend && npm install --omit=dev --no-audit --no-fund && cd $REMOTE_PATH/frontend && npm install --omit=dev --no-audit --no-fund && cd $REMOTE_PATH && pm2 restart all || (pm2 start backend/dist/src/main.js --name wissen-backend; pm2 start 'npm -- start' --name wissen-frontend --cwd frontend; pm2 save)"
echo -e "${GREEN}✅ Deploy complete${NC}"
echo ""
echo "Check: $DEPLOY_HOST (frontend :3000, backend :3001)"
echo "=========================================="
