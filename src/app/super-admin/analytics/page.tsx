'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  FaArrowLeft, 
  FaChartLine, 
  FaUsers, 
  FaCreditCard,
  FaDollarSign,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaBuilding,
  FaFileAlt,
  FaEye,
  FaDownload
} from 'react-icons/fa'

interface AnalyticsData {
  userGrowth: { month: string; users: number; partners: number }[]
  revenueData: { month: string; revenue: number; subscriptions: number }[]
  cardPopularity: { name: string; applications: number; issuer: string }[]
  userActivity: { date: string; uploads: number; analyses: number }[]
  topPerformingPartners: { name: string; revenue: number; portals: number; conversions: number }[]
}

export default function SuperAdminAnalytics() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    userGrowth: [],
    revenueData: [],
    cardPopularity: [],
    userActivity: [],
    topPerformingPartners: []
  })

  const SUPER_ADMIN_EMAILS = [
    'marcus@cardwise.com',
    'admin@cardwise.com',
    'team@cardwise.com',
  ]

  useEffect(() => {
    checkSuperAdminAuth()
    loadAnalytics()
  }, [timeRange])

  const checkSuperAdminAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || !SUPER_ADMIN_EMAILS.includes(user.email || '')) {
        router.push('/super-admin')
        return
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/super-admin')
    }
  }

  const loadAnalytics = async () => {
    try {
      // In a real app, you'd fetch this from your analytics API
      // For now, we'll generate mock data
      const mockAnalytics: AnalyticsData = {
        userGrowth: [
          { month: 'Jan', users: 120, partners: 8 },
          { month: 'Feb', users: 185, partners: 12 },
          { month: 'Mar', users: 245, partners: 18 },
          { month: 'Apr', users: 320, partners: 25 },
          { month: 'May', users: 410, partners: 32 },
          { month: 'Jun', users: 520, partners: 41 }
        ],
        revenueData: [
          { month: 'Jan', revenue: 792, subscriptions: 8 },
          { month: 'Feb', revenue: 1188, subscriptions: 12 },
          { month: 'Mar', revenue: 1782, subscriptions: 18 },
          { month: 'Apr', revenue: 2475, subscriptions: 25 },
          { month: 'May', revenue: 3168, subscriptions: 32 },
          { month: 'Jun', revenue: 4059, subscriptions: 41 }
        ],
        cardPopularity: [
          { name: 'Chase Sapphire Preferred', applications: 1250, issuer: 'Chase' },
          { name: 'Amex Gold Card', applications: 980, issuer: 'American Express' },
          { name: 'TD Aeroplan Visa Infinite', applications: 850, issuer: 'TD' },
          { name: 'RBC Avion Visa Infinite', applications: 720, issuer: 'RBC' },
          { name: 'Scotiabank Gold American Express', applications: 650, issuer: 'Scotiabank' },
          { name: 'Capital One Venture', applications: 580, issuer: 'Capital One' }
        ],
        userActivity: [
          { date: '2024-01-01', uploads: 45, analyses: 120 },
          { date: '2024-01-02', uploads: 52, analyses: 135 },
          { date: '2024-01-03', uploads: 38, analyses: 98 },
          { date: '2024-01-04', uploads: 61, analyses: 145 },
          { date: '2024-01-05', uploads: 48, analyses: 112 },
          { date: '2024-01-06', uploads: 55, analyses: 128 },
          { date: '2024-01-07', uploads: 42, analyses: 105 }
        ],
        topPerformingPartners: [
          { name: 'Credit Card Genius', revenue: 1980, portals: 5, conversions: 245 },
          { name: 'Rewards Optimizer', revenue: 1485, portals: 3, conversions: 189 },
          { name: 'Smart Card Hub', revenue: 1188, portals: 4, conversions: 156 },
          { name: 'Points & Miles Pro', revenue: 891, portals: 2, conversions: 98 },
          { name: 'Card Strategy Central', revenue: 693, portals: 3, conversions: 87 }
        ]
      }

      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportAnalytics = () => {
    const reportData = {
      generated_at: new Date().toISOString(),
      time_range: timeRange,
      summary: {
        total_users: analytics.userGrowth[analytics.userGrowth.length - 1]?.users || 0,
        total_partners: analytics.userGrowth[analytics.userGrowth.length - 1]?.partners || 0,
        total_revenue: analytics.revenueData[analytics.revenueData.length - 1]?.revenue || 0,
        top_card: analytics.cardPopularity[0]?.name || 'N/A'
      },
      detailed_data: analytics
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cardwise-analytics-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  const currentUsers = analytics.userGrowth[analytics.userGrowth.length - 1]?.users || 0
  const previousUsers = analytics.userGrowth[analytics.userGrowth.length - 2]?.users || 0
  const userGrowthPercent = previousUsers > 0 ? ((currentUsers - previousUsers) / previousUsers * 100) : 0

  const currentRevenue = analytics.revenueData[analytics.revenueData.length - 1]?.revenue || 0
  const previousRevenue = analytics.revenueData[analytics.revenueData.length - 2]?.revenue || 0
  const revenueGrowthPercent = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue * 100) : 0

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/super-admin/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Platform insights and performance metrics
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button
                onClick={exportAnalytics}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <FaDownload />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{currentUsers.toLocaleString()}</p>
                <p className={`text-sm flex items-center mt-1 ${
                  userGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {userGrowthPercent >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                  {Math.abs(userGrowthPercent).toFixed(1)}% from last month
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${currentRevenue.toLocaleString()}</p>
                <p className={`text-sm flex items-center mt-1 ${
                  revenueGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {revenueGrowthPercent >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                  {Math.abs(revenueGrowthPercent).toFixed(1)}% from last month
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaDollarSign className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Partners</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.userGrowth[analytics.userGrowth.length - 1]?.partners || 0}
                </p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <FaBuilding className="mr-1" />
                  Paying subscribers
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FaBuilding className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Card Applications</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.cardPopularity.reduce((sum, card) => sum + card.applications, 0).toLocaleString()}
                </p>
                <p className="text-sm text-yellow-600 flex items-center mt-1">
                  <FaCreditCard className="mr-1" />
                  Total this month
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaCreditCard className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User & Partner Growth</h3>
            <div className="space-y-4">
              {analytics.userGrowth.map((data, index) => (
                <div key={data.month} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 text-sm text-gray-600">{data.month}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(data.users / 600) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{data.users} users</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-32 bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-green-600 h-1 rounded-full"
                            style={{ width: `${(data.partners / 50) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{data.partners} partners</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Growth</h3>
            <div className="space-y-4">
              {analytics.revenueData.map((data, index) => (
                <div key={data.month} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 text-sm text-gray-600">{data.month}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-green-600 h-3 rounded-full"
                            style={{ width: `${(data.revenue / 5000) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">${data.revenue}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {data.subscriptions} active subscriptions
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Credit Cards */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Credit Cards</h3>
            <div className="space-y-3">
              {analytics.cardPopularity.map((card, index) => (
                <div key={card.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{card.name}</p>
                      <p className="text-xs text-gray-600">{card.issuer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{card.applications}</p>
                    <p className="text-xs text-gray-600">applications</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Partners */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Partners</h3>
            <div className="space-y-3">
              {analytics.topPerformingPartners.map((partner, index) => (
                <div key={partner.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{partner.name}</p>
                      <p className="text-xs text-gray-600">{partner.portals} portals • {partner.conversions} conversions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">${partner.revenue}</p>
                    <p className="text-xs text-gray-600">monthly</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaFileAlt className="text-blue-600 text-2xl" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.userActivity.reduce((sum, day) => sum + day.uploads, 0)}
              </p>
              <p className="text-sm text-gray-600">CSV Uploads This Week</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaChartLine className="text-green-600 text-2xl" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.userActivity.reduce((sum, day) => sum + day.analyses, 0)}
              </p>
              <p className="text-sm text-gray-600">Analyses Generated</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaEye className="text-purple-600 text-2xl" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.floor(Math.random() * 5000) + 2000}
              </p>
              <p className="text-sm text-gray-600">Page Views This Week</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 