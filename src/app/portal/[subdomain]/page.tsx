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
      
      // Fetch partner data
      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .select('*')
        .eq('portal_subdomain', params.subdomain)
        .eq('portal_active', true)
        .single()

      if (partnerError || !partnerData) {
        console.error('Partner not found:', partnerError)
        setPartner(null)
        return
      }

      setPartner(partnerData)

      // Fetch partner's selected cards
      const { data: cardSelections, error: cardError } = await supabase
        .from('partner_card_selections')
        .select(`
          *,
          credit_cards (*)
        `)
        .eq('partner_id', partnerData.id)
        .eq('active', true)
        .order('priority_order', { ascending: true })

      if (cardError) {
        console.error('Error fetching cards:', cardError)
        return
      }

      // Transform the data
      const transformedCards: CreditCard[] = cardSelections?.map((selection: any) => ({
        id: selection.credit_cards.id,
        card_name: selection.credit_cards.card_name,
        issuer: selection.credit_cards.issuer,
        card_image_url: selection.credit_cards.card_image_url || '/api/placeholder/300/200',
        annual_fee: selection.credit_cards.annual_fee,
        intro_apr: selection.credit_cards.intro_apr,
        regular_apr: selection.credit_cards.regular_apr,
        intro_bonus: selection.credit_cards.intro_bonus,
        bonus_requirement: selection.credit_cards.bonus_requirement,
        rewards_rate: selection.credit_cards.rewards_rate,
        rewards_type: selection.credit_cards.rewards_type,
        key_benefits: selection.credit_cards.key_benefits || [],
        best_for: selection.credit_cards.best_for,
        affiliate_link: selection.affiliate_link,
        custom_description: selection.custom_description,
        featured: selection.featured,
        priority_order: selection.priority_order
      })) || []

      setCards(transformedCards)

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

  const handleApplyClick = (card: CreditCard) => {
    // Track the click for analytics
    if (card.affiliate_link) {
      // Open affiliate link in new tab
      window.open(card.affiliate_link, '_blank', 'noopener,noreferrer')
    } else {
      // Fallback to generic application
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {partner.logo_url && (
                <img
                  src={partner.logo_url}
                  alt={partner.company_name}
                  className="h-10 w-auto"
                />
              )}
              <div>
                <h1 
                  className="text-2xl font-bold"
                  style={{ color: customColors.primary }}
                >
                  {partner.custom_app_name}
                </h1>
                <p className="text-sm text-gray-600">{partner.custom_tagline}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Powered by</div>
              {!partner.hide_cardwise_branding && (
                <div className="text-sm font-medium text-gray-700">CardWise</div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        {currentStep === 1 && (
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {partner.welcome_message || `Find Your Perfect Credit Card`}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Answer a few quick questions to get personalized credit card recommendations
            </p>
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-lg text-white shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: customColors.primary }}
            >
              Get Started
              <FaArrowRight className="ml-2" />
            </button>
          </div>
        )}

        {/* Progress Bar */}
        {currentStep > 1 && currentStep < 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
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
                    {currentStep > step + 1 ? <FaCheck /> : step}
                  </div>
                  {step < 3 && (
                    <div 
                      className={`w-16 h-1 mx-2 ${
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Tell us about yourself</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:border-transparent"
                    
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:border-transparent"
                    
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Credit Score Range</label>
                  <select
                    value={userProfile.creditScore}
                    onChange={(e) => setUserProfile({ ...userProfile, creditScore: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:border-transparent"
                    
                  >
                    <option value="">Select range</option>
                    <option value="excellent">Excellent (750+)</option>
                    <option value="good">Good (700-749)</option>
                    <option value="fair">Fair (650-699)</option>
                    <option value="poor">Poor (Below 650)</option>
                    <option value="unknown">I don't know</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Annual Income</label>
                  <select
                    value={userProfile.annualIncome}
                    onChange={(e) => setUserProfile({ ...userProfile, annualIncome: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:border-transparent"
                    
                  >
                    <option value="">Select range</option>
                    <option value="under-30k">Under $30,000</option>
                    <option value="30k-50k">$30,000 - $50,000</option>
                    <option value="50k-75k">$50,000 - $75,000</option>
                    <option value="75k-100k">$75,000 - $100,000</option>
                    <option value="over-100k">Over $100,000</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Goal</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { value: 'travel', label: 'Travel Rewards', icon: <FaPlane /> },
                      { value: 'cashback', label: 'Cash Back', icon: <FaDollarSign /> },
                      { value: 'building-credit', label: 'Building Credit', icon: <FaGraduationCap /> }
                    ].map((goal) => (
                      <button
                        key={goal.value}
                        onClick={() => setUserProfile({ ...userProfile, primaryGoal: goal.value })}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          userProfile.primaryGoal === goal.value
                            ? 'border-current text-white'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                        style={{
                          backgroundColor: userProfile.primaryGoal === goal.value ? customColors.primary : undefined,
                          borderColor: userProfile.primaryGoal === goal.value ? customColors.primary : undefined
                        }}
                      >
                        <div className="text-2xl mb-2">{goal.icon}</div>
                        <div className="font-medium">{goal.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!userProfile.name || !userProfile.email || !userProfile.creditScore || !userProfile.primaryGoal}
                  className="px-6 py-2 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: customColors.primary }}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Spending */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Monthly Spending</h3>
              <p className="text-gray-600 mb-6">
                Help us understand your spending patterns to recommend the best rewards cards.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {spendingCategories.map((category, index) => (
                  <div key={category.name} className="flex items-center space-x-4">
                    <div 
                      className="p-3 rounded-lg text-white"
                      style={{ backgroundColor: customColors.secondary }}
                    >
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {category.name}
                      </label>
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">$</span>
                        <input
                          type="number"
                          value={category.amount || ''}
                          onChange={(e) => {
                            const newCategories = [...spendingCategories]
                            newCategories[index].amount = parseInt(e.target.value) || 0
                            setSpendingCategories(newCategories)
                          }}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:border-transparent"
                          
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Total Monthly Spending:</span>
                  <span 
                    className="text-xl font-bold"
                    style={{ color: customColors.primary }}
                  >
                    ${spendingCategories.reduce((sum, cat) => sum + cat.amount, 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={generateRecommendations}
                  className="px-6 py-2 rounded-md text-white"
                  style={{ backgroundColor: customColors.primary }}
                >
                  Get My Recommendations
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Recommendations */}
          {currentStep === 4 && (
            <div>
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Your Personalized Recommendations
                </h3>
                <p className="text-gray-600">
                  Based on your profile and spending habits, here are the best credit cards for you:
                </p>
              </div>

              <div className="space-y-6">
                {recommendations.map((card, index) => (
                  <div key={card.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          {index === 0 && (
                            <div 
                              className="px-3 py-1 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: customColors.accent }}
                            >
                              <FaStar className="inline mr-1" />
                              Best Match
                            </div>
                          )}
                          <img
                            src={card.card_image_url}
                            alt={card.card_name}
                            className="w-16 h-10 object-contain"
                          />
                          <div>
                            <h4 className="text-xl font-semibold text-gray-900">{card.card_name}</h4>
                            <p className="text-gray-600">{card.issuer}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Annual Fee</div>
                          <div className="font-semibold">
                            {card.annual_fee === 0 ? 'No Fee' : `$${card.annual_fee}`}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {card.intro_bonus && (
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <FaGift 
                              className="mx-auto mb-2 text-2xl"
                              style={{ color: customColors.accent }}
                            />
                            <div className="text-sm text-gray-600">Welcome Bonus</div>
                            <div className="font-semibold">{card.intro_bonus}</div>
                            {card.bonus_requirement && (
                              <div className="text-xs text-gray-500 mt-1">{card.bonus_requirement}</div>
                            )}
                          </div>
                        )}
                        
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <FaPercent 
                            className="mx-auto mb-2 text-2xl"
                            style={{ color: customColors.secondary }}
                          />
                          <div className="text-sm text-gray-600">Rewards Rate</div>
                          <div className="font-semibold">{card.rewards_rate}</div>
                          <div className="text-xs text-gray-500 mt-1">{card.rewards_type}</div>
                        </div>

                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <FaCreditCard 
                            className="mx-auto mb-2 text-2xl"
                            style={{ color: customColors.primary }}
                          />
                          <div className="text-sm text-gray-600">APR</div>
                          <div className="font-semibold">{card.intro_apr || card.regular_apr}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {card.intro_apr ? 'Intro Rate' : 'Regular Rate'}
                          </div>
                        </div>
                      </div>

                      {card.key_benefits && card.key_benefits.length > 0 && (
                        <div className="mb-6">
                          <h5 className="font-medium text-gray-900 mb-2">Key Benefits:</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {card.key_benefits.slice(0, 3).map((benefit, idx) => (
                              <li key={idx} className="flex items-center">
                                <FaCheck 
                                  className="mr-2 text-xs"
                                  style={{ color: customColors.accent }}
                                />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {card.custom_description && (
                        <div className="mb-6 p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800">{card.custom_description}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Best for: <span className="font-medium">{card.best_for}</span>
                        </div>
                        <button
                          onClick={() => handleApplyClick(card)}
                          className="inline-flex items-center px-6 py-3 rounded-lg text-white font-medium hover:shadow-lg transition-all"
                          style={{ backgroundColor: customColors.primary }}
                        >
                          Apply Now
                          <FaExternalLinkAlt className="ml-2" />
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => (
                  <div key={card.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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