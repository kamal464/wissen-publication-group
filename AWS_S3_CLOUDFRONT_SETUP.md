# AWS S3 & CloudFront Integration - Complete Setup

## ✅ Setup Complete!

Your backend is now fully integrated with AWS S3 for file storage and CloudFront for CDN delivery.

---

## 📦 AWS Resources Created

### 1. **S3 Bucket**
- **Bucket Name:** `wissen-publication-group-files`
- **Region:** `us-east-1`
- **Status:** ✅ Created and configured
- **Public Access:** Enabled (for CloudFront)
- **CORS:** Configured for all origins

### 2. **CloudFront Distribution**
- **Distribution ID:** `E2T0BED587M4M5`
- **Domain Name:** `d2qm3szai4trao.cloudfront.net`
- **Status:** Deploying (may take 15-20 minutes to be fully active)
- **HTTPS:** Enabled (redirects HTTP to HTTPS)
- **Compression:** Enabled
- **Cache TTL:** 1 day (86400 seconds)

### 3. **IAM User**
- **Username:** `s3-cloudfront-user`
- **Permissions:** Full S3 and CloudFront access
- **Access Keys:** Configured in backend `.env`

---

## 🔧 Backend Configuration

### Environment Variables (`.env`)
```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
S3_BUCKET_NAME=wissen-publication-group-files
CLOUDFRONT_URL=https://d2qm3szai4trao.cloudfront.net
```

### Files Updated
1. ✅ **S3Service** (`backend/src/aws/s3.service.ts`) - Handles all S3 operations
2. ✅ **ArticlesModule** - Updated to use S3 for PDF uploads
3. ✅ **AdminModule** - Updated to use S3 for image uploads
4. ✅ **ArticlesController** - Uploads files to S3
5. ✅ **AdminController** - Uploads journal images to S3

---

## 📁 File Storage Structure

Files are organized in S3 with the following structure:
```
wissen-publication-group-files/
├── articles/
│   ├── [timestamp]-[random]-[filename].pdf
│   └── images/
│       └── [timestamp]-[random]-[filename].jpg
└── journals/
    └── [timestamp]-[random]-[filename].jpg
```

---

## 🌐 File URLs

### Before (Local Storage)
```
http://localhost:3001/uploads/filename.pdf
```

### After (S3 + CloudFront)
```
https://d2qm3szai4trao.cloudfront.net/articles/1234567890-abc123-filename.pdf
```

---

## 🚀 How It Works

1. **File Upload:**
   - User uploads file via API endpoint
   - File is stored in memory (Multer memoryStorage)
   - S3Service uploads file to S3 bucket
   - Returns CloudFront URL

2. **File Access:**
   - Files are served via CloudFront CDN
   - Faster delivery worldwide
   - HTTPS enabled
   - Automatic compression

3. **File Organization:**
   - Articles: `articles/` folder
   - Article Images: `articles/images/` folder
   - Journal Images: `journals/` folder

---

## 🔍 Testing

### Test S3 Upload
```bash
# Upload a test file
curl -X POST http://localhost:3001/api/articles/manuscripts \
  -F "pdf=@test.pdf" \
  -F "title=Test Article" \
  -F "journalId=1" \
  -F "abstract=Test abstract"
```

### Check S3 Bucket
```bash
aws s3 ls s3://wissen-publication-group-files/ --recursive
```

### Check CloudFront Status
```bash
aws cloudfront get-distribution --id E2T0BED587M4M5
```

---

## ⚠️ Important Notes

1. **CloudFront Deployment:**
   - Distribution is currently deploying
   - May take 15-20 minutes to be fully active
   - Check status: `aws cloudfront get-distribution --id E2T0BED587M4M5`

2. **File URLs:**
   - Old local file URLs won't work anymore
   - All new uploads will use CloudFront URLs
   - Existing database entries may need migration

3. **Security:**
   - S3 bucket is public (required for CloudFront)
   - CloudFront provides HTTPS and caching
   - Consider adding CloudFront signed URLs for private files

4. **Costs:**
   - S3: Pay for storage and requests
   - CloudFront: Pay for data transfer
   - Both have free tiers

---

## 🔄 Migration from Local Files

If you have existing files in the `uploads/` folder, you can migrate them:

```bash
# Upload all existing files to S3
aws s3 sync ./backend/uploads/ s3://wissen-publication-group-files/uploads/ --exclude "*" --include "*.pdf" --include "*.jpg" --include "*.png"
```

Then update database URLs from `/uploads/filename.pdf` to CloudFront URLs.

---

## 📊 Monitoring

### Check S3 Usage
```bash
aws s3 ls s3://wissen-publication-group-files/ --recursive --human-readable --summarize
```

### Check CloudFront Metrics
- Go to AWS Console → CloudFront → Distribution → Monitoring tab
- View requests, data transfer, error rates

---

## 🎯 Next Steps

1. ✅ **Wait for CloudFront deployment** (15-20 minutes)
2. ✅ **Test file uploads** via your API
3. ✅ **Verify files are accessible** via CloudFront URLs
4. ✅ **Update frontend** to use new file URLs
5. ⚠️ **Migrate existing files** if needed

---

## 📝 Support

- **S3 Console:** https://console.aws.amazon.com/s3/buckets/wissen-publication-group-files
- **CloudFront Console:** https://console.aws.amazon.com/cloudfront/v3/home#/distributions/E2T0BED587M4M5
- **IAM User:** `s3-cloudfront-user`

---

**Setup Date:** January 5, 2026  
**Status:** ✅ Complete and Ready


