# 🔐 Your DATABASE_URL for GitHub Secrets

## ✅ Complete Connection String

Based on your Supabase credentials, here's your complete `DATABASE_URL`:

```
postgresql://postgres:oOL7KbQaBQ1zQdRz@db.clupojsvmfxycklmdkjy.supabase.co:5432/postgres
```

---

## 📝 Add to GitHub Secrets

### Step-by-Step:

1. **Go to GitHub Secrets Page**:
   - https://github.com/kamal464/wissen-publication-group/settings/secrets/actions

2. **Click "New repository secret"**

3. **Fill in the form**:
   - **Name**: `DATABASE_URL`
   - **Value**: 
     ```
     postgresql://postgres:oOL7KbQaBQ1zQdRz@db.clupojsvmfxycklmdkjy.supabase.co:5432/postgres
     ```

4. **Click "Add secret"**

---

## ✅ Verification

After adding, you should see:
- ✅ `DATABASE_URL` in your secrets list
- ✅ The value will be hidden (showing only `••••••••`)

---

## 🚀 Next Steps

After adding `DATABASE_URL`, you still need:

1. ✅ `DATABASE_URL` - **You have this now!**
2. ⏳ `GCP_SERVICE_ACCOUNT` - Service account JSON from Google Cloud
3. ⏳ `GCP_PROJECT_ID` - Your Google Cloud Project ID
4. ⏳ `NEXT_PUBLIC_API_URL` - Backend URL (can use placeholder: `http://localhost:3001` for now)

---

## ⚠️ Security Note

- ✅ This password is now stored securely in GitHub Secrets
- ✅ It will be encrypted and only accessible to your GitHub Actions
- ❌ Never commit this to your code repository
- ❌ Never share this publicly

---

**Ready to add!** Copy the connection string above and add it to GitHub Secrets.

