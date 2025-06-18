import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SpendingAnalysis, CategorySpending } from './transactionAnalyzer';

export interface DatabaseCreditCard {
  id: string;
  name: string;
  issuer: string;
  card_network: string;
  annual_fee: number;
  credit_score_requirement: string;
  welcome_bonus?: string;
  welcome_bonus_requirements?: string;
  foreign_transaction_fee: number;
  base_earn_rate: number;
  groceries_earn_rate: number;
  dining_earn_rate: number;
  travel_earn_rate: number;
  gas_earn_rate: number;
  groceries_cap?: number;
  dining_cap?: number;
  travel_cap?: number;
  gas_cap?: number;
  groceries_cap_frequency?: string;
  dining_cap_frequency?: string;
  travel_cap_frequency?: string;
  gas_cap_frequency?: string;
  reward_type: 'points' | 'miles' | 'cashback';
  point_value: number;
  benefits?: any;
  image_url?: string;
  application_url?: string;
  country: string;
  is_active: boolean;
}

export interface CardRecommendation {
  card: DatabaseCreditCard;
  annualRewards: number;
  netBenefit: number; // Annual rewards minus annual fee
  categoryRewards: CategoryReward[];
  matchScore: number;
  reasoning: string[];
  welcomeBonusValue: number;
  totalFirstYearValue: number;
}

export interface CategoryReward {
  category: string;
  spending: number;
  earnRate: number;
  rewardsEarned: number;
  capApplied: boolean;
  cappedAmount?: number;
}

export interface RecommendationResult {
  recommendations: CardRecommendation[];
  totalSpending: number;
  currentEstimatedRewards: number; // Assuming 1% baseline
  insights: string[];
}

// Map our spending categories to database card categories
const CATEGORY_MAPPING: { [key: string]: keyof DatabaseCreditCard } = {
  'Dining': 'dining_earn_rate',
  'Groceries': 'groceries_earn_rate',
  'Travel': 'travel_earn_rate',
  'Gas': 'gas_earn_rate',
  'Transit': 'gas_earn_rate', // Often grouped with gas for rewards
  'Streaming': 'base_earn_rate',
  'Department Stores': 'base_earn_rate',
  'Drug Stores': 'base_earn_rate',
  'Online Shopping': 'base_earn_rate',
  'Warehouse Clubs': 'groceries_earn_rate', // Often counts as groceries
  'Other': 'base_earn_rate'
};

// Get corresponding cap field for each category
const CAP_MAPPING: { [key: string]: keyof DatabaseCreditCard } = {
  'Dining': 'dining_cap',
  'Groceries': 'groceries_cap',
  'Travel': 'travel_cap',
  'Gas': 'gas_cap',
  'Transit': 'gas_cap',
  'Streaming': undefined as any,
  'Department Stores': undefined as any,
  'Drug Stores': undefined as any,
  'Online Shopping': undefined as any,
  'Warehouse Clubs': 'groceries_cap',
  'Other': undefined as any
};

// Get corresponding cap frequency field for each category  
const CAP_FREQUENCY_MAPPING: { [key: string]: keyof DatabaseCreditCard } = {
  'Dining': 'dining_cap_frequency',
  'Groceries': 'groceries_cap_frequency',
  'Travel': 'travel_cap_frequency',
  'Gas': 'gas_cap_frequency',
  'Transit': 'gas_cap_frequency',
  'Streaming': undefined as any,
  'Department Stores': undefined as any,
  'Drug Stores': undefined as any,
  'Online Shopping': undefined as any,
  'Warehouse Clubs': 'groceries_cap_frequency',
  'Other': undefined as any
};

async function fetchCreditCards(): Promise<DatabaseCreditCard[]> {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase
    .from('credit_cards')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching credit cards:', error);
    return [];
  }

  return data || [];
}

