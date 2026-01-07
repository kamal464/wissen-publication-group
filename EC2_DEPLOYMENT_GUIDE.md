# 🚀 EC2 Deployment Guide - Wissen Publication Group

Complete guide to deploy your application directly on AWS EC2.

---

## 📋 Prerequisites

- AWS Account
- Domain name (optional, for custom domain)
- SSH key pair for EC2 access

---

## 🎯 Architecture Overview

```
Internet
   ↓
[EC2 Instance]
   ├── Nginx (Port 80/443) - Reverse Proxy
   ├── Frontend (Port 3000) - Next.js
   ├── Backend (Port 3001) - NestJS API
   └── PostgreSQL (Port 5432) - Database (or use RDS)
```

---

## Step 1: Launch EC2 Instance

### 1.1 Create EC2 Instance

1. Go to **AWS Console** → **EC2** → **Launch Instance**
2. Configure:
   - **Name**: `wissen-publication-group`
   - **AMI**: Ubuntu 22.04 LTS (or Amazon Linux 2023)
   - **Instance Type**: `t3.medium` (2 vCPU, 4GB RAM) - minimum recommended
   - **Key Pair**: Create new or use existing
   - **Network Settings**: 
     - Allow HTTP (port 80)
     - Allow HTTPS (port 443)
     - Allow SSH (port 22) from your IP
   - **Storage**: 20GB minimum (gp3)
3. Click **Launch Instance**

### 1.2 Allocate Elastic IP (Recommended)

1. Go to **EC2** → **Elastic IPs** → **Allocate Elastic IP address**
2. Associate with your EC2 instance
3. **Save the Elastic IP** - you'll use it for DNS

---

## Step 2: Connect to EC2 Instance

```bash
# Replace with your key file and instance IP
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# For Amazon Linux
ssh -i your-key.pem ec2-user@YOUR_EC2_IP
```

---

## Step 3: Initial Server Setup

### 3.1 Update System

```bash
# Ubuntu
sudo apt update && sudo apt upgrade -y

# Amazon Linux
sudo yum update -y
```

### 3.2 Install Essential Tools

```bash
# Ubuntu
sudo apt install -y curl wget git build-essential

# Amazon Linux
sudo yum install -y curl wget git gcc-c++ make
```

---

## Step 4: Install Node.js 20

```bash
# Using NodeSource (recommended)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

**For Amazon Linux:**
```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

---

## Step 5: Install PostgreSQL

### Option A: Install PostgreSQL on EC2

```bash
# Ubuntu
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Set password for postgres user
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'your_secure_password';"

# Create database
sudo -u postgres createdb wissen_publication_group
```

### Option B: Use AWS RDS (Recommended for Production)

1. Go to **AWS Console** → **RDS** → **Create Database**
2. Choose **PostgreSQL**
3. Configure:
   - **DB Instance**: `db.t3.micro` (free tier eligible)
   - **Master username**: `postgres`
   - **Master password**: Set strong password
   - **Database name**: `wissen_publication_group`
   - **Public access**: Yes (or configure VPC security groups)
4. Create database
5. **Save the endpoint** - you'll use it as `DATABASE_URL`

---

## Step 6: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

PM2 will keep your Node.js apps running and restart them if they crash.

---

## Step 7: Install Nginx

```bash
# Ubuntu
sudo apt install -y nginx

# Amazon Linux
sudo yum install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Step 8: Clone and Setup Application

```bash
# Create app directory
sudo mkdir -p /var/www
cd /var/www

# Clone repository
sudo git clone https://github.com/kamal464/wissen-publication-group.git
sudo chown -R $USER:$USER wissen-publication-group
cd wissen-publication-group
```

---

## Step 9: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
nano .env
```

**Add to `.env`:**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/wissen_publication_group
# Or for RDS:
# DATABASE_URL=postgresql://postgres:password@your-rds-endpoint:5432/wissen_publication_group

NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://YOUR_EC2_IP,https://yourdomain.com

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
S3_BUCKET_NAME=wissen-publication-group-files
CLOUDFRONT_URL=https://d2qm3szai4trao.cloudfront.net
```

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build application
npm run build

# Test run
npm start
# Press Ctrl+C to stop
```

---

## Step 10: Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.production file
nano .env.production
```

**Add to `.env.production`:**
```env
NEXT_PUBLIC_API_URL=http://YOUR_EC2_IP:3001/api
# Or for production domain:
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

```bash
# Build application
npm run build

# Test run
npm start
# Press Ctrl+C to stop
```

---

## Step 11: Configure PM2

### 11.1 Create PM2 Ecosystem File

```bash
cd /var/www/wissen-publication-group
nano ecosystem.config.js
```

**Add:**
```javascript
module.exports = {
  apps: [
    {
      name: 'wissen-backend',
      cwd: '/var/www/wissen-publication-group/backend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: '/var/log/pm2/backend-error.log',
      out_file: '/var/log/pm2/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
    },
    {
      name: 'wissen-frontend',
      cwd: '/var/www/wissen-publication-group/frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/pm2/frontend-error.log',
      out_file: '/var/log/pm2/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
    },
  ],
};
```

### 11.2 Create Log Directory

```bash
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2
```

### 11.3 Start Applications with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Run the command that PM2 outputs (usually starts with 'sudo')
```

---

## Step 12: Configure Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/wissen-publication-group
```

