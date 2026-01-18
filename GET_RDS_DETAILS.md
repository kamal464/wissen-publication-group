# 🔍 Get AWS RDS Details Using AWS CLI

Since your RDS connection was working until yesterday, let's retrieve the exact details and diagnose the issue.

## Quick Commands (Run in PowerShell or Command Prompt)

### 1. List All RDS Instances
```bash
aws rds describe-db-instances --query 'DBInstances[*].[DBInstanceIdentifier,Engine,DBInstanceStatus,Endpoint.Address,Endpoint.Port,MasterUsername,DBName]' --output table
```

### 2. Get Specific Instance Details
Replace `YOUR_DB_INSTANCE_ID` with your actual RDS instance identifier:

```bash
# Get endpoint (DB_HOST)
aws rds describe-db-instances --db-instance-identifier YOUR_DB_INSTANCE_ID --query 'DBInstances[0].Endpoint.Address' --output text

# Get port (DB_PORT)
aws rds describe-db-instances --db-instance-identifier YOUR_DB_INSTANCE_ID --query 'DBInstances[0].Endpoint.Port' --output text

# Get username (DB_USER)
aws rds describe-db-instances --db-instance-identifier YOUR_DB_INSTANCE_ID --query 'DBInstances[0].MasterUsername' --output text

# Get database name (DB_NAME)
aws rds describe-db-instances --db-instance-identifier YOUR_DB_INSTANCE_ID --query 'DBInstances[0].DBName' --output text

# Get status
aws rds describe-db-instances --db-instance-identifier YOUR_DB_INSTANCE_ID --query 'DBInstances[0].DBInstanceStatus' --output text
```

### 3. Check Security Groups
```bash
# Get security groups for RDS
aws rds describe-db-instances --db-instance-identifier YOUR_DB_INSTANCE_ID --query 'DBInstances[0].VpcSecurityGroups[*].VpcSecurityGroupId' --output text

# Check security group rules (replace SG_ID)
aws ec2 describe-security-groups --group-ids SG_ID --query 'SecurityGroups[0].IpPermissions[*].[FromPort,ToPort,IpProtocol]' --output table
```

### 4. Check Recent Events (What Changed?)
```bash
aws rds describe-events --source-identifier YOUR_DB_INSTANCE_ID --source-type db-instance --duration 1440 --query 'Events[*].[EventTime,Message]' --output table
```

## Using the Scripts

### Option 1: PowerShell Script (Windows)
```powershell
.\get-rds-details.ps1
```

### Option 2: Bash Script (Linux/Mac/Git Bash)
```bash
bash get-rds-details.sh
```

## Common Issues After CI/CD Changes

1. **RDS Instance Status Changed**
   - Check if status is "available"
   - Run: `aws rds describe-db-instances --db-instance-identifier YOUR_INSTANCE --query 'DBInstances[0].DBInstanceStatus'`

2. **Security Group Rules Changed**
   - EC2 security group must be allowed in RDS security group
   - Port 5432 (or your DB_PORT) must be open

3. **VPC/Network Configuration**
   - If RDS is not publicly accessible, EC2 must be in same VPC
   - Check VPC ID: `aws rds describe-db-instances --db-instance-identifier YOUR_INSTANCE --query 'DBInstances[0].DBSubnetGroup.VpcId'`

4. **Password Changed**
   - If RDS password was reset, update `DB_PASSWORD` secret in GitHub

5. **Endpoint Changed**
   - RDS endpoint can change after modifications
   - Always get fresh endpoint before deployment

## Quick Diagnostic

Run this to check everything at once:

```bash
# Set your instance identifier
$DB_INSTANCE = "your-rds-instance-id"

# Get all details
Write-Host "Status:" -ForegroundColor Cyan
aws rds describe-db-instances --db-instance-identifier $DB_INSTANCE --query 'DBInstances[0].DBInstanceStatus' --output text

Write-Host "`nEndpoint:" -ForegroundColor Cyan
aws rds describe-db-instances --db-instance-identifier $DB_INSTANCE --query 'DBInstances[0].Endpoint.Address' --output text

Write-Host "`nPort:" -ForegroundColor Cyan
aws rds describe-db-instances --db-instance-identifier $DB_INSTANCE --query 'DBInstances[0].Endpoint.Port' --output text

Write-Host "`nUsername:" -ForegroundColor Cyan
aws rds describe-db-instances --db-instance-identifier $DB_INSTANCE --query 'DBInstances[0].MasterUsername' --output text

Write-Host "`nDatabase Name:" -ForegroundColor Cyan
aws rds describe-db-instances --db-instance-identifier $DB_INSTANCE --query 'DBInstances[0].DBName' --output text

Write-Host "`nRecent Events:" -ForegroundColor Cyan
aws rds describe-events --source-identifier $DB_INSTANCE --source-type db-instance --duration 1440 --query 'Events[*].[EventTime,Message]' --output table
```

## After Getting Details

1. Add these secrets to GitHub:
   - `DB_HOST` = Endpoint address
   - `DB_USER` = Master username
   - `DB_NAME` = Database name (or "postgres" if not set)
   - `DB_PORT` = Port (usually 5432)
   - `DB_PASSWORD` = Your RDS password (you need to provide this)

2. Verify security groups allow connection from EC2 to RDS

3. Check if RDS status is "available"

4. Re-run the deployment

