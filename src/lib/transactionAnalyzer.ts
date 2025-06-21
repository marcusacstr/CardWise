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
  type: 'positive' | 'warning' | 'info';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  recommendation?: string;
}

// Enhanced merchant pattern recognition for common POS systems and merchant codes
const MERCHANT_PATTERNS = [
  // Square POS patterns
  { pattern: /^sq \*/i, category: 'Dining', confidence: 0.8 },
  { pattern: /^square\s/i, category: 'Dining', confidence: 0.7 },
  
  // E-commerce patterns
  { pattern: /^amazon\./i, category: 'Online Shopping', confidence: 0.9 },
  { pattern: /^amzn\s/i, category: 'Online Shopping', confidence: 0.9 },
  { pattern: /^amazon\s/i, category: 'Online Shopping', confidence: 0.9 },
  { pattern: /^paypal \*/i, category: 'Online Shopping', confidence: 0.7 },
  { pattern: /^apple\.com/i, category: 'Online Shopping', confidence: 0.8 },
  { pattern: /^google \*/i, category: 'Online Shopping', confidence: 0.7 },
  
  // Transportation
  { pattern: /^uber\s/i, category: 'Transit', confidence: 0.9 },
  { pattern: /^lyft\s/i, category: 'Transit', confidence: 0.9 },
  
  // Streaming services
  { pattern: /^spotify/i, category: 'Streaming', confidence: 0.9 },
  { pattern: /^netflix/i, category: 'Streaming', confidence: 0.9 },
  { pattern: /^hulu/i, category: 'Streaming', confidence: 0.9 },
  { pattern: /^disney/i, category: 'Streaming', confidence: 0.8 },
  
  // Food delivery
  { pattern: /^doordash/i, category: 'Dining', confidence: 0.9 },
  { pattern: /^uber.*eats/i, category: 'Dining', confidence: 0.9 },
  { pattern: /^grubhub/i, category: 'Dining', confidence: 0.9 },
  
  // Gas stations
  { pattern: /^shell\s/i, category: 'Gas', confidence: 0.9 },
  { pattern: /^exxon/i, category: 'Gas', confidence: 0.9 },
  { pattern: /^bp\s/i, category: 'Gas', confidence: 0.9 },
  
  // Other POS systems
  { pattern: /^tst\*/i, category: 'Dining', confidence: 0.7 }, // Toast POS
  { pattern: /^pos\s/i, category: 'General Retail', confidence: 0.5 }, // Generic POS
  { pattern: /^visa\s/i, category: 'Financial Services', confidence: 0.8 },
  { pattern: /^mastercard\s/i, category: 'Financial Services', confidence: 0.8 },
];

