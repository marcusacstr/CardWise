# CardWise Production Deployment Checklist

## 🚀 Pre-Production Checklist

### 1. Environment & Security Setup

#### ✅ Environment Variables
- [ ] **Production Supabase Database**
  - Create production Supabase project
  - Set `NEXT_PUBLIC_SUPABASE_URL` (production)
  - Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` (production)
  - Set `SUPABASE_SERVICE_ROLE_KEY` (production)

- [ ] **Security Keys**
  - Generate strong `NEXTAUTH_SECRET` (32+ characters)
  - Set `NEXTAUTH_URL` to production domain
  - Configure `JWT_SECRET` for token signing

- [ ] **Email Configuration**
  - Set up production email service (SendGrid, AWS SES, etc.)
  - Configure SMTP credentials
  - Set up email templates for user verification

#### ✅ Database Setup
- [ ] **Run Production Migrations**
  ```bash
  supabase db push --project-ref YOUR_PROD_PROJECT_REF
  ```
- [ ] **Enable Row Level Security (RLS)**
  - Partners table: Partners can only access their own data
  - Credit cards: Public read access
  - User sessions: Users can only access their own sessions
  
- [ ] **Create Database Indexes**
  ```sql
  -- Performance indexes
  CREATE INDEX idx_partners_subdomain ON partners(subdomain);
  CREATE INDEX idx_partner_cards_partner_id ON partner_card_selections(partner_id);
  CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
  ```

#### ✅ Security Headers & CORS
- [ ] **Update next.config.js**
  ```javascript
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  }
  ```

### 2. Performance Optimization

#### ✅ Image Optimization
- [ ] **Configure Image Domains**
  ```javascript
  images: {
    domains: ['your-production-domain.com', 'supabase-storage-url'],
    formats: ['image/webp', 'image/avif'],
  }
  ```

- [ ] **Optimize Card Images**
  - Convert to WebP format
  - Create multiple sizes (thumbnail, medium, large)
  - Upload to Supabase Storage or CDN

#### ✅ Build Optimization
- [ ] **Enable Production Build**
  ```bash
  npm run build
  npm run start
  ```

- [ ] **Bundle Analysis**
  ```bash
  npm install --save-dev @next/bundle-analyzer
  # Add to next.config.js for analysis
  ```

### 3. Domain & DNS Setup

#### ✅ Main Domain
- [ ] **Purchase Production Domain** (e.g., `cardwise.app`)
- [ ] **Configure DNS**
  - A record pointing to your hosting provider
  - CNAME for www subdomain
  - SSL certificate setup

#### ✅ Subdomain Wildcards
- [ ] **Configure Wildcard DNS**
  - Add `*.cardwise.app` CNAME record
  - Point to your hosting provider
  - Ensure SSL covers wildcard domains

- [ ] **Update Rewrite Rules**
  ```javascript
  async rewrites() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: '(?<subdomain>.*)\\.cardwise\\.app',  // Update domain
          },
        ],
        destination: '/portal/:subdomain',
      },
    ];
  }
  ```

### 4. Hosting & Deployment

#### ✅ Choose Hosting Provider
**Recommended Options:**

1. **Vercel (Easiest)**
   - [ ] Connect GitHub repository
   - [ ] Configure environment variables
   - [ ] Enable automatic deployments
   - [ ] Set up custom domain

2. **Netlify**
   - [ ] Connect repository
   - [ ] Configure build settings
   - [ ] Set up environment variables
   - [ ] Configure redirects for SPA

3. **AWS/DigitalOcean (More Control)**
   - [ ] Set up Docker container
   - [ ] Configure load balancer
   - [ ] Set up auto-scaling
   - [ ] Configure monitoring

#### ✅ Deployment Configuration
- [ ] **Build Command**: `npm run build`
- [ ] **Start Command**: `npm run start`
- [ ] **Node Version**: `18.x` or higher
- [ ] **Environment**: `NODE_ENV=production`

### 5. Monitoring & Analytics

#### ✅ Error Tracking
- [ ] **Set up Sentry**
  ```bash
  npm install @sentry/nextjs
  ```
  - Configure error reporting
  - Set up performance monitoring
  - Create alerts for critical errors

#### ✅ Analytics
- [ ] **Google Analytics 4**
  - Track user interactions
  - Monitor conversion rates
  - Set up goals and funnels

- [ ] **Partner Analytics**
  - Track portal visits
  - Monitor application completions
  - Commission tracking

#### ✅ Uptime Monitoring
- [ ] **Set up monitoring** (Pingdom, UptimeRobot, etc.)
- [ ] **Configure alerts** for downtime
- [ ] **Monitor API endpoints**

### 6. Legal & Compliance

#### ✅ Privacy & Terms
- [ ] **Privacy Policy**
  - Data collection practices
  - Cookie usage
  - Third-party integrations

- [ ] **Terms of Service**
  - User responsibilities
  - Partner agreements
  - Liability limitations

- [ ] **Cookie Consent**
  - GDPR compliance
  - Cookie banner implementation
  - Consent management

#### ✅ Financial Compliance
- [ ] **PCI DSS** (if handling payments)
- [ ] **Data encryption** at rest and in transit
- [ ] **Audit logging** for financial transactions

### 7. Testing & QA

#### ✅ Pre-Launch Testing
- [ ] **Load Testing**
  - Test with 100+ concurrent users
  - Verify database performance
  - Check API response times

- [ ] **Cross-Browser Testing**
  - Chrome, Firefox, Safari, Edge
  - Mobile browsers (iOS Safari, Chrome Mobile)
  - Test on different screen sizes

- [ ] **User Flow Testing**
  - Partner registration → portal creation → card setup
  - User journey → recommendations → application
  - Error handling and edge cases

#### ✅ Security Testing
- [ ] **Penetration Testing**
- [ ] **SQL Injection Testing**
- [ ] **XSS Prevention**
- [ ] **CSRF Protection**

### 8. Launch Preparation

#### ✅ Content & Data
- [ ] **Seed Production Database**
  - Credit card data
  - Sample partner portals
  - Test user accounts

- [ ] **Content Review**
  - All text and copy
  - Legal disclaimers
  - Error messages

#### ✅ Support Systems
- [ ] **Customer Support**
  - Help documentation
  - Support email/chat
  - FAQ section

- [ ] **Partner Onboarding**
  - Welcome email sequence
  - Tutorial videos
  - Demo portal setup

## 🚀 Production Launch Steps

### Phase 1: Soft Launch (Internal Testing)
1. **Deploy to staging environment**
2. **Internal team testing**
3. **Fix critical bugs**
4. **Performance optimization**

### Phase 2: Beta Launch (Limited Partners)
1. **Invite 5-10 beta partners**
2. **Gather feedback**
3. **Iterate on user experience**
4. **Monitor system performance**

### Phase 3: Public Launch
1. **Deploy to production**
2. **Marketing campaign**
3. **Monitor closely for issues**
4. **Scale infrastructure as needed**

## 📊 Post-Launch Monitoring

### Key Metrics to Track
- **User Conversion Rate**: Portal visits → applications
- **Partner Satisfaction**: Portal creation → active usage
- **System Performance**: Response times, uptime
- **Revenue Metrics**: Applications → commissions

### Weekly Reviews
- [ ] **Performance reports**
- [ ] **Error rate analysis**
- [ ] **User feedback review**
- [ ] **Infrastructure scaling needs**

## 🔧 Production Environment Variables

Create a `.env.production` file with:

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Security
NEXTAUTH_SECRET=your-super-secure-32-character-secret
NEXTAUTH_URL=https://cardwise.app
JWT_SECRET=your-jwt-signing-secret

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
FROM_EMAIL=noreply@cardwise.app

# Analytics
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
SENTRY_DSN=your-sentry-dsn

# Production Settings
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## ✅ Production Readiness Checklist Summary

- [ ] **Environment Setup** (Database, Security, DNS)
- [ ] **Performance Optimization** (Images, Caching, CDN)
- [ ] **Security Implementation** (Headers, HTTPS, RLS)
- [ ] **Monitoring Setup** (Errors, Analytics, Uptime)
- [ ] **Legal Compliance** (Privacy, Terms, Cookies)
- [ ] **Testing Complete** (Load, Security, Cross-browser)
- [ ] **Launch Plan** (Staging, Beta, Production)

## 🎉 Ready for Production!

Once all items are checked off, your CardWise application will be production-ready and can handle real users and partners at scale.

**Estimated Setup Time**: 2-3 days for full production deployment
**Recommended Team**: 1 developer + 1 DevOps engineer + 1 QA tester 