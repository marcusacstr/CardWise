import { ParsedTransaction } from './csvParser';

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
  count: number;
  percentage: number;
  averageAmount: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface MonthlySpending {
  month: string;
  year: number;
  totalSpent: number;
  totalTransactions: number;
  topCategory: string;
  categoryBreakdown: { [category: string]: number };
}

export interface MerchantSpending {
  merchant: string;
  category: string;
  amount: number;
  count: number;
  averageAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'occasional';
}

export interface SpendingInsight {
  type: 'warning' | 'info' | 'positive';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendation?: string;
}

// Predefined spending categories aligned with credit card MCC (Merchant Category Codes)
const SPENDING_CATEGORIES: SpendingCategory[] = [
  {
    name: 'Dining', // MCC 5812 (Restaurants), 5814 (Fast Food)
    icon: '🍽️',
    keywords: [
      // Restaurants & Fast Food (MCC 5812, 5814)
      'restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonalds', 'burger', 'pizza',
      'food', 'dining', 'kitchen', 'diner', 'bistro', 'grill', 'bakery', 'bar', 'pub', 'tavern',
      'kfc', 'subway', 'wendys', 'taco bell', 'chipotle', 'panera', 'dunkin', 'tim hortons',
      'dairy queen', 'sonic', 'arbys', 'popeyes', 'chick-fil-a', 'five guys', 'in-n-out',
      'dominos', 'papa johns', 'little caesars', 'pizza hut', 'papa murphys',
      // Delivery & Takeout
      'delivery', 'doordash', 'uber eats', 'grubhub', 'postmates', 'skip the dishes', 'foodora',
      'seamless', 'caviar', 'eat24', 'takeout', 'take-out',
      // International & Specific Cuisines
      'sushi', 'chinese', 'thai', 'indian', 'mexican', 'italian', 'japanese', 'korean',
      'mediterranean', 'greek', 'vietnamese', 'pho', 'ramen', 'bbq', 'steakhouse',
      // Square & Common POS patterns
      'sq *', 'square', 'toast pos', 'clover', 'tasting room', 'dolce amore'
    ],
    subcategories: ['Restaurants', 'Fast Food', 'Coffee Shops', 'Food Delivery']
  },
  {
    name: 'Groceries', // MCC 5411 (Grocery Stores), 5441 (Candy/Nut stores)
    icon: '🛒',
    keywords: [
      // Grocery Stores (MCC 5411)
      'grocery', 'supermarket', 'walmart', 'target', 'safeway', 'kroger', 'whole foods',
      'trader joes', 'costco', 'sams club', 'bjs', 'aldi', 'food lion', 'harris teeter',
      'publix', 'wegmans', 'giant', 'stop & shop', 'king soopers', 'fred meyer',
      // Canadian Chains
      'loblaws', 'metro', 'sobeys', 'freshco', 'no frills', 'real canadian superstore',
      'food basics', 'fortinos', 'zehrs', 'valu-mart', 'independent',
      // General Terms
      'market', 'fresh', 'organic', 'produce', 'superstore', 'food store',
      'grocery store', 'food mart'
    ],
    subcategories: ['Supermarkets', 'Warehouse Clubs', 'Organic/Specialty']
  },
  {
    name: 'Gas', // MCC 5541 (Service Stations/Automated Fuel Dispensers)
    icon: '⛽',
    keywords: [
      // Gas Stations (MCC 5541)
      'gas', 'fuel', 'shell', 'exxon', 'bp', 'chevron', 'mobil', 'station', 'petro',
      'texaco', 'marathon', 'phillips 66', 'conoco', 'sunoco', 'citgo', 'speedway',
      'wawa', '7-eleven', 'circle k', 'pilot', 'loves', 'flying j',
      // Canadian Gas
      'petro-canada', 'esso', 'husky', 'pioneer', 'fas gas', 'mohawk'
    ],
    subcategories: ['Gas Stations', 'Fuel']
  },
  {
    name: 'Transit', // MCC 4111 (Transportation), 4112 (Passenger Railways)
    icon: '��',
    keywords: [
      // Public Transportation (MCC 4111, 4112)
      'transit', 'subway', 'bus', 'metro', 'mta', 'ttc', 'translink', 'oc transpo',
      'uber', 'lyft', 'taxi', 'rideshare', 'ride share', 'car2go', 'zipcar',
      // Parking (often grouped with transit for rewards)
      'parking', 'toll', 'parking meter', 'parkade', 'impark', 'easypark'
    ],
    subcategories: ['Public Transit', 'Rideshare', 'Parking']
  },
  {
    name: 'Travel', // MCC 3000-3299 (Airlines), 3501-3999 (Hotels), 7512 (Car Rental)
    icon: '✈️',
    keywords: [
      // Airlines (MCC 3000-3299)
      'airline', 'flight', 'airways', 'american airlines', 'delta', 'united',
      'southwest', 'jetblue', 'alaska airlines', 'frontier', 'spirit',
      'air canada', 'westjet', 'porter airlines', 'british airways', 'lufthansa',
      // Hotels & Lodging (MCC 3501-3999)
      'hotel', 'motel', 'inn', 'resort', 'lodge', 'marriott', 'hilton', 'hyatt',
      'sheraton', 'westin', 'holiday inn', 'best western', 'comfort inn',
      'hampton inn', 'fairfield inn', 'courtyard', 'residence inn',
      'airbnb', 'vrbo', 'homeaway', 'booking.com', 'expedia', 'hotels.com',
      // Car Rental (MCC 7512)
      'car rental', 'rental car', 'hertz', 'avis', 'enterprise', 'budget',
      'alamo', 'national', 'thrifty',
      // General Travel Services
      'travel', 'vacation', 'trip', 'booking', 'reservation', 'airport',
      'cruise', 'carnival', 'royal caribbean', 'norwegian', 'disney cruise'
    ],
    subcategories: ['Airlines', 'Hotels', 'Car Rental', 'Cruises']
  },
  {
    name: 'Streaming', // MCC 4899 (Cable/Pay TV), 5815 (Digital Goods)
    icon: '📺',
    keywords: [
      // Streaming & Digital Services (MCC 4899, 5815)
      'netflix', 'hulu', 'disney+', 'amazon prime', 'hbo', 'showtime', 'starz',
      'spotify', 'apple music', 'youtube', 'twitch', 'patreon',
      'cable', 'satellite', 'xfinity', 'comcast', 'spectrum', 'cox', 'directv', 'dish'
    ],
    subcategories: ['Video Streaming', 'Music Streaming', 'Cable/Satellite TV']
  },
  {
    name: 'Department Stores', // MCC 5311 (Department Stores)
    icon: '🏬',
    keywords: [
      // Department Stores (MCC 5311)
      'macys', 'nordstrom', 'bloomingdales', 'saks', 'neiman marcus', 'dillards',
      'kohls', 'jc penney', 'sears', 'bon-ton', 'belk', 'von maur',
      'department store', 'dept store'
    ],
    subcategories: ['Department Stores']
  },
  {
    name: 'Warehouse Clubs', // MCC 5300 (Wholesale Clubs)
    icon: '🏪',
    keywords: [
      // Warehouse/Wholesale Clubs (MCC 5300)
      'costco', 'sams club', 'bjs', 'warehouse', 'wholesale', 'club'
    ],
    subcategories: ['Warehouse Clubs']
  },
  {
    name: 'Drug Stores', // MCC 5912 (Drug Stores and Pharmacies)
    icon: '💊',
    keywords: [
      // Pharmacies (MCC 5912)
      'pharmacy', 'walgreens', 'cvs', 'rite aid', 'drug store', 'drugstore',
      'shoppers drug mart', 'london drugs', 'pharmasave', 'rexall',
      'prescription', 'medicine', 'rx'
    ],
    subcategories: ['Pharmacies', 'Drug Stores']
  },
  {
    name: 'Online Shopping', // MCC varies by merchant
    icon: '🛍️',
    keywords: [
      // E-commerce & Online Shopping
      'amazon', 'amazon.com', 'amazon.ca', 'ebay', 'etsy', 'paypal', 'shopify',
      'apple.com', 'google play', 'app store', 'microsoft store',
      'online', 'web', 'internet'
    ],
    subcategories: ['E-commerce', 'Digital Purchases']
  },
  {
    name: 'Entertainment', // MCC 7832 (Motion Picture Theaters), 7922 (Theatrical Producers)
    icon: '🎬',
    keywords: [
      // Entertainment (MCC 7832, 7922, etc.)
      'movie', 'theater', 'cinema', 'amc', 'regal', 'cinemark', 'landmark',
      'imax', 'dolby', 'fandango', 'movietickets', 'atom tickets',
      'concert', 'event', 'ticket', 'ticketmaster', 'stubhub', 'seatgeek',
      'live nation', 'eventbrite', 'venue', 'arena', 'stadium', 'amphitheater',
      'gaming', 'game', 'steam', 'epic games', 'xbox live', 'playstation', 'nintendo',
      'entertainment', 'hobby', 'arcade', 'bowling', 'mini golf', 'laser tag', 'escape room'
    ],
    subcategories: ['Movies', 'Live Events', 'Gaming', 'Recreation']
  },
  {
    name: 'Telecommunications', // MCC 4814 (Telecommunication Services)
    icon: '📱',
    keywords: [
      // Phone & Internet (MCC 4814)
      'phone', 'cell', 'mobile', 'wireless', 'internet', 'telecom',
      'verizon', 'att', 'at&t', 't-mobile', 'sprint', 'boost', 'cricket',
      'metro pcs', 'straight talk', 'virgin mobile',
      // Canadian Telecom
      'rogers', 'bell', 'telus', 'fido', 'koodo', 'chatr', 'public mobile',
      'shaw', 'videotron', 'cogeco', 'eastlink', 'sasktel', 'mts'
    ],
    subcategories: ['Mobile Phone', 'Internet', 'Landline']
  },
  {
    name: 'Utilities', // MCC 4900 (Utilities)
    icon: '⚡',
    keywords: [
      // Utilities (MCC 4900)
      'electric', 'electricity', 'gas', 'water', 'sewer', 'utility', 'utilities',
      'hydro', 'power', 'energy', 'pge', 'con edison', 'duke energy',
      'southern california edison', 'florida power', 'national grid'
    ],
    subcategories: ['Electric', 'Gas', 'Water', 'Waste Management']
  },
  {
    name: 'Healthcare', // MCC 8011 (Doctors), 8021 (Dentists), 8031 (Hospitals)
    icon: '🏥',
    keywords: [
      // Medical Services (MCC 8011, 8021, 8031, etc.)
      'medical', 'doctor', 'physician', 'dr ', 'hospital', 'clinic', 'urgent care',
      'emergency room', 'er', 'surgery', 'specialist', 'dentist', 'dental',
      'orthodontist', 'optometrist', 'eye doctor', 'vision', 'glasses', 'contacts',
      'veterinarian', 'vet', 'animal hospital', 'pet clinic',
      'health', 'wellness', 'fitness', 'gym', 'yoga', 'massage', 'therapy',
      'chiropractor', 'physical therapy', 'mental health', 'counseling'
    ],
    subcategories: ['Medical', 'Dental', 'Vision', 'Veterinary']
  },
  {
    name: 'General Retail', // MCC 5999 (Miscellaneous Retail)
    icon: '🛒',
    keywords: [
      // General Retail (MCC 5999 and others)
      'shop', 'store', 'retail', 'mall', 'outlet', 'marketplace', 'bazaar',
      'clothing', 'fashion', 'apparel', 'shoes', 'footwear', 'accessories',
      'h&m', 'zara', 'forever 21', 'gap', 'old navy', 'banana republic',
      'uniqlo', 'urban outfitters', 'american eagle', 'abercrombie', 'hollister',
      'electronics', 'best buy', 'apple', 'microsoft', 'samsung', 'sony',
      'home depot', 'lowes', 'ikea', 'wayfair', 'furniture'
    ],
    subcategories: ['Clothing', 'Electronics', 'Home Improvement', 'General Merchandise']
  },
  {
    name: 'Financial Services', // MCC 6011 (Financial Institutions), 6012 (Member Financial Institutions)
    icon: '💰',
    keywords: [
      // Banking & Financial (MCC 6011, 6012, etc.)
      'bank', 'atm', 'fee', 'charge', 'interest', 'loan', 'credit', 'transfer',
      'payment', 'overdraft', 'maintenance', 'service charge', 'wire transfer',
      'foreign transaction', 'cash advance', 'late fee', 'annual fee',
      'investment', 'brokerage', 'trading', 'stock', 'mutual fund', 'etf',
      'insurance', 'premium', 'policy', 'financial', 'advisor'
    ],
    subcategories: ['Banking Fees', 'Investment', 'Insurance', 'Loans']
  },
  {
    name: 'Other',
    icon: '📦',
    keywords: [],
    subcategories: ['Miscellaneous']
  }
];

