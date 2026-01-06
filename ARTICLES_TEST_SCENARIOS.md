# Articles Management - Test Scenarios

## Test Environment Setup
- **Articles in Press Page**: `/journal-admin/journals/articles-press`
- **Current Issue Page**: `/journal-admin/journals/current-issue`
- **Test Journal ID**: Use your test journal

---

## Scenario 1: Newly Created Articles

### Test Steps:
1. Go to Articles in Press page
2. Click "Add Article"
3. Fill in required fields (including month/year - required)
4. Set status to ACCEPTED
5. Optionally set publishedAt date
6. Save the article

### Expected Results:
- ✅ Article appears in **Cards View** (status is ACCEPTED)
- ✅ Article appears in **Calendar Preview** when month/year is selected
- ✅ Status badge shows **ACCEPTED** (blue badge)
- ✅ Article does NOT appear in Current Issue page

### Test Data:
- Title: "Test New Article"
- Status: ACCEPTED
- Month: January
- Year: 2025
- PublishedAt: (optional, can be set or empty)

---

## Scenario 2: Move Article to Current Issue

### Test Steps:
1. Go to Articles in Press page
2. Open Preview dialog
3. Select an article with status ACCEPTED
4. Click "Move to Current Issue"

### Expected Results:
- ✅ Article status changes to **PUBLISHED**
- ✅ Month/year are **kept** (not cleared)
- ✅ Article **disappears** from Articles in Press cards
- ✅ Article **appears** in Current Issue page
- ✅ Article still appears in Calendar when that month/year is selected

### Test Data:
- Article: Any article with status ACCEPTED
- After move: Status = PUBLISHED, Month/Year = kept

---

## Scenario 3: Move Article to Months (from Current Issue)

### Test Steps:
1. Go to Current Issue page
2. Select one or more articles
3. Click "Move to Months"
4. Select a month and year (e.g., January 2024)
5. Confirm

### Expected Results:
- ✅ Article **month/year** is updated to selected month/year
- ✅ Article status **stays PUBLISHED** (not changed to ACCEPTED)
- ✅ Article **disappears** from Current Issue page (has month/year now)
- ✅ Article **does NOT appear** in Articles in Press cards (status is PUBLISHED)
- ✅ Article **appears** in Articles in Press calendar when that month/year is selected
- ✅ Status badge in calendar shows **PUBLISHED** (green badge)

### Test Data:
- Article: Any article in Current Issue (status PUBLISHED, no month/year)
- After move: Status = PUBLISHED, Month = January, Year = 2024

---

## Scenario 4: Move Article to Articles in Press (from Current Issue)

### Test Steps:
1. Go to Current Issue page
2. Select one or more articles
3. Click "Move to Articles in Press"
4. Confirm

### Expected Results:
- ✅ Article status changes to **ACCEPTED**
- ✅ Month/year are **cleared** (set to empty)
- ✅ Article **disappears** from Current Issue page
- ✅ Article **appears** in Articles in Press cards (status is ACCEPTED)
- ✅ Article **appears** in Calendar (when no month/year selected, shows ACCEPTED articles)

### Test Data:
- Article: Any article in Current Issue (status PUBLISHED)
- After move: Status = ACCEPTED, Month = empty, Year = empty

---

## Scenario 5: Calendar Preview - No Selection

### Test Steps:
1. Go to Articles in Press page
2. Click "Preview" button
3. Don't select any month/year

### Expected Results:
- ✅ Preview dialog shows **only articles with status ACCEPTED**
- ✅ Matches what's shown in cards view
- ✅ Articles with status PUBLISHED are **not shown**

### Test Data:
- Should show: All ACCEPTED articles
- Should NOT show: PUBLISHED articles

---

## Scenario 6: Calendar Preview - With Month/Year Selected

### Test Steps:
1. Go to Articles in Press page
2. Click "Preview" button
3. Select a month (e.g., January)
4. Select a year (e.g., 2024)
5. View the table

### Expected Results:
- ✅ Preview dialog shows **ALL articles** for that month/year **regardless of status**
- ✅ Shows articles with status PUBLISHED (moved to months)
- ✅ Shows articles with status ACCEPTED (newly created or moved to Articles in Press)
- ✅ Status badges show correct colors (green for PUBLISHED, blue for ACCEPTED)

### Test Data:
- Month: January
- Year: 2024
- Should show: All articles with issueMonth=January and year=2024 (any status)

---

## Scenario 7: Current Issue Page Display

### Test Steps:
1. Go to Current Issue page
2. View the articles list

