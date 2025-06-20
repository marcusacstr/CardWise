import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { 
  generateEnhancedRecommendations, 
  SpendingProfile, 
  AdvancedPointValuation,
  AIRecommendationEngine,
  EnhancedCard 
} from '@/lib/enhancedCardRecommendations'

interface TransactionData {
  amount: number
  description: string
  category?: string
  date: string
}

interface AnalysisRequest {
  transactions: TransactionData[]
  userProfile: {
    annual_income?: number
    credit_score?: string
    travel_frequency?: string
    redemption_preference?: string
    current_cards?: string[]
    monthly_payment_behavior?: string
    signup_bonus_importance?: string
  }
  analysisType: 'basic' | 'enhanced' | 'ai_powered'
}

// Enhanced category detection using multiple signals
function categorizeTransaction(description: string, amount: number): string {
  const desc = description.toLowerCase()
  
  // Grocery stores and supermarkets
  if (/walmart|target|costco|sams club|kroger|safeway|publix|whole foods|trader joe|aldi|food lion|harris teeter|giant|wegmans|fresh market|grocery|supermarket|market basket|food\s*(store|mart)|super.*center/i.test(desc)) {
    return 'groceries'
  }
  
  // Restaurants and dining
  if (/restaurant|cafe|coffee|starbucks|dunkin|mcdonald|burger|pizza|taco|subway|chipotle|panera|domino|kfc|wendy|chick.fil.a|applebee|olive garden|red lobster|outback|texas roadhouse|dining|eatery|bistro|grill|diner|buffet|fast.food|food.truck|bar.grill|tavern|pub/i.test(desc)) {
    return 'dining'
  }
  
  // Gas stations and fuel
  if (/shell|exxon|bp|chevron|mobil|texaco|citgo|sunoco|marathon|speedway|wawa|sheetz|circle.k|7.eleven|gas|fuel|gasoline|petro/i.test(desc)) {
    return 'gas'
  }
  
  // Travel (airlines, hotels, rental cars, etc.)
  if (/airline|airport|flight|hotel|marriott|hilton|hyatt|airbnb|vrbo|rental.car|hertz|enterprise|avis|budget|uber|lyft|taxi|train|amtrak|cruise|travel|booking|expedia|kayak|trip|vacation/i.test(desc)) {
    return 'travel'
  }
  
  // Streaming and digital services
  if (/netflix|hulu|disney|amazon.prime|spotify|apple.music|youtube|twitch|hbo|paramount|peacock|streaming|subscription/i.test(desc)) {
    return 'streaming'
  }
  
  // Department stores
  if (/macy|nordstrom|bloomingdale|saks|neiman.marcus|jcpenney|kohl|dillard|department.store/i.test(desc)) {
    return 'department_stores'
  }
  
  // Drug stores and pharmacies
  if (/cvs|walgreen|rite.aid|pharmacy|drug.store/i.test(desc)) {
    return 'drug_stores'
  }
  
  // Online shopping
  if (/amazon|ebay|etsy|paypal|online|internet|web.*purchase|e.commerce/i.test(desc)) {
    return 'online_shopping'
  }
  
  // Warehouse clubs
  if (/costco|sams.club|bjs|warehouse/i.test(desc)) {
    return 'warehouse_clubs'
  }
  
  // Transit and public transportation
  if (/metro|subway|bus|transit|mta|bart|cta|public.transport/i.test(desc)) {
    return 'transit'
  }
  
  // Default to general spending
  return 'general'
}

// Enhanced spending analysis with AI-like pattern recognition
function analyzeSpendingPatterns(transactions: TransactionData[]) {
  const categoryTotals: { [key: string]: number } = {}
  const monthlyCategoryTotals: { [key: string]: { [key: string]: number } } = {}
  const merchantFrequency: { [key: string]: number } = {}
  
  let totalSpending = 0
  
  transactions.forEach(transaction => {
    const category = transaction.category || categorizeTransaction(transaction.description, transaction.amount)
    const month = transaction.date.substring(0, 7) // YYYY-MM format
    
    // Category totals
    categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amount
    totalSpending += transaction.amount
    
    // Monthly category tracking
    if (!monthlyCategoryTotals[month]) {
      monthlyCategoryTotals[month] = {}
    }
    monthlyCategoryTotals[month][category] = (monthlyCategoryTotals[month][category] || 0) + transaction.amount
    
    // Merchant frequency
    const merchant = transaction.description.substring(0, 20).trim()
    merchantFrequency[merchant] = (merchantFrequency[merchant] || 0) + 1
  })
  
  // Calculate monthly averages
  const months = Object.keys(monthlyCategoryTotals)
  const monthlySpending: { [key: string]: number } = {}
  
  Object.keys(categoryTotals).forEach(category => {
    const monthlyAmounts = months.map(month => monthlyCategoryTotals[month][category] || 0)
    monthlySpending[category] = monthlyAmounts.reduce((a, b) => a + b, 0) / Math.max(months.length, 1)
  })
  
  // Spending insights using AI-like analysis
  const insights = generateSpendingInsights(categoryTotals, monthlySpending, merchantFrequency, totalSpending)
  
  // Seasonal patterns
  const seasonalPatterns = detectSeasonalPatterns(monthlyCategoryTotals)
  
  return {
    categoryTotals,
    monthlySpending,
    totalSpending,
    insights,
    seasonalPatterns,
    merchantFrequency,
    dataQuality: calculateDataQuality(transactions, months.length)
  }
}

