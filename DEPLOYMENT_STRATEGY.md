# Deployment Strategy

## ✅ Active Deployment: AWS EC2 Only

**Primary deployment method:** AWS EC2 via GitHub Actions

### Workflow
- **File:** `.github/workflows/deploy-ec2.yml`
- **Trigger:** Push to `main` branch
- **Status:** ✅ Active

---

## ❌ Disabled Deployments

### Google Cloud Run
- **File:** `.github/workflows/firebase-hosting-merge.yml`
- **Status:** ❌ Disabled
- **Reason:** Using EC2 instead

### Supabase
- **Status:** ❌ Not used
- **Database:** PostgreSQL on EC2 (localhost)

---

## Current Infrastructure

### AWS EC2
- **Instance IP:** `54.165.116.208`
- **URL:** http://54.165.116.208
- **Database:** PostgreSQL on EC2
- **File Storage:** AWS S3 + CloudFront
- **Process Manager:** PM2
- **Web Server:** Nginx

### Services Running
- **Backend:** Port 3001 (PM2)
- **Frontend:** Port 3000 (PM2)
- **Nginx:** Port 80 (reverse proxy)

---

## Deployment Process

1. Push to `main` branch
2. GitHub Actions triggers EC2 deployment
3. Code pulled from GitHub
4. Dependencies installed
5. Backend and frontend built
6. PM2 services restarted
7. Application live on EC2

---

## Monitoring

- **GitHub Actions:** https://github.com/kamal464/wissen-publication-group/actions
- **EC2 Instance:** http://54.165.116.208
- **Deployment Status Badge:** Visible on website (bottom-right)

---

## Notes

- All deployments go to EC2 only
- Google Cloud Run is disabled
- Supabase is not used (using EC2 PostgreSQL)
- Focus is on EC2 deployment reliability

