#!/bin/bash
# Test S3 connection - run this on EC2

cd /var/www/wissen-publication-group/backend

node << 'TESTEOF'
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

s3.send(new ListObjectsV2Command({
  Bucket: process.env.S3_BUCKET_NAME,
  MaxKeys: 1
}))
  .then(() => {
    console.log('✅ S3 connection successful!');
    process.exit(0);
  })
  .catch(e => {
    console.error('❌ Error:', e.name, ':', e.message);
    if (e.name === 'InvalidAccessKeyId') {
      console.error('   → AWS_ACCESS_KEY_ID is incorrect');
    } else if (e.name === 'SignatureDoesNotMatch') {
      console.error('   → AWS_SECRET_ACCESS_KEY is incorrect');
    } else if (e.name === 'NoSuchBucket') {
      console.error('   → S3_BUCKET_NAME is incorrect');
    }
    process.exit(1);
  });
TESTEOF

