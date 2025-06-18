# 🚀 CardWise Production Quick Start Guide

## Overview
This guide will help you deploy CardWise to production in under 30 minutes using the fastest deployment method.

## ⚡ Quick Deployment (Vercel - Recommended)

### 1. Prerequisites (5 minutes)
```bash
# Install required tools
npm install -g vercel supabase

# Verify installations
vercel --version
supabase --version
```

### 2. Database Setup (5 minutes)
```bash
# Create production Supabase project
supabase projects create cardwise-production

# Get your project details
supabase projects list

# Run migrations
supabase db push --project-ref YOUR_PROJECT_REF
```

### 3. Environment Setup (5 minutes)
```bash
# Copy environment template
cp env.production.template .env.production

# Edit with your production values
nano .env.production
```

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - From Supabase dashboard
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase dashboard
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your production domain

### 4. Deploy to Vercel (10 minutes)
```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set up environment variables in Vercel dashboard
# Visit: https://vercel.com/dashboard
```

### 5. Configure Domain (5 minutes)
1. **Add your domain** in Vercel dashboard
2. **Set up wildcard DNS**: `*.yourdomain.com` → Vercel
3. **Update next.config.js** with your domain
4. **Redeploy**: `vercel --prod`

## 🎉 You're Live!

Your CardWise application is now running in production:
- **Main App**: `https://yourdomain.com`
- **Partner Dashboard**: `https://yourdomain.com/partner`
- **Sample Portal**: `https://demo.yourdomain.com`

## 📋 Post-Deployment Checklist

### Immediate (Required)
- [ ] Test user registration flow
- [ ] Test partner portal creation
- [ ] Verify subdomain routing works
- [ ] Check SSL certificates
- [ ] Test database connectivity

### Within 24 Hours
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure analytics (Google Analytics)
- [ ] Set up uptime monitoring
- [ ] Create backup strategy
- [ ] Test error handling

### Within 1 Week
- [ ] Load testing with realistic traffic
- [ ] Security audit and penetration testing
- [ ] Performance optimization
- [ ] Documentation for team
- [ ] Disaster recovery plan

## 🔧 Alternative Deployment Methods

### Docker Deployment
```bash
# Build and run with Docker
docker build -t cardwise .
docker run -p 3000:3000 --env-file .env.production cardwise

# Or use Docker Compose
docker-compose -f docker-compose.production.yml up -d
```

### Manual VPS Deployment
```bash
# Run the automated deployment script
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

## 🚨 Production Checklist Summary

### Security ✅
- [ ] HTTPS enabled with valid SSL
- [ ] Security headers configured
- [ ] Environment variables secured
- [ ] Database RLS enabled
- [ ] Rate limiting implemented

### Performance ✅
- [ ] Images optimized (WebP/AVIF)
- [ ] Compression enabled
- [ ] CDN configured
- [ ] Caching strategy implemented
- [ ] Bundle size optimized

### Monitoring ✅
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Analytics tracking
- [ ] Health checks enabled

### Compliance ✅
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Cookie consent implemented
- [ ] GDPR compliance (if EU users)
- [ ] Audit logging enabled

## 📞 Support & Troubleshooting

### Common Issues

**Subdomain routing not working:**
- Check DNS wildcard configuration
- Verify next.config.js rewrite rules
- Test with `dig *.yourdomain.com`

**Database connection errors:**
- Verify Supabase URL and keys
- Check RLS policies
- Ensure migrations are applied

**Build failures:**
- Check Node.js version (18+)
- Clear `.next` and `node_modules`
- Verify all environment variables

### Health Check Endpoint
Monitor your application: `https://yourdomain.com/api/health`

### Logs and Debugging
```bash
# Vercel logs
vercel logs

# Docker logs
docker logs cardwise-app

# Application logs
tail -f /var/log/cardwise/app.log
```

## 🎯 Success Metrics

Track these KPIs after deployment:
- **Uptime**: >99.9%
- **Response Time**: <200ms average
- **Error Rate**: <0.1%
- **Partner Signups**: Track conversion
- **Portal Creation**: Monitor success rate

## 🔄 Maintenance Schedule

### Daily
- Monitor error rates and performance
- Check uptime and response times
- Review critical alerts

### Weekly
- Security updates and patches
- Performance optimization review
- Backup verification

### Monthly
- Full security audit
- Load testing
- Infrastructure scaling review
- Cost optimization

---

## 🚀 Ready to Scale!

Your CardWise application is now production-ready and can handle:
- **Thousands of concurrent users**
- **Hundreds of partner portals**
- **High-volume credit card applications**
- **Real-time analytics and tracking**

**Need help?** Check the full `PRODUCTION_DEPLOYMENT_CHECKLIST.md` for detailed instructions.

**Questions?** Create an issue or contact support.

---

*Last updated: January 2025* 