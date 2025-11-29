# Port Configuration Fix

## Problem
Backend was trying to use port 8080 (Cloud Run default), but:
- Port 8080 is already in use
- Local development should use port 3001

## Solution Applied
Changed `main.ts` to use `config.app.port` (3001) instead of hardcoded 8080.

## Next Steps

### Option 1: Kill Process on Port 8080 (if needed)
```powershell
# Find process using port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Option 2: Just Restart Backend (Recommended)
The fix is already applied. Just restart:

```powershell
cd C:\Users\kolli\universal-publishers\backend
npm run start:dev
```

Now it will use port **3001** for local development.

## Expected Output
```
✅ Wissen Publication Group API running on http://0.0.0.0:3001/api
```

Not port 8080!

