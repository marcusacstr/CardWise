import { parse, isValid } from 'date-fns';
import { ParsedTransaction, CSVParseResult } from './csvParser';

export interface PDFParseResult extends CSVParseResult {
  statementPeriod: {
    startDate: Date | null;
    endDate: Date | null;
    statementDate: Date | null;
  };
}

// Enhanced date formats with more variations
const PDF_DATE_FORMATS = [
  'MM/dd/yyyy', 'MM/dd/yy', 'M/d/yyyy', 'M/d/yy',
  'yyyy-MM-dd', 'yyyy/MM/dd',
  'dd/MM/yyyy', 'dd/MM/yy', 'd/M/yyyy', 'd/M/yy',
  'MMM dd, yyyy', 'MMM dd yyyy', 'MMM d, yyyy', 'MMM d yyyy',
  'MM-dd-yyyy', 'MM-dd-yy', 'M-d-yyyy', 'M-d-yy',
  'dd MMM yyyy', 'dd MMM yy', 'd MMM yyyy', 'd MMM yy',
  'MMM dd', 'MMM d'
];

// Multiple parsing strategies for different statement formats
const PARSING_STRATEGIES = {
  // Strategy 1: Standard tabular format (most common)
  standard: {
    pattern: /(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?|\w{3}\s+\d{1,2}(?:,?\s*\d{4})?)\s+([^$\d\-+]+?)\s+(\-?\$?[\d,]+\.?\d{2}?)\s*$/gm,
    dateGroup: 1,
    descriptionGroup: 2,
    amountGroup: 3
  },
  
  // Strategy 2: Amount first format
  amountFirst: {
    pattern: /(\-?\$?[\d,]+\.?\d{2}?)\s+(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?|\w{3}\s+\d{1,2}(?:,?\s*\d{4})?)\s+([^$\d\-+]+?)$/gm,
    dateGroup: 2,
    descriptionGroup: 3,
    amountGroup: 1
  },
  
  // Strategy 3: Multi-line transactions
  multiLine: {
    pattern: /(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?|\w{3}\s+\d{1,2}(?:,?\s*\d{4})?)\s*\n?\s*([^$\d\-+\n]+?)\s*\n?\s*(\-?\$?[\d,]+\.?\d{2}?)/gm,
    dateGroup: 1,
    descriptionGroup: 2,
    amountGroup: 3
  },
  
  // Strategy 4: Compact format (date desc amount on same line)
  compact: {
    pattern: /(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)\s+([A-Z][^$\d\-+]*?)\s+(\-?\$?[\d,]+\.?\d{2}?)(?:\s|$)/gm,
    dateGroup: 1,
    descriptionGroup: 2,
    amountGroup: 3
  }
};

// Enhanced merchant extraction patterns
const MERCHANT_PATTERNS = [
  // Remove common prefixes
  /^(PURCHASE\s+|PAYMENT\s+|DEBIT\s+|CREDIT\s+|POS\s+|ATM\s+|RECURRING\s+)/i,
  // Remove location/state info
  /\s+[A-Z]{2}\s+\d{5}.*$/,
  // Remove date suffixes
  /\s+\d{2}\/\d{2}.*$/,
  // Remove reference numbers
  /\s+#\d+.*$/,
  // Remove card ending info
  /\s+XXXX\d{4}.*$/i
];