// Comprehensive spending categories with extensive keyword matching
const SPENDING_CATEGORIES: SpendingCategory[] = [
  {
    name: 'Dining',
    icon: '🍽️',
    keywords: [
      // Fast food chains
      'mcdonalds', 'mcdonald', 'burger king', 'wendys', 'wendy', 'taco bell', 'kfc', 'subway',
      'chipotle', 'panera', 'dunkin', 'starbucks', 'tim hortons', 'dairy queen', 'sonic',
      'arbys', 'popeyes', 'chick-fil-a', 'chick fil a', 'five guys', 'in-n-out', 'white castle',
      
      // Pizza chains
      'dominos', 'domino', 'papa johns', 'papa john', 'pizza hut', 'little caesars', 'papa murphys',
      'casey', 'godfather', 'marco', 'pizza', 'pizzeria',
      
      // Coffee shops
      'starbucks', 'dunkin', 'tim hortons', 'coffee', 'cafe', 'espresso', 'latte', 'cappuccino',
      
      // Food delivery
      'doordash', 'door dash', 'uber eats', 'ubereats', 'grubhub', 'postmates', 'seamless',
      'skip the dishes', 'foodora', 'caviar', 'delivery', 'takeout', 'take-out',
      
      // Restaurant categories
      'restaurant', 'dining', 'bistro', 'grill', 'steakhouse', 'diner', 'buffet', 'bakery',
      'bar', 'pub', 'tavern', 'brewery', 'winery', 'food truck', 'catering',
      
      // Cuisine types
      'sushi', 'chinese', 'thai', 'indian', 'mexican', 'italian', 'japanese', 'korean',
      'mediterranean', 'greek', 'vietnamese', 'pho', 'ramen', 'bbq', 'barbecue',
      
      // Generic food terms
      'food', 'eat', 'meal', 'lunch', 'dinner', 'breakfast', 'brunch'
    ],
    subcategories: ['Fast Food', 'Restaurants', 'Coffee Shops', 'Food Delivery']
  },
  {
    name: 'Groceries',
    icon: '🛒',
    keywords: [
      // Major grocery chains
      'walmart', 'target', 'costco', 'sams club', 'sam club', 'bjs', 'kroger', 'safeway',
      'whole foods', 'trader joe', 'trader joes', 'aldi', 'food lion', 'harris teeter',
      'publix', 'wegmans', 'giant', 'stop shop', 'king soopers', 'fred meyer',
      'meijer', 'heb', 'winco', 'food 4 less', 'ralphs', 'vons', 'albertsons',
      
      // Canadian chains
      'loblaws', 'metro', 'sobeys', 'freshco', 'no frills', 'real canadian superstore',
      'food basics', 'fortinos', 'zehrs', 'valu-mart', 'independent', 'provigo',
      
      // Specialty stores
      'whole foods', 'fresh market', 'sprouts', 'natural grocers', 'earth fare',
      
      // Generic terms
      'grocery', 'supermarket', 'market', 'food store', 'superstore', 'hypermarket'
    ],
    subcategories: ['Supermarkets', 'Warehouse Clubs', 'Organic/Specialty']
  },
  {
    name: 'Gas',
    icon: '⛽',
    keywords: [
      // Major gas station chains
      'shell', 'exxon', 'mobil', 'bp', 'chevron', 'texaco', 'marathon', 'phillips 66',
      'conoco', 'sunoco', 'citgo', 'speedway', 'wawa', '7-eleven', '7 eleven', 'circle k',
      'pilot', 'loves', 'flying j', 'ta', 'petro', 'valero', 'arco', 'gulf',
      
      // Canadian gas stations
      'petro-canada', 'petro canada', 'esso', 'husky', 'pioneer', 'fas gas', 'mohawk',
      'ultramar', 'irving', 'co-op',
      
      // Generic terms
      'gas', 'fuel', 'gasoline', 'station', 'petroleum'
    ],
    subcategories: ['Gas Stations', 'Fuel']
  },
  {
    name: 'Transit',
    icon: '🚗',
    keywords: [
      // Rideshare
      'uber', 'lyft', 'taxi', 'cab', 'rideshare', 'ride share', 'car2go', 'zipcar',
      
      // Public transit
      'metro', 'subway', 'bus', 'train', 'transit', 'mta', 'bart', 'cta', 'septa',
      'ttc', 'translink', 'oc transpo', 'go transit', 'via rail', 'amtrak',
      
      // Parking and tolls
      'parking', 'parkade', 'garage', 'meter', 'toll', 'bridge', 'tunnel', 'impark',
      'easypark', 'parkopedia'
    ],
    subcategories: ['Rideshare', 'Public Transit', 'Parking', 'Tolls']
  },
  {
    name: 'Travel',
    icon: '✈️',
    keywords: [
      // Airlines
      'airline', 'airways', 'air', 'flight', 'american airlines', 'delta', 'united',
      'southwest', 'jetblue', 'alaska', 'frontier', 'spirit', 'allegiant',
      'air canada', 'westjet', 'porter', 'british airways', 'lufthansa', 'klm',
      
      // Hotels
      'hotel', 'motel', 'inn', 'resort', 'lodge', 'marriott', 'hilton', 'hyatt',
      'sheraton', 'westin', 'holiday inn', 'best western', 'comfort inn',
      'hampton inn', 'fairfield inn', 'courtyard', 'residence inn', 'embassy suites',
      
      // Online travel
      'airbnb', 'vrbo', 'homeaway', 'booking.com', 'booking com', 'expedia', 'hotels.com',
      'hotels com', 'priceline', 'kayak', 'orbitz', 'travelocity',
      
      // Car rental
      'hertz', 'avis', 'enterprise', 'budget', 'alamo', 'national', 'thrifty',
      'dollar', 'payless', 'advantage', 'car rental', 'rental car',
      
      // Other travel
      'cruise', 'carnival', 'royal caribbean', 'norwegian', 'disney cruise',
      'travel', 'vacation', 'trip', 'tour', 'airport'
    ],
    subcategories: ['Airlines', 'Hotels', 'Car Rental', 'Cruises', 'Online Travel']
  },
  {
    name: 'Streaming',
    icon: '📺',
    keywords: [
      // Video streaming
      'netflix', 'hulu', 'disney+', 'disney plus', 'amazon prime', 'prime video',
      'hbo', 'hbo max', 'showtime', 'starz', 'paramount+', 'paramount plus',
      'peacock', 'apple tv', 'youtube premium', 'crunchyroll', 'funimation',
      
      // Music streaming
      'spotify', 'apple music', 'amazon music', 'youtube music', 'pandora',
      'tidal', 'deezer', 'soundcloud',
      
      // Gaming/Other
      'twitch', 'patreon', 'onlyfans',
      
      // Cable/Satellite
      'cable', 'satellite', 'xfinity', 'comcast', 'spectrum', 'cox', 'directv',
      'dish', 'fios', 'uverse'
    ],
    subcategories: ['Video Streaming', 'Music Streaming', 'Cable/Satellite TV']
  },
  {
    name: 'Shopping',
    icon: '🛍️',
    keywords: [
      // E-commerce
      'amazon', 'ebay', 'etsy', 'shopify', 'paypal', 'apple.com', 'apple com',
      'google play', 'microsoft store', 'steam', 'epic games',
      
      // Department stores
      'target', 'walmart', 'costco', 'sams club', 'bjs', 'macys', 'macy',
      'nordstrom', 'bloomingdales', 'saks', 'neiman marcus', 'dillards',
      'kohls', 'jc penney', 'jcpenney', 'sears',
      
      // Clothing stores
      'gap', 'old navy', 'banana republic', 'h&m', 'zara', 'forever 21',
      'uniqlo', 'urban outfitters', 'american eagle', 'abercrombie', 'hollister',
      'tj maxx', 'marshalls', 'ross', 'nordstrom rack', 'off 5th',
      
      // Electronics
      'best buy', 'apple', 'microsoft', 'samsung', 'sony', 'dell', 'hp',
      'lenovo', 'asus', 'acer', 'nintendo', 'xbox', 'playstation',
      
      // Home improvement
      'home depot', 'lowes', 'menards', 'ace hardware', 'true value',
      'canadian tire', 'rona', 'home hardware',
      
      // Furniture
      'ikea', 'wayfair', 'overstock', 'bed bath beyond', 'pottery barn',
      'west elm', 'crate barrel', 'ashley furniture',
      
      // Generic terms
      'store', 'shop', 'retail', 'mall', 'outlet', 'marketplace'
    ],
    subcategories: ['Online Shopping', 'Department Stores', 'Clothing', 'Electronics', 'Home Improvement']
  },
  {
    name: 'Utilities',
    icon: '⚡',
    keywords: [
      // Electric companies
      'electric', 'electricity', 'power', 'energy', 'pge', 'pg&e', 'con edison',
      'duke energy', 'southern california edison', 'florida power', 'national grid',
      'xcel energy', 'dominion', 'entergy', 'aep', 'firstenergy',
      
      // Gas utilities
      'gas company', 'natural gas', 'enbridge', 'atmos', 'centerpoint',
      
      // Water/Sewer
      'water', 'sewer', 'wastewater', 'utilities', 'utility', 'municipal',
      
      // Internet/Phone
      'internet', 'broadband', 'wifi', 'phone', 'telephone', 'landline',
      'verizon', 'att', 'at&t', 't-mobile', 'tmobile', 'sprint', 'boost',
      'cricket', 'metro pcs', 'straight talk', 'virgin mobile',
      
      // Canadian telecom
      'rogers', 'bell', 'telus', 'fido', 'koodo', 'chatr', 'public mobile',
      'shaw', 'videotron', 'cogeco', 'eastlink', 'sasktel', 'mts'
    ],
    subcategories: ['Electric', 'Gas', 'Water', 'Internet/Phone']
  },
  {
    name: 'Healthcare',
    icon: '🏥',
    keywords: [
      // Medical
      'medical', 'doctor', 'physician', 'hospital', 'clinic', 'urgent care',
      'emergency', 'surgery', 'specialist', 'cardiology', 'dermatology',
      'orthopedic', 'radiology', 'laboratory', 'pathology',
      
      // Dental
      'dental', 'dentist', 'orthodontist', 'oral surgeon', 'hygienist',
      
      // Vision
      'optometry', 'optometrist', 'eye doctor', 'vision', 'glasses', 'contacts',
      'lenscrafters', 'pearle vision', 'visionworks',
      
      // Pharmacy
      'pharmacy', 'cvs', 'walgreens', 'rite aid', 'drug store', 'drugstore',
      'shoppers drug mart', 'london drugs', 'prescription', 'rx',
      
      // Veterinary
      'veterinarian', 'vet', 'animal hospital', 'pet clinic', 'animal clinic',
      
      // Fitness/Wellness
      'gym', 'fitness', 'yoga', 'pilates', 'massage', 'spa', 'therapy',
      'physical therapy', 'chiropractor', 'acupuncture'
    ],
    subcategories: ['Medical', 'Dental', 'Vision', 'Pharmacy', 'Veterinary', 'Fitness']
  },
  {
    name: 'Entertainment',
    icon: '🎬',
    keywords: [
      // Movies
      'movie', 'theater', 'theatre', 'cinema', 'amc', 'regal', 'cinemark',
      'landmark', 'imax', 'dolby', 'fandango', 'movietickets', 'atom tickets',
      
      // Live events
      'concert', 'show', 'event', 'ticket', 'ticketmaster', 'stubhub', 'seatgeek',
      'live nation', 'eventbrite', 'venue', 'arena', 'stadium', 'amphitheater',
      'broadway', 'theater', 'opera', 'symphony', 'ballet',
      
      // Gaming
      'gaming', 'game', 'steam', 'epic games', 'xbox live', 'playstation',
      'nintendo', 'blizzard', 'ea', 'ubisoft', 'activision',
      
      // Recreation
      'bowling', 'mini golf', 'golf', 'laser tag', 'escape room', 'arcade',
      'amusement park', 'theme park', 'six flags', 'disney', 'universal',
      'zoo', 'aquarium', 'museum', 'planetarium'
    ],
    subcategories: ['Movies', 'Live Events', 'Gaming', 'Recreation', 'Sports']
  },
  {
    name: 'Financial Services',
    icon: '💰',
    keywords: [
      // Banking fees
      'bank', 'atm', 'fee', 'charge', 'service charge', 'maintenance',
      'overdraft', 'nsf', 'wire transfer', 'foreign transaction', 'cash advance',
      'late fee', 'annual fee', 'interest', 'finance charge',
      
      // Investment
      'investment', 'brokerage', 'trading', 'stock', 'mutual fund', 'etf',
      'fidelity', 'vanguard', 'schwab', 'td ameritrade', 'e*trade', 'robinhood',
      
      // Insurance
      'insurance', 'premium', 'policy', 'auto insurance', 'home insurance',
      'health insurance', 'life insurance', 'geico', 'state farm', 'allstate',
      'progressive', 'farmers', 'liberty mutual',
      
      // Credit/Loans
      'loan', 'mortgage', 'credit', 'financing', 'payment', 'installment'
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

// Enhanced fuzzy matching function
function fuzzyMatch(keyword: string, text: string, threshold: number = 0.8): boolean {
  if (text.includes(keyword)) return true;
  
  // Simple Levenshtein distance for close matches
  const distance = levenshteinDistance(keyword, text);
  const similarity = 1 - (distance / Math.max(keyword.length, text.length));
  
  return similarity >= threshold;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

function categorizeTransaction(transaction: ParsedTransaction): { category: string; subcategory?: string; confidence: number } {
  // If transaction already has a category from the bank, use it with high confidence
  if (transaction.category && transaction.category.trim() !== '' && transaction.category.toLowerCase() !== 'other') {
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
    let strongMatches = 0;

    for (const keyword of category.keywords) {
      const keywordLower = keyword.toLowerCase();
      
      // Check for exact word matches (highest score)
      const exactWordRegex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      if (exactWordRegex.test(searchText)) {
        exactMatches++;
        matchScore += keyword.length * 5; // 5x score for exact matches
        matchedKeywords++;
        strongMatches++;
      }
      // Check for partial matches within words
      else if (searchText.includes(keywordLower)) {
        matchScore += keyword.length * 2; // 2x score for partial matches
        matchedKeywords++;
        if (keyword.length >= 6) { // Longer keywords are more significant
          strongMatches++;
        }
      }
      // Check for fuzzy matches (brand names, common misspellings)
      else if (keywordLower.length >= 4 && fuzzyMatch(keywordLower, searchText, 0.85)) {
        matchScore += keyword.length * 1.5;
        matchedKeywords++;
      }
    }

    if (matchedKeywords > 0) {
      // Calculate confidence based on match quality
      let confidence = Math.min(0.95, 
        (matchScore / Math.max(searchText.length, 15)) + 
        (exactMatches * 0.3) + 
        (strongMatches * 0.2) + 
        (matchedKeywords * 0.05)
      );
      
      // Boost confidence for multiple strong matches
      if (strongMatches >= 2) {
        confidence = Math.min(0.95, confidence + 0.2);
      }
      
      // Boost confidence for exact brand/merchant matches
      if (exactMatches > 0 && category.keywords.some(k => k.length >= 8)) {
        confidence = Math.min(0.95, confidence + 0.25);
      }
      
      if (confidence > bestMatch.confidence) {
        bestMatch = {
          category: category.name,
          confidence,
          subcategory: category.subcategories?.[0]
        };
      }
    }
  }

  // If no good match found, categorize as 'Other'
  if (bestMatch.confidence < 0.2) {
    bestMatch = { category: 'Other', confidence: 0.5, subcategory: 'Miscellaneous' };
  }

  return bestMatch;
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

  // High "Other" category spending
  const otherCategory = analysis.categoryBreakdown.find(cat => cat.category === 'Other');
  if (otherCategory && otherCategory.percentage > 20) {
    insights.push({
      type: 'info',
      title: 'Many Transactions Uncategorized',
      description: `${otherCategory.percentage.toFixed(1)}% of transactions are categorized as "Other"`,
      impact: 'low',
      actionable: true,
      recommendation: 'Review uncategorized transactions to improve spending insights and card recommendations.'
    });
  }

  // Dining spending insight
  const diningCategory = analysis.categoryBreakdown.find(cat => cat.category === 'Dining');
  if (diningCategory && diningCategory.percentage > 25) {
    insights.push({
      type: 'info',
      title: 'High Dining Spending',
      description: `You spend ${diningCategory.percentage.toFixed(1)}% of your budget on dining`,
      impact: 'medium',
      actionable: true,
      recommendation: 'Consider a credit card with high dining rewards like Chase Sapphire Preferred or Amex Gold.'
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