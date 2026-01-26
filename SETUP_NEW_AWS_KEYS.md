# 🔐 Setup New AWS Access Keys - Separate for EC2 & GitHub Actions

## **STRATEGY**
- **EC2 Application Key**: For your production server
- **GitHub Actions Key**: For CI/CD deployments
- **Delete Old Compromised Key**: `AKIAQVYSWBK4CZQBICFX`

---

## **STEP 1: Create New Access Key for EC2 Application**

### In AWS Console:

1. Go to: https://console.aws.amazon.com/iam/home#users
2. Click on user: `s3-cloudfront-user`
3. Go to "Security credentials" tab
4. Click "Create access key"
5. Select "Application running outside AWS"
6. Click "Next"
7. Add description: `EC2-Production-Server`
8. Click "Create access key"
9. **IMPORTANT**: Copy both:
   - **Access Key ID** (starts with `AKIA...`)
   - **Secret Access Key** (you'll only see this once!)

**Save these credentials securely - you'll need them for Step 2.**

---

## **STEP 2: Update EC2 Server with New Key**

Run this on your EC2 instance:

```bash
cd /var/www/wissen-publication-group/backend && \
echo "=== Updating AWS Credentials on EC2 ===" && \
echo "" && \
if [ -f .env ]; then
  echo "1. Backing up current .env:" && \
  cp .env .env.backup.$(date +%Y%m%d_%H%M%S) && \
  echo "✅ Backup created" && \
  echo "" && \
  echo "2. Current AWS_ACCESS_KEY_ID:" && \
  grep "^AWS_ACCESS_KEY_ID" .env | head -1 && \
  echo "" && \
  echo "3. ⚠️  You need to manually update both:" && \
  echo "   - AWS_ACCESS_KEY_ID (replace with new EC2 key)" && \
  echo "   - AWS_SECRET_ACCESS_KEY (replace with new EC2 secret)" && \
  echo "" && \
  echo "4. To edit, run:" && \
  echo "   nano .env" && \
  echo "" && \
  echo "5. Find and replace:" && \
  echo "   AWS_ACCESS_KEY_ID=your_new_ec2_access_key" && \
  echo "   AWS_SECRET_ACCESS_KEY=your_new_ec2_secret_key"
else
  echo "❌ .env file not found" && \
  echo "Credentials may be in environment variables or PM2 config"
fi
```

### Manual Update:

```bash
# Edit .env file
nano /var/www/wissen-publication-group/backend/.env
```

**Update these lines:**
```bash
AWS_ACCESS_KEY_ID=AKIA...your_new_ec2_key
AWS_SECRET_ACCESS_KEY=your_new_ec2_secret_key
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

### Restart Backend:

```bash
cd /var/www/wissen-publication-group && \
pm2 restart wissen-backend && \
sleep 5 && \
echo "Testing..." && \
curl -s http://localhost:3001/health && echo "" && \
echo "✅ Backend restarted with new EC2 credentials"
```

---

## **STEP 3: Create Second Access Key for GitHub Actions**

### In AWS Console:

1. Go to: https://console.aws.amazon.com/iam/home#users
2. Click on user: `s3-cloudfront-user`
3. Go to "Security credentials" tab
4. Click "Create access key"
5. Select "Application running outside AWS"
6. Click "Next"
7. Add description: `GitHub-Actions-CI-CD`
8. Click "Create access key"
9. **Copy both credentials** (you'll add secret to GitHub)

**You now have 2 active keys:**
- EC2-Production-Server key
- GitHub-Actions-CI-CD key

---

## **STEP 4: Add GitHub Actions Secret**

### In GitHub Repository:

1. Go to your repository: https://github.com/kamal464/wissen-publication-group
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

**Secret 1: AWS_ACCESS_KEY_ID**
- Name: `AWS_ACCESS_KEY_ID`
- Value: `AKIA...your_github_actions_key`

**Secret 2: AWS_SECRET_ACCESS_KEY**
- Name: `AWS_SECRET_ACCESS_KEY`
- Value: `your_github_actions_secret_key`

**Secret 3: AWS_REGION** (if not already set)
- Name: `AWS_REGION`
- Value: `us-east-1`

5. Click **Add secret** for each

---

## **STEP 5: Update GitHub Actions Workflow**

If you have a GitHub Actions workflow, make sure it uses the secrets:

```yaml
# Example .github/workflows/deploy.yml
env:
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
  AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  AWS_REGION: ${{ secrets.AWS_REGION || 'us-east-1' }}
```

---

## **STEP 6: Test Both Keys**

### Test EC2 Key:

```bash
cd /var/www/wissen-publication-group/backend && \
node -e "
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();
const client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
client.send(new ListBucketsCommand({}))
  .then(data => {
    console.log('✅ EC2 S3 Connection successful!');
    console.log('Buckets:', data.Buckets.map(b => b.Name).join(', '));
  })
  .catch(err => {
    console.error('❌ EC2 S3 Connection failed:', err.message);
    process.exit(1);
  });
"
```

### Test GitHub Actions Key:

Run a GitHub Actions workflow or test manually with the GitHub Actions credentials.

---

## **STEP 7: Delete Old Compromised Key**

**After confirming both new keys work:**

1. Go to: https://console.aws.amazon.com/iam/home#users
2. Click on user: `s3-cloudfront-user`
3. Go to "Security credentials" tab
4. Find the key: `AKIAQVYSWBK4CZQBICFX`
5. Click **Delete** (NOT disable - DELETE it permanently)

---

## **VERIFICATION CHECKLIST**

- [ ] Created new EC2 access key
- [ ] Updated EC2 `.env` file with new EC2 credentials
- [ ] Restarted backend on EC2
- [ ] Tested EC2 S3 connection (works)
- [ ] Created new GitHub Actions access key
- [ ] Added GitHub Actions secrets to repository
- [ ] Tested GitHub Actions workflow (if applicable)
- [ ] Deleted old compromised key: `AKIAQVYSWBK4CZQBICFX`

---

## **SECURITY BEST PRACTICES**

✅ **Separate keys for different purposes** (EC2 vs GitHub Actions)
✅ **Never commit secrets to git**
✅ **Use GitHub Secrets for CI/CD**
✅ **Delete compromised keys immediately**
✅ **Rotate keys regularly**
✅ **Monitor CloudTrail for suspicious activity**

---

## **IF SOMETHING GOES WRONG**

### Restore EC2 Backup:

```bash
cd /var/www/wissen-publication-group/backend && \
ls -lt .env.backup.* | head -1 | awk '{print $NF}' | xargs cp {} .env && \
pm2 restart wissen-backend && \
echo "✅ Restored backup"
```

### Check GitHub Actions Logs:

If GitHub Actions fails, check the workflow logs in:
- Repository → Actions → Latest workflow run
