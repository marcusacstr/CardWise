// src/app/api/upload-statement/route.ts

// This is a placeholder API route for handling CSV statement uploads.
// The actual file processing, AI analysis, and database storage logic
// will need to be implemented here using server-side code.

import { NextRequest, NextResponse } from 'next/server';
import { parseCSVStatements } from '@/lib/csvParser';
import { analyzeTransactions } from '@/lib/transactionAnalyzer';
import { generateCardRecommendations } from '@/lib/cardRecommendations';
import { 
  generateEnhancedRecommendations, 
  SpendingProfile 
} from '@/lib/enhancedCardRecommendations';
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
    console.log('[API DEBUG] File type:', typeof file, 'constructor:', file.constructor.name);

    // Read file content with multiple fallbacks
    let csvContent: string;
    try {
      if (typeof file.text === 'function') {
        csvContent = await file.text();
        console.log('[API DEBUG] Used file.text(), result type:', typeof csvContent);
      } else if (typeof file.arrayBuffer === 'function') {
        const buffer = await file.arrayBuffer();
        csvContent = new TextDecoder('utf-8').decode(buffer);
        console.log('[API DEBUG] Used arrayBuffer + TextDecoder, result type:', typeof csvContent);
      } else {
        throw new Error('No supported method to read file content');
      }
      
      // Ensure we have a string
      if (typeof csvContent !== 'string') {
        csvContent = String(csvContent);
        console.log('[API DEBUG] Converted to string, new type:', typeof csvContent);
      }
      
      console.log('[API DEBUG] Final csvContent type:', typeof csvContent, 'length:', csvContent.length);
      console.log('[API DEBUG] Content preview:', csvContent.slice(0, 200));
      
    } catch (error) {
      console.error('[API DEBUG] Error reading file:', error);
      return NextResponse.json({ 
        error: 'Failed to read file content', 
        details: error instanceof Error ? error.message : String(error) 
      }, { status: 400 });
    }
    
    // Parse CSV with statement period extraction
    const parseResult = await parseCSVStatements(csvContent);
    
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

    // Analyze transactions with statement period information
    const spendingAnalysis = analyzeTransactions(parseResult.transactions, parseResult.statementPeriod);
    console.log('Spending analysis completed');
    console.log('Category breakdown:', spendingAnalysis.categoryBreakdown.map(c => `${c.category}: $${c.amount} (${c.percentage}%)`));

    // Generate enhanced card recommendations
    const enhancedProfile: SpendingProfile = {
      annual_income: 50000, // Default assumption
      credit_score: 'good',
      monthly_spending: {
        groceries: spendingAnalysis.categoryBreakdown.find(c => c.category === 'Groceries')?.amount || 0,
        dining: spendingAnalysis.categoryBreakdown.find(c => c.category === 'Dining')?.amount || 0,
        travel: spendingAnalysis.categoryBreakdown.find(c => c.category === 'Travel')?.amount || 0,
        gas: spendingAnalysis.categoryBreakdown.find(c => c.category === 'Gas')?.amount || 0,
        streaming: spendingAnalysis.categoryBreakdown.find(c => c.category === 'Streaming')?.amount || 0,
        general: spendingAnalysis.totalSpent || 0
      },
      travel_frequency: 'occasionally',
      redemption_preference: 'flexible',
      current_cards: [],
      monthly_payment_behavior: 'full',
      signup_bonus_importance: 'medium'
    };

    const enhancedRecommendations = await generateEnhancedRecommendations(enhancedProfile, 5);
    console.log(`Generated ${enhancedRecommendations.length} enhanced card recommendations`);
    
    // Also keep basic recommendations for fallback
    const cardRecommendations = await generateCardRecommendations(spendingAnalysis);

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
      recommendations: enhancedRecommendations.map(rec => ({
        card: {
          id: rec.card.id,
          name: rec.card.name,
          issuer: rec.card.issuer,
          annual_fee: rec.card.annual_fee,
          image_url: rec.card.image_url,
          application_url: rec.card.application_url
        },
        annual_value: Math.round(rec.annual_value),
        net_annual_benefit: Math.round(rec.net_annual_benefit),
        first_year_value: Math.round(rec.first_year_value),
        ai_confidence_score: Math.round(rec.ai_confidence_score),
        personalization_score: Math.round(rec.personalization_score),
        risk_factors: rec.risk_factors,
        optimization_tips: rec.optimization_tips,
        reasoning: rec.reasoning,
        category_breakdown: rec.category_breakdown
      })),
      basicRecommendations: cardRecommendations, // Keep basic ones as fallback
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