// Enhanced categorization with more sophisticated matching
const CATEGORY_RULES = {
  'Dining': [
    /restaurant|dining|food|cafe|coffee|pizza|burger|taco|sushi|bar|pub|grill|bistro|deli|bakery/i,
    /mcdonald|subway|starbucks|chipotle|panera|domino|kfc|taco bell|wendy|burger king/i,
    /doordash|ubereats|grubhub|postmates|seamless/i
  ],
  'Groceries': [
    /grocery|supermarket|market|kroger|safeway|whole foods|trader joe|costco|walmart|target/i,
    /publix|wegmans|giant|harris teeter|food lion|stop shop|aldi|fresh market/i
  ],
  'Gas': [
    /gas|fuel|shell|exxon|bp|chevron|mobil|texaco|arco|citgo|marathon|sunoco|valero/i,
    /speedway|wawa|sheetz|circle k|7-eleven.*gas/i
  ],
  'Travel': [
    /airline|flight|hotel|airbnb|booking|expedia|priceline|kayak/i,
    /uber|lyft|taxi|airport|rental car|hertz|avis|budget|enterprise|alamo/i,
    /marriott|hilton|hyatt|ihg|choice|wyndham/i
  ],
  'Transit': [
    /metro|subway|bus|train|transit|parking|toll|mta|bart|septa/i
  ],
  'Entertainment': [
    /movie|theater|cinema|netflix|spotify|hulu|disney|amazon prime|apple music/i,
    /concert|ticket|entertainment|amc|regal|cinemark/i
  ],
  'Shopping': [
    /amazon|ebay|target|walmart|best buy|apple store|microsoft|google play/i,
    /macy|nordstrom|tj maxx|marshalls|ross|old navy|gap|nike|adidas/i
  ],
  'Utilities': [
    /electric|gas company|water|sewer|internet|phone|cable|utility|power|energy/i,
    /verizon|att|tmobile|sprint|comcast|spectrum|cox|dish/i
  ],
  'Healthcare': [
    /medical|doctor|hospital|pharmacy|cvs|walgreens|rite aid|health|dental|vision/i
  ],
  'Streaming': [
    /netflix|hulu|disney|amazon prime|spotify|apple music|youtube|twitch/i
  ],
  'Department Stores': [
    /target|walmart|costco|sams club|bjs|macy|nordstrom|kohls|jcpenney/i
  ]
};

function parseDate(dateString: string, currentYear?: number): Date | null {
  if (!dateString || dateString.trim() === '') return null;
  
  let cleanDate = dateString.trim();
  
  // If date doesn't have year, add current year
  if (currentYear && !cleanDate.match(/\d{4}/)) {
    if (cleanDate.match(/\w{3}\s+\d{1,2}$/)) {
      cleanDate = cleanDate + ', ' + currentYear;
    } else if (cleanDate.match(/\d{1,2}[\/\-]\d{1,2}$/)) {
      cleanDate = cleanDate + '/' + currentYear;
    }
  }
  
  for (const format of PDF_DATE_FORMATS) {
    try {
      const parsed = parse(cleanDate, format, new Date());
      if (isValid(parsed)) {
        return parsed;
      }
    } catch {
      continue;
    }
  }
  
  return null;
}

function parseAmount(amountString: string): number | null {
  if (!amountString || amountString.trim() === '') return null;
  
  // Remove common currency symbols and whitespace
  let cleanAmount = amountString
    .replace(/[$,\s]/g, '')
    .replace(/[()]/g, '-') // Handle parentheses as negative
    .trim();
  
  // Handle different negative indicators
  if (cleanAmount.includes('CR') || cleanAmount.includes('credit')) {
    cleanAmount = cleanAmount.replace(/CR|credit/gi, '');
    cleanAmount = '-' + cleanAmount;
  }
  
  const parsed = parseFloat(cleanAmount);
  return isNaN(parsed) ? null : parsed;
}

function cleanDescription(description: string): string {
  return description
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-&.']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMerchant(description: string): string {
  let merchant = description.trim();
  
  // Apply merchant cleaning patterns
  for (const pattern of MERCHANT_PATTERNS) {
    merchant = merchant.replace(pattern, '');
  }
  
  // Take first meaningful part
  const parts = merchant.trim().split(/\s+/);
  if (parts.length >= 2) {
    return parts.slice(0, 2).join(' ');
  }
  
  return parts[0] || merchant;
}

function categorizeTransaction(description: string): string {
  const desc = description.toLowerCase();
  
  for (const [category, patterns] of Object.entries(CATEGORY_RULES)) {
    for (const pattern of patterns) {
      if (pattern.test(desc)) {
        return category;
      }
    }
  }
  
  return 'Other';
}

