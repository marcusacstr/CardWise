# CardWise Partner Portal Setup Guide

## Overview

The CardWise Partner Portal system allows financial institutions and fintech companies to create white-label credit card recommendation portals. This guide covers the complete setup process, from account creation to portal deployment.

## Getting Started

### 1. Partner Account Setup

1. **Sign Up**: Visit `/partner/auth` and create a new partner account
2. **Email Verification**: Check your email and verify your account
3. **Dashboard Access**: After verification, access your dashboard at `/partner/dashboard`

### 2. Portal Creation

#### Using the Portal Generator

1. Navigate to **Portal Management** or click "Create Portal" from your dashboard
2. Fill in the portal details:
   - **Portal Name**: A descriptive name for your portal (e.g., "MyBank Card Finder")
   - **Subdomain**: Auto-generated from portal name or custom (e.g., "mybank-cards")
   - **Custom Domain**: Optional custom domain for later setup

3. Click "Create Portal" to begin deployment

#### Portal Structure

Each portal includes:
- **Test URL**: `https://[subdomain].cardwise-preview.com` for testing
- **Production URL**: Your custom domain after verification
- **SSL Certificate**: Automatically provisioned
- **Deployment Status**: Real-time deployment monitoring

## Portal Customization

### 1. Branding Options

Access customization via **Portal Customization** in your dashboard:

#### Colors & Visual Identity
- **Primary Color**: Main brand color for buttons and accents
- **Secondary Color**: Supporting color for headers and backgrounds
- **Accent Color**: Highlight color for important elements
- **Logo Upload**: Company logo (recommended: 200x60px, PNG/SVG)
- **Favicon**: Browser tab icon (recommended: 32x32px, ICO/PNG)

#### Content Customization
- **Company Name**: Displayed throughout the portal
- **Welcome Message**: Homepage greeting text
- **Footer Text**: Copyright and company information
- **Contact Information**: Email, phone, and address

### 2. Feature Configuration

Enable/disable portal features:
- **Spending Analysis**: CSV upload and categorization
- **Card Recommendations**: Personalized card suggestions
- **Credit Score Tracking**: Credit score improvement tools
- **Financial Goals**: Goal setting and tracking

### 3. Advanced Customization

#### Custom CSS
Add custom styling to match your brand:
```css
/* Example custom CSS */
.portal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-recommendation {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

#### SEO Settings
- **Page Title**: Browser title and search results
- **Meta Description**: Search engine description
- **Keywords**: SEO keywords for better discoverability

## Domain Setup

### Option 1: Subdomain Setup (Recommended)

**Advantages:**
- Easy setup (2 DNS records)
- Automatic SSL certificates
- No server configuration required
- Best for most partners

**Setup Process:**
1. Add CNAME record: `cards.yourbank.com` → `portals.cardwise.com`
2. Add TXT record for verification: `cardwise-verify-[token]`
3. Verify domain in portal settings
4. Portal goes live automatically

### Option 2: Path-Based Setup (Advanced)

**Advantages:**
- Uses main domain (`yourbank.com/cardcompare`)
- SEO benefits from main domain authority
- Seamless user experience

**Requirements:**
- Server access for proxy configuration
- Technical knowledge of web servers

**Setup Process:**
1. Configure reverse proxy on your server
2. Add TXT record for verification
3. Test proxy configuration
4. Verify domain in portal settings

### DNS Configuration Examples

#### Cloudflare
```
Type: CNAME
Name: cards
Target: portals.cardwise.com
TTL: Auto

Type: TXT
Name: _cardwise-verify
Content: cardwise-verify-[your-token]
TTL: Auto
```

#### GoDaddy
```
Type: CNAME
Host: cards
Points to: portals.cardwise.com
TTL: 1 Hour

Type: TXT
Host: _cardwise-verify
TXT Value: cardwise-verify-[your-token]
TTL: 1 Hour
```

## Analytics & Monitoring

### Real-Time Analytics

Monitor your portal performance with:
- **User Metrics**: Total users, active users, new signups
- **Engagement**: Session duration, pages per session, bounce rate
- **Conversions**: Card applications, approval rates
- **Revenue**: Commission tracking, payout status

### Commission Tracking

Track earnings with detailed breakdowns:
- **Commission Rates**: Set per-card commission rates
- **Application Status**: Pending, approved, rejected
- **Payout Schedule**: Monthly payouts to your account
- **Revenue Reports**: Downloadable monthly statements

## API Integration (Advanced)

### Webhook Configuration

Receive real-time notifications for:
- New user registrations
- Card applications
- Commission earnings
- Portal status changes

### API Endpoints

Access portal data programmatically:
```
GET /api/partner/analytics - Analytics data
GET /api/partner/commissions - Commission details
GET /api/partner/portals - Portal management
POST /api/partner/webhooks - Webhook configuration
```

## Best Practices

### 1. Portal Design
- **Consistent Branding**: Match your existing brand guidelines
- **Mobile Responsive**: Test on all device sizes
- **Fast Loading**: Optimize images and avoid heavy customizations
- **Clear Navigation**: Make it easy for users to find what they need

### 2. User Experience
- **Simple Onboarding**: Minimize required fields
- **Clear Benefits**: Explain the value proposition
- **Trust Signals**: Display security badges and testimonials
- **Support Contact**: Provide easy access to help

### 3. Conversion Optimization
- **A/B Testing**: Test different messaging and layouts
- **Progress Indicators**: Show users where they are in the process
- **Social Proof**: Display customer reviews and ratings
- **Urgency**: Highlight limited-time offers appropriately

### 4. Compliance & Security
- **Privacy Policy**: Link to your privacy policy
- **Terms of Service**: Include clear terms and conditions
- **Data Security**: Ensure secure handling of user data
- **Regulatory Compliance**: Follow local financial regulations

## Troubleshooting

### Common Issues

#### Portal Creation Fails
- **Check Subdomain**: Ensure subdomain is unique and valid
- **Verify Account**: Confirm email verification is complete
- **Browser Issues**: Try clearing cache or different browser

#### Domain Verification Issues
- **DNS Propagation**: Wait 24-48 hours for DNS changes
- **Record Format**: Double-check CNAME and TXT record format
- **TTL Settings**: Use shorter TTL for faster propagation

#### Customization Not Applying
- **Cache Issues**: Clear browser cache and refresh
- **CSS Syntax**: Validate custom CSS for errors
- **Override Issues**: Check CSS specificity and !important usage

### Support Channels

- **Email Support**: partners@cardwise.com
- **Documentation**: This guide and API documentation
- **Live Chat**: Available in partner dashboard
- **Phone Support**: Available for premium partners

## Success Metrics

### Key Performance Indicators (KPIs)

Track these metrics for portal success:
- **Conversion Rate**: Applications per visitor
- **User Engagement**: Pages viewed, time on site
- **Revenue per User**: Commission earned per visitor
- **Customer Satisfaction**: User feedback and ratings

### Optimization Recommendations

1. **Weekly Reviews**: Check analytics for trends
2. **User Feedback**: Collect and act on user suggestions
3. **Competitor Analysis**: Monitor industry best practices
4. **Continuous Testing**: Regular A/B testing of key elements

## Conclusion

The CardWise Partner Portal system provides a comprehensive solution for white-label credit card recommendations. Following this guide ensures optimal setup, customization, and performance of your portal.

For additional support or advanced customization needs, contact our partner success team.

---

**Last Updated**: January 2025
**Version**: 2.0 