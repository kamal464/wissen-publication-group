# 🚀 Deployment Documentation - Wissen Publication Group
## AWS EC2 Deployment

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Infrastructure Components](#infrastructure-components)
4. [Deployment Process](#deployment-process)
5. [GitHub Actions CI/CD](#github-actions-cicd)
6. [Environment Variables](#environment-variables)
7. [URLs and Endpoints](#urls-and-endpoints)
8. [Troubleshooting](#troubleshooting)
9. [Cost Estimation](#cost-estimation)

---

## 🎯 Overview

**Wissen Publication Group** is deployed as a full-stack application on **AWS EC2**:

- **Frontend**: Next.js 15.5.4 (Server-Side Rendering) on EC2
- **Backend**: NestJS API on EC2
- **Database**: PostgreSQL on EC2 (or AWS RDS)
- **File Storage**: AWS S3 + CloudFront CDN
- **CI/CD**: GitHub Actions with automated deployments
- **Process Manager**: PM2
- **Web Server**: Nginx (reverse proxy)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
│         kamal464/wissen-publication-group                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Push to main branch
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              GitHub Actions Workflow                         │
│  .github/workflows/deploy-ec2.yml                          │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Build Frontend │         │  Build Backend   │          │
│  │  (Next.js SSR)  │         │  (NestJS)        │          │
│  └────────┬─────────┘         └────────┬─────────┘          │
│           │                           │                      │
│           ▼                           ▼                      │
│  ┌──────────────────────────────────────────┐              │
│  │   SSH to EC2 Instance                    │              │
│  │   - Pull latest code                     │              │
│  │   - Install dependencies                 │              │
│  │   - Run migrations                       │              │
│  │   - Build applications                   │              │
│  │   - Restart PM2 services                 │              │
│  └────────┬──────────────────────┬───────────┘              │
│           │                      │                           │
│           ▼                        ▼                          │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  EC2 Instance     │  │  EC2 Instance     │                │
│  │  - Frontend:3000 │  │  - Backend:3001  │                │
│  │  - Nginx:80      │  │  - PostgreSQL    │                │
│  └────────┬─────────┘  └────────┬─────────┘                │
└───────────┼──────────────────────┼──────────────────────────┘
            │                      │
            │                      │
            ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│              AWS S3 + CloudFront                            │
│         File Storage & CDN                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Infrastructure Components

### 1. **AWS EC2 Instance**

#### Instance Details
- **Instance ID**: `i-016ab2b939f5f7a3b`
- **Public IP**: `54.165.116.208`
- **Region**: `us-east-1`
- **Instance Type**: `t3.medium` (2 vCPU, 4GB RAM)
- **OS**: Ubuntu 22.04 LTS
- **Storage**: 20GB+ (gp3)

#### Security Group
- **Group ID**: `sg-0bea1705b41dd4806`
- **Inbound Rules**:
  - HTTP (80) from 0.0.0.0/0
  - HTTPS (443) from 0.0.0.0/0
  - SSH (22) from your IP
- **Outbound Rules**: All traffic

#### Services Running
- **Nginx**: Port 80 (reverse proxy)
- **Frontend**: Port 3000 (Next.js, managed by PM2)
- **Backend**: Port 3001 (NestJS, managed by PM2)
- **PostgreSQL**: Port 5432 (local database)

---

### 2. **AWS S3 + CloudFront**

#### S3 Bucket
- **Bucket Name**: `wissen-publication-group-files`
- **Region**: `us-east-1`
- **Purpose**: File storage (PDFs, images, documents)

#### CloudFront Distribution
- **Distribution URL**: `https://d2qm3szai4trao.cloudfront.net`
- **Purpose**: CDN for fast file delivery
- **Origin**: S3 bucket

---

### 3. **PostgreSQL Database**

#### Connection Details
- **Host**: `localhost` (on EC2 instance)
- **Port**: `5432`
- **Database**: `wissen_publication_group`
- **Username**: `postgres`
- **Password**: Stored in GitHub Secrets

#### Database Management
- **ORM**: Prisma
- **Migrations**: Automatic on deployment
- **Schema**: Defined in `backend/prisma/schema.prisma`
- **Migrations Location**: `backend/prisma/migrations/`

#### Database Features
- Automatic migrations on deployment
- Local PostgreSQL instance
- Can be migrated to AWS RDS for production

---

### 4. **Process Management (PM2)**

#### PM2 Configuration
- **Config File**: `ecosystem.config.js`
- **Processes**:
  - `wissen-frontend`: Frontend Next.js app
  - `wissen-backend`: Backend NestJS API

#### PM2 Commands
```bash
pm2 status              # Check status
pm2 logs                # View logs
pm2 restart all         # Restart all services
pm2 save                # Save current process list
```

---

### 5. **Nginx Reverse Proxy**

#### Configuration
- **Config File**: `/etc/nginx/sites-available/wissen-publication-group`
- **Purpose**: 
  - Route requests to frontend/backend
  - Serve static files
  - Handle SSL/TLS (when configured)

#### Routing
- `/` → Frontend (port 3000)
- `/api/*` → Backend (port 3001)
- `/uploads/*` → Backend static files

---

## 🔄 Deployment Process

### Automatic Deployment (GitHub Actions)

1. **Trigger**: Push to `main` branch or manual workflow dispatch
2. **Build Phase**:
   - Checkout code
   - Setup Node.js 20
   - Install dependencies
   - Build frontend and backend
3. **Deploy Phase**:
   - SSH to EC2 instance
   - Pull latest code from GitHub
   - Update environment variables
   - Install dependencies
   - Run database migrations
   - Build applications
   - Restart PM2 services
   - Reload Nginx

### Manual Deployment

#### SSH to EC2
```bash
ssh -i your-key.pem ubuntu@54.165.116.208
```

#### Deploy Commands
```bash
cd /var/www/wissen-publication-group
git pull origin main

# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart wissen-backend

# Frontend
cd ../frontend
npm install
npm run build
pm2 restart wissen-frontend

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx
```

---

## 🤖 GitHub Actions CI/CD

### Workflow File
`.github/workflows/deploy-ec2.yml`

### Workflow Structure

1. **Checkout Code**
2. **Setup Node.js 20**
3. **Build Applications**
   - Install dependencies
   - Build frontend
   - Build backend
4. **Deploy to EC2**
   - SSH to EC2 instance
   - Pull latest code
   - Update environment files
   - Install dependencies
   - Run migrations
   - Build applications
   - Restart PM2 services
   - Reload Nginx

### GitHub Secrets Required

| Secret Name | Description | Example |
|------------|-------------|---------|
| `EC2_HOST` | EC2 instance IP or hostname | `54.165.116.208` |
| `EC2_USER` | SSH username | `ubuntu` |
| `EC2_SSH_KEY` | Private SSH key | `-----BEGIN RSA PRIVATE KEY-----...` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/wissen_publication_group` |
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `...` |
| `S3_BUCKET_NAME` | S3 bucket name | `wissen-publication-group-files` |
| `CLOUDFRONT_URL` | CloudFront distribution URL | `https://d2qm3szai4trao.cloudfront.net` |

### Workflow Triggers
- **Automatic**: Push to `main` branch
- **Manual**: `workflow_dispatch` (can be triggered from GitHub UI)

---

## 🔐 Environment Variables

### Backend (EC2)

**File**: `/var/www/wissen-publication-group/backend/.env`

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/wissen_publication_group
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://54.165.116.208,http://localhost:3000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=wissen-publication-group-files
CLOUDFRONT_URL=https://d2qm3szai4trao.cloudfront.net
```

### Frontend (EC2)

**File**: `/var/www/wissen-publication-group/frontend/.env.production`

```env
NEXT_PUBLIC_API_URL=http://54.165.116.208/api
```

### Local Development

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/wissen_publication_group
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:3002
PORT=3001
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 🌐 URLs and Endpoints

### Production URLs

#### Frontend
- **URL**: http://54.165.116.208
- **Region**: us-east-1
- **Service**: EC2 Instance

#### Backend API
- **Base URL**: http://54.165.116.208
- **API Base**: http://54.165.116.208/api
- **Health Check**: http://54.165.116.208/api/health

### Key Endpoints

#### Public Endpoints
- `GET /api/journals` - List all journals
- `GET /api/journals/:shortcode` - Get journal by shortcode
- `GET /api/articles` - List articles
- `POST /api/articles/manuscripts` - Submit manuscript
- `POST /api/messages` - Contact form submission
- `GET /api/health` - Health check

#### Admin Endpoints
- `POST /api/admin/login` - Admin login
- `GET /api/admin/users` - List users
- `GET /api/admin/journal-shortcodes` - List journal shortcodes
- `GET /api/admin/submissions` - List manuscript submissions

#### Journal Admin Endpoints
- `POST /api/journal-admin/login` - Journal admin login
- `GET /api/journal-admin/journals/:id` - Get journal details
- `PUT /api/journal-admin/journals/:id` - Update journal
- `POST /api/journal-admin/journals/:id/images` - Upload journal images

### File Uploads
- **Static Files**: `http://54.165.116.208/uploads/[filename]`
- **S3 Files**: `https://d2qm3szai4trao.cloudfront.net/[filename]`
- **Upload Endpoint**: `POST /api/articles/:id/upload-pdf`
- **Image Upload**: `POST /api/articles/:id/upload-images`

---

## 🔍 Troubleshooting

### Common Issues

#### 1. **Site Not Loading**
**Solution**: 
```bash
# Check PM2 status
pm2 status

# Check Nginx
sudo systemctl status nginx

# Check services
curl http://localhost:3001/api/health
curl http://localhost:3000
```

#### 2. **Database Connection Failed**
**Error**: `Invalid prisma.user.findFirst() invocation`
**Solution**:
- Check `DATABASE_URL` in backend/.env
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Run migrations: `cd backend && npx prisma migrate deploy`

#### 3. **CORS Errors**
**Error**: `Access to XMLHttpRequest blocked by CORS policy`
**Solution**:
- Verify `CORS_ORIGIN` includes frontend URL
- Check backend logs: `pm2 logs wissen-backend`
- Ensure frontend URL matches exactly

#### 4. **PM2 Services Not Running**
**Solution**:
```bash
cd /var/www/wissen-publication-group
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 5. **Nginx Not Working**
**Solution**:
```bash
# Test configuration
sudo nginx -t

# Check logs
sudo tail -20 /var/log/nginx/error.log

# Restart
sudo systemctl restart nginx
```

### Debugging Commands

#### Check Services Status
```bash
# PM2
pm2 status
pm2 logs --lines 50

# Nginx
sudo systemctl status nginx
sudo nginx -t

# PostgreSQL
sudo systemctl status postgresql

# Ports
sudo netstat -tlnp | grep -E '3000|3001|80'
```

#### View Logs
```bash
# Backend logs
pm2 logs wissen-backend --lines 50

# Frontend logs
pm2 logs wissen-frontend --lines 50

# Nginx logs
sudo tail -50 /var/log/nginx/error.log
sudo tail -50 /var/log/nginx/access.log
```

#### Test Endpoints
```bash
# Backend health
curl http://localhost:3001/api/health

# Frontend
curl http://localhost:3000

# Through Nginx
curl http://54.165.116.208/api/health
```

---

## 💰 Cost Estimation

### AWS EC2
- **Instance Type**: t3.medium
- **Estimated Monthly**: ~$30-40
- **Storage**: ~$2-3/month (20GB gp3)

### AWS S3
- **Storage**: ~$0.023/GB/month
- **Requests**: ~$0.005 per 1,000 requests
- **Estimated Monthly**: ~$1-5 (depending on usage)

### AWS CloudFront
- **Data Transfer**: ~$0.085/GB (first 10TB)
- **Requests**: ~$0.0075 per 10,000 requests
- **Estimated Monthly**: ~$1-10 (depending on traffic)

### PostgreSQL (Local)
- **Cost**: Included with EC2
- **Alternative**: AWS RDS (~$15-30/month for t3.micro)

### Total Estimated Monthly Cost
- **Basic Setup**: ~$35-50/month
- **With RDS**: ~$50-80/month
- **High Traffic**: ~$100-200/month

### Cost Optimization Tips
1. Use EC2 Reserved Instances (save up to 40%)
2. Enable CloudFront caching
3. Optimize S3 storage (lifecycle policies)
4. Monitor and optimize instance size
5. Use S3 Intelligent-Tiering for files

---

## 📚 Additional Resources

### Documentation Links
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [NestJS Deployment](https://docs.nestjs.com/recipes/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

### Support
- **GitHub Repository**: https://github.com/kamal464/wissen-publication-group
- **AWS Console**: https://console.aws.amazon.com
- **GitHub Actions**: https://github.com/kamal464/wissen-publication-group/actions

---

## 📝 Deployment Checklist

### Initial Setup
- [ ] Launch EC2 instance
- [ ] Configure security group
- [ ] Install Node.js, PM2, Nginx, PostgreSQL
- [ ] Clone repository
- [ ] Configure environment variables
- [ ] Set up GitHub Actions secrets
- [ ] Configure AWS S3 and CloudFront
- [ ] Test deployment

### Before Each Deployment
- [ ] Verify database migrations are up to date
- [ ] Test locally with production environment variables
- [ ] Check GitHub Secrets are correct
- [ ] Review code changes
- [ ] Ensure tests pass (if applicable)

### After Deployment
- [ ] Verify frontend is accessible
- [ ] Test API endpoints
- [ ] Check database connectivity
- [ ] Monitor PM2 logs
- [ ] Verify file uploads work
- [ ] Test authentication flows
- [ ] Check CORS configuration
- [ ] Verify S3/CloudFront integration

---

## 🔗 Related Documents

- **TROUBLESHOOT_DEPLOYMENT.md** - Detailed troubleshooting guide
- **EC2_DEPLOYMENT_GUIDE.md** - Step-by-step EC2 setup
- **DEPLOYMENT_STRATEGY.md** - Deployment strategy overview
- **AWS_S3_CLOUDFRONT_SETUP.md** - S3 and CloudFront setup

---

**Last Updated**: 2025-01-20  
**Maintained By**: Wissen Publication Group Development Team  
**Deployment Platform**: AWS EC2
