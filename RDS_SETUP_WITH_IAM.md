# RDS PostgreSQL + IAM for wissen-developer

Use this to give **wissen-developer** full RDS permissions, create an RDS PostgreSQL instance, and connect your app.

---

## 1. IAM: Full RDS permissions for wissen-developer

**Option A – AWS Console**

1. IAM → Users → **wissen-developer** → Permissions → Add permissions → Attach policies directly.
2. Search and attach:
   - **AmazonRDSFullAccess**
3. (Optional) To restrict to RDS only and not other services, use a custom policy (Option B).

**Option B – Custom policy (RDS only)**

1. IAM → Policies → Create policy → JSON.
2. Paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "rds:*",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeVpcs",
        "ec2:DescribeSubnets",
        "ec2:DescribeNetworkInterfaces"
      ],
      "Resource": "*"
    }
  ]
}
```

3. Name it e.g. **WissenRDSFullAccess** → Create policy.
4. IAM → Users → wissen-developer → Add permissions → Attach **WissenRDSFullAccess**.

---

## 2. Create RDS PostgreSQL (CLI)

Use credentials for **wissen-developer** (configure `aws configure` or env vars). Replace placeholders.

**Variables (set these first):**

```bash
# Your AWS region (e.g. us-east-1)
export AWS_REGION=us-east-1

# Master password for RDS (choose a strong one; no single quotes inside)
export RDS_MASTER_PASSWORD="YourStrongPassword123!"

# Optional: VPC and subnet (leave blank to use default VPC)
# export RDS_VPC_SECURITY_GROUP_ID=sg-xxxxx
```

**Create the RDS instance:**

```bash
aws rds create-db-instance \
  --db-instance-identifier wissen-publication-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username postgres \
  --master-user-password "$RDS_MASTER_PASSWORD" \
  --allocated-storage 20 \
  --storage-type gp2 \
  --vpc-security-group-ids "$RDS_VPC_SECURITY_GROUP_ID" \
  --db-name wissen_publication_group \
  --backup-retention-period 7 \
  --no-publicly-accessible \
  --region "$AWS_REGION"
```

If you don't have a security group yet, create the DB in the **default VPC** and add the security group later:

```bash
# Get default VPC and create a security group for RDS
export DEFAULT_VPC_ID=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --query "Vpcs[0].VpcId" --output text --region "$AWS_REGION")
export RDS_SG_ID=$(aws ec2 create-security-group \
  --group-name wissen-rds-sg \
  --description "RDS PostgreSQL for Wissen" \
  --vpc-id "$DEFAULT_VPC_ID" \
  --region "$AWS_REGION" \
  --query "GroupId" --output text)

# Allow PostgreSQL from EC2 (use your EC2 instance's security group ID)
# Replace sg-ec2-xxxx with your EC2 security group
aws ec2 authorize-security-group-ingress \
  --group-id "$RDS_SG_ID" \
  --protocol tcp \
  --port 5432 \
  --source-group sg-ec2-xxxx \
  --region "$AWS_REGION"
```

Then create the DB (use the SG you created or the one you already have):

```bash
aws rds create-db-instance \
  --db-instance-identifier wissen-publication-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username postgres \
  --master-user-password "$RDS_MASTER_PASSWORD" \
  --allocated-storage 20 \
  --storage-type gp2 \
  --vpc-security-group-ids "$RDS_SG_ID" \
  --db-name wissen_publication_group \
  --backup-retention-period 7 \
  --no-publicly-accessible \
  --region "$AWS_REGION"
```

**Wait until the instance is available:**

```bash
aws rds wait db-instance-available \
  --db-instance-identifier wissen-publication-db \
  --region "$AWS_REGION"
```

**Get endpoint and add to .env:**

```bash
aws rds describe-db-instances \
  --db-instance-identifier wissen-publication-db \
  --region "$AWS_REGION" \
  --query "DBInstances[0].Endpoint.Address" \
  --output text
```

Save that hostname; you'll use it in `DATABASE_URL`.

---

## 3. Security group: allow EC2 to reach RDS

RDS must allow inbound **5432** from your EC2 instance.

**Get EC2 security group ID** (from the EC2 instance or console):

```bash
# If you know instance ID
aws ec2 describe-instances --instance-ids i-xxxxx --query "Reservations[0].Instances[0].SecurityGroups[0].GroupId" --output text --region "$AWS_REGION"
```

**Add rule to RDS security group** (use the RDS instance’s SG from RDS console → your DB → Security group):

```bash
# Replace sg-rds-xxxx with RDS security group, sg-ec2-xxxx with EC2 security group
aws ec2 authorize-security-group-ingress \
  --group-id sg-rds-xxxx \
  --protocol tcp \
  --port 5432 \
  --source-group sg-ec2-xxxx \
  --region "$AWS_REGION"
```

---

## 4. Add to backend .env on the server

SSH to EC2, then:

```bash
cd /var/www/wissen-publication-group/backend
nano .env
```

Set (replace with the endpoint from step 2 and the password you used for `RDS_MASTER_PASSWORD`):

```env
DATABASE_URL="postgresql://postgres:YourStrongPassword123!@wissen-publication-db.xxxxxx.us-east-1.rds.amazonaws.com:5432/wissen_publication_group?schema=public"
PORT=3001
CORS_ORIGIN="https://wissenpublicationgroup.com,https://www.wissenpublicationgroup.com"
NODE_ENV=production
```

If the password has special characters, URL-encode them (e.g. `@` → `%40`, `!` → `%21`).

Save, then:

```bash
npx prisma migrate deploy
pm2 restart wissen-backend
```

---

## 5. Quick reference

| Item | Value |
|------|--------|
| **Username** | `postgres` (set at create-db-instance) |
| **Password** | What you set in `RDS_MASTER_PASSWORD` |
| **Database** | `wissen_publication_group` |
| **Endpoint** | From `describe-db-instances` → `Endpoint.Address` |
| **Connection string** | `postgresql://postgres:PASSWORD@ENDPOINT:5432/wissen_publication_group?schema=public` |

You don’t “fetch” the password from AWS; you choose it when creating the RDS instance and store it in `.env`.