// Merchant pattern recognition for common POS systems and merchant codes
const MERCHANT_PATTERNS = [
  { pattern: /^sq \*/i, category: 'Dining', confidence: 0.8 }, // Square POS - usually restaurants
  { pattern: /^amazon\./i, category: 'Online Shopping', confidence: 0.9 },
  { pattern: /^amzn\s/i, category: 'Online Shopping', confidence: 0.9 },
  { pattern: /^paypal \*/i, category: 'Online Shopping', confidence: 0.7 },
  { pattern: /^apple\.com/i, category: 'Online Shopping', confidence: 0.8 },
  { pattern: /^google \*/i, category: 'Online Shopping', confidence: 0.7 },
  { pattern: /^uber\s/i, category: 'Transit', confidence: 0.9 },
  { pattern: /^lyft\s/i, category: 'Transit', confidence: 0.9 },
  { pattern: /^spotify/i, category: 'Streaming', confidence: 0.9 },
  { pattern: /^netflix/i, category: 'Streaming', confidence: 0.9 },
  { pattern: /^tst\*/i, category: 'Dining', confidence: 0.7 }, // Toast POS
  { pattern: /\d+-dfo\/mpo/i, category: 'Utilities', confidence: 0.6 }, // Government payments
  { pattern: /^pos\s/i, category: 'General Retail', confidence: 0.5 }, // Generic POS
  { pattern: /^visa\s/i, category: 'Financial Services', confidence: 0.8 },
  { pattern: /^mastercard\s/i, category: 'Financial Services', confidence: 0.8 },
];

