#!/bin/bash
# ==========================================
# Build locally + deploy to AWS EC2
# Run this on your machine (Git Bash / WSL / macOS / Linux)
# No build on server = no OOM, faster deploys
# ==========================================

set -e

# --- Configure (use env vars or edit) ---
# Example: export DEPLOY_HOST=ubuntu@ec2-3-110-xx-xx.ap-south-1.compute.amazonaws.com
# Example: export DEPLOY_KEY=~/.ssh/wissen-secure-key.pem
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

# SSH base: optional key
SSH_OPTS="-o StrictHostKeyChecking=accept-new"
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

# Step 3: Sync to EC2 (code + .next + dist; exclude node_modules and .git)
echo -e "${YELLOW}📤 Syncing to server...${NC}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"
if command -v rsync &>/dev/null; then
    rsync -avz --delete \
        -e "$RSYNC_SSH" \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=frontend/.next/cache \
        ./ "$DEPLOY_HOST:$REMOTE_PATH/"
else
    # Fallback when rsync not installed (e.g. Git Bash on Windows): tar + scp
    ARCHIVE="deploy-$$.tar.gz"
    tar --exclude=node_modules --exclude=.git --exclude=frontend/.next/cache -czf "$ARCHIVE" .
    SCP_OPTS="-o StrictHostKeyChecking=accept-new"
    [ -n "$DEPLOY_KEY" ] && SCP_OPTS="$SCP_OPTS -i $DEPLOY_KEY"
    scp $SCP_OPTS "$ARCHIVE" "$DEPLOY_HOST:/tmp/$ARCHIVE"
    $SSH_CMD "cd $REMOTE_PATH && tar -xzf /tmp/$ARCHIVE && rm /tmp/$ARCHIVE"
    rm -f "$ARCHIVE"
fi
echo -e "${GREEN}✅ Sync done${NC}"
echo ""

# Step 4: On server – install prod deps and restart PM2
echo -e "${YELLOW}🔄 Installing deps and restarting on server...${NC}"
$SSH_CMD "cd $REMOTE_PATH/backend && npm install --omit=dev --no-audit --no-fund && cd $REMOTE_PATH/frontend && npm install --omit=dev --no-audit --no-fund && cd $REMOTE_PATH && pm2 restart all || (pm2 start backend/dist/src/main.js --name wissen-backend; pm2 start 'npm -- start' --name wissen-frontend --cwd frontend; pm2 save)"
echo -e "${GREEN}✅ Deploy complete${NC}"
echo ""
echo "Check: $DEPLOY_HOST (frontend :3000, backend :3001)"
echo "=========================================="
