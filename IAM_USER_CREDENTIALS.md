# IAM User Credentials - S3 & CloudFront Access

## ✅ User Created Successfully

**Username:** `s3-cloudfront-user`  
**Account ID:** `046746962616`

---

## 🔐 Console Login Credentials

**Sign-in URL:** https://046746962616.signin.aws.amazon.com/console

**Username:** `s3-cloudfront-user`  
**Password:** `YOUR_PASSWORD` (change on first login)

⚠️ **Password Reset Required:** User must change password on first login

---

## 🔑 Programmatic Access (Access Keys)

**Access Key ID:** `YOUR_ACCESS_KEY_ID` (stored in GitHub Secrets)  
**Secret Access Key:** `YOUR_SECRET_ACCESS_KEY` (stored in GitHub Secrets)

⚠️ **IMPORTANT:** Save these credentials securely. The secret key is only shown once!

---

## 📋 Permissions

The user has **full access** to:
- ✅ **Amazon S3** - All S3 operations (create buckets, upload files, manage objects)
- ✅ **Amazon CloudFront** - All CloudFront operations (create distributions, manage cache behaviors)

**Policy ARN:** `arn:aws:iam::046746962616:policy/S3CloudFrontFullAccess`

---

## 🚀 Next Steps

1. **Sign in to AWS Console:**
   - Go to: https://046746962616.signin.aws.amazon.com/console
   - Username: `s3-cloudfront-user`
   - Password: `YOUR_PASSWORD` (set during user creation)
   - You'll be prompted to change the password

2. **Use Access Keys in Applications:**
   ```bash
   # Configure AWS CLI with these credentials
   aws configure --profile s3-cloudfront-user
   # Access Key ID: YOUR_ACCESS_KEY_ID (get from GitHub Secrets or AWS Console)
   # Secret Access Key: YOUR_SECRET_ACCESS_KEY (get from GitHub Secrets or AWS Console)
   # Default region: (your preferred region)
   # Default output format: json
   ```

3. **Test S3 Access:**
   ```bash
   aws s3 ls --profile s3-cloudfront-user
   ```

4. **Test CloudFront Access:**
   ```bash
   aws cloudfront list-distributions --profile s3-cloudfront-user
   ```

---

## 🔒 Security Notes

- ⚠️ Store these credentials securely
- ⚠️ Never commit credentials to version control
- ⚠️ Consider using IAM roles for applications instead of access keys when possible
- ⚠️ Rotate access keys regularly
- ⚠️ Enable MFA for additional security (recommended)

---

**Created:** January 5, 2026  
**User ARN:** `arn:aws:iam::046746962616:user/s3-cloudfront-user`


