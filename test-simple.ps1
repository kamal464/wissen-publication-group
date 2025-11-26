# Simple Manuscript Submission Test Script
# Run this from: C:\Users\kolli\universal-publishers

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Manuscript Submission API Tests" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3001/api"
$testFile = "C:\Users\kolli\Downloads\python-roadmap.pdf"

# Test 1: Check Backend
Write-Host "[Test 1] Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = curl.exe $baseUrl 2>&1
    Write-Host "[PASS] Backend is responding" -ForegroundColor Green
}
catch {
    Write-Host "[FAIL] Backend is not running!" -ForegroundColor Red
    Write-Host "Start it with: cd backend ; npm run start:dev" -ForegroundColor Yellow
    exit
}
Write-Host ""

# Test 2: Get Articles
Write-Host "[Test 2] Testing GET /api/articles..." -ForegroundColor Yellow
$response = curl.exe "$baseUrl/articles" 2>&1
if ($response -match '"data"') {
    Write-Host "[PASS] Articles endpoint is working" -ForegroundColor Green
}
else {
    Write-Host "[FAIL] Articles endpoint returned unexpected response" -ForegroundColor Red
}
Write-Host ""

# Test 3: Submit Manuscript
Write-Host "[Test 3] Testing POST /api/articles/manuscripts..." -ForegroundColor Yellow
if (Test-Path $testFile) {
    Write-Host "Using file: $testFile" -ForegroundColor Gray
    
    $response = curl.exe -X POST "$baseUrl/articles/manuscripts" `
        -F "title=Automated Test Manuscript" `
        -F "journalId=1" `
        -F "abstract=This is an automated test submission to verify the manuscript submission API is working correctly. The abstract contains more than 100 characters to pass validation requirements and demonstrate proper API functionality." `
        -F "keywords=test,automation,API" `
        -F 'authors=[{"name":"Test Author","email":"test@example.com","affiliation":"Test University"}]' `
        -F "pdf=@$testFile" 2>&1
    
    if ($response -match '"success".*true' -or $response -match '"manuscriptId"') {
        Write-Host "[PASS] Manuscript submitted successfully!" -ForegroundColor Green
        
        # Try to extract manuscript ID
        if ($response -match '"manuscriptId"\s*:\s*(\d+)') {
            Write-Host "Manuscript ID: $($matches[1])" -ForegroundColor Gray
        }
    }
    elseif ($response -match '404') {
        Write-Host "[FAIL] 404 Error - Route not found" -ForegroundColor Red
        Write-Host "Expected: POST $baseUrl/articles/manuscripts" -ForegroundColor Yellow
        Write-Host "Check that backend routes are configured correctly" -ForegroundColor Yellow
    }
    elseif ($response -match '400') {
        Write-Host "[FAIL] 400 Bad Request - Validation error" -ForegroundColor Red
        Write-Host "Response: $response" -ForegroundColor Gray
    }
    else {
        Write-Host "[FAIL] Unexpected response" -ForegroundColor Red
        Write-Host "Response: $response" -ForegroundColor Gray
    }
}
else {
    Write-Host "[SKIP] Test file not found: $testFile" -ForegroundColor Yellow
    Write-Host "Update the `$testFile variable with a valid PDF path" -ForegroundColor Gray
}
Write-Host ""

# Test 4: Check Uploads Directory
Write-Host "[Test 4] Checking uploads directory..." -ForegroundColor Yellow
if (Test-Path ".\backend\uploads") {
    $files = Get-ChildItem ".\backend\uploads" -File
    Write-Host "[PASS] Uploads directory exists with $($files.Count) files" -ForegroundColor Green
    
    if ($files.Count -gt 0) {
        Write-Host "Recent uploads:" -ForegroundColor Gray
        $files | Sort-Object LastWriteTime -Descending | Select-Object -First 3 | ForEach-Object {
            $sizeMB = [math]::Round($_.Length / 1MB, 2)
            Write-Host "  - $($_.Name) ($sizeMB MB)" -ForegroundColor Gray
        }
    }
}
else {
    Write-Host "[INFO] Uploads directory will be created on first upload" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Tests Complete" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
