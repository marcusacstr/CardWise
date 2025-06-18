'use client'

import React, { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { FaArrowLeft, FaUsers, FaChartLine, FaMoneyBillWave, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface AnalyticsData {
  totalUsers: number
  activeUsers: number
  newUsers: number
  revenue: number
  revenueGrowth: number
  userRetention: number
  userActivity: {
    date: string
    activeUsers: number
  }[]
  revenueByPlan: {
    plan: string
    revenue: number
  }[]
  userDistribution: {
    category: string
    users: number
  }[]
}

const COLORS = ['#4F46E5', '#818CF8', '#C7D2FE', '#E0E7FF']

const ChartLoadingState = () => (
  <div className="h-80 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  </div>
)

const ChartErrorState = ({ message }: { message: string }) => (
  <div className="h-80 flex flex-col items-center justify-center text-gray-500">
    <FaExclamationTriangle className="h-12 w-12 mb-4" />
    <p>{message}</p>
  </div>
)

export default function AnalyticsPage() {
  const supabase = createClientComponentClient()
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    revenue: 0,
    revenueGrowth: 0,
    userRetention: 0,
    userActivity: [],
    revenueByPlan: [],
    userDistribution: [],
  })

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError(userError?.message || 'User not authenticated')
        setLoading(false)
        return
      }

      // Fetch analytics data from Supabase
      const { data: analytics, error: analyticsError } = await supabase
        .from('partner_analytics')
        .select('total_users, active_users, new_users, revenue, revenue_growth, user_retention, user_activity, revenue_by_plan, user_distribution')
        .eq('partner_id', user.id)
        .eq('time_range', timeRange)
        .single()

      if (analyticsError && analyticsError.code !== 'PGRST116') {
        throw analyticsError
      }

      if (analytics) {
        const userActivity = typeof analytics.user_activity === 'string' ? JSON.parse(analytics.user_activity) : analytics.user_activity || []
        const revenueByPlan = typeof analytics.revenue_by_plan === 'string' ? JSON.parse(analytics.revenue_by_plan) : analytics.revenue_by_plan || []
        const userDistribution = typeof analytics.user_distribution === 'string' ? JSON.parse(analytics.user_distribution) : analytics.user_distribution || []

        setAnalyticsData({
          totalUsers: analytics.total_users || 0,
          activeUsers: analytics.active_users || 0,
          newUsers: analytics.new_users || 0,
          revenue: analytics.revenue || 0,
          revenueGrowth: analytics.revenue_growth || 0,
          userRetention: analytics.user_retention || 0,
          userActivity,
          revenueByPlan,
          userDistribution,
        })
      }
    } catch (err: any) {
      console.error('Error fetching analytics data:', err)
      setError(err.message || 'Failed to fetch analytics data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/partner/dashboard" className="inline-flex items-center text-green-600 hover:text-green-800 mb-4">
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Overview</h1>
              <p className="mt-2 text-sm text-gray-600">Track your platform's performance and growth.</p>
            </div>
            <div className="flex space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaUsers className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaChartLine className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData.activeUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaMoneyBillWave className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">${analyticsData.revenue.toLocaleString()}</p>
                <p className="text-sm text-green-600">+{analyticsData.revenueGrowth}% from last period</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaCalendarAlt className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">User Retention</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData.userRetention}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Activity Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">User Activity</h2>
            {loading ? (
              <ChartLoadingState />
            ) : error ? (
              <ChartErrorState message="Failed to load user activity data" />
            ) : analyticsData.userActivity.length === 0 ? (
              <ChartErrorState message="No user activity data available" />
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.userActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="activeUsers"
                      stroke="#4F46E5"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Revenue by Plan Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Revenue by Plan</h2>
            {loading ? (
              <ChartLoadingState />
            ) : error ? (
              <ChartErrorState message="Failed to load revenue data" />
            ) : analyticsData.revenueByPlan.length === 0 ? (
              <ChartErrorState message="No revenue data available" />
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.revenueByPlan}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="plan" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* User Distribution Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">User Distribution</h2>
            {loading ? (
              <ChartLoadingState />
            ) : error ? (
              <ChartErrorState message="Failed to load user distribution data" />
            ) : analyticsData.userDistribution.length === 0 ? (
              <ChartErrorState message="No user distribution data available" />
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.userDistribution}
                      dataKey="users"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {analyticsData.userDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* New Users Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">New Users</h2>
            {loading ? (
              <ChartLoadingState />
            ) : error ? (
              <ChartErrorState message="Failed to load new users data" />
            ) : analyticsData.userActivity.length === 0 ? (
              <ChartErrorState message="No new users data available" />
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.userActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="newUsers" fill="#818CF8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 