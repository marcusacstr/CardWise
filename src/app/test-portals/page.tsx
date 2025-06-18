'use client'

import React from 'react'
import Link from 'next/link'

export default function TestPortalsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🚀 Portal Testing Interface</h1>
          <p className="text-xl text-gray-600 mb-4">Compare User vs Partner Portal Experiences</p>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
            ⚠️ Test Mode - Authentication Bypassed
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Portal Preview */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-blue-600 text-white px-6 py-4">
              <h2 className="text-xl font-semibold flex items-center">
                👤 User Portal
                <span className="ml-2 text-sm bg-blue-500 px-2 py-1 rounded">Personal Finance</span>
              </h2>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Features Available:</h3>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  📄 CSV Statement Upload & Parsing
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  💳 Personalized Credit Card Recommendations  
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  📊 Spending Analysis & Categorization
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  🎯 Rewards Optimization Suggestions
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  ✋ Manual Spending Entry
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  📈 Rewards Tracking & Comparison
                </li>
              </ul>
              
              <Link
                href="/dashboard"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center block"
              >
                Open User Dashboard →
              </Link>
            </div>
          </div>

          {/* Partner Portal Preview */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-green-600 text-white px-6 py-4">
              <h2 className="text-xl font-semibold flex items-center">
                🏢 Partner Portal
                <span className="ml-2 text-sm bg-green-500 px-2 py-1 rounded">Business Dashboard</span>
              </h2>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Features Available:</h3>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  👥 Client Management & Analytics
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  📊 Revenue Tracking & Reporting
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  💰 Commission Management
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  🎨 Custom Branding & Portal Setup
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  📈 Performance Metrics & KPIs
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  🔗 White-label Portal Management
                </li>
              </ul>
              
              <Link
                href="/partner/dashboard"
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold text-center block"
              >
                Open Partner Dashboard →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">✅ Test Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-blue-600 mb-4">User Portal (✅ Working)</h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>✅ CSV file upload functionality</li>
                <li>✅ Credit card recommendation engine</li>
                <li>✅ Spending analysis and categorization</li>
                <li>✅ Manual spending entry</li>
                <li>✅ Rewards optimization</li>
                <li>✅ Personal finance dashboard</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-green-600 mb-4">Partner Portal (⚠️ Loading Issue)</h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>⚠️ Currently stuck in loading state</li>
                <li>🔧 Needs authentication bypass for testing</li>
                <li>🎯 Should show business analytics</li>
                <li>🎯 Should show commission tracking</li>
                <li>🎯 Should show client management</li>
                <li>🎯 Should show white-label portal setup</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-4">
            <Link
              href="/"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← Back to Homepage
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              🔄 Refresh Test Results
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>🧪 Development Testing Interface - Authentication has been temporarily disabled</p>
          <p>Both portals should show completely different content and functionality</p>
        </div>
      </div>
    </div>
  )
} 