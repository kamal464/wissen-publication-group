# Simple S3 Test - No Bash History Issues

## Option 1: Create and Run Test Script

Run these commands one by one:

```bash
cd /var/www/wissen-publication-group/backend
```

```bash
cat > /tmp/test-s3.js << 'EOF'
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
  .catch(e => console.error('❌ Error:', e.name, ':', e.message));
EOF
```

```bash
node /tmp/test-s3.js
```

## Option 2: Single Line (Escaped)

Use single quotes to prevent history expansion:

```bash
cd /var/www/wissen-publication-group/backend && node -e 'const {S3Client,ListObjectsV2Command}=require("@aws-sdk/client-s3");require("dotenv").config();const s3=new S3Client({region:process.env.AWS_REGION,credentials:{accessKeyId:process.env.AWS_ACCESS_KEY_ID,secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY}});s3.send(new ListObjectsV2Command({Bucket:process.env.S3_BUCKET_NAME,MaxKeys:1})).then(()=>console.log("✅ S3 OK")).catch(e=>console.error("❌",e.name,":",e.message));'
```

## Option 3: Direct Test (Simplest)

Just test if the backend can connect:

```bash
cd /var/www/wissen-publication-group && pm2 restart wissen-backend && sleep 3 && pm2 logs wissen-backend --lines 30 | grep -i "s3\|aws\|error"
```

