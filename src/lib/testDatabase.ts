import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function testCreditCardsDatabase() {
  const supabase = createClientComponentClient();
  
  try {
    console.log('Testing credit cards database connection...');
    
    const { data, error, count } = await supabase
      .from('credit_cards')
      .select('*', { count: 'exact' })
      .eq('is_active', true);
    
    if (error) {
      console.error('Database error:', error);
      return { success: false, error: error.message };
    }
    
    console.log(`Found ${count} active credit cards in database`);
    console.log('Sample cards:', data?.slice(0, 3).map(card => ({
      name: card.name,
      issuer: card.issuer,
      annual_fee: card.annual_fee,
      reward_type: card.reward_type
    })));
    
    return { 
      success: true, 
      count, 
      sampleCards: data?.slice(0, 3) 
    };
    
  } catch (error) {
    console.error('Test failed:', error);
    return { success: false, error: 'Connection failed' };
  }
}

export async function testRecommendationEngine() {
  const mockSpendingAnalysis = {
    totalSpent: 2500,
    totalEarned: 0,
    netSpending: 2500,
    transactionCount: 45,
    averageTransactionAmount: 55.56,
    categoryBreakdown: [
      {
        category: 'Dining',
        amount: 800,
        count: 15,
        percentage: 32,
        averageAmount: 53.33,
        trend: 'stable' as const
      },
      {
        category: 'Groceries',
        amount: 600,
        count: 12,
        percentage: 24,
        averageAmount: 50,
        trend: 'stable' as const
      },
      {
        category: 'Gas',
        amount: 400,
        count: 8,
        percentage: 16,
        averageAmount: 50,
        trend: 'stable' as const
      },
      {
        category: 'Other',
        amount: 700,
        count: 10,
        percentage: 28,
        averageAmount: 70,
        trend: 'stable' as const
      }
    ],
    monthlyTrends: [],
    merchantAnalysis: [],
    spendingInsights: [],
    topCategories: [
      { category: 'Dining', amount: 800, percentage: 32 },
      { category: 'Groceries', amount: 600, percentage: 24 },
      { category: 'Gas', amount: 400, percentage: 16 }
    ]
  };
  
  try {
    console.log('Testing recommendation engine...');
    console.log('Mock data: $2,500 total spent, 45 transactions');
    
    // Import here to avoid circular dependencies
    const { generateCardRecommendations } = await import('./cardRecommendations');
    const result = await generateCardRecommendations(mockSpendingAnalysis);
    
    console.log(`Generated ${result.recommendations.length} recommendations`);
    console.log('Insights:', result.insights);
    console.log('Top 3 recommendations:', result.recommendations.slice(0, 3).map(rec => ({
      name: rec.card.name,
      annualRewards: rec.annualRewards,
      netBenefit: rec.netBenefit,
      matchScore: rec.matchScore
    })));
    
    return { success: true, result };
    
  } catch (error) {
    console.error('Recommendation test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Test extrapolation specifically
export async function testExtrapolation() {
  // Test with 6 months of data (should be doubled)
  const sixMonthData = {
    totalSpent: 1250, // 6 months worth
    totalEarned: 0,
    netSpending: 1250,
    transactionCount: 22, // About 4 per month
    averageTransactionAmount: 56.82,
    categoryBreakdown: [
      {
        category: 'Dining',
        amount: 400, // 6 months worth
        count: 8,
        percentage: 32,
        averageAmount: 50,
        trend: 'stable' as const
      },
      {
        category: 'Groceries',
        amount: 300,
        count: 6,
        percentage: 24,
        averageAmount: 50,
        trend: 'stable' as const
      }
    ],
    monthlyTrends: [
      { 
        month: 'January', 
        year: 2024, 
        totalSpent: 200, 
        totalTransactions: 4,
        topCategory: 'Dining',
        categoryBreakdown: { 'Dining': 70, 'Groceries': 50, 'Other': 80 }
      },
      { 
        month: 'February', 
        year: 2024, 
        totalSpent: 210, 
        totalTransactions: 4,
        topCategory: 'Dining',
        categoryBreakdown: { 'Dining': 72, 'Groceries': 48, 'Other': 90 }
      },
      { 
        month: 'March', 
        year: 2024, 
        totalSpent: 205, 
        totalTransactions: 3,
        topCategory: 'Dining',
        categoryBreakdown: { 'Dining': 68, 'Groceries': 52, 'Other': 85 }
      },
      { 
        month: 'April', 
        year: 2024, 
        totalSpent: 215, 
        totalTransactions: 4,
        topCategory: 'Dining',
        categoryBreakdown: { 'Dining': 75, 'Groceries': 55, 'Other': 85 }
      },
      { 
        month: 'May', 
        year: 2024, 
        totalSpent: 210, 
        totalTransactions: 3,
        topCategory: 'Dining',
        categoryBreakdown: { 'Dining': 70, 'Groceries': 50, 'Other': 90 }
      },
      { 
        month: 'June', 
        year: 2024, 
        totalSpent: 210, 
        totalTransactions: 4,
        topCategory: 'Dining',
        categoryBreakdown: { 'Dining': 75, 'Groceries': 45, 'Other': 90 }
      }
    ],
    merchantAnalysis: [],
    spendingInsights: [],
    topCategories: [
      { category: 'Dining', amount: 400, percentage: 32 },
      { category: 'Groceries', amount: 300, percentage: 24 }
    ]
  };

  try {
    console.log('Testing 12-month extrapolation...');
    console.log('Input: 6 months of data, $1,250 total spent');
    
    const { generateCardRecommendations } = await import('./cardRecommendations');
    const result = await generateCardRecommendations(sixMonthData);
    
    console.log('Expected extrapolation: Should roughly double spending amounts');
    console.log('Insights:', result.insights);
    console.log('Should mention extrapolation from 6 months');
    
    return { success: true, result };
    
  } catch (error) {
    console.error('Extrapolation test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
} 