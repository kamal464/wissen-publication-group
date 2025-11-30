# Cloud Run File Storage Issue

## 🔴 Problem

**Error**: `404 Not Found` when accessing uploaded files at:
```
https://wissen-api-285326281784.us-central1.run.app/uploads/f73e059d9ae1e7c8ced90c8106f6432b.png
```

## 🔍 Root Cause

**Cloud Run containers are ephemeral** - this means:

1. **Files are lost on container restart**: When a file is uploaded, it's stored in the container's filesystem (`/app/uploads`). However, when the container restarts (which happens automatically), all files in the container filesystem are **permanently lost**.

2. **Container lifecycle**:
   - Files uploaded to Container A → stored in `/app/uploads`
   - Container A restarts or scales to zero
   - Container B starts (new instance)
   - **Files from Container A are gone** ❌

3. **Why this happens**:
   - Cloud Run scales containers up and down automatically
   - Each container instance has its own isolated filesystem
   - Files are not shared between container instances
   - No persistent storage by default

## ✅ Solution: Use Google Cloud Storage (GCS)

### Option 1: Cloud Storage (Recommended)

Store uploaded files in **Google Cloud Storage** instead of the container filesystem.

#### Benefits:
- ✅ **Persistent**: Files survive container restarts
- ✅ **Scalable**: Handles any number of files
- ✅ **Reliable**: 99.999999999% (11 9's) durability
- ✅ **Fast**: CDN-like access
- ✅ **Cost-effective**: Pay only for what you use

#### Implementation Steps:

1. **Create a Cloud Storage bucket**:
```bash
gsutil mb -p wissen-publication-group -l us-central1 gs://wissen-publication-uploads
```

2. **Make bucket publicly readable** (for images):
```bash
gsutil iam ch allUsers:objectViewer gs://wissen-publication-uploads
```

3. **Install Cloud Storage SDK**:
```bash
cd backend
npm install @google-cloud/storage
```

4. **Update backend to use Cloud Storage**:
   - Modify `backend/src/articles/articles.module.ts` to upload to GCS
   - Update `backend/src/files/files.controller.ts` to serve from GCS
   - Store file URLs in database as GCS URLs

5. **Update file URLs in database**:
   - Change from `/uploads/filename.png` to `https://storage.googleapis.com/wissen-publication-uploads/filename.png`

### Option 2: Cloud SQL with File Storage (Not Recommended)

Store file metadata in database and files in Cloud Storage (same as Option 1, but with database tracking).

### Option 3: Cloud Filestore (Overkill for this use case)

Use Cloud Filestore for shared filesystem (expensive, not needed here).

## 🚀 Quick Fix (Temporary)

For now, the `FilesController` has been updated to:
- Check multiple possible file paths
- Provide better error messages
- Log file search attempts

**However, this won't solve the fundamental issue** - files will still be lost on container restart.

## 📝 Current Status

- ✅ FilesController updated with better path resolution
- ✅ Better error logging added
- ⚠️ **Files still lost on container restart** (ephemeral filesystem)
- 🔄 **Cloud Storage integration needed** for permanent solution

## 🔧 Immediate Workaround

If you need files to persist **right now**:

1. **Upload files to Cloud Storage manually**:
```bash
gsutil cp local-file.png gs://wissen-publication-uploads/
```

2. **Update database URLs** to point to Cloud Storage:
```sql
UPDATE "Article" SET "pdfUrl" = 'https://storage.googleapis.com/wissen-publication-uploads/filename.pdf' WHERE "pdfUrl" LIKE '/uploads/%';
```

3. **Use Cloud Storage URLs** in your application instead of `/uploads/` paths.

## 📚 References

- [Cloud Run Container Lifecycle](https://cloud.google.com/run/docs/container-contract)
- [Cloud Storage Documentation](https://cloud.google.com/storage/docs)
- [Cloud Storage Node.js Client](https://cloud.google.com/nodejs/docs/reference/storage/latest)

## 🎯 Next Steps

1. **Short-term**: Use Cloud Storage URLs for new uploads
2. **Medium-term**: Implement Cloud Storage integration in backend
3. **Long-term**: Migrate existing file references to Cloud Storage

---

**Last Updated**: 2025-11-29  
**Status**: ⚠️ Temporary fix applied, Cloud Storage integration needed

