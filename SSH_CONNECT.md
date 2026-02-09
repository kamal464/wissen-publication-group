# SSH connect to AWS EC2

Use your **real key path**, not the placeholder `/path/to/your-key.pem`.

---

## 1. Find or get your key file

- The `.pem` file was created when you launched the instance (or added later). You need the **same key** that was set for the instance.
- **Common locations:**
  - **Windows:** `C:\Users\YourUsername\.ssh\mykey.pem` or `C:\Users\YourUsername\Downloads\mykey.pem`
  - **Git Bash / WSL:** `~/.ssh/wissen-secure-key-2.pem` (from deploy-to-aws.sh example)
- If you don’t have it: in **AWS Console → EC2 → Key Pairs** you can’t re-download an existing key. You’d need to use **Session Manager** (no key) or create a new key pair and attach it to the instance (more steps).

---

## 2. SSH command (use your key path)

**PowerShell (Windows):** use the full path in quotes:
```powershell
ssh -i "C:\Users\kolli\.ssh\wissen-secure-key-2.pem" ubuntu@3.85.82.78
```
Replace `C:\Users\kolli\.ssh\wissen-secure-key-2.pem` with your actual `.pem` path.

**Git Bash / WSL:**
```bash
ssh -i ~/.ssh/wissen-secure-key-2.pem ubuntu@3.85.82.78
```
Or with full path:
```bash
ssh -i /c/Users/kolli/.ssh/wissen-secure-key-2.pem ubuntu@3.85.82.78
```

**One-liner with quick deploy:**
```bash
ssh -i "C:\Users\kolli\.ssh\wissen-secure-key-2.pem" ubuntu@3.85.82.78 "cd /var/www/wissen-publication-group && ./quick-deploy-on-server.sh"
```

---

## 3. No key? Use Session Manager (browser)

1. **AWS Console** → **EC2** → **Instances** → select instance `3.85.82.78`.
2. Click **Connect** → tab **Session Manager** → **Connect**.
3. A browser terminal opens. Run:
```bash
cd /var/www/wissen-publication-group && ./quick-deploy-on-server.sh
```
No `.pem` file needed; IAM handles access.

---

## 4. Quick reference

| You have…              | Command |
|------------------------|--------|
| Key at `C:\Users\kolli\.ssh\mykey.pem` | `ssh -i "C:\Users\kolli\.ssh\mykey.pem" ubuntu@3.85.82.78` |
| Key in Git Bash        | `ssh -i ~/.ssh/mykey.pem ubuntu@3.85.82.78` |
| No key                 | EC2 → Connect → Session Manager → run deploy in browser terminal |

Replace `mykey.pem` and the path with your real key file.
