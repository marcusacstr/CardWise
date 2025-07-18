import { ParsedTransaction } from './csvParser';
import { getMCCCategory, getMCCDescription } from './mccDatabase';

export interface SpendingCategory {
  name: string;
  icon: string;
  keywords: string[];
  subcategories?: string[];
}

export interface TransactionWithCategory extends ParsedTransaction {
  category: string;
  subcategory?: string;
  confidence: number;
  mccCategory?: string;
  categorySource: 'mcc' | 'description' | 'manual';
}

export interface SpendingAnalysis {
  totalSpent: number;
  totalEarned: number;
  netSpending: number;
  transactionCount: number;
  averageTransactionAmount: number;
  categoryBreakdown: CategorySpending[];
  monthlyTrends: MonthlySpending[];
  merchantAnalysis: MerchantSpending[];
  spendingInsights: SpendingInsight[];
  topCategories: { category: string; amount: number; percentage: number }[];
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  averageAmount: number;
  trend: 'up' | 'down' | 'stable';
}

export interface MonthlySpending {
  month: string;
  year: number;
  amount: number;
  transactionCount: number;
  topCategory: string;
}

export interface MerchantSpending {
  merchant: string;
  amount: number;
  transactionCount: number;
  category: string;
  percentage: number;
}

export interface SpendingInsight {
  type: 'high_spending' | 'unusual_merchant' | 'category_trend' | 'savings_opportunity';
  title: string;
  description: string;
  amount?: number;
  category?: string;
  confidence: number;
}

// Enhanced categorization function with MCC priority
export function categorizeTransactionWithMCC(
  description: string,
  mcc?: string,
  existingCategory?: string
): { category: string; confidence: number; source: 'mcc' | 'description' | 'manual' } {
  
  // Priority 1: Use MCC if available (most accurate)
  if (mcc) {
    const mccCategory = getMCCCategory(mcc);
    if (mccCategory !== 'Other') {
      console.log('[CATEGORIZATION] Used MCC', mcc, '->', mccCategory);
      return {
        category: mccCategory,
        confidence: 0.95, // Very high confidence for MCC
        source: 'mcc'
      };
    }
  }

  // Priority 2: Use existing manual category if provided
  if (existingCategory && existingCategory.trim() !== '' && existingCategory !== 'Other') {
    console.log('[CATEGORIZATION] Used manual category', existingCategory);
    return {
      category: existingCategory,
      confidence: 0.90, // High confidence for manual categorization
      source: 'manual'
    };
  }

  // Priority 3: Use enhanced description-based categorization
  const descriptionResult = categorizeByDescription(description);
  console.log('[CATEGORIZATION] Used description for', description, '->', descriptionResult.category);
  return {
    category: descriptionResult.category,
    confidence: descriptionResult.confidence,
    source: 'description'
  };
}

