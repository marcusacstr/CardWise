import React from 'react'
import { FaCreditCard, FaStar, FaChartBar, FaFileAlt, FaTrash } from 'react-icons/fa'

export default function UserDashboardMockup() {
  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl bg-white/95 border border-gray-200 overflow-hidden my-12">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back, marcus.acaster!</h2>
        <p className="text-gray-500 text-sm">Get personalized card recommendations by uploading a statement OR by manually entering your monthly spending habits. Accurate comparisons require selecting your current primary card.</p>
      </div>
      {/* Current Card & Stats */}
      <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
        <h3 className="font-semibold text-gray-800 mb-2">Your Current Primary Card</h3>
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Select Card</label>
            <select className="w-full border rounded px-3 py-2 text-gray-700 bg-white">
              <option>Choose your primary credit card</option>
            </select>
          </div>
          <button className="ml-0 md:ml-2 px-4 py-2 rounded bg-gray-200 text-gray-600 font-semibold text-sm">Save Card</button>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 bg-white rounded-lg p-4 shadow flex flex-col items-center">
            <span className="text-xs text-gray-500 mb-1">Estimated Annual Savings</span>
            <span className="text-2xl font-bold text-green-600">$700.00</span>
            <span className="text-xs text-gray-400">Compared to your current card</span>
          </div>
          <div className="flex-1 bg-white rounded-lg p-4 shadow flex flex-col items-center">
            <span className="text-xs text-gray-500 mb-1">Uploaded Statements</span>
            <span className="text-2xl font-bold text-green-600">0</span>
            <span className="text-xs text-gray-400">Keep uploading to refine recommendations</span>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="flex-1 px-4 py-2 rounded bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition flex items-center gap-2"><FaFileAlt /> Upload New Statement</button>
          <button className="flex-1 px-4 py-2 rounded bg-white border border-green-200 text-green-700 font-semibold shadow hover:bg-green-50 transition flex items-center gap-2"><FaChartBar /> Enter Spending Manually</button>
        </div>
      </div>
      {/* Recommendations */}
      <div className="px-8 py-6 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><FaStar className="text-green-500" /> Top Card Recommendations</h3>
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><FaStar className="text-green-500" /> Top Card Recommendations</h3>
        <p className="text-xs text-gray-500 mb-3">Based on our extensive database, here are some top card options. (Displaying examples as no cards are found in the database. Consider seeding your database for live data.)</p>
        <div className="flex flex-col gap-3">
          {/* Card 1 */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center gap-2">
            <div className="flex-1">
              <div className="font-semibold text-gray-900">TD® Aeroplan® Visa Infinite* Card</div>
              <div className="text-xs text-gray-500">TD Bank • Fee: $139</div>
              <div className="text-xs text-gray-500">Rewards: 1.5x Aeroplan on gas, groceries, travel</div>
              <div className="text-xs text-gray-400">Up to 50,000 Aeroplan points</div>
              <div className="text-xs text-green-600 font-bold">Est. Value: $700.00/year</div>
            </div>
            <button className="ml-auto px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold text-xs flex items-center gap-1"><FaCreditCard /> View Details</button>
          </div>
          {/* Card 2 */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center gap-2">
            <div className="flex-1">
              <div className="font-semibold text-gray-900">American Express Cobalt® Card</div>
              <div className="text-xs text-gray-500">American Express • Fee: $155.88</div>
              <div className="text-xs text-gray-500">Rewards: 5x points on food & groceries</div>
              <div className="text-xs text-gray-400">Up to 30,000 points</div>
              <div className="text-xs text-green-600 font-bold">Est. Value: $600.00/year</div>
            </div>
            <button className="ml-auto px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold text-xs flex items-center gap-1"><FaCreditCard /> View Details</button>
          </div>
          {/* Card 3 */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center gap-2">
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Scotiabank Gold American Express Card</div>
              <div className="text-xs text-gray-500">Scotiabank • Fee: $120</div>
              <div className="text-xs text-gray-500">Rewards: 4x Scene+ on groceries, dining, entertainment</div>
              <div className="text-xs text-gray-400">Up to 45,000 Scene+ points</div>
              <div className="text-xs text-green-600 font-bold">Est. Value: $500.00/year</div>
            </div>
            <button className="ml-auto px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold text-xs flex items-center gap-1"><FaCreditCard /> View Details</button>
          </div>
        </div>
      </div>
      {/* Monthly Reward Gains (Bar Chart) */}
      <div className="px-8 py-6 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><FaChartBar className="text-green-500" /> Monthly Reward Gains (Mock Data)</h3>
        <p className="text-xs text-gray-500 mb-3">Track your current vs. potential rewards over time.</p>
        <div className="w-full h-40 flex items-end gap-3">
          {/* Mocked bar chart */}
          {[80, 60, 55, 90, 40, 75].map((v, i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              <div className="w-7 rounded-t bg-green-400" style={{ height: `${v}%`, minHeight: '20px' }}></div>
              <span className="text-xs text-gray-400 mt-1">{['Jan','Feb','Mar','Apr','May','Jun'][i]}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Uploaded Statements & Reports */}
      <div className="px-8 py-6 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-2">Uploaded Statements & Reports</h3>
        <p className="text-xs text-gray-500 mb-2">View your history of uploaded statements and generated reports.</p>
        <div className="text-sm text-gray-500">No statements uploaded yet. <a href="#" className="text-green-600 hover:underline">Upload your first statement!</a></div>
      </div>
      {/* Account Management */}
      <div className="px-8 py-6 bg-red-50">
        <h3 className="font-semibold text-gray-800 mb-2">Account Management</h3>
        <button className="flex items-center gap-2 px-4 py-2 rounded bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition text-sm"><FaTrash /> Delete My Data (Mock)</button>
        <p className="text-xs text-gray-500 mt-2">Permanently remove all your information from CardWise.</p>
      </div>
      {/* Footer bar */}
      <div className="px-8 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-400 text-center">
        © 2025 CardWise Platform. All rights reserved.<br />Powering smarter financial decisions for your clients.
      </div>
    </div>
  )
} 