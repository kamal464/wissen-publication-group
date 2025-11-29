# Google Cloud Cost Estimate for Wissen Publication Group

## Your Free Trial Status
- **Credits:** ₹26,460.75 (Indian Rupees)
- **Days Remaining:** 91 days
- **Status:** Free Trial (₹26,460.75 ≈ $317 USD at current rates)

## Services You'll Use

### 1. Cloud Run (Frontend + Backend)
**Pricing Model:** Pay per request + compute time

#### Frontend (Next.js SSR)
- **Memory:** 1 GiB
- **CPU:** 1 vCPU
- **Expected Traffic:** Low to Medium (academic journal site)
- **Monthly Cost Estimate:**
  - **Free Tier:** 2 million requests/month FREE
  - **Compute Time:** ₹0.00002400 per vCPU-second
  - **Memory:** ₹0.00000250 per GiB-second
  - **Estimated Monthly:** ₹500 - ₹2,000 (if under 2M requests)

#### Backend (NestJS API)
- **Memory:** 512 MiB
- **CPU:** 1 vCPU
- **Expected Traffic:** Low to Medium
- **Monthly Cost Estimate:**
  - **Free Tier:** 2 million requests/month FREE
  - **Compute Time:** ₹0.00002400 per vCPU-second
  - **Memory:** ₹0.00000250 per GiB-second
  - **Estimated Monthly:** ₹300 - ₹1,500 (if under 2M requests)

### 2. Artifact Registry (Docker Images)
**Pricing:** Storage + Operations

- **Storage:** ₹0.10 per GB/month
- **Operations:** First 5,000 operations/month FREE
- **Estimated Monthly:** ₹50 - ₹200 (depending on image size and updates)

### 3. Cloud Build (Docker Builds)
**Pricing:** Build minutes

- **Free Tier:** 120 build-minutes/day FREE
- **After Free Tier:** ₹0.003 per build-minute
- **Estimated Monthly:** ₹0 - ₹500 (if builds stay under free tier)

### 4. Cloud SQL (PostgreSQL - Supabase)
**Note:** You're using Supabase, which is separate from GCP billing

## Total Monthly Cost Estimate

### Conservative Estimate (Low Traffic)
- Cloud Run Frontend: ₹500
- Cloud Run Backend: ₹500
- Artifact Registry: ₹100
- Cloud Build: ₹0 (within free tier)
- **Total: ₹1,100/month** (~$13 USD)

### Moderate Traffic Estimate
- Cloud Run Frontend: ₹1,500
- Cloud Run Backend: ₹1,000
- Artifact Registry: ₹150
- Cloud Build: ₹200
- **Total: ₹2,850/month** (~$34 USD)

### High Traffic Estimate
- Cloud Run Frontend: ₹5,000
- Cloud Run Backend: ₹3,000
- Artifact Registry: ₹300
- Cloud Build: ₹500
- **Total: ₹8,800/month** (~$105 USD)

## Free Trial Coverage

### With ₹26,460.75 Credits:
- **Conservative:** ~24 months covered
- **Moderate:** ~9 months covered
- **High:** ~3 months covered

### 91 Days Remaining:
- You have plenty of credits for initial deployment and testing
- Credits will cover development and early production use

## Cost Optimization Tips

### 1. Use Cloud Run Free Tier
- **2 million requests/month FREE** per service
- Your frontend and backend each get 2M free requests
- **Total: 4 million free requests/month**

### 2. Optimize Memory Allocation
- Frontend: Start with 512 MiB, increase if needed
- Backend: Start with 256 MiB, increase if needed
- Monitor and adjust based on actual usage

### 3. Use Cloud Run Min Instances = 0
- Scale to zero when not in use
- No charges when idle
- Cold start is acceptable for most use cases

### 4. Optimize Docker Images
- Smaller images = less storage cost
- Use multi-stage builds (already in your Dockerfile)
- Clean up old images regularly

### 5. Monitor Usage
- Set up billing alerts
- Use Cloud Monitoring to track costs
- Review monthly billing reports

## Expected First Month Costs

### Initial Deployment (One-time)
- Cloud Build: ₹0 (within free tier)
- Artifact Registry: ₹50 (image storage)
- **Total: ₹50**

### Monthly Recurring (Low Traffic)
- Cloud Run: ₹1,000
- Artifact Registry: ₹100
- **Total: ₹1,100/month**

## After Free Trial Ends

### What Happens:
1. Credits expire after 91 days
2. You'll be charged for actual usage
3. Free tier benefits continue (2M requests/month per service)
4. You only pay for what you use

### Payment Setup:
- Add a payment method before trial ends
- Set up billing alerts
- Monitor usage regularly

## Recommendations

### ✅ You Have Enough Credits For:
- Initial deployment and testing
- 3-9 months of low to moderate traffic
- Development and staging environments

### 💡 Cost-Saving Strategies:
1. **Start Small:** Use minimum memory/CPU, scale up if needed
2. **Monitor Closely:** Set up billing alerts at ₹500, ₹1,000, ₹2,000
3. **Use Free Tier:** Stay within 2M requests/month per service
4. **Optimize Images:** Keep Docker images small
5. **Scale to Zero:** Let Cloud Run scale down when idle

### 📊 Expected Annual Cost (Low Traffic):
- **Year 1:** ₹13,200 - ₹26,400 (~$158 - $316 USD)
- **After Free Tier:** Most costs covered by free tier for low traffic

## Conclusion

**Yes, ₹26,460.75 is MORE than enough** for:
- ✅ Initial deployment
- ✅ 3-9 months of operation (depending on traffic)
- ✅ Development and testing
- ✅ Early production use

**Your credits will likely last the entire 91-day trial period** and beyond, especially if you:
- Stay within free tier limits (2M requests/month per service)
- Use minimum resources
- Scale to zero when idle

## Next Steps

1. ✅ Deploy your application
2. ✅ Monitor costs in Cloud Console
3. ✅ Set up billing alerts
4. ✅ Optimize based on actual usage

You're in good shape! 🚀