function categorizeByDescription(description: string): { category: string; confidence: number } {
  const desc = description.toLowerCase();
  
  // Expanded merchant/keyword patterns for Canadian/US brands
  if (/walmart|wal-mart|walmart\.ca/.test(desc)) return { category: 'Groceries', confidence: 0.95 };
  if (/costco|costco\.ca|wholesale club/.test(desc)) return { category: 'Groceries', confidence: 0.95 };
  if (/safeway|loblaws|metro|sobeys|nofrills|no frills|freshco|superstore|food basics|giant tiger|foodland/.test(desc)) return { category: 'Groceries', confidence: 0.95 };
  if (/amazon|amzn|amazon\.ca/.test(desc)) return { category: 'Shopping', confidence: 0.95 };
  if (/tesla/.test(desc)) return { category: 'Transit', confidence: 0.90 };
  if (/shoppers drug mart|shoppers|rexall|london drugs|cvs|walgreens|rite aid/.test(desc)) return { category: 'Healthcare', confidence: 0.90 };
  if (/tim hortons|starbucks|dunkin|coffee/.test(desc)) return { category: 'Dining', confidence: 0.90 };
  if (/spotify|netflix|disney|crave|apple music|youtube/.test(desc)) return { category: 'Streaming', confidence: 0.95 };
  if (/uber|lyft|taxi|cab|transit|bus|train|skytrain|go transit|via rail/.test(desc)) return { category: 'Transit', confidence: 0.90 };
  if (/shell|esso|petro-canada|petrocanada|petro canada|chevron|husky|esso|mobil|bp|sunoco|marathon|valero/.test(desc)) return { category: 'Gas', confidence: 0.95 };

  // Enhanced pattern matching with confidence scoring
  const categoryPatterns = {
    'Dining': {
      patterns: [
        /\b(restaurant|dining|food|cafe|coffee|pizza|burger|taco|sushi|bar|pub|grill|bistro|deli|bakery)\b/,
        /\b(mcdonald|subway|starbucks|chipotle|panera|domino|kfc|taco bell|wendy|burger king)\b/,
        /\b(doordash|ubereats|grubhub|postmates|seamless|deliveroo|foodpanda)\b/,
        /\b(eat|meal|lunch|dinner|breakfast|brunch|dunkin|tim hortons|pizza hut)\b/,
        // Common transaction patterns
        /restaurant|dining|food.*dining|meal|lunch|dinner|breakfast/,
        /coffee|cafe|starbucks|dunkin|tim.*hortons/,
        /pizza|burger|taco|sandwich|deli|bakery/,
        /doordash|uber.*eats|grubhub|skip.*dishes|postmates/
      ],
      confidence: 0.85
    },
    'Groceries': {
      patterns: [
        /\b(grocery|supermarket|market|kroger|safeway|whole foods|trader joe|costco|walmart|target)\b/,
        /\b(publix|wegmans|giant|harris teeter|food lion|stop shop|aldi|fresh market|sprouts)\b/,
        /\b(produce|dairy|meat|bakery|deli|organic)\b/,
        // Enhanced grocery patterns
        /grocery|supermarket|market(?!.*place)|groceries/,
        /whole.*foods|trader.*joe|costco|walmart|target/,
        /kroger|safeway|publix|wegmans|giant|harris.*teeter/,
        /metro|loblaws|sobeys|freshco|nofrills|independent/
      ],
      confidence: 0.90
    },
    'Gas': {
      patterns: [
        /\b(gas|fuel|shell|exxon|bp|chevron|mobil|texaco|arco|citgo|marathon|sunoco|valero)\b/,
        /\b(speedway|wawa|sheetz|circle k|7-eleven.*gas|pilot|flying j|petro)\b/,
        /\b(station|petroleum|diesel)\b/
      ],
      confidence: 0.95
    },
    'Travel': {
      patterns: [
        /\b(airline|flight|hotel|airbnb|booking|expedia|priceline|kayak|orbitz|travelocity)\b/,
        /\b(marriott|hilton|hyatt|ihg|choice|wyndham|delta|american airlines|united|southwest)\b/,
        /\b(vacation|trip|resort|cruise|tour)\b/
      ],
      confidence: 0.85
    },
    'Transit': {
      patterns: [
        /\b(uber|lyft|taxi|metro|subway|bus|train|transit|parking|toll|mta|bart|septa)\b/,
        /\b(rental car|hertz|avis|budget|enterprise|alamo|zipcar)\b/,
        /\b(transport|commute|ride)\b/
      ],
      confidence: 0.80
    },
    'Entertainment': {
      patterns: [
        /\b(movie|theater|cinema|netflix|spotify|hulu|disney|amazon prime|apple music)\b/,
        /\b(concert|ticket|entertainment|amc|regal|cinemark|ticketmaster|stubhub)\b/,
        /\b(game|gaming|xbox|playstation|nintendo|steam)\b/,
        /\b(show|event|festival|club|nightlife)\b/
      ],
      confidence: 0.80
    },
    'Shopping': {
      patterns: [
        /\b(amazon|ebay|target|walmart|best buy|apple store|microsoft|google play)\b/,
        /\b(macy|nordstrom|tj maxx|marshalls|ross|old navy|gap|nike|adidas|zara|h&m)\b/,
        /\b(clothing|apparel|shoes|electronics|furniture|home|garden)\b/
      ],
      confidence: 0.75
    },
    'Utilities': {
      patterns: [
        /\b(electric|gas company|water|sewer|internet|phone|cable|utility|power|energy)\b/,
        /\b(verizon|att|tmobile|sprint|comcast|spectrum|cox|dish|directv|xfinity)\b/,
        /\b(bill|monthly|service|provider)\b/
      ],
      confidence: 0.90
    },
    'Healthcare': {
      patterns: [
        /\b(medical|doctor|hospital|pharmacy|cvs|walgreens|rite aid|health|dental|vision)\b/,
        /\b(clinic|urgent care|specialist|therapy|prescription|medicine)\b/,
        /\b(insurance|copay|deductible)\b/
      ],
      confidence: 0.85
    },
    'Streaming': {
      patterns: [
        /\b(netflix|hulu|disney\+|amazon prime|spotify|apple music|youtube|twitch|paramount)\b/,
        /\b(subscription|streaming|monthly|premium|plus)\b/
      ],
      confidence: 0.95
    },
    'Financial Services': {
      patterns: [
        /\b(bank|atm|fee|interest|loan|credit|investment|insurance|tax)\b/,
        /\b(transfer|deposit|withdrawal|payment|finance)\b/
      ],
      confidence: 0.80
    }
  };

  // Check each category pattern
  for (const [category, config] of Object.entries(categoryPatterns)) {
    for (const pattern of config.patterns) {
      if (pattern.test(desc)) {
        return {
          category,
          confidence: config.confidence
        };
      }
    }
  }

  // If no pattern matches, return Other with low confidence
  return {
    category: 'Other',
    confidence: 0.30
  };
}