function generateSpendingInsights(
  categoryTotals: { [key: string]: number },
  monthlySpending: { [key: string]: number },
  merchantFrequency: { [key: string]: number },
  totalSpending: number
) {
  const insights: string[] = []
  
  // Top spending categories
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
  
  if (sortedCategories.length > 0) {
    const topCategory = sortedCategories[0]
    const percentage = (topCategory[1] / totalSpending * 100).toFixed(0)
    insights.push(`${topCategory[0]} represents ${percentage}% of your spending - look for cards with high ${topCategory[0]} rewards`)
  }
  
  // Spending concentration analysis
  const top3Percentage = sortedCategories.reduce((sum, [,amount]) => sum + amount, 0) / totalSpending
  if (top3Percentage > 0.7) {
    insights.push('Your spending is concentrated in a few categories - consider specialized cards for maximum rewards')
  } else if (top3Percentage < 0.4) {
    insights.push('Your spending is diversified - consider flat-rate cashback or flexible points cards')
  }
  
  // High-value opportunity detection
  if (monthlySpending.dining > 500) {
    insights.push('High dining spending detected - dining-focused cards could provide significant value')
  }
  if (monthlySpending.travel > 300) {
    insights.push('Regular travel spending - consider travel-focused cards with no foreign transaction fees')
  }
  if (monthlySpending.groceries > 400) {
    insights.push('Substantial grocery spending - grocery bonus cards often have the highest multipliers')
  }
  
  // Merchant loyalty patterns
  const topMerchants = Object.entries(merchantFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
  
  if (topMerchants[0] && topMerchants[0][1] > 10) {
    insights.push(`Frequent purchases at ${topMerchants[0][0]} - check for merchant-specific card partnerships`)
  }
  
  return insights
}

function detectSeasonalPatterns(monthlyCategoryTotals: { [key: string]: { [key: string]: number } }) {
  const patterns: { [key: string]: string } = {}
  
  Object.keys(monthlyCategoryTotals).forEach(month => {
    const monthNum = parseInt(month.split('-')[1])
    
    // Holiday season patterns (Nov-Dec)
    if (monthNum >= 11) {
      const generalSpending = monthlyCategoryTotals[month]['general'] || 0
      const onlineSpending = monthlyCategoryTotals[month]['online_shopping'] || 0
      if (generalSpending + onlineSpending > 1000) {
        patterns['holiday_shopping'] = 'High spending detected during holiday season'
      }
    }
    
    // Summer travel patterns (Jun-Aug)
    if (monthNum >= 6 && monthNum <= 8) {
      const travelSpending = monthlyCategoryTotals[month]['travel'] || 0
      if (travelSpending > 500) {
        patterns['summer_travel'] = 'Summer travel spending pattern detected'
      }
    }
  })
  
  return patterns
}

function calculateDataQuality(transactions: TransactionData[], monthsOfData: number): number {
  let quality = 0
  
  // Data volume quality (0-40 points)
  if (transactions.length > 100) quality += 40
  else if (transactions.length > 50) quality += 30
  else if (transactions.length > 20) quality += 20
  else quality += 10
  
  // Time range quality (0-30 points)
  if (monthsOfData >= 12) quality += 30
  else if (monthsOfData >= 6) quality += 25
  else if (monthsOfData >= 3) quality += 20
  else if (monthsOfData >= 1) quality += 15
  else quality += 5
  
  // Category diversity quality (0-20 points)
  const categories = new Set(transactions.map(t => t.category || categorizeTransaction(t.description, t.amount)))
  if (categories.size >= 6) quality += 20
  else if (categories.size >= 4) quality += 15
  else if (categories.size >= 2) quality += 10
  else quality += 5
  
  // Description quality (0-10 points)
  const hasGoodDescriptions = transactions.filter(t => t.description.length > 5).length / transactions.length
  quality += hasGoodDescriptions * 10
  
  return Math.min(quality, 100)
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json()
    const { transactions, userProfile, analysisType } = body
    
    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ error: 'No transaction data provided' }, { status: 400 })
    }
    
    // Analyze spending patterns
    const spendingAnalysis = analyzeSpendingPatterns(transactions)
    
    // Create enhanced user profile
    const enhancedProfile: SpendingProfile = {
      annual_income: userProfile.annual_income || 50000,
      credit_score: userProfile.credit_score || 'good',
      monthly_spending: {
        groceries: spendingAnalysis.monthlySpending.groceries || 0,
        dining: spendingAnalysis.monthlySpending.dining || 0,
        travel: spendingAnalysis.monthlySpending.travel || 0,
        gas: spendingAnalysis.monthlySpending.gas || 0,
        streaming: spendingAnalysis.monthlySpending.streaming || 0,
        general: spendingAnalysis.monthlySpending.general || 0
      },
      travel_frequency: userProfile.travel_frequency as any || 'occasionally',
      redemption_preference: userProfile.redemption_preference as any || 'flexible',
      current_cards: userProfile.current_cards || [],
      monthly_payment_behavior: userProfile.monthly_payment_behavior as any || 'full',
      signup_bonus_importance: userProfile.signup_bonus_importance as any || 'medium'
    }
    
    let recommendations = []
    
    if (analysisType === 'ai_powered' || analysisType === 'enhanced') {
      // Use enhanced AI-powered recommendations
      recommendations = await generateEnhancedRecommendations(enhancedProfile, 5)
    } else {
      // Fall back to basic recommendations
      // This would use the existing cardRecommendations.ts logic
      recommendations = []
    }
    
    // Calculate current card performance for comparison
    const currentCardValue = calculateCurrentCardValue(enhancedProfile)
    
    return NextResponse.json({
      success: true,
      analysis: {
        spending_breakdown: spendingAnalysis.categoryTotals,
        monthly_averages: spendingAnalysis.monthlySpending,
        total_spending: spendingAnalysis.totalSpending,
        insights: spendingAnalysis.insights,
        seasonal_patterns: spendingAnalysis.seasonalPatterns,
        data_quality: spendingAnalysis.dataQuality
      },
      recommendations: recommendations.map(rec => ({
        card: {
          id: rec.card.id,
          name: rec.card.name,
          issuer: rec.card.issuer,
          annual_fee: rec.card.annual_fee,
          image_url: rec.card.image_url,
          application_url: rec.card.application_url
        },
        annual_value: Math.round(rec.annual_value),
        net_annual_benefit: Math.round(rec.net_annual_benefit),
        first_year_value: Math.round(rec.first_year_value),
        ai_confidence_score: Math.round(rec.ai_confidence_score),
        personalization_score: Math.round(rec.personalization_score),
        risk_factors: rec.risk_factors,
        optimization_tips: rec.optimization_tips,
        point_valuation: {
          optimal_value: rec.point_valuation.optimal_value,
          cashback_value: rec.point_valuation.cashback_value,
          travel_value: rec.point_valuation.travel_value,
          redemption_flexibility: rec.point_valuation.redemption_flexibility
        },
        reasoning: rec.reasoning,
        category_breakdown: rec.category_breakdown
      })),
      current_card_analysis: {
        estimated_annual_value: currentCardValue,
        improvement_potential: recommendations.length > 0 ? 
          Math.max(0, recommendations[0].net_annual_benefit - currentCardValue) : 0
      },
      analysis_metadata: {
        analysis_type: analysisType,
        data_quality_score: spendingAnalysis.dataQuality,
        confidence_level: spendingAnalysis.dataQuality > 70 ? 'high' : 
                         spendingAnalysis.dataQuality > 40 ? 'medium' : 'low',
        recommendations_count: recommendations.length,
        generated_at: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Enhanced analysis error:', error)
    return NextResponse.json({ 
      error: 'Internal server error during analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function calculateCurrentCardValue(profile: SpendingProfile): number {
  // Assume 1% baseline cashback for current card comparison
  const totalMonthlySpending = Object.values(profile.monthly_spending).reduce((a, b) => a + b, 0)
  return totalMonthlySpending * 12 * 0.01
} 