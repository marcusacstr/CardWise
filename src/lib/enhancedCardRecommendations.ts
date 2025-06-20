import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface EnhancedCard {
  id: string
  name: string
  issuer: string
  annual_fee: number
  base_earn_rate: number
  groceries_earn_rate: number
  dining_earn_rate: number
  travel_earn_rate: number
  gas_earn_rate: number
  reward_type: 'points' | 'miles' | 'cashback'
  point_value: number
  welcome_bonus?: string
  credit_score_requirement: string
  foreign_transaction_fee: number
  benefits?: any
  image_url?: string
  application_url?: string
  // Enhanced fields for better calculations
  groceries_cap?: number
  dining_cap?: number
  travel_cap?: number
  gas_cap?: number
  transfer_partners?: string[]
  category_caps?: { [key: string]: number }
  bonus_multipliers?: { [key: string]: number }
}

export interface DynamicPointValue {
  cashback_value: number      // Direct cashback redemption (baseline)
  travel_value: number        // Travel portal redemption
  transfer_value: number      // Transfer to airline/hotel partners
  statement_credit: number    // Statement credit redemption
  gift_cards: number         // Gift card redemption
  optimal_value: number      // Best possible redemption value
  redemption_flexibility: number // How easy it is to get optimal value (0-1)
}

export interface SpendingProfile {
  annual_income: number
  credit_score: string
  monthly_spending: {
    groceries: number
    dining: number
    travel: number
    gas: number
    streaming: number
    general: number
  }
  travel_frequency: 'never' | 'rarely' | 'occasionally' | 'frequently' | 'very_frequently'
  redemption_preference: 'cashback' | 'travel' | 'flexible' | 'maximum_value'
  current_cards: string[]
  monthly_payment_behavior: 'full' | 'minimum' | 'partial'
  signup_bonus_importance: 'low' | 'medium' | 'high'
}

export interface EnhancedRecommendation {
  card: EnhancedCard
  annual_value: number
  net_annual_benefit: number
  first_year_value: number
  ai_confidence_score: number // 0-100
  personalization_score: number // How well matched to user (0-100)
  risk_factors: string[]
  optimization_tips: string[]
  category_breakdown: {
    category: string
    annual_spending: number
    earn_rate: number
    annual_rewards: number
    cap_impact?: number
  }[]
  point_valuation: DynamicPointValue
  reasoning: {
    primary_benefits: string[]
    potential_drawbacks: string[]
    best_use_cases: string[]
  }
}

// Advanced point valuations based on card type and user profile
export class AdvancedPointValuation {
  
  static calculateDynamicPointValue(
    card: EnhancedCard, 
    userProfile: SpendingProfile
  ): DynamicPointValue {
    const baseValue = card.point_value / 100 // Convert cents to dollars
    
    // Chase Ultimate Rewards
    if (card.issuer.toLowerCase().includes('chase') && card.reward_type === 'points') {
      return {
        cashback_value: 1.0,
        travel_value: userProfile.travel_frequency === 'frequently' ? 1.5 : 1.25,
        transfer_value: userProfile.travel_frequency === 'very_frequently' ? 2.1 : 1.7,
        statement_credit: 1.0,
        gift_cards: 1.0,
        optimal_value: userProfile.travel_frequency === 'very_frequently' ? 2.1 : 1.5,
        redemption_flexibility: 0.85
      }
    }
    
    // American Express Membership Rewards
    if (card.issuer.toLowerCase().includes('american express') && card.reward_type === 'points') {
      return {
        cashback_value: 0.6, // Amex has poor cashback redemption
        travel_value: userProfile.travel_frequency === 'frequently' ? 1.4 : 1.0,
        transfer_value: userProfile.travel_frequency === 'very_frequently' ? 2.2 : 1.8,
        statement_credit: 0.6,
        gift_cards: 1.0,
        optimal_value: userProfile.travel_frequency === 'very_frequently' ? 2.2 : 1.0,
        redemption_flexibility: 0.75
      }
    }
    
    // Capital One Venture Miles
    if (card.issuer.toLowerCase().includes('capital one') && card.reward_type === 'miles') {
      return {
        cashback_value: 1.0,
        travel_value: 1.0, // 1:1 for travel purchases
        transfer_value: userProfile.travel_frequency === 'very_frequently' ? 1.7 : 1.4,
        statement_credit: 1.0,
        gift_cards: 1.0,
        optimal_value: userProfile.travel_frequency === 'very_frequently' ? 1.7 : 1.0,
        redemption_flexibility: 0.9 // Very flexible
      }
    }
    
    // Citi ThankYou Points
    if (card.issuer.toLowerCase().includes('citi') && card.reward_type === 'points') {
      return {
        cashback_value: 1.0,
        travel_value: 1.25,
        transfer_value: userProfile.travel_frequency === 'very_frequently' ? 1.9 : 1.6,
        statement_credit: 1.0,
        gift_cards: 1.0,
        optimal_value: userProfile.travel_frequency === 'very_frequently' ? 1.9 : 1.25,
        redemption_flexibility: 0.8
      }
    }
    
    // Cashback cards (flat rate)
    if (card.reward_type === 'cashback') {
      return {
        cashback_value: 1.0,
        travel_value: 1.0,
        transfer_value: 1.0,
        statement_credit: 1.0,
        gift_cards: 1.0,
        optimal_value: 1.0,
        redemption_flexibility: 1.0 // Perfect flexibility
      }
    }
    
    // Airline miles (specific airlines)
    if (card.reward_type === 'miles') {
      const value = userProfile.travel_frequency === 'very_frequently' ? 1.8 :
                   userProfile.travel_frequency === 'frequently' ? 1.5 :
                   userProfile.travel_frequency === 'occasionally' ? 1.2 : 0.8
      
      return {
        cashback_value: 0.8, // Usually poor cashback options
        travel_value: value,
        transfer_value: value,
        statement_credit: 0.8,
        gift_cards: 0.9,
        optimal_value: value,
        redemption_flexibility: 0.6 // More restrictive
      }
    }
    
    // Fallback to base value
    return {
      cashback_value: baseValue,
      travel_value: baseValue,
      transfer_value: baseValue,
      statement_credit: baseValue,
      gift_cards: baseValue,
      optimal_value: baseValue,
      redemption_flexibility: 0.5
    }
  }
  
