# 🔧 GitHub Actions Workflow Troubleshooting

## Issue: Workflow Graph is Empty / Jobs Not Running

If the workflow graph is empty or workflows aren't triggering, check these:

### 1. Check Workflow File Location
- Workflow file must be in: `.github/workflows/deploy-ec2.yml`
- File must have `.yml` or `.yaml` extension
- File must be committed to the repository

### 2. Check Workflow Syntax
The workflow should start with:
```yaml
name: Deploy to AWS EC2

on:
  push:
    branches:
      - main
  workflow_dispatch:
```

### 3. Check GitHub Actions is Enabled
1. Go to repository Settings
2. Click on "Actions" → "General"
3. Ensure "Allow all actions and reusable workflows" is selected
4. Check "Workflow permissions" - should allow read/write

### 4. Check Branch Protection
- Workflows should trigger on push to `main`
- If branch protection is enabled, it shouldn't block workflows

### 5. Manual Trigger
Try manually triggering the workflow:
1. Go to: https://github.com/kamal464/wissen-publication-group/actions
2. Click on "Deploy to AWS EC2" workflow
3. Click "Run workflow" button
4. Select branch: `main`
5. Click "Run workflow"

### 6. Check Recent Pushes
- Make sure you've pushed to the `main` branch
- Workflows only trigger on pushes, not on commits alone

### 7. Check Workflow File is Valid YAML
The workflow file should be valid YAML. Common issues:
- Missing indentation
- Unclosed quotes
- Invalid characters

### 8. Check Repository Settings
- Repository must not be archived
- Actions must be enabled for the repository
- You must have push access to the repository

---

## Quick Fix: Force Trigger

If workflows aren't running, try:

1. **Make a small change** to trigger the workflow:
```bash
# Add a comment to trigger workflow
echo "# Workflow trigger" >> README.md
git add README.md
git commit -m "Trigger workflow"
git push origin main
```

2. **Or manually trigger** via GitHub UI:
   - Go to Actions tab
   - Click "Deploy to AWS EC2"
   - Click "Run workflow"

---

## Verify Workflow is Active

Check if the workflow file is being recognized:
1. Go to: https://github.com/kamal464/wissen-publication-group/actions
2. You should see "Deploy to AWS EC2" in the workflow list
3. If it's not there, the file might not be committed or has syntax errors

---

## Common Issues

### Issue 1: Workflow File Not Committed
- Make sure `.github/workflows/deploy-ec2.yml` is committed
- Check: `git ls-files .github/workflows/deploy-ec2.yml`

### Issue 2: YAML Syntax Error
- GitHub will show an error if YAML is invalid
- Check the Actions tab for error messages

### Issue 3: Workflow Disabled
- Check repository Settings → Actions
- Ensure workflows are enabled

### Issue 4: Branch Name Mismatch
- Workflow triggers on `main` branch
- Make sure you're pushing to `main`, not `master` or another branch

---

## Next Steps

1. **Check if workflow file exists and is committed**
2. **Try manual trigger** via GitHub UI
3. **Check GitHub Actions settings** in repository
4. **Make a test commit** to trigger the workflow
5. **Check Actions tab** for any error messages

