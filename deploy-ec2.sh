#!/bin/bash

# EC2 Deployment Script for Wissen Publication Group
# Run this script on your EC2 instance after initial setup

set -e

echo "🚀 Starting Wissen Publication Group deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Please do not run as root${NC}"
   exit 1
fi

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes from git...${NC}"
git pull origin main || echo -e "${YELLOW}⚠️  Git pull failed or already up to date${NC}"

# Create logs directory
mkdir -p logs

# Backend deployment
echo -e "${YELLOW}📦 Deploying backend...${NC}"
cd backend

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Backend .env file not found!${NC}"
    echo -e "${YELLOW}Please create backend/.env with required environment variables${NC}"
    exit 1
fi

npm install
npx prisma generate
npx prisma migrate deploy
npm run build

echo -e "${GREEN}✅ Backend deployed${NC}"
cd ..

# Frontend deployment
echo -e "${YELLOW}📦 Deploying frontend...${NC}"
cd frontend

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}⚠️  Frontend .env.production not found, creating from template...${NC}"
    echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.production
fi

npm install
npm run build

echo -e "${GREEN}✅ Frontend deployed${NC}"
cd ..

# Restart PM2 processes
echo -e "${YELLOW}🔄 Restarting PM2 processes...${NC}"
if command -v pm2 &> /dev/null; then
    pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
    pm2 save
    echo -e "${GREEN}✅ PM2 processes restarted${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 not found. Install with: npm install -g pm2${NC}"
    echo -e "${YELLOW}Then start with: pm2 start ecosystem.config.js${NC}"
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌐 Your application should be running on:${NC}"
echo -e "   Frontend: http://localhost:3000"
echo -e "   Backend: http://localhost:3001"

