'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  FaUsers, 
  FaDollarSign, 
  FaChartLine, 
  FaTrophy, 
  FaGlobe, 
  FaRocket, 
  FaPalette, 
  FaCog, 
  FaExternalLinkAlt, 
  FaSync, 
  FaBell, 
  FaPlay, 
  FaPause, 
  FaArrowUp, 
  FaArrowDown, 
  FaSearch, 
  FaPlus,
  FaEye,
  FaCalendarAlt,
  FaDownload,
  FaCreditCard,
  FaHandshake,
  FaLightbulb,
  FaFileAlt,
  FaChartBar
} from 'react-icons/fa'

interface PartnerInfo {
  id: string
  companyName: string
  logoUrl?: string
  subscriptionStatus: string
  subscriptionPlan: string
  totalUsers: number
  activeUsers: number
  totalAnalyses: number
  totalRevenue: number
  conversionRate: number
  portalUrl?: string
  portalActive: boolean
  cardSelections: number
  monthlyGrowth: number
  avgSessionDuration: number
  topPerformingCard: string
  lastUpdated: Date | string
}

interface RecentActivity {
  id: string
  type: 'user_signup' | 'card_application' | 'analysis_completed' | 'revenue_earned' | 'portal_updated'
  description: string
  timestamp: Date
  amount?: number
  user?: string
}

interface QuickStat {
  label: string
  value: string | number
  change: number
  trend: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  color: string
  target?: number
}

interface Notification {
  id: string
  type: 'info' | 'warning' | 'success' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export default function PartnerDashboard() {
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('30d')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activityFilter, setActivityFilter] = useState('all')

  // Mock data for demonstration
  const mockPartnerInfo: PartnerInfo = {
    id: '1',
    companyName: 'Demo Financial Services',
    logoUrl: '/api/placeholder/48/48',
    subscriptionStatus: 'active',
    subscriptionPlan: 'professional',
    totalUsers: 247,
    activeUsers: 89,
    totalAnalyses: 1456,
    totalRevenue: 18750,
    conversionRate: 14.2,
    portalUrl: 'https://demo.cardwise.com',
    portalActive: true,
    cardSelections: 12,
    monthlyGrowth: 23.5,
    avgSessionDuration: 8.5,
    topPerformingCard: 'Chase Sapphire Preferred',
    lastUpdated: new Date()
  }

