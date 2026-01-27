# 🌐 Browser Terminal Commands - Complete Setup

## All commands to run in AWS Browser Terminal (EC2 Instance Connect)

---

## 1. Fix S3 Credentials

```bash
cd /var/www/wissen-publication-group/backend
nano .env
```

**In nano, make sure these lines exist (no spaces around =, no quotes):**

```
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_REGION=us-east-1
S3_BUCKET_NAME=wissen-publication-group-files
CLOUDFRONT_URL=https://d2qm3szai4trao.cloudfront.net
```

**Save:** Press `Ctrl+O`, then `Enter`, then `Ctrl+X`

**Restart backend:**

```bash
pm2 restart wissen-backend --update-env
pm2 logs wissen-backend --lines 20 | grep -i s3
```

---

## 2. Clean Up Duplicate Frontend

```bash
pm2 delete 3
pm2 save
pm2 list
```

---

## 3. Update Nginx Server Name

```bash
sudo nano /etc/nginx/sites-available/wissen-publication-group
```

**Find and change:**

```
server_name _;
```

**To:**

```
server_name wissenpublicationgroup.com www.wissenpublicationgroup.com;
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

**Test and reload:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. Install SSL Certificate

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d wissenpublicationgroup.com -d www.wissenpublicationgroup.com
```

**When prompted:**
- Email: Enter your email
- Terms: Type `A` and press Enter
- Share email: Type `Y` or `N` and press Enter
- Redirect HTTP to HTTPS: Type `2` and press Enter

---

## 5. Update CORS for HTTPS

```bash
cd /var/www/wissen-publication-group/backend
nano .env
```

**Find CORS_ORIGIN and update to (remove duplicates, keep only one):**

```
CORS_ORIGIN=https://wissenpublicationgroup.com,https://www.wissenpublicationgroup.com,http://3.85.82.78,http://localhost:3000,http://localhost:3002
```

**Or use wildcard:**

```
CORS_ORIGIN=*
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

**Restart:**

```bash
pm2 restart wissen-backend --update-env
pm2 logs wissen-backend --lines 10 | grep -i "CORS enabled"
```

---

## 6. Verify Everything

```bash
# Check services
pm2 list

# Check SSL
sudo certbot certificates

# Test HTTPS
curl -I https://wissenpublicationgroup.com

# Test API
curl https://wissenpublicationgroup.com/api/journals

# Check S3 service
pm2 logs wissen-backend --lines 30 | grep -i s3
```

---

## 7. Stop Old Compromised Instance

**From your local machine (PowerShell or Git Bash):**

```powershell
aws ec2 stop-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1
```

---

## Quick Copy-Paste All Commands

**Run these one by one in browser terminal:**

```bash
# 1. Fix S3 credentials
cd /var/www/wissen-publication-group/backend
nano .env
# Add/update AWS credentials, save with Ctrl+O, Enter, Ctrl+X

# 2. Restart backend
pm2 restart wissen-backend --update-env

# 3. Clean frontend
pm2 delete 3
pm2 save

# 4. Update Nginx
sudo nano /etc/nginx/sites-available/wissen-publication-group
# Change server_name to: wissenpublicationgroup.com www.wissenpublicationgroup.com
# Save: Ctrl+O, Enter, Ctrl+X
sudo nginx -t && sudo systemctl reload nginx

# 5. Install SSL
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d wissenpublicationgroup.com -d www.wissenpublicationgroup.com

# 6. Update CORS
cd /var/www/wissen-publication-group/backend
nano .env
# Update CORS_ORIGIN, save: Ctrl+O, Enter, Ctrl+X
pm2 restart wissen-backend --update-env

# 7. Verify
pm2 list
sudo certbot certificates
curl -I https://wissenpublicationgroup.com
```

---

**Copy and paste these commands into your browser terminal!** 🚀