  static getEffectivePointValue(
    card: EnhancedCard,
    userProfile: SpendingProfile
  ): number {
    const dynamicValue = this.calculateDynamicPointValue(card, userProfile)
    
    // Choose redemption value based on user preference and behavior
    switch (userProfile.redemption_preference) {
      case 'cashback':
        return dynamicValue.cashback_value
      case 'travel':
        return dynamicValue.travel_value
      case 'maximum_value':
        return dynamicValue.optimal_value
      case 'flexible':
        // Weight by flexibility and optimal value
        return (dynamicValue.optimal_value * 0.7) + (dynamicValue.cashback_value * 0.3)
      default:
        return dynamicValue.cashback_value
    }
  }
}

export class AIRecommendationEngine {
  
  static calculateAdvancedRewards(
    card: EnhancedCard,
    userProfile: SpendingProfile
  ): number {
    let totalRewards = 0
    const effectivePointValue = AdvancedPointValuation.getEffectivePointValue(card, userProfile)
    
    // Calculate rewards for each category with caps
    Object.entries(userProfile.monthly_spending).forEach(([category, monthlyAmount]) => {
      const annualSpending = monthlyAmount * 12
      let earnRate = card.base_earn_rate
      let cappedSpending = annualSpending
      
      // Get category-specific earn rates
      switch (category) {
        case 'groceries':
          earnRate = card.groceries_earn_rate || card.base_earn_rate
          if (card.groceries_cap) {
            cappedSpending = Math.min(annualSpending, card.groceries_cap * 12)
          }
          break
        case 'dining':
          earnRate = card.dining_earn_rate || card.base_earn_rate
          if (card.dining_cap) {
            cappedSpending = Math.min(annualSpending, card.dining_cap * 12)
          }
          break
        case 'travel':
          earnRate = card.travel_earn_rate || card.base_earn_rate
          if (card.travel_cap) {
            cappedSpending = Math.min(annualSpending, card.travel_cap * 12)
          }
          break
        case 'gas':
          earnRate = card.gas_earn_rate || card.base_earn_rate
          if (card.gas_cap) {
            cappedSpending = Math.min(annualSpending, card.gas_cap * 12)
          }
          break
        default:
          earnRate = card.base_earn_rate
      }
      
      // Calculate rewards for capped spending
      const cappedRewards = cappedSpending * earnRate * effectivePointValue
      
      // Calculate rewards for spending above cap at base rate
      const overCapSpending = annualSpending - cappedSpending
      const overCapRewards = overCapSpending > 0 ? 
        overCapSpending * card.base_earn_rate * effectivePointValue : 0
      
      totalRewards += cappedRewards + overCapRewards
    })
    
    return totalRewards
  }
  
