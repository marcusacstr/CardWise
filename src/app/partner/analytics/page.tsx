'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  FaArrowLeft, 
  FaUsers, 
  FaCreditCard, 
  FaDollarSign,
  FaEye,
  FaChartLine,
  FaCalendarAlt,
  FaGlobe,
  FaExternalLinkAlt,
  FaSpinner,
  FaChartBar,
  FaPercentage
} from 'react-icons/fa'

interface PortalAnalytics {
  id: string
  portal_name: string
  subdomain: string
  totalVisitors: number
  uniqueVisitors: number
  cardApplications: number
  totalCommissions: number
  conversionRate: string
  recentActivity: Array<{
    date: string
    visitors: number
    applications: number
  }>
}

interface ApplicationData {
  id: string
  card_name: string
  user_email: string
  status: string
  created_at: string
  commission_amount: number
}

export default function PartnerAnalytics() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('30')
  const [portalsAnalytics, setPortalsAnalytics] = useState<PortalAnalytics[]>([])
  const [recentApplications, setRecentApplications] = useState<ApplicationData[]>([])
  const [totalStats, setTotalStats] = useState({
    totalVisitors: 0,
    totalApplications: 0,
    totalCommissions: 0,
    averageConversion: 0
  })

  useEffect(() => {
    loadAnalytics()
  }, [selectedTimeframe])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      // Get current partner
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/partner/auth')
        return
      }

      const { data: partner, error: partnerError } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (partnerError || !partner) {
        console.error('Partner not found:', partnerError)
        return
      }

      // Calculate date range
      const daysAgo = parseInt(selectedTimeframe)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysAgo)

      // Get all portals with analytics
      const { data: portals, error: portalsError } = await supabase
        .from('partner_portals')
        .select('*')
        .eq('partner_id', partner.id)

      if (portalsError) {
        console.error('Error fetching portals:', portalsError)
        return
      }

      // Get analytics for each portal
      const analyticsPromises = (portals || []).map(async (portal) => {
        // Get visitor count
        const { count: totalVisitors } = await supabase
          .from('partner_user_sessions')
          .select('*', { count: 'exact' })
          .eq('portal_id', portal.id)
          .gte('created_at', startDate.toISOString())

        // Get unique visitors
        const { data: visitorEmails } = await supabase
          .from('partner_user_sessions')
          .select('user_email')
          .eq('portal_id', portal.id)
          .gte('created_at', startDate.toISOString())
          .not('user_email', 'eq', 'system')

        const uniqueVisitors = new Set((visitorEmails || []).map(v => v.user_email)).size

        // Get applications
        const { count: cardApplications } = await supabase
          .from('partner_card_applications')
          .select('*', { count: 'exact' })
          .eq('portal_id', portal.id)
          .gte('created_at', startDate.toISOString())

        // Get commissions
        const { data: commissions } = await supabase
          .from('partner_commissions')
          .select('amount')
          .eq('partner_id', partner.id)
          .gte('created_at', startDate.toISOString())
          .in('status', ['approved', 'paid'])

        const totalCommissions = (commissions || []).reduce(
          (sum, comm) => sum + parseFloat(comm.amount || '0'), 0
        )

        // Calculate conversion rate
        const conversionRate = totalVisitors && totalVisitors > 0 
          ? ((cardApplications || 0) / totalVisitors * 100).toFixed(2)
          : '0.00'

        // Get daily activity for chart
        const recentActivity = []
        for (let i = daysAgo; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dayStart = new Date(date.setHours(0, 0, 0, 0))
          const dayEnd = new Date(date.setHours(23, 59, 59, 999))

          const { count: dayVisitors } = await supabase
            .from('partner_user_sessions')
            .select('*', { count: 'exact' })
            .eq('portal_id', portal.id)
            .gte('created_at', dayStart.toISOString())
            .lte('created_at', dayEnd.toISOString())

          const { count: dayApplications } = await supabase
            .from('partner_card_applications')
            .select('*', { count: 'exact' })
            .eq('portal_id', portal.id)
            .gte('created_at', dayStart.toISOString())
            .lte('created_at', dayEnd.toISOString())

          recentActivity.push({
            date: dayStart.toISOString().split('T')[0],
            visitors: dayVisitors || 0,
            applications: dayApplications || 0
          })
        }

        return {
          id: portal.id,
          portal_name: portal.portal_name,
          subdomain: portal.subdomain,
          totalVisitors: totalVisitors || 0,
          uniqueVisitors,
          cardApplications: cardApplications || 0,
          totalCommissions,
          conversionRate,
          recentActivity
        }
      })

      const analytics = await Promise.all(analyticsPromises)
      setPortalsAnalytics(analytics)

      // Calculate total stats
      const totals = analytics.reduce((acc, portal) => ({
        totalVisitors: acc.totalVisitors + portal.totalVisitors,
        totalApplications: acc.totalApplications + portal.cardApplications,
        totalCommissions: acc.totalCommissions + portal.totalCommissions,
        averageConversion: 0 // Will calculate after
      }), { totalVisitors: 0, totalApplications: 0, totalCommissions: 0, averageConversion: 0 })

      totals.averageConversion = totals.totalVisitors > 0 
        ? totals.totalApplications / totals.totalVisitors * 100 
        : 0

      setTotalStats(totals)

      // Get recent applications
      const { data: applications, error: appsError } = await supabase
        .from('partner_card_applications')
        .select(`
          id,
          user_email,
          status,
          created_at,
          commission_amount,
          credit_cards (name)
        `)
        .eq('partner_id', partner.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(10)

      if (!appsError && applications) {
        const formattedApps = applications.map((app: any) => ({
          id: app.id,
          card_name: app.credit_cards?.name || 'Unknown Card',
          user_email: app.user_email,
          status: app.status,
          created_at: app.created_at,
          commission_amount: app.commission_amount || 0
        }))
        setRecentApplications(formattedApps)
      }

    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/partner/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Track your portal performance and earnings
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaUsers className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalStats.totalVisitors.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaCreditCard className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalStats.totalApplications.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaDollarSign className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${totalStats.totalCommissions.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaPercentage className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalStats.averageConversion.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Portal Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Portal Performance</h3>
            {portalsAnalytics.length === 0 ? (
              <div className="text-center py-8">
                <FaGlobe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No portals found</p>
                <Link
                  href="/partner/portal"
                  className="text-green-600 hover:text-green-700 mt-2 inline-block"
                >
                  Create your first portal
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {portalsAnalytics.map((portal) => (
                  <div key={portal.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{portal.portal_name}</h4>
                        <p className="text-sm text-blue-600">{portal.subdomain}.cardwise-demo.com</p>
                      </div>
                      <a
                        href={`https://${portal.subdomain}.cardwise-demo.com`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <FaExternalLinkAlt className="h-4 w-4" />
                      </a>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{portal.totalVisitors}</p>
                        <p className="text-xs text-gray-600">Visitors</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{portal.cardApplications}</p>
                        <p className="text-xs text-gray-600">Applications</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">${portal.totalCommissions.toFixed(0)}</p>
                        <p className="text-xs text-gray-600">Earnings</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-600">{portal.conversionRate}%</p>
                        <p className="text-xs text-gray-600">Conversion</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Applications</h3>
            {recentApplications.length === 0 ? (
              <div className="text-center py-8">
                <FaCreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No applications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{app.card_name}</p>
                      <p className="text-sm text-gray-600">{app.user_email}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        app.status === 'approved' ? 'bg-green-100 text-green-800' :
                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {app.status}
                      </span>
                      {app.commission_amount > 0 && (
                        <p className="text-sm font-medium text-green-600 mt-1">
                          +${app.commission_amount.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 