'use client'
import React, { useState } from 'react'
import Link from 'next/link'
// Import necessary icons
import { FaPlane, FaUpload, FaPen, FaTrashAlt, FaRegFileAlt, FaCcVisa, FaCcMastercard, FaCcAmex, FaRegChartBar, FaRegLightbulb, FaRegCreditCard, FaRegUser, FaRegGem, FaRegCheckCircle, FaRegFolderOpen, FaRegStar, FaDollarSign, FaChevronDown, FaRegCopy, FaLock, FaChevronUp, FaQuestionCircle } from 'react-icons/fa'
import CardStackGraphic from '@/components/CardStackGraphic'

// FAQ Item Component
const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-green-200 transition-colors">
      <button
        className="flex w-full text-left items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-gray-900 pr-4">{question}</h3>
        <div className="flex-shrink-0">
          {isOpen ? (
            <FaChevronUp className="w-5 h-5 text-green-600" />
          ) : (
            <FaChevronDown className="w-5 h-5 text-green-600" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

// Partner Portal Mockup Component - Mobile Optimized
const PartnerPortalMockup = () => (
  <div className="w-full mx-auto">
    {/* Browser Bar - Hidden on mobile, shown on desktop */}
    <div className="hidden md:block bg-gray-100 rounded-t-lg p-3 flex items-center gap-2 border border-gray-200">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-400"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div className="w-3 h-3 rounded-full bg-green-400"></div>
      </div>
      <div className="flex-1 bg-white rounded px-4 py-2 text-sm text-gray-500 text-center mx-4">
        acme.cardwise.app/partner-portal
      </div>
    </div>
    
    {/* Main Content - Mobile Optimized */}
    <div className="rounded-xl md:rounded-t-none shadow-2xl bg-white border border-gray-200 overflow-hidden font-sans">
      {/* Header - Mobile Optimized */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
            <FaPlane className="w-3 h-3 md:w-4 md:h-4" />
          </div>
          <span className="font-semibold text-gray-800 text-sm md:text-base">Acme Travel Guru</span>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <button className="text-gray-600 hover:text-green-600 transition-colors p-1">
            <FaRegLightbulb className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button className="text-gray-600 hover:text-green-600 transition-colors p-1">
            <FaRegUser className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-sm">JD</div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* Sidebar - Mobile Optimized */}
        <div className="w-full md:w-16 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 py-3 md:py-4 flex flex-row md:flex-col items-center justify-center md:justify-start gap-4 md:gap-6">
          <button className="text-green-600 p-2">
            <FaRegLightbulb className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button className="text-gray-400 hover:text-green-600 transition-colors p-2">
            <FaRegCreditCard className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button className="text-gray-400 hover:text-green-600 transition-colors p-2">
            <FaRegChartBar className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button className="text-gray-400 hover:text-green-600 transition-colors p-2">
            <FaRegFileAlt className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
        
        {/* Main Content - Mobile Optimized Grid */}
        <div className="flex-1 p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2 md:space-y-3">
            {/* Current Card Section - Mobile Optimized */}
            <div className="bg-white rounded-lg shadow-sm p-3 md:p-4 border border-gray-200">
              <h2 className="text-sm md:text-base font-semibold text-gray-900 mb-3">Your Current Primary Card</h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 p-3 md:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <div className="relative w-16 h-10 md:w-20 md:h-12 flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-r from-gray-400 to-gray-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    BASIC
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base">Basic Cashback Card</h3>
                  <p className="text-sm text-gray-600">Annual Fee: $0</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">1% All Purchases</span>
                  </div>
                </div>
                <div className="text-left sm:text-right flex-shrink-0">
                  <p className="text-sm text-gray-600">YTD Earnings</p>
                  <p className="text-base md:text-lg font-bold text-gray-700">$127.00</p>
                </div>
              </div>
            </div>
            
            {/* Monthly Rewards Comparison Bar Chart - Mobile Optimized */}
            <div className="bg-white rounded-lg shadow-sm p-3 md:p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm md:text-base font-semibold text-gray-900">Monthly Rewards Comparison</h2>
                  <p className="text-xs text-gray-500">Your current card vs. our top recommendation</p>
                </div>
                <div className="text-right text-xs text-gray-500">
                  Last 6 months
                </div>
              </div>
              
              <div className="relative">
                {/* Y-axis labels and chart */}
                <div className="flex">
                  {/* Y-axis */}
                  <div className="flex flex-col justify-between h-32 md:h-40 py-2 pr-2 text-xs text-gray-500">
                    {[80, 60, 40, 20, 0].map(value => (
                      <div key={value} className="flex items-center">
                        <span className="w-6 text-right">${value}</span>
                        <div className="w-1 h-px bg-gray-300 ml-1"></div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Chart area */}
                  <div className="flex-1 relative">
                    {/* Grid lines */}
                    <div className="absolute inset-0">
                      {[0, 25, 50, 75, 100].map(percent => (
                        <div 
                          key={percent}
                          className="absolute w-full border-t border-gray-200"
                          style={{ bottom: `${percent}%` }}
                        ></div>
                      ))}
                    </div>
                    
                    {/* Bars */}
                    <div className="h-32 md:h-40 flex items-end space-x-2 relative z-10">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => {
                        const currentReward = [10, 11, 8, 12, 9, 10][index]; // $10-12 range for basic card
                        const recommendedReward = [42, 45, 38, 48, 41, 46][index]; // $40-48 range for recommended
                        const maxValue = 80; // Scale to $80 max
                        
                        return (
                          <div key={month} className="flex-1 flex flex-col items-center">
                            <div className="w-full flex justify-center items-end space-x-0.5 h-28 md:h-36">
                              <div 
                                className="bg-green-400 rounded-t flex-1 min-h-[2px]" 
                                style={{ height: `${Math.min((currentReward / maxValue) * 100, 100)}%` }}
                                title={`Current: $${currentReward}/month`}
                              ></div>
                              <div 
                                className="bg-green-500 rounded-t flex-1 min-h-[2px]" 
                                style={{ height: `${Math.min((recommendedReward / maxValue) * 100, 100)}%` }}
                                title={`Recommended: $${recommendedReward}/month`}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">{month}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-4 mt-3">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-xs text-gray-600">Recommended Card</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-400 rounded"></div>
                  <span className="text-xs text-gray-600">Current Card</span>
                </div>
              </div>
              
              {/* Summary at bottom */}
              <div className="mt-3 p-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-md border border-green-200">
                <p className="text-xs text-center">
                  <span className="font-semibold text-green-700">+$425/year</span>
                  <span className="text-gray-600"> potential gain with top recommendation</span>
                </p>
              </div>
            </div>
            
            {/* Upload Section - Mobile Optimized */}
            <div className="bg-white rounded-lg shadow-sm p-3 md:p-4 border border-gray-200">
              <h2 className="text-sm md:text-base font-semibold text-gray-900 mb-3">Analyze Your Spending & Unlock Savings</h2>
              <p className="text-sm text-gray-600 mb-3">Upload your credit card statements or manually enter spending to get AI-powered recommendations.</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-green-50 rounded-md p-3 border border-green-200">
                  <p className="text-sm font-medium text-green-700">Estimated Annual Value</p>
                  <p className="text-base md:text-lg font-bold text-green-900">$700.00</p>
                </div>
                <div className="bg-green-50 rounded-md p-3 border border-green-200">
                  <p className="text-sm font-medium text-green-700">Statements Analyzed</p>
                  <p className="text-base md:text-lg font-bold text-green-900">14</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700">
                  <FaUpload className="mr-2 h-4 w-4" />
                  Upload
                </button>
                <button className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                  <FaPen className="mr-2 h-4 w-4" />
                  Manual
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 md:space-y-3">
            {/* Recommendations Section - Mobile Optimized */}
            <div className="bg-white rounded-lg shadow-sm p-2 md:p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <FaRegStar className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
                <h2 className="text-xs md:text-sm font-semibold text-gray-900">AI-Powered Recommendations</h2>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                  <img src="/scotiabank-gold.png" alt="Scotia Gold" className="w-8 h-5 md:w-10 md:h-6 rounded object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">Scotia Gold American Express</p>
                    <p className="text-xs text-gray-600">+$425/year potential</p>
                  </div>
                  <div className="text-xs text-blue-600 font-medium flex-shrink-0">96%</div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-md border border-purple-200">
                  <img src="/rbc-cashback.png" alt="RBC Cashback" className="w-8 h-5 md:w-10 md:h-6 rounded object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">RBC Cashback Preferred</p>
                    <p className="text-xs text-gray-600">+$380/year potential</p>
                  </div>
                  <div className="text-xs text-purple-600 font-medium flex-shrink-0">94%</div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md border border-green-200">
                  <img src="/amex-cobalt.png" alt="Amex Cobalt" className="w-8 h-5 md:w-10 md:h-6 rounded object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">American Express Cobalt</p>
                    <p className="text-xs text-gray-600">+$320/year potential</p>
                  </div>
                  <div className="text-xs text-green-600 font-medium flex-shrink-0">91%</div>
                </div>
              </div>
            </div>
            
            {/* Stats Section - Mobile Optimized */}
            <div className="bg-white rounded-lg shadow-sm p-2 md:p-3 border border-gray-200">
              <h2 className="text-xs md:text-sm font-semibold text-gray-900 mb-2">Your Spending Insights</h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-gray-50 rounded-md">
                  <p className="text-lg md:text-xl font-bold text-gray-900">$2,847</p>
                  <p className="text-xs text-gray-600">Monthly Spend</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-md">
                  <p className="text-lg md:text-xl font-bold text-gray-900">$127</p>
                  <p className="text-xs text-gray-600">YTD Rewards</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer - Mobile Optimized */}
      <div className="px-4 md:px-6 py-3 md:py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500 text-center">
        © 2025 Acme Travel Guru. Powered by CardWise.
      </div>
    </div>
  </div>
);

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center">
      {/* Hero Section with improved spacing and typography */}
      <section className="w-full pt-16 pb-12 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight mb-4 md:mb-6">
                Your Brand.{' '}
                <span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  Smarter Credit Card Recommendations.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Launch your own branded portal where your audience can upload spending data and get AI-powered credit card suggestions — personalized to their habits, and profitable for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
                <Link href="/about" className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-green-600 to-green-700 text-white text-base md:text-lg font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl">
                  About Us
                </Link>
                <Link href="/contact" className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 text-green-600 border-2 border-green-600 text-base md:text-lg font-semibold rounded-xl hover:bg-green-50 transition-all duration-200">
                  Request a Demo
                </Link>
              </div>
            </div>
            <div className="flex justify-center items-center px-4 lg:px-8">
              <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
                <CardStackGraphic />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern ChatGPT Statistic Section */}
      <section className="w-full py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-green-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-green-500/5 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm border border-white/20 rounded-3xl p-8 md:p-12 shadow-xl">
              <div className="text-center">
                <div className="mb-6">
                  <span className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">54%</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  of Americans have used ChatGPT to recommend a financial product
                </h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  The AI revolution in financial advice is here. Give your audience the intelligent tools they're already seeking.
                </p>
                <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Source: Motley Fool Money Survey 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get your branded credit card recommendation portal up and running in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mobile-feature-stack md:mobile-grid-auto tablet-grid-3">
            <div className="text-center mobile-feature-item">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mobile-heading-sm">Brand Your Portal</h3>
              <p className="text-gray-600">
                Customize your white-label credit card tool in minutes — no code needed.
              </p>
            </div>
            
            <div className="text-center mobile-feature-item">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUpload className="text-xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mobile-heading-sm">Let Users Upload Their Spending</h3>
              <p className="text-gray-600">
                They can securely upload statements or enter spending habits manually.
              </p>
            </div>
            
            <div className="text-center mobile-feature-item">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaDollarSign className="text-xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mobile-heading-sm">Recommend Cards — and Earn</h3>
              <p className="text-gray-600">
                Our AI analyzes their spend and recommends the best cards. You earn affiliate revenue from every signup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Client Experience Section with improved styling */}
      <section className="w-full py-16 md:py-20 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">Your Clients Experience</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A beautiful, intuitive interface for your clients to manage their cards and get personalized recommendations
            </p>
          </div>
          
          {/* Mobile-First Mockup Container */}
          <div className="w-full flex justify-center">
            <div className="w-full max-w-sm sm:max-w-md md:max-w-4xl lg:max-w-6xl">
              <PartnerPortalMockup />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">Frequently Asked Questions</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Everything you need to know about CardWise and our partner program
            </p>
          </div>
          
          <div className="space-y-4 md:space-y-6">
            <FAQItem 
              question="How does the CardWise platform work?"
              answer="CardWise provides a white-label credit card recommendation platform. Your clients upload their spending data or enter it manually, and our AI analyzes their habits to recommend the best credit cards for maximizing rewards. You earn affiliate commissions on successful applications."
            />
            
            <FAQItem 
              question="What's included in each pricing tier?"
              answer="Starter ($99/month) includes up to 100 card recommendations per month with basic customization. Pro ($179/month) includes up to 500 recommendations with advanced features. Enterprise offers unlimited recommendations with full customization and dedicated support."
            />
            
            <FAQItem 
              question="How much can I earn with CardWise?"
              answer="Earnings vary based on your client volume and the cards they apply for. Our partners typically earn $50-200 per successful card application. With our Pro plan allowing 500 recommendations per month, top partners generate $5,000-15,000 in monthly affiliate revenue."
            />
            
            <FAQItem 
              question="What data does CardWise collect?"
              answer="CardWise only analyzes transaction amounts and spending categories to provide recommendations. We never save, store, or sell personal information, account numbers, or sensitive financial data. All analysis happens in real-time with complete privacy protection."
            />
            
            <FAQItem 
              question="How long does setup take?"
              answer="Most partners are up and running within 24-48 hours. Our team handles the technical setup while you focus on customizing your branding and preparing your client outreach."
            />
            
            <FAQItem 
              question="Can I customize the platform for my brand?"
              answer="Yes! All paid plans include white-label customization. You can add your logo, colors, domain name, and messaging. Pro and Enterprise plans offer advanced customization options including custom workflows and integrations."
            />
          </div>
        </div>
      </section>

      {/* Unlock New Revenue Opportunities Section */}
      <section className="w-full py-12 md:py-16 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-4 md:mb-6">
              Unlock New Revenue Opportunities
            </h2>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              CardWise empowers financial advisors and travel professionals to deliver exceptional value while creating sustainable revenue streams.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group">
              <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 md:p-8 h-full border border-gray-100 hover:border-green-200">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <FaRegLightbulb className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="pt-8">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Enhanced Client Value</h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    Provide personalized credit card recommendations tailored to your clients' spending habits, helping them maximize rewards and save money.
                  </p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 md:p-8 h-full border border-gray-100 hover:border-green-200">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <FaDollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="pt-8">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">New Revenue Streams</h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    Integrate seamlessly with affiliate programs and earn commissions on recommended cards, turning your expertise into profitable ventures.
                  </p>
                </div>
              </div>
            </div>

            <div className="group sm:col-span-2 lg:col-span-1">
              <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 md:p-8 h-full border border-gray-100 hover:border-green-200">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <FaRegGem className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="pt-8">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Strengthened Relationships</h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    Become an indispensable resource by offering data-driven insights and personalized recommendations that build lasting trust.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Minimal Footer */}
      <section className="w-full py-4 bg-green-600 text-white">
        <div className="max-w-2xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-base md:text-lg font-bold mb-1">Ready to Transform Your Business? TEST</h2>
          <p className="text-xs md:text-sm mb-3 leading-relaxed max-w-md mx-auto">Join forward-thinking financial professionals who are already earning with CardWise</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
            <Link href="/contact" className="bg-white text-green-600 px-4 py-1.5 rounded text-xs md:text-sm font-semibold hover:bg-gray-100 transition-colors shadow min-w-[120px]">
              Request a Demo
            </Link>
            <Link href="/pricing" className="border border-white text-white px-4 py-1.5 rounded text-xs md:text-sm font-semibold hover:bg-white hover:text-green-600 transition-colors min-w-[120px]">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}