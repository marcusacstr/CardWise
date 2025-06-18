'use client'
import React from 'react'
import { FaCreditCard, FaStar, FaChartBar, FaFileAlt, FaHome, FaBell, FaCog, FaPlane } from 'react-icons/fa'
import { MdOutlineFileUpload, MdOutlineManageAccounts } from 'react-icons/md'
import Image from 'next/image'

export default function PartnerPortalMockup() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Browser Frame */}
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

      {/* Main Content */}
      <div className="rounded-lg shadow-2xl bg-white border border-gray-200 overflow-hidden font-sans transform hover:scale-[1.02] transition-transform duration-300">
        {/* Top Navigation */}
        <div className="flex items-center justify-between px-6 py-2 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-xs">
              <FaPlane className="w-3 h-3" />
            </div>
            <span className="font-semibold text-gray-800 text-sm">Acme Travel Guru</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-gray-600 hover:text-green-600 transition-colors">
              <FaBell className="w-4 h-4" />
            </button>
            <button className="text-gray-600 hover:text-green-600 transition-colors">
              <FaCog className="w-4 h-4" />
            </button>
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-xs">JD</div>
          </div>
        </div>

        {/* Side Navigation */}
        <div className="flex">
          <div className="w-12 bg-gray-50 border-r border-gray-200 py-3 flex flex-col items-center gap-4">
            <button className="text-green-600">
              <FaHome className="w-4 h-4" />
            </button>
            <button className="text-gray-400 hover:text-green-600 transition-colors">
              <FaCreditCard className="w-4 h-4" />
            </button>
            <button className="text-gray-400 hover:text-green-600 transition-colors">
              <FaChartBar className="w-4 h-4" />
            </button>
            <button className="text-gray-400 hover:text-green-600 transition-colors">
              <FaFileAlt className="w-4 h-4" />
            </button>
          </div>

          {/* Main Content Area - Grid Layout */}
          <div className="flex-1 p-3 grid grid-cols-2 gap-3">
            {/* Left Column */}
            <div className="space-y-3">
              {/* Current Card Section */}
              <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">Your Current Primary Card</h2>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-100">
                  <div className="relative w-20 h-12">
                    <div className="w-full h-full bg-gradient-to-r from-green-600 to-green-700 rounded flex items-center justify-center text-white text-xs font-bold">
                      CARD
                    </div>
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

              {/* Estimated Savings Section */}
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
                    <MdOutlineFileUpload className="mr-1 h-3 w-3" />
                    Upload
                  </button>
                  <button className="flex-1 inline-flex items-center justify-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <MdOutlineManageAccounts className="mr-1 h-3 w-3" />
                    Manual
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              {/* Top Recommendations */}
              <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaStar className="text-orange-400 w-3 h-3" />
                  <h2 className="text-sm font-semibold text-gray-900">AI-Powered Recommendations</h2>
                </div>
                <p className="text-xs text-gray-600 mb-2">Top credit cards based on your spending analysis.</p>
                
                <div className="space-y-2">
                  <div className="flex items-center bg-gray-50 rounded-md p-2 border border-gray-200">
                    <div className="w-12 h-8 mr-2 bg-gradient-to-r from-green-500 to-green-600 rounded flex items-center justify-center text-white text-xs font-bold">
                      CB
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium text-xs text-gray-900">Cashback Plus Signature</p>
                      <p className="text-xs text-gray-600">Annual Value: $650.00</p>
                    </div>
                    <button className="px-2 py-1 border border-gray-300 rounded text-xs text-gray-700 bg-white hover:bg-gray-50">View</button>
                  </div>

                  <div className="flex items-center bg-gray-50 rounded-md p-2 border border-gray-200">
                    <div className="w-12 h-8 mr-2 bg-gradient-to-r from-green-500 to-green-600 rounded flex items-center justify-center text-white text-xs font-bold">
                      LR
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium text-xs text-gray-900">Lifestyle Rewards Platinum</p>
                      <p className="text-xs text-gray-600">Annual Value: $550.00</p>
                    </div>
                    <button className="px-2 py-1 border border-gray-300 rounded text-xs text-gray-700 bg-white hover:bg-gray-50">View</button>
                  </div>
                </div>
              </div>

              {/* Monthly Earnings Comparison */}
              <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">Monthly Rewards Comparison</h2>
                <div className="flex items-end h-24 gap-1 mb-2">
                  {[ [10, 30], [15, 40], [20, 50], [25, 60], [30, 70], [35, 80] ].map(([current, potential], index) => (
                    <div key={index} className="flex flex-col justify-end h-full flex-1 gap-0.5">
                      <div
                        className="w-full bg-green-600 rounded-t"
                        style={{ height: `${potential / 100 * 100}%` }}
                      ></div>
                      <div
                        className="w-full bg-green-400 rounded-t"
                        style={{ height: `${current / 100 * 100}%` }}
                      ></div>
                    </div>
                  ))}
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

        {/* Footer */}
        <div className="px-6 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
          © 2025 Acme Travel Guru. Powered by CardWise.
        </div>
      </div>
    </div>
  )
}
