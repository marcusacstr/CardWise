# CardWise Partner Portal & Domain Setup Guide

## Overview

CardWise enables partners to create fully branded, white-label credit card comparison portals that can be hosted on their own domains. This guide covers everything from portal creation to custom domain setup.

## 🚀 Portal Creation Process

### Step 1: Create Your Portal

1. **Access Portal Management**
   - Log into your partner dashboard
   - Navigate to "Create Portal" or visit `/partner/portal/create`
   
2. **Configure Basic Settings**
   - **Portal Name**: Choose a descriptive name for your portal
   - **Subdomain**: Auto-generated or custom (e.g., "my-cards")
   - **Custom Domain**: Optional - you can add this later

3. **Deploy to Test Environment**
   - Your portal is automatically deployed to: `https://[subdomain].cardwise-preview.com`
   - Use this URL for testing and preview

### Step 2: Customize Your Portal

1. **Brand Customization**
   - Upload your company logo
   - Set brand colors (primary, secondary, accent)
   - Configure company information

2. **Content Management**
   - Welcome message customization
   - Footer text and contact information
   - SEO settings (title, description, keywords)

3. **Feature Configuration**
   - Enable/disable portal features:
     - Spending analysis
     - Card recommendations
     - Credit score tracking
     - Financial goals

## 🌐 Domain Setup Options

### Option 1: Subdomain Setup (Recommended)

Connect your portal to a subdomain like `cards.yourwebsite.com`

**Advantages:**
- Easiest to set up
- Full control over subdomain
- Automatic SSL certificates
- No server configuration required

**Setup Process:**
1. Add CNAME record in your DNS settings
2. Add verification TXT record
3. Verify domain ownership
4. SSL automatically provisioned

### Option 2: Path-Based Setup (Advanced)

Connect your portal to a path like `yourwebsite.com/cardcompare`

**Advantages:**
- Uses your main domain
- SEO benefits of unified domain

**Requirements:**
- Server access and configuration
- Proxy/reverse proxy setup
- Technical knowledge required

## 🔧 DNS Configuration

### For Cloudflare Users

1. **Log into Cloudflare Dashboard**
2. **Select Your Domain**
3. **Go to DNS Tab**
4. **Add CNAME Record:**
   ```
   Type: CNAME
   Name: cards (or your preferred subdomain)
   Target: portals.cardwise.com
   Proxy Status: Proxied (Orange Cloud)
   TTL: Auto
   ```
5. **Add Verification TXT Record:**
   ```
   Type: TXT
   Name: _cardwise-verify.cards
   Content: [verification-token-from-dashboard]
   TTL: Auto
   ```

### For GoDaddy Users

1. **Access DNS Management**
   - Login → My Products → DNS
2. **Add CNAME Record:**
   ```
   Type: CNAME
   Host: cards
   Points to: portals.cardwise.com
   TTL: 1 Hour
   ```
3. **Add TXT Record:**
   ```
   Type: TXT
   Host: _cardwise-verify.cards
   TXT Value: [verification-token]
   TTL: 1 Hour
   ```

### For Namecheap Users

1. **Advanced DNS Settings**
   - Domain List → Manage → Advanced DNS
2. **Add CNAME Record:**
   ```
   Type: CNAME Record
   Host: cards
   Value: portals.cardwise.com
   TTL: Automatic
   ```
3. **Add TXT Record:**
   ```
   Type: TXT Record
   Host: _cardwise-verify.cards
   Value: [verification-token]
   TTL: Automatic
   ```

### For AWS Route 53 Users

1. **Create CNAME Record:**
   ```bash
   aws route53 change-resource-record-sets \
   --hosted-zone-id Z123456789 \
   --change-batch '{
     "Changes": [{
       "Action": "CREATE",
       "ResourceRecordSet": {
         "Name": "cards.yoursite.com",
         "Type": "CNAME",
         "TTL": 300,
         "ResourceRecords": [{"Value": "portals.cardwise.com"}]
       }
     }]
   }'
   ```

## 🖥️ Path-Based Setup (Advanced)

### Option A: Nginx Configuration

Add to your nginx configuration:

```nginx
location /cards {
    proxy_pass https://your-portal.cardwise-preview.com;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $server_name;
    
    # Optional: Remove /cards prefix
    proxy_redirect off;
    rewrite ^/cards(/.*)$ $1 break;
}
```

### Option B: Apache Configuration

Add to your .htaccess or virtual host:

```apache
ProxyPass /cards/ https://your-portal.cardwise-preview.com/
ProxyPassReverse /cards/ https://your-portal.cardwise-preview.com/
ProxyPreserveHost On

# Headers for proper forwarding
ProxyPassReverse /cards/ https://your-portal.cardwise-preview.com/
Header edit Location ^https://your-portal.cardwise-preview.com/(.*)$ /cards/$1
```

