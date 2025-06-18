import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

export interface UserSessionData {
  currentCard: {
    id?: string;
    name: string;
    issuer: string;
    annualFee: number;
    estimatedAnnualRewards: number;
    isCustom: boolean;
  };
  uploadedFiles: string[];
  manualSpendingEntries: {
    category: string;
    amount: number;
  }[];
  analysisTimePeriod: 'month' | 'ytd' | '12months';
  latestAnalysis: any;
  latestRecommendations: any[];
  currentCardRewards: number;
  monthlyRewardsData: {
    months: string[];
    currentCardRewards: number[];
    recommendedCardRewards: number[];
  };
}

export async function saveUserSession(userId: string, sessionData: UserSessionData): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .upsert({
        user_id: userId,
        current_card_id: sessionData.currentCard.id || null,
        current_card_name: sessionData.currentCard.name,
        current_card_issuer: sessionData.currentCard.issuer,
        current_card_annual_fee: sessionData.currentCard.annualFee,
        current_card_estimated_rewards: sessionData.currentCard.estimatedAnnualRewards,
        current_card_is_custom: sessionData.currentCard.isCustom,
        uploaded_files: sessionData.uploadedFiles,
        manual_spending_entries: sessionData.manualSpendingEntries,
        analysis_time_period: sessionData.analysisTimePeriod,
        latest_analysis: sessionData.latestAnalysis,
        latest_recommendations: sessionData.latestRecommendations,
        current_card_rewards: sessionData.currentCardRewards,
        monthly_rewards_data: sessionData.monthlyRewardsData,
        last_activity: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving user session:', error);
      // If table doesn't exist, don't throw error - just log it
      if (error.code === '42P01') {
        console.warn('user_sessions table not found - session persistence disabled');
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Failed to save user session:', error);
    // Don't throw for session save failures to avoid breaking the app
  }
}

export async function loadUserSession(userId: string): Promise<UserSessionData | null> {
  try {
    console.log('🔍 Loading session for user:', userId);
    
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no session exists, that's okay - return null
      if (error.code === 'PGRST116') {
        console.log('📝 No existing session found for user');
        return null;
      }
      // If table doesn't exist, return null
      if (error.code === '42P01') {
        console.warn('⚠️ user_sessions table not found - session persistence disabled');
        return null;
      }
      console.error('❌ Error loading user session:', error);
      return null;
    }

    if (!data) {
      console.log('📝 No session data returned');
      return null;
    }

    console.log('✅ Session data loaded successfully:', {
      cardName: data.current_card_name,
      filesCount: data.uploaded_files?.length || 0,
      hasAnalysis: !!data.latest_analysis
    });

    return {
      currentCard: {
        id: data.current_card_id,
        name: data.current_card_name || 'Basic Visa Card',
        issuer: data.current_card_issuer || 'Generic Bank',
        annualFee: data.current_card_annual_fee || 0,
        estimatedAnnualRewards: data.current_card_estimated_rewards || 0,
        isCustom: data.current_card_is_custom || false
      },
      uploadedFiles: data.uploaded_files || [],
      manualSpendingEntries: data.manual_spending_entries || [],
      analysisTimePeriod: data.analysis_time_period || 'month',
      latestAnalysis: data.latest_analysis || null,
      latestRecommendations: data.latest_recommendations || [],
      currentCardRewards: data.current_card_rewards || 0,
      monthlyRewardsData: data.monthly_rewards_data || {
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        currentCardRewards: [],
        recommendedCardRewards: []
      }
    };
  } catch (error) {
    console.error('❌ Failed to load user session:', error);
    return null;
  }
}

export async function clearUserSession(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error clearing user session:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to clear user session:', error);
    throw error;
  }
}

export async function updateLastActivity(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .update({
        last_activity: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating last activity:', error);
      // Don't throw here as this is not critical
    }
  } catch (error) {
    console.error('Failed to update last activity:', error);
    // Don't throw here as this is not critical
  }
}

export async function resetCurrentCard(userId: string): Promise<void> {
  try {
    console.log('🔄 Resetting current card to default for user:', userId);
    
    const { error } = await supabase
      .from('user_sessions')
      .update({
        current_card_id: null,
        current_card_name: 'Basic Visa Card',
        current_card_issuer: 'Generic Bank',
        current_card_annual_fee: 0,
        current_card_estimated_rewards: 0,
        current_card_is_custom: false,
        last_activity: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error resetting current card:', error);
      throw error;
    }
    
    console.log('✅ Current card reset successfully');
  } catch (error) {
    console.error('❌ Failed to reset current card:', error);
    throw error;
  }
} 