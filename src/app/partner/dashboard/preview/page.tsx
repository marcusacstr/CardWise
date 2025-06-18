'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  FaCreditCard, 
  FaChartLine, 
  FaUpload,
  FaUser,
  FaSignOutAlt,
  FaCog,
  FaEdit,
  FaBuilding
} from 'react-icons/fa'

interface PartnerConfig {
  id: string
  company_name: string
  subdomain: string
  primary_color: string
  secondary_color: string
  logo_url?: string
  welcome_title: string
  welcome_message: string
  contact_email: string
  contact_phone: string
  custom_css?: string
  is_active: boolean
}

interface CreditCard {
  id: string
  name: string
  issuer: string
  annual_fee: number
  welcome_bonus: number
  image_url?: string
  base_earn_rate: number
  reward_type: string
  point_value: number
  groceries_earn_rate?: number
  dining_earn_rate?: number
  travel_earn_rate?: number
  gas_earn_rate?: number
  application_url?: string
}

function PreviewPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  
  const [config, setConfig] = useState<PartnerConfig | null>(null)
  const [cards, setCards] = useState<CreditCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [currentCard] = useState({
    name: 'Scotia Gold American Express Card',
    issuer: 'Scotia Bank',
    annualFee: 120,
    estimatedAnnualRewards: 0
  })

  useEffect(() => {
    loadPreviewData()
  }, [searchParams])

  const loadPreviewData = async () => {
    try {
      // Try to get config from URL params first
      const configParam = searchParams.get('config')
      const cardsParam = searchParams.get('cards')
      
      if (configParam) {
        const parsedConfig = JSON.parse(decodeURIComponent(configParam))
        
        // Convert camelCase to snake_case for compatibility
        const normalizedConfig = {
          id: parsedConfig.id,
          company_name: parsedConfig.companyName || parsedConfig.company_name,
          subdomain: parsedConfig.subdomain,
          primary_color: parsedConfig.primaryColor || parsedConfig.primary_color,
          secondary_color: parsedConfig.secondaryColor || parsedConfig.secondary_color,
          logo_url: parsedConfig.logoUrl || parsedConfig.logo_url,
          welcome_title: parsedConfig.welcomeTitle || parsedConfig.welcome_title,
          welcome_message: parsedConfig.welcomeMessage || parsedConfig.welcome_message,
          contact_email: parsedConfig.contactEmail || parsedConfig.contact_email,
          contact_phone: parsedConfig.contactPhone || parsedConfig.contact_phone,
          custom_css: parsedConfig.customCss || parsedConfig.custom_css,
          is_active: parsedConfig.isActive !== undefined ? parsedConfig.isActive : parsedConfig.is_active
        }
        
        setConfig(normalizedConfig)
        
        if (cardsParam) {
          const cardIds = JSON.parse(decodeURIComponent(cardsParam))
          
          if (cardIds.length > 0) {
            // Load card details
            const { data: cardData, error } = await supabase
              .from('credit_cards')
              .select('*')
              .in('id', cardIds)
            
            if (error) throw error
            if (cardData) setCards(cardData)
          }
        }
      } else {
        // Fallback: Load from current user's partner data
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/signin')
          return
        }

        // Load partner info
        const { data: partner } = await supabase
          .from('partners')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (partner) {
          // Load portal config
          const { data: portalConfig } = await supabase
            .from('partner_portal_configs')
            .select('*')
            .eq('partner_id', partner.id)
            .single()

          if (portalConfig) {
            setConfig({
              id: portalConfig.id,
              company_name: portalConfig.company_name || partner.company_name,
              subdomain: portalConfig.domain || '',
              primary_color: portalConfig.primary_color || '#3B82F6',
              secondary_color: portalConfig.secondary_color || '#64748B',
              logo_url: portalConfig.logo_url || '',
              welcome_title: 'Find Your Perfect Credit Card',
              welcome_message: portalConfig.welcome_message || 'Get personalized recommendations based on your spending',
              contact_email: portalConfig.contact_email || partner.contact_email,
              contact_phone: portalConfig.phone_number || partner.contact_phone || '',
              custom_css: portalConfig.custom_css || '',
              is_active: !portalConfig.maintenance_mode
            })
          }

          // Load featured cards
          const { data: cardSelections } = await supabase
            .from('partner_card_selections')
            .select(`
              credit_cards (
                id,
                name,
                issuer,
                annual_fee,
                welcome_bonus,
                image_url,
                base_earn_rate,
                reward_type,
                point_value,
                groceries_earn_rate,
                dining_earn_rate,
                travel_earn_rate,
                gas_earn_rate,
                application_url
              )
            `)
            .eq('partner_id', partner.id)
            .eq('is_featured', true)
            .order('priority_order')

          if (cardSelections) {
            const cardsList = cardSelections
              .map((cs: any) => cs.credit_cards)
              .filter(Boolean)
              .flat() as CreditCard[]
            setCards(cardsList)
          }
        }
      }

      // Add some sample cards if none are selected (for preview purposes)
      if (cards.length === 0) {
        console.log('Loading sample cards for preview...')
        const { data: sampleCards, error: sampleError } = await supabase
          .from('credit_cards')
          .select('*')
          .limit(3)

        console.log('Sample cards loaded:', { sampleCards, sampleError })
        if (sampleCards) {
          setCards(sampleCards)
        }
      }

    } catch (error) {
      console.error('Error loading preview data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderBottomColor: config?.primary_color || '#10B981' }}></div>
      </div>
    )
  }

  const primaryColor = config?.primary_color || '#10B981'
  const logoUrl = config?.logo_url
  const companyName = config?.company_name || 'Your Company'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom CSS */}
      {config?.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: config.custom_css }} />
      )}

      {/* Preview Header */}
      <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              Preview Mode
            </div>
            <span className="text-sm text-yellow-700">
              This is how your custom user dashboard will look to clients
            </span>
          </div>
          <button
            onClick={() => router.back()}
            className="text-sm text-yellow-700 hover:text-yellow-900 font-medium"
          >
            ← Back to Portal Builder
          </button>
        </div>
      </div>

      {/* Main Dashboard Header */}
      <div className="bg-white shadow-sm border-b-4" style={{ borderBottomColor: primaryColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Company Logo" 
                  className="h-8 w-8 mr-3 object-contain"
                />
              ) : (
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="text-white font-bold text-sm">
                    {companyName.charAt(0)}
                  </span>
                </div>
              )}
              <h1 className="text-xl font-bold" style={{ color: primaryColor }}>
                {companyName} CardWise
              </h1>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-gray-700 transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <FaUser className="w-4 h-4" style={{ color: primaryColor }} />
                </div>
                <span className="text-sm font-medium">john.smith</span>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                    Demo User Account
                  </div>
                  
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <FaCog className="w-4 h-4" />
                      <span>Settings</span>
                    </div>
                  </button>
                  
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <FaBuilding className="w-4 h-4" />
                      <span>Become a Partner</span>
                    </div>
                  </a>
                  
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <FaSignOutAlt className="w-4 h-4" />
                      <span>Sign Out</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 p-6 rounded-lg border-l-4" style={{ 
          backgroundColor: `${primaryColor}08`, 
          borderLeftColor: primaryColor 
        }}>
          <h2 className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>
            Welcome back, John!
          </h2>
          <p className="text-gray-700">
            {config?.welcome_message || 'Optimize your credit card rewards with AI-powered recommendations'}
          </p>
          
          {/* Debug Section - Remove in production */}
          {process.env.NODE_ENV === 'development' && config && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
              <p><strong>Debug:</strong> Primary Color: <span style={{ color: primaryColor }}>{primaryColor}</span></p>
              <p>Secondary Color: {config.secondary_color}</p>
              <p>Company: {companyName}</p>
            </div>
          )}
        </div>

        {/* Upload more statements section - Show after analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Upload More Statements</h3>
              <p className="text-sm text-gray-500">Add more months of data for better insights and accuracy</p>
            </div>
            <div className="flex space-x-3">
              <button
                className="text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                Upload New Statement
              </button>
              <button 
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                Manual Entry
              </button>
            </div>
          </div>
        </div>

        {/* Current Card Section */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-t border-r border-b p-6 mb-8" style={{ borderLeftColor: primaryColor, borderTopColor: '#e5e7eb', borderRightColor: '#e5e7eb', borderBottomColor: '#e5e7eb' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: primaryColor }}>Current Card</h3>
            <button
              className="font-medium text-sm flex items-center space-x-1 hover:opacity-80 transition-colors"
              style={{ color: primaryColor }}
            >
              <FaEdit className="text-xs" />
              <span>Change Card</span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                <FaCreditCard className="text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{currentCard.name}</p>
                <p className="text-sm text-gray-500">
                  {currentCard.issuer} - {currentCard.annualFee === 0 ? 'Free' : `$${currentCard.annualFee}/year`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(currentCard.estimatedAnnualRewards)}
              </p>
              <p className="text-sm text-gray-500">Annual Rewards</p>
              {currentCard.estimatedAnnualRewards === 0 && (
                <p className="text-xs text-orange-600 mt-1">Upload spending data for calculation</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Potential Annual Rewards</p>
                <p className="text-3xl font-bold text-gray-900">$1,247</p>
                <p className="text-sm text-gray-500">With recommended card</p>
              </div>
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <FaChartLine className="text-xl" style={{ color: primaryColor }} />
              </div>
            </div>
            <div className="mt-2 text-sm font-medium" style={{ color: primaryColor }}>
              +$1,247 improvement
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Current Card Value</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(currentCard.estimatedAnnualRewards)}
                </p>
                <p className="text-sm text-gray-500">{currentCard.name}</p>
              </div>
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <FaCreditCard className="text-xl" style={{ color: primaryColor }} />
              </div>
            </div>
          </div>
        </div>

        {/* Your Spending Analysis */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border-l-4 border-t border-r border-b p-6" style={{ borderLeftColor: primaryColor, borderTopColor: '#e5e7eb', borderRightColor: '#e5e7eb', borderBottomColor: '#e5e7eb' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold" style={{ color: primaryColor }}>Your Spending Analysis</h3>
              <div className="text-sm text-gray-600">
                Showing current month analysis
              </div>
            </div>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div 
                className="text-white p-4 rounded-lg"
                style={{ background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}dd)` }}
              >
                <p className="text-sm font-medium opacity-90">Total Transactions</p>
                <p className="text-2xl font-bold">142</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
                <p className="text-sm font-medium opacity-90">Total Spent</p>
                <p className="text-2xl font-bold">$3,847</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
                <p className="text-sm font-medium opacity-90">Avg Transaction</p>
                <p className="text-2xl font-bold">$27.12</p>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
                <p className="text-sm font-medium opacity-90">Top Category</p>
                <p className="text-lg font-bold">Groceries</p>
                <p className="text-sm opacity-90">$1,254</p>
              </div>
            </div>

            {/* Category Breakdown */}
            <div>
              <h4 className="text-lg font-semibold mb-4" style={{ color: primaryColor }}>Spending by Category</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { category: 'Groceries', amount: 1254, percentage: 32.6, count: 28 },
                  { category: 'Dining', amount: 987, percentage: 25.7, count: 31 },
                  { category: 'Gas', amount: 523, percentage: 13.6, count: 12 },
                  { category: 'Shopping', amount: 468, percentage: 12.2, count: 19 },
                  { category: 'Travel', amount: 385, percentage: 10.0, count: 8 },
                  { category: 'Entertainment', amount: 230, percentage: 5.9, count: 14 }
                ].map((category) => (
                  <div 
                    key={category.category} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4"
                    style={{ borderLeftColor: primaryColor }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">{category.category}</span>
                        <span className="text-sm text-gray-500">{category.percentage}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold" style={{ color: primaryColor }}>
                          {formatCurrency(category.amount)}
                        </span>
                        <span className="text-sm text-gray-500">({category.count} transactions)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${category.percentage}%`,
                            backgroundColor: primaryColor
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Card Recommendations - After Analysis */}
        <div 
          className="rounded-lg shadow-sm border p-6 mb-8"
          style={{ 
            backgroundColor: '#f0fdf4',
            borderColor: primaryColor + '33'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div 
                className="p-2 rounded-full mr-3"
                style={{ backgroundColor: primaryColor + '20' }}
              >
                <FaCreditCard className="text-lg" style={{ color: primaryColor }} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">🎯 Your Top Recommendation</h3>
                <p className="text-sm text-gray-600">Based on your spending analysis</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Analysis Period: 142 transactions</div>
              <div className="text-xs" style={{ color: primaryColor }}>Projected to annual estimates</div>
            </div>
          </div>
          
          {/* Primary Recommendation */}
          <div className="bg-white border-2 rounded-lg p-6 shadow-md mb-4" style={{ borderColor: primaryColor + '66' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                    style={{ backgroundColor: primaryColor + '20' }}
                  >
                    <span className="font-bold text-lg" style={{ color: primaryColor }}>#1</span>
                  </div>
                  <div className="text-xs text-gray-500">Match</div>
                  <div className="text-sm font-bold" style={{ color: primaryColor }}>94%</div>
                </div>
                <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <FaCreditCard className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-lg">
                    {cards.length > 0 ? cards[0].name : 'Chase Sapphire Preferred'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {cards.length > 0 ? `${cards[0].issuer} - $${cards[0].annual_fee}/year` : 'Chase - $95/year'}
                  </p>
                  
                  {/* Reward breakdown */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">2x Dining</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">2x Travel</span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">1x Base Rate</span>
                  </div>

                  {/* Explanation */}
                  <div 
                    className="mt-3 p-3 rounded-lg"
                    style={{ backgroundColor: primaryColor + '10' }}
                  >
                    <p className="text-sm font-medium mb-1" style={{ color: primaryColor.replace('#', '') === '10B981' ? '#059669' : primaryColor }}>
                      Why this card works for you:
                    </p>
                    <p className="text-sm" style={{ color: primaryColor.replace('#', '') === '10B981' ? '#065f46' : primaryColor + 'dd' }}>
                      Your high dining spend ($987/month) and travel purchases ($385/month) make this card ideal for maximizing 2x rewards in these categories.
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 mt-3">
                    <p className="text-sm font-medium" style={{ color: primaryColor }}>
                      ▲ Est. Annual Rewards: $1,247
                    </p>
                    <p className="text-sm" style={{ color: primaryColor }}>
                      + Welcome Bonus: $800
                    </p>
                  </div>
                  <p className="text-sm font-medium mt-1" style={{ color: primaryColor.replace('#', '') === '10B981' ? '#059669' : primaryColor }}>
                    +$1,247 more than your current card annually
                  </p>
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="text-2xl font-bold mb-1" style={{ color: primaryColor }}>
                  $1,247/year
                </div>
                <div className="text-xs text-gray-500 mb-3">Net Benefit</div>
                <button 
                  className="text-white px-6 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>

          {/* Additional recommendations */}
          {cards.length > 1 && (
            <div className="space-y-2">
              <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                      <span className="text-gray-600 font-bold text-sm">#2</span>
                    </div>
                    <div className="text-xs text-gray-500">Match</div>
                    <div className="text-sm font-bold text-gray-600">87%</div>
                  </div>
                  <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <FaCreditCard className="text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {cards.length > 1 ? cards[1].name : 'American Express Gold Card'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {cards.length > 1 ? `${cards[1].issuer} - $${cards[1].annual_fee}/year` : 'American Express - $250/year'}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-sm font-medium" style={{ color: primaryColor }}>
                        ▲ Est. Annual Rewards: $1,156
                      </p>
                      <p className="text-sm" style={{ color: primaryColor }}>
                        + Welcome Bonus: $600
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold mb-1" style={{ color: primaryColor }}>
                    $1,156/year
                  </div>
                  <div className="text-xs text-gray-500 mb-2">Net Benefit</div>
                  <button 
                    className="text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm hover:opacity-90"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
                     )}
        </div>

        {/* Monthly Rewards Comparison Chart */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-t border-r border-b p-6 mb-8" style={{ borderLeftColor: primaryColor, borderTopColor: '#e5e7eb', borderRightColor: '#e5e7eb', borderBottomColor: '#e5e7eb' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: primaryColor }}>Monthly Rewards Comparison</h3>
              <p className="text-sm text-gray-500">Your current card vs. our top recommendation</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              Data available for: {new Date().toLocaleString('default', { month: 'short' })}
            </div>
          </div>
          
          <div className="relative">
            {/* Y-axis labels and chart */}
            <div className="flex">
              {/* Y-axis */}
              <div className="flex flex-col justify-between h-64 py-4 pr-4 text-xs text-gray-500">
                {[200, 150, 100, 50, 0].map(value => (
                  <div key={value} className="flex items-center">
                    <span className="w-8 text-right">${value}</span>
                    <div className="w-2 h-px bg-gray-300 ml-1"></div>
                  </div>
                ))}
              </div>
              
              {/* Chart area */}
              <div className="flex-1 relative">
                {/* Grid lines */}
                <div className="absolute inset-0">
                  {[0, 25, 50, 75, 100].map(percent => (
                    <div 
                      key={percent}
                      className="absolute w-full border-t border-gray-200"
                      style={{ bottom: `${percent}%` }}
                    ></div>
                  ))}
                </div>
                
                {/* Bars */}
                <div className="h-64 flex items-end space-x-4 relative z-10">
                  {[
                    { month: 'Jan', current: 45, recommended: 125 },
                    { month: 'Feb', current: 52, recommended: 140 },
                    { month: 'Mar', current: 38, recommended: 115 },
                    { month: 'Apr', current: 41, recommended: 132 },
                    { month: 'May', current: 48, recommended: 138 },
                    { month: 'Jun', current: 44, recommended: 128 }
                  ].map((data) => {
                    const maxValue = 200; // Fixed scale to $200
                    
                    return (
                      <div key={data.month} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex justify-center items-end space-x-1 h-56">
                          <div 
                            className="bg-green-400 rounded-t flex-1 min-h-[4px]" 
                            style={{ height: `${Math.min((data.current / maxValue) * 100, 100)}%` }}
                            title={`Current: $${data.current}/month`}
                          ></div>
                          <div 
                            className="rounded-t flex-1 min-h-[4px]" 
                            style={{ 
                              height: `${Math.min((data.recommended / maxValue) * 100, 100)}%`,
                              backgroundColor: primaryColor
                            }}
                            title={`Recommended: $${data.recommended}/month`}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-2">{data.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: primaryColor }}
              ></div>
              <span className="text-sm text-gray-600">Recommended Card</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span className="text-sm text-gray-600">Current Card</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 p-6 rounded-lg text-center border-t-4" style={{ 
          backgroundColor: `${primaryColor}08`, 
          borderTopColor: primaryColor 
        }}>
          <p className="text-sm font-medium" style={{ color: primaryColor }}>
            © 2024 {companyName}. Powered by CardWise Platform.
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Your trusted partner for credit card optimization
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <PreviewPageContent />
    </Suspense>
  )
}
