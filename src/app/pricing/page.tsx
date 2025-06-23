'use client';

import React from 'react';
import Link from 'next/link';
import { FaRegChartBar, FaRegGem, FaRegLightbulb, FaRegCheckCircle, FaRegUser, FaRegStar, FaArrowLeft, FaRocket, FaShieldAlt } from 'react-icons/fa';

export default function PricingPage() {
  const pricingTiers = [
    {
      name: 'Starter',
      price: '$99',
      period: '/month',
      description: 'Perfect for individual advisors and small practices getting started.',
      features: [
        'Up to 500 card recommendations per month',
        'White-Label Platform',
        'Smart AI Card Recommendations',
        'Standard Branding & Customization',
        'Partners keep 100% of referral/affiliate payments',
        'Analytics Dashboard',
        'Email Support',
        'Client management tools'
      ],
      highlight: false,
      buttonText: 'Get Started',
      buttonLink: '/partner/register',
      icon: FaRegUser,
      color: 'blue'
    },
    {
      name: 'Pro',
      price: '$179',
      period: '/month',
      description: 'For growing practices and established financial professionals.',
      features: [
        'Up to 1,000 card recommendations per month',
        'White-Label Platform',
        'Smart AI Card Recommendations',
        'Standard Branding & Customization',
        'Partners keep 100% of referral/affiliate payments',
        'Advanced Analytics & Reporting',
        'Priority Support',
        'Client management tools',
        'Custom integrations available'
      ],
      highlight: true,
      buttonText: 'Get Started',
      buttonLink: '/partner/register',
      icon: FaRocket,
      color: 'green'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For large organizations requiring unlimited scale and dedicated support.',
      features: [
        'Unlimited card recommendations',
        'White-Label Platform',
        'Smart AI Card Recommendations',
        'Advanced Branding & Full Customization',
        'Partners keep 100% of referral/affiliate payments',
        'Enterprise Analytics Suite',
        'Dedicated Account Manager',
        'Custom integrations & API access',
        'Priority technical support',
        'Custom onboarding & training'
      ],
      highlight: false,
      buttonText: 'Book a Demo',
      buttonLink: '/contact',
      icon: FaShieldAlt,
      color: 'purple'
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-green-50 via-blue-50 to-green-50 section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center">
            <Link 
              href="/" 
              className="inline-flex items-center text-green-600 hover:text-green-500 mb-8 font-medium"
            >
              <FaArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Simple, Transparent 
                <span className="text-gradient block mt-2">Pricing</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
                Choose the plan that fits your business. Scale as you grow. Keep 100% of your affiliate earnings.
              </p>
              
              {/* Pricing Toggle - Future feature */}
              <div className="inline-flex items-center p-1 bg-white rounded-xl shadow-sm border border-gray-200">
                <button className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg">
                  Monthly
                </button>
                <button className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                  Annual (Save 20%)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mobile-pricing-stack tablet-pricing-grid">
            {pricingTiers.map((tier, index) => {
              const IconComponent = tier.icon;
              return (
                <div
                  key={index}
                  className={`relative card p-8 flex flex-col transition-all duration-300 hover:shadow-xl ${
                    tier.highlight 
                      ? 'border-2 border-green-200 shadow-lg scale-105 bg-gradient-to-br from-green-50 to-white' 
                      : 'hover:scale-105'
                  }`}
                >
                  {tier.highlight && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-green-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                        Most Popular
                      </div>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
                      tier.color === 'green' ? 'bg-green-100' :
                      tier.color === 'blue' ? 'bg-blue-100' :
                      'bg-purple-100'
                    }`}>
                      <IconComponent className={`text-2xl ${
                        tier.color === 'green' ? 'text-green-600' :
                        tier.color === 'blue' ? 'text-blue-600' :
                        'text-purple-600'
                      }`} />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {tier.name}
                    </h2>
                    <p className="text-gray-600 mb-6">{tier.description}</p>
                    
                    <div className="mb-6">
                      <span className="text-5xl font-bold text-gray-900">{tier.price}</span>
                      <span className="text-gray-600 text-lg ml-1">{tier.period}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="flex-grow mb-8">
                    <ul className="space-y-4">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                            <FaRegCheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-gray-700 leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={tier.buttonLink}
                    className={`w-full text-center py-4 px-6 rounded-xl text-lg font-semibold transition-all duration-200 ${
                      tier.highlight 
                        ? 'btn btn-primary shadow-lg hover:shadow-xl' 
                        : 'btn btn-outline hover:shadow-lg'
                    }`}
                  >
                    {tier.buttonText}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose CardWise?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built for financial professionals who want to maximize value for their clients
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaRegGem className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Keep 100% of Earnings</h3>
              <p className="text-gray-600 leading-relaxed">
                Unlike other platforms, you keep 100% of your affiliate commissions. 
                We make money when you succeed, not by taking a cut of your earnings.
              </p>
            </div>

            <div className="card p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaRegLightbulb className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Intelligence</h3>
              <p className="text-gray-600 leading-relaxed">
                Our advanced AI analyzes spending patterns to deliver personalized 
                recommendations that maximize rewards for your clients.
              </p>
            </div>

            <div className="card p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaRegChartBar className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Complete Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Track client engagement, recommendation success rates, and revenue 
                with comprehensive analytics and reporting tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pricing Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our pricing structure
            </p>
          </div>

          <div className="space-y-6">
            <div className="card p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Do you take a percentage of my affiliate earnings?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                No! Unlike other platforms that take 10-30% of your earnings, you keep 100% of all 
                affiliate commissions. Our revenue comes from your monthly subscription, not your success.
              </p>
            </div>

            <div className="card p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Can I change plans at any time?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and you'll be prorated for any differences in pricing.
              </p>
            </div>

            <div className="card p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                What happens if I exceed my monthly recommendations?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We'll automatically upgrade you to the next tier for that month. You can also upgrade 
                your plan proactively if you anticipate higher usage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-br from-green-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-green-100 mb-8 leading-relaxed">
            Join hundreds of successful partners earning with CardWise. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-green-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Start Free Trial
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 