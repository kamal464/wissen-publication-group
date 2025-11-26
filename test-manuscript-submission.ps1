# Manuscript Submission Test Script
# Run this from the project root directory

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Manuscript Submission API Tests" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseUrl = "http://localhost:3001/api"
$testFile = "C:\Users\kolli\Downloads\python-roadmap.pdf"

# Test 1: Backend Health Check
Write-Host "[Test 1] Backend Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $baseUrl -Method GET -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "[PASS] Backend is running (Status: $($response.StatusCode))" -ForegroundColor Green
}
catch {
    Write-Host "[FAIL] Backend is not running!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host "  Please start backend: cd backend ; npm run start:dev" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Test 2: Get Articles
Write-Host "[Test 2] Get All Articles..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/articles" -Method GET
    if ($response.data) {
        $articleCount = $response.data.Count
        Write-Host "✓ Articles endpoint working ($articleCount articles found)" -ForegroundColor Green
    } else {
        Write-Host "⚠ Articles endpoint returned no data" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Failed to fetch articles" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test 3: Get Journals (verify journalId exists)
Write-Host "[Test 3] Get Journals..." -ForegroundColor Yellow
try {
    $journals = Invoke-RestMethod -Uri "$baseUrl/journals" -Method GET
    if ($journals) {
        $journalCount = $journals.Count
        Write-Host "✓ Journals endpoint working ($journalCount journals found)" -ForegroundColor Green
        if ($journalCount -gt 0) {
            $firstJournal = $journals[0]
            Write-Host "  Using Journal ID: $($firstJournal.id) - $($firstJournal.title)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "⚠ Failed to fetch journals" -ForegroundColor Yellow
}
Write-Host ""

# Test 4: Submit Manuscript (if test file exists)
Write-Host "[Test 4] Submit Manuscript..." -ForegroundColor Yellow
if (Test-Path $testFile) {
    Write-Host "  Using test file: $testFile" -ForegroundColor Gray
    Write-Host "  File size: $([math]::Round((Get-Item $testFile).Length / 1MB, 2)) MB" -ForegroundColor Gray
    
    try {
        # Prepare multipart form data
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        
        # Read file content
        $fileContent = [System.IO.File]::ReadAllBytes($testFile)
        $fileName = [System.IO.Path]::GetFileName($testFile)
        
        # Build multipart form data
        $bodyLines = @(
            "--$boundary",
            "Content-Disposition: form-data; name=`"title`"",
            "",
            "Automated Test Manuscript - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
            "--$boundary",
            "Content-Disposition: form-data; name=`"journalId`"",
            "",
            "1",
            "--$boundary",
            "Content-Disposition: form-data; name=`"abstract`"",
            "",
            "This is an automated test submission to verify the manuscript submission API is working correctly. The abstract contains more than 100 characters to pass validation requirements and demonstrate proper API functionality.",
            "--$boundary",
            "Content-Disposition: form-data; name=`"keywords`"",
            "",
            "test,automation,API,validation,manuscript",
            "--$boundary",
            "Content-Disposition: form-data; name=`"authors`"",
            "",
            '[{"name":"Test Author","email":"test@example.com","affiliation":"Test University"}]',
            "--$boundary",
            "Content-Disposition: form-data; name=`"pdf`"; filename=`"$fileName`"",
            "Content-Type: application/pdf",
            ""
        ) -join $LF
        
        $bodyEnd = "$LF--$boundary--$LF"
        
        # Combine everything
        $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyLines)
        $bodyBytes = $bodyBytes + $fileContent
        $bodyBytes = $bodyBytes + [System.Text.Encoding]::UTF8.GetBytes($bodyEnd)
        
        # Send request
        $headers = @{
            "Content-Type" = "multipart/form-data; boundary=$boundary"
        }
        
        $response = Invoke-RestMethod -Uri "$baseUrl/articles/manuscripts" -Method POST -Body $bodyBytes -Headers $headers
        
        if ($response.success) {
            Write-Host "✓ Manuscript submitted successfully!" -ForegroundColor Green
            Write-Host "  Manuscript ID: $($response.manuscriptId)" -ForegroundColor Gray
            Write-Host "  Title: $($response.article.title)" -ForegroundColor Gray
            Write-Host "  Status: $($response.article.status)" -ForegroundColor Gray
            Write-Host "  PDF URL: $($response.article.pdfUrl)" -ForegroundColor Gray
            Write-Host "  Authors: $($response.article.authors.Count)" -ForegroundColor Gray
        } else {
            Write-Host "⚠ Manuscript submitted but success flag is false" -ForegroundColor Yellow
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "✗ Manuscript submission failed (Status: $statusCode)" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
        
        if ($statusCode -eq 404) {
            Write-Host "  404 Error - Route not found" -ForegroundColor Yellow
            Write-Host "  Expected route: POST $baseUrl/articles/manuscripts" -ForegroundColor Yellow
            Write-Host "  Make sure backend is running with correct routes" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "⚠ Test file not found: $testFile" -ForegroundColor Yellow
    Write-Host "  Please update `$testFile variable with a valid PDF path" -ForegroundColor Gray
    Write-Host "  Skipping manuscript submission test" -ForegroundColor Gray
}
Write-Host ""

# Test 5: Verify Uploads Directory
Write-Host "[Test 5] Check Uploads Directory..." -ForegroundColor Yellow
$uploadsPath = Join-Path $PSScriptRoot "backend\uploads"
if (Test-Path $uploadsPath) {
    $files = Get-ChildItem $uploadsPath -File
    $fileCount = $files.Count
    Write-Host "✓ Uploads directory exists with $fileCount files" -ForegroundColor Green
    if ($fileCount -gt 0) {
        Write-Host "  Recent uploads:" -ForegroundColor Gray
        $files | Sort-Object LastWriteTime -Descending | Select-Object -First 5 | ForEach-Object {
            Write-Host "    - $($_.Name) ($([math]::Round($_.Length / 1MB, 2)) MB) - $($_.LastWriteTime.ToString('yyyy-MM-dd HH:mm'))" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "⚠ Uploads directory not found at: $uploadsPath" -ForegroundColor Yellow
    Write-Host "  It will be created automatically on first upload" -ForegroundColor Gray
}
Write-Host ""

# Test 6: Test Static File Access (if files exist)
Write-Host "[Test 6] Test Static File Access..." -ForegroundColor Yellow
if (Test-Path $uploadsPath) {
    $testUpload = Get-ChildItem $uploadsPath -File | Select-Object -First 1
    if ($testUpload) {
        try {
            $staticUrl = "http://localhost:3001/uploads/$($testUpload.Name)"
            $response = Invoke-WebRequest -Uri $staticUrl -Method HEAD -UseBasicParsing
            Write-Host "✓ Static file serving working (Status: $($response.StatusCode))" -ForegroundColor Green
            Write-Host "  Accessible at: $staticUrl" -ForegroundColor Gray
        } catch {
            Write-Host "⚠ Static file access failed" -ForegroundColor Yellow
            Write-Host "  Make sure static file serving is configured in main.ts" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠ No uploaded files to test" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ Uploads directory not found" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Tests Complete" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Summary
Write-Host "Summary:" -ForegroundColor White
Write-Host "  - Update `$testFile variable if needed" -ForegroundColor Gray
Write-Host "  - Make sure backend is running: cd backend ; npm run start:dev" -ForegroundColor Gray
Write-Host "  - Make sure database is seeded: cd backend ; npx prisma db seed" -ForegroundColor Gray
Write-Host "  - Frontend: cd frontend ; npm run dev" -ForegroundColor Gray
Write-Host ""
