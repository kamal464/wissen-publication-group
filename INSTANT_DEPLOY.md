# 🚀 Instant Deployment - Get Your URL Working Now!

## 🌐 Your Application URL

**Frontend:** http://54.165.116.208  
**Backend API:** http://54.165.116.208/api  
**Health Check:** http://54.165.116.208/api/health

⚠️ **Note:** These URLs will work AFTER deployment (see steps below)

---

## ⚡ Quickest Deployment Method (5 minutes)

### Option 1: EC2 Instance Connect (No SSH Key Needed!)

1. **Go to EC2 Console:**
   - https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#Instances:instanceId=i-016ab2b939f5f7a3b

2. **Select the instance** → Click **Connect**

3. **Choose "EC2 Instance Connect"** → Click **Connect**

4. **In the browser terminal, run this ONE command:**

```bash
curl -s https://raw.githubusercontent.com/kamal464/wissen-publication-group/main/instant-deploy.sh | bash
```

This will automatically:
- ✅ Install Node.js, PM2, PostgreSQL, Nginx
- ✅ Clone your repository
- ✅ Setup database
- ✅ Configure environment variables
- ✅ Build and deploy application
- ✅ Configure Nginx

**Wait 5-10 minutes, then visit:** http://54.165.116.208

---

### Option 2: If EC2 Instance Connect Doesn't Work

**Download your SSH key first:**

1. Go to: https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#KeyPairs:
2. Find "Ec2 Tutorial" → Download the .pem file
3. Save it (remember the path)

**Then run:**

```powershell
# In PowerShell on your local machine
ssh -i "C:\path\to\Ec2-Tutorial.pem" ubuntu@54.165.116.208 "curl -s https://raw.githubusercontent.com/kamal464/wissen-publication-group/main/instant-deploy.sh | bash"
```

---

## 📋 What Gets Deployed

- ✅ Backend API (NestJS) on port 3001
- ✅ Frontend (Next.js) on port 3000  
- ✅ PostgreSQL database
- ✅ Nginx reverse proxy
- ✅ PM2 process manager
- ✅ All environment variables configured

---

## 🔧 Manual Configuration (If Needed)

After deployment, you may need to update AWS credentials:

1. **Connect to instance** (via EC2 Instance Connect or SSH)
2. **Edit backend/.env:**
   ```bash
   nano /var/www/wissen-publication-group/backend/.env
   ```
3. **Update these lines:**
   ```env
   AWS_ACCESS_KEY_ID=YOUR_ACTUAL_ACCESS_KEY_ID
   AWS_SECRET_ACCESS_KEY=YOUR_ACTUAL_SECRET_ACCESS_KEY
   ```
4. **Restart:**
   ```bash
   pm2 restart wissen-backend
   ```

---

## ✅ Verify Deployment

After running the deployment script, check:

```bash
# Check PM2 status
pm2 status

# Check if services are running
curl http://localhost:3001/api/health
curl http://localhost:3000

# Check Nginx
sudo systemctl status nginx
```

---

## 🎯 Your Working URLs

Once deployed, these will work:

- **Frontend:** http://54.165.116.208
- **Backend:** http://54.165.116.208/api
- **Health:** http://54.165.116.208/api/health

---

## 🆘 Troubleshooting

### URL Not Working?

1. **Check instance is running:**
   ```powershell
   aws ec2 describe-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1 --query 'Reservations[0].Instances[0].State.Name' --output text
   ```

2. **Check security group allows HTTP:**
   - Should allow port 80 from 0.0.0.0/0

3. **Connect and check logs:**
   ```bash
   pm2 logs
   sudo tail -f /var/log/nginx/error.log
   ```

---

**Quick Start:** Use EC2 Instance Connect → Run the curl command → Wait 10 minutes → Visit http://54.165.116.208

