# Resolve Merge Conflict in _journals.scss

## Issue
Production has `width: 100% !important;` and `max-width: 100% !important;` in `.journal-editorial-board-card`, but we removed them.

## Solution

When pulling on production, if you get a merge conflict:

```bash
cd /var/www/wissen-publication-group
git fetch origin
git pull origin main
```

If conflict occurs:

```bash
# Accept our version (without width/max-width)
git checkout --ours frontend/src/styles/pages/_journals.scss
git add frontend/src/styles/pages/_journals.scss
git commit -m "Resolve merge conflict: Remove width/max-width from journal-editorial-board-card"
```

Or manually edit the file and remove these lines if they appear:
```scss
width: 100% !important;
max-width: 100% !important;
```

## Expected Result

The `.journal-editorial-board-card` should have:
```scss
.journal-editorial-board-card {
  box-sizing: border-box !important;
  overflow: hidden !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  // ... media queries
}
```

**NO `width` or `max-width` properties.**