function detectStatementFormat(text: string): string {
  const textLower = text.toLowerCase();
  
  if (textLower.includes('chase') || textLower.includes('jpmorgan')) return 'chase';
  if (textLower.includes('citi') || textLower.includes('citibank')) return 'citi';
  if (textLower.includes('american express') || textLower.includes('amex')) return 'amex';
  if (textLower.includes('capital one')) return 'capital_one';
  if (textLower.includes('discover')) return 'discover';
  if (textLower.includes('bank of america') || textLower.includes('bofa')) return 'boa';
  if (textLower.includes('wells fargo')) return 'wells_fargo';
  
  return 'generic';
}

function tryMultipleStrategies(text: string, currentYear: number): ParsedTransaction[] {
  const allTransactions: ParsedTransaction[] = [];
  const usedTransactions = new Set<string>();
  
  // Try each parsing strategy
  for (const [strategyName, strategy] of Object.entries(PARSING_STRATEGIES)) {
    console.log(`Trying parsing strategy: ${strategyName}`);
    
    let matches = [];
    let match;
    const regex = new RegExp(strategy.pattern.source, strategy.pattern.flags);
    
    while ((match = regex.exec(text)) !== null) {
      matches.push(match);
    }
    
    console.log(`Strategy ${strategyName} found ${matches.length} potential matches`);
    
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      
      try {
        const rawDate = match[strategy.dateGroup];
        const rawDescription = match[strategy.descriptionGroup];
        const rawAmount = match[strategy.amountGroup];
        
        // Create unique identifier for this transaction
        const transactionKey = `${rawDate}-${rawDescription.trim()}-${rawAmount}`;
        
        // Skip if we've already processed this transaction
        if (usedTransactions.has(transactionKey)) {
          continue;
        }
        
        // Parse date
        const date = parseDate(rawDate, currentYear);
        if (!date) continue;
        
        // Parse amount
        const amount = parseAmount(rawAmount);
        if (amount === null || amount === 0) continue;
        
        // Clean description
        const description = cleanDescription(rawDescription);
        if (!description || description.length < 3) continue;
        
        // Extract merchant
        const merchant = extractMerchant(description);
        
        // Categorize transaction
        const category = categorizeTransaction(description);
        
        // Create transaction
        const transaction: ParsedTransaction = {
          id: `pdf_${strategyName}_${i}_${Date.now()}`,
          date,
          description,
          amount: Math.abs(amount),
          category,
          merchant,
          type: amount > 0 ? 'credit' : 'debit',
          original_data: {
            raw_date: rawDate,
            raw_description: rawDescription,
            raw_amount: rawAmount,
            source: 'pdf',
            strategy: strategyName
          }
        };
        
        allTransactions.push(transaction);
        usedTransactions.add(transactionKey);
        
      } catch (error) {
        continue;
      }
    }
  }
  
  // Sort by date and remove duplicates based on date + amount + description similarity
  const uniqueTransactions = removeDuplicates(allTransactions);
  return uniqueTransactions.sort((a, b) => a.date.getTime() - b.date.getTime());
}

