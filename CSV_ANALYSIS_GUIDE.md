# CardWise CSV Analysis Guide

## Overview

CardWise now includes comprehensive CSV parsing and analysis functionality that can automatically process credit card statements, categorize transactions, analyze spending patterns, and generate personalized card recommendations.

## Features

### 🔍 Smart CSV Parsing (`src/lib/csvParser.ts`)

**Capabilities:**
- **Multi-format Support**: Automatically detects and handles CSV formats from major credit card companies (Chase, Citi, American Express, Capital One, Discover)
- **Intelligent Column Mapping**: Automatically identifies date, description, amount, and category columns using fuzzy matching
- **Date Format Detection**: Handles multiple date formats (MM/dd/yyyy, yyyy-MM-dd, etc.)
- **Amount Parsing**: Handles various currency formats, parentheses for negative amounts, and commas
- **Data Validation**: Comprehensive error checking and reporting
- **Merchant Extraction**: Automatically extracts merchant names from transaction descriptions

**Supported CSV Formats:**
```csv
Transaction Date,Description,Amount,Category
12/15/2024,STARBUCKS STORE #12345,-4.95,Food & Dining
12/14/2024,AMAZON.COM AMZN.COM/BILL,-89.99,Shopping
```

**Key Functions:**
- `parseCSVStatements(csvContent: string): CSVParseResult`
- Returns detailed parsing results with transactions, errors, warnings, and metadata

### 📊 Advanced Transaction Analysis (`src/lib/transactionAnalyzer.ts`)

**Spending Categorization:**
- **10 Major Categories**: Food & Dining, Groceries, Gas & Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Travel, Financial, Other
- **Smart Keyword Matching**: Uses comprehensive keyword databases for automatic categorization
- **Confidence Scoring**: Each categorization includes a confidence score
- **Subcategory Support**: Detailed subcategorization within major categories

**Analysis Features:**
- **Spending Metrics**: Total spent, transaction count, average transaction amount
- **Category Breakdown**: Percentage and amount spent by category
- **Monthly Trends**: Time-based spending analysis
- **Merchant Analysis**: Top merchants, frequency analysis
- **Smart Insights**: AI-powered spending insights and recommendations

**Sample Analysis Output:**
```typescript
{
  totalSpent: 1247.83,
  topCategories: [
    { category: "Food & Dining", amount: 387.25, percentage: 31.0 },
    { category: "Groceries", amount: 298.54, percentage: 23.9 }
  ],
  insights: [
    {
      type: "warning",
      title: "High Concentration in Single Category",
      description: "31.0% of your spending is on Food & Dining"
    }
  ]
}
```

### 💳 Intelligent Card Recommendations (`src/lib/cardRecommendations.ts`)

**Card Database:**
- Comprehensive database of popular credit cards
- Detailed reward structures, annual fees, and features
- Credit score requirements and ratings

**Recommendation Engine:**
- **Spending Pattern Matching**: Analyzes your spending to find optimal cards
- **Reward Optimization**: Calculates potential annual rewards for each card
- **Net Benefit Analysis**: Factors in annual fees to show true value
- **Personalized Reasons**: Explains why each card is recommended for you

**Featured Cards:**
- Chase Sapphire Preferred
- Citi Double Cash
- American Express Gold Card
- Discover it Cash Back
- Capital One Venture
- Chase Freedom Flex

### 🚀 API Integration (`src/app/api/upload-statement/route.ts`)

**Enhanced Upload Endpoint:**
- File validation (CSV only, 10MB limit)
- Comprehensive error handling
- Detailed response with analysis results
- Ready for database integration

**Response Structure:**
```typescript
{
  success: true,
  data: {
    parsing: { /* parsing metadata */ },
    analysis: { /* spending analysis */ },
    recommendations: { /* card recommendations */ }
  }
}
```

## Usage

### 1. File Upload
1. Navigate to the dashboard
2. Click "Select CSV File" to choose your credit card statement
3. Click "Upload & Analyze" to process the file
4. View detailed analysis results

### 2. Sample Data
Download the included `sample-statement.csv` file to test the functionality with realistic transaction data.

### 3. Analysis Results
After upload, you'll see:
- **Spending Metrics**: Total spent, transaction count, averages
- **Category Breakdown**: Visual breakdown of spending by category
- **Insights**: AI-powered spending insights and recommendations
- **Card Recommendations**: Personalized credit card suggestions

## Technical Implementation

### Dependencies Added
```json
{
  "papaparse": "^5.4.1",
  "date-fns": "^3.6.0",
  "react-icons": "^4.12.0",
  "@types/papaparse": "^5.3.14"
}
```

### Architecture
```
src/lib/
├── csvParser.ts          # CSV parsing and validation
├── transactionAnalyzer.ts # Spending analysis and categorization
└── cardRecommendations.ts # Card recommendation engine

src/app/api/
└── upload-statement/route.ts # File upload and processing API

src/app/dashboard/
└── page.tsx              # Enhanced dashboard with analysis UI
```

### Error Handling
- **Parsing Errors**: Invalid CSV format, missing columns, date parsing issues
- **Validation Errors**: File size limits, unsupported formats
- **Processing Errors**: Network issues, server errors
- **User Feedback**: Clear error messages and loading states

## Future Enhancements

### Planned Features
1. **Database Integration**: Store transactions and analysis results
2. **Historical Tracking**: Track spending trends over time
3. **Budget Planning**: Set and monitor spending budgets
4. **Alert System**: Notifications for unusual spending patterns
5. **Export Features**: PDF reports, CSV exports
6. **Mobile Optimization**: Enhanced mobile experience

### Advanced Analysis
1. **Trend Prediction**: Machine learning for spending forecasts
2. **Seasonal Analysis**: Identify seasonal spending patterns
3. **Goal Tracking**: Financial goal setting and monitoring
4. **Comparison Tools**: Compare against spending benchmarks

## Security & Privacy

### Data Protection
- Files are processed in memory and not permanently stored
- No transaction data is transmitted to third parties
- Client-side processing when possible
- Secure API endpoints with validation

### Best Practices
- Input sanitization and validation
- Error boundary handling
- Rate limiting (future implementation)
- Audit logging (future implementation)

## Sample CSV Format

For best results, ensure your CSV file includes these columns:

```csv
Transaction Date,Description,Amount,Category
12/15/2024,STARBUCKS STORE #12345,-4.95,Food & Dining
12/14/2024,AMAZON.COM AMZN.COM/BILL,-89.99,Shopping
12/13/2024,NETFLIX.COM,-15.99,Entertainment
```

**Column Requirements:**
- **Date**: Any standard date format
- **Description**: Transaction description or merchant name
- **Amount**: Negative for debits, positive for credits
- **Category**: Optional, will be auto-categorized if missing

## Testing

### Sample Test Cases
1. **Valid CSV**: Upload sample-statement.csv
2. **Invalid Format**: Try uploading a non-CSV file
3. **Large File**: Test with files approaching 10MB limit
4. **Missing Columns**: Test with incomplete CSV data
5. **Invalid Dates**: Test with malformed date formats

### Expected Results
- Successful parsing of valid CSV files
- Accurate transaction categorization
- Relevant card recommendations based on spending patterns
- Clear error messages for invalid inputs

## Support

For issues or questions:
1. Check the browser console for detailed error messages
2. Verify CSV format matches expected structure
3. Ensure file size is under 10MB
4. Try the sample CSV file first to verify functionality 