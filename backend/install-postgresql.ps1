# PostgreSQL Installation and Setup Script
# This script helps install and configure PostgreSQL for the Wissen Publication Group project

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Installation Guide" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Download PostgreSQL" -ForegroundColor Yellow
Write-Host "Please download PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor White
Write-Host "Or use the EnterpriseDB installer: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads" -ForegroundColor White
Write-Host ""
Write-Host "During installation, please use these settings:" -ForegroundColor Yellow
Write-Host "  - Port: 5432" -ForegroundColor White
Write-Host "  - Username: postgres" -ForegroundColor White
Write-Host "  - Password: kamaldb" -ForegroundColor White
Write-Host "  - Database: postgres (default)" -ForegroundColor White
Write-Host ""
Write-Host "After installation, run this script again to create the database." -ForegroundColor Yellow
Write-Host ""

# Check if PostgreSQL is installed
$pgPath = $null
$possiblePaths = @(
    "C:\Program Files\PostgreSQL\*\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\*\bin\psql.exe"
)

foreach ($path in $possiblePaths) {
    $found = Get-ChildItem -Path $path -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $pgPath = $found.DirectoryName
        break
    }
}

if ($pgPath) {
    Write-Host "[SUCCESS] PostgreSQL found at: $pgPath" -ForegroundColor Green
    $env:PATH = "$pgPath;$env:PATH"
    
    Write-Host ""
    Write-Host "Step 2: Creating database 'universal_publishers'..." -ForegroundColor Yellow
    
    # Set PostgreSQL password
    $env:PGPASSWORD = "kamaldb"
    
    # Create database
    $createDbCmd = "CREATE DATABASE universal_publishers;"
    $result = & "$pgPath\psql.exe" -U postgres -h localhost -p 5432 -c $createDbCmd 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Database 'universal_publishers' created successfully!" -ForegroundColor Green
    } elseif ($result -match "already exists") {
        Write-Host "[INFO] Database 'universal_publishers' already exists." -ForegroundColor Yellow
    } else {
        Write-Host "[WARNING] Could not create database. Error: $result" -ForegroundColor Red
        Write-Host "You may need to create it manually using pgAdmin or psql." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Step 3: Testing connection..." -ForegroundColor Yellow
    $testResult = & "$pgPath\psql.exe" -U postgres -h localhost -p 5432 -d universal_publishers -c "SELECT version();" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Connection successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "Setup Complete!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Your .env file is already configured with:" -ForegroundColor White
        Write-Host "  DATABASE_URL=postgresql://postgres:kamaldb@localhost:5432/universal_publishers" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Run Prisma migrations: npx prisma migrate dev" -ForegroundColor White
        Write-Host "  2. Generate Prisma client: npx prisma generate" -ForegroundColor White
        Write-Host "  3. Start Prisma Studio: npx prisma studio" -ForegroundColor White
    } else {
        Write-Host "[ERROR] Connection failed. Error: $testResult" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please check:" -ForegroundColor Yellow
        Write-Host "  1. PostgreSQL service is running" -ForegroundColor White
        Write-Host "  2. Password is correct (kamaldb)" -ForegroundColor White
        Write-Host "  3. Port 5432 is not blocked by firewall" -ForegroundColor White
    }
} else {
    Write-Host "[ERROR] PostgreSQL not found." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL first:" -ForegroundColor Yellow
    Write-Host "  1. Download from: https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "  2. Run the installer" -ForegroundColor White
    Write-Host "  3. Use these settings:" -ForegroundColor White
    Write-Host "     - Port: 5432" -ForegroundColor Gray
    Write-Host "     - Username: postgres" -ForegroundColor Gray
    Write-Host "     - Password: kamaldb" -ForegroundColor Gray
    Write-Host "  4. Run this script again after installation" -ForegroundColor White
}