  const mockActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'card_application',
      description: 'User applied for Chase Sapphire Preferred',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      amount: 250,
      user: 'john.doe@email.com'
    },
    {
      id: '2',
      type: 'analysis_completed',
      description: 'Spending analysis completed',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      user: 'sarah.smith@email.com'
    },
    {
      id: '3',
      type: 'user_signup',
      description: 'New user registered',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      user: 'mike.johnson@email.com'
    },
    {
      id: '4',
      type: 'revenue_earned',
      description: 'Commission payment received',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      amount: 125
    },
    {
      id: '5',
      type: 'portal_updated',
      description: 'Portal branding updated',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
    }
  ]

  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'success',
      title: 'Strong Performance',
      message: 'Your portal generated $2,500 in commissions this week!',
      timestamp: new Date(),
      read: false
    },
    {
      id: '2',
      type: 'info',
      title: 'New Feature Available',
      message: 'Enhanced analytics dashboard is now available.',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      read: false
    }
  ]

  const fetchPartnerData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch real data from API
      const response = await fetch('/api/partner/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setPartnerInfo(data.partnerInfo)
      setRecentActivity(data.recentActivity || [])
      setNotifications(data.notifications || [])
      
    } catch (err) {
      console.error('Error fetching partner data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      
      // Fallback to mock data if API fails
      setPartnerInfo(mockPartnerInfo)
      setRecentActivity(mockActivity)
      setNotifications(mockNotifications)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPartnerData()
  }, [timeRange])

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchPartnerData, 30000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  // Filter activity
  const filteredActivity = recentActivity.filter(activity => {
    const matchesSearch = activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.user?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = activityFilter === 'all' || activity.type === activityFilter
    return matchesSearch && matchesFilter
  })

  const quickStats: QuickStat[] = partnerInfo ? [
    {
      label: 'Total Users',
      value: partnerInfo.totalUsers.toLocaleString(),
      change: 12.5,
      trend: 'up',
      icon: <FaUsers className="h-6 w-6" />,
      color: 'blue',
      target: 300
    },
    {
      label: 'Active Users',
      value: partnerInfo.activeUsers.toLocaleString(),
      change: 8.2,
      trend: 'up',
      icon: <FaChartLine className="h-6 w-6" />,
      color: 'green',
      target: 100
    },
    {
      label: 'Total Revenue',
      value: `$${partnerInfo.totalRevenue.toLocaleString()}`,
      change: partnerInfo.monthlyGrowth,
      trend: 'up',
      icon: <FaDollarSign className="h-6 w-6" />,
      color: 'emerald',
      target: 25000
    },
    {
      label: 'Conversion Rate',
      value: `${partnerInfo.conversionRate}%`,
      change: 2.1,
      trend: 'up',
      icon: <FaTrophy className="h-6 w-6" />,
      color: 'purple',
      target: 20
    },
    {
      label: 'Avg Session',
      value: `${Math.round(partnerInfo.avgSessionDuration)}m`,
      change: 5.3,
      trend: 'up',
      icon: <FaEye className="h-6 w-6" />,
      color: 'orange',
      target: 15
    },
    {
      label: 'Card Selections',
      value: partnerInfo.cardSelections.toString(),
      change: 0,
      trend: 'neutral',
      icon: <FaCreditCard className="h-6 w-6" />,
      color: 'pink',
      target: 20
    }
  ] : []

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {partnerInfo?.logoUrl && (
                <img 
                  src={partnerInfo.logoUrl} 
                  alt="Company Logo" 
                  className="h-12 w-12 object-contain rounded-lg border border-gray-200"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {partnerInfo?.companyName || 'Partner'} Dashboard
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-sm text-gray-600">
                    Manage your white-label CardWise platform
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${partnerInfo?.portalActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="text-xs text-gray-500">
                      Portal {partnerInfo?.portalActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                  <FaBell className="h-5 w-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
              </div>

              {/* Auto-refresh toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-md text-sm font-medium ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {autoRefresh ? <FaPause className="h-4 w-4" /> : <FaPlay className="h-4 w-4" />}
              </button>

              {/* Manual refresh */}
              <button
                onClick={fetchPartnerData}
                className="p-2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                <FaSync className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              
              {/* Portal Link */}
              {partnerInfo?.portalUrl && (
                <Link 
                  href={partnerInfo.portalUrl} 
                  target="_blank"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <FaExternalLinkAlt className="mr-2 h-4 w-4" />
                  View Portal
                </Link>
              )}
            </div>
          </div>

          {/* Last Updated */}
          {partnerInfo?.lastUpdated && (
            <div className="mt-2 text-xs text-gray-500">
              Last updated: {new Date(partnerInfo.lastUpdated).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <div className="text-red-400 mr-3">
                <FaExternalLinkAlt className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
              <button
                onClick={fetchPartnerData}
                className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Notifications */}
        {notifications.filter(n => !n.read).length > 0 && (
          <div className="mb-6 space-y-2">
            {notifications.filter(n => !n.read).map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-md border ${
                  notification.type === 'error' ? 'bg-red-50 border-red-200' :
                  notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  notification.type === 'success' ? 'bg-green-50 border-green-200' :
                  'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-start">
                  <div className={`mr-3 ${
                    notification.type === 'error' ? 'text-red-400' :
                    notification.type === 'warning' ? 'text-yellow-400' :
                    notification.type === 'success' ? 'text-green-400' :
                    'text-green-400'
                  }`}>
                    <FaBell className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-sm font-medium ${
                      notification.type === 'error' ? 'text-red-800' :
                      notification.type === 'warning' ? 'text-yellow-800' :
                      notification.type === 'success' ? 'text-green-800' :
                      'text-green-800'
                    }`}>
                      {notification.title}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      notification.type === 'error' ? 'text-red-600' :
                      notification.type === 'warning' ? 'text-yellow-600' :
                      notification.type === 'success' ? 'text-green-600' :
                      'text-green-600'
                    }`}>
                      {notification.message}
                    </p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => 
                      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                    )}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full bg-${stat.color}-100 text-${stat.color}-600`}>
                  {stat.icon}
                </div>
                <div className={`text-xs font-medium flex items-center ${
                  stat.trend === 'up' ? 'text-green-600' : 
                  stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.trend === 'up' ? <FaArrowUp className="mr-1 h-3 w-3" /> : 
                   stat.trend === 'down' ? <FaArrowDown className="mr-1 h-3 w-3" /> : null}
                  {stat.change !== 0 && `${stat.change > 0 ? '+' : ''}${stat.change.toFixed(1)}%`}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                {stat.target && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`bg-${stat.color}-600 h-2 rounded-full transition-all duration-300`}
                      style={{ 
                        width: `${Math.min(100, (parseFloat(stat.value.toString().replace(/[^0-9.]/g, '')) / stat.target) * 100)}%` 
                      }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Portal Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Portal Management</h2>
              <Link href="/partner/portal" className="text-green-600 hover:text-green-800 text-sm font-medium">
                Manage
              </Link>
            </div>
            
            <div className="space-y-4">
              {!partnerInfo?.portalActive && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <FaRocket className="h-5 w-5 text-yellow-600 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">Portal Setup Required</h3>
                      <p className="text-xs text-yellow-600 mt-1">Create and activate your portal to start earning.</p>
                    </div>
                  </div>
                  <Link 
                    href="/partner/portal/create"
                    className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200"
                  >
                    <FaPlus className="mr-2 h-4 w-4" />
                    Create Portal
                  </Link>
                </div>
              )}

              <Link href="/partner/settings" 
                className="group p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                    <FaCog className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Platform Settings</h3>
                    <p className="text-sm text-gray-500">Configure preferences</p>
                  </div>
                </div>
              </Link>

              <Link 
                href="/partner/portal" 
                className="group p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
                    <FaPalette className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Portal Management</h3>
                    <p className="text-sm text-gray-500">Brand and design</p>
                  </div>
                </div>
              </Link>

              <Link 
                href="/partner/analytics" 
                className="group p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <FaChartLine className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Analytics</h3>
                    <p className="text-sm text-gray-500">Performance metrics</p>
                  </div>
                </div>
              </Link>

              <Link 
                href="/partner/commissions" 
                className="group p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <FaDollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Commissions</h3>
                    <p className="text-sm text-gray-500">Earnings & payouts</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href="/partner/portal/create" 
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors group"
              >
                <FaRocket className="h-8 w-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium text-gray-900">Create Portal</div>
              </Link>
              
              <Link 
                href="/partner/analytics" 
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors group"
              >
                <FaChartLine className="h-8 w-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium text-gray-900">Analytics</div>
              </Link>
              
              <Link 
                href="/partner/commissions" 
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors group"
              >
                <FaDollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium text-gray-900">Commissions</div>
              </Link>
              
              <Link 
                href="/partner/portal" 
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors group"
              >
                <FaPalette className="h-8 w-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium text-gray-900">Portal</div>
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-3">
                <Link 
                  href="/partner/users"
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FaUsers className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Manage Users</span>
                  </div>
                  <FaExternalLinkAlt className="h-4 w-4 text-gray-400" />
                </Link>

                <Link 
                  href="/partner/cards"
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FaCreditCard className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Card Selection</span>
                  </div>
                  <FaExternalLinkAlt className="h-4 w-4 text-gray-400" />
                </Link>

                <button 
                  onClick={() => window.open('/partner/reports/export', '_blank')}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FaDownload className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-gray-900">Export Data</span>
                  </div>
                  <FaExternalLinkAlt className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <Link href="/partner/activity" className="text-green-600 hover:text-green-800 text-sm font-medium">
                View All
              </Link>
            </div>

            {/* Activity Filters */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All</option>
                <option value="user_signup">Signups</option>
                <option value="card_application">Applications</option>
                <option value="analysis_completed">Analyses</option>
                <option value="revenue_earned">Revenue</option>
              </select>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredActivity.length > 0 ? (
                filteredActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      activity.type === 'analysis_completed' ? 'bg-green-500' :
                      activity.type === 'card_application' ? 'bg-green-500' :
                      activity.type === 'user_signup' ? 'bg-green-500' : 
                      activity.type === 'revenue_earned' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{activity.description}</div>
                      <div className="text-xs text-gray-500 flex items-center space-x-2 mt-1">
                        <FaCalendarAlt className="h-3 w-3" />
                        <span>{activity.timestamp.toLocaleString()}</span>
                        {activity.user && (
                          <>
                            <span>•</span>
                            <span className="truncate">{activity.user}</span>
                          </>
                        )}
                        {activity.amount && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-green-600">${activity.amount}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FaChartBar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">No activity found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {searchTerm || activityFilter !== 'all' 
                      ? 'Try adjusting your filters' 
                      : 'Activity will appear as users interact with your portal'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Performance Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <FaTrophy className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {partnerInfo?.topPerformingCard || 'N/A'}
              </h3>
              <p className="text-sm text-gray-600">Top Performing Card</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <FaEye className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {Math.round(partnerInfo?.avgSessionDuration || 0)}m
              </h3>
              <p className="text-sm text-gray-600">Avg Session Duration</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <FaHandshake className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {partnerInfo?.subscriptionPlan?.charAt(0).toUpperCase() + partnerInfo?.subscriptionPlan?.slice(1) || 'Basic'}
              </h3>
              <p className="text-sm text-gray-600">Current Plan</p>
            </div>
          </div>
        </div>

        {/* Help & Resources */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Help & Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/partner/docs"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaFileAlt className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">Documentation</div>
                <div className="text-xs text-gray-500">Setup guides & API docs</div>
              </div>
            </Link>

            <Link 
              href="/partner/support"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaHandshake className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">Support</div>
                <div className="text-xs text-gray-500">Get help from our team</div>
              </div>
            </Link>

            <Link 
              href="/partner/community"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaUsers className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">Community</div>
                <div className="text-xs text-gray-500">Connect with partners</div>
              </div>
            </Link>

            <Link 
              href="/partner/best-practices"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaLightbulb className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">Best Practices</div>
                <div className="text-xs text-gray-500">Tips & optimization</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 