'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
// Import necessary icons
import { FaPlane, FaUpload, FaPen, FaTrashAlt, FaRegFileAlt, FaCcVisa, FaCcMastercard, FaCcAmex, FaRegChartBar, FaRegLightbulb, FaRegCreditCard, FaRegUser, FaRegGem, FaRegCheckCircle, FaRegFolderOpen, FaRegStar, FaDollarSign, FaChevronDown, FaRegCopy, FaLock } from 'react-icons/fa'
import CardStackGraphic from '@/components/CardStackGraphic'

// Placeholder component for ValuePropositionFlow
const ValuePropositionFlow = () => (
  <section className="w-full py-20 bg-background">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl font-bold tracking-tighter text-foreground sm:text-4xl md:text-5xl">Unlock New Opportunities with CardWise</h2>
      <p className="mt-4 text-xl text-muted-foreground lg:mx-auto md:w-2/3">
        CardWise empowers financial advisors and travel gurus to deliver unparalleled value to their clients while creating new revenue streams.
      </p>
      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="pt-6">
          <div className="flow-root bg-muted/50 rounded-lg px-6 pb-8">
            <div className="-mt-6">
              <div>
                <span className="inline-flex items-center justify-center p-3 bg-green-600 rounded-md shadow-lg">
                  <FaRegLightbulb className="h-6 w-6 text-white" aria-hidden="true" />
                </span>
              </div>
              <h3 className="mt-8 text-lg font-medium text-foreground tracking-tight">Enhanced Client Value</h3>
              <p className="mt-5 text-base text-muted-foreground">
                Provide personalized credit card recommendations tailored to your clients' spending habits, helping them maximize rewards and save money.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <div className="flow-root bg-muted/50 rounded-lg px-6 pb-8">
            <div className="-mt-6">
              <div>
                <span className="inline-flex items-center justify-center p-3 bg-green-600 rounded-md shadow-lg">
                  <FaDollarSign className="h-6 w-6 text-white" aria-hidden="true" />
                </span>
              </div>
              <h3 className="mt-8 text-lg font-medium text-foreground tracking-tight">New Revenue Streams</h3>
              <p className="mt-5 text-base text-muted-foreground">
                Integrate seamlessly with affiliate programs and earn commissions on recommended cards, turning your expertise into a profitable venture.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <div className="flow-root bg-muted/50 rounded-lg px-6 pb-8">
            <div className="-mt-6">
              <div>
                <span className="inline-flex items-center justify-center p-3 bg-green-600 rounded-md shadow-lg">
                  <FaRegGem className="h-6 w-6 text-white" aria-hidden="true" />
                </span>
              </div>
              <h3 className="mt-8 text-lg font-medium text-foreground tracking-tight">Strengthened Client Relationships</h3>
              <p className="mt-5 text-base text-muted-foreground">
                Become an indispensable resource by offering data-driven financial insights and personalized recommendations that build trust and loyalty.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Comparison Component
const ComparisonSection = () => (
  <section className="w-full py-16 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tighter text-foreground sm:text-4xl md:text-5xl">
          CardWise vs. Milesopedia
        </h2>
        <p className="mt-4 text-xl text-muted-foreground">
          See how CardWise empowers your business compared to traditional recommendation sites
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CardWise Column */}
        <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-green-200">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
              <span className="text-white font-bold text-xl">CW</span>
            </div>
            <h3 className="text-2xl font-bold text-green-600">CardWise</h3>
            <p className="text-gray-600">White-Label Partner Platform</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <FaRegCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">Your Brand, Your Revenue</h4>
                <p className="text-gray-600 text-sm">Complete white-label solution with your branding, domain, and affiliate links</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FaRegCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">Personalized Client Experience</h4>
                <p className="text-gray-600 text-sm">Custom portals for each client with tailored recommendations based on their spending</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FaRegCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">Direct Commission Earnings</h4>
                <p className="text-gray-600 text-sm">Earn $50-200 per approved application through your own affiliate partnerships</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FaRegCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">Professional Integration</h4>
                <p className="text-gray-600 text-sm">Seamlessly integrate with your existing advisory services and client workflows</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FaRegCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">Advanced Analytics</h4>
                <p className="text-gray-600 text-sm">Track client engagement, conversion rates, and revenue performance</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FaRegCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">Instant Deployment</h4>
                <p className="text-gray-600 text-sm">Launch your branded portal in under 5 minutes with custom subdomain</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-green-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">$500-2000+</p>
              <p className="text-sm text-gray-600">Monthly Revenue Potential</p>
            </div>
          </div>
        </div>

        {/* Milesopedia Column */}
        <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-500 rounded-full mb-4">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-700">Milesopedia</h3>
            <p className="text-gray-600">Traditional Recommendation Site</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full mt-1 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Generic Public Platform</h4>
                <p className="text-gray-600 text-sm">Sends your clients to their website with their branding and affiliate links</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full mt-1 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-gray-900">One-Size-Fits-All Content</h4>
                <p className="text-gray-600 text-sm">General recommendations not tailored to individual client spending patterns</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full mt-1 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-gray-900">No Direct Revenue</h4>
                <p className="text-gray-600 text-sm">They keep all affiliate commissions - you earn nothing from referrals</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full mt-1 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Competing for Attention</h4>
                <p className="text-gray-600 text-sm">Your clients see other advisors' content and may switch providers</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full mt-1 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Limited Insights</h4>
                <p className="text-gray-600 text-sm">No visibility into client behavior or conversion performance</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full mt-1 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-gray-900">No Control</h4>
                <p className="text-gray-600 text-sm">Cannot customize experience or integrate with your business processes</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">$0</p>
              <p className="text-sm text-gray-600">Revenue for You</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <div className="bg-green-600 text-white p-6 rounded-lg inline-block">
          <h3 className="text-xl font-bold mb-2">Ready to Own Your Revenue Stream?</h3>
          <p className="mb-4">Stop sending clients to competitors. Build your own branded platform today.</p>
          <Link href="/partner/auth" className="bg-white text-green-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors">
            Start Your Portal Now
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero Section - B2B Focused */}
      <section className="w-full py-6 md:py-8 lg:py-12 flex flex-col md:flex-row items-center justify-between">
        <div className="container px-4 md:px-6 text-left md:w-1/2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl leading-none mb-4">
            Empower Your Clients with a White-Label Card Recommendation Platform
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Offer personalized credit card recommendations and financial insights under your own brand. Enhance client relationships and unlock new revenue streams.
          </p>
          <div className="space-x-4">
            <Link href="/about" className="bg-green-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-green-700">
              About Us
            </Link>
            <Link href="/contact" className="text-green-600 border border-green-600 px-6 py-3 rounded-md text-lg font-semibold hover:bg-green-50">Request a Demo</Link>
          </div>
        </div>
        {/* Card Stack Graphic */}
        <div className="md:w-1/2 flex justify-center mt-8 md:mt-0">
          <CardStackGraphic />
        </div>
      </section>

      {/* Value Proposition */}
      <ValuePropositionFlow />

      {/* Comparison Section */}
      <ComparisonSection />

      {/* CTA Section */}
      <section className="w-full py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tighter text-foreground sm:text-4xl md:text-5xl">Ready to Transform Your Advisory Services?</h2>
          <p className="mt-4 text-xl text-muted-foreground lg:mx-auto md:w-2/3">
            Join the growing number of financial professionals and travel experts leveraging CardWise to provide superior client value and drive business growth.
          </p>
          <div className="mt-8 space-x-4">
            <Link href="/contact" className="bg-green-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-green-700 shadow-lg">
              Request a Demo
            </Link>
            <Link href="/partner/auth" className="text-green-600 border border-green-600 px-8 py-3 rounded-md text-lg font-semibold hover:bg-green-50">
              Partner Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
} 