function removeDuplicates(transactions: ParsedTransaction[]): ParsedTransaction[] {
  const unique: ParsedTransaction[] = [];
  const seen = new Set<string>();
  
  for (const transaction of transactions) {
    // Create a more flexible duplicate key
    const key = `${transaction.date.toDateString()}-${Math.round(transaction.amount * 100)}-${transaction.description.substring(0, 20)}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(transaction);
    }
  }
  
  return unique;
}

export async function parsePDFStatement(pdfBuffer: ArrayBuffer): Promise<PDFParseResult> {
  const result: PDFParseResult = {
    transactions: [],
    errors: [],
    warnings: [],
    statementPeriod: {
      startDate: null,
      endDate: null,
      statementDate: null
    },
    metadata: {
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      detectedFormat: 'unknown',
      dateRange: {
        start: null,
        end: null
      }
    }
  };

  // Only run on client side
  if (typeof window === 'undefined') {
    result.errors.push('PDF parsing is only available in the browser');
    return result;
  }

  try {
    // Dynamic import of pdfjs-dist to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    let structuredText = '';
    
    // Extract text from all pages with better structure preservation
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Sort text items by position for better reading order
      const sortedItems = textContent.items.sort((a: any, b: any) => {
        // Sort by Y position first (top to bottom), then X position (left to right)
        if (Math.abs(a.transform[5] - b.transform[5]) > 5) {
          return b.transform[5] - a.transform[5]; // Higher Y values first (top of page)
        }
        return a.transform[4] - b.transform[4]; // Lower X values first (left side)
      });
      
      // Create structured text preserving layout
      let currentY = null;
      let lineText = '';
      
      for (const item of sortedItems) {
        const itemY = Math.round(item.transform[5]);
        
        if (currentY !== null && Math.abs(currentY - itemY) > 5) {
          // New line
          if (lineText.trim()) {
            structuredText += lineText.trim() + '\n';
          }
          lineText = '';
        }
        
        lineText += item.str + ' ';
        currentY = itemY;
      }
      
      // Add remaining line
      if (lineText.trim()) {
        structuredText += lineText.trim() + '\n';
      }
      
      // Also keep simple concatenated version as fallback
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
      structuredText += '\n--- PAGE BREAK ---\n';
    }
    
    if (!fullText || fullText.trim().length === 0) {
      result.errors.push('PDF appears to be empty or contains no readable text');
      return result;
    }

    console.log('PDF text extracted, length:', fullText.length);
    console.log('First 500 characters:', fullText.substring(0, 500));

    // Detect statement format
    const detectedFormat = detectStatementFormat(fullText);
    result.metadata.detectedFormat = detectedFormat;
    
    // Extract current year for date parsing
    const yearMatch = fullText.match(/20\d{2}/);
    const currentYear = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
    
    console.log('Detected format:', detectedFormat, 'Current year:', currentYear);
    
    // Try multiple parsing strategies
    let transactions = tryMultipleStrategies(structuredText, currentYear);
    if (transactions.length === 0) {
      result.warnings.push('No transactions found in structured text, trying full text');
      transactions = tryMultipleStrategies(fullText, currentYear);
    }

    // Fallback: Try line-by-line regex extraction if all else fails
    if (transactions.length === 0) {
      result.warnings.push('No transactions found with main strategies, trying line-by-line extraction');
      const lines = fullText.split('\n');
      for (const line of lines) {
        // Simple regex: date, description, amount
        const match = line.match(/(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?|\w{3} \d{1,2}(?:,? \d{4})?)\s+([^$\d\-+]+?)\s+(-?\$?[\d,]+\.?\d{2}?)/);
        if (match) {
          // Try to parse date and amount
          const date = parseDate(match[1]);
          const amount = parseAmount(match[3]);
          if (date && amount !== null) {
            transactions.push({
              id: `${date.getTime()}-${transactions.length}`,
              date,
              description: match[2].trim(),
              amount: Math.abs(amount),
              type: amount < 0 ? 'credit' : 'debit',
              merchant: match[2].trim(),
              original_data: { line }
            });
          }
        }
      }
    }

    result.metadata.totalRows = transactions.length;
    result.metadata.validRows = transactions.length;
    result.transactions = transactions;
    
    // Update date range
    if (transactions.length > 0) {
      const dates = transactions.map(t => t.date).sort((a, b) => a.getTime() - b.getTime());
      result.metadata.dateRange.start = dates[0];
      result.metadata.dateRange.end = dates[dates.length - 1];
    }
    
    if (transactions.length === 0) {
      result.warnings.push('No valid transactions could be extracted from the PDF. The statement format may not be supported yet.');
      result.warnings.push('Try converting the PDF to CSV format for better compatibility.');
    } else {
      console.log(`Successfully extracted ${transactions.length} transactions`);
    }
    
  } catch (error) {
    result.errors.push(`PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('PDF parsing error:', error);
  }
  
  return result;
}
