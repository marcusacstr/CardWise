'use client';

import React from 'react';
import { FaRegLightbulb, FaRegChartBar, FaRegCreditCard, FaRegGem, FaRegCheckCircle } from 'react-icons/fa';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-primary/10 to-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About CardWise
            </h1>
            <p className="text-lg text-muted-foreground">
              Revolutionizing how financial advisors and travel experts empower their clients with smarter credit card decisions through a white-label AI platform.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Vision & Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                CardWise envisions a future where maximizing credit card value is simple and accessible for everyone. Our mission is to equip financial advisors and travel professionals with a powerful, white-label platform to deliver unparalleled credit card guidance to their clients.
              </p>
              <p className="text-lg text-muted-foreground">
                We are committed to developing the most accurate, secure, and intuitive AI for analyzing spending habits and personalized credit card recommendations, empowering our partners to deepen client relationships and unlock new revenue streams.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <FaRegLightbulb className="text-primary text-xl" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Empowerment</h3>
                <p className="text-muted-foreground">Giving partners and their clients the tools to make informed financial choices.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <FaRegChartBar className="text-primary text-xl" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Intelligence</h3>
                <p className="text-muted-foreground">Leveraging cutting-edge AI for precise, data-driven recommendations.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <FaRegCreditCard className="text-primary text-xl" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Value Creation</h3>
                <p className="text-muted-foreground">Helping businesses add premium services and unlock new revenue.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <FaRegCheckCircle className="text-primary text-xl" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Seamless Integration</h3>
                <p className="text-muted-foreground">Offering a white-label solution that fits perfectly with your brand.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles/Approach Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Approach</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built on a foundation of technology, trust, and partnership.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-lg border border-border text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FaRegChartBar className="text-primary text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Data Security</h3>
              <p className="text-muted-foreground">
                We prioritize the security and privacy of all data, using robust encryption and compliance measures.
              </p>
            </div>
            <div className="bg-card p-8 rounded-lg border border-border text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FaRegCheckCircle className="text-primary text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Accuracy & Reliability</h3>
              <p className="text-muted-foreground">
                Our AI is continuously refined to provide the most precise and dependable recommendations.
              </p>
            </div>
            <div className="bg-card p-8 rounded-lg border border-border text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FaRegGem className="text-primary text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Partner Focus</h3>
              <p className="text-muted-foreground">
                We are dedicated to supporting our partners with flexible solutions and excellent service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">CardWise vs. Milesopedia</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how CardWise empowers your business compared to traditional recommendation sites like Milesopedia
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* CardWise Column */}
            <div className="bg-card rounded-lg border border-border p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-full mb-4">
                  <span className="text-primary-foreground font-bold text-lg">CW</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">CardWise</h3>
                <p className="text-muted-foreground text-sm">AI-Powered Platform</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <FaRegCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">AI Statement Analysis</h4>
                    <p className="text-muted-foreground text-sm">Upload statements for instant AI-powered spending analysis</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FaRegCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Smart Recommendations</h4>
                    <p className="text-muted-foreground text-sm">Machine learning matches cards to individual spending patterns</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FaRegCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Automated Calculations</h4>
                    <p className="text-muted-foreground text-sm">AI calculates exact rewards potential for each card</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FaRegCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Real-Time Insights</h4>
                    <p className="text-muted-foreground text-sm">Dynamic dashboards with live spending breakdowns</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FaRegCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Continuous Learning</h4>
                    <p className="text-muted-foreground text-sm">System improves recommendations over time</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Traditional Platforms Column */}
            <div className="bg-muted/30 rounded-lg border border-border p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-muted-foreground rounded-full mb-4">
                  <span className="text-muted font-bold text-lg">M</span>
                </div>
                <h3 className="text-xl font-bold text-muted-foreground">Milesopedia</h3>
                <p className="text-muted-foreground text-sm">Traditional Recommendation Site</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 border-2 border-muted-foreground rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-muted-foreground">Manual Research</h4>
                    <p className="text-muted-foreground text-sm">Users must manually research and calculate rewards</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 border-2 border-muted-foreground rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-muted-foreground">No Statement Analysis</h4>
                    <p className="text-muted-foreground text-sm">Cannot analyze spending patterns from statements</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 border-2 border-muted-foreground rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-muted-foreground">Static Lists</h4>
                    <p className="text-muted-foreground text-sm">Same generic recommendations for everyone</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 border-2 border-muted-foreground rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-muted-foreground">Outdated Information</h4>
                    <p className="text-muted-foreground text-sm">Information may not reflect current market conditions</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 border-2 border-muted-foreground rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-muted-foreground">No Learning</h4>
                    <p className="text-muted-foreground text-sm">Static system that never improves</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Request Demo */}
       <section className="w-full bg-primary py-16 flex flex-col items-center text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">Ready to Empower Your Clients?</h2>
        <p className="text-lg text-primary-foreground/90 mb-10 max-w-2xl">Discover how easily you can integrate CardWise into your services and provide unmatched value.</p>
        {/* This button should ideally link to a contact/demo request form */} {/* Temporarily linking to contact page */} 
        <a href="/contact" className="px-8 py-3 rounded-md bg-primary-foreground text-primary font-bold shadow-lg hover:bg-primary-foreground/90 transition text-lg">Request a Demo</a>
      </section>

    </div>
  );
} 