#!/usr/bin/env node

/**
 * End-to-End Admin Flow Test Script
 * Tests the complete admin authentication and management flow
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

class AdminFlowTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'http://localhost:3000';
    this.testResults = [];
  }

  async init() {
    console.log('🚀 Starting Admin Flow Test...');
    this.browser = await puppeteer.launch({ 
      headless: false, // Set to true for headless mode
      defaultViewport: null,
      args: ['--start-maximized']
    });
    this.page = await this.browser.newPage();
    
    // Set longer timeout for slower operations
    this.page.setDefaultTimeout(30000);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async takeScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test-screenshots/${name}-${timestamp}.png`;
    
    // Create directory if it doesn't exist
    if (!fs.existsSync('test-screenshots')) {
      fs.mkdirSync('test-screenshots');
    }
    
    await this.page.screenshot({ path: filename, fullPage: true });
    console.log(`📸 Screenshot saved: ${filename}`);
    return filename;
  }

  async testStep(stepName, testFunction) {
    console.log(`\n🧪 Testing: ${stepName}`);
    try {
      await testFunction();
      this.testResults.push({ step: stepName, status: 'PASS', error: null });
      console.log(`✅ ${stepName} - PASSED`);
    } catch (error) {
      this.testResults.push({ step: stepName, status: 'FAIL', error: error.message });
      console.log(`❌ ${stepName} - FAILED: ${error.message}`);
      await this.takeScreenshot(`error-${stepName.replace(/\s+/g, '-').toLowerCase()}`);
    }
  }

  async testAdminLogin() {
    await this.page.goto(`${this.baseUrl}/admin/login`);
    await this.page.waitForSelector('input[placeholder="Enter username"]');
    
    // Take screenshot of login page
    await this.takeScreenshot('admin-login-page');
    
    // Fill login form
    await this.page.type('input[placeholder="Enter username"]', 'admin');
    await this.page.type('input[placeholder="Enter password"]', 'admin123');
    
    // Click login button
    await this.page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await this.page.waitForSelector('h1:has-text("Admin Dashboard")', { timeout: 10000 });
    
    // Verify we're on dashboard
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/admin/dashboard')) {
      throw new Error('Failed to redirect to dashboard after login');
    }
    
    await this.takeScreenshot('admin-dashboard');
  }

  async testDashboardNavigation() {
    // Test navigation to Journal Management
    await this.page.click('button:has-text("Journal Management")');
    await this.page.waitForSelector('h1:has-text("Journal Management")');
    await this.takeScreenshot('journal-management-page');
    
    // Go back to dashboard
    await this.page.click('button[aria-label="Back to Dashboard"]');
    await this.page.waitForSelector('h1:has-text("Admin Dashboard")');
    
    // Test navigation to Articles Management
    await this.page.click('button:has-text("Articles Management")');
    await this.page.waitForSelector('h1:has-text("Articles Management")');
    await this.takeScreenshot('articles-management-page');
    
    // Go back to dashboard
    await this.page.click('button[aria-label="Back to Dashboard"]');
    await this.page.waitForSelector('h1:has-text("Admin Dashboard")');
    
    // Test navigation to Analytics
    await this.page.click('button:has-text("Analytics Dashboard")');
    await this.page.waitForSelector('h1:has-text("Analytics Dashboard")');
    await this.takeScreenshot('analytics-dashboard');
  }

  async testJournalManagement() {
    await this.page.goto(`${this.baseUrl}/admin/journals`);
    await this.page.waitForSelector('h1:has-text("Journal Management")');
    
    // Test Add New Journal button
    await this.page.click('button:has-text("Add New Journal")');
    await this.page.waitForSelector('div[role="dialog"]');
    await this.takeScreenshot('add-journal-dialog');
    
    // Fill journal form
    await this.page.type('input[placeholder="Journal title"]', 'Test Journal');
    await this.page.type('textarea[placeholder="Journal description"]', 'This is a test journal for automated testing');
    await this.page.type('input[placeholder="ISSN number"]', '1234-5678');
    
    // Switch to Content Management tab
    await this.page.click('li[role="tab"]:has-text("Content Management")');
    await this.page.type('textarea[placeholder="Journal aims and scope"]', 'Test aims and scope content');
    await this.page.type('textarea[placeholder="Author submission guidelines"]', 'Test guidelines content');
    
    // Switch to Journal Pages tab
    await this.page.click('li[role="tab"]:has-text("Journal Pages")');
    await this.page.type('textarea[placeholder="Home page content"]', 'Test home page content');
    
    await this.takeScreenshot('journal-form-filled');
    
    // Save journal
    await this.page.click('button:has-text("Save Journal")');
    
    // Wait for success message
    await this.page.waitForSelector('.p-toast-message', { timeout: 5000 });
    await this.takeScreenshot('journal-saved-success');
    
    // Close dialog
    await this.page.click('button[aria-label="Close"]');
  }

  async testArticlesManagement() {
    await this.page.goto(`${this.baseUrl}/admin/articles`);
    await this.page.waitForSelector('h1:has-text("Articles Management")');
    
    // Test search functionality
    await this.page.type('input[placeholder*="Search by title"]', 'machine learning');
    await this.page.waitForTimeout(1000); // Wait for search to process
    await this.takeScreenshot('articles-search-results');
    
    // Clear search
    await this.page.click('button:has-text("Clear Filters")');
    
    // Test status filter
    await this.page.click('div[role="combobox"]');
    await this.page.click('li:has-text("Under Review")');
    await this.page.waitForTimeout(1000);
    await this.takeScreenshot('articles-filtered-by-status');
    
    // Test article details view
    const firstRow = await this.page.$('tbody tr:first-child');
    if (firstRow) {
      await firstRow.click();
      await this.page.waitForSelector('div[role="dialog"]');
      await this.takeScreenshot('article-details-dialog');
      
      // Test tab navigation in details
      await this.page.click('li[role="tab"]:has-text("Content")');
      await this.takeScreenshot('article-content-tab');
      
      await this.page.click('li[role="tab"]:has-text("Review")');
      await this.takeScreenshot('article-review-tab');
      
      // Close dialog
      await this.page.click('button[aria-label="Close"]');
    }
  }

  async testAnalyticsDashboard() {
    await this.page.goto(`${this.baseUrl}/admin/analytics`);
    await this.page.waitForSelector('h1:has-text("Analytics Dashboard")');
    
    // Test tab navigation
    await this.page.click('li[role="tab"]:has-text("Submissions")');
    await this.takeScreenshot('analytics-submissions-tab');
    
    await this.page.click('li[role="tab"]:has-text("Journal Analytics")');
    await this.takeScreenshot('analytics-journal-tab');
    
    await this.page.click('li[role="tab"]:has-text("Search Analytics")');
    await this.takeScreenshot('analytics-search-tab');
  }

  async testLogout() {
    // Test logout from analytics page
    await this.page.click('button:has-text("Logout")');
    
    // Should redirect to login page
    await this.page.waitForSelector('h1:has-text("Admin Login")');
    await this.takeScreenshot('logout-success');
    
    // Verify we can't access dashboard without login
    await this.page.goto(`${this.baseUrl}/admin/dashboard`);
    await this.page.waitForSelector('h1:has-text("Admin Login")');
    await this.takeScreenshot('unauthorized-redirect');
  }

  async runAllTests() {
    try {
      await this.init();
      
      await this.testStep('Admin Login Flow', () => this.testAdminLogin());
      await this.testStep('Dashboard Navigation', () => this.testDashboardNavigation());
      await this.testStep('Journal Management', () => this.testJournalManagement());
      await this.testStep('Articles Management', () => this.testArticlesManagement());
      await this.testStep('Analytics Dashboard', () => this.testAnalyticsDashboard());
      await this.testStep('Logout Flow', () => this.testLogout());
      
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      await this.cleanup();
    }
  }

  generateReport() {
    console.log('\n📊 Test Results Summary:');
    console.log('='.repeat(50));
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);
    
    console.log('\nDetailed Results:');
    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.step}: ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.testResults.length,
        passed,
        failed,
        successRate: ((passed / this.testResults.length) * 100).toFixed(1)
      },
      results: this.testResults
    };
    
    fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to: test-report.json');
  }
}

// Run the tests
if (require.main === module) {
  const tester = new AdminFlowTester();
  tester.runAllTests().catch(console.error);
}

module.exports = AdminFlowTester;
