# Universal Publishers Admin Panel - Complete Flow Test Script (PowerShell)
# This script tests the entire admin system end-to-end on Windows

Write-Host "🚀 Universal Publishers Admin Panel - Complete Flow Test" -ForegroundColor Blue
Write-Host "======================================================" -ForegroundColor Blue

# Function to print colored output
function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if Node.js is installed
function Test-Node {
    try {
        $nodeVersion = node --version
        Write-Success "Node.js version: $nodeVersion"
        return $true
    }
    catch {
        Write-Error "Node.js is not installed. Please install Node.js 18+ to continue."
        return $false
    }
}

# Check if npm is installed
function Test-Npm {
    try {
        $npmVersion = npm --version
        Write-Success "npm version: $npmVersion"
        return $true
    }
    catch {
        Write-Error "npm is not installed. Please install npm to continue."
        return $false
    }
}

# Install dependencies
function Install-Dependencies {
    Write-Status "Installing dependencies..."
    
    # Frontend dependencies
    if (Test-Path "frontend") {
        Write-Status "Installing frontend dependencies..."
        Set-Location frontend
        npm install
        Set-Location ..
        Write-Success "Frontend dependencies installed"
    }
    else {
        Write-Error "Frontend directory not found"
        exit 1
    }
    
    # Backend dependencies
    if (Test-Path "backend") {
        Write-Status "Installing backend dependencies..."
        Set-Location backend
        npm install
        Set-Location ..
        Write-Success "Backend dependencies installed"
    }
    else {
        Write-Error "Backend directory not found"
        exit 1
    }
}

# Setup database
function Setup-Database {
    Write-Status "Setting up database..."
    
    if (Test-Path "backend") {
        Set-Location backend
        
        # Generate Prisma client
        Write-Status "Generating Prisma client..."
        npx prisma generate
        
        # Run migrations
        Write-Status "Running database migrations..."
        npx prisma migrate dev --name init
        
        # Seed database
        Write-Status "Seeding database..."
        npx prisma db seed
        
        Set-Location ..
        Write-Success "Database setup completed"
    }
    else {
        Write-Error "Backend directory not found"
        exit 1
    }
}

# Start backend server
function Start-Backend {
    Write-Status "Starting backend server..."
    
    if (Test-Path "backend") {
        Set-Location backend
        Start-Process -FilePath "npm" -ArgumentList "run", "start:dev" -WindowStyle Hidden
        Set-Location ..
        
        # Wait for backend to start
        Write-Status "Waiting for backend to start..."
        Start-Sleep -Seconds 10
        
        # Check if backend is running
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 5 -UseBasicParsing
            Write-Success "Backend server started successfully on port 3001"
        }
        catch {
            Write-Warning "Backend server may not be ready yet. Continuing..."
        }
    }
    else {
        Write-Error "Backend directory not found"
        exit 1
    }
}

# Start frontend server
function Start-Frontend {
    Write-Status "Starting frontend server..."
    
    if (Test-Path "frontend") {
        Set-Location frontend
        Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden
        Set-Location ..
        
        # Wait for frontend to start
        Write-Status "Waiting for frontend to start..."
        Start-Sleep -Seconds 15
        
        # Check if frontend is running
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
            Write-Success "Frontend server started successfully on port 3000"
        }
        catch {
            Write-Warning "Frontend server may not be ready yet. Continuing..."
        }
    }
    else {
        Write-Error "Frontend directory not found"
        exit 1
    }
}

# Test admin flow
function Test-AdminFlow {
    Write-Status "Testing admin flow..."
    
    # Install puppeteer for testing
    if (-not (Test-Path "test-package.json")) {
        Write-Error "Test package.json not found"
        return $false
    }
    
    # Install test dependencies
    Write-Status "Installing test dependencies..."
    npm install puppeteer --save-dev
    
    # Run the test
    Write-Status "Running end-to-end tests..."
    node test-admin-flow.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "All tests passed!"
        return $true
    }
    else {
        Write-Error "Some tests failed. Check the test report."
        return $false
    }
}

# Display access information
function Show-AccessInfo {
    Write-Host ""
    Write-Host "🎉 Universal Publishers Admin Panel is ready!" -ForegroundColor Green
    Write-Host "==============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Access URLs:" -ForegroundColor Cyan
    Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "   Admin Login: http://localhost:3000/admin/login" -ForegroundColor White
    Write-Host "   Backend API: http://localhost:3001" -ForegroundColor White
    Write-Host ""
    Write-Host "🔐 Demo Credentials:" -ForegroundColor Cyan
    Write-Host "   Username: admin" -ForegroundColor White
    Write-Host "   Password: admin123" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Admin Features:" -ForegroundColor Cyan
    Write-Host "   ✅ Dashboard with statistics" -ForegroundColor Green
    Write-Host "   ✅ Journal management (CRUD)" -ForegroundColor Green
    Write-Host "   ✅ Article management and review" -ForegroundColor Green
    Write-Host "   ✅ Analytics dashboard" -ForegroundColor Green
    Write-Host "   ✅ Content management for journal pages" -ForegroundColor Green
    Write-Host "   ✅ Search and filtering" -ForegroundColor Green
    Write-Host ""
    Write-Host "🧪 Testing:" -ForegroundColor Cyan
    Write-Host "   Run: node test-admin-flow.js" -ForegroundColor White
    Write-Host "   Report: test-report.json" -ForegroundColor White
    Write-Host ""
    Write-Host "🛑 To stop servers:" -ForegroundColor Cyan
    Write-Host "   Close PowerShell window or run: Get-Process | Where-Object {$_.ProcessName -eq 'node'} | Stop-Process" -ForegroundColor White
    Write-Host ""
}

# Main execution
function Main {
    Write-Status "Starting Universal Publishers Admin Panel setup..."
    
    # Check prerequisites
    if (-not (Test-Node)) { exit 1 }
    if (-not (Test-Npm)) { exit 1 }
    
    # Install dependencies
    Install-Dependencies
    
    # Setup database
    Setup-Database
    
    # Start servers
    Start-Backend
    Start-Frontend
    
    # Test admin flow
    $testResult = Test-AdminFlow
    
    # Show access information
    Show-AccessInfo
    
    # Keep script running
    Write-Status "Servers are running. Press Ctrl+C to stop."
    Write-Host "Press any key to continue..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Run main function
Main
