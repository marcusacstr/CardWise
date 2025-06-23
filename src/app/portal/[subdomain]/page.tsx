'use client'

import React, { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  FaStar, 
  FaCreditCard, 
  FaPlane, 
  FaShoppingCart, 
  FaGasPump, 
  FaUtensils,
  FaHome,
  FaGraduationCap,
  FaArrowRight,
  FaCheck,
  FaExternalLinkAlt,
  FaPercent,
  FaDollarSign,
  FaGift
} from 'react-icons/fa'

interface Partner {
  id: string;
  company_name: string;
  custom_app_name: string;
  custom_tagline: string;
  welcome_message: string;
  footer_text: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  logo_url: string;
  hide_cardwise_branding: boolean;
}

interface CreditCard {
  id: string;
  card_name: string;
  issuer: string;
  card_image_url: string;
  annual_fee: number;
  intro_apr: string;
  regular_apr: string;
  intro_bonus: string;
  bonus_requirement: string;
  rewards_rate: string;
  rewards_type: string;
  key_benefits: string[];
  best_for: string;
  affiliate_link?: string;
  custom_description?: string;
  featured: boolean;
  priority_order: number;
}

interface UserProfile {
  name: string;
  email: string;
  creditScore: string;
  annualIncome: string;
  primaryGoal: string;
}

interface SpendingCategory {
  name: string;
  icon: React.ReactNode;
  amount: number;
}

