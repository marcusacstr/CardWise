'use client'

import React, { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  FaCreditCard, 
  FaChartLine, 
  FaUpload, 
  FaStar, 
  FaDollarSign,
  FaPercentage,
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaGift,
  FaShieldAlt,
  FaCalculator,
  FaLightbulb
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

interface CustomUserDashboardProps {
  partnerId?: string
  partnerConfig?: PartnerConfig
  featuredCards?: CreditCard[]
  previewMode?: boolean
}

export default function CustomUserDashboard({ 
  partnerId, 
  partnerConfig, 
  featuredCards = [], 
  previewMode = false 
}: CustomUserDashboardProps) {
  const [config, setConfig] = useState<PartnerConfig | null>(partnerConfig || null)
  const [cards, setCards] = useState<CreditCard[]>(featuredCards)
  const [loading, setLoading] = useState(!previewMode)
  const [activeTab, setActiveTab] = useState<'cards' | 'analysis' | 'calculator'>('cards')
  const [spendingData, setSpendingData] = useState({
    groceries: 800,
    dining: 450,
    travel: 300,
    gas: 200,
    other: 500
  })
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!previewMode && partnerId) {
      loadPartnerData()
    }
  }, [partnerId, previewMode])

  const loadPartnerData = async () => {
    if (!partnerId) return

    try {
      // Load partner config
      const { data: portalConfig, error: configError } = await supabase
        .from('portal_configs')
        .select('*')
        .eq('partner_id', partnerId)
        .single()

      if (configError) throw configError

      setConfig(portalConfig)

      // Load featured cards
      const { data: cardSelections, error: cardError } = await supabase
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
        .eq('partner_id', partnerId)
        .eq('is_featured', true)
        .order('priority_order')

      if (cardError) throw cardError

      if (cardSelections) {
        setCards(cardSelections.map(cs => cs.credit_cards).filter(Boolean).flat())
      }

    } catch (error) {
      console.error('Error loading partner data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateRecommendations = () => {
    const totalSpending = Object.values(spendingData).reduce((sum, val) => sum + val, 0)
    
    return cards.map(card => {
      let monthlyEarnings = 0
      
      // Ensure all card fields are numbers with fallbacks
      const baseEarnRate = Number(card.base_earn_rate) || 1
      const groceriesRate = Number(card.groceries_earn_rate) || baseEarnRate
      const diningRate = Number(card.dining_earn_rate) || baseEarnRate
      const travelRate = Number(card.travel_earn_rate) || baseEarnRate
      const gasRate = Number(card.gas_earn_rate) || baseEarnRate
      const annualFee = Number(card.annual_fee) || 0
      const welcomeBonus = Number(card.welcome_bonus) || 0
      const pointValue = Number(card.point_value) || 0.01
      
      // Calculate earnings based on spending categories
      monthlyEarnings += spendingData.groceries * groceriesRate / 100
      monthlyEarnings += spendingData.dining * diningRate / 100
      monthlyEarnings += spendingData.travel * travelRate / 100
      monthlyEarnings += spendingData.gas * gasRate / 100
      monthlyEarnings += spendingData.other * baseEarnRate / 100
      
      const annualEarnings = monthlyEarnings * 12
      const cashValue = annualEarnings * pointValue
      const netValue = cashValue - annualFee
      const firstYearValue = netValue + welcomeBonus
      
      // Ensure all calculated values are numbers
      const safeMonthlyEarnings = Number(monthlyEarnings) || 0
      const safeAnnualEarnings = Number(annualEarnings) || 0
      const safeCashValue = Number(cashValue) || 0
      const safeNetValue = Number(netValue) || 0
      const safeFirstYearValue = Number(firstYearValue) || 0
      const safeScore = Number(safeFirstYearValue + safeNetValue * 0.5) || 0
      
      return {
        ...card,
        monthlyEarnings: safeMonthlyEarnings,
        annualEarnings: safeAnnualEarnings,
        cashValue: safeCashValue,
        netValue: safeNetValue,
        firstYearValue: safeFirstYearValue,
        score: safeScore
      }
    }).sort((a, b) => b.score - a.score)
  }

  const recommendations = calculateRecommendations()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const primaryColor = config?.primary_color || '#3B82F6'
  const secondaryColor = config?.secondary_color || '#64748B'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom CSS */}
      {config?.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: config.custom_css }} />
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {config?.logo_url && (
                <img 
                  src={config.logo_url} 
                  alt="Company Logo" 
                  className="h-12 w-auto object-contain"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {config?.welcome_title || 'Find Your Perfect Credit Card'}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {config?.welcome_message || 'Get personalized recommendations based on your spending'}
                </p>
              </div>
            </div>
            
            {previewMode && (
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                Preview Mode
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'cards', label: 'Recommended Cards', icon: FaCreditCard },
                { id: 'analysis', label: 'Spending Analysis', icon: FaChartLine },
                { id: 'calculator', label: 'Rewards Calculator', icon: FaCalculator }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  style={activeTab === tab.id ? { 
                    borderBottomColor: primaryColor, 
                    color: primaryColor 
                  } : {}}
                >
                  <tab.icon className="mr-2 h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'cards' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Recommended Credit Cards</h2>
              <p className="text-sm text-gray-600">
                {cards.length} cards available • Based on your spending profile
              </p>
            </div>

            {cards.length === 0 ? (
              <div className="text-center py-12">
                <FaCreditCard className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No cards available</h3>
                <p className="mt-1 text-sm text-gray-500">
                  The partner hasn't selected any featured cards yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((card, index) => (
                  <div
                    key={card.id}
                    className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Card Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {card.name}
                        </h3>
                        {index === 0 && (
                          <div 
                            className="px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: primaryColor }}
                          >
                            Best Match
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{card.issuer}</p>
                      
                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {card.welcome_bonus > 0 && (
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <FaGift className="mx-auto h-5 w-5 text-green-600 mb-1" />
                            <p className="text-xs text-gray-600">Welcome Bonus</p>
                            <p className="text-sm font-semibold text-green-600">
                              ${card.welcome_bonus}
                            </p>
                          </div>
                        )}
                        
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <FaDollarSign className="mx-auto h-5 w-5 text-blue-600 mb-1" />
                          <p className="text-xs text-gray-600">Annual Fee</p>
                          <p className="text-sm font-semibold text-blue-600">
                            ${card.annual_fee || 0}
                          </p>
                        </div>
                      </div>

                      {/* Earnings Breakdown */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Monthly Earnings:</span>
                          <span className="font-medium">{card.monthlyEarnings.toFixed(0)} pts</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Annual Value:</span>
                          <span className="font-medium text-green-600">${card.cashValue.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold">
                          <span className="text-gray-900">First Year Value:</span>
                          <span 
                            className="font-bold"
                            style={{ color: primaryColor }}
                          >
                            ${card.firstYearValue.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                      {card.application_url ? (
                        <a
                          href={card.application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Apply Now
                          <FaExternalLinkAlt className="ml-2 h-3 w-3" />
                        </a>
                      ) : (
                        <button
                          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          disabled={previewMode}
                        >
                          {previewMode ? 'Preview Mode' : 'Learn More'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Spending Analysis</h2>
            
            {/* Spending Input */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Monthly Spending Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(spendingData).map(([category, amount]) => (
                  <div key={category}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {category}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setSpendingData({
                          ...spendingData,
                          [category]: parseInt(e.target.value) || 0
                        })}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spending Breakdown Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Spending Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(spendingData).map(([category, amount]) => {
                  const total = Object.values(spendingData).reduce((sum, val) => sum + val, 0)
                  const percentage = total > 0 ? (amount / total) * 100 : 0
                  
                  return (
                    <div key={category} className="flex items-center">
                      <div className="w-20 text-sm text-gray-600 capitalize">{category}</div>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="h-3 rounded-full"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: primaryColor
                            }}
                          />
                        </div>
                      </div>
                      <div className="w-16 text-sm text-gray-900 text-right">
                        ${amount}
                      </div>
                      <div className="w-12 text-xs text-gray-500 text-right">
                        {percentage.toFixed(0)}%
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Rewards Calculator</h2>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Compare Card Rewards</h3>
              
              {cards.length === 0 ? (
                <div className="text-center py-8">
                  <FaCalculator className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    No cards available for comparison
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Card
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monthly Earnings
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Annual Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          First Year
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recommendations.slice(0, 5).map((card) => (
                        <tr key={card.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{card.name}</div>
                              <div className="text-sm text-gray-500">{card.issuer}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {card.monthlyEarnings.toFixed(0)} pts
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                            ${card.cashValue.toFixed(0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold" style={{ color: primaryColor }}>
                            ${card.firstYearValue.toFixed(0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {config?.logo_url && (
                <img 
                  src={config.logo_url} 
                  alt="Company Logo" 
                  className="h-8 w-auto object-contain"
                />
              )}
              <div>
                <p className="text-sm text-gray-600">
                  © 2024 {config?.company_name}. All rights reserved.
                </p>
                {config?.contact_email && (
                  <p className="text-xs text-gray-500">
                    Contact: {config.contact_email}
                  </p>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Powered by CardWise
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 