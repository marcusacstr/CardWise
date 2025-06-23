'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';

interface SpendingData {
  statements: any[];
  manualSpending: ManualSpendingEntry[];
  analysis: any | null;
  recommendations: any[];
  currentCardRewards: number;
  monthlyRewardsData: {
    months: string[];
    currentCardRewards: number[];
    recommendedCardRewards: number[];
  };
  recentReports: any[];
  uploadedFiles: string[];
}

interface ManualSpendingEntry {
  category: string;
  amount: number;
}

interface SpendingDataContextType {
  data: SpendingData;
  loading: boolean;
  error: string | null;
  refreshStatements: () => Promise<void>;
  addManualSpending: (entry: ManualSpendingEntry) => void;
  removeManualSpending: (index: number) => void;
  updateManualSpending: (entries: ManualSpendingEntry[]) => void;
  setAnalysis: (analysis: any) => void;
  setRecommendations: (recommendations: any[]) => void;
  setCurrentCardRewards: (rewards: number) => void;
  addUploadedFile: (filename: string) => void;
  removeUploadedFile: (filename: string) => void;
  refreshAll: () => Promise<void>;
  clearData: () => void;
  forceRefresh: () => Promise<void>;
}

const defaultData: SpendingData = {
  statements: [],
  manualSpending: [],
  analysis: null,
  recommendations: [],
  currentCardRewards: 0,
  monthlyRewardsData: {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    currentCardRewards: [],
    recommendedCardRewards: []
  },
  recentReports: [],
  uploadedFiles: []
};

const SpendingDataContext = createContext<SpendingDataContextType | undefined>(undefined);

export function SpendingDataProvider({ children, user }: { children: React.ReactNode; user: User | null }) {
  const [data, setData] = useState<SpendingData>(defaultData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  // Fetch statements from API
  const fetchStatements = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/delete-statement');
      
      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 500 && errorText.includes('42P01')) {
          setError('Database table not set up yet. Please contact support.');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const responseData = await response.json();
      
      if (responseData.error) {
        setError(responseData.error);
        return;
      }
      
      const statements = responseData.statements || [];
      
      setData(prev => ({
        ...prev,
        statements
      }));
      
      // Clear analysis data if no statements remain
      if (statements.length === 0) {
        console.log('🗑️ No statements found, clearing all analysis data');
        setData(prev => ({
          ...prev,
          analysis: null,
          recommendations: [],
          currentCardRewards: 0,
          uploadedFiles: []
        }));
        
        // Also clear session data from database
        try {
          const { clearUserSession } = await import('@/lib/userSession');
          await clearUserSession(user.id);
          console.log('🗑️ Cleared user session data');
        } catch (sessionError) {
          console.warn('Could not clear session data:', sessionError);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching statements:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch statements';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch recent reports
  const fetchRecentReports = useCallback(async () => {
    if (!user) return;
    
    try {
      const { getUserReports } = await import('@/lib/reportStorage');
      const reports = await getUserReports(user.id);
      setData(prev => ({
        ...prev,
        recentReports: reports.slice(0, 5)
      }));
    } catch (err) {
      console.error('Error fetching recent reports:', err);
    }
  }, [user]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchStatements(),
      fetchRecentReports()
    ]);
  }, [fetchStatements, fetchRecentReports]);

  // Manual spending management
  const addManualSpending = useCallback((entry: ManualSpendingEntry) => {
    setData(prev => ({
      ...prev,
      manualSpending: [...prev.manualSpending, entry]
    }));
  }, []);

  const removeManualSpending = useCallback((index: number) => {
    setData(prev => ({
      ...prev,
      manualSpending: prev.manualSpending.filter((_, i) => i !== index)
    }));
  }, []);

  const updateManualSpending = useCallback((entries: ManualSpendingEntry[]) => {
    setData(prev => ({
      ...prev,
      manualSpending: entries
    }));
  }, []);

  // Analysis and recommendations management
  const setAnalysis = useCallback((analysis: any) => {
    setData(prev => ({
      ...prev,
      analysis
    }));
  }, []);

  const setRecommendations = useCallback((recommendations: any[]) => {
    setData(prev => ({
      ...prev,
      recommendations
    }));
  }, []);

  const setCurrentCardRewards = useCallback((rewards: number) => {
    setData(prev => ({
      ...prev,
      currentCardRewards: rewards
    }));
  }, []);

  // File management
  const addUploadedFile = useCallback((filename: string) => {
    setData(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, filename]
    }));
  }, []);

  const removeUploadedFile = useCallback((filename: string) => {
    setData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter(f => f !== filename)
    }));
  }, []);

  // Clear all data
  const clearData = useCallback(() => {
    setData(defaultData);
    setError(null);
  }, []);

  // Force refresh - completely reset all data
  const forceRefresh = useCallback(async () => {
    if (!user) return;
    
    console.log('🔄 Force refreshing all data');
    
    // Clear all local data
    setData(defaultData);
    setError(null);
    
    // Clear session data from database
    try {
      const { clearUserSession } = await import('@/lib/userSession');
      await clearUserSession(user.id);
      console.log('🗑️ Cleared user session data');
    } catch (sessionError) {
      console.warn('Could not clear session data:', sessionError);
    }
    
    // Refresh all data
    await refreshAll();
  }, [user, refreshAll]);

  // Initial data load
  useEffect(() => {
    if (user) {
      refreshAll();
    }
  }, [user, refreshAll]);

  const contextValue: SpendingDataContextType = {
    data,
    loading,
    error,
    refreshStatements: fetchStatements,
    addManualSpending,
    removeManualSpending,
    updateManualSpending,
    setAnalysis,
    setRecommendations,
    setCurrentCardRewards,
    addUploadedFile,
    removeUploadedFile,
    refreshAll,
    clearData,
    forceRefresh
  };

  return (
    <SpendingDataContext.Provider value={contextValue}>
      {children}
    </SpendingDataContext.Provider>
  );
}

export function useSpendingData() {
  const context = useContext(SpendingDataContext);
  if (context === undefined) {
    throw new Error('useSpendingData must be used within a SpendingDataProvider');
  }
  return context;
} 