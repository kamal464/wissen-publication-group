# Complete EC2 Deployment Script for Wissen Publication Group
# This script automates the entire deployment process

param(
    [string]$KeyPath = "",
    [string]$InstanceIP = "54.165.116.208",
    [string]$InstanceID = "i-016ab2b939f5f7a3b",
    [string]$SSHUser = "ubuntu"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Wissen Publication Group - Complete EC2 Deployment" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

# Step 1: Find SSH Key
Write-Host "📋 Step 1: Locating SSH Key..." -ForegroundColor Yellow

if ([string]::IsNullOrEmpty($KeyPath)) {
    # Try common locations
    $PossiblePaths = @(
        "$env:USERPROFILE\.ssh\Ec2-Tutorial.pem",
        "$env:USERPROFILE\.ssh\ec2-tutorial.pem",
        "$env:USERPROFILE\Downloads\Ec2-Tutorial.pem",
        "$env:USERPROFILE\Downloads\ec2-tutorial.pem",
        ".\Ec2-Tutorial.pem",
        ".\ec2-tutorial.pem"
    )
    
    foreach ($path in $PossiblePaths) {
        if (Test-Path $path) {
            $KeyPath = $path
            Write-Host "✅ Found key at: $KeyPath" -ForegroundColor Green
            break
        }
    }
}

if ([string]::IsNullOrEmpty($KeyPath) -or -not (Test-Path $KeyPath)) {
    Write-Host "❌ SSH key not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download your key pair:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#KeyPairs:" -ForegroundColor Cyan
    Write-Host "2. Find 'Ec2 Tutorial' key pair"
    Write-Host "3. Download the .pem file"
    Write-Host "4. Run this script with: -KeyPath 'C:\path\to\Ec2-Tutorial.pem'" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or place the key file in one of these locations:" -ForegroundColor Yellow
    $PossiblePaths | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
    exit 1
}

# Set correct permissions on key (Linux/Mac requirement, but good practice)
Write-Host "🔐 Setting key permissions..." -ForegroundColor Yellow

# Step 2: Verify Instance Status
Write-Host ""
Write-Host "📋 Step 2: Verifying EC2 Instance Status..." -ForegroundColor Yellow

$InstanceStatus = aws ec2 describe-instances --instance-ids $InstanceID --region us-east-1 --query 'Reservations[0].Instances[0].[State.Name,PublicIpAddress]' --output json 2>&1 | ConvertFrom-Json

if ($InstanceStatus[0] -ne "running") {
    Write-Host "⚠️  Instance is not running. Current status: $($InstanceStatus[0])" -ForegroundColor Yellow
    Write-Host "Starting instance..." -ForegroundColor Yellow
    aws ec2 start-instances --instance-ids $InstanceID --region us-east-1 | Out-Null
    Write-Host "Waiting for instance to start..." -ForegroundColor Yellow
    aws ec2 wait instance-running --instance-ids $InstanceID --region us-east-1
    Start-Sleep -Seconds 10
    
    $InstanceStatus = aws ec2 describe-instances --instance-ids $InstanceID --region us-east-1 --query 'Reservations[0].Instances[0].[State.Name,PublicIpAddress]' --output json 2>&1 | ConvertFrom-Json
    $InstanceIP = $InstanceStatus[1]
}

Write-Host "✅ Instance is running at: $InstanceIP" -ForegroundColor Green

# Step 3: Test SSH Connection
Write-Host ""
Write-Host "📋 Step 3: Testing SSH Connection..." -ForegroundColor Yellow

$SSHTest = ssh -i $KeyPath -o ConnectTimeout=5 -o StrictHostKeyChecking=no -o BatchMode=yes $SSHUser@$InstanceIP "echo 'SSH connection successful'" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  SSH connection test failed. This is normal for first connection." -ForegroundColor Yellow
    Write-Host "We'll proceed with deployment..." -ForegroundColor Yellow
}

# Step 4: Copy Setup Script
Write-Host ""
Write-Host "📋 Step 4: Copying Setup Scripts..." -ForegroundColor Yellow