### Option C: Cloudflare Workers

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Route /cards requests to your portal
  if (url.pathname.startsWith('/cards')) {
    const portalUrl = new URL(url)
    portalUrl.hostname = 'your-portal.cardwise-preview.com'
    
    // Remove /cards prefix if needed
    portalUrl.pathname = portalUrl.pathname.replace('/cards', '') || '/'
    
    const response = await fetch(portalUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body
    })
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    })
  }
  
  // Pass through all other requests
  return fetch(request)
}
```

## ✅ Verification & Testing

### 1. DNS Propagation Check

Use command line tools to verify your DNS setup:

```bash
# Check CNAME record
dig cards.yourwebsite.com CNAME

# Check TXT record  
dig _cardwise-verify.cards.yourwebsite.com TXT

# Alternative using nslookup
nslookup cards.yourwebsite.com
```

### 2. Online DNS Tools

- [DNSChecker.org](https://dnschecker.org)
- [WhatsMyDNS.net](https://whatsmydns.net)
- [DNS Lookup Tool](https://mxtoolbox.com/DnsLookup.aspx)

### 3. Portal Testing Checklist

- [ ] Portal loads correctly on custom domain
- [ ] SSL certificate is active (https://)
- [ ] All navigation links work properly
- [ ] Card applications function correctly
- [ ] Analytics tracking is working
- [ ] Mobile responsiveness verified

## 🛡️ SSL Certificate Management

### Automatic SSL

- SSL certificates are automatically provisioned via Let's Encrypt
- Certificates renew automatically every 90 days
- Full certificate chain provided
- Support for wildcard certificates on request

### Certificate Status

Monitor your SSL status:
- Green padlock in browser
- Valid certificate chain
- No mixed content warnings
- HTTPS redirect working

## 📊 Analytics & Tracking

### Built-in Analytics

Your portal includes comprehensive analytics:

- **User Sessions**: Detailed visitor tracking
- **Conversion Rates**: Application success metrics  
- **Revenue Tracking**: Commission calculations
- **Performance Metrics**: Load times and engagement

### Google Analytics Integration

Add your GA4 tracking ID in portal settings:

```html
<!-- Automatically injected -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🔧 Troubleshooting

### Common DNS Issues

**Problem**: CNAME not resolving
- **Solution**: Check TTL settings, wait for propagation (up to 24 hours)

**Problem**: SSL certificate not issued
- **Solution**: Verify domain ownership, check DNS propagation

**Problem**: Portal shows 404 error
- **Solution**: Confirm CNAME target is correct: `portals.cardwise.com`

### Domain Verification Issues

**Problem**: Verification failing
- **Solutions**:
  1. Confirm TXT record format: `_cardwise-verify.[subdomain].[domain]`
  2. Use exact verification token from dashboard
  3. Wait for DNS propagation

### Path-Based Setup Issues

**Problem**: Infinite redirects
- **Solution**: Check proxy configuration, ensure proper header forwarding

**Problem**: Assets not loading
- **Solution**: Configure proxy to handle static assets correctly

## 📞 Support & Contact

### Technical Support

- **Email**: support@cardwise.com
- **Priority Support**: Available for Enterprise partners
- **Response Time**: Within 24 hours

### Documentation

- **Developer Docs**: [docs.cardwise.com](https://docs.cardwise.com)
- **API Reference**: [api.cardwise.com](https://api.cardwise.com)
- **Status Page**: [status.cardwise.com](https://status.cardwise.com)

### Best Practices

1. **Test on staging first**: Use preview URL before going live
2. **Monitor certificate expiry**: Though auto-renewed, monitor status
3. **Regular backups**: Keep configuration backups
4. **Performance monitoring**: Track portal load times
5. **SEO optimization**: Configure meta tags and sitemaps

## 🚀 Go Live Checklist

### Pre-Launch

- [ ] Portal fully customized with your branding
- [ ] All content reviewed and approved
- [ ] DNS records configured and propagated
- [ ] Domain verification completed
- [ ] SSL certificate active
- [ ] Testing completed on all devices
- [ ] Analytics tracking verified

### Launch Day

- [ ] Switch DNS to point to production
- [ ] Monitor for any issues
- [ ] Test all critical functions
- [ ] Announce to your audience
- [ ] Monitor analytics for traffic

### Post-Launch

- [ ] Regular performance monitoring
- [ ] Analytics review and optimization
- [ ] User feedback collection
- [ ] Ongoing content updates
- [ ] Commission tracking verification

---

**Need help?** Contact our support team at support@cardwise.com or visit your partner dashboard for live chat support. 