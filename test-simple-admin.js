#!/usr/bin/env node

/**
 * Simple Admin Flow Test
 * Tests the admin login and dashboard functionality
 */

const puppeteer = require('puppeteer');

class SimpleAdminTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'http://localhost:3000';
  }

  async init() {
    console.log('🚀 Starting Simple Admin Flow Test...');
    this.browser = await puppeteer.launch({ 
      headless: false, // Set to true for headless mode
      defaultViewport: null,
      args: ['--start-maximized']
    });
    this.page = await this.browser.newPage();
    this.page.setDefaultTimeout(10000);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async testLogin() {
    console.log('🧪 Testing Admin Login...');
    
    try {
      // Navigate to login page
      await this.page.goto(`${this.baseUrl}/admin/login`);
      await this.page.waitForSelector('h1', { timeout: 5000 });
      
      // Take screenshot
      await this.page.screenshot({ path: 'admin-login.png', fullPage: true });
      console.log('✅ Login page loaded successfully');
      
      // Fill login form
      await this.page.type('input[placeholder="Enter your username"]', 'admin');
      await this.page.type('input[placeholder="Enter your password"]', 'admin123');
      
      // Click login button
      await this.page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await this.page.waitForSelector('h1:has-text("Welcome back")', { timeout: 10000 });
      
      // Take screenshot of dashboard
      await this.page.screenshot({ path: 'admin-dashboard.png', fullPage: true });
      console.log('✅ Login successful, dashboard loaded');
      
      return true;
    } catch (error) {
      console.error('❌ Login test failed:', error.message);
      return false;
    }
  }

  async testNavigation() {
    console.log('🧪 Testing Navigation...');
    
    try {
      // Test sidebar navigation
      const menuItems = [
        { text: 'Journal Management', href: '/admin/journals' },
        { text: 'Articles Management', href: '/admin/articles' },
        { text: 'Analytics', href: '/admin/analytics' }
      ];
      
      for (const item of menuItems) {
        try {
          await this.page.click(`a:has-text("${item.text}")`);
          await this.page.waitForTimeout(2000);
          console.log(`✅ Navigated to ${item.text}`);
        } catch (error) {
          console.log(`⚠️  Could not navigate to ${item.text}: ${error.message}`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Navigation test failed:', error.message);
      return false;
    }
  }

  async testLogout() {
    console.log('🧪 Testing Logout...');
    
    try {
      // Click logout button
      await this.page.click('button:has-text("Logout")');
      
      // Should redirect to login page
      await this.page.waitForSelector('h1:has-text("Admin Portal")', { timeout: 5000 });
      
      // Take screenshot
      await this.page.screenshot({ path: 'admin-logout.png', fullPage: true });
      console.log('✅ Logout successful');
      
      return true;
    } catch (error) {
      console.error('❌ Logout test failed:', error.message);
      return false;
    }
  }

  async runAllTests() {
    try {
      await this.init();
      
      const loginResult = await this.testLogin();
      if (!loginResult) {
        console.log('❌ Login failed, skipping other tests');
        return;
      }
      
      await this.testNavigation();
      await this.testLogout();
      
      console.log('\n🎉 All tests completed!');
      console.log('📸 Screenshots saved: admin-login.png, admin-dashboard.png, admin-logout.png');
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the tests
if (require.main === module) {
  const tester = new SimpleAdminTester();
  tester.runAllTests().catch(console.error);
}

module.exports = SimpleAdminTester;
