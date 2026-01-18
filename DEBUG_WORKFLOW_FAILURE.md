# 🔍 Debug Workflow Failure

## What to Check

### 1. Check Workflow Run Status
Go to: https://github.com/kamal464/wissen-publication-group/actions

Look for:
- **Red X** = Workflow failed
- **Yellow circle** = Workflow in progress
- **Green checkmark** = Workflow succeeded

### 2. Click on Failed Workflow
Click on the failed workflow run, then check:

#### Step 1: "Setup SSH"
- Does it show "✅ SSH setup complete"?
- If not, what error does it show?

#### Step 2: "Deploy to EC2"
- Does it connect to EC2?
- What's the last message you see?
- Are there any error messages?

#### Step 3: "Diagnostic Check"
- This always runs (even if deployment fails)
- What does it show?
- Are PM2 processes running?
- Are ports listening?

### 3. Common Failure Points

#### Failure at "Setup SSH"
- **Error**: "SSH key file is empty"
  - **Fix**: Check `EC2_SSH_PRIVATE_KEY` secret in GitHub Settings
- **Error**: "Invalid SSH key format"
  - **Fix**: Ensure the key includes `-----BEGIN` and `-----END` markers

#### Failure at "Deploy to EC2"
- **Error**: "Permission denied (publickey)"
  - **Fix**: Check SSH key is correct in GitHub Secrets
- **Error**: "Connection timed out"
  - **Fix**: Check EC2 instance is running and security group allows SSH

#### Failure During Deployment
- **Error**: "Command not found"
  - **Fix**: Check if Node.js, PM2, etc. are installed on EC2
- **Error**: "Cannot find module"
  - **Fix**: Dependencies not installed - check npm install step

### 4. Share Error Messages

Please share:
1. **Which step failed** (Setup SSH, Deploy to EC2, etc.)
2. **The exact error message** from that step
3. **The last 20-30 lines** of the failed step's logs

This will help identify the exact issue!

---

## Quick Test

I've created a simple test workflow: `test-ec2-connection.yml`

1. Go to Actions tab
2. Click "Test EC2 Connection"
3. Click "Run workflow"
4. This will test basic SSH connectivity

If this works, the issue is in the deployment script.
If this fails, the issue is with SSH/credentials.

---

## Next Steps

1. **Check the Actions tab** for the latest workflow run
2. **Click on the failed step** to see error messages
3. **Share the error message** so we can fix it
4. **Try the test workflow** to verify basic connectivity

