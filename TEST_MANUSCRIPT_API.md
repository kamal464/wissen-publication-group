# Manuscript Submission API Test Script

## Prerequisites
- Backend server running on port 3001
- Database seeded with journals
- Valid test files available

## PowerShell Test Commands

### 1. Test Backend Server Health
```powershell
# Check if backend is running
curl.exe http://localhost:3001/api

# Expected: Should return backend info (not 404)
```

### 2. Test Get All Articles (Verify API is working)
```powershell
curl.exe http://localhost:3001/api/articles

# Expected: JSON response with articles array
```

### 3. Test Get Single Article
```powershell
curl.exe http://localhost:3001/api/articles/1

# Expected: JSON response with article details
```

### 4. Test Manuscript Submission with PDF
```powershell
# Replace C:\path\to\test.pdf with actual path
curl.exe -X POST http://localhost:3001/api/articles/manuscripts `
  -F "title=Advanced Machine Learning Research" `
  -F "journalId=1" `
  -F "abstract=This comprehensive study explores the latest developments in machine learning algorithms, focusing on deep neural networks and their applications in real-world scenarios. Our research demonstrates significant improvements in accuracy and efficiency across multiple domains." `
  -F "keywords=machine learning,deep learning,neural networks,AI" `
  -F 'authors=[{"name":"Dr. Jane Smith","email":"jane.smith@university.edu","affiliation":"MIT Computer Science Department"},{"name":"Dr. John Doe","email":"john.doe@stanford.edu","affiliation":"Stanford AI Lab"}]' `
  -F "pdf=@C:\Users\kolli\Downloads\python-roadmap.pdf"

# Expected: JSON response with success message and manuscript ID
```

### 5. Test Manuscript Submission with Word Document
```powershell
curl.exe -X POST http://localhost:3001/api/articles/manuscripts `
  -F "title=Climate Change Impact Study" `
  -F "journalId=1" `
  -F "abstract=This research investigates the profound effects of climate change on global ecosystems, examining temperature variations, sea level rise, and biodiversity loss over the past five decades. The study presents compelling evidence for immediate action." `
  -F "keywords=climate change,environment,sustainability,ecology" `
  -F 'authors=[{"name":"Dr. Emily Chen","email":"emily.chen@harvard.edu","affiliation":"Harvard Environmental Science"}]' `
  -F "pdf=@C:\path\to\document.docx"

# Expected: JSON response with success
```

### 6. Test Manuscript Submission with PNG Image
```powershell
curl.exe -X POST http://localhost:3001/api/articles/manuscripts `
  -F "title=Data Visualization Techniques" `
  -F "journalId=2" `
  -F "abstract=This paper presents innovative approaches to data visualization using modern web technologies. We demonstrate how interactive visualizations can enhance understanding of complex datasets and improve decision-making processes in various industries." `
  -F "keywords=data visualization,infographics,UI/UX,data science" `
  -F 'authors=[{"name":"Dr. Michael Zhang","email":"michael.zhang@mit.edu","affiliation":"MIT Data Science Lab"}]' `
  -F "pdf=@C:\path\to\chart.png"

# Expected: JSON response with success
```

### 7. Test Manuscript Submission with JPEG Image
```powershell
curl.exe -X POST http://localhost:3001/api/articles/manuscripts `
  -F "title=Medical Imaging Analysis" `
  -F "journalId=3" `
  -F "abstract=Our research leverages advanced image processing techniques to improve diagnostic accuracy in medical imaging. Through machine learning models trained on thousands of medical scans, we achieve unprecedented levels of precision in disease detection." `
  -F "keywords=medical imaging,AI diagnostics,radiology,healthcare" `
  -F 'authors=[{"name":"Dr. Sarah Johnson","email":"sarah.j@johnshopkins.edu","affiliation":"Johns Hopkins Medical School"}]' `
  -F "pdf=@C:\path\to\scan.jpg"

# Expected: JSON response with success
```

### 8. Test Invalid File Type (Should Fail)
```powershell
curl.exe -X POST http://localhost:3001/api/articles/manuscripts `
  -F "title=Test Paper" `
  -F "journalId=1" `
  -F "abstract=This is a test abstract that is more than 100 characters long to meet the validation requirements for manuscript submission testing purposes and validation." `
  -F 'authors=[{"name":"Test Author","email":"test@example.com","affiliation":"Test University"}]' `
  -F "pdf=@C:\path\to\file.txt"

