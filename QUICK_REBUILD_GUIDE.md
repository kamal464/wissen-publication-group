# 🚀 Quick Rebuild Guide - Step by Step

## Total Time: **2-4 hours**

---

## ⚡ FAST TRACK (If you're experienced): **1.5-2 hours**

## 📋 DETAILED STEPS (If you need guidance): **2-4 hours**

---

## STEP 1: Stop & Snapshot (5-10 min)

```bash
# Stop instance
aws ec2 stop-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1

# Wait for stop
aws ec2 wait instance-stopped --instance-ids i-016ab2b939f5f7a3b --region us-east-1

# Get volume ID and create snapshot
VOLUME_ID=$(aws ec2 describe-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1 \
  --query 'Reservations[0].Instances[0].BlockDeviceMappings[0].Ebs.VolumeId' --output text)

aws ec2 create-snapshot \
  --volume-id $VOLUME_ID \
  --description "Forensics - $(date +%Y%m%d_%H%M%S)" \
  --region us-east-1
```

---

## STEP 2: Launch New Instance (10-15 min)

**In AWS Console:**
1. EC2 → Launch Instance
2. Choose: **Ubuntu Server 22.04 LTS** (latest AMI)
3. Instance type: **t3.medium** (or same as old instance)
4. Key pair: Select your existing key
5. Network settings:
   - Create/select security group
   - Allow SSH (port 22) from your IP only
   - Allow HTTP (80) and HTTPS (443) from anywhere
6. Advanced details → User data: Paste contents of `user-data-secure.sh`
7. Launch instance

**Or via CLI:**
```bash
# Get latest Ubuntu 22.04 AMI
AMI_ID=$(aws ec2 describe-images \
  --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
  --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' \
  --output text --region us-east-1)

# Launch instance (replace YOUR_KEY_NAME, sg-XXX, subnet-XXX)
aws ec2 run-instances \
  --image-id $AMI_ID \
  --instance-type t3.medium \
  --key-name YOUR_KEY_NAME \
  --security-group-ids sg-XXXXXXXXX \
  --subnet-id subnet-XXXXXXXXX \
  --user-data file://user-data-secure.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=wissen-secure}]' \
  --region us-east-1
```

---

## STEP 3: Secure Setup (30-45 min)

```bash
# SSH into new instance
ssh -i your-key.pem ubuntu@<NEW_IP>

# Upload and run security script
# (Or copy-paste SECURE_SETUP.sh contents)
chmod +x SECURE_SETUP.sh
./SECURE_SETUP.sh
```

---

## STEP 4: Deploy Application (45-90 min)

```bash
# On new instance
cd /var/www
git clone https://github.com/kamal464/wissen-publication-group.git
cd wissen-publication-group

# Backend
cd backend
npm install
# Create .env file (DO NOT copy from old instance - create fresh!)
npx prisma generate
npx prisma migrate deploy
npm run build

# Frontend
cd ../frontend
npm install
# Create .env.local if needed (fresh values!)
npm run build

# Start services
sudo npm install -g pm2
cd ../backend
pm2 start dist/src/main.js --name wissen-backend
cd ../frontend
pm2 start npm --name wissen-frontend -- start
pm2 save
pm2 startup
```

---

## STEP 5: Configure Nginx (15-20 min)

```bash
# Copy your nginx config (from FIX_SLIDER_IMAGES_NGINX.md)
sudo nano /etc/nginx/sites-available/wissen-publication-group

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## STEP 6: Verify & Test (10-15 min)

```bash
# Check services
pm2 list
curl http://localhost:3001/api/health
curl http://localhost:3000

# Check firewall
sudo ufw status

# Check Fail2Ban
sudo fail2ban-client status
```

---

## ⚠️ CRITICAL: Before Going Live

1. ✅ All services running
2. ✅ Nginx configured correctly
3. ✅ SSL certificate installed (if using HTTPS)
4. ✅ Database connected
5. ✅ All credentials rotated
6. ✅ Security groups restrictive
7. ✅ Monitoring configured

---

## Time Breakdown

| Task | Time |
|------|------|
| Stop & Snapshot | 5-10 min |
| Launch Instance | 10-15 min |
| Security Setup | 30-45 min |
| Deploy App | 45-90 min |
| Configure Nginx | 15-20 min |
| Testing | 10-15 min |
| **TOTAL** | **2-4 hours** |

---

## Pro Tips to Save Time

1. **Prepare .env files in advance** - Have all credentials ready
2. **Use user-data script** - Automates initial setup
3. **Test on staging first** - If possible, test deployment process
4. **Keep old instance stopped** - Don't terminate until verified

---

**Ready? Start with STEP 1!** 🚀
