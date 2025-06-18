// src/app/api/upload-statement/route.ts

// This is a placeholder API route for handling CSV statement uploads.
// The actual file processing, AI analysis, and database storage logic
// will need to be implemented here using server-side code.

import { NextRequest, NextResponse } from 'next/server';
import { parseCSVStatements } from '@/lib/csvParser';
import { analyzeTransactions } from '@/lib/transactionAnalyzer';
import { generateCardRecommendations } from '@/lib/cardRecommendations';
import { saveReport } from '@/lib/reportStorage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);

    // Read file content
    const csvContent = await file.text();
    
    // Parse CSV
    const parseResult = parseCSVStatements(csvContent);
    
    console.log('Parse result metadata:', parseResult.metadata);
    console.log('Parse errors:', parseResult.errors);
    console.log('Parse warnings:', parseResult.warnings);

    if (parseResult.errors.length > 0) {
      return NextResponse.json({ 
        error: 'Failed to parse CSV file',
        details: parseResult.errors,
        warnings: parseResult.warnings
      }, { status: 400 });
    }

    if (parseResult.transactions.length === 0) {
      return NextResponse.json({ 
        error: 'No valid transactions found in CSV',
        warnings: parseResult.warnings
      }, { status: 400 });
    }

    console.log(`Successfully parsed ${parseResult.transactions.length} transactions`);

    // Analyze transactions
    const spendingAnalysis = analyzeTransactions(parseResult.transactions);
    console.log('Spending analysis completed');

    // Generate card recommendations
    const cardRecommendations = await generateCardRecommendations(spendingAnalysis);
    console.log(`Generated ${cardRecommendations.recommendations.length} card recommendations`);

    // Save report to database
    try {
      const savedReport = await saveReport(
        spendingAnalysis,
        cardRecommendations,
        file.name
      );
      
      if (savedReport) {
        console.log(`Report saved with ID: ${savedReport.id}`);
      } else {
        console.warn('Failed to save report to database');
      }
    } catch (saveError) {
      console.error('Error saving report:', saveError);
      // Don't fail the entire request if report saving fails
    }

    console.log('File processing completed successfully');

    return NextResponse.json({
      success: true,
      analysis: spendingAnalysis,
      recommendations: cardRecommendations,
      metadata: parseResult.metadata,
      warnings: parseResult.warnings
    });

  } catch (error) {
    console.error('Error processing file upload:', error);
    return NextResponse.json({ 
      error: 'Error processing file upload',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 