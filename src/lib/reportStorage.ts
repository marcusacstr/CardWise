import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SpendingAnalysis } from './transactionAnalyzer';
import { RecommendationResult } from './cardRecommendations';

export interface StoredReport {
  id: string;
  user_id: string;
  title: string;
  month: number;
  year: number;
  date_range_start: string;
  date_range_end: string;
  total_spent: number;
  total_earned: number;
  net_spending: number;
  transaction_count: number;
  average_transaction_amount: number;
  category_breakdown: any[];
  monthly_trends: any[];
  merchant_analysis: any[];
  spending_insights: any[];
  top_categories: any[];
  card_recommendations: any[];
  file_name?: string;
  transactions_processed: number;
  created_at: string;
  updated_at: string;
}

export interface ReportSummary {
  id: string;
  title: string;
  month: number;
  year: number;
  total_spent: number;
  transaction_count: number;
  created_at: string;
}

// Extract month and year from spending analysis data
export function extractReportPeriod(analysis: SpendingAnalysis): { month: number; year: number; title: string } {
  // Use the monthly trends to determine the primary month/year
  if (analysis.monthlyTrends && analysis.monthlyTrends.length > 0) {
    // Get the most recent month from the data
    const latestMonth = analysis.monthlyTrends[analysis.monthlyTrends.length - 1];
    const month = new Date(`${latestMonth.month} 1, ${latestMonth.year}`).getMonth() + 1;
    const year = latestMonth.year;
    const title = `${latestMonth.month} ${year} Spending Report`;
    return { month, year, title };
  }
  
  // Fallback to current date if no monthly trends
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const monthName = now.toLocaleDateString('en-US', { month: 'long' });
  const title = `${monthName} ${year} Spending Report`;
  
  return { month, year, title };
}

// Extract date range from spending analysis
export function extractDateRange(analysis: SpendingAnalysis): { start: Date; end: Date } {
  // Try to extract from monthly trends if available
  if (analysis.monthlyTrends && analysis.monthlyTrends.length > 0) {
    const trends = analysis.monthlyTrends;
    const earliestTrend = trends[0];
    const latestTrend = trends[trends.length - 1];
    
    const start = new Date(earliestTrend.year, new Date(`${earliestTrend.month} 1, 2000`).getMonth(), 1);
    const end = new Date(latestTrend.year, new Date(`${latestTrend.month} 1, 2000`).getMonth() + 1, 0);
    
    return { start, end };
  }
  
  // Fallback to current date if no monthly trends
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return { start, end };
}

// Save a report to the database
export async function saveReport(
  analysis: SpendingAnalysis,
  recommendations: RecommendationResult,
  fileName?: string,
  userId?: string
): Promise<StoredReport | null> {
  const supabase = createClientComponentClient();
  
  try {
    // Get current user if not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      userId = user.id;
    }
    
    const { month, year, title } = extractReportPeriod(analysis);
    const { start, end } = extractDateRange(analysis);
    
    const reportData = {
      user_id: userId,
      title,
      month,
      year,
      date_range_start: start.toISOString().split('T')[0],
      date_range_end: end.toISOString().split('T')[0],
      total_spent: analysis.totalSpent,
      total_earned: analysis.totalEarned,
      net_spending: analysis.netSpending,
      transaction_count: analysis.transactionCount,
      average_transaction_amount: analysis.averageTransactionAmount,
      category_breakdown: analysis.categoryBreakdown,
      monthly_trends: analysis.monthlyTrends,
      merchant_analysis: analysis.merchantAnalysis,
      spending_insights: analysis.spendingInsights,
      top_categories: analysis.topCategories,
      card_recommendations: recommendations.recommendations,
      file_name: fileName,
      transactions_processed: analysis.transactionCount
    };
    
    // Try to insert, if duplicate exists, update instead
    const { data, error } = await supabase
      .from('reports')
      .upsert(reportData, {
        onConflict: 'user_id,year,month',
        ignoreDuplicates: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving report:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in saveReport:', error);
    return null;
  }
}

// Get all reports for a user
export async function getUserReports(userId?: string): Promise<ReportSummary[]> {
  const supabase = createClientComponentClient();
  
  try {
    let query = supabase
      .from('reports')
      .select('id, title, month, year, total_spent, transaction_count, created_at')
      .order('year', { ascending: false })
      .order('month', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getUserReports:', error);
    return [];
  }
}

// Get a specific report by ID
export async function getReport(reportId: string): Promise<StoredReport | null> {
  const supabase = createClientComponentClient();
  
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();
    
    if (error) {
      console.error('Error fetching report:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getReport:', error);
    return null;
  }
}

// Delete a report
export async function deleteReport(reportId: string): Promise<boolean> {
  const supabase = createClientComponentClient();
  
  try {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId);
    
    if (error) {
      console.error('Error deleting report:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteReport:', error);
    return false;
  }
}

// Get reports for chart data (last 12 months)
export async function getReportsForChart(userId?: string): Promise<{ month: string; year: number; totalSpent: number }[]> {
  const supabase = createClientComponentClient();
  
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    
    let query = supabase
      .from('reports')
      .select('month, year, total_spent')
      .gte('date_range_start', twelveMonthsAgo.toISOString().split('T')[0])
      .order('year', { ascending: true })
      .order('month', { ascending: true });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching chart data:', error);
      return [];
    }
    
    return (data || []).map(report => ({
      month: new Date(2000, report.month - 1).toLocaleDateString('en-US', { month: 'short' }),
      year: report.year,
      totalSpent: report.total_spent
    }));
  } catch (error) {
    console.error('Error in getReportsForChart:', error);
    return [];
  }
}

// Get statements for chart data based on statement periods (last 12 months)
export async function getStatementsForChart(userId?: string): Promise<{ month: string; year: number; totalSpent: number; statementPeriod: string }[]> {
  const supabase = createClientComponentClient();
  
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    
    let query = supabase
      .from('user_statements')
      .select('statement_period_start, statement_period_end, total_amount, bank_name')
      .gte('statement_period_start', twelveMonthsAgo.toISOString())
      .order('statement_period_start', { ascending: true });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching statement chart data:', error);
      return [];
    }
    
    return (data || [])
      .filter(statement => statement.statement_period_start && statement.total_amount)
      .map(statement => {
        const statementDate = new Date(statement.statement_period_start);
        return {
          month: statementDate.toLocaleDateString('en-US', { month: 'short' }),
          year: statementDate.getFullYear(),
          totalSpent: statement.total_amount,
          statementPeriod: statement.statement_period_start && statement.statement_period_end 
            ? `${new Date(statement.statement_period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(statement.statement_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
            : 'N/A'
        };
      });
  } catch (error) {
    console.error('Error in getStatementsForChart:', error);
    return [];
  }
} 