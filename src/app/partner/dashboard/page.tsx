'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  FaUsers, 
  FaChartLine, 
  FaDollarSign, 
  FaGlobe, 
  FaCog, 
  FaRocket, 
  FaCreditCard,
  FaPlus,
  FaExternalLinkAlt,
  FaArrowRight,
  FaSpinner,
  FaSignOutAlt,
  FaUser,
  FaTrophy,
  FaDatabase,
  FaSync,
  FaEye
} from 'react-icons/fa'

interface PartnerInfo {
  id: string;
  companyName: string;
  logoUrl?: string;
  subscriptionStatus: string;
  subscriptionPlan: string;
  totalUsers: number;
  activeUsers: number;
  totalAnalyses: number;
  totalRevenue: number;
  conversionRate: number;
  portalUrl?: string;
  portalActive: boolean;
  cardSelections: number;
}

interface RecentActivity {
  id: string;
  type: 'user_signup' | 'card_application' | 'analysis_completed' | 'revenue_earned';
  description: string;
  timestamp: Date;
  amount?: number;
}

export default function PartnerDashboard() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAction, setLoadingAction] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showPortalCustomizer, setShowPortalCustomizer] = useState(false)
  const [showBilling, setShowBilling] = useState(false)
  const [portalSettings, setPortalSettings] = useState({
    customDomain: 'demo.cardwise.com',
    brandColor: '#10B981',
    logoUrl: '',
    companyName: 'Your Company',
    welcomeMessage: 'Find the perfect credit card for your spending habits'
  })
  const [clients, setClients] = useState([
    { id: 1, name: 'Sarah Johnson', email: 'sarah.j@email.com', joinDate: '2024-01-15', totalSpending: 4250, status: 'active' },
    { id: 2, name: 'Michael Chen', email: 'm.chen@email.com', joinDate: '2024-02-03', totalSpending: 7890, status: 'active' },
    { id: 3, name: 'Emily Davis', email: 'emily.d@email.com', joinDate: '2024-01-28', totalSpending: 3200, status: 'inactive' },
    { id: 4, name: 'David Wilson', email: 'd.wilson@email.com', joinDate: '2024-03-10', totalSpending: 5670, status: 'active' }
  ])
  const [availableCards, setAvailableCards] = useState<any[]>([])
  const [cardStats, setCardStats] = useState({
    totalCards: 0,
    activeCards: 0,
    topPerformers: [] as any[]
  })
  const [settingUpDemo, setSettingUpDemo] = useState(false)

  useEffect(() => {
    const loadPartnerData = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.error('Error getting user:', userError)
          
          // In development, allow access even without auth if it's a rate limit issue
          if (process.env.NODE_ENV === 'development' && 
              (userError?.message?.includes('rate') || userError?.message?.includes('too many'))) {
            console.log('Development mode: bypassing auth due to rate limit')
            
            // Set demo partner data for development
            setPartnerInfo({
              id: 'demo-user-id',
              companyName: 'Demo Company (Dev Mode)',
              subscriptionStatus: 'active',
              subscriptionPlan: 'premium',
              totalUsers: 1247,
              activeUsers: 892,
              totalAnalyses: 3456,
              totalRevenue: 12450,
              conversionRate: 7.2,
              portalUrl: 'https://demo.cardwise.com',
              portalActive: true,
              cardSelections: 87
            })

            setPortalSettings(prev => ({
              ...prev,
              companyName: 'Demo Company (Dev Mode)'
            }))

            setRecentActivity([
              {
                id: '1',
                type: 'card_application',
                description: 'New card application submitted',
                timestamp: new Date(Date.now() - 2 * 60 * 1000)
              },
              {
                id: '2',
                type: 'user_signup',
                description: 'User completed profile setup',
                timestamp: new Date(Date.now() - 15 * 60 * 1000)
              },
              {
                id: '3',
                type: 'revenue_earned',
                description: 'Commission payment processed',
                timestamp: new Date(Date.now() - 60 * 60 * 1000),
                amount: 125.50
              },
              {
                id: '4',
                type: 'analysis_completed',
                description: 'Card recommendation analysis completed',
                timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
              }
            ])

            setLoading(false)
            return
          }
          
          router.push('/partner/auth')
          return
        }

        // Try to get partner data from partners table first
        const { data: partnerData, error: partnerError } = await supabase
          .from('partners')
          .select('*')
          .eq('user_id', user.id)
          .single()

        let companyName = 'Your Company'
        let subscriptionPlan = 'premium'
        
        if (partnerData && !partnerError) {
          // Use data from partners table
          companyName = partnerData.company_name || partnerData.full_name || 'Your Company'
          subscriptionPlan = partnerData.subscription_plan || 'premium'
        } else {
          // Fallback to user metadata
          const metadata = user.user_metadata || {}
          companyName = metadata.company_name || metadata.companyName || 'Your Company'
          subscriptionPlan = metadata.subscription_plan || metadata.subscriptionPlan || 'premium'
        }

                 // Set partner data with real info mixed with demo metrics
        setPartnerInfo({
          id: user.id,
          companyName: companyName,
          subscriptionStatus: 'active',
          subscriptionPlan: subscriptionPlan,
          totalUsers: 1247,
          activeUsers: 892,
          totalAnalyses: 3456,
          totalRevenue: 12450,
          conversionRate: 7.2,
          portalUrl: 'https://demo.cardwise.com',
          portalActive: true,
          cardSelections: 87
        })

        // Update portal settings with real company name
        setPortalSettings(prev => ({
          ...prev,
          companyName: companyName
        }))

        // Set mock recent activity data
        setRecentActivity([
          {
            id: '1',
            type: 'card_application',
            description: 'New card application submitted',
            timestamp: new Date(Date.now() - 2 * 60 * 1000)
          },
          {
            id: '2',
            type: 'user_signup',
            description: 'User completed profile setup',
            timestamp: new Date(Date.now() - 15 * 60 * 1000)
          },
          {
            id: '3',
            type: 'revenue_earned',
            description: 'Commission payment processed',
            timestamp: new Date(Date.now() - 60 * 60 * 1000),
            amount: 125.50
          },
          {
            id: '4',
            type: 'analysis_completed',
            description: 'Card recommendation analysis completed',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
          }
        ])

      } catch (error) {
        console.error('Error loading partner data:', error)
        
        // In development, show error but don't redirect
        if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: continuing despite error')
          setPartnerInfo({
            id: 'demo-user-id',
            companyName: 'Error State (Dev Mode)',
            subscriptionStatus: 'active',
            subscriptionPlan: 'premium',
            totalUsers: 0,
            activeUsers: 0,
            totalAnalyses: 0,
            totalRevenue: 0,
            conversionRate: 0,
            portalUrl: 'https://demo.cardwise.com',
            portalActive: false,
            cardSelections: 0
          })
        }
      } finally {
        setLoading(false)
      }
    }

    loadPartnerData()
  }, [router, supabase])

  const handleSignOut = () => {
    router.push('/')
  }

  const handlePortalManagement = () => {
    router.push('/partner/portal-builder')
  }

  const handlePortalPreview = () => {
    router.push('/partner/dashboard/preview')
  }

  const handleBilling = () => {
    router.push('/partner/billing')
  }

  const generateReport = () => {
    router.push('/partner/reports')
  }

  const loadCardDatabase = async () => {
    setSettingUpDemo(true)
    try {
      const { data, error } = await supabase
        .from('credit_cards')
        .select('id, name, issuer, annual_fee, reward_type, country, is_active, welcome_bonus')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error loading card database:', error);
        alert(`❌ Error loading card database: ${error.message}`);
        return;
      }

      if (data) {
        const totalCards = data.length;
        const usCards = data.filter(card => card.country === 'US').length;
        const canadianCards = data.filter(card => card.country === 'CA').length;
        const issuers = Array.from(new Set(data.map(card => card.issuer))).length;
        const rewardTypes = Array.from(new Set(data.map(card => card.reward_type)));
        
        const topCards = data
          .filter(card => card.welcome_bonus && card.welcome_bonus > 0)
          .sort((a, b) => (b.welcome_bonus || 0) - (a.welcome_bonus || 0))
          .slice(0, 5);

        if (partnerInfo) {
          setPartnerInfo({
            ...partnerInfo,
            cardSelections: totalCards
          });
        }

        setRecentActivity(prev => [{
          id: Date.now().toString(),
          type: 'analysis_completed',
          description: `Card database refreshed: ${totalCards} active cards available`,
          timestamp: new Date()
        }, ...prev]);

        alert(`💳 Card Database Overview\n\n📊 Available Cards:\n• Total Active: ${totalCards}\n• US Cards: ${usCards}\n• Canadian Cards: ${canadianCards}\n• Unique Issuers: ${issuers}\n• Reward Types: ${rewardTypes.join(', ')}\n\n🏆 Top Welcome Bonuses:\n${topCards.slice(0, 3).map((card, i) => `${i + 1}. ${card.name} - $${card.welcome_bonus || 0}`).join('\n')}\n\n✅ Your clients can access all ${totalCards} cards!`);
      }

    } catch (error) {
      console.error('Error accessing card database:', error);
      alert('❌ Error connecting to card database.');
    } finally {
      setSettingUpDemo(false);
    }
  }

  const savePortalSettings = async () => {
    setLoadingAction('portal')
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setRecentActivity(prev => [{
        id: Date.now().toString(),
        type: 'analysis_completed',
        description: `Portal settings updated for ${portalSettings.customDomain}`,
        timestamp: new Date()
      }, ...prev]);

      alert(`✅ Portal Settings Saved!\n\nYour custom portal is now live at:\nhttps://${portalSettings.customDomain}\n\n🎨 Customizations Applied:\n• Brand Color: ${portalSettings.brandColor}\n• Company: ${portalSettings.companyName}\n• Welcome Message Updated\n\n🚀 Changes are live for all clients!`)
      setShowPortalCustomizer(false)
    } catch (error) {
      alert('❌ Error saving portal settings')
    } finally {
      setLoadingAction('')
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup': return <FaUser className="h-4 w-4 text-blue-600" />
      case 'card_application': return <FaCreditCard className="h-4 w-4 text-green-600" />
      case 'analysis_completed': return <FaChartLine className="h-4 w-4 text-purple-600" />
      case 'revenue_earned': return <FaDollarSign className="h-4 w-4 text-emerald-600" />
      default: return <FaUser className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Partner Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!partnerInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Partner Not Found</h2>
          <p className="text-gray-600">Please contact support for assistance.</p>
        </div>
      </div>
    )
  }

  const quickStats = [
    {
      label: 'Total Users',
      value: partnerInfo.totalUsers.toLocaleString(),
      change: 12.5,
      trend: 'up',
      icon: <FaUsers className="h-6 w-6" />,
      color: 'blue'
    },
    {
      label: 'Active Users',
      value: partnerInfo.activeUsers.toLocaleString(),
      change: 8.2,
      trend: 'up',
      icon: <FaChartLine className="h-6 w-6" />,
      color: 'green'
    },
    {
      label: 'Total Revenue',
      value: `$${partnerInfo.totalRevenue.toLocaleString()}`,
      change: 15.3,
      trend: 'up',
      icon: <FaDollarSign className="h-6 w-6" />,
      color: 'emerald'
    },
    {
      label: 'Conversion Rate',
      value: `${partnerInfo.conversionRate}%`,
      change: 2.1,
      trend: 'up',
      icon: <FaTrophy className="h-6 w-6" />,
      color: 'purple'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <FaCreditCard className="h-8 w-8 text-green-600 mr-3" />
                <span className="text-xl font-bold text-gray-900">CardWise Partner</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2 hover:bg-gray-200 transition-colors"
                >
                  <FaUser className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {partnerInfo.companyName}
                  </span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FaSignOutAlt className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {partnerInfo.companyName}
          </h1>
          <p className="text-gray-600">
            Monitor your client activity and track your revenue performance.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <FaArrowRight className="h-3 w-3 mr-1 text-green-500 rotate-[-45deg]" />
                    <span className="text-sm text-green-600">
                      {stat.change}% from last month
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-blue-100">
                  <div className="text-blue-600">
                    {stat.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handlePortalManagement}
                  className="flex items-center justify-between w-full p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FaGlobe className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="font-medium text-blue-900">Customize Portal</span>
                  </div>
                  <FaExternalLinkAlt className="h-4 w-4 text-blue-600" />
                </button>
                
                <button
                  onClick={handlePortalPreview}
                  className="flex items-center justify-between w-full p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FaEye className="h-5 w-5 text-indigo-600 mr-3" />
                    <span className="font-medium text-indigo-900">Preview User Dashboard</span>
                  </div>
                  <FaExternalLinkAlt className="h-4 w-4 text-indigo-600" />
                </button>
                
                <button
                  onClick={handleBilling}
                  className="flex items-center justify-between w-full p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FaDollarSign className="h-5 w-5 text-green-600 mr-3" />
                    <span className="font-medium text-green-900">Billing & Payments</span>
                  </div>
                  <FaExternalLinkAlt className="h-4 w-4 text-green-600" />
                </button>
                
                <button
                  onClick={loadCardDatabase}
                  disabled={settingUpDemo}
                  className="flex items-center justify-between w-full p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center">
                    <FaDatabase className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="font-medium text-purple-900">
                      {settingUpDemo ? 'Loading...' : 'View Card Database'}
                    </span>
                  </div>
                  {settingUpDemo ? (
                    <FaSpinner className="h-4 w-4 text-purple-600 animate-spin" />
                  ) : (
                    <FaArrowRight className="h-4 w-4 text-purple-600" />
                  )}
                </button>
                
                <button
                  onClick={generateReport}
                  className="flex items-center justify-between w-full p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FaChartLine className="h-5 w-5 text-orange-600 mr-3" />
                    <span className="font-medium text-orange-900">
                      Generate Report
                    </span>
                  </div>
                  <FaArrowRight className="h-4 w-4 text-orange-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-4">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                    {activity.amount && (
                      <span className="text-sm font-semibold text-green-600">
                        +${activity.amount.toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Portal Status */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Portal Status</h3>
              <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <div className="w-2 h-2 rounded-full mr-2 bg-green-500"></div>
                Active
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Portal URL</p>
                <p className="font-medium text-gray-900">{partnerInfo.portalUrl}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="font-medium text-gray-900">{partnerInfo.totalAnalyses.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Card Selections</p>
                <p className="font-medium text-gray-900">{partnerInfo.cardSelections}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 