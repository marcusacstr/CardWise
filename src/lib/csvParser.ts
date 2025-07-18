import Papa from 'papaparse';
import { parse, isValid, format } from 'date-fns';

export interface RawTransaction {
  [key: string]: string;
}

export interface ParsedTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  category?: string;
  merchant?: string;
  mcc?: string; // Merchant Category Code
  type: 'debit' | 'credit';
  balance?: number;
  original_data: RawTransaction;
}

export interface StatementPeriod {
  startDate: Date | null;
  endDate: Date | null;
  statementDate: Date | null;
  accountNumber?: string;
  bankName?: string;
}

export interface CSVParseResult {
  transactions: ParsedTransaction[];
  errors: string[];
  warnings: string[];
  statementPeriod: StatementPeriod;
  metadata: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    detectedFormat: string;
    dateRange: {
      start: Date | null;
      end: Date | null;
    };
  };
}

// Common date formats found in credit card statements
const DATE_FORMATS = [
  'MM/dd/yyyy',
  'MM/dd/yy',
  'yyyy-MM-dd',
  'dd/MM/yyyy',
  'dd/MM/yy',
  'MMM dd, yyyy',
  'MMM dd yyyy',
  'MM-dd-yyyy',
  'MM-dd-yy'
];

// Common column mappings for different credit card companies
const COLUMN_MAPPINGS: { [key: string]: { [key: string]: string[] } } = {
  chase: {
    date: ['Transaction Date', 'Date', 'Post Date', 'Posting Date', 'Trans Date'],
    description: ['Description', 'Merchant', 'Transaction Description', 'Payee', 'Memo'],
    amount: ['Amount', 'Transaction Amount', 'Debit', 'Credit', 'Transaction Amount', 'Charge Amount'],
    category: ['Category', 'Type', 'Transaction Type'],
    mcc: ['MCC', 'Merchant Category Code', 'Category Code', 'MCC Code'],
    balance: ['Balance', 'Running Balance', 'Account Balance']
  },
  citi: {
    date: ['Date', 'Transaction Date', 'Posting Date'],
    description: ['Description', 'Merchant Name', 'Payee'],
    amount: ['Debit', 'Credit', 'Amount', 'Transaction Amount'],
    category: ['Category', 'Type'],
    mcc: ['MCC', 'Merchant Category Code', 'Category Code']
  },
  amex: {
    date: ['Date', 'Transaction Date', 'Posting Date'],
    description: ['Description', 'Merchant', 'Payee'],
    amount: ['Amount', 'Charge Amount', 'Transaction Amount'],
    category: ['Category', 'Extended Details', 'Type'],
    mcc: ['MCC', 'Merchant Category Code', 'Category Code']
  },
  capital_one: {
    date: ['Transaction Date', 'Date', 'Posting Date'],
    description: ['Description', 'Merchant', 'Payee'],
    amount: ['Debit', 'Credit', 'Amount', 'Transaction Amount'],
    category: ['Category', 'Type'],
    mcc: ['MCC', 'Merchant Category Code', 'Category Code']
  },
  discover: {
    date: ['Trans. Date', 'Transaction Date', 'Date', 'Posting Date'],
    description: ['Description', 'Merchant', 'Payee'],
    amount: ['Amount', 'Transaction Amount', 'Charge Amount'],
    category: ['Category', 'Type'],
    mcc: ['MCC', 'Merchant Category Code', 'Category Code']
  },
  generic: {
    date: ['Date', 'Transaction Date', 'Trans Date', 'Post Date', 'Posting Date', 'Trans. Date'],
    description: ['Description', 'Merchant', 'Payee', 'Transaction Description', 'Memo', 'Reference'],
    amount: ['Amount', 'Transaction Amount', 'Debit', 'Credit', 'Charge Amount', 'Payment Amount', 'Withdrawal', 'Deposit'],
    category: ['Category', 'Type', 'Transaction Type', 'Class'],
    mcc: ['MCC', 'Merchant Category Code', 'Category Code', 'MCC Code'],
    balance: ['Balance', 'Running Balance', 'Account Balance', 'Current Balance']
  }
};

function detectDateFormat(dateString: string): string | null {
  for (const format of DATE_FORMATS) {
    try {
      const parsed = parse(dateString, format, new Date());
      if (isValid(parsed)) {
        return format;
      }
    } catch {
      continue;
    }
  }
  return null;
}

