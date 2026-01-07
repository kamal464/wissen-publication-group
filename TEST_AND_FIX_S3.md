# Test and Fix S3 Connection

## Step 1: Test S3 Connection

Run this to test if the credentials work:

```bash
cd /var/www/wissen-publication-group/backend && node -e "const {S3Client,ListObjectsV2Command}=require('@aws-sdk/client-s3');require('dotenv').config();const s3=new S3Client({region:process.env.AWS_REGION,credentials:{accessKeyId:process.env.AWS_ACCESS_KEY_ID,secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY}});s3.send(new ListObjectsV2Command({Bucket:process.env.S3_BUCKET_NAME,MaxKeys:1})).then(()=>console.log('✅ S3 connection successful!')).catch(e=>console.error('❌ Error:',e.name,':',e.message));"
```

## Step 2: Restart Backend

If the test passes, restart the backend to ensure it picks up the credentials:

```bash
cd /var/www/wissen-publication-group && pm2 restart wissen-backend && pm2 logs wissen-backend --lines 20
```

Look for: `S3 Service initialized with bucket: wissen-publication-group-files`

## Step 3: Check Backend Logs

If still getting errors, check the logs:

```bash
pm2 logs wissen-backend --lines 50 | grep -i "s3\|aws\|error"
```