  static calculateWelcomeBonusValue(
    card: EnhancedCard,
    userProfile: SpendingProfile
  ): number {
    if (!card.welcome_bonus) return 0
    
    const effectivePointValue = AdvancedPointValuation.getEffectivePointValue(card, userProfile)
    const bonusText = card.welcome_bonus.toLowerCase()
    
    // Enhanced parsing for different bonus formats
    
    // Points/Miles format: "80,000 points after $4,000 spend"
    const pointsMatch = bonusText.match(/(\d{1,3}(?:,\d{3})*)\s*(?:points|miles)/i)
    if (pointsMatch) {
      const points = parseInt(pointsMatch[1].replace(/,/g, ''))
      
      // Check spend requirement feasibility
      const spendMatch = bonusText.match(/\$(\d{1,3}(?:,\d{3})*)/i)
      if (spendMatch) {
        const requiredSpend = parseInt(spendMatch[1].replace(/,/g, ''))
        const monthlySpend = Object.values(userProfile.monthly_spending).reduce((a, b) => a + b, 0)
        const monthsToMeet = requiredSpend / monthlySpend
        
        // Discount bonus if spend requirement is hard to meet
        if (monthsToMeet > 6) {
          return points * effectivePointValue * 0.7 // 30% discount for difficulty
        }
      }
      
      return points * effectivePointValue
    }
    
    // Cash format: "$200 after $1,000 spend"
    const cashMatch = bonusText.match(/\$(\d+(?:,\d{3})*)/i)
    if (cashMatch) {
      return parseInt(cashMatch[1].replace(/,/g, ''))
    }
    
    // Percentage format: "5% cash back on first $1,500"
    const percentMatch = bonusText.match(/(\d+(?:\.\d+)?)%.*?\$(\d{1,3}(?:,\d{3})*)/i)
    if (percentMatch) {
      const percentage = parseFloat(percentMatch[1]) / 100
      const maxSpend = parseInt(percentMatch[2].replace(/,/g, ''))
      return maxSpend * percentage
    }
    
    return 0
  }
  
  static calculatePersonalizationScore(
    card: EnhancedCard,
    userProfile: SpendingProfile
  ): number {
    let score = 0
    
    // Credit score compatibility (0-25 points)
    const creditScores = { 'excellent': 750, 'good': 700, 'fair': 650, 'poor': 550 }
    const userScore = creditScores[userProfile.credit_score as keyof typeof creditScores] || 550
    
    if (card.credit_score_requirement === 'excellent' && userScore >= 750) score += 25
    else if (card.credit_score_requirement === 'good' && userScore >= 700) score += 20
    else if (card.credit_score_requirement === 'fair' && userScore >= 650) score += 15
    else if (userScore < 650) score -= 10 // Penalty for likely rejection
    
    // Spending pattern alignment (0-30 points)
    const totalSpending = Object.values(userProfile.monthly_spending).reduce((a, b) => a + b, 0) * 12
    let categoryAlignment = 0
    
    Object.entries(userProfile.monthly_spending).forEach(([category, amount]) => {
      const categoryWeight = (amount * 12) / totalSpending
      let earnRate = card.base_earn_rate
      
      switch (category) {
        case 'groceries': earnRate = card.groceries_earn_rate || card.base_earn_rate; break
        case 'dining': earnRate = card.dining_earn_rate || card.base_earn_rate; break
        case 'travel': earnRate = card.travel_earn_rate || card.base_earn_rate; break
        case 'gas': earnRate = card.gas_earn_rate || card.base_earn_rate; break
      }
      
      if (earnRate > card.base_earn_rate) {
        categoryAlignment += categoryWeight * (earnRate - card.base_earn_rate) * 10
      }
    })
    score += Math.min(categoryAlignment, 30)
    
    // Travel frequency alignment (0-15 points)
    if (card.reward_type === 'miles') {
      const travelBonus = {
        'very_frequently': 15,
        'frequently': 10,
        'occasionally': 5,
        'rarely': -5,
        'never': -10
      }
      score += travelBonus[userProfile.travel_frequency] || 0
    }
    
    // Annual fee value assessment (0-15 points)
    const annualRewards = this.calculateAdvancedRewards(card, userProfile)
    const netBenefit = annualRewards - card.annual_fee
    
    if (card.annual_fee === 0) {
      score += 10 // Bonus for no fee
    } else {
      const feeRatio = card.annual_fee / annualRewards
      if (feeRatio < 0.3) score += 15 // Fee well justified
      else if (feeRatio < 0.5) score += 10 // Fee moderately justified
      else if (feeRatio < 0.7) score += 5 // Fee barely justified
      else score -= 10 // Fee too high
    }
    
    // Welcome bonus importance (0-15 points)
    const welcomeValue = this.calculateWelcomeBonusValue(card, userProfile)
    if (userProfile.signup_bonus_importance === 'high') {
      score += Math.min(welcomeValue / 50, 15) // Up to 15 points for high welcome bonus
    } else if (userProfile.signup_bonus_importance === 'medium') {
      score += Math.min(welcomeValue / 100, 8)
    }
    
    return Math.min(Math.max(score, 0), 100)
  }
  
