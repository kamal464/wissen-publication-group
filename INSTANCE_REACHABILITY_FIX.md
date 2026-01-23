# 🚨 Instance Reachability Check Failed - Fix Guide

**This means your EC2 instance is not responding to health checks**

---

## 🔍 **STEP 1: Check Instance Status**

### Via AWS Console:
1. Go to **EC2 Console** → **Instances**
2. Select instance `i-016ab2b939f5f7a3b`
3. Check **Status checks** tab:
   - **System status check**: Should be "passed"
   - **Instance status check**: Currently "failed"

### What this means:
- **System status check**: AWS can reach the instance (network/hypervisor level)
- **Instance status check**: The OS inside the instance is not responding

---

## 🚨 **IMMEDIATE FIXES:**

### Fix 1: Reboot the Instance

**Via AWS Console:**
1. EC2 → Instances → Select instance
2. **Instance state** → **Reboot instance**
3. Wait 2-5 minutes for reboot
4. Check status again

**Via AWS CLI:**
```bash
aws ec2 reboot-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1
```

### Fix 2: Stop and Start Instance (If Reboot Doesn't Work)

**⚠️ WARNING: This will change the public IP address!**

**Via AWS Console:**
1. EC2 → Instances → Select instance
2. **Instance state** → **Stop instance**
3. Wait for "stopped" state (1-2 minutes)
4. **Instance state** → **Start instance**
5. Wait for "running" state (1-2 minutes)
6. **Note the NEW public IP address**

**Via AWS CLI:**
```bash
# Stop instance
aws ec2 stop-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1

# Wait 2 minutes, then start
aws ec2 start-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1

# Get new IP
aws ec2 describe-instances \
    --instance-ids i-016ab2b939f5f7a3b \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text \
    --region us-east-1
```

---

## 🔍 **DIAGNOSTIC STEPS:**

### Check Instance Logs

**Via AWS Console:**
1. EC2 → Instances → Select instance
2. **Actions** → **Monitor and troubleshoot** → **Get system log**
3. Look for errors like:
   - Kernel panic
   - Out of memory (OOM)
   - Disk full errors
   - Network issues

### Check CloudWatch Metrics

**Via AWS Console:**
1. EC2 → Instances → Select instance
2. **Monitoring** tab
3. Check:
   - **CPU Utilization** (should be < 100%)
   - **Network In/Out** (should show activity)
   - **Status Check Failed** (shows when it started failing)

---

## 🛠️ **COMMON CAUSES & FIXES:**

### Cause 1: Disk Full (We saw this earlier!)

**Symptoms:**
- "No space left on device" errors
- Services can't write logs
- System becomes unresponsive

**Fix:**
1. **Reboot instance first** (to get it responsive)
2. Once accessible, run cleanup:
```bash
cd /var/www/wissen-publication-group && \
npm cache clean --force && \
cd backend && rm -rf node_modules dist && \
cd ../frontend && rm -rf node_modules .next && \
cd .. && \
sudo journalctl --vacuum-time=3d && \
pm2 flush && \
df -h
```

### Cause 2: Out of Memory (OOM)

**Symptoms:**
- System log shows "Out of memory" or "OOM killer"
- Instance becomes unresponsive

**Fix:**
1. **Reboot instance**
2. Check memory usage:
```bash
free -h
```
3. If memory is low, consider:
   - Upgrading instance type (t3.small → t3.medium)
   - Reducing PM2 processes
   - Adding swap space

### Cause 3: System Crash/Kernel Panic

**Symptoms:**
- System log shows kernel errors
- Instance completely unresponsive

**Fix:**
1. **Stop and Start instance** (not just reboot)
2. Check system logs after restart
3. If recurring, may need to:
   - Update instance AMI
   - Check for hardware issues (AWS will handle)

### Cause 4: Network Issues

**Symptoms:**
- Can't connect via SSH/Session Manager
- Services can't reach internet

**Fix:**
1. **Reboot instance**
2. Check network configuration:
```bash
ip addr show
ping -c 3 8.8.8.8
```

### Cause 5: Service Overload

**Symptoms:**
- High CPU usage
- Services consuming all resources

**Fix:**
1. **Reboot instance**
2. Check running processes:
```bash
top
ps aux --sort=-%cpu | head -10
```
3. Restart PM2 services:
```bash
pm2 restart all
pm2 list
```

---

## 🔄 **RECOVERY PROCEDURE:**

### Step 1: Reboot Instance
```bash
aws ec2 reboot-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1
```

### Step 2: Wait and Check Status
Wait 3-5 minutes, then check:
```bash
aws ec2 describe-instance-status \
    --instance-ids i-016ab2b939f5f7a3b \
    --region us-east-1 \
    --query 'InstanceStatuses[0].[InstanceStatus.Status,SystemStatus.Status]' \
    --output table
```

### Step 3: Once Accessible, Check Services
```bash
# Connect via Session Manager or SSH
cd /var/www/wissen-publication-group

# Check disk space
df -h /

# Check services
pm2 list
sudo systemctl status nginx

# Restart services if needed
pm2 restart all
sudo systemctl restart nginx
```

---

## 🚨 **IF REBOOT DOESN'T WORK:**

### Option 1: Stop and Start (Gets New IP)
1. Stop instance
2. Wait 2 minutes
3. Start instance
4. Get new IP address
5. Update DNS/configuration if needed

### Option 2: Create New Instance (Last Resort)
If instance is completely unrecoverable:
1. Create AMI snapshot (if possible)
2. Launch new instance from same AMI
3. Restore from backup/snapshot
4. Update DNS

---

## 📋 **PREVENTION:**

### 1. Set Up CloudWatch Alarms
- Monitor disk usage
- Monitor CPU/memory
- Alert when status checks fail

### 2. Regular Maintenance
- Clean up logs regularly
- Monitor disk space
- Update system packages

### 3. Auto-Recovery (Advanced)
- Enable EC2 Auto Recovery
- Set up auto-scaling
- Use load balancer for high availability

---

## 🔧 **QUICK COMMANDS:**

### Check Instance Status:
```bash
aws ec2 describe-instance-status \
    --instance-ids i-016ab2b939f5f7a3b \
    --region us-east-1
```

### Reboot:
```bash
aws ec2 reboot-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1
```

### Stop:
```bash
aws ec2 stop-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1
```

### Start:
```bash
aws ec2 start-instances --instance-ids i-016ab2b939f5f7a3b --region us-east-1
```

### Get System Log:
```bash
aws ec2 get-console-output \
    --instance-id i-016ab2b939f5f7a3b \
    --region us-east-1 \
    --output text > instance-log.txt
```

---

## 🎯 **RECOMMENDED ACTION:**

**Start with a reboot:**
1. AWS Console → EC2 → Instances
2. Select `i-016ab2b939f5f7a3b`
3. **Instance state** → **Reboot instance**
4. Wait 3-5 minutes
5. Check status checks again
6. If still failing, try Stop/Start

**After reboot, if accessible:**
- Check disk space (likely the issue we saw earlier)
- Clean up disk space
- Restart PM2 services
- Verify everything is working

---

**Instance ID:** `i-016ab2b939f5f7a3b`  
**Region:** `us-east-1`  
**Current IP:** `54.165.116.208` (may change after stop/start)