function parseDate(dateString: string, preferredFormat?: string): Date | null {
  // Try preferred format first
  if (preferredFormat) {
    try {
      const parsed = parse(dateString, preferredFormat, new Date());
      if (isValid(parsed)) {
        return parsed;
      }
    } catch {
      // Fall through to try other formats
    }
  }

  // Try all formats
  for (const format of DATE_FORMATS) {
    try {
      const parsed = parse(dateString, format, new Date());
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
  if (!amountString) return null;
  
  // Remove currency symbols, spaces, and convert parentheses to negative
  let cleanAmount = amountString
    .trim()
    .replace(/[$€£¥₹₽]/g, '') // Remove currency symbols
    .replace(/\s/g, '') // Remove spaces
    .replace(/,/g, ''); // Remove thousands separators
  
  // Handle parentheses notation for negative amounts
  if (cleanAmount.startsWith('(') && cleanAmount.endsWith(')')) {
    cleanAmount = '-' + cleanAmount.slice(1, -1);
  }
  
  const parsed = parseFloat(cleanAmount);
  return isNaN(parsed) ? null : parsed;
}

function findColumn(headers: string[], possibleNames: string[]): string | null {
  const headerLower = headers.map(h => h.toLowerCase());
  
  for (const name of possibleNames) {
    const nameLower = name.toLowerCase();
    const exactMatch = headers.find(h => h.toLowerCase() === nameLower);
    if (exactMatch) return exactMatch;
    
    // Try partial matches
    const partialMatch = headers.find(h => h.toLowerCase().includes(nameLower));
    if (partialMatch) return partialMatch;
  }
  
  return null;
}

function detectCSVFormat(headers: string[]): string {
  const headerStr = headers.join(' ').toLowerCase();
  
  if (headerStr.includes('chase') || headerStr.includes('jpmorgan')) return 'chase';
  if (headerStr.includes('citi') || headerStr.includes('citibank')) return 'citi';
  if (headerStr.includes('american express') || headerStr.includes('amex')) return 'amex';
  if (headerStr.includes('capital one')) return 'capital_one';
  if (headerStr.includes('discover')) return 'discover';
  
  return 'generic';
}

function cleanDescription(description: string): string {
  if (!description) return '';
  
  return description
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s\-.'&]/g, '') // Remove special characters except common ones
    .substring(0, 200); // Limit length
}

function extractMerchant(description: string): string {
  if (!description) return '';
  
  // Enhanced merchant extraction with pattern cleaning
  let merchant = description.trim();
  
  // Remove common prefixes
  merchant = merchant.replace(/^(PURCHASE\s+|PAYMENT\s+|DEBIT\s+|CREDIT\s+|POS\s+|ATM\s+|RECURRING\s+|ACH\s+|CHECK\s+)/i, '');
  // Remove location/state info
  merchant = merchant.replace(/\s+[A-Z]{2}\s+\d{5}.*$/, '');
  // Remove date suffixes
  merchant = merchant.replace(/\s+\d{2}\/\d{2}.*$/, '');
  // Remove reference numbers
  merchant = merchant.replace(/\s+#\d+.*$/, '');
  // Remove card ending info
  merchant = merchant.replace(/\s+XXXX\d{4}.*$/i, '');
  
  // Take first meaningful part
  const parts = merchant.trim().split(/\s+/);
  if (parts.length >= 2) {
    return parts.slice(0, 2).join(' ');
  }
  
  return parts[0] || description.substring(0, 50).trim();
}

function validateMCC(mcc: string): string | null {
  if (!mcc) return null;
  
  // Clean the MCC string
  const cleanMCC = mcc.trim().replace(/[^\d]/g, '');
  
  // MCC should be 4 digits
  if (cleanMCC.length === 4 && /^\d{4}$/.test(cleanMCC)) {
    return cleanMCC;
  }
  
  return null;
}

// Enhanced categorization function
function categorizeTransaction(description: string): string {
  const desc = description.toLowerCase();
  
  // Dining
  if (desc.match(/restaurant|dining|food|cafe|coffee|pizza|burger|taco|sushi|bar|pub|grill|bistro|deli|bakery/)) {
    return 'Dining';
  }
  if (desc.match(/mcdonald|subway|starbucks|chipotle|panera|domino|kfc|taco bell|wendy|burger king/)) {
    return 'Dining';
  }
  if (desc.match(/doordash|ubereats|grubhub|postmates|seamless|deliveroo/)) {
    return 'Dining';
  }
  
  // Groceries
  if (desc.match(/grocery|supermarket|market|kroger|safeway|whole foods|trader joe|costco|walmart|target/)) {
    return 'Groceries';
  }
  if (desc.match(/publix|wegmans|giant|harris teeter|food lion|stop shop|aldi|fresh market|sprouts/)) {
    return 'Groceries';
  }
  
  // Gas
  if (desc.match(/gas|fuel|shell|exxon|bp|chevron|mobil|texaco|arco|citgo|marathon|sunoco|valero/)) {
    return 'Gas';
  }
  if (desc.match(/speedway|wawa|sheetz|circle k|7-eleven.*gas|pilot|flying j/)) {
    return 'Gas';
  }
  
  // Travel
  if (desc.match(/airline|flight|hotel|airbnb|booking|expedia|priceline|kayak|orbitz/)) {
    return 'Travel';
  }
  if (desc.match(/uber|lyft|taxi|airport|rental car|hertz|avis|budget|enterprise|alamo/)) {
    return 'Travel';
  }
  if (desc.match(/marriott|hilton|hyatt|ihg|choice|wyndham|delta|american airlines|united/)) {
    return 'Travel';
  }
  
  // Transit
  if (desc.match(/metro|subway|bus|train|transit|parking|toll|mta|bart|septa/)) {
    return 'Transit';
  }
  
  // Entertainment
  if (desc.match(/movie|theater|cinema|netflix|spotify|hulu|disney|amazon prime|apple music/)) {
    return 'Entertainment';
  }
  if (desc.match(/concert|ticket|entertainment|amc|regal|cinemark|ticketmaster/)) {
    return 'Entertainment';
  }
  
  // Shopping
  if (desc.match(/amazon|ebay|target|walmart|best buy|apple store|microsoft|google play/)) {
    return 'Shopping';
  }
  if (desc.match(/macy|nordstrom|tj maxx|marshalls|ross|old navy|gap|nike|adidas/)) {
    return 'Shopping';
  }
  
  // Utilities
  if (desc.match(/electric|gas company|water|sewer|internet|phone|cable|utility|power|energy/)) {
    return 'Utilities';
  }
  if (desc.match(/verizon|att|tmobile|sprint|comcast|spectrum|cox|dish|directv/)) {
    return 'Utilities';
  }
  
  // Healthcare
  if (desc.match(/medical|doctor|hospital|pharmacy|cvs|walgreens|rite aid|health|dental|vision/)) {
    return 'Healthcare';
  }
  
  // Streaming
  if (desc.match(/netflix|hulu|disney|amazon prime|spotify|apple music|youtube|twitch|paramount/)) {
    return 'Streaming';
  }
  
  // Department Stores
  if (desc.match(/target|walmart|costco|sams club|bjs|macy|nordstrom|kohls|jcpenney/)) {
    return 'Department Stores';
  }
  
  return 'Other';
}

function detectIfFirstRowIsDataFromArray(firstRow: string[]): boolean {
  // Check if any value looks like a date
  const hasDateLikeValue = firstRow.some(value => {
    if (!value || typeof value !== 'string') return false;
    return DATE_FORMATS.some(format => {
      try {
        const parsed = parse(value.trim(), format, new Date());
        return isValid(parsed);
      } catch {
        return false;
      }
    });
  });

  // Check if any value looks like a numeric amount
  const hasNumericValue = firstRow.some(value => {
    if (!value || typeof value !== 'string') return false;
    const cleanValue = value.trim().replace(/[$,\s]/g, '').replace(/[()]/g, '-');
    const num = parseFloat(cleanValue);
    return !isNaN(num) && Math.abs(num) < 100000; // Reasonable transaction amount
  });

  // If we find both date-like and numeric values, it's likely data
  return hasDateLikeValue && hasNumericValue;
}

function detectIfFirstRowIsData(firstRow: RawTransaction): boolean {
  const values = Object.values(firstRow);
  
  // Check if any value looks like a date
  const hasDateLikeValue = values.some(value => {
    if (!value || typeof value !== 'string') return false;
    return DATE_FORMATS.some(format => {
      try {
        const parsed = parse(value.trim(), format, new Date());
        return isValid(parsed);
      } catch {
        return false;
      }
    });
  });

  // Check if any value looks like a numeric amount
  const hasNumericValue = values.some(value => {
    if (!value || typeof value !== 'string') return false;
    const cleanValue = value.trim().replace(/[$,\s]/g, '').replace(/[()]/g, '-');
    const num = parseFloat(cleanValue);
    return !isNaN(num) && Math.abs(num) < 100000; // Reasonable transaction amount
  });

  // If we find both date-like and numeric values, it's likely data
  return hasDateLikeValue && hasNumericValue;
}

function inferColumnStructureFromHeaders(data: RawTransaction[]): { 
  dateColumn: string; 
  descColumn: string; 
  amountColumn: string; 
  categoryColumn?: string; 
  mccColumn?: string;
  balanceColumn?: string;
} | null {
  if (data.length === 0) return null;
  
  const headers = Object.keys(data[0]);
  const firstRow = Object.values(data[0]);
  
  let dateColumn = '';
  let descColumn = '';
  let amountColumn = '';
  let balanceColumn = '';
  
  // Find date column (should parse as a date)
  for (let i = 0; i < headers.length; i++) {
    const value = firstRow[i]?.trim();
    if (value) {
      for (const format of DATE_FORMATS) {
        try {
          const parsed = parse(value, format, new Date());
          if (isValid(parsed)) {
            dateColumn = headers[i];
            break;
          }
        } catch {
          continue;
        }
      }
      if (dateColumn) break;
    }
  }
  
  // Find amount column (should parse as a number, often the largest numeric value that's not a balance)
  const numericColumns = [];
  for (let i = 0; i < headers.length; i++) {
    const value = firstRow[i]?.trim();
    if (value) {
      const cleanValue = value.replace(/[$,\s]/g, '').replace(/[()]/g, '-');
      const parsed = parseFloat(cleanValue);
      if (!isNaN(parsed)) {
        numericColumns.push({ index: i, header: headers[i], value: Math.abs(parsed) });
      }
    }
  }
  
  // Sort by value to identify amount vs balance
  numericColumns.sort((a, b) => a.value - b.value);
  
  if (numericColumns.length >= 1) {
    // The smaller number is likely the transaction amount
    amountColumn = numericColumns[0].header;
    
    // If there are 2+ numeric columns, the larger one might be the balance
    if (numericColumns.length >= 2) {
      balanceColumn = numericColumns[numericColumns.length - 1].header;
    }
  }
  
  // Find description column (text that's not date or number)
  for (let i = 0; i < headers.length; i++) {
    if (headers[i] !== dateColumn && headers[i] !== amountColumn && headers[i] !== balanceColumn) {
      const value = firstRow[i]?.trim();
      if (value && value.length > 0) {
        // Check if it's not a number
        const cleanValue = value.replace(/[$,\s]/g, '').replace(/[()]/g, '-');
        if (isNaN(parseFloat(cleanValue))) {
          descColumn = headers[i];
          break;
        }
      }
    }
  }
  
  if (!dateColumn || !descColumn || !amountColumn) {
    return null;
  }
  
  return {
    dateColumn,
    descColumn,
    amountColumn,
    balanceColumn: balanceColumn || undefined
  };
}

function inferColumnStructureFromArray(data: string[][]): { 
  dateIndex: number; 
  descIndex: number; 
  amountIndex: number; 
  categoryIndex?: number; 
  balanceIndex?: number;
  altAmountIndex?: number;
} | null {
  if (data.length === 0) return null;
  const firstRow = data[0];
  // Special handling for 5-column, no-header CSVs (like Marcus's)
  if (firstRow.length === 5) {
    return {
      dateIndex: 0,
      descIndex: 1,
      amountIndex: 2,
      altAmountIndex: 3,
      balanceIndex: 4
    };
  }
  let dateIndex = -1;
  let descIndex = -1;
  let amountIndex = -1;
  let balanceIndex = -1;

  // Find date column (should parse as a date)
  for (let i = 0; i < firstRow.length; i++) {
    const value = firstRow[i]?.trim();
    if (value) {
      for (const format of DATE_FORMATS) {
        try {
          const parsed = parse(value, format, new Date());
          if (isValid(parsed)) {
            dateIndex = i;
            break;
          }
        } catch {
          continue;
        }
      }
      if (dateIndex !== -1) break;
    }
  }
  
  // Find numeric columns (amounts and potentially balance)
  const numericColumns = [];
  for (let i = 0; i < firstRow.length; i++) {
    const value = firstRow[i]?.trim();
    if (value && i !== dateIndex) {
      const cleanValue = value.replace(/[$,\s]/g, '').replace(/[()]/g, '-');
      const parsed = parseFloat(cleanValue);
      if (!isNaN(parsed)) {
        numericColumns.push({ index: i, value: Math.abs(parsed) });
      }
    }
  }
  
  // Sort by value to identify amount vs balance
  numericColumns.sort((a, b) => a.value - b.value);
  
  if (numericColumns.length >= 1) {
    // The smaller number is likely the transaction amount
    amountIndex = numericColumns[0].index;
    
    // If there are 2+ numeric columns, the larger one might be the balance
    if (numericColumns.length >= 2) {
      balanceIndex = numericColumns[numericColumns.length - 1].index;
    }
  }
  
  // Find description column (text that's not date or number)
  for (let i = 0; i < firstRow.length; i++) {
    if (i !== dateIndex && i !== amountIndex && i !== balanceIndex) {
      const value = firstRow[i]?.trim();
      if (value && value.length > 0) {
        // Check if it's not a number
        const cleanValue = value.replace(/[$,\s]/g, '').replace(/[()]/g, '-');
        if (isNaN(parseFloat(cleanValue))) {
          descIndex = i;
          break;
        }
      }
    }
  }
  
  if (dateIndex === -1 || descIndex === -1 || amountIndex === -1) {
    return null;
  }
  
  return {
    dateIndex,
    descIndex,
    amountIndex,
    balanceIndex: balanceIndex !== -1 ? balanceIndex : undefined
  };
}

function extractStatementPeriod(csvContent: string, transactions: ParsedTransaction[]): StatementPeriod {
  const lines = csvContent.split('\n').slice(0, 20); // Check first 20 lines for metadata
  
  let startDate: Date | null = null;
  let endDate: Date | null = null;
  let statementDate: Date | null = null;
  let accountNumber: string | undefined;
  let bankName: string | undefined;

  // Extract from header lines (common patterns)
  for (const line of lines) {
    const cleanLine = line.toLowerCase().trim();
    
    // Statement period patterns
    const periodMatch = cleanLine.match(/statement period[:\s]+(\d{1,2}\/\d{1,2}\/\d{2,4})\s*[-–—to]+\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/);
    if (periodMatch) {
      startDate = parseDate(periodMatch[1]);
      endDate = parseDate(periodMatch[2]);
    }

    // Statement date patterns
    const statementMatch = cleanLine.match(/statement date[:\s]+(\d{1,2}\/\d{1,2}\/\d{2,4})/);
    if (statementMatch) {
      statementDate = parseDate(statementMatch[1]);
    }

    // Account number patterns
    const accountMatch = cleanLine.match(/account[:\s#]*(\*{0,4}\d{4,}|\d{4,})/);
    if (accountMatch && !accountNumber) {
      accountNumber = accountMatch[1];
    }

    // Bank name patterns
    if (cleanLine.includes('chase') || cleanLine.includes('jpmorgan')) {
      bankName = 'Chase';
    } else if (cleanLine.includes('citi') || cleanLine.includes('citibank')) {
      bankName = 'Citi';
    } else if (cleanLine.includes('american express') || cleanLine.includes('amex')) {
      bankName = 'American Express';
    } else if (cleanLine.includes('capital one')) {
      bankName = 'Capital One';
    } else if (cleanLine.includes('discover')) {
      bankName = 'Discover';
    } else if (cleanLine.includes('bank of america') || cleanLine.includes('bofa')) {
      bankName = 'Bank of America';
    } else if (cleanLine.includes('wells fargo')) {
      bankName = 'Wells Fargo';
    }
  }

  // Fallback: Use transaction date range if no explicit period found
  if (!startDate || !endDate) {
    if (transactions.length > 0) {
      const dates = transactions.map(t => t.date).sort((a, b) => a.getTime() - b.getTime());
      startDate = startDate || dates[0];
      endDate = endDate || dates[dates.length - 1];
    }
  }

  // Estimate statement date if not found (typically end of period + a few days)
  if (!statementDate && endDate) {
    const estimatedDate = new Date(endDate);
    estimatedDate.setDate(estimatedDate.getDate() + 3); // Typical statement generation delay
    statementDate = estimatedDate;
  }

  return {
    startDate,
    endDate,
    statementDate,
    accountNumber,
    bankName
  };
}

export async function parseCSVStatements(csvContent: string): Promise<CSVParseResult> {
  console.log('[CSV PARSER DEBUG] Input type:', typeof csvContent);
  console.log('[CSV PARSER DEBUG] Input length:', csvContent ? csvContent.length : 0);
  console.log('[CSV PARSER DEBUG] Input preview:', csvContent ? csvContent.slice(0, 200) : 'null/undefined');
  
  // Handle case where a Blob is passed instead of a string
  if (typeof csvContent === 'object' && csvContent && 'text' in csvContent) {
    console.log('[CSV PARSER DEBUG] Detected Blob object, converting to string...');
    try {
      // If it's a Blob, convert it to string
      const text = await (csvContent as any).text();
      console.log('[CSV PARSER DEBUG] Successfully converted Blob to string, length:', text.length);
      return parseCSVStatements(text); // Recursive call with string
    } catch (error) {
      console.log('[CSV PARSER DEBUG] Failed to convert Blob:', error);
      throw new Error('Failed to convert Blob to string: ' + String(error));
    }
  }
  
  // Ensure we have a string
  if (typeof csvContent !== 'string') {
    console.log('[CSV PARSER DEBUG] Converting non-string input to string');
    csvContent = String(csvContent);
  }
  
  const result: CSVParseResult = {
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

  try {
    // First, parse without headers to check if first row contains data
    let preParseResult;
    try {
      preParseResult = Papa.parse(csvContent, {
        header: false,
        skipEmptyLines: true
      });
      console.log('[CSV PARSER DEBUG] Papa.parse succeeded');
    } catch (papaError) {
      console.log('[CSV PARSER DEBUG] Papa.parse failed:', papaError);
      // Fallback to manual parsing
      const lines = csvContent.trim().split(/\r?\n/).filter(line => line.trim());
      preParseResult = {
        data: lines.map(line => line.split(',')),
        errors: [],
        meta: {}
      };
      console.log('[CSV PARSER DEBUG] Using fallback manual parsing');
    }
    
    // Ensure preParseResult has the expected structure
    if (!preParseResult || !preParseResult.data || !Array.isArray(preParseResult.errors)) {
      console.log('[CSV PARSER DEBUG] Invalid preParseResult structure:', preParseResult);
      result.errors.push('CSV parsing failed: Invalid parser result');
      return result;
    }
    
    console.log('[CSV PARSER DEBUG] Papa.parse result:', preParseResult);
    console.log('[CSV PARSER DEBUG] Papa.parse data length:', preParseResult.data?.length || 0);
    console.log('[CSV PARSER DEBUG] Papa.parse errors:', preParseResult.errors);
    
    if (preParseResult.errors.length > 0) {
      result.errors.push(...preParseResult.errors.map(err => err.message || String(err)));
    }

    const rawData = preParseResult.data as string[][];
    if (rawData.length === 0) {
      result.errors.push('No data found in CSV file');
      return result;
    }

    console.log('First 5 lines of CSV:', rawData.slice(0, 5));

    // Check if first row looks like data or headers
    const firstRow = rawData[0];
    const firstRowIsData = detectIfFirstRowIsDataFromArray(firstRow);
    console.log('First row is data (no headers):', firstRowIsData);

    let data: RawTransaction[];
    let dateColumn: string, descColumn: string, amountColumn: string;
    let categoryColumn: string | undefined, mccColumn: string | undefined, balanceColumn: string | undefined;
    
    if (firstRowIsData) {
      // CSV has no headers - create column names and convert to objects
      const numColumns = firstRow.length;
      const columnNames = [];
      for (let i = 0; i < numColumns; i++) {
        columnNames.push(`col${i}`);
      }
      data = rawData.map(row => {
        const obj: RawTransaction = {};
        for (let i = 0; i < columnNames.length; i++) {
          obj[columnNames[i]] = row[i] || '';
        }
        return obj;
      });
      result.metadata.totalRows = data.length;
      result.metadata.detectedFormat = 'no-headers-inferred';
      // Infer column structure from the data
      const structure = inferColumnStructureFromArray(rawData);
      if (!structure) {
        result.errors.push('Could not infer column structure from data. Expected format: Date, Description, Amount [, Category, Balance]');
        return result;
      }
      dateColumn = `col${structure.dateIndex}`;
      descColumn = `col${structure.descIndex}`;
      amountColumn = `col${structure.amountIndex}`;
      categoryColumn = structure.categoryIndex !== undefined ? `col${structure.categoryIndex}` : undefined;
      balanceColumn = structure.balanceIndex !== undefined ? `col${structure.balanceIndex}` : undefined;
      const altAmountIndex = structure.altAmountIndex;
      console.log('Inferred structure:', {
        dateColumn: `${dateColumn} (index ${structure.dateIndex})`,
        descColumn: `${descColumn} (index ${structure.descIndex})`,
        amountColumn: `${amountColumn} (index ${structure.amountIndex})`,
        categoryColumn: categoryColumn ? `${categoryColumn} (index ${structure.categoryIndex})` : undefined,
        balanceColumn: balanceColumn ? `${balanceColumn} (index ${structure.balanceIndex})` : undefined
      });
      // Move the forEach loop here so structure is in scope
      data.forEach((row, index) => {
        try {
          const dateStr = row[dateColumn];
          const descStr = row[descColumn];
          let amount: number | null = null;
          if (altAmountIndex !== undefined) {
            const debit = parseAmount(row[`col${structure.amountIndex}`]);
            const credit = parseAmount(row[`col${altAmountIndex}`]);
            if (debit !== null && credit !== null) {
              amount = credit - debit;
            } else if (debit !== null) {
              amount = -Math.abs(debit);
            } else if (credit !== null) {
              amount = Math.abs(credit);
            }
          } else {
            const amountStr = row[amountColumn];
            amount = parseAmount(amountStr);
          }
          if (!dateStr || !descStr || amount === null) {
            result.warnings.push(`Row ${index + 1}: Missing required data`);
            result.metadata.invalidRows++;
            console.log('[CSV PARSER DEBUG] Skipping row with missing data:', row);
            return;
          }
          const parsedDate = parseDate(dateStr, detectedDateFormat || undefined);
          if (!parsedDate) {
            result.warnings.push(`Row ${index + 1}: Invalid date format: ${dateStr}`);
            result.metadata.invalidRows++;
            return;
          }
          // Add debug log for each parsed row
          console.log('[CSV PARSER DEBUG] Parsed row:', {
            date: dateStr,
            desc: descStr,
            amount,
            balance: balanceColumn ? row[balanceColumn] : undefined
          });
          // Update date range
          if (!minDate || parsedDate < minDate) minDate = parsedDate;
          if (!maxDate || parsedDate > maxDate) maxDate = parsedDate;
          const transaction: ParsedTransaction = {
            id: `${parsedDate.getTime()}-${index}`,
            date: parsedDate,
            description: cleanDescription(descStr),
            amount: Math.abs(amount),
            type: amount < 0 ? 'credit' : 'debit',
            merchant: extractMerchant(descStr),
            original_data: row
          };
          if (categoryColumn && row[categoryColumn] && row[categoryColumn].trim()) {
            transaction.category = row[categoryColumn].trim();
          } else {
            transaction.category = categorizeTransaction(cleanDescription(descStr));
          }
          if (balanceColumn && row[balanceColumn]) {
            const balanceAmount = parseAmount(row[balanceColumn]);
            if (balanceAmount !== null) {
              transaction.balance = balanceAmount;
            }
          }
          result.transactions.push(transaction);
          result.metadata.validRows++;
        } catch (error) {
          result.warnings.push(`Row ${index + 1}: Error processing transaction - ${error}`);
          result.metadata.invalidRows++;
        }
      });
    } else {
      // CSV has headers, use normal parsing
      let parseResult;
      try {
        parseResult = Papa.parse(csvContent, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string) => header.trim()
        });
        console.log('[CSV PARSER DEBUG] Papa.parse (headers) succeeded');
      } catch (papaError) {
        console.log('[CSV PARSER DEBUG] Papa.parse (headers) failed:', papaError);
        result.errors.push('CSV parsing with headers failed');
        return result;
      }

      if (!parseResult || !parseResult.data || !Array.isArray(parseResult.errors)) {
        console.log('[CSV PARSER DEBUG] Invalid parseResult structure:', parseResult);
        result.errors.push('CSV parsing failed: Invalid parser result');
        return result;
      }

      if (parseResult.errors.length > 0) {
        result.errors.push(...parseResult.errors.map(err => err.message || String(err)));
      }

      data = parseResult.data as RawTransaction[];
      result.metadata.totalRows = data.length;

      const headers = Object.keys(data[0] || {});
      console.log('Detected headers:', headers);
      
      const detectedFormat = detectCSVFormat(headers);
      result.metadata.detectedFormat = detectedFormat;
      console.log('Detected format:', detectedFormat);

      const mappings = COLUMN_MAPPINGS[detectedFormat] || COLUMN_MAPPINGS.generic;
      
      // Find column names
      dateColumn = findColumn(headers, mappings.date || ['Date']) || '';
      descColumn = findColumn(headers, mappings.description || ['Description']) || '';
      amountColumn = findColumn(headers, mappings.amount || ['Amount']) || '';
      categoryColumn = findColumn(headers, mappings.category || ['Category']);
      mccColumn = findColumn(headers, mappings.mcc || ['MCC']);
      balanceColumn = findColumn(headers, mappings.balance || ['Balance']);

      console.log('Column mapping results:', {
        dateColumn,
        descColumn,
        amountColumn,
        categoryColumn,
        mccColumn,
        balanceColumn
      });

      if (!dateColumn) {
        result.errors.push(`Could not find date column. Available headers: ${headers.join(', ')}`);
        return result;
      }

      if (!descColumn) {
        result.errors.push(`Could not find description column. Available headers: ${headers.join(', ')}`);
        return result;
      }

      if (!amountColumn) {
        result.errors.push(`Could not find amount column. Available headers: ${headers.join(', ')}`);
        return result;
      }
    }

    // Detect date format from first few valid rows
    let detectedDateFormat: string | null = null;
    for (let i = 0; i < Math.min(10, data.length); i++) {
      const row = data[i];
      if (row[dateColumn]) {
        detectedDateFormat = detectDateFormat(row[dateColumn]);
        if (detectedDateFormat) break;
      }
    }

    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    // Process each transaction
    data.forEach((row, index) => {
      try {
        const dateStr = row[dateColumn];
        const descStr = row[descColumn];
        let amount: number | null = null;
        // For no-header, 5-column CSVs, use altAmountIndex logic
        if (typeof structure !== 'undefined' && structure.altAmountIndex !== undefined) {
          const debit = parseAmount(row[`col${structure.amountIndex}`]);
          const credit = parseAmount(row[`col${structure.altAmountIndex}`]);
          if (debit !== null && credit !== null) {
            amount = credit - debit;
          } else if (debit !== null) {
            amount = -Math.abs(debit);
          } else if (credit !== null) {
            amount = Math.abs(credit);
          }
        } else {
          const amountStr = row[amountColumn];
          amount = parseAmount(amountStr);
        }
        if (!dateStr || !descStr || amount === null) {
          result.warnings.push(`Row ${index + 1}: Missing required data`);
          result.metadata.invalidRows++;
          console.log('[CSV PARSER DEBUG] Skipping row with missing data:', row);
          return;
        }
        const parsedDate = parseDate(dateStr, detectedDateFormat || undefined);
        if (!parsedDate) {
          result.warnings.push(`Row ${index + 1}: Invalid date format: ${dateStr}`);
          result.metadata.invalidRows++;
          return;
        }
        // Add debug log for each parsed row
        console.log('[CSV PARSER DEBUG] Parsed row:', {
          date: dateStr,
          desc: descStr,
          amount,
          balance: balanceColumn ? row[balanceColumn] : undefined
        });
        // Update date range
        if (!minDate || parsedDate < minDate) minDate = parsedDate;
        if (!maxDate || parsedDate > maxDate) maxDate = parsedDate;
        const transaction: ParsedTransaction = {
          id: `${parsedDate.getTime()}-${index}`,
          date: parsedDate,
          description: cleanDescription(descStr),
          amount: Math.abs(amount),
          type: amount < 0 ? 'credit' : 'debit',
          merchant: extractMerchant(descStr),
          original_data: row
        };
        // Add category - use provided category or auto-categorize
        if (categoryColumn && row[categoryColumn] && row[categoryColumn].trim()) {
          transaction.category = row[categoryColumn].trim();
        } else {
          transaction.category = categorizeTransaction(cleanDescription(descStr));
        }
        // Add MCC if available
        if (mccColumn && row[mccColumn]) {
          const validMCC = validateMCC(row[mccColumn]);
          if (validMCC) {
            transaction.mcc = validMCC;
          }
        }
        // Add balance if available
        if (balanceColumn && row[balanceColumn]) {
          const balanceAmount = parseAmount(row[balanceColumn]);
          if (balanceAmount !== null) {
            transaction.balance = balanceAmount;
          }
        }
        result.transactions.push(transaction);
        result.metadata.validRows++;
      } catch (error) {
        result.warnings.push(`Row ${index + 1}: Error processing transaction - ${error}`);
        result.metadata.invalidRows++;
      }
    });

    // Set date range
    result.metadata.dateRange = {
      start: minDate,
      end: maxDate
    };

    console.log(`Parsed ${result.metadata.validRows} valid transactions out of ${result.metadata.totalRows} total rows`);
    
    if (result.metadata.validRows === 0) {
      result.errors.push('No valid transactions found in the CSV file');
    }

    // Extract statement period information
    result.statementPeriod = extractStatementPeriod(csvContent, result.transactions);

    console.log('Statement Period:', {
      startDate: result.statementPeriod.startDate?.toISOString(),
      endDate: result.statementPeriod.endDate?.toISOString(),
      statementDate: result.statementPeriod.statementDate?.toISOString(),
      bankName: result.statementPeriod.bankName
    });

  } catch (error) {
    console.error('CSV parsing error:', error);
    result.errors.push(`Failed to parse CSV: ${error}`);
  }

  return result;
}

interface CSVRow {
  [key: string]: string;
}

export function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.trim().split('\n');
  
  if (lines.length === 0) {
    return [];
  }
  
  // Get headers from first line
  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
  
  // Parse data rows
  const rows: CSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => value.trim().replace(/"/g, ''));
    
    if (values.length === headers.length) {
      const row: CSVRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      rows.push(row);
    }
  }
  
  return rows;
}

export function convertToCSV(data: any[]): string {
  if (data.length === 0) {
    return '';
  }
  
  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvLines = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ];
  
  return csvLines.join('\n');
} 