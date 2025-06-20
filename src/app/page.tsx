'use client'
import React from 'react'
import Link from 'next/link'
// Import necessary icons
import { FaPlane, FaUpload, FaPen, FaTrashAlt, FaRegFileAlt, FaCcVisa, FaCcMastercard, FaCcAmex, FaRegChartBar, FaRegLightbulb, FaRegCreditCard, FaRegUser, FaRegGem, FaRegCheckCircle, FaRegFolderOpen, FaRegStar, FaDollarSign, FaChevronDown, FaRegCopy, FaLock } from 'react-icons/fa'
import CardStackGraphic from '@/components/CardStackGraphic'

// ValuePropositionFlow component
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

// Partner Portal Mockup Component
const PartnerPortalMockup = () => (
  <div className="w-full max-w-6xl mx-auto">
    <div className="bg-gray-100 rounded-t-lg p-2 flex items-center gap-2 border border-gray-200">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-400"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div className="w-3 h-3 rounded-full bg-green-400"></div>
      </div>
      <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-500 text-center mx-4">
        acme.cardwise.app/partner-portal
      </div>
    </div>
    <div className="rounded-lg shadow-2xl bg-white border border-gray-200 overflow-hidden font-sans transform hover:scale-[1.02] transition-transform duration-300">
      <div className="flex items-center justify-between px-6 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-xs">
            <FaPlane className="w-3 h-3" />
          </div>
          <span className="font-semibold text-gray-800 text-sm">Acme Travel Guru</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-gray-600 hover:text-green-600 transition-colors">
            <FaRegLightbulb className="w-4 h-4" />
          </button>
          <button className="text-gray-600 hover:text-green-600 transition-colors">
            <FaRegUser className="w-4 h-4" />
          </button>
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-xs">JD</div>
        </div>
      </div>
      
      <div className="flex">
        <div className="w-12 bg-gray-50 border-r border-gray-200 py-3 flex flex-col items-center gap-4">
          <button className="text-green-600">
            <FaRegLightbulb className="w-4 h-4" />
          </button>
          <button className="text-gray-400 hover:text-green-600 transition-colors">
            <FaRegCreditCard className="w-4 h-4" />
          </button>
          <button className="text-gray-400 hover:text-green-600 transition-colors">
            <FaRegChartBar className="w-4 h-4" />
          </button>
          <button className="text-gray-400 hover:text-green-600 transition-colors">
            <FaRegFileAlt className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 p-3 grid grid-cols-2 gap-3">
          <div className="space-y-3">
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Your Current Primary Card</h2>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-100">
                <div className="relative w-20 h-12">
                  <div className="w-full h-full bg-gradient-to-r from-green-600 to-green-700 rounded flex items-center justify-center text-white text-xs font-bold">CARD</div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-xs">Premium Travel World Elite</h3>
                  <p className="text-xs text-gray-600">Annual Fee: $149</p>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="px-1 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">3x Travel</span>
                    <span className="px-1 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">2x Dining</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">YTD Earnings</p>
                  <p className="text-sm font-bold text-green-900">$275.00</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Analyze Your Spending & Unlock Savings</h2>
              <p className="text-xs text-gray-600 mb-2">Upload your credit card statements or manually enter spending to get AI-powered recommendations.</p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-green-50 rounded-md p-2 border border-green-200">
                  <p className="text-xs font-medium text-green-700">Estimated Annual Value</p>
                  <p className="text-sm font-bold text-green-900">$700.00</p>
                </div>
                <div className="bg-green-50 rounded-md p-2 border border-green-200">
                  <p className="text-xs font-medium text-green-700">Statements Analyzed</p>
                  <p className="text-sm font-bold text-green-900">14</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 inline-flex items-center justify-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                  <FaUpload className="mr-1 h-3 w-3" />
                  Upload
                </button>
                <button className="flex-1 inline-flex items-center justify-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <FaPen className="mr-1 h-3 w-3" />
                  Manual
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <FaRegStar className="text-orange-400 w-3 h-3" />
                <h2 className="text-sm font-semibold text-gray-900">AI-Powered Recommendations</h2>
              </div>
              <p className="text-xs text-gray-600 mb-2">Top credit cards based on your spending analysis.</p>
              <div className="space-y-2">
                <div className="flex items-center bg-gray-50 rounded-md p-2 border border-gray-200">
                  <div className="w-12 h-8 mr-2 bg-gradient-to-r from-green-500 to-green-600 rounded flex items-center justify-center text-white text-xs font-bold">CB</div>
                  <div className="flex-grow">
                    <p className="font-medium text-xs text-gray-900">Cashback Plus Signature</p>
                    <p className="text-xs text-gray-600">Annual Value: $650.00</p>
                  </div>
                  <button className="px-2 py-1 border border-gray-300 rounded text-xs text-gray-700 bg-white hover:bg-gray-50">View</button>
                </div>
                <div className="flex items-center bg-gray-50 rounded-md p-2 border border-gray-200">
                  <div className="w-12 h-8 mr-2 bg-gradient-to-r from-green-500 to-green-600 rounded flex items-center justify-center text-white text-xs font-bold">LR</div>
                  <div className="flex-grow">
                    <p className="font-medium text-xs text-gray-900">Lifestyle Rewards Platinum</p>
                    <p className="text-xs text-gray-600">Annual Value: $550.00</p>
                  </div>
                  <button className="px-2 py-1 border border-gray-300 rounded text-xs text-gray-700 bg-white hover:bg-gray-50">View</button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Monthly Rewards Comparison</h2>
              <div className="flex items-end h-24 gap-1 mb-2">
                <div className="flex flex-col justify-end h-full flex-1 gap-0.5">
                  <div className="w-full bg-green-600 rounded-t" style={{height: '30%'}}></div>
                  <div className="w-full bg-green-400 rounded-t" style={{height: '10%'}}></div>
                </div>
                <div className="flex flex-col justify-end h-full flex-1 gap-0.5">
                  <div className="w-full bg-green-600 rounded-t" style={{height: '40%'}}></div>
                  <div className="w-full bg-green-400 rounded-t" style={{height: '15%'}}></div>
                </div>
                <div className="flex flex-col justify-end h-full flex-1 gap-0.5">
                  <div className="w-full bg-green-600 rounded-t" style={{height: '50%'}}></div>
                  <div className="w-full bg-green-400 rounded-t" style={{height: '20%'}}></div>
                </div>
                <div className="flex flex-col justify-end h-full flex-1 gap-0.5">
                  <div className="w-full bg-green-600 rounded-t" style={{height: '60%'}}></div>
                  <div className="w-full bg-green-400 rounded-t" style={{height: '25%'}}></div>
                </div>
                <div className="flex flex-col justify-end h-full flex-1 gap-0.5">
                  <div className="w-full bg-green-600 rounded-t" style={{height: '70%'}}></div>
                  <div className="w-full bg-green-400 rounded-t" style={{height: '30%'}}></div>
                </div>
                <div className="flex flex-col justify-end h-full flex-1 gap-0.5">
                  <div className="w-full bg-green-600 rounded-t" style={{height: '80%'}}></div>
                  <div className="w-full bg-green-400 rounded-t" style={{height: '35%'}}></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <span className="block w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="block w-2 h-2 bg-green-600 rounded-full"></span>
                  <span>Potential</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
        © 2025 Acme Travel Guru. Powered by CardWise.
      </div>
    </div>
  </div>
);

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center">
      {/* Hero Section with NEW branding */}
      <section className="w-full py-6 md:py-8 lg:py-12 flex flex-col md:flex-row items-center justify-between">
        <div className="container px-4 md:px-6 text-left md:w-1/2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl leading-none mb-4">
            Your Brand.{' '}
            <span className="text-green-600">Smarter Credit Card Recommendations.</span>
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Launch your own branded portal where your audience can upload spending data and get AI-powered credit card suggestions — personalized to their habits, and profitable for you.
          </p>
          <div className="space-x-4">
            <Link href="/about" className="bg-green-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-green-700">
              About Us
            </Link>
            <Link href="/contact" className="text-green-600 border border-green-600 px-6 py-3 rounded-md text-lg font-semibold hover:bg-green-50">Request a Demo</Link>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center mt-8 md:mt-0">
          <CardStackGraphic />
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Brand Your Portal</h3>
              <p className="text-gray-600">
                Customize your white-label credit card tool in minutes — no code needed.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUpload className="text-xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Let Users Upload Their Spending</h3>
              <p className="text-gray-600">
                They can securely upload statements or enter spending habits manually.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaDollarSign className="text-xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Recommend Cards — and Earn</h3>
              <p className="text-gray-600">
                Our AI analyzes their spend and recommends the best cards. You earn affiliate revenue from every signup.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ValuePropositionFlow />

      <section className="w-full bg-muted/50 py-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Your Clients Experience</h2>
            <p className="mt-4 text-xl text-muted-foreground">A beautiful, intuitive interface for your clients to manage their cards and get personalized recommendations</p>
          </div>
          <div className="mt-8 flex justify-center">
            <div className="transform scale-90 origin-top">
              <PartnerPortalMockup />
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-16 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl mb-8">Join forward-thinking financial professionals who are already earning with CardWise</p>
          <div className="space-x-4">
            <Link href="/contact" className="bg-white text-green-600 px-8 py-4 rounded-md text-lg font-semibold hover:bg-gray-100 transition-colors">
              Request a Demo
            </Link>
            <Link href="/pricing" className="border-2 border-white text-white px-8 py-4 rounded-md text-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
