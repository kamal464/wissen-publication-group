#!/bin/bash
# ==========================================
# Quick deploy: set env + build locally + deploy to EC2
# Run from Git Bash: ./quick-deploy.sh
#
# One-time setup so prod .env is never lost when syncing from Git Bash:
#   cp backend/prod.env.example backend/prod.env
#   Edit backend/prod.env with real DATABASE_URL and AWS keys (never commit it).
# Then every run pushes backend/prod.env to server as backend/.env.
# ==========================================

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Your EC2 instance and key (edit if needed)
INSTANCE_ID="${DEPLOY_INSTANCE_ID:-i-06e4b30bc2a85d127}"
REGION="${DEPLOY_REGION:-us-east-1}"
KEY="${DEPLOY_KEY:-$HOME/.ssh/wissen-secure-key-2.pem}"
REMOTE_PATH="${REMOTE_PATH:-/var/www/wissen-publication-group}"

# Resolve EC2 IP if DEPLOY_HOST not set
if [ -z "$DEPLOY_HOST" ]; then
    if command -v aws &>/dev/null; then
        IP=$(aws ec2 describe-instances --instance-ids "$INSTANCE_ID" --region "$REGION" --query 'Reservations[0].Instances[0].PublicIpAddress' --output text 2>/dev/null || true)
        if [ -n "$IP" ] && [ "$IP" != "None" ]; then
            export DEPLOY_HOST="ubuntu@$IP"
        fi
    fi
fi

export DEPLOY_HOST="${DEPLOY_HOST:?Set DEPLOY_HOST or install AWS CLI and ensure instance $INSTANCE_ID is running}"
export DEPLOY_KEY="$KEY"
export REMOTE_PATH="$REMOTE_PATH"

echo "Deploying to $DEPLOY_HOST (key: $DEPLOY_KEY)"
echo ""

exec ./deploy-to-aws.sh
