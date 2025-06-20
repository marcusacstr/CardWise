'use client'
import React from 'react'
import Link from 'next/link'
// Import necessary icons
import { FaUpload, FaDollarSign } from 'react-icons/fa'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Your Brand.{' '}
            <span className="text-green-600">Smarter Credit Card Recommendations.</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Launch your own branded portal where your audience can upload spending data and get AI-powered credit card suggestions — personalized to their habits, and profitable for you.
          </p>
          
          <div className="mt-10 sm:flex sm:justify-center">
            <div className="rounded-md shadow">
              <a
                href="/dashboard"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10"
              >
                Get Started
              </a>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <a
                href="/partner"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 md:py-4 md:text-lg md:px-10"
              >
                Partner Portal
              </a>
            </div>
          </div>

          {/* Impactful Statistic */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">26%</div>
              <p className="text-lg text-gray-700 font-medium">
                of Americans Have Used ChatGPT for Credit Card Recommendations
              </p>
              <p className="text-sm text-gray-500 mt-2">
                The AI revolution in financial advice is here. Give your audience the tools they want.
              </p>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">How It Works</h2>
            <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Get your branded credit card recommendation portal up and running in three simple steps
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
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
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUpload className="text-xl text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Let Users Upload Their Spending</h3>
                <p className="text-gray-600">
                  They can securely upload statements or enter spending habits manually.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaDollarSign className="text-xl text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Recommend Cards — and Earn</h3>
                <p className="text-gray-600">
                  Our AI analyzes their spend and recommends the best cards. You earn affiliate revenue from every signup.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Recommendations</h3>
                <p className="text-gray-600">Get personalized credit card recommendations based on spending habits.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Partner Portal</h3>
                <p className="text-gray-600">White-labeled solution for financial advisors and influencers.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">CSV Analysis</h3>
                <p className="text-gray-600">Upload credit card statements for detailed spending analysis.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
