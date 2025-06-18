import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import csv from 'csv-parser';
import { Readable } from 'stream';
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Define type for transaction data
interface Transaction {
  description?: string;
  amount?: string; // Amount is initially a string from CSV
  mcc?: string;
}

// Define type for Credit Card data fetched from DB
interface CreditCard {
  id: string;
  name: string;
  issuer: string;
  card_network: string;
  annual_fee: number;
  credit_score_requirement: string;
  welcome_bonus: string | null;
  welcome_bonus_requirements: string | null;
  foreign_transaction_fee: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  base_earn_rate: number;
  groceries_earn_rate: number;
  dining_earn_rate: number;
  travel_earn_rate: number;
  gas_earn_rate: number;
  groceries_cap: number | null;
  dining_cap: number | null;
  travel_cap: number | null;
  gas_cap: number | null;
  groceries_cap_frequency: string | null;
  dining_cap_frequency: string | null;
  travel_cap_frequency: string | null;
  gas_cap_frequency: string | null;
  reward_type: string;
  point_value: number;
  benefits: any;
  image_url: string | null;
  application_url: string | null;
  country: string;
}

interface Card {
  id: string;
  name: string;
  issuer: string;
  card_network: string;
  annual_fee: number;
  credit_score_requirement: string;
  welcome_bonus: string | null;
  welcome_bonus_requirements: string | null;
  foreign_transaction_fee: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  base_earn_rate: number;
  groceries_earn_rate: number;
  dining_earn_rate: number;
  travel_earn_rate: number;
  gas_earn_rate: number;
  groceries_cap: number | null;
  dining_cap: number | null;
  travel_cap: number | null;
  gas_cap: number | null;
  groceries_cap_frequency: string | null;
  dining_cap_frequency: string | null;
  travel_cap_frequency: string | null;
  gas_cap_frequency: string | null;
  reward_type: string;
  point_value: number;
  benefits: any;
  image_url: string | null;
  application_url: string | null;
  country: string;
}

