# PowerShell script to check and deploy database migrations
# Run this locally before deploying to production

Write-Host "🔍 Checking database migration status..." -ForegroundColor Cyan

# Check if we're in the backend directory
if (-not (Test-Path "prisma\schema.prisma")) {
    Write-Host "❌ ERROR: Please run this script from the backend directory" -ForegroundColor Red
    exit 1
}

# Check if Prisma is installed
Write-Host "📋 Checking Prisma CLI..." -ForegroundColor Cyan
try {
    $prismaVersion = npx prisma --version 2>&1
    Write-Host "✅ Prisma found: $prismaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Prisma CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install prisma @prisma/client" -ForegroundColor Yellow
    exit 1
}

# Check migration status
Write-Host "`n🔍 Checking migration status..." -ForegroundColor Cyan
npx prisma migrate status

# Ask if user wants to create a new migration
Write-Host "`n❓ Do you have schema changes that need a migration?" -ForegroundColor Yellow
$createMigration = Read-Host "Create new migration? (y/n)"

if ($createMigration -eq "y" -or $createMigration -eq "Y") {
    $migrationName = Read-Host "Enter migration name (e.g., add_new_field)"
    Write-Host "`n🚀 Creating migration: $migrationName" -ForegroundColor Cyan
    npx prisma migrate dev --name $migrationName
    
    Write-Host "`n✅ Migration created successfully!" -ForegroundColor Green
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Review the migration files in prisma\migrations\" -ForegroundColor White
    Write-Host "   2. Commit the migration files to git" -ForegroundColor White
    Write-Host "   3. Push to production" -ForegroundColor White
    Write-Host "   4. Docker will automatically apply migrations on container startup" -ForegroundColor White
} else {
    Write-Host "`n✅ No new migration needed." -ForegroundColor Green
}

Write-Host "`n📋 Summary:" -ForegroundColor Cyan
Write-Host "   - Local migrations: Checked" -ForegroundColor White
Write-Host "   - Production: Migrations will run automatically via Docker entrypoint.sh" -ForegroundColor White
Write-Host "   - See DEPLOY_DB_CHANGES.md for detailed deployment instructions" -ForegroundColor White