# Expected: Error response - "Only PDF, Word (.doc, .docx), PNG, and JPEG files are allowed"
```

### 9. Test File Too Large (Should Fail)
```powershell
# Upload file > 10MB
curl.exe -X POST http://localhost:3001/api/articles/manuscripts `
  -F "title=Large File Test" `
  -F "journalId=1" `
  -F "abstract=Testing with a file that exceeds the maximum allowed size of 10 megabytes to verify that the server properly rejects oversized uploads and returns appropriate error messages." `
  -F 'authors=[{"name":"Test Author","email":"test@example.com","affiliation":"Test University"}]' `
  -F "pdf=@C:\path\to\large-file.pdf"

# Expected: Error response - "File too large"
```

### 10. Test Missing Required Fields (Should Fail)
```powershell
# Missing title
curl.exe -X POST http://localhost:3001/api/articles/manuscripts `
  -F "journalId=1" `
  -F "abstract=This is a test abstract." `
  -F 'authors=[{"name":"Test Author","email":"test@example.com","affiliation":"Test University"}]'

# Expected: Error response - Validation failed
```

### 11. Verify Uploaded Files
```powershell
# Check uploads directory
Get-ChildItem -Path .\backend\uploads\ | Select-Object Name, Length, LastWriteTime

# Expected: See uploaded files with random names
```

### 12. Test Static File Access
```powershell
# Replace {filename} with actual uploaded filename
curl.exe http://localhost:3001/uploads/{filename}

# Expected: File content should be returned
```

---

## Expected Success Response Format

```json
{
  "success": true,
  "message": "Manuscript submitted successfully",
  "article": {
    "id": 6,
    "title": "Advanced Machine Learning Research",
    "abstract": "...",
    "keywords": "machine learning,deep learning,neural networks,AI",
    "journalId": 1,
    "status": "PENDING",
    "pdfUrl": "/uploads/a1b2c3d4e5f6...xyz.pdf",
    "submittedAt": "2025-10-13T...",
    "publishedAt": null,
    "authors": [
      {
        "id": 10,
        "name": "Dr. Jane Smith",
        "email": "jane.smith@university.edu",
        "affiliation": "MIT Computer Science Department",
        "articleId": 6,
        "createdAt": "2025-10-13T..."
      },
      {
        "id": 11,
        "name": "Dr. John Doe",
        "email": "john.doe@stanford.edu",
        "affiliation": "Stanford AI Lab",
        "articleId": 6,
        "createdAt": "2025-10-13T..."
      }
    ],
    "journal": {
      "id": 1,
      "title": "Global Journal of Environmental Sciences",
      "issn": "2765-9820",
      "publisher": "Universal Publishers"
    }
  },
  "manuscriptId": 6
}
```

---

## Expected Error Response Format

### Invalid File Type
```json
{
  "statusCode": 400,
  "message": "Only PDF, Word (.doc, .docx), PNG, and JPEG files are allowed",
  "error": "Bad Request"
}
```

### File Too Large
```json
{
  "statusCode": 413,
  "message": "File too large",
  "error": "Payload Too Large"
}
```

### Validation Error
```json
{
  "statusCode": 400,
  "message": [
    "title should not be empty",
    "abstract must be longer than or equal to 100 characters"
  ],
  "error": "Bad Request"
}
```

---

## Automated Test Script

Save this as `test-manuscript-submission.ps1`:

```powershell
# Manuscript Submission Test Script
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
    $response = curl.exe $baseUrl 2>&1
    Write-Host "✓ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend is not running!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Get Articles
