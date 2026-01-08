#!/bin/bash
# Script to fix PostgreSQL password on EC2 instance
# Run this on the EC2 instance to reset or verify the database password

set -e

echo "=========================================="
echo "🔧 PostgreSQL Password Diagnostic & Fix"
echo "=========================================="
echo ""

# Check if PostgreSQL is running
if ! sudo systemctl is-active --quiet postgresql; then
  echo "❌ PostgreSQL is not running"
  echo "Starting PostgreSQL..."
  sudo systemctl start postgresql
  sleep 2
fi

echo "✅ PostgreSQL is running"
echo ""

# Check current database setup
echo "📋 Current database information:"
sudo -u postgres psql -c "\l" | grep wissen_publication_group || echo "Database 'wissen_publication_group' not found"
echo ""

# Get the password from GitHub Secrets (you'll need to set this)
echo "🔐 To fix the database password, you have two options:"
echo ""
echo "Option 1: Reset the PostgreSQL password to match GitHub Secrets"
echo "  Run: sudo -u postgres psql -c \"ALTER USER postgres WITH PASSWORD 'YOUR_PASSWORD_HERE';\""
echo ""
echo "Option 2: Update GitHub Secrets to match current PostgreSQL password"
echo "  First, check current password (if you know it):"
echo "  Then update DB_PASSWORD in GitHub Secrets"
echo ""

# Interactive password reset
read -p "Do you want to reset the PostgreSQL password? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  read -sp "Enter new password for postgres user: " NEW_PASSWORD
  echo
  read -sp "Confirm password: " CONFIRM_PASSWORD
  echo
  
  if [ "$NEW_PASSWORD" != "$CONFIRM_PASSWORD" ]; then
    echo "❌ Passwords don't match"
    exit 1
  fi
  
  echo "Resetting PostgreSQL password..."
  sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '$NEW_PASSWORD';"
  
  if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL password updated successfully"
    echo ""
    echo "⚠️  IMPORTANT: Update the DB_PASSWORD secret in GitHub to match this password"
    echo "   GitHub → Settings → Secrets → DB_PASSWORD"
    echo ""
    echo "📝 URL-encoded password (for reference):"
    python3 -c "import urllib.parse; print(urllib.parse.quote('$NEW_PASSWORD', safe=''))" 2>/dev/null || echo "$NEW_PASSWORD"
  else
    echo "❌ Failed to update password"
    exit 1
  fi
fi

# Test connection with current .env file
echo ""
echo "🔍 Testing database connection..."
if [ -f "/var/www/wissen-publication-group/backend/.env" ]; then
  cd /var/www/wissen-publication-group/backend
  source .env
  echo "Testing connection with DATABASE_URL from .env..."
  npx prisma db execute --stdin <<< "SELECT 1;" 2>&1 | head -5 || echo "Connection test failed"
else
  echo "⚠️  backend/.env file not found"
fi

echo ""
echo "=========================================="
echo "✅ Diagnostic complete"
echo "=========================================="