**Add:**
```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com YOUR_EC2_IP;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com YOUR_EC2_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable site:**
```bash
# Ubuntu
sudo ln -s /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default if exists

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Step 13: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal (already set up by certbot)
sudo certbot renew --dry-run
```

**Note:** If you don't have a domain, you can skip SSL for now and access via HTTP.

---

## Step 14: Configure Security Groups

1. Go to **EC2** → **Security Groups**
2. Select your instance's security group
3. **Inbound Rules** should allow:
   - **SSH (22)** - From your IP only
   - **HTTP (80)** - From anywhere (0.0.0.0/0)
   - **HTTPS (443)** - From anywhere (0.0.0.0/0)
   - **Custom TCP (3000)** - From localhost only (optional)
   - **Custom TCP (3001)** - From localhost only (optional)

---

## Step 15: Setup Auto-Deployment (Optional)

### 15.1 Create Deployment Script

```bash
cd /var/www/wissen-publication-group
nano deploy.sh
```

**Add:**
```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Pull latest changes
git pull origin main

# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
cd ..

# Frontend
cd frontend
npm install
npm run build
cd ..

# Restart PM2
pm2 restart all

echo "✅ Deployment complete!"
```

```bash
chmod +x deploy.sh
```

### 15.2 Setup GitHub Webhook (Advanced)

You can set up a webhook to automatically deploy on git push. This requires:
- A webhook server (simple Express.js server)
- GitHub webhook configuration

---

## Step 16: Setup Firewall (UFW)

```bash
# Ubuntu
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Check status
sudo ufw status
```

---

## Step 17: Monitor and Maintain

### 17.1 Check Application Status

```bash
# PM2 status
pm2 status

# PM2 logs
pm2 logs

# Nginx status
sudo systemctl status nginx

# PostgreSQL status
sudo systemctl status postgresql
```

### 17.2 Setup Log Rotation

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 📊 Cost Estimation

### EC2 Instance
- **t3.medium**: ~$30/month
- **t3.small**: ~$15/month (minimum recommended)
- **t3.micro**: ~$7.50/month (may be slow)

### RDS (if using)
- **db.t3.micro**: Free tier (12 months), then ~$15/month

### Storage
- **20GB EBS**: ~$2/month

### Data Transfer
- **First 100GB**: Free
- **After**: ~$0.09/GB

**Total (with t3.small + RDS)**: ~$32/month after free tier

---

## 🔒 Security Best Practices

1. **Keep system updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Use strong passwords** for database and SSH

3. **Disable root login** (already disabled by default)

4. **Use SSH keys** instead of passwords

5. **Regular backups:**
   ```bash
   # Backup database
   pg_dump wissen_publication_group > backup_$(date +%Y%m%d).sql
   ```

6. **Monitor logs:**
   ```bash
   pm2 logs
   sudo tail -f /var/log/nginx/error.log
   ```

---

## 🆘 Troubleshooting

### Application not starting
```bash
pm2 logs wissen-backend
pm2 logs wissen-frontend
```

### Nginx errors
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Database connection issues
```bash
# Test PostgreSQL connection
psql -U postgres -d wissen_publication_group

# Check if PostgreSQL is running
sudo systemctl status postgresql
```

### Port already in use
```bash
# Check what's using the port
sudo lsof -i :3000
sudo lsof -i :3001

# Kill process if needed
sudo kill -9 <PID>
```

---

## 🔄 Update Application

```bash
cd /var/www/wissen-publication-group
./deploy.sh
```

Or manually:
```bash
cd /var/www/wissen-publication-group
git pull origin main

# Backend
cd backend
npm install
npx prisma migrate deploy
npm run build
pm2 restart wissen-backend

# Frontend
cd ../frontend
npm install
npm run build
pm2 restart wissen-frontend
```

---

## 📝 Environment Variables Reference

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://yourdomain.com,https://yourdomain.com
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=wissen-publication-group-files
CLOUDFRONT_URL=https://d2qm3szai4trao.cloudfront.net
```

### Frontend (.env.production)
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

---

## ✅ Deployment Checklist

- [ ] EC2 instance created and running
- [ ] Elastic IP allocated (optional)
- [ ] Node.js 20 installed
- [ ] PostgreSQL installed (or RDS created)
- [ ] PM2 installed
- [ ] Nginx installed and configured
- [ ] Application cloned
- [ ] Backend environment variables set
- [ ] Frontend environment variables set
- [ ] Database migrations run
- [ ] Applications built
- [ ] PM2 processes running
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed (if using domain)
- [ ] Security groups configured
- [ ] Firewall configured
- [ ] Applications accessible via browser
- [ ] Logs monitoring setup

---

## 🎯 Next Steps

1. **Setup domain DNS** (if you have a domain)
   - Point A record to your Elastic IP
   - Point subdomain (api.yourdomain.com) to same IP

2. **Setup automated backups**
   - Database backups (daily)
   - Application code backups (via git)

3. **Setup monitoring**
   - CloudWatch (AWS)
   - PM2 monitoring
   - Uptime monitoring (UptimeRobot, etc.)

4. **Optimize performance**
   - Enable Nginx caching
   - Setup CDN (CloudFront)
   - Database query optimization

---

**Last Updated**: January 2026