function categorizeTransaction(transaction: ParsedTransaction): { category: string; subcategory?: string; confidence: number } {
  // If transaction already has a category from the bank, use it with high confidence
  if (transaction.category && transaction.category.trim() !== '') {
    return {
      category: transaction.category,
      confidence: 0.9
    };
  }

  const description = transaction.description.toLowerCase();
  const merchant = transaction.merchant?.toLowerCase() || '';
  const searchText = `${description} ${merchant}`;

  // First, try merchant pattern recognition
  for (const merchantPattern of MERCHANT_PATTERNS) {
    if (merchantPattern.pattern.test(description) || merchantPattern.pattern.test(merchant)) {
      return {
        category: merchantPattern.category,
        confidence: merchantPattern.confidence,
        subcategory: SPENDING_CATEGORIES.find(c => c.name === merchantPattern.category)?.subcategories?.[0]
      };
    }
  }

  let bestMatch = { category: 'Other', confidence: 0, subcategory: undefined };

  for (const category of SPENDING_CATEGORIES) {
    if (category.name === 'Other') continue;

    let matchScore = 0;
    let matchedKeywords = 0;
    let exactMatches = 0;

    for (const keyword of category.keywords) {
      const keywordLower = keyword.toLowerCase();
      
      // Check for exact word matches (higher score)
      const exactWordRegex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      if (exactWordRegex.test(searchText)) {
        exactMatches++;
        matchScore += keyword.length * 3; // Triple score for exact matches
        matchedKeywords++;
      }
      // Check for partial matches (lower score)
      else if (searchText.includes(keywordLower)) {
        matchScore += keyword.length;
        matchedKeywords++;
      }
      // Check for fuzzy matches (brand names, common misspellings)
      else if (fuzzyMatch(keywordLower, searchText)) {
        matchScore += keyword.length * 0.5;
        matchedKeywords++;
      }
    }

    if (matchedKeywords > 0) {
      // Calculate confidence based on match quality
      let confidence = Math.min(0.95, (matchScore / Math.max(searchText.length, 10)) + (exactMatches * 0.2) + (matchedKeywords * 0.05));
      
      // Boost confidence for exact matches
      if (exactMatches > 0) {
        confidence = Math.min(0.95, confidence + 0.3);
      }
      
      if (confidence > bestMatch.confidence) {
        bestMatch = {
          category: category.name,
          confidence,
          subcategory: category.subcategories?.[0] // Default to first subcategory
        };
      }
    }
  }

  // If no good match found, categorize as 'Other'
  if (bestMatch.confidence < 0.15) {
    bestMatch = { category: 'Other', confidence: 0.5, subcategory: 'Miscellaneous' };
  }

  return bestMatch;
}

