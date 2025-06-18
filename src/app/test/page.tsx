'use client'

import React from 'react'
import Link from 'next/link'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🚀 CardWise Portal Testing</h1>
          <p className="text-xl text-gray-600 mb-4">Test both User and Partner portals side by side</p>
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-yellow-100 text-yellow-800 border border-yellow-300">
            ⚠️ Development Test Mode - Authentication Bypassed
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* User Portal Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-blue-600 text-white px-6 py-4">
              <h2 className="text-2xl font-semibold flex items-center">
                👤 User Portal
                <span className="ml-3 text-sm bg-blue-500 px-3 py-1 rounded-full">Personal Finance</span>
              </h2>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">✨ Features You Built:</h3>
              <ul className="space-y-3 text-gray-700 mb-6 text-sm">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  📄 CSV Statement Upload & Smart Parsing
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  🤖 AI-Powered Credit Card Recommendations  
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  📊 Advanced Spending Analysis & Categorization
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  🎯 Rewards Optimization Engine
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  ✋ Manual Spending Entry & Analysis
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  📈 Real-time Rewards Tracking & Comparison
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  💾 Persistent User Session Management
                </li>
              </ul>
              
              <Link
                href="/dashboard"
                className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center block text-lg"
              >
                🚀 Test User Dashboard →
              </Link>
            </div>
          </div>

          {/* Partner Portal Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-green-600 text-white px-6 py-4">
              <h2 className="text-2xl font-semibold flex items-center">
                🏢 Partner Portal
                <span className="ml-3 text-sm bg-green-500 px-3 py-1 rounded-full">Business Dashboard</span>
              </h2>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Business Features:</h3>
              <ul className="space-y-3 text-gray-700 mb-6 text-sm">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  👥 Client Management & User Analytics
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  📊 Revenue Tracking & Commission Reports
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  💰 Affiliate Link Management
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  🎨 Custom Branding & White-label Setup
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  📈 Performance Metrics & KPI Dashboard
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  🔗 Portal URL Management
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  ⚙️ Card Portfolio Management
                </li>
              </ul>
              
              <Link
                href="/partner/dashboard"
                className="w-full bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold text-center block text-lg"
              >
                🏢 Test Partner Dashboard →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">🔧 Quick Test Actions</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/dashboard"
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center hover:bg-blue-100 transition-colors"
            >
              <div className="text-2xl mb-2">📄</div>
              <div className="text-sm font-medium text-blue-700">Test CSV Upload</div>
            </Link>
            
            <Link
              href="/dashboard"
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center hover:bg-blue-100 transition-colors"
            >
              <div className="text-2xl mb-2">💳</div>
              <div className="text-sm font-medium text-blue-700">Card Recommendations</div>
            </Link>
            
            <Link
              href="/partner/dashboard"
              className="p-4 bg-green-50 border border-green-200 rounded-lg text-center hover:bg-green-100 transition-colors"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium text-green-700">Business Analytics</div>
            </Link>
            
            <Link
              href="/partner/dashboard"
              className="p-4 bg-green-50 border border-green-200 rounded-lg text-center hover:bg-green-100 transition-colors"
            >
              <div className="text-2xl mb-2">💰</div>
              <div className="text-sm font-medium text-green-700">Revenue Tracking</div>
            </Link>
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
              onClick={() => {
                window.location.reload()
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              🔄 Refresh Test Page
            </button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">🔍 What You Should See:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>User Portal:</strong> Full personal finance dashboard with CSV upload, card recommendations, spending analysis</p>
            <p><strong>Partner Portal:</strong> Business dashboard with client management, revenue tracking, commission analytics</p>
            <p><strong>Key Difference:</strong> User portal = personal tools, Partner portal = business management tools</p>
          </div>
        </div>
      </div>
    </div>
  )
} 