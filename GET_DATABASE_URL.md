# 🔗 How to Get Your DATABASE_URL for GitHub Secrets

## From Your Command

You provided:
```
psql -h db.clupojsvmfxycklmdkjy.supabase.co -p 5432 -d postgres -U postgres
```

This gives us:
- **Host**: `db.clupojsvmfxycklmdkjy.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres`
- **Password**: ❌ Missing (you need to get this)

---

## ✅ Best Way: Get Full Connection String from Supabase

### Step 1: Go to Supabase Dashboard
1. Visit: https://app.supabase.com
2. Login to your account
3. Select your project: **wissen-publication-group**

### Step 2: Get Connection String
1. Go to **Settings** (gear icon) → **Database**
2. Scroll down to **"Connection string"** section
3. Find **"URI"** tab (not "Session mode" or "Transaction mode")
4. You'll see something like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.clupojsvmfxycklmdkjy.supabase.co:5432/postgres
   ```
5. **Copy the entire string** (it includes your password)

---

## 📝 Format

The connection string format is:
```
postgresql://username:password@host:port/database
```

**Example**:
```
postgresql://postgres:your_actual_password_here@db.clupojsvmfxycklmdkjy.supabase.co:5432/postgres
```

---

## 🔐 Add to GitHub Secrets

1. Go to: https://github.com/kamal464/wissen-publication-group/settings/secrets/actions
2. Click **"New repository secret"**
3. **Name**: `DATABASE_URL`
4. **Value**: Paste the **complete connection string** from Supabase (including password)
5. Click **"Add secret"**

---

## ⚠️ Important Notes

- ✅ **Include the password** in the connection string
- ✅ Use the **URI format** from Supabase (not the psql command)
- ✅ The password is between `postgres:` and `@` in the URI
- ❌ **Never commit** the connection string to code
- ❌ **Never share** the connection string publicly

---

## 🔍 Verify Your Connection String

Your connection string should look like:
```
postgresql://postgres:xxxxxxxxxxxxx@db.clupojsvmfxycklmdkjy.supabase.co:5432/postgres
```

Where `xxxxxxxxxxxxx` is your actual database password.

---

## ✅ After Adding

Once you add `DATABASE_URL` to GitHub secrets:
1. The deployment workflow will use it automatically
2. Your backend will connect to Supabase PostgreSQL
3. No need to manually configure it in Cloud Run

---

**Next Step**: Get the full URI from Supabase dashboard and add it as `DATABASE_URL` secret!

