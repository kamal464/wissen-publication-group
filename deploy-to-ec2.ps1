# PowerShell Deployment Script for Wissen Publication Group to EC2
# Run this script from your local machine

$INSTANCE_IP = "54.165.116.208"
$INSTANCE_ID = "i-016ab2b939f5f7a3b"
$KEY_FILE = "$env:USERPROFILE\.ssh\Ec2-Tutorial.pem"  # Adjust path to your key file
$USER = "ubuntu"

Write-Host "🚀 Deploying Wissen Publication Group to EC2" -ForegroundColor Green
Write-Host "Instance IP: $INSTANCE_IP" -ForegroundColor Cyan
Write-Host ""

# Check if key file exists
if (-not (Test-Path $KEY_FILE)) {
    Write-Host "❌ SSH key file not found at: $KEY_FILE" -ForegroundColor Red
    Write-Host "Please download your key pair from EC2 Console or update KEY_FILE path" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To download key pair:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#KeyPairs:" -ForegroundColor Cyan
    Write-Host "2. Find 'Ec2 Tutorial' key pair"
    Write-Host "3. Download the .pem file"
    Write-Host "4. Save it to: $KEY_FILE"
    exit 1
}

Write-Host "✅ SSH key found" -ForegroundColor Green
Write-Host ""

# Function to run SSH command
function Invoke-SSH {
    param([string]$Command)
    ssh -i $KEY_FILE -o StrictHostKeyChecking=no $USER@$INSTANCE_IP $Command
}

# Function to copy file via SCP
function Copy-ToEC2 {
    param([string]$LocalPath, [string]$RemotePath)
    scp -i $KEY_FILE -o StrictHostKeyChecking=no $LocalPath "$USER@${INSTANCE_IP}:$RemotePath"
}

Write-Host "📦 Step 1: Running initial server setup..." -ForegroundColor Yellow
# Copy setup script
Copy-ToEC2 -LocalPath "setup-ec2.sh" -RemotePath "/tmp/setup-ec2.sh"

# Run setup (this will take a few minutes)
Invoke-SSH "sudo bash /tmp/setup-ec2.sh"

Write-Host ""
Write-Host "📥 Step 2: Cloning repository..." -ForegroundColor Yellow
Invoke-SSH "cd /var/www && sudo git clone https://github.com/kamal464/wissen-publication-group.git || (cd wissen-publication-group && sudo git pull)"
Invoke-SSH "sudo chown -R $USER:$USER /var/www/wissen-publication-group"

Write-Host ""
Write-Host "⚙️  Step 3: Setting up environment variables..." -ForegroundColor Yellow
Write-Host "You need to configure these manually:" -ForegroundColor Yellow
Write-Host "1. SSH to the instance: ssh -i $KEY_FILE $USER@$INSTANCE_IP" -ForegroundColor Cyan
Write-Host "2. Edit backend/.env with your DATABASE_URL and AWS credentials" -ForegroundColor Cyan
Write-Host "3. Edit frontend/.env.production with your API URL" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Step 4: Ready to deploy!" -ForegroundColor Green
Write-Host "SSH to instance and run:" -ForegroundColor Yellow
Write-Host "  cd /var/www/wissen-publication-group" -ForegroundColor Cyan
Write-Host "  ./deploy-ec2.sh" -ForegroundColor Cyan
Write-Host ""

Write-Host "🌐 Your EC2 instance is ready!" -ForegroundColor Green
Write-Host "Instance IP: $INSTANCE_IP" -ForegroundColor Cyan
Write-Host "SSH Command: ssh -i $KEY_FILE $USER@$INSTANCE_IP" -ForegroundColor Cyan