function calculateCategoryReward(
  card: DatabaseCreditCard,
  category: string,
  yearlySpending: number
): CategoryReward {
  const earnRateField = CATEGORY_MAPPING[category];
  const capField = CAP_MAPPING[category];
  const capFrequencyField = CAP_FREQUENCY_MAPPING[category];
  
  const earnRate = card[earnRateField] || card.base_earn_rate;
  const cap = capField ? card[capField] : null;
  const capFrequency = capFrequencyField ? card[capFrequencyField] : null;
  
  let effectiveSpending = yearlySpending;
  let capApplied = false;
  let cappedAmount = undefined;
  
  // Apply spending caps if they exist
  if (cap && capFrequency) {
    let annualCap = cap;
    
    // Convert cap to annual amount
    switch (capFrequency.toLowerCase()) {
      case 'monthly':
        annualCap = cap * 12;
        break;
      case 'quarterly':
        annualCap = cap * 4;
        break;
      case 'annually':
      case 'annual':
        annualCap = cap;
        break;
    }
    
    if (yearlySpending > annualCap) {
      effectiveSpending = annualCap;
      capApplied = true;
      cappedAmount = yearlySpending - annualCap;
    }
  }
  
  // Calculate rewards (points, miles, or cashback)
  const rewardsEarned = effectiveSpending * earnRate;
  
  // Handle spending above cap at base rate
  if (capApplied && cappedAmount) {
    const baseRewards = cappedAmount * card.base_earn_rate;
    const totalRewards = rewardsEarned + baseRewards;
    
    return {
      category,
      spending: yearlySpending,
      earnRate,
      rewardsEarned: totalRewards,
      capApplied,
      cappedAmount
    };
  }
  
  return {
    category,
    spending: yearlySpending,
    earnRate,
    rewardsEarned,
    capApplied,
    cappedAmount
  };
}

function calculateAnnualRewards(
  card: DatabaseCreditCard,
  categoryBreakdown: CategorySpending[]
): { annualRewards: number; categoryRewards: CategoryReward[] } {
  const categoryRewards: CategoryReward[] = [];
  let totalRewards = 0;
  
  for (const categoryData of categoryBreakdown) {
    const categoryReward = calculateCategoryReward(
      card,
      categoryData.category,
      categoryData.amount
    );
    
    categoryRewards.push(categoryReward);
    totalRewards += categoryReward.rewardsEarned;
  }
  
  // Convert points/miles to cash value
  // point_value is stored in cents (1.25 = 1.25 cents), so divide by 100 to get dollars
  const cashValue = totalRewards * (card.point_value / 100);
  
  return {
    annualRewards: cashValue,
    categoryRewards
  };
}

function calculateWelcomeBonusValue(card: DatabaseCreditCard): number {
  if (!card.welcome_bonus) return 0;
  
  // Simple parsing of welcome bonus - could be enhanced
  const bonusText = card.welcome_bonus.toLowerCase();
  
  // Look for point/mile amounts
  const pointsMatch = bonusText.match(/(\d{1,3}(?:,\d{3})*)\s*(?:points|miles)/);
  if (pointsMatch) {
    const points = parseInt(pointsMatch[1].replace(/,/g, ''));
    return points * (card.point_value / 100);
  }
  
  // Look for cash amounts
  const cashMatch = bonusText.match(/\$(\d+(?:,\d{3})*)/);
  if (cashMatch) {
    return parseInt(cashMatch[1].replace(/,/g, ''));
  }
  
  return 0;
}

function generateReasoning(
  card: DatabaseCreditCard,
  categoryRewards: CategoryReward[],
  totalSpending: number
): string[] {
  const reasoning: string[] = [];
  
  // Find top earning categories for this card
  const topCategories = categoryRewards
    .filter(cr => cr.spending > 0)
    .sort((a, b) => b.rewardsEarned - a.rewardsEarned)
    .slice(0, 3);
  
  if (topCategories.length > 0) {
    const topCategory = topCategories[0];
    if (topCategory.earnRate > 1) {
      reasoning.push(
        `Earns ${topCategory.earnRate}x ${card.reward_type} on ${topCategory.category.toLowerCase()}, your ${
          categoryRewards.findIndex(cr => cr.category === topCategory.category) === 0 ? 'largest' : 'significant'
        } spending category`
      );
    }
  }
  
  // Annual fee consideration
  if (card.annual_fee === 0) {
    reasoning.push('No annual fee makes this a great value option');
  } else if (card.annual_fee > 0) {
    reasoning.push(`$${card.annual_fee} annual fee is offset by higher reward rates`);
  }
  
  // Welcome bonus
  const welcomeValue = calculateWelcomeBonusValue(card);
  if (welcomeValue > 0) {
    reasoning.push(`Welcome bonus worth approximately $${welcomeValue.toFixed(0)}`);
  }
  
  // Cap warnings
  const cappedCategories = categoryRewards.filter(cr => cr.capApplied);
  if (cappedCategories.length > 0) {
    reasoning.push(
      `Note: Bonus earning is capped on ${cappedCategories.map(cc => cc.category.toLowerCase()).join(', ')}`
    );
  }
  
  return reasoning;
}

