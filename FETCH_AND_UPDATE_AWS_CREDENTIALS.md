# Fetch AWS Credentials from AWS CLI and Update

## Step 1: Check if AWS CLI is Configured on EC2

Run this in your EC2 browser terminal:

```bash
aws sts get-caller-identity
```

**If it works:** You'll see your AWS account info. Skip to Step 3.

**If it fails:** Configure AWS CLI first (Step 2).

---

## Step 2: Configure AWS CLI (if not configured)

```bash
aws configure
```

Enter:
- **AWS Access Key ID**: Your access key
- **AWS Secret Access Key**: Your secret key
- **Default region**: `us-east-1`
- **Default output format**: `json`

---

## Step 3: Fetch Credentials and Update .env

Run this script to automatically fetch and update:

```bash
cd /var/www/wissen-publication-group/backend

# Fetch credentials from AWS CLI
AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id)
AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key)
AWS_REGION=$(aws configure get region || echo "us-east-1")

# Display (hide secret)
echo "Fetched credentials:"
echo "AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID"
echo "AWS_SECRET_ACCESS_KEY: *** (hidden)"
echo "AWS_REGION: $AWS_REGION"
echo ""

# Update .env file
sed -i "s|^AWS_REGION=.*|AWS_REGION=$AWS_REGION|" .env
sed -i "s|^AWS_ACCESS_KEY_ID=.*|AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID|" .env
sed -i "s|^AWS_SECRET_ACCESS_KEY=.*|AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY|" .env

echo "✅ .env file updated"
echo ""

# Verify
echo "Updated values:"
grep -E "AWS_REGION|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY" .env | sed 's/\(SECRET_ACCESS_KEY=\).*/\1***HIDDEN***/'
```

---

## Step 4: Test S3 Connection

```bash
node test-s3.js
```

Should see: `✅ S3 connection successful!`

---

## Step 5: Restart Backend

```bash
cd /var/www/wissen-publication-group && pm2 restart wissen-backend
```

---

## Step 6: Update GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Update these three secrets:
   - `AWS_ACCESS_KEY_ID` = (value from Step 3)
   - `AWS_SECRET_ACCESS_KEY` = (value from Step 3)
   - `AWS_REGION` = (value from Step 3, usually `us-east-1`)

---

## Quick One-Liner (If AWS CLI is Configured)

```bash
cd /var/www/wissen-publication-group/backend && AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id) && AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key) && AWS_REGION=$(aws configure get region || echo "us-east-1") && sed -i "s|^AWS_REGION=.*|AWS_REGION=$AWS_REGION|" .env && sed -i "s|^AWS_ACCESS_KEY_ID=.*|AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID|" .env && sed -i "s|^AWS_SECRET_ACCESS_KEY=.*|AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY|" .env && echo "✅ Updated" && echo "AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID" && echo "AWS_SECRET_ACCESS_KEY: ***" && echo "AWS_REGION: $AWS_REGION" && node test-s3.js && cd /var/www/wissen-publication-group && pm2 restart wissen-backend
```

This will:
1. Fetch credentials from AWS CLI
2. Update .env file
3. Display the values (for GitHub Secrets)
4. Test S3 connection
5. Restart backend

---

## Alternative: Manual Update

If AWS CLI is not configured, you can manually update:

```bash
cd /var/www/wissen-publication-group/backend
nano .env
```

Update these lines:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
```

Save: `Ctrl+X`, `Y`, `Enter`

Then test and restart:
```bash
node test-s3.js
cd /var/www/wissen-publication-group && pm2 restart wissen-backend
```

