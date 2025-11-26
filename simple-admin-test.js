#!/usr/bin/env node

/**
 * Simple Admin Flow Test Script
 * Tests the admin components without requiring servers to be running
 */

const fs = require('fs');
const path = require('path');

class SimpleAdminTester {
  constructor() {
    this.testResults = [];
    this.basePath = process.cwd();
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
    }
  }

  async testFileExists(filePath, description) {
    const fullPath = path.join(this.basePath, filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`${description} not found at ${filePath}`);
    }
    console.log(`📁 Found: ${filePath}`);
  }

  async testAdminFiles() {
    console.log('🔍 Checking Admin Files...');
    
    // Check frontend admin files
    await this.testFileExists('frontend/src/app/admin/login/page.tsx', 'Admin Login Page');
    await this.testFileExists('frontend/src/app/admin/dashboard/page.tsx', 'Admin Dashboard');
    await this.testFileExists('frontend/src/app/admin/journals/page.tsx', 'Journal Management');
    await this.testFileExists('frontend/src/app/admin/articles/page.tsx', 'Articles Management');
    await this.testFileExists('frontend/src/app/admin/analytics/page.tsx', 'Analytics Dashboard');
    await this.testFileExists('frontend/src/app/admin/layout.tsx', 'Admin Layout');
  }

  async testBackendFiles() {
    console.log('🔍 Checking Backend Files...');
    
    // Check backend admin files
    await this.testFileExists('backend/src/admin/admin.controller.ts', 'Admin Controller');
    await this.testFileExists('backend/src/admin/admin.service.ts', 'Admin Service');
    await this.testFileExists('backend/src/admin/admin.module.ts', 'Admin Module');
  }

  async testPackageFiles() {
    console.log('🔍 Checking Package Files...');
    
    // Check package.json files
    await this.testFileExists('frontend/package.json', 'Frontend Package.json');
    await this.testFileExists('backend/package.json', 'Backend Package.json');
    
    // Check if required dependencies are present
    const frontendPackage = JSON.parse(fs.readFileSync(path.join(this.basePath, 'frontend/package.json'), 'utf8'));
    const backendPackage = JSON.parse(fs.readFileSync(path.join(this.basePath, 'backend/package.json'), 'utf8'));
    
    const requiredFrontendDeps = ['next', 'react', 'primereact', 'tailwindcss'];
    const requiredBackendDeps = ['@nestjs/common', '@nestjs/core', '@prisma/client', 'prisma'];
    
    console.log('📦 Checking Frontend Dependencies...');
    requiredFrontendDeps.forEach(dep => {
      if (frontendPackage.dependencies[dep] || frontendPackage.devDependencies[dep]) {
        console.log(`✅ ${dep}: ${frontendPackage.dependencies[dep] || frontendPackage.devDependencies[dep]}`);
      } else {
        throw new Error(`Missing frontend dependency: ${dep}`);
      }
    });
    
    console.log('📦 Checking Backend Dependencies...');
    requiredBackendDeps.forEach(dep => {
      if (backendPackage.dependencies[dep] || backendPackage.devDependencies[dep]) {
        console.log(`✅ ${dep}: ${backendPackage.dependencies[dep] || backendPackage.devDependencies[dep]}`);
      } else {
        throw new Error(`Missing backend dependency: ${dep}`);
      }
    });
  }

  async testCodeStructure() {
    console.log('🔍 Checking Code Structure...');
    
    // Check if admin login page has required elements
    const loginPage = fs.readFileSync(path.join(this.basePath, 'frontend/src/app/admin/login/page.tsx'), 'utf8');
    
    const requiredLoginElements = [
      'username',
      'password',
      'admin',
      'admin123',
      'localStorage',
      'router.push'
    ];
    
    requiredLoginElements.forEach(element => {
      if (!loginPage.includes(element)) {
        throw new Error(`Login page missing required element: ${element}`);
      }
    });
    console.log('✅ Login page has all required elements');
    
    // Check if dashboard has required features
    const dashboardPage = fs.readFileSync(path.join(this.basePath, 'frontend/src/app/admin/dashboard/page.tsx'), 'utf8');
    
    const requiredDashboardElements = [
      'Admin Dashboard',
      'Statistics',
      'Journal Management',
      'Articles Management',
      'Analytics Dashboard'
    ];
    
    requiredDashboardElements.forEach(element => {
      if (!dashboardPage.includes(element)) {
        throw new Error(`Dashboard page missing required element: ${element}`);
      }
    });
    console.log('✅ Dashboard page has all required features');
  }

  async testDocumentation() {
    console.log('🔍 Checking Documentation...');
    
    await this.testFileExists('ADMIN_PANEL_README.md', 'Admin Panel README');
    await this.testFileExists('test-admin-flow.js', 'E2E Test Script');
    await this.testFileExists('test-admin-complete-flow.ps1', 'PowerShell Test Script');
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
    
    fs.writeFileSync('simple-test-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to: simple-test-report.json');
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed! Admin panel is ready for use.');
      console.log('\n📋 Next Steps:');
      console.log('1. Start backend server: cd backend && npm run start:dev');
      console.log('2. Start frontend server: cd frontend && npm run dev');
      console.log('3. Access admin panel: http://localhost:3000/admin/login');
      console.log('4. Login with: admin / admin123');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the errors above.');
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Simple Admin Panel Test...');
    console.log('=====================================');
    
    try {
      await this.testStep('Admin Files Check', () => this.testAdminFiles());
      await this.testStep('Backend Files Check', () => this.testBackendFiles());
      await this.testStep('Package Files Check', () => this.testPackageFiles());
      await this.testStep('Code Structure Check', () => this.testCodeStructure());
      await this.testStep('Documentation Check', () => this.testDocumentation());
      
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }
}

// Run the tests
if (require.main === module) {
  const tester = new SimpleAdminTester();
  tester.runAllTests().catch(console.error);
}

module.exports = SimpleAdminTester;
