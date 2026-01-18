# Quick Deployment via AWS Systems Manager (No SSH Key Needed)
# This uses AWS SSM to deploy without requiring SSH key

$InstanceID = "i-016ab2b939f5f7a3b"
$InstanceIP = "54.165.116.208"
$Region = "us-east-1"

Write-Host "🚀 Quick Deployment via AWS Systems Manager" -ForegroundColor Green
Write-Host "Instance: $InstanceID ($InstanceIP)" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install SSM Agent (if needed) and setup
Write-Host "📋 Step 1: Setting up SSM..." -ForegroundColor Yellow

$SetupCommands = @"
#!/bin/bash
# Update system
sudo apt update -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install Nginx
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Create app directory
sudo mkdir -p /var/www
sudo chown -R `$USER:`$USER /var/www

echo "✅ Setup complete"
"@

Write-Host "Running initial setup (this may take 5-10 minutes)..." -ForegroundColor Yellow
$CommandID = aws ssm send-command `
    --instance-ids $InstanceID `
    --document-name "AWS-RunShellScript" `
    --parameters "commands=[$($SetupCommands -replace "`"", '\"')]" `
    --region $Region `
    --query 'Command.CommandId' `
    --output text 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Setup command sent. Command ID: $CommandID" -ForegroundColor Green
    Write-Host "Waiting for setup to complete..." -ForegroundColor Yellow
    Start-Sleep -Seconds 60
    
    # Check command status
    aws ssm get-command-invocation --command-id $CommandID --instance-id $InstanceID --region $Region --query '[Status,StandardOutputContent]' --output json
} else {
    Write-Host "⚠️  SSM may not be available. Trying alternative method..." -ForegroundColor Yellow
}

# Step 2: Clone and deploy
Write-Host ""
Write-Host "📋 Step 2: Deploying Application..." -ForegroundColor Yellow

$DeployCommands = @"
#!/bin/bash
cd /var/www

# Clone repository
if [ -d wissen-publication-group ]; then
    cd wissen-publication-group
    sudo git pull
else
    sudo git clone https://github.com/kamal464/wissen-publication-group.git
    cd wissen-publication-group
fi

sudo chown -R `$USER:`$USER .

# Setup database
DB_PASS='Wissen2024!Secure'
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '\$DB_PASS';" 2>/dev/null
sudo -u postgres createdb wissen_publication_group 2>/dev/null

# Create backend .env
cat > backend/.env << EOF
DATABASE_URL=postgresql://postgres:\$DB_PASS@localhost:5432/wissen_publication_group
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://$InstanceIP,https://$InstanceIP
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAQVYSWBK4GMRMNMXK
AWS_SECRET_ACCESS_KEY=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
S3_BUCKET_NAME=wissen-publication-group-files
CLOUDFRONT_URL=https://d2qm3szai4trao.cloudfront.net
EOF

# Create frontend .env.production
cat > frontend/.env.production << EOF
NEXT_PUBLIC_API_URL=http://$InstanceIP:3001/api
EOF

# Install and build
cd backend
npm install
npx prisma generate
npx prisma migrate deploy || npx prisma db push
npm run build

cd ../frontend
npm install
npm run build

# Start with PM2
cd /var/www/wissen-publication-group
pm2 start ecosystem.config.js || pm2 restart all
pm2 save

# Setup Nginx
sudo tee /etc/nginx/sites-available/wissen-publication-group > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name $InstanceIP;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
    }
}
NGINXEOF

sudo ln -sf /etc/nginx/sites-available/wissen-publication-group /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Deployment complete!"
"@

$DeployCommandID = aws ssm send-command `
    --instance-ids $InstanceID `
    --document-name "AWS-RunShellScript" `
    --parameters "commands=[$($DeployCommands -replace "`"", '\"')]" `
    --region $Region `
    --query 'Command.CommandId' `
    --output text 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment command sent. Command ID: $DeployCommandID" -ForegroundColor Green
    Write-Host "Waiting for deployment (this may take 5-10 minutes)..." -ForegroundColor Yellow
    
    $maxWait = 600  # 10 minutes
    $waited = 0
    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds 30
        $waited += 30
        
        $status = aws ssm get-command-invocation --command-id $DeployCommandID --instance-id $InstanceID --region $Region --query 'Status' --output text 2>&1
        
        if ($status -eq "Success") {
            Write-Host "✅ Deployment successful!" -ForegroundColor Green
            break
        } elseif ($status -eq "Failed") {
            Write-Host "❌ Deployment failed. Check logs:" -ForegroundColor Red
            aws ssm get-command-invocation --command-id $DeployCommandID --instance-id $InstanceID --region $Region --query 'StandardErrorContent' --output text
            break
        }
        
        Write-Host "⏳ Still deploying... ($waited seconds)" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Could not deploy via SSM. You may need to:" -ForegroundColor Yellow
    Write-Host "1. Install SSM Agent on the instance" -ForegroundColor White
    Write-Host "2. Attach IAM role with SSM permissions" -ForegroundColor White
    Write-Host "3. Or use SSH with key file" -ForegroundColor White
}

Write-Host ""
Write-Host "🌐 Your Application URL:" -ForegroundColor Green
Write-Host "   http://$InstanceIP" -ForegroundColor Cyan
Write-Host "   http://$InstanceIP/api" -ForegroundColor Cyan
Write-Host "   http://$InstanceIP/api/health" -ForegroundColor Cyan

