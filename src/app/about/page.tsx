'use client';

import React from 'react';
import { FaRegLightbulb, FaRegChartBar, FaRegCreditCard, FaRegGem, FaRegCheckCircle, FaArrowLeft, FaUsers, FaShieldAlt, FaRocket } from 'react-icons/fa';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
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
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
                Revolutionizing Credit Card 
                <span className="text-gradient block mt-2">Intelligence</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                CardWise empowers financial advisors and travel experts with AI-driven insights 
                to deliver exceptional value through personalized credit card recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Our Vision & Mission
                </h2>
                <div className="space-y-6">
                  <p className="text-lg text-gray-600 leading-relaxed">
                    CardWise envisions a future where maximizing credit card value is simple and accessible for everyone. 
                    Our mission is to equip financial advisors and travel professionals with a powerful, white-label 
                    platform to deliver unparalleled credit card guidance to their clients.
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    We are committed to developing the most accurate, secure, and intuitive AI for analyzing spending 
                    habits and personalized credit card recommendations, empowering our partners to deepen client 
                    relationships and unlock new revenue streams.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-6 bg-green-50 rounded-2xl border border-green-100">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaRocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Growing Fast</h3>
                  <p className="text-gray-600 text-sm">Over 500+ partners trust CardWise to power their recommendations</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="card p-6 text-center animate-slide-up">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaRegLightbulb className="text-green-600 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Innovation</h3>
                <p className="text-gray-600 text-sm">Cutting-edge AI technology for precise recommendations</p>
              </div>

              <div className="card p-6 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaRegChartBar className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Intelligence</h3>
                <p className="text-gray-600 text-sm">Data-driven insights for optimal card selection</p>
              </div>

              <div className="card p-6 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaUsers className="text-purple-600 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Partnership</h3>
                <p className="text-gray-600 text-sm">White-label solutions that grow with your business</p>
              </div>

              <div className="card p-6 text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaShieldAlt className="text-orange-600 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Security</h3>
                <p className="text-gray-600 text-sm">Bank-level security for all data and transactions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles Section */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Principles
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Built on a foundation of technology, trust, and partnership excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaShieldAlt className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Security</h3>
              <p className="text-gray-600 leading-relaxed">
                We prioritize the security and privacy of all data, using robust encryption 
                and compliance measures that exceed industry standards.
              </p>
            </div>

            <div className="card p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaRegCheckCircle className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Accuracy & Reliability</h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI is continuously refined through machine learning to provide the most 
                precise and dependable recommendations in the industry.
              </p>
            </div>

            <div className="card p-8 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaRegGem className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Partner Success</h3>
              <p className="text-gray-600 leading-relaxed">
                We are dedicated to supporting our partners with flexible solutions, 
                comprehensive analytics, and exceptional customer service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              CardWise vs. Traditional Platforms
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              See how CardWise empowers your business compared to traditional recommendation sites
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* CardWise Column */}
            <div className="card p-8 lg:p-10 border-2 border-green-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-green-500 text-white px-6 py-2 text-sm font-semibold">
                Recommended
              </div>
              
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl mb-4">
                  <span className="text-white font-bold text-2xl">CW</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">CardWise</h3>
                <p className="text-green-600 font-medium">AI-Powered Platform</p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: "AI Statement Analysis",
                    description: "Upload statements for instant AI-powered spending analysis"
                  },
                  {
                    title: "Smart Recommendations", 
                    description: "Machine learning matches cards to individual spending patterns"
                  },
                  {
                    title: "Automated Calculations",
                    description: "AI calculates exact rewards potential for each card"
                  },
                  {
                    title: "Real-Time Insights",
                    description: "Dynamic dashboards with live spending breakdowns"
                  },
                  {
                    title: "White-Label Solution",
                    description: "Fully customizable platform with your branding"
                  },
                  {
                    title: "Partner Revenue",
                    description: "Earn commissions on every successful card application"
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FaRegCheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Traditional Platforms Column */}
            <div className="card p-8 lg:p-10 bg-gray-50 border border-gray-200">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-400 rounded-2xl mb-4">
                  <span className="text-white font-bold text-2xl">TP</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-700">Traditional Platforms</h3>
                <p className="text-gray-500 font-medium">Manual Research Required</p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: "Manual Research",
                    description: "Users must manually research and calculate rewards"
                  },
                  {
                    title: "No Statement Analysis",
                    description: "Cannot analyze spending patterns from statements"
                  },
                  {
                    title: "Generic Recommendations",
                    description: "One-size-fits-all suggestions without personalization"
                  },
                  {
                    title: "Static Information",
                    description: "Outdated card details and limited insights"
                  },
                  {
                    title: "No Customization",
                    description: "Cannot brand or customize the experience"
                  },
                  {
                    title: "Limited Monetization",
                    description: "Minimal revenue opportunities for partners"
                  }
                ].map((limitation, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 border-2 border-gray-400 rounded-full flex-shrink-0 mt-0.5"></div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">{limitation.title}</h4>
                      <p className="text-gray-500 text-sm">{limitation.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-gradient-to-br from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Join hundreds of partners already earning with CardWise
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-green-100">Active Partners</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">50K+</div>
              <div className="text-green-100">Recommendations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">$2M+</div>
              <div className="text-green-100">Partner Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
              <div className="text-green-100">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Join the revolution in credit card recommendations and start earning with CardWise today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="btn btn-primary text-lg px-8 py-4"
            >
              Request a Demo
            </Link>
            <Link
              href="/pricing"
              className="btn btn-outline text-lg px-8 py-4"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 