  static calculateRiskFactors(
    card: EnhancedCard,
    userProfile: SpendingProfile
  ): string[] {
    const risks: string[] = []
    
    // High annual fee risk
    if (card.annual_fee > 300) {
      const annualRewards = this.calculateAdvancedRewards(card, userProfile)
      if (annualRewards < card.annual_fee * 1.5) {
        risks.push(`High annual fee ($${card.annual_fee}) may not be justified by rewards`)
      }
    }
    
    // Foreign transaction fee risk
    if (card.foreign_transaction_fee > 0 && userProfile.travel_frequency !== 'never') {
      risks.push(`${card.foreign_transaction_fee}% foreign transaction fee impacts travel value`)
    }
    
    // Credit score risk
    const creditScores = { 'excellent': 750, 'good': 700, 'fair': 650, 'poor': 550 }
    const userScore = creditScores[userProfile.credit_score as keyof typeof creditScores] || 550
    
    if (card.credit_score_requirement === 'excellent' && userScore < 750) {
      risks.push('May require excellent credit - consider building credit first')
    }
    
    // Complex redemption risk
    const pointValue = AdvancedPointValuation.calculateDynamicPointValue(card, userProfile)
    if (pointValue.redemption_flexibility < 0.7) {
      risks.push('Optimal point redemption requires travel expertise and planning')
    }
    
    // Category cap risks
    const totalSpending = Object.values(userProfile.monthly_spending).reduce((a, b) => a + b, 0) * 12
    if (card.groceries_cap && userProfile.monthly_spending.groceries * 12 > card.groceries_cap * 12) {
      risks.push('Grocery spending exceeds bonus category cap')
    }
    if (card.dining_cap && userProfile.monthly_spending.dining * 12 > card.dining_cap * 12) {
      risks.push('Dining spending exceeds bonus category cap')
    }
    
    return risks
  }
  
  static generateOptimizationTips(
    card: EnhancedCard,
    userProfile: SpendingProfile
  ): string[] {
    const tips: string[] = []
    
    // Point redemption optimization
    const pointValue = AdvancedPointValuation.calculateDynamicPointValue(card, userProfile)
    if (pointValue.transfer_value > pointValue.cashback_value * 1.5) {
      tips.push(`Transfer points to airline/hotel partners for up to ${pointValue.transfer_value}¢ per point value`)
    }
    
    // Category optimization
    Object.entries(userProfile.monthly_spending).forEach(([category, amount]) => {
      let earnRate = card.base_earn_rate
      switch (category) {
        case 'groceries': earnRate = card.groceries_earn_rate || card.base_earn_rate; break
        case 'dining': earnRate = card.dining_earn_rate || card.base_earn_rate; break
        case 'travel': earnRate = card.travel_earn_rate || card.base_earn_rate; break
        case 'gas': earnRate = card.gas_earn_rate || card.base_earn_rate; break
      }
      
      if (earnRate > card.base_earn_rate && amount * 12 > 2000) {
        tips.push(`Maximize ${category} spending on this card for ${earnRate}x rewards`)
      }
    })
    
    // Welcome bonus optimization
    const welcomeValue = this.calculateWelcomeBonusValue(card, userProfile)
    if (welcomeValue > 500) {
      tips.push(`Plan large purchases to meet welcome bonus spending requirement efficiently`)
    }
    
    // Fee optimization
    if (card.annual_fee > 0) {
      const annualRewards = this.calculateAdvancedRewards(card, userProfile)
      const paybackMonths = card.annual_fee / (annualRewards / 12)
      tips.push(`Annual fee pays for itself in ${Math.ceil(paybackMonths)} months of normal spending`)
    }
    
    return tips
  }
}

