// src/app/api/upload-statement/route.ts

// This is a placeholder API route for handling CSV statement uploads.
// The actual file processing, AI analysis, and database storage logic
// will need to be implemented here using server-side code.

import { NextRequest, NextResponse } from 'next/server';
import { parseCSVStatements } from '@/lib/csvParser';
import { analyzeTransactions } from '@/lib/transactionAnalyzer';
import { generateCardRecommendations } from '@/lib/cardRecommendations';
import { saveReport } from '@/lib/reportStorage';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);

    // Read file content
    const csvContent = await file.text();
    
    // Parse CSV with statement period extraction
    const parseResult = parseCSVStatements(csvContent);
    
    console.log('Parse result metadata:', parseResult.metadata);
    console.log('Statement period:', parseResult.statementPeriod);
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

    // Save statement information to database if user is authenticated
    let statementId = null;
    if (user) {
      try {
        console.log('✅ User authenticated, attempting to save statement to database...');
        console.log('User ID:', user.id);
        
        const { data: statementData, error: statementError } = await supabase
          .from('user_statements')
          .insert({
            user_id: user.id,
            filename: file.name,
            statement_period_start: parseResult.statementPeriod.startDate?.toISOString(),
            statement_period_end: parseResult.statementPeriod.endDate?.toISOString(),
            statement_date: parseResult.statementPeriod.statementDate?.toISOString(),
            bank_name: parseResult.statementPeriod.bankName,
            account_number: parseResult.statementPeriod.accountNumber,
            transaction_count: parseResult.transactions.length,
            total_amount: spendingAnalysis.totalSpent,
            categories: spendingAnalysis.categoryBreakdown
          })
          .select()
          .single();

        if (statementError) {
          console.error('❌ Error saving statement:', statementError);
          
          if (statementError.code === '42P01') {
            console.warn('⚠️ user_statements table does not exist in production database');
            console.warn('💡 To fix this, visit: https://card-wise-nsxeoa95s-marcus-projects-04c74091.vercel.app/api/setup-db');
          } else if (statementError.code === 'PGRST116') {
            console.warn('⚠️ RLS policy may be blocking the insert - user might not have permission');
          } else {
            console.error('Statement error details:', JSON.stringify(statementError, null, 2));
          }
          
          console.warn('⚠️ Statement was not saved to database, but analysis will continue');
        } else {
          statementId = statementData.id;
          console.log(`✅ Statement saved successfully with ID: ${statementId}`);
        }
      } catch (saveError) {
        console.error('❌ Exception while saving statement:', saveError);
        console.warn('⚠️ Statement was not saved to database, but analysis will continue');
      }
    } else {
      console.warn('❌ User not authenticated - statement will not be saved to database');
    }

    // Save report to database
    try {
      const savedReport = await saveReport(
        spendingAnalysis,
        cardRecommendations,
        file.name,
        statementId
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
      statementId,
      userAuthenticated: !!user,
      userId: user?.id || null,
      statementPeriod: parseResult.statementPeriod,
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