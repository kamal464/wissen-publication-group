# 🔐 Update AWS Credentials - Security Fix

## ⚠️ **CRITICAL: Use ONLY the NEW key**
- ⚠️ **IMPORTANT**: Replace `YOUR_AWS_ACCESS_KEY_ID` with your actual AWS Access Key ID
- ⚠️ **IMPORTANT**: Replace `YOUR_AWS_SECRET_ACCESS_KEY` with your actual AWS Secret Access Key

---

## **STEP 1: Update Credentials on Server**

Run this on your EC2 instance to update the credentials:

```bash
cd /var/www/wissen-publication-group/backend && \
echo "=== Updating AWS Credentials ===" && \
echo "" && \
echo "1. Checking current .env file:" && \
if [ -f .env ]; then
  echo "✅ .env file exists" && \
  echo "" && \
  echo "2. Backing up current .env:" && \
  cp .env .env.backup.$(date +%Y%m%d_%H%M%S) && \
  echo "✅ Backup created" && \
  echo "" && \
  echo "3. Updating AWS_ACCESS_KEY_ID:" && \
  sed -i 's/^AWS_ACCESS_KEY_ID=.*/AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID/' .env && \
  echo "✅ Access Key updated" && \
  echo "" && \
  echo "4. You need to manually update AWS_SECRET_ACCESS_KEY:" && \
  echo "   Edit .env file and replace the secret key value" && \
  echo "" && \
  echo "5. Verifying update:" && \
  grep "AWS_ACCESS_KEY_ID" .env | head -1 && \
  echo "" && \
  echo "⚠️  IMPORTANT: Update AWS_SECRET_ACCESS_KEY manually!"
else
  echo "❌ .env file not found - checking environment variables" && \
  echo "" && \
  echo "If using system environment variables, update them in:" && \
  echo "  - /etc/environment" && \
  echo "  - Or PM2 ecosystem file" && \
  echo "  - Or systemd service file"
fi
```

---

## **STEP 2: Update Secret Key**

You need to update the **AWS_SECRET_ACCESS_KEY** manually:

```bash
# Edit the .env file
nano /var/www/wissen-publication-group/backend/.env

# Or use vi
vi /var/www/wissen-publication-group/backend/.env
```

**Find this line:**
```
AWS_SECRET_ACCESS_KEY=old_secret_key_here
```

**Replace with your NEW secret key:**
```
AWS_SECRET_ACCESS_KEY=your_new_secret_key_here
```

**Save and exit:**
- Nano: `Ctrl+X`, then `Y`, then `Enter`
- Vi: `Esc`, then `:wq`, then `Enter`

---

## **STEP 3: Restart Backend to Apply Changes**

```bash
cd /var/www/wissen-publication-group && \
echo "=== Restarting Backend ===" && \
pm2 restart wissen-backend && \
sleep 5 && \
echo "" && \
echo "=== Testing AWS Connection ===" && \
curl -s http://localhost:3001/health && echo "" && \
echo "" && \
echo "✅ Backend restarted with new credentials"
```

---

## **STEP 4: Test S3 Upload (Verify Credentials Work)**

Test that the new credentials work:

```bash
cd /var/www/wissen-publication-group/backend && \
echo "=== Testing S3 Connection ===" && \
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
    console.log('✅ S3 Connection successful!');
    console.log('Buckets:', data.Buckets.map(b => b.Name).join(', '));
  })
  .catch(err => {
    console.error('❌ S3 Connection failed:', err.message);
    process.exit(1);
  });
"
```

---

## **STEP 5: Delete Old Compromised Key from AWS Console**

**IMPORTANT:** After confirming everything works, delete the old key:

1. Go to: https://console.aws.amazon.com/iam/home#users
2. Click on user: `s3-cloudfront-user`
3. Go to "Security credentials" tab
4. Find the key: `AKIAQVYSWBK4CZQBICFX`
5. Click "Delete" (NOT disable - DELETE it)

---

## **VERIFICATION CHECKLIST**

After completing all steps:

- [ ] New access key updated in `.env` file
- [ ] New secret key updated in `.env` file
- [ ] Backend restarted successfully
- [ ] S3 connection test passes
- [ ] Old compromised key deleted from AWS Console
- [ ] Application still works (test file upload if possible)

---

## **IF SOMETHING GOES WRONG**

If the application stops working after updating credentials:

```bash
# Restore backup
cd /var/www/wissen-publication-group/backend && \
ls -lt .env.backup.* | head -1 | awk '{print $NF}' | xargs cp {} .env && \
pm2 restart wissen-backend && \
echo "✅ Restored backup - check credentials again"
```

---

## **SECURITY REMINDER**

- ✅ **NEVER** commit `.env` files to git
- ✅ **NEVER** share secret keys
- ✅ **ALWAYS** rotate keys if compromised
- ✅ **DELETE** old keys, don't just disable them