export async function generateEnhancedRecommendations(
  userProfile: SpendingProfile,
  maxResults: number = 5
): Promise<EnhancedRecommendation[]> {
  try {
    const supabase = createClientComponentClient()
    
    // Fetch cards from database
    const { data: cards, error } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('is_active', true)
    
    if (error || !cards) {
      throw new Error('Failed to fetch cards')
    }
    
    const recommendations: EnhancedRecommendation[] = []
    
    for (const card of cards) {
      const enhancedCard: EnhancedCard = {
        ...card,
        transfer_partners: [], // Would be populated from database
        category_caps: {},     // Would be populated from database
        bonus_multipliers: {}  // Would be populated from database
      }
      
      const annualRewards = AIRecommendationEngine.calculateAdvancedRewards(enhancedCard, userProfile)
      const welcomeBonusValue = AIRecommendationEngine.calculateWelcomeBonusValue(enhancedCard, userProfile)
      const personalizationScore = AIRecommendationEngine.calculatePersonalizationScore(enhancedCard, userProfile)
      const pointValuation = AdvancedPointValuation.calculateDynamicPointValue(enhancedCard, userProfile)
      
      const netAnnualBenefit = annualRewards - card.annual_fee
      const firstYearValue = annualRewards + welcomeBonusValue - card.annual_fee
      
      // AI confidence score based on data quality and user profile completeness
      const aiConfidenceScore = Math.min(100, 
        70 + // Base confidence
        (personalizationScore > 50 ? 15 : 0) + // User profile alignment
        (Object.values(userProfile.monthly_spending).some(v => v > 0) ? 10 : 0) + // Has spending data
        (pointValuation.redemption_flexibility > 0.7 ? 5 : 0) // Clear redemption path
      )
      
      // Generate category breakdown
      const categoryBreakdown = Object.entries(userProfile.monthly_spending).map(([category, monthlyAmount]) => {
        const annualSpending = monthlyAmount * 12
        let earnRate = card.base_earn_rate
        
        switch (category) {
          case 'groceries': earnRate = card.groceries_earn_rate || card.base_earn_rate; break
          case 'dining': earnRate = card.dining_earn_rate || card.base_earn_rate; break
          case 'travel': earnRate = card.travel_earn_rate || card.base_earn_rate; break
          case 'gas': earnRate = card.gas_earn_rate || card.base_earn_rate; break
        }
        
        const effectivePointValue = AdvancedPointValuation.getEffectivePointValue(enhancedCard, userProfile)
        const annualRewards = annualSpending * earnRate * effectivePointValue
        
        return {
          category,
          annual_spending: annualSpending,
          earn_rate: earnRate,
          annual_rewards: annualRewards
        }
      })
      
      // Generate reasoning
      const primaryBenefits: string[] = []
      const potentialDrawbacks: string[] = []
      const bestUseCases: string[] = []
      
      if (card.annual_fee === 0) {
        primaryBenefits.push('No annual fee makes this a risk-free choice')
      }
      
      if (pointValuation.optimal_value > 1.5) {
        primaryBenefits.push(`Points can be worth up to ${pointValuation.optimal_value}¢ with optimal redemption`)
      }
      
      if (card.annual_fee > 200) {
        potentialDrawbacks.push(`High annual fee of $${card.annual_fee} requires consistent use to justify`)
      }
      
      if (pointValuation.redemption_flexibility < 0.7) {
        potentialDrawbacks.push('Requires travel expertise to maximize point value')
      }
      
      // Find best spending categories
      const topCategories = categoryBreakdown
        .filter(cat => cat.earn_rate > card.base_earn_rate)
        .sort((a, b) => b.earn_rate - a.earn_rate)
        .slice(0, 2)
      
      topCategories.forEach(cat => {
        bestUseCases.push(`${cat.earn_rate}x rewards on ${cat.category}`)
      })
      
      recommendations.push({
        card: enhancedCard,
        annual_value: annualRewards,
        net_annual_benefit: netAnnualBenefit,
        first_year_value: firstYearValue,
        ai_confidence_score: aiConfidenceScore,
        personalization_score: personalizationScore,
        risk_factors: AIRecommendationEngine.calculateRiskFactors(enhancedCard, userProfile),
        optimization_tips: AIRecommendationEngine.generateOptimizationTips(enhancedCard, userProfile),
        category_breakdown: categoryBreakdown,
        point_valuation: pointValuation,
        reasoning: {
          primary_benefits: primaryBenefits,
          potential_drawbacks: potentialDrawbacks,
          best_use_cases: bestUseCases
        }
      })
    }
    
    // Sort by personalization score and net benefit
    recommendations.sort((a, b) => {
      const scoreWeight = 0.6
      const valueWeight = 0.4
      
      const scoreA = a.personalization_score * scoreWeight + (a.net_annual_benefit / 10) * valueWeight
      const scoreB = b.personalization_score * scoreWeight + (b.net_annual_benefit / 10) * valueWeight
      
      return scoreB - scoreA
    })
    
    return recommendations.slice(0, maxResults)
    
  } catch (error) {
    console.error('Error generating enhanced recommendations:', error)
    return []
  }
} 