# Multi-Format File Upload - Quick Reference

## ✅ What Changed

### Frontend (`frontend/src/app/submit-manuscript/page.tsx`)

1. **Updated FileUpload accept attribute**
   ```typescript
   // Before
   accept="application/pdf"
   
   // After
   accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg,image/jpg"
   ```

2. **Added file type validation**
   ```typescript
   const allowedTypes = [
     'application/pdf',
     'application/msword',
     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
     'image/png',
     'image/jpeg',
     'image/jpg'
   ];
   ```

3. **Added dynamic file icon function**
   ```typescript
   const getFileIcon = (file: File) => {
     if (file.type === 'application/pdf') return 'pi pi-file-pdf';
     if (file.type.includes('word')) return 'pi pi-file-word';
     if (file.type.includes('image')) return 'pi pi-image';
     return 'pi pi-file';
   };
   ```

4. **Updated UI text**
   - Label: "Upload Manuscript" (was "Upload PDF Document")
   - Placeholder: "PDF, Word, PNG, or JPEG (Max 10MB)"
   - Icon: Dynamic based on file type (was always PDF icon)

### Backend (`backend/src/articles/articles.module.ts`)

1. **Updated file filter to accept multiple formats**
   ```typescript
   // Before
   if (file.mimetype === 'application/pdf') {
     cb(null, true);
   } else {
     cb(new Error('Only PDF files are allowed'), false);
   }
   
   // After
   const allowedMimeTypes = [
     'application/pdf',
     'application/msword',
     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
     'image/png',
     'image/jpeg',
   ];
   
   if (allowedMimeTypes.includes(file.mimetype)) {
     cb(null, true);
   } else {
     cb(new Error('Only PDF, Word (.doc, .docx), PNG, and JPEG files are allowed'), false);
   }
   ```

---

## 📋 Accepted Formats

| Format | Extension | MIME Type |
|--------|-----------|-----------|
| PDF | .pdf | application/pdf |
| Word 97-2003 | .doc | application/msword |
| Word 2007+ | .docx | application/vnd.openxmlformats-officedocument.wordprocessingml.document |
| PNG | .png | image/png |
| JPEG | .jpg, .jpeg | image/jpeg |

**File Size Limit**: 10 MB

---

## 🧪 Quick Test

### Frontend Test
1. Start frontend: `cd frontend ; npm run dev`
2. Navigate to: http://localhost:3002/submit-manuscript
3. Try uploading each file type:
   - ✅ PDF file
   - ✅ Word .doc file
   - ✅ Word .docx file
   - ✅ PNG image
   - ✅ JPEG image
   - ❌ .txt file (should show error)
   - ❌ .exe file (should show error)

### Backend Test
```powershell
# Test with PDF
curl.exe -X POST http://localhost:3001/api/v1/manuscripts `
  -F "title=Test Paper" `
  -F "journalId=1" `
  -F "abstract=This is a test abstract that is more than 100 characters long to meet the validation requirements for manuscript submission testing purposes." `
  -F 'authors=[{"name":"John Doe","email":"john@test.com","affiliation":"MIT"}]' `
  -F "pdf=@C:\path\to\test.pdf"

# Test with Word
curl.exe -X POST http://localhost:3001/api/v1/manuscripts `
  -F "title=Test Paper" `
  -F "journalId=1" `
  -F "abstract=This is a test abstract that is more than 100 characters long to meet the validation requirements for manuscript submission testing purposes." `
  -F 'authors=[{"name":"John Doe","email":"john@test.com","affiliation":"MIT"}]' `
  -F "pdf=@C:\path\to\test.docx"

# Test with PNG
curl.exe -X POST http://localhost:3001/api/v1/manuscripts `
  -F "title=Test Paper" `
  -F "journalId=1" `
  -F "abstract=This is a test abstract that is more than 100 characters long to meet the validation requirements for manuscript submission testing purposes." `
  -F 'authors=[{"name":"John Doe","email":"john@test.com","affiliation":"MIT"}]' `
  -F "pdf=@C:\path\to\image.png"
```

---

## 🎯 Expected Behavior

### Valid Upload
1. User selects supported file
2. File icon changes based on type (PDF=📄, Word=📝, Image=🖼️)
3. File name and size displayed
4. Form submits successfully
5. Green success toast: "Manuscript submitted successfully!"

### Invalid Upload
1. User selects unsupported file (.txt, .zip, .exe, etc.)
2. Red error toast: "Only PDF, Word (.doc, .docx), PNG, and JPEG files are allowed"
3. Form does not submit
4. User must select valid file type

---

## 🔍 Verification Checklist

- [x] Frontend accepts PDF, DOC, DOCX, PNG, JPEG
- [x] Backend validates MIME types
- [x] File icons change dynamically
- [x] Validation messages updated
- [x] UI text reflects multiple formats
- [x] 10MB limit enforced
- [x] Random filenames preserve extensions
- [x] Error handling for invalid types
- [x] Documentation created

---

## 🚀 Ready to Test!

Both frontend and backend are now configured to accept:
- ✅ PDF documents
- ✅ Microsoft Word files (.doc, .docx)
- ✅ PNG images
- ✅ JPEG images

All with proper validation and user-friendly error messages! 🎉
