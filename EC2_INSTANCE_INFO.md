# 🖥️ EC2 Instance Information

## ✅ Instance Created Successfully!

**Instance ID:** `i-016ab2b939f5f7a3b`  
**Status:** Running  
**Public IP:** `54.165.116.208`  
**Public DNS:** `ec2-54-165-116-208.compute-1.amazonaws.com`  
**Region:** `us-east-1`  
**Instance Type:** `t3.small` (2 vCPU, 2GB RAM)  
**AMI:** Ubuntu 22.04 LTS  
**Security Group:** `wissen-app-sg` (sg-0bea1705b41dd4806)  
**Key Pair:** `Ec2 Tutorial`

---

## 🔐 Connect to Instance

### SSH Command

```bash
# Windows (PowerShell)
ssh -i $env:USERPROFILE\.ssh\Ec2-Tutorial.pem ubuntu@54.165.116.208

# Or if key is in different location
ssh -i "C:\path\to\Ec2-Tutorial.pem" ubuntu@54.165.116.208

# Linux/Mac
ssh -i ~/.ssh/Ec2-Tutorial.pem ubuntu@54.165.116.208
```

**Note:** If you don't have the key file, download it from:
- EC2 Console → Key Pairs → "Ec2 Tutorial" → Download

---

## 🚀 Deployment Steps

### Step 1: Connect to Instance

```bash
ssh -i your-key.pem ubuntu@54.165.116.208
```

### Step 2: Run Initial Setup (One Time)

```bash
# Download setup script
cd /tmp
wget https://raw.githubusercontent.com/kamal464/wissen-publication-group/main/setup-ec2.sh
# Or copy from your local machine:
# scp -i your-key.pem setup-ec2.sh ubuntu@54.165.116.208:/tmp/

# Run setup
sudo bash /tmp/setup-ec2.sh
```

This will install:
- Node.js 20
- PM2
- PostgreSQL
- Nginx
- Essential tools

### Step 3: Clone Repository

```bash
cd /var/www
sudo git clone https://github.com/kamal464/wissen-publication-group.git
sudo chown -R $USER:$USER wissen-publication-group
cd wissen-publication-group
```

### Step 4: Configure Environment Variables

```bash
# Backend environment
nano backend/.env
```

Add:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/wissen_publication_group
# Or if using RDS:
# DATABASE_URL=postgresql://postgres:password@your-rds-endpoint:5432/wissen_publication_group

NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://54.165.116.208,https://yourdomain.com

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
S3_BUCKET_NAME=wissen-publication-group-files
CLOUDFRONT_URL=https://d2qm3szai4trao.cloudfront.net
```

```bash
# Frontend environment
nano frontend/.env.production
```

Add:
```env
NEXT_PUBLIC_API_URL=http://54.165.116.208:3001/api
# Or for production domain:
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### Step 5: Setup Database

```bash
# If using PostgreSQL on EC2
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'your_secure_password';"
sudo -u postgres createdb wissen_publication_group

# Update DATABASE_URL in backend/.env with the password
```

### Step 6: Deploy Application

```bash
cd /var/www/wissen-publication-group
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

### Step 7: Configure Nginx

```bash
# Copy Nginx config
sudo cp nginx-wissen.conf /etc/nginx/sites-available/wissen-publication-group

# Edit config
sudo nano /etc/nginx/sites-available/wissen-publication-group
# Update: Replace YOUR_EC2_IP with 54.165.116.208
# Update: Replace yourdomain.com with your domain (or leave as IP)

# Enable site
sudo ln -s /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default if exists

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### Step 8: Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs

# Check Nginx
sudo systemctl status nginx

# Test endpoints
curl http://localhost:3001/api/health
curl http://localhost:3000
```

---

## 🌐 Access Your Application

### Via IP Address

- **Frontend:** http://54.165.116.208
- **Backend API:** http://54.165.116.208/api
- **Health Check:** http://54.165.116.208/api/health

### Via Domain (After DNS Setup)

1. Point your domain A record to: `54.165.116.208`
2. Update Nginx config with your domain
3. Setup SSL with Let's Encrypt:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

---

## 📊 Instance Management

### Start/Stop Instance

```bash
# Stop
aws ec2 stop-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1

# Start
aws ec2 start-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1

# Get new IP (if using Elastic IP, IP won't change)
aws ec2 describe-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1 --query 'Reservations[0].Instances[0].PublicIpAddress' --output text
```

### View Instance Status

```bash
aws ec2 describe-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1 --query 'Reservations[0].Instances[0].[State.Name,PublicIpAddress]' --output table
```

### Terminate Instance (⚠️ Careful!)

```bash
aws ec2 terminate-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1
```

---

## 🔒 Security Notes

1. **SSH Key:** Keep your `.pem` file secure and never commit it to git
2. **Firewall:** Security group allows SSH from anywhere (0.0.0.0/0). Consider restricting to your IP
3. **Database:** Use strong passwords
4. **Updates:** Keep system updated: `sudo apt update && sudo apt upgrade -y`
5. **Backups:** Setup regular database backups

---

## 💰 Cost Estimate

- **t3.small:** ~$15/month (~$0.0208/hour)
- **EBS Storage (20GB):** ~$2/month
- **Data Transfer:** First 100GB free, then ~$0.09/GB

**Total:** ~$17/month

---

## 🆘 Troubleshooting

### Can't SSH to Instance

```bash
# Check security group allows SSH (port 22)
aws ec2 describe-security-groups --group-ids sg-0bea1705b41dd4806 --region us-east-1

# Check instance is running
aws ec2 describe-instance-status --instance-ids i-016ab2b939f5f7a3b --region us-east-1
```

### Application Not Accessible

```bash
# Check PM2
pm2 status
pm2 logs

# Check Nginx
sudo systemctl status nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log

# Check ports
sudo netstat -tlnp | grep -E '3000|3001|80|443'
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U postgres -d wissen_publication_group
```

---

## ✅ Deployment Checklist

- [x] EC2 instance created and running
- [x] Security group configured
- [ ] SSH key downloaded
- [ ] Connected to instance via SSH
- [ ] Initial setup script run
- [ ] Repository cloned
- [ ] Environment variables configured
- [ ] Database setup
- [ ] Application deployed
- [ ] Nginx configured
- [ ] Application accessible via browser
- [ ] SSL certificate installed (if using domain)

---

**Instance Created:** January 2026  
**Status:** ✅ Running  
**Ready for Deployment:** Yes

