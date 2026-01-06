/**
 * Test file for Articles in Press filtering logic
 * Run with: node frontend/src/app/journal-admin/journals/articles-press/__tests__/filterLogic.test.js
 */

// Filter function for cards (copied from page.tsx)
function filterArticlesForCards(articles) {
  return articles.filter((article) => {
    // Hide all articles with status PUBLISHED
    if (article.status === 'PUBLISHED') {
      return false;
    }
    
    // Show all articles with status ACCEPTED (or any other non-PUBLISHED status)
    return true;
  });
}

// Filter function for Current Issue (copied from current-issue/page.tsx)
function filterCurrentIssueArticles(articles) {
  return articles.filter((article) => {
    // Only show articles with status PUBLISHED
    if (article.status !== 'PUBLISHED') {
      return false;
    }
    
    // Exclude articles that have month/year set (these are moved to months)
    if (article.issueMonth && article.year) {
      return false;
    }
    
    return true;
  });
}

// Filter function for calendar preview (copied from page.tsx)
function filterCalendarArticles(articles, previewMonth, previewYear) {
  if (previewMonth && previewYear) {
    // Both month and year selected - filter by month/year only (no status filter)
    return articles.filter(a => {
      const articleMonth = String(a.issueMonth || '').trim();
      const articleYear = String(a.year || '').trim();
      return articleMonth === previewMonth && articleYear === previewYear;
    });
  } else if (previewMonth && !previewYear) {
    // Only month selected, no year - show no articles
    return [];
  } else {
    // No month/year selected - show only articles that appear in cards (status ACCEPTED)
    return articles.filter(a => a.status !== 'PUBLISHED');
  }
}

// Test data
const testArticles = [
  // Newly created article
  {
    id: 1,
    title: 'New Article 1',
    status: 'ACCEPTED',
    issueMonth: 'January',
    year: '2025',
    publishedAt: '2025-01-15T00:00:00.000Z'
  },
  // Article in Current Issue (no month/year)
  {
    id: 2,
    title: 'Current Issue Article',
    status: 'PUBLISHED',
    issueMonth: '',
    year: ''
  },
  // Article moved to Months
  {
    id: 3,
    title: 'Moved to Months',
    status: 'PUBLISHED',
    issueMonth: 'January',
    year: '2024',
    publishedAt: '2024-01-10T00:00:00.000Z'
  },
  // Article moved to Articles in Press
  {
    id: 4,
    title: 'Moved to Articles in Press',
    status: 'ACCEPTED',
    issueMonth: '',
    year: ''
  },
  // Another newly created article without publishedAt
  {
    id: 5,
    title: 'New Article 2',
    status: 'ACCEPTED',
    issueMonth: 'February',
    year: '2025'
  }
];

// Test results
let passedTests = 0;
let failedTests = 0;
const testResults = [];

function test(name, condition) {
  if (condition) {
    passedTests++;
    testResults.push(`✅ PASS: ${name}`);
  } else {
    failedTests++;
    testResults.push(`❌ FAIL: ${name}`);
  }
}

console.log('🧪 Running Articles Filter Logic Tests...\n');

// Test 1: Cards should show only ACCEPTED articles
const cardsResult = filterArticlesForCards(testArticles);
test('Cards show only ACCEPTED articles', 
  cardsResult.length === 3 && 
  cardsResult.every(a => a.status === 'ACCEPTED') &&
  cardsResult.some(a => a.id === 1) &&
  cardsResult.some(a => a.id === 4) &&
  cardsResult.some(a => a.id === 5)
);

// Test 2: Cards should hide PUBLISHED articles
test('Cards hide PUBLISHED articles',
  !cardsResult.some(a => a.status === 'PUBLISHED') &&
  !cardsResult.some(a => a.id === 2) &&
  !cardsResult.some(a => a.id === 3)
);

// Test 3: Current Issue should show only PUBLISHED articles without month/year
const currentIssueResult = filterCurrentIssueArticles(testArticles);
test('Current Issue shows only PUBLISHED articles without month/year',
  currentIssueResult.length === 1 &&
  currentIssueResult[0].id === 2 &&
  currentIssueResult[0].status === 'PUBLISHED' &&
  !currentIssueResult[0].issueMonth &&
  !currentIssueResult[0].year
);

// Test 4: Current Issue should hide articles with month/year
test('Current Issue hides articles with month/year',
  !currentIssueResult.some(a => a.id === 3) // Article 3 has month/year
);

// Test 5: Current Issue should hide ACCEPTED articles
test('Current Issue hides ACCEPTED articles',
  !currentIssueResult.some(a => a.status === 'ACCEPTED')
);

// Test 6: Calendar with month/year shows all articles for that month/year
const calendarWithMonthYear = filterCalendarArticles(testArticles, 'January', '2024');
test('Calendar with month/year shows articles regardless of status',
  calendarWithMonthYear.length === 1 &&
  calendarWithMonthYear[0].id === 3 &&
  calendarWithMonthYear[0].status === 'PUBLISHED'
);

// Test 7: Calendar with different month/year
const calendarJan2025 = filterCalendarArticles(testArticles, 'January', '2025');
test('Calendar shows articles for selected month/year',
  calendarJan2025.length === 1 &&
  calendarJan2025[0].id === 1 &&
  calendarJan2025[0].status === 'ACCEPTED'
);

// Test 8: Calendar without selection shows only ACCEPTED
const calendarNoSelection = filterCalendarArticles(testArticles);
test('Calendar without selection shows only ACCEPTED articles',
  calendarNoSelection.length === 3 &&
  calendarNoSelection.every(a => a.status === 'ACCEPTED') &&
  !calendarNoSelection.some(a => a.status === 'PUBLISHED')
);

// Test 9: Calendar with only month (no year) shows nothing
const calendarMonthOnly = filterCalendarArticles(testArticles, 'January');
test('Calendar with only month shows no articles',
  calendarMonthOnly.length === 0
);

// Test 10: Newly created articles with publishedAt should show in cards
test('Newly created articles with publishedAt show in cards',
  cardsResult.some(a => a.id === 1 && a.publishedAt)
);

// Test 11: Articles moved to months should NOT show in cards
test('Articles moved to months do NOT show in cards',
  !cardsResult.some(a => a.id === 3 && a.status === 'PUBLISHED' && a.issueMonth)
);

// Test 12: Articles moved to Articles in Press should show in cards
test('Articles moved to Articles in Press show in cards',
  cardsResult.some(a => a.id === 4 && a.status === 'ACCEPTED')
);

// Test 13: Calendar shows articles moved to months when month/year matches
test('Calendar shows articles moved to months when month/year matches',
  calendarWithMonthYear.some(a => a.id === 3 && a.status === 'PUBLISHED')
);

// Test 14: Calendar does not show articles when month/year does not match
const calendarFeb2025 = filterCalendarArticles(testArticles, 'February', '2025');
test('Calendar shows correct articles for February 2025',
  calendarFeb2025.length === 1 &&
  calendarFeb2025[0].id === 5 &&
  calendarFeb2025[0].status === 'ACCEPTED'
);

// Test 15: Articles with empty month/year in Current Issue
test('Articles with empty month/year appear in Current Issue',
  currentIssueResult.some(a => a.id === 2 && (!a.issueMonth || a.issueMonth === '') && (!a.year || a.year === ''))
);

// Print results
console.log('\n📊 Test Results:\n');
testResults.forEach(result => console.log(result));
console.log(`\n✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`📈 Total: ${passedTests + failedTests}\n`);

if (failedTests === 0) {
  console.log('🎉 All tests passed!');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Please review the implementation.');
  process.exit(1);
}

