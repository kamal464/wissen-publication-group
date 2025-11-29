# Wissen Publication Group - Deployment Script (PowerShell)
# This script builds and deploys the application

Write-Host "🚀 Starting deployment process..." -ForegroundColor Green

# Step 1: Build Backend
Write-Host "📦 Building backend..." -ForegroundColor Yellow
Set-Location backend
npm install
npm run build
Set-Location ..

# Step 2: Build Frontend
Write-Host "📦 Building frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install
npm run build
Set-Location ..

# Step 3: Deploy to Firebase
Write-Host "🔥 Deploying to Firebase..." -ForegroundColor Yellow
firebase deploy --only hosting

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your site is live at: https://wissen-publication-group.web.app" -ForegroundColor Cyan