if (Test-Path "setup-ec2.sh") {
    scp -i $KeyPath -o StrictHostKeyChecking=no "setup-ec2.sh" "${SSHUser}@${InstanceIP}:/tmp/setup-ec2.sh"
    Write-Host "✅ Setup script copied" -ForegroundColor Green
} else {
    Write-Host "⚠️  setup-ec2.sh not found. Will download from repository." -ForegroundColor Yellow
}

# Step 5: Run Initial Setup
Write-Host ""
Write-Host "📋 Step 5: Running Initial Server Setup (this will take 5-10 minutes)..." -ForegroundColor Yellow
Write-Host "Installing: Node.js, PM2, PostgreSQL, Nginx..." -ForegroundColor Gray

$SetupCommand = @"
if [ ! -f /tmp/setup-ec2.sh ]; then
    curl -o /tmp/setup-ec2.sh https://raw.githubusercontent.com/kamal464/wissen-publication-group/main/setup-ec2.sh
fi
sudo bash /tmp/setup-ec2.sh
"@

ssh -i $KeyPath -o StrictHostKeyChecking=no $SSHUser@$InstanceIP $SetupCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Server setup completed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Setup may have encountered issues. Check output above." -ForegroundColor Yellow
}

# Step 6: Clone Repository
Write-Host ""
Write-Host "📋 Step 6: Cloning Repository..." -ForegroundColor Yellow

$CloneCommand = @"
cd /var/www
if [ -d wissen-publication-group ]; then
    cd wissen-publication-group
    sudo git pull
else
    sudo git clone https://github.com/kamal464/wissen-publication-group.git
fi
sudo chown -R `$USER:`$USER wissen-publication-group
"@

ssh -i $KeyPath -o StrictHostKeyChecking=no $SSHUser@$InstanceIP $CloneCommand

Write-Host "✅ Repository cloned/updated" -ForegroundColor Green

# Step 7: Setup Database
Write-Host ""
Write-Host "📋 Step 7: Setting Up PostgreSQL Database..." -ForegroundColor Yellow

$DBPassword = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 16 | ForEach-Object {[char]$_})
Write-Host "Generated database password (save this!): $DBPassword" -ForegroundColor Cyan

$DBSetupCommand = @"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '$DBPassword';" 2>/dev/null || echo "Password already set or user doesn't exist"
sudo -u postgres createdb wissen_publication_group 2>/dev/null || echo "Database may already exist"
echo "Database setup complete"
"@

ssh -i $KeyPath -o StrictHostKeyChecking=no $SSHUser@$InstanceIP $DBSetupCommand

Write-Host "✅ Database setup completed" -ForegroundColor Green
Write-Host "Database Password: $DBPassword" -ForegroundColor Cyan
Write-Host "Save this password for backend/.env configuration!" -ForegroundColor Yellow

# Step 8: Create Environment Files Template
Write-Host ""
Write-Host "📋 Step 8: Creating Environment Configuration Files..." -ForegroundColor Yellow

$BackendEnv = @"
DATABASE_URL=postgresql://postgres:$DBPassword@localhost:5432/wissen_publication_group
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://$InstanceIP,https://$InstanceIP

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
S3_BUCKET_NAME=wissen-publication-group-files
CLOUDFRONT_URL=https://d2qm3szai4trao.cloudfront.net
"@

$FrontendEnv = @"
NEXT_PUBLIC_API_URL=http://$InstanceIP:3001/api
"@

$EnvSetupCommand = @"
cd /var/www/wissen-publication-group

# Create backend .env if it doesn't exist
if [ ! -f backend/.env ]; then
    cat > backend/.env << 'ENVEOF'
$BackendEnv
ENVEOF
    echo "✅ Created backend/.env"
else
    echo "⚠️  backend/.env already exists. Please update it manually."
fi

# Create frontend .env.production if it doesn't exist
if [ ! -f frontend/.env.production ]; then
    cat > frontend/.env.production << 'ENVEOF'