function calculateMatchScore(
  card: DatabaseCreditCard,
  categoryBreakdown: CategorySpending[],
  annualRewards: number,
  totalSpending: number
): number {
  let score = 0;
  
  // Base score from reward rate effectiveness (0-40 points)
  const effectiveRate = annualRewards / totalSpending;
  score += Math.min(effectiveRate * 2000, 40); // Cap at 40 points
  
  // Bonus for no annual fee (0-15 points)
  if (card.annual_fee === 0) {
    score += 15;
  } else {
    // Penalize high annual fees unless rewards justify it
    const netBenefit = annualRewards - card.annual_fee;
    if (netBenefit > card.annual_fee) {
      score += 10; // High fee but high value
    } else if (netBenefit > 0) {
      score += 5; // Fee but still profitable
    } else {
      score -= 10; // Fee not justified
    }
  }
  
  // Welcome bonus score (0-20 points)
  const welcomeValue = calculateWelcomeBonusValue(card);
  score += Math.min(welcomeValue / 20, 20);
  
  // Category alignment score (0-25 points)
  let categoryAlignment = 0;
  for (const categoryData of categoryBreakdown) {
    const earnRateField = CATEGORY_MAPPING[categoryData.category];
    const earnRate = card[earnRateField] || card.base_earn_rate;
    const categoryWeight = categoryData.amount / totalSpending;
    
    if (earnRate > 1) {
      categoryAlignment += categoryWeight * (earnRate - 1) * 10;
    }
  }
  score += Math.min(categoryAlignment, 25);
  
  return Math.min(Math.max(score, 0), 100); // Clamp between 0-100
}

// Helper function to estimate data period and extrapolate to 12 months
function extrapolateToAnnualSpending(
  spendingAnalysis: SpendingAnalysis
): { categoryBreakdown: CategorySpending[]; actualMonths: number; extrapolationFactor: number } {
  // Try to determine actual data period from various sources
  let actualMonths = 1; // Default to 1 month if we can't determine
  
  // Method 1: Check monthly trends if available
  if (spendingAnalysis.monthlyTrends && spendingAnalysis.monthlyTrends.length > 0) {
    actualMonths = spendingAnalysis.monthlyTrends.length;
  }
  // Method 2: Estimate from transaction count (rough heuristic)
  else if (spendingAnalysis.transactionCount > 0) {
    // Assume average person makes 30-50 transactions per month
    const avgTransactionsPerMonth = 40;
    actualMonths = Math.max(1, Math.min(12, Math.round(spendingAnalysis.transactionCount / avgTransactionsPerMonth)));
  }
  // Method 3: Estimate from total spending (another heuristic)
  else if (spendingAnalysis.totalSpent > 0) {
    // Assume average monthly spending of $2000-3000
    const avgMonthlySpending = 2500;
    actualMonths = Math.max(1, Math.min(12, Math.round(spendingAnalysis.totalSpent / avgMonthlySpending)));
  }
  
  // Calculate extrapolation factor to get to 12 months
  const extrapolationFactor = 12 / actualMonths;
  
  // Apply extrapolation to category breakdown
  const extrapolatedCategoryBreakdown = spendingAnalysis.categoryBreakdown.map(cat => ({
    ...cat,
    amount: cat.amount * extrapolationFactor
  }));
  
  return {
    categoryBreakdown: extrapolatedCategoryBreakdown,
    actualMonths,
    extrapolationFactor
  };
}

