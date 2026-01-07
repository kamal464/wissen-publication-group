const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env' });

async function testS3Connection() {
  console.log('🧪 Testing S3 Connection...\n');
  
  const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    // Test 1: List bucket contents
    console.log('📋 Test 1: Listing S3 bucket contents...');
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      MaxKeys: 5,
    });
    const listResult = await s3Client.send(listCommand);
    console.log(`✅ Successfully connected to S3 bucket: ${process.env.S3_BUCKET_NAME}`);
    console.log(`   Found ${listResult.KeyCount || 0} objects\n`);

    // Test 2: Upload a test file
    console.log('📤 Test 2: Uploading test file to S3...');
    const testContent = `Test file uploaded at ${new Date().toISOString()}`;
    const testKey = `test/test-${Date.now()}.txt`;
    
    const putCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
    });
    
    await s3Client.send(putCommand);
    console.log(`✅ Test file uploaded successfully: ${testKey}`);
    
    // Construct URLs
    const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${testKey}`;
    const cloudfrontUrl = process.env.CLOUDFRONT_URL 
      ? `${process.env.CLOUDFRONT_URL}/${testKey}`
      : 'Not configured';
    
    console.log(`\n📦 File URLs:`);
    console.log(`   S3 URL: ${s3Url}`);
    console.log(`   CloudFront URL: ${cloudfrontUrl}`);
    
    console.log('\n✅ All S3 tests passed!');
    return true;
  } catch (error) {
    console.error('❌ S3 Test Failed:', error.message);
    if (error.name === 'InvalidAccessKeyId') {
      console.error('   → Check AWS_ACCESS_KEY_ID in .env');
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.error('   → Check AWS_SECRET_ACCESS_KEY in .env');
    } else if (error.name === 'NoSuchBucket') {
      console.error('   → Check S3_BUCKET_NAME in .env');
    }
    return false;
  }
}

testS3Connection().then(success => {
  process.exit(success ? 0 : 1);
});

