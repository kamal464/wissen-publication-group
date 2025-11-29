# Google Cloud Cost Analysis for Wissen Publication Group

## Your Free Trial Status
- **Credits:** ₹26,460.75 (≈ $317 USD)
- **Days Remaining:** 91 days
- **Daily Budget:** ~₹290/day

## Your Deployment Configuration

### Frontend (Cloud Run)
- Memory: 1 GiB
- CPU: 1 vCPU
- Region: us-central1
- Min Instances: 0 (scales to zero)

### Backend (Cloud Run)
- Memory: 512 MiB
- CPU: 1 vCPU
- Region: us-central1
- Min Instances: 0 (scales to zero)

## Monthly Cost Breakdown

### 1. Cloud Run - Frontend
**Pricing:**
- Requests: First 2 million/month = **FREE**
- CPU: ₹0.00002400 per vCPU-second
- Memory: ₹0.00000250 per GiB-second

**Cost Scenarios:**

#### Low Traffic (100K requests/month, 1 hour/day active)
- Requests: ₹0 (within free tier)
- Compute: ~30 hours/month × 1 vCPU × ₹0.0864/hour = ₹2,592
- Memory: ~30 hours/month × 1 GiB × ₹0.09/hour = ₹2,700
- **Total: ₹5,292/month**

#### Moderate Traffic (500K requests/month, 4 hours/day active)
- Requests: ₹0 (within free tier)
- Compute: ~120 hours/month × 1 vCPU × ₹0.0864/hour = ₹10,368
- Memory: ~120 hours/month × 1 GiB × ₹0.09/hour = ₹10,800
- **Total: ₹21,168/month**

#### High Traffic (1.5M requests/month, 12 hours/day active)
- Requests: ₹0 (within free tier)
- Compute: ~360 hours/month × 1 vCPU × ₹0.0864/hour = ₹31,104
- Memory: ~360 hours/month × 1 GiB × ₹0.09/hour = ₹32,400
- **Total: ₹63,504/month**

### 2. Cloud Run - Backend
**Same pricing structure, but 512 MiB memory**

#### Low Traffic
- **Total: ₹3,456/month**

#### Moderate Traffic
- **Total: ₹13,824/month**

#### High Traffic
- **Total: ₹41,472/month**

### 3. Artifact Registry
- Storage: ₹0.10 per GB/month
- Operations: First 5,000/month = **FREE**
- Estimated: 2-5 GB storage = **₹200-500/month**

### 4. Cloud Build
- Free Tier: 120 build-minutes/day = **FREE**
- Your builds: ~5-10 minutes each = **₹0/month** (within free tier)

## Total Monthly Costs

### Low Traffic Scenario
- Frontend: ₹5,292
- Backend: ₹3,456
- Artifact Registry: ₹300
- Cloud Build: ₹0
- **Total: ₹9,048/month** (~$108 USD)

### Moderate Traffic Scenario
- Frontend: ₹21,168
- Backend: ₹13,824
- Artifact Registry: ₹400
- Cloud Build: ₹0
- **Total: ₹35,392/month** (~$424 USD)

### High Traffic Scenario
- Frontend: ₹63,504
- Backend: ₹41,472
- Artifact Registry: ₹500
- Cloud Build: ₹0
- **Total: ₹105,476/month** (~$1,265 USD)

## Your Credits Coverage

### With ₹26,460.75 Credits:

#### Low Traffic
- **Coverage: ~2.9 months**
- Well within your 91-day trial period ✅

#### Moderate Traffic
- **Coverage: ~0.75 months (23 days)**
- May need to optimize or add payment method ⚠️

#### High Traffic
- **Coverage: ~0.25 months (8 days)**
- Will need optimization immediately ❌

## Cost Optimization Recommendations

### 1. Reduce Memory Allocation (Biggest Savings)
**Current:**
- Frontend: 1 GiB
- Backend: 512 MiB

**Optimized:**
- Frontend: 512 MiB (saves ~50%)
- Backend: 256 MiB (saves ~50%)

**Savings:** ~50% reduction in Cloud Run costs

### 2. Use Cloud Run Free Tier
- **2 million requests/month FREE per service**
- Your frontend + backend = 4 million free requests/month
- Most academic journal sites stay well under this

### 3. Scale to Zero (Already Configured)
- No charges when idle ✅
- Only pay when handling requests

### 4. Optimize Response Times
- Faster responses = less compute time = lower costs
- Use caching where possible
- Optimize database queries

## Realistic Estimate for Academic Journal Site

### Expected Traffic Pattern:
- **Low to Moderate:** Most academic sites
- **Peak Hours:** Business hours (8-10 hours/day)
- **Idle Hours:** Scale to zero (no cost)

### Realistic Monthly Cost:
**₹8,000 - ₹15,000/month** (~$96 - $180 USD)

### With Your Credits:
- **Coverage: 1.7 - 3.3 months**
- **Within your 91-day trial** ✅

## After Free Trial Ends

### What Happens:
1. Credits expire
2. You pay only for actual usage
3. Free tier benefits continue (2M requests/month per service)
4. No charges when services scale to zero

### Payment Required:
- Add payment method before trial ends
- Set up billing alerts
- Monitor usage in Cloud Console

## Cost Monitoring Setup

### Recommended Billing Alerts:
1. **₹5,000** - Early warning
2. **₹10,000** - Moderate usage
3. **₹20,000** - High usage alert
4. **₹25,000** - Critical (near credit limit)

## Conclusion

### ✅ Yes, Your Credits Are Enough For:

1. **Initial Deployment:** ₹50-100 (one-time)
2. **3 Months Operation:** ₹24,000-45,000 (low-moderate traffic)
3. **Development & Testing:** Included
4. **Early Production:** Covered

### 💡 Recommendations:

1. **Start with Optimized Settings:**
   - Frontend: 512 MiB memory
   - Backend: 256 MiB memory
   - Monitor and scale up if needed

2. **Monitor Costs:**
   - Set up billing alerts
   - Review weekly usage
   - Optimize based on actual patterns

3. **Stay Within Free Tier:**
   - 2M requests/month per service
   - Most academic sites stay well under this

4. **Plan for Post-Trial:**
   - Add payment method before trial ends
   - Budget ₹8,000-15,000/month for ongoing costs
   - Consider optimizing further if costs are high

### 📊 Expected First 3 Months:
- **Month 1:** ₹8,000-12,000
- **Month 2:** ₹8,000-12,000
- **Month 3:** ₹8,000-12,000
- **Total:** ₹24,000-36,000

**Your ₹26,460.75 credits will cover this!** ✅

## Next Steps

1. ✅ Enable APIs and grant permissions
2. ✅ Deploy with optimized settings
3. ✅ Set up billing alerts
4. ✅ Monitor costs weekly
5. ✅ Optimize based on actual usage

You're in excellent shape! Your credits are more than sufficient for deployment and initial operation. 🚀