export async function generateCardRecommendations(
  spendingAnalysis: SpendingAnalysis,
  currentCardAnnualRewards: number = 0
): Promise<RecommendationResult> {
  try {
    const cards = await fetchCreditCards();
    
    if (cards.length === 0) {
      return {
        recommendations: [],
        totalSpending: spendingAnalysis.totalSpent,
        currentEstimatedRewards: spendingAnalysis.totalSpent * 0.01,
        insights: ['No credit cards found in database']
      };
    }
    
    // Extrapolate spending data to 12 months
    const { categoryBreakdown: annualCategoryBreakdown, actualMonths, extrapolationFactor } = extrapolateToAnnualSpending(spendingAnalysis);
    
    const recommendations: CardRecommendation[] = [];
    const totalSpending = spendingAnalysis.totalSpent;
    const annualTotalSpending = totalSpending * extrapolationFactor;
    
    for (const card of cards) {
      const { annualRewards, categoryRewards } = calculateAnnualRewards(
        card,
        annualCategoryBreakdown
      );
      
      const welcomeBonusValue = calculateWelcomeBonusValue(card);
      const netBenefit = annualRewards - card.annual_fee;
      const totalFirstYearValue = annualRewards + welcomeBonusValue - card.annual_fee;
      
      const reasoning = generateReasoning(card, categoryRewards, annualTotalSpending);
      const matchScore = calculateMatchScore(card, annualCategoryBreakdown, annualRewards, annualTotalSpending);
      
      recommendations.push({
        card,
        annualRewards,
        netBenefit,
        categoryRewards,
        matchScore,
        reasoning,
        welcomeBonusValue,
        totalFirstYearValue
      });
    }
    
    // Sort by match score and net benefit
    recommendations.sort((a, b) => {
      const scoreDiff = b.matchScore - a.matchScore;
      if (Math.abs(scoreDiff) < 5) {
        // If scores are close, prefer higher net benefit
        return b.netBenefit - a.netBenefit;
      }
      return scoreDiff;
    });
    
    // Generate insights
    const insights: string[] = [];
    const topRec = recommendations[0];
    const currentRewards = annualTotalSpending * 0.01; // Assume 1% baseline
    
    // Add note about data extrapolation if applicable
    if (extrapolationFactor > 1) {
      insights.push(
        `Based on ${actualMonths} month${actualMonths === 1 ? '' : 's'} of data, extrapolated to annual estimates`
      );
    }
    
    if (topRec && topRec.netBenefit > currentRewards) {
      const improvement = topRec.netBenefit - currentRewards;
      insights.push(
        `You could earn $${improvement.toFixed(0)} more annually with the ${topRec.card.name}`
      );
    }
    
    // Check for high spending categories
    const highSpendingCategory = spendingAnalysis.categoryBreakdown[0];
    if (highSpendingCategory && highSpendingCategory.percentage > 30) {
      insights.push(
        `${highSpendingCategory.category} represents ${highSpendingCategory.percentage.toFixed(0)}% of your spending - look for cards with high ${highSpendingCategory.category.toLowerCase()} rewards`
      );
    }
    
    return {
      recommendations: recommendations.slice(0, 10), // Top 10 recommendations
      totalSpending,
      currentEstimatedRewards: currentRewards,
      insights
    };
    
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return {
      recommendations: [],
      totalSpending: spendingAnalysis.totalSpent,
      currentEstimatedRewards: spendingAnalysis.totalSpent * 0.01,
      insights: ['Error generating recommendations. Please try again.']
    };
  }
}

// Save recommendations to database
export async function saveUserRecommendations(
  userId: string,
  recommendations: CardRecommendation[]
): Promise<boolean> {
  try {
    const supabase = createClientComponentClient();
    
    // For now, we could save to a user_recommendations table
    // This is optional and depends on your data structure preferences
    
    console.log('Saving recommendations for user:', userId);
    return true;
  } catch (error) {
    console.error('Error saving user recommendations:', error);
    return false;
  }
}

// Calculate rewards for current card based on spending analysis
export async function calculateCurrentCardRewards(
  spendingAnalysis: SpendingAnalysis,
  currentCardId?: string
): Promise<{ annualRewards: number; categoryRewards: CategoryReward[] }> {
  // If we have a current card ID from database, fetch its details
  if (currentCardId) {
    const supabase = createClientComponentClient();
    const { data: cardData, error } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('id', currentCardId)
      .single();
    
    if (!error && cardData) {
      const { categoryBreakdown } = extrapolateToAnnualSpending(spendingAnalysis);
      return calculateAnnualRewards(cardData, categoryBreakdown);
    }
  }
  
  // Fallback: create a generic 1% cashback card for basic calculation
  const genericCard: DatabaseCreditCard = {
    id: 'generic',
    name: 'Generic Card',
    issuer: 'Unknown',
    card_network: 'Unknown',
    annual_fee: 0,
    credit_score_requirement: 'Fair',
    foreign_transaction_fee: 0,
    base_earn_rate: 0.01, // 1% cashback
    groceries_earn_rate: 0.01,
    dining_earn_rate: 0.01,
    travel_earn_rate: 0.01,
    gas_earn_rate: 0.01,
    reward_type: 'cashback',
    point_value: 100, // 1 cent per point for cashback
    country: 'US',
    is_active: true
  };
  
  const { categoryBreakdown } = extrapolateToAnnualSpending(spendingAnalysis);
  return calculateAnnualRewards(genericCard, categoryBreakdown);
}

interface CreditCard {
  id: string;
  name: string;
  issuer: string;
  network: string;
  annual_fee: number;
  intro_apr: string;
  regular_apr: string;
  intro_bonus: string;
  points_program: string;
  image_url: string;
  apply_url: string;
  rating: number;
  benefits: string[];
  category_bonuses: {
    [category: string]: number;
  };
}

