# Fix AWS Signature Error (500 Error)

## Problem
Getting this error when uploading PDFs:
```json
{
    "statusCode": 500,
    "message": "The request signature we calculated does not match the signature you provided. Check your key and signing method."
}
```

This means AWS credentials are incorrect or not properly loaded.

## Quick Fix

### Option 1: Verify and Fix Credentials (Recommended)

Run this command in your **EC2 browser terminal**:

```bash
cd /var/www/wissen-publication-group/backend && cat .env | grep -E "AWS_|S3_|CLOUDFRONT" && echo "" && echo "If credentials look wrong, update them with:" && echo "nano .env"
```

### Option 2: Update Credentials Manually

1. **Edit the .env file:**
   ```bash
   cd /var/www/wissen-publication-group/backend
   nano .env
   ```

2. **Verify these lines are correct:**
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
   AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
   S3_BUCKET_NAME=wissen-publication-group-files
   CLOUDFRONT_URL=https://d2qm3szai4trao.cloudfront.net
   ```

3. **Important:** Make sure there are:
   - ✅ No extra spaces before/after the `=` sign
   - ✅ No quotes around the values
   - ✅ No line breaks in the middle of values
   - ✅ The secret key is complete (40 characters)

4. **Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

5. **Restart the backend:**
   ```bash
   cd /var/www/wissen-publication-group
   pm2 restart wissen-backend
   ```

### Option 3: Recreate .env File

If the file is corrupted, recreate it:

```bash
cd /var/www/wissen-publication-group/backend

cat > .env << 'ENVEOF'
DATABASE_URL=postgresql://postgres:Wissen2024!Secure@localhost:5432/wissen_publication_group
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://54.165.116.208
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
S3_BUCKET_NAME=wissen-publication-group-files
CLOUDFRONT_URL=https://d2qm3szai4trao.cloudfront.net
ENVEOF

pm2 restart wissen-backend
echo "✅ .env file recreated and backend restarted"
```

## Test S3 Connection

After fixing credentials, test the connection:

```bash
cd /var/www/wissen-publication-group/backend
node -e "
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
require('dotenv').config();
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
s3.send(new ListObjectsV2Command({ Bucket: process.env.S3_BUCKET_NAME, MaxKeys: 1 }))
  .then(() => console.log('✅ S3 connection successful!'))
  .catch(e => console.error('❌ Error:', e.message));
"
```

## Common Issues

### 1. Credentials Have Extra Spaces
```bash
# ❌ Wrong
AWS_ACCESS_KEY_ID = YOUR_AWS_ACCESS_KEY_ID

# ✅ Correct
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
```

### 2. Secret Key is Truncated
The secret key should be **40 characters long**. If it's shorter, it's incomplete.

### 3. Credentials Were Rotated
If you rotated AWS keys, update them in `.env` and restart the backend.

### 4. IAM Permissions Missing
Verify the IAM user has S3 permissions:
- `s3:PutObject`
- `s3:GetObject`
- `s3:ListBucket`

## Verify Backend Logs

Check if the backend is loading credentials correctly:

```bash
pm2 logs wissen-backend --lines 50
```

Look for:
- ✅ `S3 Service initialized with bucket: wissen-publication-group-files`
- ❌ Any errors about missing credentials

## After Fix

1. ✅ Credentials verified
2. ✅ Backend restarted
3. ✅ Try uploading PDF again
4. ✅ Should work now!

---

## Need New Credentials?

If credentials are incorrect, you need to:
1. Go to AWS Console → IAM → Users → `s3-cloudfront-user`
2. Create new Access Key
3. Update `backend/.env` with new credentials
4. Restart backend: `pm2 restart wissen-backend`

