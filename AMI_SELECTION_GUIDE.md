# 🖼️ AMI Selection Guide

## Recommended AMI: **Ubuntu Server 22.04 LTS**

The `launch-new-instance.sh` script automatically finds and uses the latest **Ubuntu Server 22.04 LTS** AMI. This is the recommended choice.

---

## Why Ubuntu 22.04 LTS?

✅ **Long-term support** - Supported until April 2027  
✅ **Stable and reliable** - Production-ready  
✅ **Well-documented** - Extensive community support  
✅ **Compatible** - Works with all your tools (Node.js, PM2, Nginx)  
✅ **Security updates** - Regular patches and updates  

---

## What the Script Does

The script automatically finds the latest Ubuntu 22.04 LTS AMI using:

```bash
aws ec2 describe-images \
  --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
  --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId'
```

**Owner ID 099720109477** = Canonical (official Ubuntu publisher)

---

## Manual Selection in AWS Console

If launching manually in AWS Console:

1. **EC2 → Launch Instance**
2. **Application and OS Images (Amazon Machine Image):**
   - Search for: `ubuntu`
   - Select: **Ubuntu Server 22.04 LTS (HVM), SSD Volume Type**
   - Architecture: **64-bit (x86)**
   - Look for: `ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*`

3. **Verify it's from Canonical:**
   - Owner should show: `099720109477` or `Canonical`

---

## Find Latest AMI Manually (CLI)

```bash
# List all Ubuntu 22.04 AMIs
aws ec2 describe-images \
  --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
            "Name=state,Values=available" \
  --query 'Images | sort_by(@, &CreationDate) | [-1].[ImageId,Name,CreationDate]' \
  --output table \
  --region us-east-1
```

---

## Alternative AMIs (If Needed)

### Ubuntu 20.04 LTS
- Supported until April 2025
- Still good, but 22.04 is newer
- AMI filter: `ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*`

### Amazon Linux 2023
- AWS-optimized
- Different package manager (dnf instead of apt)
- Would require script modifications

### Debian 12
- Similar to Ubuntu
- AMI filter: `debian-12-amd64-*`
- Owner: `136693071363` (Debian)

---

## Current AMI IDs (us-east-1)

These change frequently, but here are examples:

**Ubuntu 22.04 LTS (as of 2024):**
- Example: `ami-0c55b159cbfafe1f0` (this changes - use script to get latest)

**To get current AMI ID:**
```bash
aws ec2 describe-images \
  --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
            "Name=state,Values=available" \
  --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' \
  --output text \
  --region us-east-1
```

---

## Verify AMI Before Launch

```bash
# Get AMI details
aws ec2 describe-images \
  --image-ids <AMI_ID> \
  --region us-east-1 \
  --query 'Images[0].[ImageId,Name,OwnerId,CreationDate,Architecture]' \
  --output table
```

**Expected output:**
- OwnerId: `099720109477` (Canonical)
- Name: Contains `ubuntu-jammy-22.04`
- Architecture: `x86_64`

---

## Quick Reference

| AMI Type | Owner ID | Filter Pattern |
|----------|----------|----------------|
| Ubuntu 22.04 LTS | 099720109477 | `ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*` |
| Ubuntu 20.04 LTS | 099720109477 | `ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*` |
| Amazon Linux 2023 | 137112412989 | `amzn2-ami-hvm-*-x86_64-gp2` |
| Debian 12 | 136693071363 | `debian-12-amd64-*` |

---

## Recommendation

**✅ Use Ubuntu 22.04 LTS** - The script does this automatically!

The script finds the latest one, so you don't need to worry about AMI selection. Just make sure:
1. You're in the correct region (us-east-1)
2. The script has internet access to query AWS
3. Your AWS credentials are configured

---

## Troubleshooting

### "Failed to find Ubuntu 22.04 AMI"
- Check your AWS region
- Verify AWS credentials: `aws sts get-caller-identity`
- Try a different region or check AMI availability

### "AMI not available in this region"
- Ubuntu 22.04 is available in all AWS regions
- If issue persists, try: `--region us-west-2` or another region

---

**Bottom line: The script handles AMI selection automatically. Just run it!** 🚀