// Simple fuzzy matching for common variations and typos
function fuzzyMatch(keyword: string, text: string): boolean {
  // Remove common word variations
  const normalizedKeyword = keyword.replace(/s$/, '').replace(/ing$/, '').replace(/ed$/, '');
  const normalizedText = text.replace(/s\b/g, '').replace(/ing\b/g, '').replace(/ed\b/g, '');
  
  if (normalizedText.includes(normalizedKeyword)) {
    return true;
  }
  
  // Check for common abbreviations
  const abbreviations: { [key: string]: string[] } = {
    'restaurant': ['rest', 'rst'],
    'grocery': ['groc'],
    'pharmacy': ['pharm', 'rx'],
    'gasoline': ['gas'],
    'coffee': ['cof'],
    'market': ['mkt', 'mart']
  };
  
  if (abbreviations[keyword]) {
    return abbreviations[keyword].some(abbr => text.includes(abbr));
  }
  
  return false;
}

function calculateMonthlyTrends(transactions: TransactionWithCategory[]): MonthlySpending[] {
  const monthlyData: { [key: string]: MonthlySpending } = {};

  transactions.forEach(transaction => {
    if (transaction.type !== 'debit') return; // Only analyze spending

    const date = transaction.date;
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: date.toLocaleString('default', { month: 'long' }),
        year: date.getFullYear(),
        totalSpent: 0,
        totalTransactions: 0,
        topCategory: '',
        categoryBreakdown: {}
      };
    }

    const monthData = monthlyData[monthKey];
    monthData.totalSpent += transaction.amount;
    monthData.totalTransactions++;
    
    if (!monthData.categoryBreakdown[transaction.category]) {
      monthData.categoryBreakdown[transaction.category] = 0;
    }
    monthData.categoryBreakdown[transaction.category] += transaction.amount;
  });

  // Determine top category for each month
  Object.values(monthlyData).forEach(month => {
    let topCategory = '';
    let topAmount = 0;
    
    Object.entries(month.categoryBreakdown).forEach(([category, amount]) => {
      if (amount > topAmount) {
        topAmount = amount;
        topCategory = category;
      }
    });
    
    month.topCategory = topCategory;
  });

  return Object.values(monthlyData).sort((a, b) => 
    new Date(`${a.year}-${a.month}-01`).getTime() - new Date(`${b.year}-${b.month}-01`).getTime()
  );
}

