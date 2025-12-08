# PowerShell script to sync Prisma schema with production database
# This ensures all migrations are applied after push

Write-Host "🚀 Syncing Prisma schema with production database..." -ForegroundColor Cyan
Write-Host "📋 Current directory: $(Get-Location)" -ForegroundColor Gray

# Check if DATABASE_URL is set
if (-not $env:DATABASE_URL) {
    Write-Host "❌ ERROR: DATABASE_URL environment variable is not set!" -ForegroundColor Red
    Write-Host "Please set it to your production database URL." -ForegroundColor Yellow
    exit 1
}

# Navigate to backend directory if not already there
if (-not (Test-Path "prisma\schema.prisma")) {
    if (Test-Path "backend") {
        Set-Location backend
    } else {
        Write-Host "❌ ERROR: Cannot find prisma\schema.prisma file" -ForegroundColor Red
        exit 1
    }
}

Write-Host "📊 Checking migration status..." -ForegroundColor Cyan
try {
    npx prisma migrate status
} catch {
    Write-Host "⚠️ Some migrations may be pending" -ForegroundColor Yellow
}

Write-Host "🔄 Deploying migrations to production..." -ForegroundColor Cyan
npx prisma migrate deploy

Write-Host "📦 Regenerating Prisma Client..." -ForegroundColor Cyan
npx prisma generate

Write-Host "✅ Schema sync completed successfully!" -ForegroundColor Green
