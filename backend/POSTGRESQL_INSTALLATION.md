# PostgreSQL Installation Guide

## Quick Installation Steps

### Option 1: Using EnterpriseDB Installer (Recommended)

1. **Download PostgreSQL**
   - Visit: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
   - Download PostgreSQL 16 or 15 for Windows x86-64

2. **Run the Installer**
   - Double-click the downloaded `.exe` file
   - Follow the installation wizard

3. **Important Settings During Installation**
   - **Port**: `5432` (default)
   - **Superuser (postgres) Password**: `kamaldb`
   - **Locale**: Default (or your preference)
   - **Installation Directory**: Default (usually `C:\Program Files\PostgreSQL\16`)

4. **After Installation**
   - The PostgreSQL service should start automatically
   - Run the setup script: `.\install-postgresql.ps1`
   - Or manually create the database using pgAdmin (comes with PostgreSQL)

### Option 2: Using Chocolatey (if you have it)

```powershell
choco install postgresql16 --params '/Password:kamaldb'
```

### Option 3: Using Scoop (if you have it)

```powershell
scoop install postgresql
```

## Verify Installation

After installation, verify PostgreSQL is running:

```powershell
# Check if PostgreSQL service is running
Get-Service | Where-Object {$_.DisplayName -like "*PostgreSQL*"}

# Test connection
psql -U postgres -h localhost -p 5432
# Password: kamaldb
```

## Create Database

After PostgreSQL is installed, create the `universal_publishers` database:

**Option 1: Using the setup script**
```powershell
cd backend
.\install-postgresql.ps1
```

**Option 2: Using psql**
```powershell
# Set password environment variable
$env:PGPASSWORD = "kamaldb"

# Connect and create database
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE universal_publishers;"
```

**Option 3: Using pgAdmin**
1. Open pgAdmin (installed with PostgreSQL)
2. Connect to PostgreSQL server (password: `kamaldb`)
3. Right-click "Databases" → "Create" → "Database"
4. Name: `universal_publishers`
5. Click "Save"

## Configure .env File

Your `.env` file should already be configured with:
```env
DATABASE_URL=postgresql://postgres:kamaldb@localhost:5432/universal_publishers
```

## Next Steps After Installation

1. **Run Prisma migrations:**
   ```powershell
   npx prisma migrate dev
   ```

2. **Generate Prisma client:**
   ```powershell
   npx prisma generate
   ```

3. **Start Prisma Studio:**
   ```powershell
   npx prisma studio
   ```

## Troubleshooting

### PostgreSQL service not starting
```powershell
# Check service status
Get-Service postgresql*

# Start service manually
Start-Service postgresql-x64-16  # Adjust version number as needed
```

### Port 5432 already in use
- Check what's using the port: `netstat -ano | findstr :5432`
- Change PostgreSQL port in `postgresql.conf` (usually in `C:\Program Files\PostgreSQL\16\data\`)
- Update `.env` file with new port

### Connection refused
- Ensure PostgreSQL service is running
- Check Windows Firewall allows port 5432
- Verify password is correct (`kamaldb`)