function analyzeMerchants(transactions: TransactionWithCategory[]): MerchantSpending[] {
  const merchantData: { [merchant: string]: MerchantSpending } = {};

  transactions.forEach(transaction => {
    if (transaction.type !== 'debit' || !transaction.merchant) return;

    const merchant = transaction.merchant;
    
    if (!merchantData[merchant]) {
      merchantData[merchant] = {
        merchant,
        category: transaction.category,
        amount: 0,
        count: 0,
        averageAmount: 0,
        frequency: 'occasional'
      };
    }

    merchantData[merchant].amount += transaction.amount;
    merchantData[merchant].count++;
  });

  // Calculate averages and frequency
  const merchants = Object.values(merchantData);
  merchants.forEach(merchant => {
    merchant.averageAmount = merchant.amount / merchant.count;
    
    // Simple frequency calculation based on transaction count
    if (merchant.count >= 20) {
      merchant.frequency = 'daily';
    } else if (merchant.count >= 8) {
      merchant.frequency = 'weekly';
    } else if (merchant.count >= 3) {
      merchant.frequency = 'monthly';
    } else {
      merchant.frequency = 'occasional';
    }
  });

  return merchants.sort((a, b) => b.amount - a.amount).slice(0, 20); // Top 20 merchants
}

function generateInsights(analysis: SpendingAnalysis, transactions: TransactionWithCategory[]): SpendingInsight[] {
  const insights: SpendingInsight[] = [];

  // High spending in a single category
  const highSpendingCategory = analysis.topCategories[0];
  if (highSpendingCategory && highSpendingCategory.percentage > 40) {
    insights.push({
      type: 'warning',
      title: 'High Concentration in Single Category',
      description: `${highSpendingCategory.percentage.toFixed(1)}% of your spending is on ${highSpendingCategory.category}`,
      impact: 'medium',
      actionable: true,
      recommendation: 'Consider diversifying your spending or look for ways to reduce costs in this category.'
    });
  }

  // Monthly spending trend
  if (analysis.monthlyTrends.length >= 2) {
    const recent = analysis.monthlyTrends[analysis.monthlyTrends.length - 1];
    const previous = analysis.monthlyTrends[analysis.monthlyTrends.length - 2];
    const changePercent = ((recent.totalSpent - previous.totalSpent) / previous.totalSpent) * 100;

    if (Math.abs(changePercent) > 20) {
      insights.push({
        type: changePercent > 0 ? 'warning' : 'positive',
        title: `Spending ${changePercent > 0 ? 'Increased' : 'Decreased'} Significantly`,
        description: `Your spending ${changePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(changePercent).toFixed(1)}% from last month`,
        impact: changePercent > 30 ? 'high' : 'medium',
        actionable: true,
        recommendation: changePercent > 0 ? 
          'Review your recent purchases to identify what caused the increase.' :
          'Great job reducing your spending! Try to maintain this trend.'
      });
    }
  }

  // Subscriptions and recurring payments
  const recurringTransactions = transactions.filter(t => 
    t.type === 'debit' && 
    (t.description.toLowerCase().includes('subscription') ||
     t.description.toLowerCase().includes('monthly') ||
     analysis.merchantAnalysis.some(m => m.merchant === t.merchant && m.frequency === 'monthly'))
  );

  if (recurringTransactions.length > 0) {
    const recurringTotal = recurringTransactions.reduce((sum, t) => sum + t.amount, 0);
    insights.push({
      type: 'info',
      title: 'Recurring Payments Detected',
      description: `You have approximately $${recurringTotal.toFixed(2)} in recurring monthly payments`,
      impact: 'medium',
      actionable: true,
      recommendation: 'Review your subscriptions regularly to cancel unused services.'
    });
  }

  // High-value transactions
  const highValueTransactions = transactions.filter(t => 
    t.type === 'debit' && t.amount > analysis.averageTransactionAmount * 5
  );

  if (highValueTransactions.length > 0) {
    insights.push({
      type: 'info',
      title: 'Large Purchases Detected',
      description: `You made ${highValueTransactions.length} transaction(s) significantly above your average`,
      impact: 'low',
      actionable: false,
      recommendation: 'Consider if large purchases align with your budget and financial goals.'
    });
  }

  return insights;
}