export default function WhiteLabelPortal({ params }: { params: { subdomain: string } }) {
  const [partner, setPartner] = useState<Partner | null>(null)
  const [cards, setCards] = useState<CreditCard[]>([])
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [recommendations, setRecommendations] = useState<CreditCard[]>([])
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    creditScore: '',
    annualIncome: '',
    primaryGoal: ''
  })

  const [spendingCategories, setSpendingCategories] = useState<SpendingCategory[]>([
    { name: 'Travel', icon: <FaPlane />, amount: 0 },
    { name: 'Dining', icon: <FaUtensils />, amount: 0 },
    { name: 'Gas', icon: <FaGasPump />, amount: 0 },
    { name: 'Groceries', icon: <FaShoppingCart />, amount: 0 },
    { name: 'Online Shopping', icon: <FaShoppingCart />, amount: 0 },
    { name: 'Bills & Utilities', icon: <FaHome />, amount: 0 }
  ])

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchPartnerData()
  }, [params.subdomain])

  const fetchPartnerData = async () => {
    try {
      setLoading(true)
      
      // First try to get portal by subdomain from partner_portals table
      const { data: portalData, error: portalError } = await supabase
        .from('partner_portals')
        .select(`
          *,
          partner_portal_configs (*),
          partners (*)
        `)
        .eq('subdomain', params.subdomain)
        .eq('status', 'published')
        .single()

      if (portalError || !portalData) {
        console.log('Portal not found in new structure, trying legacy...')
        
        // Fallback to legacy structure for existing portals
        const { data: legacyPartnerData, error: legacyError } = await supabase
          .from('partners')
          .select('*')
          .eq('portal_subdomain', params.subdomain)
          .eq('portal_active', true)
          .single()

        if (legacyError || !legacyPartnerData) {
          console.error('Partner not found:', legacyError)
          setPartner(null)
          return
        }

        // Convert legacy data to new format
        setPartner({
          id: legacyPartnerData.id,
          company_name: legacyPartnerData.company_name,
          custom_app_name: legacyPartnerData.custom_app_name,
          custom_tagline: legacyPartnerData.custom_tagline,
          welcome_message: legacyPartnerData.welcome_message,
          footer_text: legacyPartnerData.footer_text,
          primary_color: legacyPartnerData.primary_color,
          secondary_color: legacyPartnerData.secondary_color,
          accent_color: legacyPartnerData.accent_color,
          font_family: legacyPartnerData.font_family,
          logo_url: legacyPartnerData.logo_url,
          hide_cardwise_branding: legacyPartnerData.hide_cardwise_branding
        })

        // Use legacy card selection method
        const { data: cardSelections, error: cardError } = await supabase
          .from('partner_card_selections')
          .select(`
            *,
            credit_cards (*)
          `)
          .eq('partner_id', legacyPartnerData.id)
          .eq('active', true)
          .order('priority_order', { ascending: true })

        if (!cardError && cardSelections) {
          const transformedCards: CreditCard[] = cardSelections.map((selection: any) => ({
            id: selection.credit_cards.id,
            card_name: selection.credit_cards.name || selection.credit_cards.card_name,
            issuer: selection.credit_cards.issuer,
            card_image_url: selection.credit_cards.image_url || '/api/placeholder/300/200',
            annual_fee: selection.credit_cards.annual_fee,
            intro_apr: selection.credit_cards.intro_apr || '0%',
            regular_apr: selection.credit_cards.regular_apr || 'Variable',
            intro_bonus: selection.credit_cards.welcome_bonus || selection.credit_cards.intro_bonus,
            bonus_requirement: selection.credit_cards.welcome_bonus_requirements || selection.credit_cards.bonus_requirement,
            rewards_rate: `${selection.credit_cards.base_earn_rate}x ${selection.credit_cards.reward_type}`,
            rewards_type: selection.credit_cards.reward_type,
            key_benefits: selection.credit_cards.key_benefits || [],
            best_for: selection.credit_cards.best_for || 'General use',
            affiliate_link: selection.affiliate_link,
            custom_description: selection.custom_description,
            featured: selection.featured,
            priority_order: selection.priority_order
          }))
          setCards(transformedCards)
        }
        
        return
      }

      // New portal structure
      const portal = portalData
      const config = portal.partner_portal_configs?.[0]
      const partnerInfo = portal.partners

      if (!config || !partnerInfo) {
        console.error('Portal configuration or partner info missing')
        setPartner(null)
        return
      }

      // Set partner data from new structure
      setPartner({
        id: partnerInfo.id,
        company_name: config.company_name || partnerInfo.company_name,
        custom_app_name: portal.portal_name,
        custom_tagline: 'Smart Credit Card Recommendations',
        welcome_message: config.welcome_message || 'Find the perfect credit card for your needs',
        footer_text: `© ${new Date().getFullYear()} ${config.company_name}. All rights reserved.`,
        primary_color: config.primary_color,
        secondary_color: config.secondary_color,
        accent_color: config.accent_color,
        font_family: 'Inter, sans-serif',
        logo_url: config.logo_url,
        hide_cardwise_branding: false
      })

      // Get cards for this portal
      const { data: portalCards, error: cardsError } = await supabase
        .from('partner_card_selections')
        .select(`
          *,
          credit_cards (*)
        `)
        .eq('portal_id', portal.id)
        .eq('active', true)
        .order('priority_order', { ascending: true })

      if (cardsError) {
        console.error('Error fetching portal cards:', cardsError)
        // Try fallback to partner cards
        const { data: fallbackCards, error: fallbackError } = await supabase
          .from('partner_card_selections')
          .select(`
            *,
            credit_cards (*)
          `)
          .eq('partner_id', partnerInfo.id)
          .eq('active', true)
          .order('priority_order', { ascending: true })

        if (!fallbackError && fallbackCards) {
          const transformedCards: CreditCard[] = fallbackCards.map((selection: any) => ({
            id: selection.credit_cards.id,
            card_name: selection.credit_cards.name || selection.credit_cards.card_name,
            issuer: selection.credit_cards.issuer,
            card_image_url: selection.credit_cards.image_url || '/api/placeholder/300/200',
            annual_fee: selection.credit_cards.annual_fee,
            intro_apr: selection.credit_cards.intro_apr || '0%',
            regular_apr: selection.credit_cards.regular_apr || 'Variable',
            intro_bonus: selection.credit_cards.welcome_bonus || selection.credit_cards.intro_bonus,
            bonus_requirement: selection.credit_cards.welcome_bonus_requirements || selection.credit_cards.bonus_requirement,
            rewards_rate: `${selection.credit_cards.base_earn_rate}x ${selection.credit_cards.reward_type}`,
            rewards_type: selection.credit_cards.reward_type,
            key_benefits: selection.credit_cards.key_benefits || [],
            best_for: selection.credit_cards.best_for || 'General use',
            affiliate_link: selection.affiliate_link,
            custom_description: selection.custom_description,
            featured: selection.featured,
            priority_order: selection.priority_order
          }))
          setCards(transformedCards)
        }
        return
      }

      // Transform portal cards
      const transformedCards: CreditCard[] = (portalCards || []).map((selection: any) => ({
        id: selection.credit_cards.id,
        card_name: selection.credit_cards.name || selection.credit_cards.card_name,
        issuer: selection.credit_cards.issuer,
        card_image_url: selection.credit_cards.image_url || '/api/placeholder/300/200',
        annual_fee: selection.credit_cards.annual_fee,
        intro_apr: selection.credit_cards.intro_apr || '0%',
        regular_apr: selection.credit_cards.regular_apr || 'Variable',
        intro_bonus: selection.credit_cards.welcome_bonus || selection.credit_cards.intro_bonus,
        bonus_requirement: selection.credit_cards.welcome_bonus_requirements || selection.credit_cards.bonus_requirement,
        rewards_rate: `${selection.credit_cards.base_earn_rate}x ${selection.credit_cards.reward_type}`,
        rewards_type: selection.credit_cards.reward_type,
        key_benefits: selection.credit_cards.key_benefits || [],
        best_for: selection.credit_cards.best_for || 'General use',
        affiliate_link: selection.affiliate_link,
        custom_description: selection.custom_description,
        featured: selection.featured,
        priority_order: selection.priority_order
      }))

      setCards(transformedCards)

      // Track visitor session
      try {
        await supabase
          .from('partner_user_sessions')
          .insert([{
            partner_id: partnerInfo.id,
            portal_id: portal.id,
            user_email: 'anonymous',
            session_id: `session-${Date.now()}`,
            landing_page: '/',
            analyses_completed: 0
          }])
      } catch (sessionError) {
        console.error('Error tracking session:', sessionError)
        // Don't fail the page load for tracking errors
      }

    } catch (error) {
      console.error('Error fetching portal data:', error)
      setPartner(null)
    } finally {
      setLoading(false)
    }
  }

  const generateRecommendations = () => {
    if (cards.length === 0) return

    // Simple recommendation logic based on spending and goals
    let scored = cards.map(card => {
      let score = 0
      
      // Featured cards get priority
      if (card.featured) score += 10
      
      // Score based on primary goal
      if (userProfile.primaryGoal === 'travel' && card.rewards_type?.toLowerCase().includes('travel')) {
        score += 8
      } else if (userProfile.primaryGoal === 'cashback' && card.rewards_type?.toLowerCase().includes('cash')) {
        score += 8
      } else if (userProfile.primaryGoal === 'building-credit' && card.annual_fee === 0) {
        score += 6
      }
      
      // Score based on spending patterns
      const totalSpending = spendingCategories.reduce((sum, cat) => sum + cat.amount, 0)
      if (totalSpending > 3000 && card.intro_bonus) score += 5
      if (totalSpending < 1000 && card.annual_fee === 0) score += 4
      
      // Score based on credit score
      if (userProfile.creditScore === 'excellent' || userProfile.creditScore === 'good') {
        score += 3
      }
      
      return { ...card, score }
    })

    // Sort by score and take top 3
    scored.sort((a, b) => b.score - a.score)
    setRecommendations(scored.slice(0, 3))
    setCurrentStep(4)
  }

  const handleApplyClick = async (card: CreditCard) => {
    // Track application click for analytics and commission
    try {
      if (partner) {
        await supabase
          .from('partner_card_applications')
          .insert([{
            partner_id: partner.id,
            card_id: card.id,
            user_email: userProfile.email || 'anonymous',
            application_data: {
              user_profile: userProfile,
              spending_categories: spendingCategories,
              timestamp: new Date().toISOString(),
              card_name: card.card_name,
              portal_subdomain: params.subdomain
            },
            status: 'pending'
          }])

        // Update session with application
        await supabase
          .from('partner_user_sessions')
          .update({ 
            card_applied: true,
            ended_at: new Date().toISOString()
          })
          .eq('partner_id', partner.id)
          .eq('user_email', userProfile.email || 'anonymous')
          .order('created_at', { ascending: false })
          .limit(1)
      }
    } catch (error) {
      console.error('Error tracking application:', error)
      // Don't prevent the application from proceeding
    }

    // Open application link
    if (card.affiliate_link) {
      window.open(card.affiliate_link, '_blank', 'noopener,noreferrer')
    } else {
      // Fallback to generic application search
      window.open(`https://www.google.com/search?q=${encodeURIComponent(card.card_name + ' ' + card.issuer + ' apply')}`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Portal Not Found</h1>
          <p className="text-gray-600">This portal is not available or has been disabled.</p>
        </div>
      </div>
    )
  }

  const customColors = {
    primary: partner.primary_color,
    secondary: partner.secondary_color,
    accent: partner.accent_color
  }

  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: partner.font_family }}
    >
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3 md:space-x-4">
              {partner.logo_url && (
                <img
                  src={partner.logo_url}
                  alt={partner.company_name}
                  className="h-8 md:h-10 w-auto flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <h1 
                  className="text-lg md:text-2xl font-bold truncate"
                  style={{ color: customColors.primary }}
                >
                  {partner.custom_app_name}
                </h1>
                <p className="text-xs md:text-sm text-gray-600 truncate">{partner.custom_tagline}</p>
              </div>
            </div>
            <div className="text-right self-end md:self-auto">
              <div className="text-xs md:text-sm text-gray-500">Powered by</div>
              {!partner.hide_cardwise_branding && (
                <div className="text-xs md:text-sm font-medium text-gray-700">CardWise</div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {/* Welcome Section */}
        {currentStep === 1 && (
          <div className="text-center mb-8 md:mb-12 px-4 max-w-3xl mx-auto">
            <div className="mb-6">
              <div className="text-6xl mb-4">💳</div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {partner.welcome_message || `Find Your Perfect Credit Card`}
              </h2>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                Answer 3 quick questions to get personalized recommendations tailored just for you
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="text-sm font-semibold text-gray-700">Quick</div>
                  <div className="text-xs text-gray-500">2 minutes</div>
                </div>
                <div>
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="text-sm font-semibold text-gray-700">Personal</div>
                  <div className="text-xs text-gray-500">Just for you</div>
                </div>
                <div>
                  <div className="text-2xl mb-2">💰</div>
                  <div className="text-sm font-semibold text-gray-700">Free</div>
                  <div className="text-xs text-gray-500">No cost</div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setCurrentStep(2)}
              className="w-full py-5 px-8 text-xl font-bold rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: customColors.primary }}
            >
              <div className="flex items-center justify-center space-x-3">
                <span>Get Started</span>
                <FaArrowRight className="text-lg" />
              </div>
            </button>
          </div>
        )}

        {/* Progress Bar */}
        {currentStep > 1 && currentStep < 4 && (
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-center space-x-2 md:space-x-4 px-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-medium ${
                      currentStep >= step + 1
                        ? 'text-white'
                        : currentStep === step + 1
                        ? 'text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                    style={{
                      backgroundColor: currentStep >= step + 1 ? customColors.primary : 
                                     currentStep === step + 1 ? customColors.primary : undefined
                    }}
                  >
                    {currentStep > step + 1 ? <FaCheck className="text-xs" /> : step}
                  </div>
                  {step < 3 && (
                    <div 
                      className={`w-8 md:w-16 h-1 mx-1 md:mx-2 ${
                        currentStep > step + 1 ? '' : 'bg-gray-200'
                      }`}
                      style={{
                        backgroundColor: currentStep > step + 1 ? customColors.primary : undefined
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Profile */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-8">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center md:text-left">👋 Tell us about yourself</h3>
              <p className="text-base text-gray-600 mb-6 md:mb-8 text-center md:text-left">This helps us find your perfect card match</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3">Your Name</label>
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-lg focus:ring-2 focus:border-blue-500 transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3">Email Address</label>
                  <input
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-lg focus:ring-2 focus:border-blue-500 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3">💳 Credit Score Range</label>
                  <select
                    value={userProfile.creditScore}
                    onChange={(e) => setUserProfile({ ...userProfile, creditScore: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-lg focus:ring-2 focus:border-blue-500 transition-colors appearance-none bg-white"
                  >
                    <option value="">How's your credit?</option>
                    <option value="excellent">🌟 Excellent (750+)</option>
                    <option value="good">✅ Good (700-749)</option>
                    <option value="fair">📈 Fair (650-699)</option>
                    <option value="poor">🔧 Needs Work (Below 650)</option>
                    <option value="unknown">🤷 I'm not sure</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3">💰 Annual Income</label>
                  <select
                    value={userProfile.annualIncome}
                    onChange={(e) => setUserProfile({ ...userProfile, annualIncome: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-lg focus:ring-2 focus:border-blue-500 transition-colors appearance-none bg-white"
                  >
                    <option value="">Select income range</option>
                    <option value="under-30k">Under $30,000</option>
                    <option value="30k-50k">$30,000 - $50,000</option>
                    <option value="50k-75k">$50,000 - $75,000</option>
                    <option value="75k-100k">$75,000 - $100,000</option>
                    <option value="over-100k">Over $100,000</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-4">🎯 What's your main goal?</label>
                  <div className="space-y-3">
                    {[
                      { value: 'travel', label: 'Travel Rewards', icon: <FaPlane />, desc: 'Earn points and miles for trips' },
                      { value: 'cashback', label: 'Cash Back', icon: <FaDollarSign />, desc: 'Get money back on purchases' },
                      { value: 'building-credit', label: 'Building Credit', icon: <FaGraduationCap />, desc: 'Improve my credit score' }
                    ].map((goal) => (
                      <button
                        key={goal.value}
                        onClick={() => setUserProfile({ ...userProfile, primaryGoal: goal.value })}
                        className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                          userProfile.primaryGoal === goal.value
                            ? 'border-current text-white shadow-lg'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md'
                        }`}
                        style={{
                          backgroundColor: userProfile.primaryGoal === goal.value ? customColors.primary : undefined,
                          borderColor: userProfile.primaryGoal === goal.value ? customColors.primary : undefined
                        }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">{goal.icon}</div>
                          <div>
                            <div className="font-bold text-lg">{goal.label}</div>
                            <div className={`text-sm ${userProfile.primaryGoal === goal.value ? 'text-white opacity-90' : 'text-gray-500'}`}>
                              {goal.desc}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-10 space-y-3">
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!userProfile.name || !userProfile.email || !userProfile.creditScore || !userProfile.primaryGoal}
                  className="w-full py-4 px-6 text-lg font-bold text-white rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                  style={{ backgroundColor: customColors.primary }}
                >
                  Continue to Spending →
                </button>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="w-full py-3 px-6 text-base font-medium border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Spending */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-8">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center md:text-left">💳 Monthly Spending</h3>
              <p className="text-base text-gray-600 mb-6 md:mb-8 text-center md:text-left">
                Tell us where you spend to find cards with the best rewards for you.
              </p>
              
              {/* Mobile: Ultra-Compact List Layout */}
              <div className="block md:hidden">
                <div className="space-y-3">
                  {spendingCategories.map((category, index) => (
                    <div key={category.name} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="flex items-center p-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0"
                          style={{ backgroundColor: customColors.secondary }}
                        >
                          <div className="text-lg">
                            {category.icon}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm mb-1">{category.name}</div>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">$</span>
                            <input
                              type="number"
                              value={category.amount || ''}
                              onChange={(e) => {
                                const newCategories = [...spendingCategories]
                                newCategories[index].amount = parseInt(e.target.value) || 0
                                setSpendingCategories(newCategories)
                              }}
                              className="w-full pl-8 pr-12 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0"
                              style={{ fontSize: '16px' }}
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">/mo</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop: Original Layout */}
              <div className="hidden md:block space-y-6">
                {spendingCategories.map((category, index) => (
                  <div key={category.name} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="p-3 rounded-full text-white flex-shrink-0"
                        style={{ backgroundColor: customColors.secondary }}
                      >
                        <div className="text-xl">
                          {category.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-lg font-semibold text-gray-800 mb-2">
                          {category.name}
                        </label>
                        <div className="flex items-center bg-white rounded-lg border-2 border-gray-300 focus-within:border-blue-500 transition-colors">
                          <span className="text-gray-500 pl-4 text-xl font-bold">$</span>
                          <input
                            type="number"
                            value={category.amount || ''}
                            onChange={(e) => {
                              const newCategories = [...spendingCategories]
                              newCategories[index].amount = parseInt(e.target.value) || 0
                              setSpendingCategories(newCategories)
                            }}
                            className="flex-1 px-2 py-4 text-lg bg-transparent border-0 focus:ring-0 focus:outline-none"
                            placeholder="0"
                          />
                          <span className="text-gray-400 pr-4 text-sm">/month</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-semibold text-gray-900">Total Monthly Spending</span>
                    <div className="text-sm text-gray-600">This helps us calculate your rewards potential</div>
                  </div>
                  <span 
                    className="text-3xl font-bold"
                    style={{ color: customColors.primary }}
                  >
                    ${spendingCategories.reduce((sum, cat) => sum + cat.amount, 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="mt-10 space-y-3">
                <button
                  onClick={generateRecommendations}
                  className="w-full py-4 px-6 text-lg font-bold text-white rounded-xl shadow-lg transition-all transform active:scale-95"
                  style={{ backgroundColor: customColors.primary }}
                >
                  🎯 Get My Recommendations
                </button>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full py-3 px-6 text-base font-medium border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Recommendations */}
          {currentStep === 4 && (
            <div className="px-3 md:px-0">
              <div className="text-center mb-6 md:mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                  🎯 Your Top Card Matches
                </h3>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                  Based on your spending, here are your best options:
                </p>
              </div>

              <div className="space-y-4 md:space-y-6">
                {recommendations.map((card, index) => (
                  <div key={card.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Mobile-First Card Design */}
                    <div className="p-4 md:p-6">
                      {/* Best Match Badge - Mobile Prominent */}
                      {index === 0 && (
                        <div className="mb-4 flex justify-center md:justify-start">
                          <div 
                            className="px-4 py-2 rounded-full text-sm font-bold text-white shadow-md flex items-center"
                            style={{ backgroundColor: customColors.accent }}
                          >
                            <FaStar className="mr-2" />
                            BEST MATCH FOR YOU
                          </div>
                        </div>
                      )}

                      {/* Card Header */}
                      <div className="text-center md:text-left mb-4 md:mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="flex flex-col items-center md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                            <img
                              src={card.card_image_url}
                              alt={card.card_name}
                              className="w-16 h-10 md:w-24 md:h-14 object-contain"
                            />
                            <div>
                              <h4 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 leading-tight">{card.card_name}</h4>
                              <p className="text-sm md:text-base text-gray-600">{card.issuer}</p>
                            </div>
                          </div>
                          <div className="mt-3 md:mt-0 text-center md:text-right">
                            <div className="text-xs md:text-sm text-gray-500">Annual Fee</div>
                            <div className="text-lg md:text-2xl font-bold" style={{ color: card.annual_fee === 0 ? customColors.accent : customColors.primary }}>
                              {card.annual_fee === 0 ? 'FREE' : `$${card.annual_fee}`}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mobile: Compact Key Metrics */}
                      <div className="block md:hidden mb-4">
                        <div className="space-y-2">
                          {card.intro_bonus && (
                            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <span className="text-lg mr-2">🎁</span>
                                  <span className="font-medium text-gray-800 text-sm">Welcome Bonus</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-orange-700 text-sm">{card.intro_bonus}</div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span className="text-lg mr-2">💰</span>
                                <span className="font-medium text-gray-800 text-sm">Rewards</span>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-green-700 text-sm">{card.rewards_rate}</div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-blue-50 rounded border border-blue-200 text-center">
                              <div className="text-blue-600 text-base mb-1">📊</div>
                              <div className="font-medium text-gray-800 text-xs">APR</div>
                              <div className="font-bold text-blue-700 text-xs">{card.intro_apr || card.regular_apr}</div>
                            </div>

                            <div className="p-2 bg-purple-50 rounded border border-purple-200 text-center">
                              <div className="text-purple-600 text-base mb-1">✨</div>
                              <div className="font-medium text-gray-800 text-xs">Best For</div>
                              <div className="font-bold text-purple-700 text-xs truncate">{card.best_for}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop: Original Key Highlights */}
                      <div className="hidden md:block space-y-3 mb-6">
                        {card.intro_bonus && (
                          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="p-2 rounded-full text-white"
                                style={{ backgroundColor: customColors.accent }}
                              >
                                <FaGift className="text-lg" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-base">Welcome Bonus</div>
                                <div className="text-lg font-bold" style={{ color: customColors.accent }}>{card.intro_bonus}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="p-2 rounded-full text-white"
                              style={{ backgroundColor: customColors.secondary }}
                            >
                              <FaPercent className="text-lg" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-base">Rewards Rate</div>
                              <div className="text-lg font-bold" style={{ color: customColors.secondary }}>{card.rewards_rate}</div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="p-2 rounded-full text-white"
                              style={{ backgroundColor: customColors.primary }}
                            >
                              <FaCreditCard className="text-lg" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-base">Interest Rate</div>
                              <div className="text-lg font-bold" style={{ color: customColors.primary }}>{card.intro_apr || card.regular_apr}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Top Benefits - Mobile Friendly */}
                      {card.key_benefits && card.key_benefits.length > 0 && (
                        <div className="mb-4 md:mb-6">
                          <h5 className="font-bold text-gray-900 mb-2 text-sm md:text-lg">✨ Key Benefits</h5>
                          <div className="space-y-1 md:space-y-2">
                            {card.key_benefits.slice(0, 2).map((benefit, idx) => (
                              <div key={idx} className="flex items-start space-x-2 p-2 rounded bg-gray-50">
                                <FaCheck 
                                  className="mt-0.5 text-sm flex-shrink-0"
                                  style={{ color: customColors.accent }}
                                />
                                <span className="text-xs md:text-base text-gray-700 leading-relaxed">{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Custom Description */}
                      {card.custom_description && (
                        <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                          <p className="text-base text-green-800 leading-relaxed">{card.custom_description}</p>
                        </div>
                      )}

                      {/* Best For - Desktop Only (mobile shows in grid above) */}
                      <div className="hidden md:block mb-6 p-3 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <span className="text-sm text-gray-600">Perfect for: </span>
                          <span className="font-semibold text-gray-900 text-base">{card.best_for}</span>
                        </div>
                      </div>

                      {/* Apply Button - Mobile Prominent */}
                      <div className="mt-6">
                        <button
                          onClick={() => handleApplyClick(card)}
                          className="w-full py-4 px-4 font-bold text-white rounded-xl shadow-lg transition-all transform active:scale-95"
                          style={{ 
                            backgroundColor: customColors.primary,
                          }}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-base">Apply Now</span>
                            <FaExternalLinkAlt className="text-sm" />
                          </div>
                          {index === 0 && (
                            <div className="text-xs opacity-90 mt-1">
                              🏆 #1 Pick
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {cards.length > recommendations.length && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    View All Available Cards
                    <FaArrowRight className="ml-2" />
                  </button>
                </div>
              )}

              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setCurrentStep(1)
                    setRecommendations([])
                    setUserProfile({
                      name: '',
                      email: '',
                      creditScore: '',
                      annualIncome: '',
                      primaryGoal: ''
                    })
                    setSpendingCategories(spendingCategories.map(cat => ({ ...cat, amount: 0 })))
                  }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}

          {/* Step 4: All Cards */}
          {currentStep === 5 && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold text-gray-900">All Available Cards</h3>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ← Back to Recommendations
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {cards.map((card) => (
                  <div key={card.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <img
                        src={card.card_image_url}
                        alt={card.card_name}
                        className="w-12 h-8 object-contain"
                      />
                      {card.featured && (
                        <div 
                          className="px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: customColors.accent }}
                        >
                          Featured
                        </div>
                      )}
                    </div>
                    
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">{card.card_name}</h4>
                    <p className="text-gray-600 mb-4">{card.issuer}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Annual Fee:</span>
                        <span className="font-medium">
                          {card.annual_fee === 0 ? 'No Fee' : `$${card.annual_fee}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Rewards:</span>
                        <span className="font-medium">{card.rewards_rate}</span>
                      </div>
                      {card.intro_bonus && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Welcome Bonus:</span>
                          <span className="font-medium">{card.intro_bonus}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleApplyClick(card)}
                      className="w-full py-2 rounded-lg text-white font-medium hover:shadow-lg transition-all"
                      style={{ backgroundColor: customColors.primary }}
                    >
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            {partner.footer_text || `© ${new Date().getFullYear()} ${partner.company_name}. All rights reserved.`}
          </div>
        </div>
      </footer>
    </div>
  )
} 