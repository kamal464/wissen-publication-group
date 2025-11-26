# API Testing Guide

## Test Article List Endpoint

### PowerShell Command
```powershell
curl.exe http://localhost:3001/api/v1/articles
```

### Expected Response Structure
```json
{
  "data": [
    {
      "id": 1,
      "title": "Climate Change Mitigation Through Renewable Energy Integration",
      "abstract": "...",
      "journalId": 1,
      "status": "PUBLISHED",
      "pdfUrl": "https://example.com/sample-paper-1.pdf",
      "submittedAt": "2024-09-15T00:00:00.000Z",
      "publishedAt": "2024-09-15T00:00:00.000Z",
      "authors": [
        {
          "id": 1,
          "name": "Dr. Sarah Martinez",
          "email": "sarah.martinez@example.com",
          "affiliation": "MIT Climate Lab"
        }
      ],
      "journal": {
        "id": 1,
        "title": "Global Journal of Environmental Sciences",
        "issn": "2765-9820"
      }
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

## Common Issues

### Issue 1: Empty Data Array
**Cause**: Database not seeded
**Solution**: 
```powershell
cd backend
npx prisma db seed
```

### Issue 2: Missing Meta Property
**Cause**: Backend service not returning proper structure
**Solution**: Check `backend/src/articles/articles.service.ts` - the `findAll` method should return both `data` and `meta`

### Issue 3: Frontend TypeError
**Cause**: Response structure mismatch
**Solution**: Updated frontend to safely handle response with optional chaining (`articlesData.meta?.total || 0`)