export function analyzeTransactions(transactions: ParsedTransaction[]): SpendingAnalysis {
  // Categorize all transactions
  const categorizedTransactions: TransactionWithCategory[] = transactions.map(transaction => {
    const categorization = categorizeTransaction(transaction);
    return {
      ...transaction,
      category: categorization.category,
      subcategory: categorization.subcategory,
      confidence: categorization.confidence
    };
  });

  // Calculate basic metrics
  const debitTransactions = categorizedTransactions.filter(t => t.type === 'debit');
  const creditTransactions = categorizedTransactions.filter(t => t.type === 'credit');

  const totalSpent = debitTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalEarned = creditTransactions.reduce((sum, t) => sum + t.amount, 0);
  const netSpending = totalSpent - totalEarned;
  const averageTransactionAmount = totalSpent / debitTransactions.length || 0;

  // Category breakdown
  const categoryTotals: { [category: string]: { amount: number; count: number } } = {};
  
  debitTransactions.forEach(transaction => {
    if (!categoryTotals[transaction.category]) {
      categoryTotals[transaction.category] = { amount: 0, count: 0 };
    }
    categoryTotals[transaction.category].amount += transaction.amount;
    categoryTotals[transaction.category].count++;
  });

  const categoryBreakdown: CategorySpending[] = Object.entries(categoryTotals).map(([category, data]) => ({
    category,
    amount: data.amount,
    count: data.count,
    percentage: (data.amount / totalSpent) * 100,
    averageAmount: data.amount / data.count,
    trend: 'stable' as const // Would need historical data for trend analysis
  })).sort((a, b) => b.amount - a.amount);

  const topCategories = categoryBreakdown.slice(0, 5).map(cat => ({
    category: cat.category,
    amount: cat.amount,
    percentage: cat.percentage
  }));

  const monthlyTrends = calculateMonthlyTrends(categorizedTransactions);
  const merchantAnalysis = analyzeMerchants(categorizedTransactions);

  const analysis: SpendingAnalysis = {
    totalSpent,
    totalEarned,
    netSpending,
    transactionCount: transactions.length,
    averageTransactionAmount,
    categoryBreakdown,
    monthlyTrends,
    merchantAnalysis,
    topCategories,
    spendingInsights: [] // Will be populated below
  };

  analysis.spendingInsights = generateInsights(analysis, categorizedTransactions);

  return analysis;
} 