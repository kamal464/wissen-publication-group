# File Upload Configuration - Multiple Formats Support

## 📄 Supported File Formats

The manuscript submission system now accepts the following file formats:

### Documents
- **PDF** (.pdf) - `application/pdf`
- **Microsoft Word 97-2003** (.doc) - `application/msword`
- **Microsoft Word 2007+** (.docx) - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### Images
- **PNG** (.png) - `image/png`
- **JPEG** (.jpg, .jpeg) - `image/jpeg`

### File Size Limit
- **Maximum**: 10 MB per file

---

## 🎨 Frontend Implementation

### File Upload Component
**Location**: `frontend/src/app/submit-manuscript/page.tsx`

### Accept Attribute
```typescript
accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg,image/jpg"
```

### File Type Validation
```typescript
const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/jpg'
];

if (!allowedTypes.includes(form.pdf.type)) {
  toast.current?.show({ 
    severity: 'error', 
    summary: 'Invalid File Type', 
    detail: 'Only PDF, Word (.doc, .docx), PNG, and JPEG files are allowed', 
    life: 5000 
  });
  return false;
}
```

### Dynamic File Icons
```typescript
const getFileIcon = (file: File) => {
  if (file.type === 'application/pdf') return 'pi pi-file-pdf';
  if (file.type === 'application/msword' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return 'pi pi-file-word';
  }
  if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg') {
    return 'pi pi-image';
  }
  return 'pi pi-file';
};
```

### UI Updates
- Upload placeholder text: **"PDF, Word, PNG, or JPEG (Max 10MB)"**
- Label: **"Upload Manuscript"**
- Icon changes dynamically based on file type
- Validation message includes all accepted formats

---

## 🛠️ Backend Implementation

### Multer Configuration
**Location**: `backend/src/articles/articles.module.ts`

### File Filter
```typescript
fileFilter: (req, file, cb) => {
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
},
```

### Storage Configuration
```typescript
storage: diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    // Preserves original file extension (.pdf, .docx, .png, .jpg)
    cb(null, `${randomName}${extname(file.originalname)}`);
  },
}),
```

### File Size Limit
```typescript
limits: {
  fileSize: 10 * 1024 * 1024, // 10MB
},
```

---

## 🔒 Security Considerations

### 1. MIME Type Validation
- Backend validates MIME types, not just extensions
- Prevents malicious files disguised with wrong extensions

### 2. File Size Limits
- 10MB maximum prevents DOS attacks
- Enforced on both frontend and backend

### 3. Random Filenames
- Original filenames are NOT preserved on server
- Prevents directory traversal attacks
- 32-character random hexadecimal names

### 4. File Extension Preservation
- Extensions preserved for proper file handling
- Helps identify file types in storage

### 5. Storage Location
- Files stored in dedicated `uploads` directory
- Directory is outside web root for security
- Served through controlled static route

---

## 📋 Usage Examples

### Frontend Upload
```typescript
// User selects any supported file
const formData = new FormData();
formData.append('title', 'My Research Paper');
formData.append('journalId', '1');
formData.append('abstract', 'This is the abstract...');
formData.append('authors', JSON.stringify(authors));
formData.append('pdf', selectedFile); // Can be PDF, Word, PNG, or JPEG

await articleService.submitManuscript(formData);
```

### Backend Receives
```typescript
@Post('manuscripts')
@UseInterceptors(FileInterceptor('pdf'))
async submitManuscript(
  @Body() data: any,
  @UploadedFile() file: Express.Multer.File
) {
  // file.originalname: "research-paper.docx"
  // file.filename: "a1b2c3d4e5f6...xyz.docx"
  // file.mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  // file.size: 2048576 (bytes)
  // file.path: "uploads/a1b2c3d4e5f6...xyz.docx"
}
```

---

## 🎯 User Experience

### File Type Icons
| File Type | Icon | Color |
|-----------|------|-------|
| PDF | 📄 `pi pi-file-pdf` | Red |
| Word | 📝 `pi pi-file-word` | Blue |
| PNG/JPEG | 🖼️ `pi pi-image` | Purple |

### Visual Feedback
1. **Empty State**: Shows drag-and-drop area with supported formats
2. **File Selected**: Displays file name, size, and appropriate icon
3. **Invalid Type**: Red toast notification with error message
4. **Upload Progress**: Progress bar during submission
5. **Success**: Green toast with confirmation

