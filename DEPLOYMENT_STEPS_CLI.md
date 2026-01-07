# 🚀 Complete CLI Deployment Steps for EC2

## Current Instance Information

- **Instance ID:** `i-016ab2b939f5f7a3b`
- **Public IP:** `54.165.116.208`
- **Status:** Running
- **Key Pair:** `Ec2 Tutorial`

---

## Step 1: Get SSH Key

### Option A: Download from Console

1. Go to: https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#KeyPairs:
2. Find **"Ec2 Tutorial"** key pair
3. If available, click **Download** and save as `Ec2-Tutorial.pem`
4. Move to: `C:\Users\Shashidar\.ssh\Ec2-Tutorial.pem`

### Option B: Use Existing Key

If you already have the key file, note its location.

---

## Step 2: Run Complete Deployment Script

Once you have the key file:

```powershell
# Run the automated deployment
.\deploy-ec2-complete.ps1 -KeyPath "C:\path\to\Ec2-Tutorial.pem"
```

Or if key is in default location:

```powershell
.\deploy-ec2-complete.ps1
```

---

## Step 3: Manual Deployment (If Script Fails)

### 3.1 Connect to Instance

```powershell
ssh -i "C:\path\to\Ec2-Tutorial.pem" ubuntu@54.165.116.208
```

### 3.2 Run Initial Setup

```bash
# Download and run setup script
cd /tmp
curl -o setup-ec2.sh https://raw.githubusercontent.com/kamal464/wissen-publication-group/main/setup-ec2.sh
sudo bash setup-ec2.sh
```

### 3.3 Clone Repository

```bash
cd /var/www
sudo git clone https://github.com/kamal464/wissen-publication-group.git
sudo chown -R $USER:$USER wissen-publication-group
cd wissen-publication-group
```

### 3.4 Setup Database

```bash
# Set PostgreSQL password
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'YourSecurePassword123!';"

# Create database
sudo -u postgres createdb wissen_publication_group

# Test connection
psql -U postgres -d wissen_publication_group -c "SELECT version();"
```

### 3.5 Configure Environment Variables

```bash
# Backend .env
nano backend/.env
```

Add:
```env
DATABASE_URL=postgresql://postgres:YourSecurePassword123!@localhost:5432/wissen_publication_group
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://54.165.116.208,https://54.165.116.208

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
S3_BUCKET_NAME=wissen-publication-group-files
CLOUDFRONT_URL=https://d2qm3szai4trao.cloudfront.net
```

```bash
# Frontend .env.production
nano frontend/.env.production
```

Add:
```env
NEXT_PUBLIC_API_URL=http://54.165.116.208:3001/api
```

### 3.6 Deploy Application

```bash
cd /var/www/wissen-publication-group
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

### 3.7 Configure Nginx

```bash
# Copy and edit Nginx config
sudo cp nginx-wissen.conf /etc/nginx/sites-available/wissen-publication-group
sudo nano /etc/nginx/sites-available/wissen-publication-group
# Replace YOUR_EC2_IP with 54.165.116.208

# Enable site
sudo ln -s /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 3.8 Verify Deployment

```bash
# Check PM2
pm2 status
pm2 logs

# Check services
sudo systemctl status nginx
sudo systemctl status postgresql

# Test endpoints
curl http://localhost:3001/api/health
curl http://localhost:3000
```

---

## Step 4: Update AWS Credentials

You need to update the AWS credentials in `backend/.env`:

```bash
# SSH to instance
ssh -i "C:\path\to\Ec2-Tutorial.pem" ubuntu@54.165.116.208

# Edit backend/.env
nano /var/www/wissen-publication-group/backend/.env

# Update these lines:
# AWS_ACCESS_KEY_ID=YOUR_ACTUAL_ACCESS_KEY_ID
# AWS_SECRET_ACCESS_KEY=YOUR_ACTUAL_SECRET_ACCESS_KEY

# Restart backend
pm2 restart wissen-backend
```

---

## Step 5: Security - Restrict SSH Access

Currently, SSH is open to the world. Restrict it to your IP:

```powershell
# Get your public IP
$MyIP = (Invoke-WebRequest -Uri "https://api.ipify.org").Content
Write-Host "Your IP: $MyIP"

# Update security group (replace sg-0bea1705b41dd4806 with your actual SG ID)
aws ec2 revoke-security-group-ingress --group-id sg-0bea1705b41dd4806 --protocol tcp --port 22 --cidr 0.0.0.0/0 --region us-east-1

# Add rule for your IP only
aws ec2 authorize-security-group-ingress --group-id sg-0bea1705b41dd4806 --protocol tcp --port 22 --cidr "$MyIP/32" --region us-east-1
```

---

## Step 6: Access Your Application

After deployment:

- **Frontend:** http://54.165.116.208
- **Backend API:** http://54.165.116.208/api
- **Health Check:** http://54.165.116.208/api/health

---

## Troubleshooting

### Can't SSH to Instance

```powershell
# Check instance status
aws ec2 describe-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1 --query 'Reservations[0].Instances[0].[State.Name,PublicIpAddress]' --output table

# Check security group
aws ec2 describe-security-groups --group-ids sg-0bea1705b41dd4806 --region us-east-1
```

### Application Not Responding

```bash
# SSH to instance and check
pm2 status
pm2 logs wissen-backend
pm2 logs wissen-frontend
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Database Connection Issues

```bash
# Check PostgreSQL
sudo systemctl status postgresql
sudo -u postgres psql -c "\l"  # List databases
psql -U postgres -d wissen_publication_group -c "SELECT 1;"
```

---

## Management Commands

### Start/Stop Instance

```powershell
# Stop
aws ec2 stop-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1

# Start
aws ec2 start-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1

# Get new IP (if instance was stopped)
aws ec2 describe-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1 --query 'Reservations[0].Instances[0].PublicIpAddress' --output text
```

### Update Application

```bash
# SSH to instance
ssh -i "C:\path\to\Ec2-Tutorial.pem" ubuntu@54.165.116.208

# Update code
cd /var/www/wissen-publication-group
git pull origin main

# Redeploy
./deploy-ec2.sh
```

### View Logs

```bash
# PM2 logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
sudo journalctl -u postgresql -f
```

---

## Quick Reference

| Task | Command |
|------|---------|
| **SSH to instance** | `ssh -i "key.pem" ubuntu@54.165.116.208` |
| **Check instance status** | `aws ec2 describe-instances --instance-ids i-016ab2b939f5f7a3b` |
| **Start instance** | `aws ec2 start-instances --instance-ids i-016ab2b939f5f7a3b` |
| **Stop instance** | `aws ec2 stop-instances --instance-ids i-016ab2b939f5f7a3b` |
| **Get instance IP** | `aws ec2 describe-instances --instance-ids i-016ab2b939f5f7a3b --query 'Reservations[0].Instances[0].PublicIpAddress' --output text` |
| **View PM2 status** | `pm2 status` (on instance) |
| **Restart app** | `pm2 restart all` (on instance) |

---

**Last Updated:** January 2026

