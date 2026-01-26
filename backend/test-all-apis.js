#!/usr/bin/env node

/**
 * Comprehensive API Test Suite
 * Tests all endpoints and reports errors/warnings
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.API_URL || 'http://localhost:3001';
const API_PREFIX = '/api';

// Test results
const results = {
  passed: [],
  failed: [],
  warnings: [],
  errors: []
};

// Helper to make HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + API_PREFIX + path);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 10000
    };

    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
            rawBody: body
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body,
            rawBody: body
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test helper
async function test(name, method, path, expectedStatus = 200, data = null, headers = {}) {
  try {
    const response = await makeRequest(method, path, data, headers);
    const statusMatch = Array.isArray(expectedStatus) 
      ? expectedStatus.includes(response.status)
      : response.status === expectedStatus;

    if (statusMatch) {
      results.passed.push({ name, method, path, status: response.status });
      console.log(`✅ ${name} - ${method} ${path} - Status: ${response.status}`);
      return { success: true, response };
    } else {
      results.failed.push({ 
        name, 
        method, 
        path, 
        expected: expectedStatus, 
        actual: response.status,
        body: response.body 
      });
      console.log(`❌ ${name} - ${method} ${path} - Expected: ${expectedStatus}, Got: ${response.status}`);
      return { success: false, response };
    }
  } catch (error) {
    results.errors.push({ name, method, path, error: error.message });
    console.log(`💥 ${name} - ${method} ${path} - Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Check for warnings in response
function checkWarnings(name, response) {
  if (response.body && typeof response.body === 'object') {
    // Check for warning indicators
    if (response.body.warning || response.body.warnings) {
      results.warnings.push({ name, warning: response.body.warning || response.body.warnings });
    }
    // Check for deprecated fields
    if (response.body.deprecated) {
      results.warnings.push({ name, warning: 'Deprecated endpoint or field' });
    }
  }
}

// Main test suite
async function runTests() {
  console.log('🧪 Starting Comprehensive API Test Suite...\n');
  console.log(`📍 Testing: ${BASE_URL}${API_PREFIX}\n`);

  // 1. Health Check
  console.log('📋 Testing Health & Basic Endpoints...');
  await test('Health Check', 'GET', '/health', 200);
  await test('Root Endpoint', 'GET', '/', [200, 404]);

  // 2. Journals
  console.log('\n📋 Testing Journals Endpoints...');
  const journalsResult = await test('Get All Journals', 'GET', '/journals', [200, 404]);
  if (journalsResult.success && journalsResult.response.body) {
    const journals = Array.isArray(journalsResult.response.body) ? journalsResult.response.body : [];
    if (journals.length > 0) {
      const firstJournal = journals[0];
      await test('Get Journal by ID', 'GET', `/journals/${firstJournal.id}`, [200, 404]);
      if (firstJournal.shortcode) {
        await test('Get Journal by Shortcode', 'GET', `/journals/shortcode/${firstJournal.shortcode}`, [200, 404]);
      }
      await test('Get Journal Articles', 'GET', `/journals/${firstJournal.id}/articles`, [200, 404]);
    }
  }
  await test('Get Journals with Invalid ID', 'GET', '/journals/999999', [404, 400]);

  // 3. Articles
  console.log('\n📋 Testing Articles Endpoints...');
  const articlesResult = await test('Get All Articles', 'GET', '/articles', [200, 404]);
  if (articlesResult.success && articlesResult.response.body) {
    const articles = Array.isArray(articlesResult.response.body) 
      ? articlesResult.response.body 
      : (articlesResult.response.body.articles || []);
    if (articles.length > 0) {
      const firstArticle = articles[0];
      await test('Get Article by ID', 'GET', `/articles/${firstArticle.id}`, [200, 404]);
      await test('Get Related Articles', 'GET', `/articles/${firstArticle.id}/related`, [200, 404]);
    }
  }
  await test('Get Articles with Filters', 'GET', '/articles?status=published&page=1&limit=5', [200, 404]);
  await test('Get Article with Invalid ID', 'GET', '/articles/999999', [404, 400]);

  // 4. News
  console.log('\n📋 Testing News Endpoints...');
  await test('Get Latest News', 'GET', '/news/latest', [200, 404]);
  await test('Get Latest News with Limit', 'GET', '/news/latest?limit=3', [200, 404]);
  await test('Get All News', 'GET', '/news', [200, 404]);
  const newsResult = await test('Get News by Journal ID', 'GET', '/news?journalId=1', [200, 404]);
  if (newsResult.success && newsResult.response.body) {
    const news = Array.isArray(newsResult.response.body) ? newsResult.response.body : [];
    if (news.length > 0) {
      await test('Get News by ID', 'GET', `/news/${news[0].id}`, [200, 404]);
    }
  }

  // 5. Admin Endpoints (without auth - will get 401/403)
  console.log('\n📋 Testing Admin Endpoints (Expected: 401/403)...');
  await test('Admin Login (No Credentials)', 'POST', '/admin/login', [400, 401, 422]);
  await test('Admin Login (Invalid Credentials)', 'POST', '/admin/login', [401, 400], {
    username: 'test',
    password: 'wrong'
  });
  await test('Get Dashboard Stats (No Auth)', 'GET', '/admin/dashboard/stats', [401, 403]);
  await test('Get Journal Analytics (No Auth)', 'GET', '/admin/analytics/journals', [401, 403]);
  await test('Get Article Analytics (No Auth)', 'GET', '/admin/analytics/articles', [401, 403]);
  await test('Get Users (No Auth)', 'GET', '/admin/users', [401, 403]);
  await test('Get Submissions (No Auth)', 'GET', '/admin/submissions', [401, 403]);
  await test('Get Journal Shortcodes (No Auth)', 'GET', '/admin/journal-shortcodes', [401, 403]);
  await test('Get Notifications (No Auth)', 'GET', '/admin/notifications', [401, 403]);
  await test('Global Search (No Auth)', 'GET', '/admin/search?query=test', [401, 403]);

  // 6. Messages
  console.log('\n📋 Testing Messages Endpoints...');
  await test('Get All Messages', 'GET', '/messages', [200, 404]);
  await test('Create Message (No Content)', 'POST', '/messages', [400, 422], {});
  await test('Create Message', 'POST', '/messages', [200, 201, 400], {
    content: 'Test message from API test suite'
  });

  // 7. File Uploads
  console.log('\n📋 Testing File Upload Endpoints...');
  await test('Get Upload File (Non-existent)', 'GET', '/uploads/nonexistent.pdf', [404, 400]);

  // 8. Error Handling Tests
  console.log('\n📋 Testing Error Handling...');
  await test('Invalid Endpoint', 'GET', '/nonexistent', 404);
  await test('Invalid Method', 'DELETE', '/health', [405, 404]);
  await test('Malformed JSON Request', 'POST', '/admin/login', [400, 422], 'invalid json string');
  
  // 9. CORS and Headers
  console.log('\n📋 Testing CORS and Headers...');
  const corsResult = await test('CORS Preflight', 'OPTIONS', '/journals', [200, 204, 404]);
  if (corsResult.success) {
    checkWarnings('CORS Check', corsResult.response);
  }

  // 10. Query Parameters
  console.log('\n📋 Testing Query Parameters...');
  await test('Articles with Search', 'GET', '/articles?search=test', [200, 404]);
  await test('Articles with Journal ID', 'GET', '/articles?journalId=1', [200, 404]);
  await test('Articles with Status', 'GET', '/articles?status=pending', [200, 404]);
  await test('Articles Pagination', 'GET', '/articles?page=1&limit=10', [200, 404]);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);
  console.log(`💥 Errors: ${results.errors.length}`);
  console.log('='.repeat(60));

  if (results.failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.failed.forEach((test, idx) => {
      console.log(`\n${idx + 1}. ${test.name}`);
      console.log(`   Method: ${test.method} ${test.path}`);
      console.log(`   Expected: ${test.expected}, Got: ${test.actual}`);
      if (test.body) {
        console.log(`   Response: ${JSON.stringify(test.body).substring(0, 200)}`);
      }
    });
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.warnings.forEach((warning, idx) => {
      console.log(`\n${idx + 1}. ${warning.name}: ${JSON.stringify(warning.warning)}`);
    });
  }

  if (results.errors.length > 0) {
    console.log('\n💥 ERRORS:');
    results.errors.forEach((error, idx) => {
      console.log(`\n${idx + 1}. ${error.name}`);
      console.log(`   Method: ${error.method} ${error.path}`);
      console.log(`   Error: ${error.error}`);
    });
  }

  // Exit with appropriate code
  process.exit(results.failed.length > 0 || results.errors.length > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error('💥 Fatal error running tests:', error);
  process.exit(1);
});