export function analyzeTransactions(transactions: ParsedTransaction[], statementPeriod?: { startDate: Date | null; endDate: Date | null; statementDate: Date | null }): SpendingAnalysis {
  const categorizedTransactions: TransactionWithCategory[] = transactions.map(transaction => {
    const categoryResult = categorizeTransactionWithMCC(
      transaction.description,
      transaction.mcc,
      transaction.category
    );

    return {
      ...transaction,
      category: categoryResult.category,
      confidence: categoryResult.confidence,
      categorySource: categoryResult.source,
      mccCategory: transaction.mcc ? getMCCCategory(transaction.mcc) : undefined
    };
  });

  const totalSpent = categorizedTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalEarned = categorizedTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  // Category breakdown
  const categoryMap = new Map<string, { amount: number; count: number }>();
  categorizedTransactions
    .filter(t => t.type === 'debit')
    .forEach(transaction => {
      const current = categoryMap.get(transaction.category) || { amount: 0, count: 0 };
      categoryMap.set(transaction.category, {
        amount: current.amount + transaction.amount,
        count: current.count + 1
      });
    });

  const categoryBreakdown: CategorySpending[] = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: (data.amount / totalSpent) * 100,
      transactionCount: data.count,
      averageAmount: data.amount / data.count,
      trend: 'stable' as const // Would need historical data for real trend analysis
    }))
    .sort((a, b) => b.amount - a.amount);

  // Generate monthly trends using actual transaction dates and statement period
  const monthlyTrends: MonthlySpending[] = [];
  
  if (transactions.length > 0) {
    // Group transactions by month
    const monthlyData = new Map<string, { amount: number; count: number; categoryMap: Map<string, number> }>();
    
    categorizedTransactions
      .filter(t => t.type === 'debit')
      .forEach(transaction => {
        const monthKey = transaction.date.toISOString().slice(0, 7); // YYYY-MM format
        const current = monthlyData.get(monthKey) || { 
          amount: 0, 
          count: 0, 
          categoryMap: new Map<string, number>() 
        };
        
        current.amount += transaction.amount;
        current.count += 1;
        current.categoryMap.set(
          transaction.category, 
          (current.categoryMap.get(transaction.category) || 0) + transaction.amount
        );
        
        monthlyData.set(monthKey, current);
      });

    // Convert to monthly trends array
    Array.from(monthlyData.entries())
      .sort((a, b) => a[0].localeCompare(b[0])) // Sort by month
      .forEach(([monthKey, data]) => {
        const [year, month] = monthKey.split('-');
        const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long' });
        
        // Find the top category for this month
        let topCategory = 'Other';
        let topAmount = 0;
        data.categoryMap.forEach((amount, category) => {
          if (amount > topAmount) {
            topAmount = amount;
            topCategory = category;
          }
        });

        monthlyTrends.push({
          month: monthName,
          year: parseInt(year),
          amount: data.amount,
          transactionCount: data.count,
          topCategory
        });
      });
  }

  // If we have statement period information but no monthly trends generated,
  // create a single month entry for the statement period
  if (monthlyTrends.length === 0 && statementPeriod?.startDate && totalSpent > 0) {
    const statementDate = statementPeriod.startDate;
    const monthName = statementDate.toLocaleDateString('en-US', { month: 'long' });
    const year = statementDate.getFullYear();
    
    monthlyTrends.push({
      month: monthName,
      year,
      amount: totalSpent,
      transactionCount: categorizedTransactions.filter(t => t.type === 'debit').length,
      topCategory: categoryBreakdown[0]?.category || 'Other'
    });
  }

  // Merchant analysis
  const merchantMap = new Map<string, { amount: number; count: number; category: string }>();
  categorizedTransactions
    .filter(t => t.type === 'debit' && t.merchant)
    .forEach(transaction => {
      const merchant = transaction.merchant!;
      const current = merchantMap.get(merchant) || { amount: 0, count: 0, category: transaction.category };
      merchantMap.set(merchant, {
        amount: current.amount + transaction.amount,
        count: current.count + 1,
        category: transaction.category
      });
    });

  const merchantAnalysis: MerchantSpending[] = Array.from(merchantMap.entries())
    .map(([merchant, data]) => ({
      merchant,
      amount: data.amount,
      transactionCount: data.count,
      category: data.category,
      percentage: (data.amount / totalSpent) * 100
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10); // Top 10 merchants

  // Generate insights
  const insights: SpendingInsight[] = [];
  
  // High spending categories
  const topCategories = categoryBreakdown.slice(0, 3);
  topCategories.forEach(cat => {
    if (cat.percentage > 25) {
      insights.push({
        type: 'high_spending',
        title: `High ${cat.category} Spending`,
        description: `${cat.category} represents ${cat.percentage.toFixed(1)}% of your total spending ($${cat.amount.toFixed(2)})`,
        amount: cat.amount,
        category: cat.category,
        confidence: 0.8
      });
    }
  });

  // MCC vs Description categorization insights
  const mccCategorized = categorizedTransactions.filter(t => t.categorySource === 'mcc').length;
  const totalTransactions = categorizedTransactions.length;
  if (mccCategorized > 0) {
    insights.push({
      type: 'category_trend',
      title: 'Enhanced Categorization Active',
      description: `${mccCategorized} of ${totalTransactions} transactions were categorized using MCC codes for maximum accuracy`,
      confidence: 0.9
    });
  }

  return {
    totalSpent,
    totalEarned,
    netSpending: totalSpent - totalEarned,
    transactionCount: categorizedTransactions.length,
    averageTransactionAmount: totalSpent / categorizedTransactions.filter(t => t.type === 'debit').length,
    categoryBreakdown,
    monthlyTrends,
    merchantAnalysis,
    spendingInsights: insights,
    topCategories: topCategories.map(cat => ({
      category: cat.category,
      amount: cat.amount,
      percentage: cat.percentage
    }))
  };
} 