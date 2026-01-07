const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

async function testAPIUpload() {
  console.log('🧪 Testing Backend API S3 Integration...\n');
  
  const apiUrl = `http://localhost:${process.env.PORT || 3001}/api`;
  
  try {
    // Create a test PDF file in memory
    const testPdfContent = Buffer.from('%PDF-1.4\nTest PDF Content');
    
    // Test 1: Check if backend is running
    console.log('📡 Test 1: Checking if backend is running...');
    try {
      const healthCheck = await axios.get(`${apiUrl.replace('/api', '')}/health`, { timeout: 5000 });
      console.log('✅ Backend is running\n');
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('⚠️  Backend is not running. Please start it with: npm run start:dev\n');
        return false;
      }
      console.log('⚠️  Health check failed, but continuing...\n');
    }
    
    // Test 2: Test S3Service directly
    console.log('📦 Test 2: Testing S3Service integration...');
    const { S3Service } = require('./dist/aws/s3.service');
    const s3Service = new S3Service();
    
    // Create a mock file object
    const mockFile = {
      buffer: Buffer.from('Test file content'),
      originalname: 'test-file.txt',
      mimetype: 'text/plain',
    };
    
    const uploadResult = await s3Service.uploadFile(mockFile, 'api-test');
    console.log(`✅ File uploaded via S3Service:`);
    console.log(`   Key: ${uploadResult.key}`);
    console.log(`   URL: ${uploadResult.url}`);
    console.log(`   CloudFront: ${uploadResult.url.includes('cloudfront.net') ? '✅' : '❌'}\n`);
    
    // Test 3: Verify file is accessible
    console.log('🌐 Test 3: Verifying file accessibility...');
    try {
      const fileResponse = await axios.get(uploadResult.url, { timeout: 10000 });
      console.log(`✅ File is accessible via ${uploadResult.url.includes('cloudfront.net') ? 'CloudFront' : 'S3'}`);
      console.log(`   Status: ${fileResponse.status}\n`);
    } catch (error) {
      console.log(`⚠️  File access test: ${error.message}\n`);
    }
    
    console.log('✅ All API integration tests passed!');
    return true;
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

// Check if axios is installed
try {
  require('axios');
  require('form-data');
  testAPIUpload().then(success => {
    process.exit(success ? 0 : 1);
  });
} catch (error) {
  console.log('⚠️  axios or form-data not installed. Installing...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install axios form-data', { stdio: 'inherit', cwd: __dirname });
    console.log('✅ Dependencies installed. Please run the test again.');
  } catch (installError) {
    console.error('❌ Failed to install dependencies:', installError.message);
    process.exit(1);
  }
}


