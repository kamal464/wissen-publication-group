# 🔍 Troubleshoot Deployment - Site Not Loading

Run these diagnostic commands in your browser terminal to find the issue:

## Step 1: Check Instance Status

```bash
# Check if instance is running
echo "Instance Status:"
aws ec2 describe-instance-status --instance-ids i-016ab2b939f5f7a3b --region us-east-1 --query 'InstanceStatuses[0].[InstanceStatus.Status,SystemStatus.Status]' --output table 2>&1 || echo "Instance is running"
```

## Step 2: Check Services Status

```bash
# Check PM2 (application processes)
echo "=== PM2 Status ==="
pm2 status
pm2 logs --lines 20

# Check Nginx
echo ""
echo "=== Nginx Status ==="
sudo systemctl status nginx --no-pager | head -10

# Check PostgreSQL
echo ""
echo "=== PostgreSQL Status ==="
sudo systemctl status postgresql --no-pager | head -10
```

## Step 3: Check if Applications are Running

```bash
# Test backend locally
echo "=== Testing Backend ==="
curl -v http://localhost:3001/api/health 2>&1 | head -20

# Test frontend locally
echo ""
echo "=== Testing Frontend ==="
curl -v http://localhost:3000 2>&1 | head -20

# Check what's listening on ports
echo ""
echo "=== Port Status ==="
sudo netstat -tlnp | grep -E '3000|3001|80'
```

## Step 4: Check Nginx Configuration

```bash
# Test Nginx config
echo "=== Nginx Configuration Test ==="
sudo nginx -t

# Check Nginx error logs
echo ""
echo "=== Nginx Error Logs (last 20 lines) ==="
sudo tail -20 /var/log/nginx/error.log

# Check Nginx access logs
echo ""
echo "=== Nginx Access Logs (last 10 lines) ==="
sudo tail -10 /var/log/nginx/access.log
```

## Step 5: Check Security Group

```bash
# Verify security group allows HTTP
echo "=== Security Group Rules ==="
aws ec2 describe-security-groups --group-ids sg-0bea1705b41dd4806 --region us-east-1 --query 'SecurityGroups[0].IpPermissions[*].[FromPort,ToPort,IpRanges[0].CidrIp]' --output table
```

## Step 6: Quick Fix Commands

If services aren't running, try these:

```bash
# Restart PM2 processes
cd /var/www/wissen-publication-group
pm2 restart all
pm2 save

# Restart Nginx
sudo systemctl restart nginx

# Check if repository exists
ls -la /var/www/wissen-publication-group

# Check if environment files exist
cat backend/.env | head -5
cat frontend/.env.production
```

## Step 7: Manual Start (If Needed)

```bash
# If PM2 isn't running, start manually
cd /var/www/wissen-publication-group
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Verify Nginx config and reload
sudo nginx -t && sudo systemctl reload nginx
```

## Step 8: Check Application Logs

```bash
# Backend logs
echo "=== Backend Logs ==="
pm2 logs wissen-backend --lines 30 --nostream

# Frontend logs
echo ""
echo "=== Frontend Logs ==="
pm2 logs wissen-frontend --lines 30 --nostream
```

## Common Issues and Fixes

### Issue 1: PM2 Not Running
```bash
cd /var/www/wissen-publication-group
pm2 start ecosystem.config.js
pm2 save
```

### Issue 2: Nginx Not Configured
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Issue 3: Ports Not Listening
```bash
# Check if apps are actually running
ps aux | grep -E "node|npm" | grep -v grep
```

### Issue 4: Security Group Blocking
The security group should allow port 80. Check in AWS Console:
- EC2 → Security Groups → wissen-app-sg
- Should have inbound rule: HTTP (80) from 0.0.0.0/0

## Complete Diagnostic Script

Run this all at once:

```bash
echo "=========================================="
echo "🔍 Complete Deployment Diagnostic"
echo "=========================================="
echo ""
echo "1. PM2 Status:"
pm2 status
echo ""
echo "2. Services Status:"
sudo systemctl is-active nginx postgresql
echo ""
echo "3. Port Status:"
sudo netstat -tlnp | grep -E '3000|3001|80' || echo "No services listening on ports"
echo ""
echo "4. Application Tests:"
curl -s http://localhost:3001/api/health && echo "✅ Backend OK" || echo "❌ Backend not responding"
curl -s http://localhost:3000 | head -1 && echo "✅ Frontend OK" || echo "❌ Frontend not responding"
echo ""
echo "5. Nginx Status:"
sudo nginx -t 2>&1
echo ""
echo "6. Recent Errors:"
sudo tail -5 /var/log/nginx/error.log
echo ""
echo "=========================================="
```

Run these commands and share the output so I can help fix the specific issue!

