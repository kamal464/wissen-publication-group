# 🏠 Build Frontend Locally and Test

## 📋 **Prerequisites:**

1. Node.js 18+ installed
2. npm or yarn installed
3. Git repository cloned locally

---

## 🚀 **STEP 1: Build Frontend Locally**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Or with optimizations
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

## ✅ **STEP 2: Test Locally**

### Option 1: Test Production Build
```bash
# Start production server
npm start

# Or with custom port
PORT=3000 npm start
```

Then open: `http://localhost:3000`

### Option 2: Test Development Mode
```bash
# Start dev server (faster, with hot reload)
npm run dev
```

Then open: `http://localhost:3000`

---

## 🔍 **STEP 3: Verify Build**

After building, check:

```bash
# Verify .next folder exists
ls -la .next

# Check build output
cat .next/BUILD_ID

# Check build size
du -sh .next
```

---

## 📦 **STEP 4: Upload to AWS (Optional)**

If build is successful locally, you can upload it to AWS:

### Option 1: Upload .next folder only
```bash
# On your local machine (Windows PowerShell)
cd frontend
tar -czf next-build.tar.gz .next

# Upload to AWS (replace with your IP and key path)
scp -i "$env:USERPROFILE\.ssh\Ec2-Tutorial.pem" next-build.tar.gz ubuntu@54.165.116.208:/tmp/

# On AWS, extract and restart
ssh -i "$env:USERPROFILE\.ssh\Ec2-Tutorial.pem" ubuntu@54.165.116.208
cd /var/www/wissen-publication-group/frontend
rm -rf .next
tar -xzf /tmp/next-build.tar.gz
pm2 restart wissen-frontend
```

### Option 2: Upload entire frontend folder
```bash
# On your local machine
cd frontend
tar -czf frontend-build.tar.gz .next node_modules package.json package-lock.json

# Upload
scp -i "$env:USERPROFILE\.ssh\Ec2-Tutorial.pem" frontend-build.tar.gz ubuntu@54.165.116.208:/tmp/

# On AWS
cd /var/www/wissen-publication-group/frontend
tar -xzf /tmp/frontend-build.tar.gz
pm2 restart wissen-frontend
```

---

## 🧪 **STEP 5: Test Specific Features**

### Test Admin Login
1. Open: `http://localhost:3000/admin/login`
2. Check if form displays correctly
3. Verify spacing and layout

### Test Journals Page
1. Open: `http://localhost:3000/journals`
2. Check if title is centered
3. Verify card spacing
4. Check for duplicate journals

### Test Responsive Design
- Open browser DevTools (F12)
- Test different screen sizes
- Check mobile, tablet, desktop views

---

## 🔧 **Troubleshooting Local Build**

### Build Fails?
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Port Already in Use?
```bash
# Find and kill process
# Windows PowerShell
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm start
```

### Type Errors?
```bash
# Skip type checking (faster build)
SKIP_ENV_VALIDATION=true npm run build
```

---

## 📊 **Build Output**

You should see:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
...
```

---

## ✅ **Quick Test Checklist**

After building locally, test:

- [ ] Homepage loads
- [ ] Admin login page displays correctly
- [ ] Journal admin login page displays correctly
- [ ] Journals page shows (no duplicates)
- [ ] Journal cards have proper spacing
- [ ] Title is centered on journals page
- [ ] All buttons have proper spacing
- [ ] Responsive design works
- [ ] No console errors

---

## 🚀 **Full Local Development Workflow**

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install dependencies
cd frontend
npm install

# 3. Build
npm run build

# 4. Test
npm start

# 5. If everything works, commit and push
git add .
git commit -m "Your changes"
git push origin main

# 6. Then deploy to AWS using deployment commands
```

---

## 💡 **Tips**

1. **Use dev mode for faster iteration**: `npm run dev` (hot reload)
2. **Use production build for final testing**: `npm run build && npm start`
3. **Check browser console** for any errors
4. **Test in incognito mode** to avoid cache issues
5. **Use different browsers** to ensure compatibility

---

## 📝 **Environment Variables**

Make sure `.env.local` or `.env.production` exists:

```bash
# frontend/.env.local or .env.production
NEXT_PUBLIC_API_URL=http://localhost:3001/api
# Or for production:
# NEXT_PUBLIC_API_URL=http://54.165.116.208/api
```

---

## 🎯 **Recommended: Build and Test Locally First**

1. Build locally: `npm run build`
2. Test locally: `npm start`
3. Verify everything works
4. Then deploy to AWS

This saves time and catches issues early!