Write-Host "[Test 2] Get All Articles..." -ForegroundColor Yellow
try {
    $response = curl.exe "$baseUrl/articles" 2>&1
    if ($response -match '"data"') {
        Write-Host "✓ Articles endpoint working" -ForegroundColor Green
    } else {
        Write-Host "✗ Articles endpoint returned unexpected response" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Failed to fetch articles" -ForegroundColor Red
}
Write-Host ""

# Test 3: Submit Manuscript (if test file exists)
Write-Host "[Test 3] Submit Manuscript..." -ForegroundColor Yellow
if (Test-Path $testFile) {
    Write-Host "Using test file: $testFile" -ForegroundColor Gray
    
    $response = curl.exe -X POST "$baseUrl/articles/manuscripts" `
        -F "title=Automated Test Manuscript" `
        -F "journalId=1" `
        -F "abstract=This is an automated test submission to verify the manuscript submission API is working correctly. The abstract contains more than 100 characters to pass validation requirements." `
        -F "keywords=test,automation,API,validation" `
        -F 'authors=[{"name":"Test Author","email":"test@example.com","affiliation":"Test University"}]' `
        -F "pdf=@$testFile" 2>&1
    
    if ($response -match '"success".*true') {
        Write-Host "✓ Manuscript submitted successfully" -ForegroundColor Green
        
        # Extract manuscript ID from response
        if ($response -match '"manuscriptId"\s*:\s*(\d+)') {
            $manuscriptId = $matches[1]
            Write-Host "  Manuscript ID: $manuscriptId" -ForegroundColor Gray
        }
    } elseif ($response -match '404') {
        Write-Host "✗ 404 Error - Route not found" -ForegroundColor Red
        Write-Host "  Make sure backend is running with correct routes" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Manuscript submission failed" -ForegroundColor Red
        Write-Host "  Response: $($response | Out-String)" -ForegroundColor Gray
    }
} else {
    Write-Host "⚠ Test file not found: $testFile" -ForegroundColor Yellow
    Write-Host "  Skipping manuscript submission test" -ForegroundColor Gray
}
Write-Host ""

# Test 4: Verify Uploads Directory
Write-Host "[Test 4] Check Uploads Directory..." -ForegroundColor Yellow
if (Test-Path ".\backend\uploads") {
    $fileCount = (Get-ChildItem ".\backend\uploads" -File).Count
    Write-Host "✓ Uploads directory exists with $fileCount files" -ForegroundColor Green
} else {
    Write-Host "⚠ Uploads directory not found" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Tests Complete" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
```

---

## Running the Tests

### Quick Test (Single Command)
```powershell
# Test with your PDF file
cd C:\Users\kolli\universal-publishers
curl.exe -X POST http://localhost:3001/api/articles/manuscripts `
  -F "title=Test Submission" `
  -F "journalId=1" `
  -F "abstract=This is a test abstract that contains more than one hundred characters to meet the minimum validation requirements for manuscript submissions." `
  -F "keywords=test,api,validation" `
  -F 'authors=[{"name":"Test Author","email":"test@example.com","affiliation":"Test University"}]' `
  -F "pdf=@C:\Users\kolli\Downloads\python-roadmap.pdf"
```

### Automated Test Script
```powershell
# Save the script above as test-manuscript-submission.ps1
# Then run:
cd C:\Users\kolli\universal-publishers
.\test-manuscript-submission.ps1
```

---

## Troubleshooting

### Issue: 404 Error
**Solution**: 
1. Make sure backend is running: `cd backend ; npm run start:dev`
2. Verify route is `/api/articles/manuscripts` (not `/api/v1/articles/manuscripts`)
3. Check backend logs for errors

### Issue: File Upload Fails
**Solution**:
1. Ensure `backend/uploads` directory exists
2. Check file path is correct and accessible
3. Verify file size is under 10MB
4. Confirm file type is PDF, Word, PNG, or JPEG

### Issue: Validation Errors
**Solution**:
1. Abstract must be at least 100 characters
2. All required fields must be filled (title, journalId, abstract, authors, pdf)
3. Authors array must have valid email addresses
4. journalId must be a valid number

---

## Success Criteria

✅ Backend responds to health check
✅ Articles list endpoint works
✅ Manuscript submission returns 200 OK
✅ Response includes manuscript ID
✅ File is saved in uploads directory
✅ Database record is created
✅ Authors are properly linked
✅ Static file is accessible via /uploads URL

---

## Database Verification

After successful submission, verify in database:

```sql
-- Check latest article
SELECT * FROM "Article" ORDER BY id DESC LIMIT 1;

-- Check authors for the article
SELECT * FROM "Author" WHERE "articleId" = <manuscript_id>;

-- Count pending manuscripts
SELECT COUNT(*) FROM "Article" WHERE status = 'PENDING';
```
