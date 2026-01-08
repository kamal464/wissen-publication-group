# Fix Database Password Issue

The deployment is failing because the PostgreSQL password in GitHub Secrets doesn't match the actual password on the EC2 instance.

## Quick Fix

### Option 1: Reset PostgreSQL Password on EC2 (Recommended)

1. SSH into your EC2 instance:
   ```bash
   ssh ubuntu@YOUR_EC2_IP
   ```

2. Run the diagnostic script:
   ```bash
   cd /var/www/wissen-publication-group
   chmod +x fix-database-password.sh
   ./fix-database-password.sh
   ```

3. Or manually reset the password:
   ```bash
   sudo -u postgres psql
   ```
   Then in the PostgreSQL prompt:
   ```sql
   ALTER USER postgres WITH PASSWORD 'your_new_password_here';
   \q
   ```

4. Update GitHub Secrets:
   - Go to GitHub → Settings → Secrets and variables → Actions
   - Find `DB_PASSWORD` secret
   - Update it with the new password you just set

5. Re-run the deployment workflow

### Option 2: Check Current Password and Update GitHub

If you know the current PostgreSQL password:

1. Update the `DB_PASSWORD` secret in GitHub to match the current password
2. Re-run the deployment workflow

## Verify Database Connection

After fixing the password, test the connection:

```bash
# On EC2 instance
cd /var/www/wissen-publication-group/backend
source .env
npx prisma db execute --stdin <<< "SELECT 1;"
```

## Common Issues

1. **Password contains special characters**: The password is automatically URL-encoded in the deployment script, but make sure there are no issues with the encoding.

2. **Password has spaces**: Make sure there are no leading/trailing spaces in the GitHub secret.

3. **Database doesn't exist**: If the database `wissen_publication_group` doesn't exist, create it:
   ```bash
   sudo -u postgres psql -c "CREATE DATABASE wissen_publication_group;"
   ```

## Check Current Database Status

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check if database exists
sudo -u postgres psql -c "\l" | grep wissen_publication_group

# Check database connection
sudo -u postgres psql -d wissen_publication_group -c "SELECT version();"
```