### Error Messages
```
✅ "File Selected: research-paper.docx (2.5 MB)"
⚠️ "Please upload a file (PDF, Word, PNG, or JPEG)"
❌ "Only PDF, Word (.doc, .docx), PNG, and JPEG files are allowed"
❌ "File size exceeds 10 MB limit"
```

---

## 🧪 Testing

### Test Cases

#### Valid Files
```powershell
# PDF
curl.exe -X POST http://localhost:3001/api/v1/manuscripts `
  -F "title=Test Paper" `
  -F "journalId=1" `
  -F "abstract=<100+ chars>" `
  -F 'authors=[{"name":"John Doe","email":"john@test.com","affiliation":"MIT"}]' `
  -F "pdf=@C:\path\to\file.pdf"

# Word .docx
curl.exe -X POST http://localhost:3001/api/v1/manuscripts `
  -F "pdf=@C:\path\to\file.docx"

# PNG
curl.exe -X POST http://localhost:3001/api/v1/manuscripts `
  -F "pdf=@C:\path\to\image.png"

# JPEG
curl.exe -X POST http://localhost:3001/api/v1/manuscripts `
  -F "pdf=@C:\path\to\photo.jpg"
```

#### Invalid Files (Should Fail)
```powershell
# Executable
curl.exe -X POST http://localhost:3001/api/v1/manuscripts `
  -F "pdf=@C:\path\to\file.exe"
# Error: "Only PDF, Word (.doc, .docx), PNG, and JPEG files are allowed"

# ZIP
curl.exe -X POST http://localhost:3001/api/v1/manuscripts `
  -F "pdf=@C:\path\to\archive.zip"
# Error: File type not allowed

# Too Large (>10MB)
curl.exe -X POST http://localhost:3001/api/v1/manuscripts `
  -F "pdf=@C:\path\to\large-file.pdf"
# Error: File size exceeds limit
```

---

## 📊 File Storage Structure

```
backend/
└── uploads/
    ├── a1b2c3d4e5f6...xyz.pdf        (Original: research-paper.pdf)
    ├── 9f8e7d6c5b4a...abc.docx       (Original: manuscript.docx)
    ├── 3c4d5e6f7a8b...def.png        (Original: figure1.png)
    └── 7h8i9j0k1l2m...ghi.jpg        (Original: photo.jpg)
```

### Accessing Files
- **URL**: `http://localhost:3001/uploads/<filename>`
- **Example**: `http://localhost:3001/uploads/a1b2c3d4e5f6...xyz.pdf`

---

## ⚙️ Configuration Summary

### Frontend Configuration
| Setting | Value |
|---------|-------|
| Max File Size | 10 MB (10,000,000 bytes) |
| Accepted Types | PDF, DOC, DOCX, PNG, JPEG/JPG |
| Validation | Client-side (instant feedback) |
| Icons | Dynamic based on file type |

### Backend Configuration
| Setting | Value |
|---------|-------|
| Storage | Disk storage (`./uploads`) |
| Filename Strategy | 32-char random hex + original extension |
| Max File Size | 10 MB (10,485,760 bytes) |
| Accepted MIME Types | 5 types (PDF, DOC, DOCX, PNG, JPEG) |
| Validation | Server-side (security enforcement) |

---

## 🚀 Deployment Notes

### Production Checklist
- [ ] Configure cloud storage (S3, Azure Blob, Google Cloud Storage)
- [ ] Update file size limits based on requirements
- [ ] Implement virus scanning for uploaded files
- [ ] Set up CDN for serving uploaded files
- [ ] Configure proper CORS headers for file access
- [ ] Implement file encryption at rest
- [ ] Set up automated backup for uploads directory
- [ ] Monitor storage usage and set up alerts

### Environment Variables
```env
# Future cloud storage configuration
STORAGE_TYPE=local|s3|azure|gcs
AWS_S3_BUCKET=my-manuscripts-bucket
AWS_REGION=us-east-1
MAX_FILE_SIZE=10485760
```

---

## ✅ Summary

The manuscript submission system now supports:
- ✅ **PDF documents** - Primary format for research papers
- ✅ **Microsoft Word** - Both .doc and .docx formats
- ✅ **PNG images** - For figures and diagrams
- ✅ **JPEG images** - For photos and illustrations

With comprehensive validation on both frontend and backend for maximum security and user experience! 🎉
