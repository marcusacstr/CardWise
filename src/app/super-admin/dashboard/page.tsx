'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  FaUsers, 
  FaCreditCard, 
  FaBuilding, 
  FaChartLine, 
  FaShieldAlt, 
  FaCog, 
  FaSignOutAlt,
  FaDollarSign,
  FaUserTimes,
  FaDatabase,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa'

interface DashboardStats {
  totalUsers: number
  totalPartners: number
  totalCards: number
  monthlyRevenue: number
  activeSubscriptions: number
  pendingIssues: number
}

export default function SuperAdminDashboard() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPartners: 0,
    totalCards: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    pendingIssues: 0
  })

  const SUPER_ADMIN_EMAILS = [
    'marcus@cardwise.com',
    'admin@cardwise.com',
    'team@cardwise.com',
    'marcus.acaster@gmail.com', // Add your real email temporarily
  ]

  useEffect(() => {
    checkSuperAdminAuth()
    loadDashboardStats()
  }, [])

  const checkSuperAdminAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || !SUPER_ADMIN_EMAILS.includes(user.email || '')) {
        router.push('/super-admin')
        return
      }
      
      setUser(user)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/super-admin')
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardStats = async () => {
    try {
      // Get total users count
      const { count: usersCount } = await supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true })

      // Get total partners count
      const { count: partnersCount } = await supabase
        .from('partners')
        .select('*', { count: 'exact', head: true })

      // Get total cards count
      const { count: cardsCount } = await supabase
        .from('credit_cards')
        .select('*', { count: 'exact', head: true })

      // Get active partners for subscription count
      const { count: activePartnersCount } = await supabase
        .from('partners')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      setStats({
        totalUsers: usersCount || 0,
        totalPartners: partnersCount || 0,
        totalCards: cardsCount || 0,
        monthlyRevenue: (activePartnersCount || 0) * 99, // Assuming $99/month per partner
        activeSubscriptions: activePartnersCount || 0,
        pendingIssues: 3 // Mock data - you can implement real issue tracking
      })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/super-admin')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <FaShieldAlt className="text-white text-sm" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">CardWise Super Admin</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.email?.split('@')[0]}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-red-600 hover:text-red-800 transition-colors"
              >
                <FaSignOutAlt />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <FaArrowUp className="mr-1" />
                  12% from last month
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
                <p className="text-sm font-medium text-gray-500">Total Partners</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalPartners}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <FaArrowUp className="mr-1" />
                  8% from last month
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaBuilding className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Credit Cards</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCards}</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <FaCreditCard className="mr-1" />
                  Active in database
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FaCreditCard className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <FaArrowUp className="mr-1" />
                  15% from last month
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaDollarSign className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  Partner accounts
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <FaChartLine className="text-indigo-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Issues</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingIssues}</p>
                <p className="text-sm text-orange-600 flex items-center mt-1">
                  <FaExclamationTriangle className="mr-1" />
                  Requires attention
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            href="/super-admin/partners"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                <FaBuilding className="text-green-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Partner Management</h3>
                <p className="text-sm text-gray-600">View, manage, and terminate partners</p>
              </div>
            </div>
          </Link>

          <Link
            href="/super-admin/cards"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                <FaCreditCard className="text-purple-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Card Management</h3>
                <p className="text-sm text-gray-600">Add, edit, and manage credit cards</p>
              </div>
            </div>
          </Link>

          <Link
            href="/super-admin/users"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <p className="text-sm text-gray-600">View and manage user accounts</p>
              </div>
            </div>
          </Link>

          <Link
            href="/super-admin/analytics"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-full group-hover:bg-yellow-200 transition-colors">
                <FaChartLine className="text-yellow-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                <p className="text-sm text-gray-600">Platform insights and metrics</p>
              </div>
            </div>
          </Link>
        </div>

        {/* System Tools */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/super-admin/database"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaDatabase className="text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Database Management</p>
                <p className="text-sm text-gray-600">Backup, restore, and maintenance</p>
              </div>
            </Link>

            <Link
              href="/super-admin/settings"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaCog className="text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">System Settings</p>
                <p className="text-sm text-gray-600">Configure platform settings</p>
              </div>
            </Link>

            <Link
              href="/super-admin/logs"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaExclamationTriangle className="text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">System Logs</p>
                <p className="text-sm text-gray-600">View errors and activity logs</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 