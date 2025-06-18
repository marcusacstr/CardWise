'use client';

import React from 'react';
import Link from 'next/link';
import { FaRegChartBar, FaRegGem, FaRegLightbulb, FaRegCheckCircle, FaRegUser, FaRegStar } from 'react-icons/fa';

export default function PricingPage() {
  const pricingTiers = [
    {
      name: 'Free',
      price: '$0',
      description: 'Get started and earn with our revenue share model.',
      features: [
        '50 Recommendations per month',
        'Partners keep 50% of referral/affiliate payments',
        'Basic Analytics',
        'Core AI Recommendations',
        'Client management tools',
        'Email Support',
      ],
      highlight: false,
    },
    {
      name: 'Starter',
      price: '$79.99/month',
      description: 'For growing advisors looking to offer a branded experience.',
      features: [
        '150 Recommendations per month',
        'White-Label Platform',
        'Premium AI Recommendations',
        'Standard Branding Customization',
        'Partners keep 100% of referral/affiliate payments',
        'Advanced Analytics',
        'Priority Support',
        'Client management tools'
      ],
      highlight: true,
    },
    {
      name: 'Pro',
      price: '$149.99/month',
      description: 'For established practices needing full customization and support.',
      features: [
        '500 Recommendations per month',
        'White-Label Platform',
        'Premium AI Recommendations',
        'Standard Branding Customization',
        'Partners keep 100% of referral/affiliate payments',
        'Advanced Analytics',
        'Priority Support',
        'Client management tools'
      ],
      highlight: false
    },
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">Partner Pricing Plans</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that best fits your business needs. All paid plans offer enhanced features and revenue sharing.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`bg-card rounded-lg shadow-lg p-8 flex flex-col ${
                tier.highlight ? 'border-2 border-primary transform scale-105' : 'border border-border'
              }`}
            >
              <h2
                className={`text-2xl font-semibold mb-4 ${
                  tier.highlight ? 'text-primary' : 'text-foreground'
                }`}
              >
                {tier.name}
              </h2>
              <p className="text-muted-foreground mb-6 flex-grow">{tier.description}</p>
              <p className={`text-4xl font-bold mb-6 ${
                tier.highlight ? 'text-primary' : 'text-foreground'
              }`}>
                {tier.price}
              </p>
              <ul className="text-left text-muted-foreground mb-8 space-y-4 min-h-[160px]">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <FaRegCheckCircle className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={tier.name === 'Free' ? '/partner/auth' : '/contact'}
                className={`mt-auto w-full text-center py-3 px-4 rounded-md text-lg font-semibold transition ${
                  tier.highlight 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                    : 'bg-background text-foreground border border-border hover:bg-muted'
                }`}
              >
                {tier.name === 'Free' ? 'Sign Up' : 'Contact Sales'}
              </Link>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card p-8 rounded-lg border border-border">
            <h3 className="text-2xl font-semibold text-foreground mb-4">Revenue Sharing Model</h3>
            <p className="text-muted-foreground mb-4">
              Our revenue sharing model is designed to maximize your earnings while providing value to your clients:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaRegChartBar className="w-5 h-5 text-primary mr-2 mt-1" />
                <span className="text-muted-foreground">Earn a percentage of referral bonuses for successful card applications.</span>
              </li>
              <li className="flex items-start">
                <FaRegGem className="w-5 h-5 text-primary mr-2 mt-1" />
                <span className="text-muted-foreground">Higher tiers offer increased revenue share percentages.</span>
              </li>
              <li className="flex items-start">
                <FaRegStar className="w-5 h-5 text-primary mr-2 mt-1" />
                <span className="text-muted-foreground">No cost to get started with the Free tier.</span>
              </li>
            </ul>
          </div>

          <div className="bg-card p-8 rounded-lg border border-border">
            <h3 className="text-2xl font-semibold text-foreground mb-4">Partner Benefits</h3>
            <p className="text-muted-foreground mb-4">
              Every plan includes these core benefits to help you succeed:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaRegLightbulb className="w-5 h-5 text-primary mr-2 mt-1" />
                <span className="text-muted-foreground">AI-powered card recommendations</span>
              </li>
              <li className="flex items-start">
                <FaRegUser className="w-5 h-5 text-primary mr-2 mt-1" />
                <span className="text-muted-foreground">Client management tools</span>
              </li>
              <li className="flex items-start">
                <FaRegCheckCircle className="w-5 h-5 text-primary mr-2 mt-1" />
                <span className="text-muted-foreground">Regular platform updates and improvements</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold text-foreground mb-4">Ready to Get Started?</h3>
          <p className="text-muted-foreground mb-8">
            Join our network of successful partners and start generating revenue today.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/contact"
              className="px-8 py-3 bg-primary text-primary-foreground rounded-md text-lg font-semibold hover:bg-primary/90"
            >
              Contact Sales
            </Link>
            <Link
              href="/partner/auth"
              className="px-8 py-3 bg-background text-foreground border border-border rounded-md text-lg font-semibold hover:bg-muted"
            >
              Partner Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 