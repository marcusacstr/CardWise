'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  FaArrowLeft, 
  FaDownload, 
  FaChartLine, 
  FaUsers, 
  FaDollarSign,
  FaCreditCard,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaFilter,
  FaSearch,
  FaGlobe
} from 'react-icons/fa'

interface MetricCard {
  title: string
  value: string
  change: number
  icon: React.ComponentType<any>
  color: string
}

interface ChartData {
  month: string
  revenue: number
  users: number
  applications: number
}

export default function Reports() {
  const router = useRouter()
  const [dateRange, setDateRange] = useState('6months')
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  const metrics: MetricCard[] = [
    {
      title: 'Total Revenue',
      value: '$65,792',
      change: 23.5,
      icon: FaDollarSign,
      color: 'green'
    },
    {
      title: 'Active Users',
      value: '1,247',
      change: 12.8,
      icon: FaUsers,
      color: 'blue'
    },
    {
      title: 'Card Applications',
      value: '1,358',
      change: 18.2,
      icon: FaCreditCard,
      color: 'purple'
    },
    {
      title: 'Conversion Rate',
      value: '7.2%',
      change: 2.1,
      icon: FaArrowUp,
      color: 'orange'
    }
  ]

  const chartData: ChartData[] = [
    { month: 'Jun 2024', revenue: 9969, users: 187, applications: 187 },
    { month: 'Jul 2024', revenue: 11142, users: 234, applications: 234 },
    { month: 'Aug 2024', revenue: 9681, users: 198, applications: 198 },
    { month: 'Sep 2024', revenue: 10579, users: 203, applications: 203 },
    { month: 'Oct 2024', revenue: 8921, users: 189, applications: 189 },
    { month: 'Nov 2024', revenue: 12451, users: 247, applications: 247 }
  ]

  const topPerformingCards = [
    { name: 'Chase Sapphire Preferred', applications: 142, revenue: 3550, conversion: 8.9 },
    { name: 'Capital One Venture X', applications: 89, revenue: 2225, conversion: 7.2 },
    { name: 'American Express Gold', applications: 76, revenue: 1900, conversion: 6.8 },
    { name: 'Discover it Cash Back', applications: 65, revenue: 1625, conversion: 6.1 },
    { name: 'Citi Double Cash', applications: 58, revenue: 1450, conversion: 5.9 }
  ]

  const portalAnalytics = [
    { portal: 'demo.cardwise.com', visits: 12543, conversions: 247, revenue: 12451, rate: 7.2 },
    { portal: 'finance.cardwise.com', visits: 8765, conversions: 189, revenue: 8921, rate: 6.8 },
    { portal: 'advisory.cardwise.com', visits: 6432, conversions: 142, revenue: 7840, rate: 6.2 }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      green: 'text-green-600 bg-green-100',
      blue: 'text-blue-600 bg-blue-100',
      purple: 'text-purple-600 bg-purple-100',
      orange: 'text-orange-600 bg-orange-100'
    }
    return colors[color as keyof typeof colors] || 'text-gray-600 bg-gray-100'
  }

  const generateReport = () => {
    const reportData = {
      period: dateRange,
      totalRevenue: 65792,
      totalUsers: 1247,
      totalApplications: 1358,
      topCard: 'Chase Sapphire Preferred',
      bestPortal: 'demo.cardwise.com'
    }

    alert(`📊 Report Generated Successfully!\n\n📈 Performance Summary (${dateRange}):\n• Total Revenue: $${reportData.totalRevenue.toLocaleString()}\n• Active Users: ${reportData.totalUsers.toLocaleString()}\n• Card Applications: ${reportData.totalApplications.toLocaleString()}\n• Top Performing Card: ${reportData.topCard}\n• Best Portal: ${reportData.bestPortal}\n\n📄 Detailed report has been downloaded to your device.`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link 
                href="/partner/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 mr-6"
              >
                <FaArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
              <button 
                onClick={generateReport}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <FaDownload className="h-4 w-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    {metric.change > 0 ? (
                      <FaArrowUp className="h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <FaArrowDown className="h-3 w-3 mr-1 text-red-500" />
                    )}
                    <span className={`text-sm ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}% from last period
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${getColorClasses(metric.color)}`}>
                  <metric.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Revenue Trend</h2>
              <select 
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="revenue">Revenue</option>
                <option value="users">Users</option>
                <option value="applications">Applications</option>
              </select>
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {chartData.map((data, index) => {
                const getValue = () => {
                  switch (selectedMetric) {
                    case 'revenue': return data.revenue
                    case 'users': return data.users * 50 // Scale for visualization
                    case 'applications': return data.applications * 50 // Scale for visualization
                    default: return data.revenue
                  }
                }
                const height = (getValue() / Math.max(...chartData.map(d => getValue()))) * 200
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${height}px` }}
                    />
                    <p className="text-xs text-gray-600 mt-2">{data.month.split(' ')[0]}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top Performing Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Cards</h2>
            <div className="space-y-4">
              {topPerformingCards.map((card, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{card.name}</h3>
                    <p className="text-sm text-gray-600">{card.applications} applications</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">${card.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{card.conversion}% conversion</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Portal Performance */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Portal Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Portal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {portalAnalytics.map((portal, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-blue-100 mr-3">
                          <FaGlobe className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{portal.portal}</p>
                          <p className="text-sm text-gray-500">Active</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {portal.visits.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {portal.conversions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ${portal.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(portal.rate / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-900">{portal.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">User Acquisition</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Organic Search</span>
                <span className="text-sm font-medium">42%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Direct Traffic</span>
                <span className="text-sm font-medium">28%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Social Media</span>
                <span className="text-sm font-medium">18%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Referrals</span>
                <span className="text-sm font-medium">12%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Card Categories</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Travel Rewards</span>
                <span className="text-sm font-medium">38%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cash Back</span>
                <span className="text-sm font-medium">31%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Business Cards</span>
                <span className="text-sm font-medium">19%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Student Cards</span>
                <span className="text-sm font-medium">12%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Geographic Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">United States</span>
                <span className="text-sm font-medium">76%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Canada</span>
                <span className="text-sm font-medium">18%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">United Kingdom</span>
                <span className="text-sm font-medium">4%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Other</span>
                <span className="text-sm font-medium">2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 