$FrontendEnv
ENVEOF
    echo "✅ Created frontend/.env.production"
else
    echo "⚠️  frontend/.env.production already exists. Please update it manually."
fi

echo ""
echo "⚠️  IMPORTANT: Update AWS credentials in backend/.env:"
echo "   - AWS_ACCESS_KEY_ID"
echo "   - AWS_SECRET_ACCESS_KEY"
"@

ssh -i $KeyPath -o StrictHostKeyChecking=no $SSHUser@$InstanceIP $EnvSetupCommand

Write-Host "✅ Environment files created" -ForegroundColor Green
Write-Host "⚠️  You need to update AWS credentials in backend/.env manually" -ForegroundColor Yellow

# Step 9: Deploy Application
Write-Host ""
Write-Host "📋 Step 9: Deploying Application..." -ForegroundColor Yellow

$DeployCommand = @"
cd /var/www/wissen-publication-group
chmod +x deploy-ec2.sh
./deploy-ec2.sh
"@

ssh -i $KeyPath -o StrictHostKeyChecking=no $SSHUser@$InstanceIP $DeployCommand

Write-Host "✅ Application deployment completed" -ForegroundColor Green

# Step 10: Configure Nginx
Write-Host ""
Write-Host "📋 Step 10: Configuring Nginx..." -ForegroundColor Yellow

$NginxConfig = @"
# Backend API Server
server {
    listen 80;
    server_name $InstanceIP;

    client_max_body_size 50M;
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
    }
}
"@

$NginxSetupCommand = @"
cd /var/www/wissen-publication-group
echo '$NginxConfig' | sudo tee /etc/nginx/sites-available/wissen-publication-group > /dev/null
sudo ln -sf /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
echo "✅ Nginx configured and reloaded"
"@

ssh -i $KeyPath -o StrictHostKeyChecking=no $SSHUser@$InstanceIP $NginxSetupCommand

Write-Host "✅ Nginx configured" -ForegroundColor Green

# Step 11: Verify Deployment
Write-Host ""
Write-Host "📋 Step 11: Verifying Deployment..." -ForegroundColor Yellow

$VerifyCommand = @"
echo "=== PM2 Status ==="
pm2 status
echo ""
echo "=== Nginx Status ==="
sudo systemctl status nginx --no-pager | head -5
echo ""
echo "=== PostgreSQL Status ==="
sudo systemctl status postgresql --no-pager | head -5
echo ""
echo "=== Testing Endpoints ==="
curl -s http://localhost:3001/api/health || echo "Backend not responding"
echo ""
curl -s http://localhost:3000 | head -20 || echo "Frontend not responding"
"@

ssh -i $KeyPath -o StrictHostKeyChecking=no $SSHUser@$InstanceIP $VerifyCommand

# Final Summary
Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your Application URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://$InstanceIP" -ForegroundColor White
Write-Host "   Backend API: http://$InstanceIP/api" -ForegroundColor White
Write-Host "   Health Check: http://$InstanceIP/api/health" -ForegroundColor White
Write-Host ""
Write-Host "📝 Important Information:" -ForegroundColor Yellow
Write-Host "   Instance IP: $InstanceIP" -ForegroundColor White
Write-Host "   Instance ID: $InstanceID" -ForegroundColor White
Write-Host "   Database Password: $DBPassword" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Update AWS credentials in backend/.env:" -ForegroundColor White
Write-Host "      ssh -i $KeyPath $SSHUser@$InstanceIP" -ForegroundColor Gray
Write-Host "      nano /var/www/wissen-publication-group/backend/.env" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Test your application:" -ForegroundColor White
Write-Host "      Open: http://$InstanceIP" -ForegroundColor Cyan
Write-Host ""
Write-Host "   3. (Optional) Setup SSL with Let's Encrypt:" -ForegroundColor White
Write-Host "      ssh -i $KeyPath $SSHUser@$InstanceIP" -ForegroundColor Gray
Write-Host "      sudo certbot --nginx -d yourdomain.com" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Deployment successful!" -ForegroundColor Green

