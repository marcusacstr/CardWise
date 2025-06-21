import { parse, isValid } from 'date-fns';
import { ParsedTransaction, CSVParseResult } from './csvParser';

export interface PDFParseResult extends CSVParseResult {}

// Common date formats found in PDF statements
const PDF_DATE_FORMATS = [
  'MM/dd/yyyy',
  'MM/dd/yy',
  'yyyy-MM-dd',
  'dd/MM/yyyy',
  'dd/MM/yy',
  'MMM dd, yyyy',
  'MMM dd yyyy',
  'MM-dd-yyyy',
  'MM-dd-yy',
  'MMM dd',
  'dd MMM yyyy',
  'dd MMM yy'
];

function parseDate(dateString: string, currentYear?: number): Date | null {
  if (!dateString || dateString.trim() === '') return null;
  
  let cleanDate = dateString.trim();
  
  // If date doesn't have year, add current year
  if (currentYear && !cleanDate.match(/\d{4}/)) {
    cleanDate = cleanDate + ', ' + currentYear;
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
  const cleanAmount = amountString
    .replace(/[$,\s]/g, '')
    .replace(/[()]/g, '-') // Handle parentheses as negative
    .trim();
  
  const parsed = parseFloat(cleanAmount);
  return isNaN(parsed) ? null : parsed;
}

function cleanDescription(description: string): string {
  return description
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-&.]/g, ' ')
    .trim();
}

function categorizeTransaction(description: string): string {
  const desc = description.toLowerCase();
  
  // Dining & Restaurants
  if (desc.match(/restaurant|dining|food|cafe|coffee|pizza|burger|taco|sushi|bar|pub|grill|bistro|deli|bakery/)) {
    return 'Dining';
  }
  
  // Groceries
  if (desc.match(/grocery|supermarket|market|kroger|safeway|whole foods|trader joe|costco|walmart|target.*grocery/)) {
    return 'Groceries';
  }
  
  // Gas & Fuel
  if (desc.match(/gas|fuel|shell|exxon|bp|chevron|mobil|texaco|arco|citgo|marathon/)) {
    return 'Gas';
  }
  
  // Travel
  if (desc.match(/airline|flight|hotel|uber|lyft|taxi|airport|rental car|hertz|avis|budget|enterprise/)) {
    return 'Travel';
  }
  
  // Transit
  if (desc.match(/metro|subway|bus|train|transit|parking|toll/)) {
    return 'Transit';
  }
  
  // Entertainment
  if (desc.match(/movie|theater|cinema|netflix|spotify|hulu|disney|amazon prime|entertainment|concert|ticket/)) {
    return 'Entertainment';
  }
  
  // Shopping
  if (desc.match(/amazon|ebay|store|shop|retail|mall|department|clothing|electronics|best buy|apple store/)) {
    return 'Shopping';
  }
  
  // Utilities
  if (desc.match(/electric|gas company|water|sewer|internet|phone|cable|utility|power|energy/)) {
    return 'Utilities';
  }
  
  // Healthcare
  if (desc.match(/medical|doctor|hospital|pharmacy|cvs|walgreens|health|dental|vision/)) {
    return 'Healthcare';
  }
  
  return 'Other';
}

export async function parsePDFStatement(pdfBuffer: ArrayBuffer): Promise<PDFParseResult> {
  const result: PDFParseResult = {
    transactions: [],
    errors: [],
    warnings: [],
    metadata: {
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      detectedFormat: 'pdf',
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
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items into a single string
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
    }
    
    if (!fullText || fullText.trim().length === 0) {
      result.errors.push('PDF appears to be empty or contains no readable text');
      return result;
    }

    // Extract current year for date parsing
    const yearMatch = fullText.match(/20\d{2}/);
    const currentYear = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
    
    // Generic pattern to find transaction-like lines
    // Look for date + description + amount patterns
    const transactionPattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]?\d{0,4}|\w{3}\s+\d{1,2})\s+(.+?)\s+(-?\$?[\d,]+\.?\d*)\s*$/gm;
    
    let matches = [];
    let match;
    while ((match = transactionPattern.exec(fullText)) !== null) {
      matches.push(match);
    }
    result.metadata.totalRows = matches.length;
    
    if (matches.length === 0) {
      result.warnings.push('No transaction patterns found in PDF. The statement format may not be supported.');
      return result;
    }

    // Process each match
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      
      try {
        const rawDate = match[1];
        const rawDescription = match[2];
        const rawAmount = match[3];
        
        // Parse date
        const date = parseDate(rawDate, currentYear);
        if (!date) {
          result.metadata.invalidRows++;
          continue;
        }
        
        // Parse amount
        const amount = parseAmount(rawAmount);
        if (amount === null || amount === 0) {
          result.metadata.invalidRows++;
          continue;
        }
        
        // Clean description
        const description = cleanDescription(rawDescription);
        if (!description || description.length < 3) {
          result.metadata.invalidRows++;
          continue;
        }
        
        // Categorize transaction
        const category = categorizeTransaction(description);
        
        // Create transaction
        const transaction: ParsedTransaction = {
          id: `pdf_${i}_${Date.now()}`,
          date,
          description,
          amount: Math.abs(amount), // Always positive for spending
          category,
          merchant: description.split(' ')[0], // Simple merchant extraction
          type: amount > 0 ? 'credit' : 'debit',
          original_data: {
            raw_date: rawDate,
            raw_description: rawDescription,
            raw_amount: rawAmount,
            source: 'pdf'
          }
        };
        
        result.transactions.push(transaction);
        result.metadata.validRows++;
        
        // Update date range
        if (!result.metadata.dateRange.start || date < result.metadata.dateRange.start) {
          result.metadata.dateRange.start = date;
        }
        if (!result.metadata.dateRange.end || date > result.metadata.dateRange.end) {
          result.metadata.dateRange.end = date;
        }
        
      } catch (error) {
        result.metadata.invalidRows++;
      }
    }
    
    // Sort transactions by date
    result.transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    if (result.transactions.length === 0) {
      result.warnings.push('No valid transactions could be extracted from the PDF');
    }
    
  } catch (error) {
    result.errors.push(`PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return result;
}
