# Articles Management Rules

## 1. Articles in Press - Cards Display
**Rule**: Show articles in cards view
- ✅ Show: All articles with status `ACCEPTED` (or any non-PUBLISHED status)
  - Newly created articles (status: ACCEPTED)
  - Articles moved to Articles in Press (status: ACCEPTED)
  - Articles moved from Current Issue to Months (status: ACCEPTED)
- ❌ Hide: All articles with status `PUBLISHED` (they're in Current Issue)

**Current Implementation**: Shows all ACCEPTED articles, hides all PUBLISHED articles

---

## 2. Articles in Press - Calendar Preview
**Rule**: Show articles in calendar preview dialog
- ✅ When month/year is selected: Show ALL articles for that month/year regardless of status
  - Articles from Current Issue (PUBLISHED)
  - Articles from Archive (PUBLISHED with month/year)
  - Articles from Articles in Press (ACCEPTED with month/year)
- ✅ When no month/year selected: Show ALL articles (from anywhere: Current Issue, Articles in Press, Archive, etc.)
  - This allows users to see all articles in the calendar regardless of status or location

**Current Implementation**: 
- With month/year: Shows all articles matching month/year (any status)
- Without month/year: Shows ALL articles (any status, any location)

---

## 3. Current Issue Page
**Rule**: Show articles in Current Issue
- ✅ Show: All articles with status `PUBLISHED` (regardless of month/year)
- ❌ Hide: All articles with status other than `PUBLISHED`
- ℹ️ Note: Month/year are preserved as metadata but don't affect Current Issue display

**Current Implementation**: Shows all PUBLISHED articles regardless of month/year

---

## 4. Move to Current Issue (from Articles in Press)
**Rule**: When moving articles from Articles in Press to Current Issue
- ✅ Update status to `PUBLISHED`
- ✅ Keep month/year (preserve original values) - month/year are metadata that should be preserved
- ✅ Article appears in Current Issue page
- ✅ Article is removed from Articles in Press cards (status changed to PUBLISHED)

**Current Implementation**: Updates status to PUBLISHED, keeps month/year

---

## 5. Move to Months (from Current Issue)
**Rule**: When moving articles from Current Issue to Months
- ✅ Update `issueMonth` and `year` (set to selected month/year)
- ✅ Keep status as `PUBLISHED` (do NOT change to ACCEPTED)
- ✅ Article is removed from Current Issue (because it now has month/year)
- ✅ Article does NOT appear in Articles in Press cards (status is PUBLISHED)
- ✅ Article appears ONLY in Articles in Press calendar when that month/year is selected

**Current Implementation**: 
- Updates month/year only
- Keeps status as PUBLISHED
- Articles appear only in calendar (not in cards)

---

## 6. Data Loading
**Rule**: What articles to load
- ✅ Articles in Press page: Load ALL articles regardless of status (for calendar view)
- ✅ Current Issue page: Load articles with status `PUBLISHED`

**Current Implementation**: 
- Articles in Press: Loads all articles
- Current Issue: Loads PUBLISHED articles

---

## Questions to Confirm:

1. **Articles moved to Months (from Current Issue)**:
   - Should they appear in cards? 
   - Current: YES (they have status ACCEPTED)
   - Alternative: NO (only in calendar)

2. **Newly created articles with publishedAt set**:
   - Should they appear in cards?
   - Current: YES (if status is ACCEPTED)
   - This is working correctly

3. **Articles in Current Issue with month/year**:
   - Should they appear in Current Issue?
   - Current: YES (if status is PUBLISHED)
   - This is working correctly

---

## Summary of Current Behavior:

| Article Type | Status | Month/Year | PublishedAt | Shows in Cards | Shows in Calendar | Shows in Current Issue |
|-------------|--------|------------|-------------|---------------|-------------------|----------------------|
| Newly Created | ACCEPTED | Yes (required) | Optional | ✅ YES | ✅ YES (if month/year matches) | ❌ NO |
| Moved to Current Issue | PUBLISHED | No (cleared) | Optional | ❌ NO | ❌ NO (no month/year) | ✅ YES |
| Moved to Months | PUBLISHED | Yes | Optional | ❌ NO | ✅ YES (if month/year matches) | ❌ NO |
| Moved to Articles in Press | ACCEPTED | No (cleared) | Optional | ✅ YES | ✅ YES | ❌ NO |

---

Please review and confirm:
1. Are these rules correct?
2. Should articles moved to Months appear in cards or only in calendar?
3. Any other changes needed?