// Helper function to parse CSV data using csv-parser library
async function parseCsv(csvString: string): Promise<Transaction[]> {
  const results: Transaction[] = [];

  // Create a readable stream from the CSV string
  const stream = Readable.from([csvString]);

  return new Promise((resolve, reject) => {
    stream
      .pipe(csv())
      .on('data', (data: Transaction) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Helper function to call CatMyTransaction API
async function categorizeWithCatMyTransaction(description: string): Promise<string> {
  try {
    const response = await fetch('https://api.catmytransaction.com/v1/categorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CATMYTRANSACTION_API_KEY}`
      },
      body: JSON.stringify({ query: description })
    });

    if (!response.ok) {
      console.warn(`CatMyTransaction API error: ${response.statusText}`);
      return 'other';
    }

    const data = await response.json();
    return data.category.toLowerCase();
  } catch (error) {
    console.error('Error calling CatMyTransaction:', error);
    return 'other';
  }
}

// Helper function to categorize spending
async function categorizeSpending(transactions: Transaction[]): Promise<Record<string, number>> {
  const categories: Record<string, number> = {
    groceries: 0,
    dining: 0,
    travel: 0,
    gas: 0,
    other: 0,
  };

  // MCC to Internal Category Mapping
  const mccCategoryMap: { [key: string]: string } = {
    // Groceries
    '5411': 'groceries', // Grocery Stores
    '5462': 'groceries', // Bakeries
    '5499': 'groceries', // Miscellaneous Food Stores
    '5300': 'groceries', // Wholesale Clubs

    // Dining
    '5811': 'dining', // Eating Places, Restaurants
    '5812': 'dining', // Eating Places, Restaurants (Cont.)
    '5813': 'dining', // Drinking Places
    '5814': 'dining', // Fast Food Restaurants

    // Travel
    '4111': 'travel', // Transportation
    '4511': 'travel', // Airlines
    '4722': 'travel', // Travel Agencies
    '7011': 'travel', // Hotels
    '7512': 'travel', // Car Rental

    // Gas
    '5541': 'gas', // Service Stations
    '5542': 'gas', // Fuel Dispensers
  };

  // Map CatMyTransaction categories to our internal categories
  const categoryMapping: { [key: string]: string } = {
    'groceries': 'groceries',
    'food and drink': 'dining',
    'eating out': 'dining',
    'travel': 'travel',
    'transportation': 'travel',
    'gas': 'gas',
    'fuel': 'gas',
    // Add more mappings as needed
  };

  for (const transaction of transactions) {
    const description = transaction.description?.toLowerCase() || '';
    const amount = parseFloat(transaction.amount?.replace(/[^0-9.-]+/g,'')) || 0;

    if (amount <= 0) continue;

    // First try MCC if available
    if (transaction.mcc && mccCategoryMap[transaction.mcc]) {
      categories[mccCategoryMap[transaction.mcc]] += amount;
      continue;
    }

    // Then try CatMyTransaction API
    const catMyTransactionCategory = await categorizeWithCatMyTransaction(description);
    const mappedCategory = categoryMapping[catMyTransactionCategory] || 'other';
    categories[mappedCategory] += amount;
  }

  return categories;
}

// Helper function to calculate rewards value
function calculateRewardsValue(card: CreditCard, spendingData: SpendingData) {
  // Calculate base rewards
  const baseRewards = spendingData.base * card.base_earn_rate;
  
  // Calculate category-specific rewards
  const groceryRewards = calculateCategoryRewards(
    spendingData.groceries,
    card.groceries_earn_rate,
    card.groceries_cap,
    card.groceries_cap_frequency
  );
  
  const diningRewards = calculateCategoryRewards(
    spendingData.dining,
    card.dining_earn_rate,
    card.dining_cap,
    card.dining_cap_frequency
  );
  
  const travelRewards = calculateCategoryRewards(
    spendingData.travel,
    card.travel_earn_rate,
    card.travel_cap,
    card.travel_cap_frequency
  );
  
  const gasRewards = calculateCategoryRewards(
    spendingData.gas,
    card.gas_earn_rate,
    card.gas_cap,
    card.gas_cap_frequency
  );
  
  // Calculate total rewards value
  const totalRewards = baseRewards + groceryRewards + diningRewards + travelRewards + gasRewards;
  return totalRewards * card.point_value;
}

// Helper function to calculate estimated value
function calculateEstimatedValue(card: CreditCard, spendingData: SpendingData) {
  const rewardsValue = calculateRewardsValue(card, spendingData);
  const welcomeBonusValue = calculateWelcomeBonusValue(card, spendingData);
  const annualFeeImpact = -card.annual_fee;
  const foreignTransactionImpact = calculateForeignTransactionImpact(card, spendingData);
  
  return rewardsValue + welcomeBonusValue + annualFeeImpact - foreignTransactionImpact;
}

interface SpendingData {
  [category: string]: number; // Assuming this is monthly spending
}

// Helper function to calculate partner transfer value
function calculatePartnerTransferValue(card: CreditCard) {
  if (!card.benefits?.transfer_partners) return 0;
  
  const transferPartners = card.benefits.transfer_partners;
  let totalValue = 0;
  
  // Common transfer partner values (cents per point)
  const partnerValues: Record<string, number> = {
    'united': 1.5,
    'american': 1.4,
    'delta': 1.2,
    'hyatt': 1.7,
    'marriott': 0.8,
    'hilton': 0.5,
    'british_airways': 1.3,
    'virgin_atlantic': 1.4,
    'aeroplan': 1.4,
    'flying_blue': 1.2
  };
  
  // Calculate average transfer value
  for (const partner of transferPartners) {
    if (partnerValues[partner]) {
      totalValue += partnerValues[partner];
    }
  }
  
  return transferPartners.length > 0 ? totalValue / transferPartners.length : 0;
}

// Helper function to check credit score eligibility
function checkCreditScoreEligibility(card: CreditCard, userCreditScore: number | null) {
  if (!userCreditScore || !card.credit_score_requirement) return true;
  
  const requirements: Record<string, number> = {
    'excellent': 750,
    'good to excellent': 700,
    'good': 670,
    'fair to good': 640,
    'fair': 580
  };
  
  const requiredScore = requirements[card.credit_score_requirement.toLowerCase()];
  return requiredScore ? userCreditScore >= requiredScore : true;
}

// Helper function to calculate dynamic benefits value
function calculateBenefitsValue(card: CreditCard, spendingData: Record<string, number>) {
  if (!card.benefits) return 0;
  
  let totalValue = 0;
  
  // Base benefit values
  const baseBenefitValues: Record<string, number> = {
    'travel_insurance': 100,
    'purchase_protection': 50,
    'extended_warranty': 50,
    'dining_credits': 120,
    'uber_credits': 120,
    'airport_lounge_access': 200,
    'global_entry_credit': 100,
    'tsa_precheck_credit': 85,
    'hotel_status': 100,
    'rental_car_insurance': 50
  };
  
  // Dynamic benefit values based on spending
  const dynamicBenefitValues: Record<string, (spending: Record<string, number>) => number> = {
    'travel_insurance': (spending) => Math.min(200, spending.travel * 0.02),
    'purchase_protection': (spending) => Math.min(100, spending.other * 0.01),
    'dining_credits': (spending) => Math.min(240, spending.dining * 0.05),
    'uber_credits': (spending) => Math.min(240, spending.travel * 0.03)
  };
  
  // Calculate value of each benefit
  for (const [benefit, value] of Object.entries(baseBenefitValues)) {
    if (card.benefits[benefit]) {
      if (dynamicBenefitValues[benefit]) {
        // Use dynamic calculation if available
        totalValue += dynamicBenefitValues[benefit](spendingData);
         } else {
        // Use base value
        totalValue += value;
      }
    }
  }
  
  // Add partner transfer value if available
  const transferValue = calculatePartnerTransferValue(card);
  if (transferValue > 0) {
    totalValue += transferValue * 100; // Convert cents to dollars
  }
  
  return totalValue;
}

// Helper function to check 5/24 rule eligibility
function check524Eligibility(card: CreditCard, userCards: any[]) {
  // Only check for Chase cards
  if (card.issuer.toLowerCase() !== 'chase') return true;
  
  // Count cards opened in last 24 months
  const twentyFourMonthsAgo = new Date();
  twentyFourMonthsAgo.setMonth(twentyFourMonthsAgo.getMonth() - 24);
  
  const recentCards = userCards.filter(card => {
    const openDate = new Date(card.open_date);
    return openDate >= twentyFourMonthsAgo;
  });
  
  return recentCards.length < 5;
}

// Helper function to calculate category overlap penalty
function calculateCategoryOverlapPenalty(card: CreditCard, userCards: any[], spendingData: Record<string, number>) {
  let penalty = 0;
  
  // Define category overlap weights
  const categoryWeights: Record<string, number> = {
    'groceries': 0.3,
    'dining': 0.2,
    'travel': 0.25,
    'gas': 0.15,
    'other': 0.1
  };
  
  // Check each category for overlap
  for (const [category, weight] of Object.entries(categoryWeights)) {
    const categoryEarnRate = card[`${category}_earn_rate`];
    if (!categoryEarnRate) continue;
    
    // Find user's best existing card for this category
    const bestExistingRate = userCards.reduce((best, userCard) => {
      const userCardRate = userCard[`${category}_earn_rate`];
      return userCardRate > best ? userCardRate : best;
    }, 0);
    
    // If new card's rate is not significantly better, apply penalty
    if (categoryEarnRate <= bestExistingRate * 1.2) {
      const categorySpending = spendingData[category] || 0;
      penalty += categorySpending * weight;
    }
  }
  
  return penalty;
}

// Helper function to calculate optimal redemption value
function calculateOptimalRedemptionValue(card: CreditCard, spendingData: Record<string, number>) {
  let baseValue = card.point_value;
  
  // Adjust value based on redemption options
  if (card.benefits?.transfer_partners) {
    const transferValue = calculatePartnerTransferValue(card);
    baseValue = Math.max(baseValue, transferValue);
  }
  
  // Adjust for travel portal bonus if available
  if (card.benefits?.travel_portal_bonus) {
    const portalBonus = card.benefits.travel_portal_bonus;
    baseValue = Math.max(baseValue, baseValue * (1 + portalBonus / 100));
  }
  
  // Adjust for statement credit value if available
  if (card.benefits?.statement_credit_value) {
    const creditValue = card.benefits.statement_credit_value;
    baseValue = Math.max(baseValue, creditValue);
  }
  
  return baseValue;
}

// Helper function to calculate sign-up bonus timing value
function calculateSignUpBonusTimingValue(card: CreditCard, spendingData: Record<string, number>) {
  if (!card.welcome_bonus_requirements) return 0;
  
  const spendingMatch = card.welcome_bonus_requirements.match(/\$(\d+(?:,\d+)*)/);
  if (!spendingMatch) return 0;
  
  const requiredSpending = parseInt(spendingMatch[1].replace(/,/g, ''));
  const timeMatch = card.welcome_bonus_requirements.match(/(\d+)\s*(?:month|months)/i);
  const timeFrame = timeMatch ? parseInt(timeMatch[1]) : 3; // Default to 3 months
  
  // Calculate monthly spending needed
  const monthlyRequired = requiredSpending / timeFrame;
  const totalMonthlySpending = Object.values(spendingData).reduce((sum, amount) => sum + (amount || 0), 0);
  
  // If user can't meet spending requirement, reduce bonus value
  if (totalMonthlySpending < monthlyRequired) {
    return -1; // Negative value indicates card should be deprioritized
  }
  
  // If user can easily meet spending requirement, increase bonus value
  if (totalMonthlySpending > monthlyRequired * 1.5) {
    return 1; // Positive value indicates card should be prioritized
  }
  
  return 0; // Neutral value
}

// Helper function to calculate annual fee waiver value
function calculateAnnualFeeWaiverValue(card: CreditCard, spendingData: Record<string, number>) {
  if (!card.benefits?.annual_fee_waiver) return 0;
  
  const waiverRequirements = card.benefits.annual_fee_waiver;
  let totalValue = 0;
  
  // Check spending-based waivers
  if (waiverRequirements.spending_threshold) {
    const annualSpending = Object.values(spendingData).reduce((sum, amount) => sum + (amount || 0), 0) * 12;
    if (annualSpending >= waiverRequirements.spending_threshold) {
      totalValue += card.annual_fee;
    }
  }
  
  // Check military waivers
  if (waiverRequirements.military_eligible) {
    totalValue += card.annual_fee * 0.5; // Assume 50% chance of military status
  }
  
  // Check first-year waivers
  if (waiverRequirements.first_year_waived) {
    totalValue += card.annual_fee;
  }
  
  return totalValue;
}

// Helper function to analyze spending patterns
function analyzeSpendingPatterns(spendingData: Record<string, number>) {
  const totalSpending = Object.values(spendingData).reduce((sum, amount) => sum + (amount || 0), 0);
  const patterns: Record<string, number> = {};
  
  // Calculate category percentages
  for (const [category, amount] of Object.entries(spendingData)) {
    patterns[category] = amount / totalSpending;
  }
  
  // Identify primary spending categories (over 30% of total)
  const primaryCategories = Object.entries(patterns)
    .filter(([_, percentage]) => percentage > 0.3)
    .map(([category]) => category);
  
  // Identify secondary spending categories (15-30% of total)
  const secondaryCategories = Object.entries(patterns)
    .filter(([_, percentage]) => percentage >= 0.15 && percentage <= 0.3)
    .map(([category]) => category);
  
  return {
    primaryCategories,
    secondaryCategories,
    patterns
  };
}

// Define the POST handler for the API route
export async function POST(request: Request) {
  const { spendingData, userId, creditScore } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Ensure user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || (userId && user.id !== userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // --- Input Validation and Sanitization ---
    if (!spendingData) {
        return NextResponse.json({ error: 'Spending data is missing' }, { status: 400 });
    }

    let categorizedMonthlySpending: SpendingData = {};

    if (typeof spendingData === 'string') {
      // This is likely CSV data - parse and categorize it
       if (spendingData.trim().length === 0) {
          return NextResponse.json({ recommendations: [], message: "CSV data is empty." }, { status: 200 });
       }
      const transactions = await parseCsv(spendingData);
       if (!transactions || transactions.length === 0) {
          console.warn('No transactions parsed from CSV.');
          // Depending on requirements, you might return an error or just empty recommendations
          return NextResponse.json({ recommendations: [], message: "No valid transactions found in CSV." }, { status: 200 });
       }
      categorizedMonthlySpending = await categorizeSpending(transactions);

    } else if (typeof spendingData === 'object' && spendingData !== null) {
      // This is likely manual input data (already categorized, assumed to be monthly)
      // Validate manual input structure and values
       const allowedCategories = ['groceries', 'dining', 'travel', 'gas', 'other']; // Define expected categories
       if (Object.keys(spendingData).length === 0 || !Object.keys(spendingData).every(cat => allowedCategories.includes(cat))) {
           return NextResponse.json({ error: 'Invalid manual spending data categories' }, { status: 400 });
       }

       let hasPositiveSpending = false;
       for (const category in spendingData) {
           if (spendingData.hasOwnProperty(category)) {
               const amount = spendingData[category];
               if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
                   return NextResponse.json({ error: `Invalid spending amount for category ${category}` }, { status: 400 });
               }
               if (amount > 0) {
                   hasPositiveSpending = true;
               }
           }
       }

       if (!hasPositiveSpending) {
           return NextResponse.json({ recommendations: [], message: "Please enter valid spending amounts manually." }, { status: 200 });
       }

      categorizedMonthlySpending = spendingData as SpendingData;
    } else {
       return NextResponse.json({ error: 'Invalid spending data format' }, { status: 400 });
    }
    // --- End Input Validation and Sanitization ---

    // Annualize the monthly spending for value calculation
     const annualizedSpending: Record<string, number> = {};
     for (const category in categorizedMonthlySpending) {
         if (categorizedMonthlySpending.hasOwnProperty(category)) {
             annualizedSpending[category] = categorizedMonthlySpending[category] * 12;
         }
     }

    // Fetch credit cards from the database
    const { data: cards, error: cardsError } = await supabase
      .from('credit_cards')
      .select('*')
      .returns<Card[]>();

    if (cardsError) {
      console.error('Error fetching cards:', cardsError);
      return NextResponse.json({ error: 'Failed to fetch credit cards' }, { status: 500 });
    }

    if (!cards || cards.length === 0) {
       return NextResponse.json({ recommendations: [] }, { status: 200 }); // No cards available
    }

    // Analyze spending patterns
    const spendingPatterns = analyzeSpendingPatterns(annualizedSpending);

    // Calculate estimated annual value for each card
    const cardsWithValue = cards.map(card => {
      // Skip cards that don't meet credit score requirements
      if (!checkCreditScoreEligibility(card, creditScore)) {
        return {
          ...card,
          estimated_annual_value: 0,
          value_breakdown: {
            rewards_value: 0,
            welcome_bonus_value: 0,
            benefits_value: 0,
            annual_fee_impact: 0,
            foreign_transaction_impact: 0,
            ineligible: true,
            ineligibility_reason: 'credit_score'
          }
        };
      }
      
      // Skip cards that don't meet 5/24 rule
      if (!check524Eligibility(card, cards)) {
        return {
      ...card,
          estimated_annual_value: 0,
          value_breakdown: {
            rewards_value: 0,
            welcome_bonus_value: 0,
            benefits_value: 0,
            annual_fee_impact: 0,
            foreign_transaction_impact: 0,
            ineligible: true,
            ineligibility_reason: '5_24_rule'
          }
        };
      }
      
      // Calculate base rewards with pattern weighting
      const baseRewards = annualizedSpending.base * card.base_earn_rate;
      
      // Calculate category-specific rewards with pattern weighting
      const groceryRewards = calculateCategoryRewards(
        annualizedSpending.groceries,
        card.groceries_earn_rate,
        card.groceries_cap,
        card.groceries_cap_frequency
      ) * (spendingPatterns.primaryCategories.includes('groceries') ? 1.2 : 1);
      
      const diningRewards = calculateCategoryRewards(
        annualizedSpending.dining,
        card.dining_earn_rate,
        card.dining_cap,
        card.dining_cap_frequency
      ) * (spendingPatterns.primaryCategories.includes('dining') ? 1.2 : 1);
      
      const travelRewards = calculateCategoryRewards(
        annualizedSpending.travel,
        card.travel_earn_rate,
        card.travel_cap,
        card.travel_cap_frequency
      ) * (spendingPatterns.primaryCategories.includes('travel') ? 1.2 : 1);
      
      const gasRewards = calculateCategoryRewards(
        annualizedSpending.gas,
        card.gas_earn_rate,
        card.gas_cap,
        card.gas_cap_frequency
      ) * (spendingPatterns.primaryCategories.includes('gas') ? 1.2 : 1);
      
      // Calculate optimal point value
      const optimalPointValue = calculateOptimalRedemptionValue(card, annualizedSpending);
      
      // Calculate total rewards value with optimal redemption
      const totalRewardsValue = (baseRewards + groceryRewards + diningRewards + travelRewards + gasRewards) * optimalPointValue;
      
      // Calculate welcome bonus value with timing consideration
      const welcomeBonusValue = calculateWelcomeBonusValue(card, annualizedSpending);
      const bonusTimingValue = calculateSignUpBonusTimingValue(card, annualizedSpending);
      
      // Calculate annual fee impact with waiver consideration
      const annualFeeImpact = card.annual_fee;
      const feeWaiverValue = calculateAnnualFeeWaiverValue(card, annualizedSpending);
      
      // Calculate foreign transaction fee impact
      const foreignTransactionImpact = calculateForeignTransactionImpact(card, annualizedSpending);
      
      // Calculate benefits value
      const benefitsValue = calculateBenefitsValue(card, annualizedSpending);
      
      // Calculate category overlap penalty
      const categoryOverlapPenalty = calculateCategoryOverlapPenalty(card, cards, annualizedSpending);
      
      // Calculate total annual value with all factors
      const totalAnnualValue = totalRewardsValue + 
        welcomeBonusValue + 
        benefitsValue - 
        (annualFeeImpact - feeWaiverValue) - 
        foreignTransactionImpact - 
        categoryOverlapPenalty + 
        (bonusTimingValue * 100); // Convert timing value to dollars
      
      return {
        ...card,
        estimated_annual_value: totalAnnualValue,
        value_breakdown: {
          rewards_value: totalRewardsValue,
          welcome_bonus_value: welcomeBonusValue,
          benefits_value: benefitsValue,
          annual_fee_impact: -(annualFeeImpact - feeWaiverValue),
          foreign_transaction_impact: -foreignTransactionImpact,
          category_overlap_penalty: -categoryOverlapPenalty,
          bonus_timing_value: bonusTimingValue * 100,
          fee_waiver_value: feeWaiverValue,
          ineligible: false,
          ineligibility_reason: null,
          optimal_point_value: optimalPointValue,
          spending_patterns: spendingPatterns
        }
      };
    });

    // Sort cards by estimated annual value and filter out ineligible cards
    const sortedCards = cardsWithValue
      .filter(card => !card.value_breakdown.ineligible)
      .sort((a, b) => b.estimated_annual_value - a.estimated_annual_value);

    // Return top 3 recommendations with detailed breakdown
    return NextResponse.json({
      recommendations: sortedCards.slice(0, 3).map(card => ({
        id: card.id,
        name: card.name,
      issuer: card.issuer,
        annual_fee: card.annual_fee,
      estimated_annual_value: card.estimated_annual_value,
        value_breakdown: card.value_breakdown,
      image_url: card.image_url,
        application_url: card.application_url,
        credit_score_requirement: card.credit_score_requirement,
        benefits: card.benefits,
        optimal_point_value: card.value_breakdown.optimal_point_value,
        spending_patterns: card.value_breakdown.spending_patterns
      }))
    });

  } catch (error: any) {
    console.error('Analysis failed:', error);
    return NextResponse.json({ error: error.message || 'An internal server error occurred during analysis.' }, { status: 500 });
  }
}

// Helper function to calculate category rewards with caps and tiered rewards
function calculateCategoryRewards(spending: number, earnRate: number, cap: number | null, frequency: string | null) {
  if (!spending || !earnRate) return 0;
  
  let effectiveSpending = spending;
  let rewards = 0;
  
  // Handle spending caps
  if (cap && frequency) {
    const capMultiplier = frequency === 'monthly' ? 12 : frequency === 'quarterly' ? 4 : 1;
    const annualCap = cap * capMultiplier;
    
    if (spending > annualCap) {
      // Calculate rewards for capped and uncapped portions
      rewards += annualCap * earnRate;
      // Some cards offer a lower rate after cap (typically 1x)
      rewards += (spending - annualCap) * 1;
    } else {
      rewards += spending * earnRate;
    }
  } else {
    rewards += spending * earnRate;
  }
  
  return rewards;
}

// Helper function to calculate welcome bonus value with requirements
function calculateWelcomeBonusValue(card: CreditCard, annualizedSpending: Record<string, number>) {
  if (!card.welcome_bonus) return 0;
  
  // Extract points/miles value from welcome bonus text
  const pointsMatch = card.welcome_bonus.match(/(\d+(?:,\d+)*)\s*(?:points|miles)/i);
  if (!pointsMatch) return 0;
  
  const points = parseInt(pointsMatch[1].replace(/,/g, ''));
  const bonusValue = points * (card.point_value || 1.0);
  
  // Check if there are spending requirements
  if (card.welcome_bonus_requirements) {
    const spendingMatch = card.welcome_bonus_requirements.match(/\$(\d+(?:,\d+)*)/);
    if (spendingMatch) {
      const requiredSpending = parseInt(spendingMatch[1].replace(/,/g, ''));
      // If user's annual spending is less than required spending, reduce bonus value proportionally
      const totalAnnualSpending = Object.values(annualizedSpending).reduce((sum, amount) => sum + (amount || 0), 0);
      if (totalAnnualSpending < requiredSpending) {
        return bonusValue * (totalAnnualSpending / requiredSpending);
      }
    }
  }
  
  return bonusValue;
}

// Helper function to calculate foreign transaction fee impact with currency conversion
function calculateForeignTransactionImpact(card: CreditCard, spendingData: SpendingData) {
  if (!card.foreign_transaction_fee) return 0;
  
  const foreignSpending = spendingData.foreign || 0;
  const feeRate = card.foreign_transaction_fee;
  
  // Add a small buffer for currency conversion fees (typically 1-2%)
  const conversionBuffer = 0.02;
  
  return foreignSpending * ((feeRate / 100) + conversionBuffer);
}

// NOTE: Further improvements needed:
// 1. More robust CSV parsing supporting various formats and error handling.
// 2. More sophisticated categorization logic (mapping transaction descriptions/MCCs to a wider range of categories).
// 3. A more comprehensive calculateEstimatedValue function considering sign-up bonuses, tiered rewards, complex redemption options, etc.
// 4. Handling of different card types (credit, debit, etc. if applicable) and potentially user eligibility.
// 5. Input validation and sanitization beyond basic checks.
// 6. Consider using a dedicated library or service for MCC lookup and categorization.
// 7. Allow users to specify if spending is monthly or annual for manual input.
// 8. Implement history view for past analyses.
// 9. Refine tiered reward logic in calculateEstimatedValue to handle different tiered structures. 