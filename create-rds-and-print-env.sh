#!/bin/bash
# Create RDS PostgreSQL for Wissen and print DATABASE_URL for backend/.env
# Run with wissen-developer credentials: aws configure (or export AWS_ACCESS_KEY_ID etc.)
# Usage: ./create-rds-and-print-env.sh

set -e

AWS_REGION="${AWS_REGION:-us-east-1}"
DB_ID="wissen-publication-db"
DB_NAME="wissen_publication_group"
DB_USER="postgres"
# Set this before running, or you'll be prompted
RDS_PASSWORD="${RDS_MASTER_PASSWORD:-}"

if [ -z "$RDS_PASSWORD" ]; then
  echo "Set RDS_MASTER_PASSWORD (no single quotes in password):"
  echo "  export RDS_MASTER_PASSWORD='YourStrongPass123!'"
  exit 1
fi

echo "Creating RDS PostgreSQL in $AWS_REGION..."

# Get default VPC
DEFAULT_VPC_ID=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --query "Vpcs[0].VpcId" --output text --region "$AWS_REGION")
if [ -z "$DEFAULT_VPC_ID" ] || [ "$DEFAULT_VPC_ID" = "None" ]; then
  echo "No default VPC. Create RDS manually in console and set DATABASE_URL in backend/.env"
  exit 1
fi

# Create security group for RDS (allow 5432 from same VPC for now; tighten with EC2 SG later)
RDS_SG_ID=$(aws ec2 create-security-group \
  --group-name wissen-rds-sg \
  --description "RDS PostgreSQL for Wissen" \
  --vpc-id "$DEFAULT_VPC_ID" \
  --region "$AWS_REGION" \
  --query "GroupId" --output text 2>/dev/null) || true

if [ -z "$RDS_SG_ID" ]; then
  RDS_SG_ID=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=wissen-rds-sg" "Name=vpc-id,Values=$DEFAULT_VPC_ID" --query "SecurityGroups[0].GroupId" --output text --region "$AWS_REGION")
fi

# Allow PostgreSQL from anywhere in VPC (restrict to EC2 SG in production)
aws ec2 authorize-security-group-ingress --group-id "$RDS_SG_ID" --protocol tcp --port 5432 --cidr "10.0.0.0/8" --region "$AWS_REGION" 2>/dev/null || true
aws ec2 authorize-security-group-ingress --group-id "$RDS_SG_ID" --protocol tcp --port 5432 --cidr "172.16.0.0/12" --region "$AWS_REGION" 2>/dev/null || true

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier "$DB_ID" \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username "$DB_USER" \
  --master-user-password "$RDS_PASSWORD" \
  --allocated-storage 20 \
  --storage-type gp2 \
  --vpc-security-group-ids "$RDS_SG_ID" \
  --db-name "$DB_NAME" \
  --backup-retention-period 7 \
  --no-publicly-accessible \
  --region "$AWS_REGION"

echo "Waiting for RDS to be available (5–10 min)..."
aws rds wait db-instance-available --db-instance-identifier "$DB_ID" --region "$AWS_REGION"

ENDPOINT=$(aws rds describe-db-instances --db-instance-identifier "$DB_ID" --region "$AWS_REGION" --query "DBInstances[0].Endpoint.Address" --output text)

# URL-encode password for connection string (basic: @ -> %40, etc.)
PASSWORD_ENC=$(echo -n "$RDS_PASSWORD" | sed 's/@/%40/g; s/#/%23/g; s/!/%21/g; s/%/%25/g')

echo ""
echo "=========================================="
echo "Add this to backend/.env on the server:"
echo "=========================================="
echo "DATABASE_URL=\"postgresql://${DB_USER}:${PASSWORD_ENC}@${ENDPOINT}:5432/${DB_NAME}?schema=public\""
echo "=========================================="
echo ""
echo "RDS endpoint: $ENDPOINT"
echo "DB name: $DB_NAME  |  User: $DB_USER"
echo "On EC2: allow inbound 5432 from this RDS SG to your EC2 SG, or use VPC CIDR above."
echo "Then: cd backend && npx prisma migrate deploy && pm2 restart wissen-backend"
echo ""
