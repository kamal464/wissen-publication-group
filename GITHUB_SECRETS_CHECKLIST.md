# GitHub Secrets Checklist for EC2 Deployment

## Complete List of Required Secrets

Go to: **GitHub Repo → Settings → Secrets and variables → Actions**

Add all 9 secrets:

---

### EC2 Deployment Secrets (4)

1. **EC2_SSH_PRIVATE_KEY**
   - Value: Private SSH key from `cat ~/.ssh/github_actions_ec2` on EC2
   - Format: Full key from `-----BEGIN OPENSSH PRIVATE KEY-----` to `-----END OPENSSH PRIVATE KEY-----`

2. **EC2_HOST**
   - Value: `54.165.116.208`

3. **EC2_DOMAIN**
   - Value: `54.165.116.208` (or your domain if configured)

4. **DB_PASSWORD**
   - Value: `Wissen2024!Secure`

---

### AWS Secrets (5)

5. **AWS_REGION**
   - Value: `us-east-1`

6. **AWS_ACCESS_KEY_ID**
   - Value: Your AWS Access Key ID (e.g., `AKIAQVYSWBK4CZQBICFX`)

7. **AWS_SECRET_ACCESS_KEY**
   - Value: Your AWS Secret Access Key

8. **S3_BUCKET_NAME**
   - Value: `wissen-publication-group-files`

9. **CLOUDFRONT_URL**
   - Value: `https://d2qm3szai4trao.cloudfront.net`

---

## Quick Reference Table

| # | Secret Name | Value | Status |
|---|-------------|-------|--------|
| 1 | `EC2_SSH_PRIVATE_KEY` | (From EC2: `cat ~/.ssh/github_actions_ec2`) | ⬜ |
| 2 | `EC2_HOST` | `54.165.116.208` | ⬜ |
| 3 | `EC2_DOMAIN` | `54.165.116.208` | ⬜ |
| 4 | `DB_PASSWORD` | `Wissen2024!Secure` | ⬜ |
| 5 | `AWS_REGION` | `us-east-1` | ⬜ |
| 6 | `AWS_ACCESS_KEY_ID` | (Your access key) | ⬜ |
| 7 | `AWS_SECRET_ACCESS_KEY` | (Your secret key) | ⬜ |
| 8 | `S3_BUCKET_NAME` | `wissen-publication-group-files` | ⬜ |
| 9 | `CLOUDFRONT_URL` | `https://d2qm3szai4trao.cloudfront.net` | ⬜ |

---

## Verification

After adding all secrets:

1. ✅ Go to: **Settings → Secrets and variables → Actions**
2. ✅ Verify all 9 secrets are listed
3. ✅ Test deployment: **Actions → Deploy to AWS EC2 → Run workflow**

---

## Notes

- **EC2_SSH_PRIVATE_KEY**: Must be the complete private key (no extra spaces/newlines)
- **AWS_SECRET_ACCESS_KEY**: Should be 40 characters long
- **S3_BUCKET_NAME** and **CLOUDFRONT_URL**: Required for file uploads to work
- All secrets are case-sensitive

---

## If Secrets Already Exist

If you already have some AWS secrets from Cloud Run deployment, you can reuse them:
- ✅ `AWS_REGION`
- ✅ `AWS_ACCESS_KEY_ID`
- ✅ `AWS_SECRET_ACCESS_KEY`
- ✅ `S3_BUCKET_NAME`
- ✅ `CLOUDFRONT_URL`

Just verify they're correct and add the 4 new EC2-specific secrets.