interface UserProfile {
  creditScore: number;
  annualIncome: number;
  spendingCategories: {
    [category: string]: number;
  };
  currentCards: string[];
}

interface RecommendationOptions {
  maxResults?: number;
  includeAnnualFeeCards?: boolean;
  preferredCategories?: string[];
}

export function getCardRecommendations(
  cards: CreditCard[],
  userProfile: UserProfile,
  options: RecommendationOptions = {}
): CreditCard[] {
  const {
    maxResults = 3,
    includeAnnualFeeCards = true,
    preferredCategories = []
  } = options;

  // Score each card based on user profile
  const scoredCards = cards.map(card => {
    let score = 0;

    // Credit score compatibility
    if (userProfile.creditScore >= 750) {
      score += 20; // All cards available
    } else if (userProfile.creditScore >= 700) {
      score += 15; // Most cards available
    } else if (userProfile.creditScore >= 650) {
      score += 10; // Some cards available
      // Prefer cards with lower requirements
      if (card.annual_fee === 0) score += 5;
    } else {
      score += 5; // Limited options
      if (card.annual_fee === 0) score += 10;
    }

    // Annual fee consideration
    if (!includeAnnualFeeCards && card.annual_fee > 0) {
      score -= 50; // Heavy penalty for annual fee cards if not wanted
    }

    // Calculate potential value from spending categories
    let categoryBonus = 0;
    Object.entries(userProfile.spendingCategories).forEach(([category, monthlySpend]) => {
      const categoryKey = category.toLowerCase();
      if (card.category_bonuses && card.category_bonuses[categoryKey]) {
        const bonusRate = card.category_bonuses[categoryKey];
        const annualSpend = monthlySpend * 12;
        const extraPoints = annualSpend * (bonusRate - 1); // Assuming 1x base rate
        categoryBonus += extraPoints * 0.01; // Rough value estimation
      }
    });
    score += categoryBonus;

    // Preferred categories bonus
    preferredCategories.forEach(category => {
      const categoryKey = category.toLowerCase();
      if (card.category_bonuses && card.category_bonuses[categoryKey]) {
        score += 10;
      }
    });

    // Annual fee vs value calculation
    const totalMonthlySpend = Object.values(userProfile.spendingCategories).reduce((sum, spend) => sum + spend, 0);
    const annualSpend = totalMonthlySpend * 12;
    
    if (card.annual_fee > 0 && annualSpend > 0) {
      const feeRatio = card.annual_fee / annualSpend;
      if (feeRatio < 0.02) { // Fee is less than 2% of annual spend
        score += 15;
      } else if (feeRatio < 0.05) { // Fee is less than 5% of annual spend
        score += 5;
      } else {
        score -= 10; // High fee relative to spending
      }
    }

    // Income compatibility
    if (userProfile.annualIncome >= 100000) {
      score += 10; // Premium cards available
    } else if (userProfile.annualIncome >= 50000) {
      score += 5; // Mid-tier cards
    }

    // Avoid recommending cards user already has
    if (userProfile.currentCards.includes(card.id)) {
      score -= 100; // Heavy penalty for duplicate cards
    }

    // Card rating bonus
    score += card.rating * 2;

    return {
      ...card,
      recommendationScore: Math.max(0, score)
    };
  });

  // Sort by score and return top results
  return scoredCards
    .filter(card => card.recommendationScore > 0)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, maxResults);
}

export function calculateCardValue(
  card: CreditCard,
  userProfile: UserProfile
): {
  annualValue: number;
  netValue: number;
  breakdown: {
    categoryBonuses: number;
    introBonus: number;
    annualFee: number;
  };
} {
  let categoryBonuses = 0;
  let introBonus = 0;

  // Calculate category bonuses
  Object.entries(userProfile.spendingCategories).forEach(([category, monthlySpend]) => {
    const categoryKey = category.toLowerCase();
    if (card.category_bonuses && card.category_bonuses[categoryKey]) {
      const bonusRate = card.category_bonuses[categoryKey];
      const annualSpend = monthlySpend * 12;
      const extraPoints = annualSpend * (bonusRate - 1);
      categoryBonuses += extraPoints * 0.01; // Rough value estimation
    }
  });

  // Parse intro bonus (simplified)
  const introMatch = card.intro_bonus.match(/\$(\d+)/);
  if (introMatch) {
    introBonus = parseInt(introMatch[1]);
  }

  const annualValue = categoryBonuses + introBonus;
  const netValue = annualValue - card.annual_fee;

  return {
    annualValue,
    netValue,
    breakdown: {
      categoryBonuses,
      introBonus,
      annualFee: card.annual_fee
    }
  };
} 