### Expected Results:
- ✅ Shows **only articles with status PUBLISHED**
- ✅ Shows **only articles without month/year** (articles moved to months have month/year, so they're hidden)
- ✅ Articles moved to months do NOT appear here

### Test Data:
- Should show: Articles with status=PUBLISHED AND (no month/year)
- Should NOT show: Articles with status=ACCEPTED
- Should NOT show: Articles with status=PUBLISHED AND (has month/year)

---

## Scenario 8: Status Badges Display

### Test Steps:
1. Go to Articles in Press page
2. View cards
3. Open Preview dialog
4. Check status badges

### Expected Results:
- ✅ **PUBLISHED** articles show **green badge**
- ✅ **ACCEPTED** articles show **blue badge**
- ✅ **PENDING** articles show **yellow badge**
- ✅ **UNDER_REVIEW** articles show **orange badge**
- ✅ Badges appear in both cards and preview table

### Test Data:
- Create/view articles with different statuses
- Verify badge colors match status

---

## Scenario 9: Article with Month/Year in Current Issue

### Test Steps:
1. Create an article in Articles in Press with month/year
2. Move it to Current Issue
3. Check Current Issue page

### Expected Results:
- ✅ Article appears in Current Issue (status is PUBLISHED)
- ✅ Month/year are **kept** (not cleared)
- ✅ Article can be moved to months later

### Test Data:
- Article: Status=ACCEPTED, Month=January, Year=2025
- After move to Current Issue: Status=PUBLISHED, Month=January, Year=2025

---

## Scenario 10: Move to Months - Verify Calendar Only

### Test Steps:
1. Move an article from Current Issue to Months (January 2024)
2. Go to Articles in Press page
3. Check cards view
4. Open Preview and select January 2024

### Expected Results:
- ✅ Article **does NOT appear** in cards (status is PUBLISHED)
- ✅ Article **appears** in calendar when January 2024 is selected
- ✅ Status badge in calendar shows **PUBLISHED** (green)

### Test Data:
- Article moved to: Month=January, Year=2024, Status=PUBLISHED
- Cards: Should NOT show
- Calendar (January 2024): Should show

---

## Scenario 11: Move to Articles in Press - Verify Cards and Calendar

### Test Steps:
1. Move an article from Current Issue to Articles in Press
2. Go to Articles in Press page
3. Check cards view
4. Open Preview (no month/year selected)

### Expected Results:
- ✅ Article **appears** in cards (status is ACCEPTED)
- ✅ Article **appears** in preview table (status is ACCEPTED)
- ✅ Status badge shows **ACCEPTED** (blue)
- ✅ Month/year are cleared

### Test Data:
- Article moved: Status=ACCEPTED, Month=empty, Year=empty
- Cards: Should show
- Preview (no selection): Should show

---

## Scenario 12: Newly Created Article with PublishedAt

### Test Steps:
1. Create a new article in Articles in Press
2. Set month/year (required)
3. Set publishedAt date
4. Save
5. Check cards view

### Expected Results:
- ✅ Article **appears** in cards (status is ACCEPTED)
- ✅ Status badge shows **ACCEPTED** (blue)
- ✅ PublishedAt date is saved
- ✅ Article appears in calendar when month/year is selected

### Test Data:
- Article: Status=ACCEPTED, Month=January, Year=2025, PublishedAt=2025-01-15
- Cards: Should show
- Calendar (January 2025): Should show

---

## Test Checklist

### Articles in Press Page:
- [ ] Cards show only ACCEPTED articles
- [ ] Cards hide PUBLISHED articles
- [ ] Calendar shows articles by month/year regardless of status
- [ ] Calendar without selection shows only ACCEPTED articles
- [ ] Status badges display correctly with colors
- [ ] Move to Current Issue works correctly
- [ ] Move to Months works correctly (from preview dialog)

### Current Issue Page:
- [ ] Shows only PUBLISHED articles without month/year
- [ ] Hides PUBLISHED articles with month/year (moved to months)
- [ ] Move to Months updates month/year only, keeps PUBLISHED status
- [ ] Move to Articles in Press changes status to ACCEPTED, clears month/year
- [ ] Articles disappear after moving to months
- [ ] Articles disappear after moving to Articles in Press

### Data Integrity:
- [ ] Month/year preserved when moving to Current Issue
- [ ] Month/year updated when moving to months
- [ ] Month/year cleared when moving to Articles in Press
- [ ] Status changes correctly for each move operation
- [ ] PublishedAt preserved when moving to months

---

## Expected Behavior Summary

| Action | Status Change | Month/Year Change | Shows in Cards | Shows in Calendar | Shows in Current Issue |
|--------|--------------|------------------|----------------|-------------------|----------------------|
| Create New | ACCEPTED | Set (required) | ✅ YES | ✅ YES (if month/year matches) | ❌ NO |
| Move to Current Issue | PUBLISHED | Kept | ❌ NO | ✅ YES (if month/year matches) | ✅ YES |
| Move to Months | PUBLISHED | Updated | ❌ NO | ✅ YES (if month/year matches) | ❌ NO |
| Move to Articles in Press | ACCEPTED | Cleared | ✅ YES | ✅ YES | ❌ NO |

---

## Test Execution Notes

1. **Before Testing**: Clear any test data or use a dedicated test journal
2. **Test Order**: Follow scenarios in order for best results
3. **Verification**: Check both UI and database after each operation
4. **Edge Cases**: Test with articles that have/don't have publishedAt, month/year, etc.

---

## Common Issues to Watch For

1. **Articles not appearing in cards**: Check status is ACCEPTED
2. **Articles appearing in wrong place**: Check month/year and status
3. **Month/year missing**: Verify they're not being cleared incorrectly
4. **Status not updating**: Check API calls are working
5. **Calendar not showing articles**: Verify month/year matching logic

---

## Database Verification Queries

After each test, verify in database:

```sql
-- Check article status and month/year
SELECT id, title, status, issueMonth, year, publishedAt 
FROM Article 
WHERE journalId = <your_journal_id>
ORDER BY id DESC;

-- Verify articles in Current Issue (should have PUBLISHED, no month/year)
SELECT id, title, status, issueMonth, year 
FROM Article 
WHERE journalId = <your_journal_id> 
AND status = 'PUBLISHED' 
AND (issueMonth IS NULL OR issueMonth = '' OR year IS NULL OR year = '');

-- Verify articles moved to months (should have PUBLISHED, has month/year)
SELECT id, title, status, issueMonth, year 
FROM Article 
WHERE journalId = <your_journal_id> 
AND status = 'PUBLISHED' 
AND issueMonth IS NOT NULL 
AND issueMonth != '' 
AND year IS NOT NULL 
AND year != '';
```

---

**Test File Created**: `ARTICLES_TEST_SCENARIOS.md`

Please review all scenarios and confirm if they match your requirements. Then execute the tests and report any issues.

