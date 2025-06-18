import React from 'react'
import { FaUserPlus, FaChartBar, FaChartLine, FaPalette, FaCreditCard, FaUsers, FaDollarSign, FaCog, FaFileAlt } from 'react-icons/fa'

export default function PartnerDashboardMockup() {
  return (
    <div className="w-full max-w-screen-lg mx-auto rounded-2xl shadow-2xl bg-white/95 border border-gray-200 overflow-hidden my-12">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Example Client Dashboard View</h2>
        <p className="text-gray-500 text-sm">This is a simulated view of what your clients see, branded with your company's details.</p>
      </div>
      {/* Key Stats */}
      <div className="px-8 py-6 border-b border-gray-100 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center text-center">
          <span className="flex items-center justify-center gap-2 text-indigo-700 font-semibold text-lg"><FaChartLine /> Potential Rewards Gap</span>
          <span className="text-2xl font-bold text-gray-900 mt-2">$850/year</span>
          <span className="text-xs text-gray-400 mt-1">Estimated rewards you're missing with your current card setup.</span>
        </div>
        <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center text-center">
          <span className="flex items-center justify-center gap-2 text-indigo-700 font-semibold text-lg"><FaChartBar /> Spending Analysis Run</span>
          <span className="text-2xl font-bold text-gray-900 mt-2">Last Run: 2 weeks ago</span>
          <span className="text-xs text-gray-400 mt-1">Upload a new statement for updated recommendations.</span>
        </div>
        <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center text-center">
          <span className="flex items-center justify-center gap-2 text-indigo-700 font-semibold text-lg"><FaCreditCard /> Recommended Cards</span>
          <span className="text-2xl font-bold text-gray-900 mt-2">3 New Offers</span>
          <span className="text-xs text-gray-400 mt-1">Explore cards better suited to your spending habits.</span>
        </div>
      </div>

      {/* Current Primary Card and Rewards Graph */}
      <div className="px-8 py-6 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Your Rewards Snapshot</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Current Card Info */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Current Primary Card</h4>
            <div className="flex items-center gap-4">
              <FaCreditCard className="h-12 w-12 text-gray-400" />
              <div>
                <p className="text-xl font-semibold text-gray-900">Basic Rewards Card</p>
                <p className="text-sm text-gray-600">Offering minimal rewards on most spending.</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-700">Considering your spending, you could be earning significantly more rewards with a different card.</p>
             <button className="mt-4 px-4 py-2 rounded bg-indigo-600 text-white text-sm font-semibold shadow hover:bg-indigo-700 transition self-start">Explore Better Cards</button>
          </div>

          {/* Mock Bar Graph */}
          <div>
             <h4 className="text-lg font-medium text-gray-900 mb-2">Estimated Annual Rewards</h4>
             <div className="w-full h-40 bg-gray-100 rounded-lg p-4 flex items-end space-x-4">
                {/* Current Card Bar */}
                <div className="flex-1 flex flex-col items-center justify-end">
                  <div className="w-8 bg-green-500 rounded-t-lg" style={{ height: '40%' }}></div>
                  <span className="mt-1 text-xs text-gray-600">Current Card ($300)</span>
                </div>
                 {/* Potential Rewards Bar */}
                 <div className="flex-1 flex flex-col items-center justify-end">
                  <div className="w-8 bg-green-500 rounded-t-lg" style={{ height: '80%' }}></div>
                  <span className="mt-1 text-xs text-gray-600">Potential ($1150)</span>
                </div>
             </div>
             <p className="mt-2 text-sm text-gray-600 text-center">Illustrative example based on recent spending analysis.</p>
          </div>
        </div>
      </div>

      {/* Placeholder for other client dashboard sections */}
      <div className="px-8 py-6 border-b border-gray-100">
         <h3 className="font-semibold text-gray-800 mb-4">Other Sections</h3>
         <p className="text-gray-500">Placeholder for spending breakdown, detailed recommendations, etc.</p>
       </div>

      {/* Footer bar */}
      <div className="px-8 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-400 text-center">
        © 2025 CardWise Platform. All rights reserved.<br />Powered by Your Company Name
      </div>
    </div>
  )
} 