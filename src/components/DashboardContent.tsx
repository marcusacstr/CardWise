'use client';

import React, { useState, useEffect, useRef } from 'react';
import { parseCSVStatements } from '@/lib/csvParser';
import { parsePDFStatement } from '@/lib/pdfParser';
import { analyzeTransactions } from '@/lib/transactionAnalyzer';
import { generateCardRecommendations, saveUserRecommendations, calculateCurrentCardRewards } from '@/lib/cardRecommendations';
import { saveReport } from '@/lib/reportStorage';
import { saveUserSession, loadUserSession, updateLastActivity, resetCurrentCard, UserSessionData } from '@/lib/userSession';
import { testUserSessionsTable, getUserSessionCount } from '@/lib/testPersistence';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { FaUpload, FaEdit, FaChartLine, FaCreditCard, FaTimes, FaPlus, FaCalendarAlt, FaSignOutAlt, FaUser, FaCog, FaBuilding, FaCheck, FaFileAlt, FaToggleOn, FaToggleOff, FaInfoCircle, FaChevronDown, FaChevronUp, FaTrash, FaSync } from 'react-icons/fa';
import EnhancedRecommendations from '@/components/EnhancedRecommendations';
import StatementManager from '@/components/StatementManager';
import { useSpendingData } from '@/contexts/SpendingDataContext';

interface AnalysisResult {
  transactions: any[];
  analysis: any;
  recommendations: any[];
  currentCardRewards: number;
}

interface ManualSpendingEntry {
  category: string;
  amount: number;
}

interface CurrentCard {
  id?: string;
  name: string;
  issuer: string;
  annualFee: number;
  estimatedAnnualRewards: number;
  isCustom?: boolean;
}

export default function DashboardContent({ user }: { user: User | null }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use the spending data context
  const {
    data,
    loading: contextLoading,
    error: contextError,
    refreshStatements,
    addManualSpending,
    removeManualSpending,
    updateManualSpending,
    setAnalysis,
    setRecommendations,
    setCurrentCardRewards,
    addUploadedFile,
    removeUploadedFile,
    refreshAll,
    clearData
  } = useSpendingData();

  // Local state for UI
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [availableCards, setAvailableCards] = useState<any[]>([]);
  const [currentCard, setCurrentCard] = useState<CurrentCard>({
    name: 'Basic Visa Card',
    issuer: 'Generic Bank',
    annualFee: 0,
    estimatedAnnualRewards: 0,
    isCustom: false
  });
  const [showCardSelection, setShowCardSelection] = useState(false);
  const [showCustomCardEntry, setShowCustomCardEntry] = useState(false);
  const [cardSearchTerm, setCardSearchTerm] = useState('');
  const [customCard, setCustomCard] = useState({
    name: '',
    issuer: '',
    annualFee: '',
    estimatedAnnualRewards: ''
  });
  const [analysisTimePeriod, setAnalysisTimePeriod] = useState<'month' | 'ytd' | '12months'>('month');
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);
  const [persistenceTestResult, setPersistenceTestResult] = useState<any>(null);
  const [sessionCount, setSessionCount] = useState<number>(-1);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [partnerBranding, setPartnerBranding] = useState<{
    primaryColor: string
    companyName: string
    logoUrl?: string
  } | null>(null);
  
  // Enhanced AI System State
  const [useEnhancedAI, setUseEnhancedAI] = useState(true); // Always enabled
  const [statementRefreshKey, setStatementRefreshKey] = useState(0);

  const spendingCategories = [
    'Dining', 'Groceries', 'Gas', 'Transit', 'Travel', 'Streaming',
    'Department Stores', 'Drug Stores', 'Online Shopping', 'Other'
  ];

  // Initialize data when user changes
  useEffect(() => {
    if (user) {
      // Load user session data
      loadUserSessionData();
      
      // Check if user came from a partner portal
      const referrerParam = new URLSearchParams(window.location.search).get('partner');
      if (referrerParam || document.referrer.includes('/portal/')) {
        const partnerId = referrerParam || document.referrer.split('/portal/')[1]?.split('/')[0];
        if (partnerId) {
          fetchPartnerBranding(partnerId);
        }
      }
    }
  }, [user]);

  // Effect to clear analysis and session if no statements or manual spending
  useEffect(() => {
    const hasStatements = data.statements && data.statements.length > 0;
    const hasManualSpending = data.manualSpending && data.manualSpending.length > 0;
    
    if (!hasStatements && !hasManualSpending) {
      // Clear analysis data if no statements or manual spending
      setAnalysis(null);
      setRecommendations([]);
      setCurrentCardRewards(0);
      // Also clear uploaded files list when no statements remain
      if (data.uploadedFiles.length > 0) {
        data.uploadedFiles.forEach(file => removeUploadedFile(file));
      }
      // Aggressively clear user session in the database
      if (user) {
        import('@/lib/userSession').then(({ clearUserSession }) => {
          clearUserSession(user.id);
        });
      }
    }
  }, [data.statements, data.manualSpending, data.uploadedFiles, user]);

  // Load user session data
  const loadUserSessionData = async () => {
    if (!user) return;
    
    try {
      const sessionData = await loadUserSession(user.id);
      if (sessionData) {
        // Only load analysis/recommendations if there are statements or manual spending
        const hasStatements = data.statements && data.statements.length > 0;
        const hasManualSpending = sessionData.manualSpendingEntries && sessionData.manualSpendingEntries.length > 0;
        if (sessionData.manualSpendingEntries) {
          updateManualSpending(sessionData.manualSpendingEntries);
        }
        if (sessionData.currentCard) {
          setCurrentCard(sessionData.currentCard);
          setCurrentCardRewards(sessionData.currentCardRewards);
        }
        if (sessionData.uploadedFiles) {
          sessionData.uploadedFiles.forEach(file => addUploadedFile(file));
        }
        if ((hasStatements || hasManualSpending) && sessionData.latestAnalysis) {
          setAnalysis(sessionData.latestAnalysis);
        }
        if ((hasStatements || hasManualSpending) && sessionData.latestRecommendations) {
          setRecommendations(sessionData.latestRecommendations);
        }
      }
    } catch (err) {
      console.error('Error loading user session:', err);
    }
  };

  // Fetch partner branding
  const fetchPartnerBranding = async (partnerId: string) => {
    try {
      const { data, error } = await supabase
        .from('partner_portal_configs')
        .select('primary_color, company_name, logo_url')
        .eq('partner_id', partnerId)
        .single();
      
      if (data && !error) {
        setPartnerBranding({
          primaryColor: data.primary_color || '#10B981',
          companyName: data.company_name || 'CardWise',
          logoUrl: data.logo_url
        });
      }
    } catch (error) {
      console.log('No partner branding found, using default');
    }
  };

  // Fetch available cards
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const { data, error } = await supabase
          .from('credit_cards')
          .select(`
            id, 
            name, 
            issuer, 
            annual_fee, 
            base_earn_rate, 
            reward_type,
            point_value,
            groceries_earn_rate,
            dining_earn_rate,
            travel_earn_rate,
            gas_earn_rate,
            welcome_bonus,
            welcome_bonus_requirements,
            application_url,
            image_url,
            is_active,
            credit_score_requirement,
            foreign_transaction_fee,
            groceries_cap,
            dining_cap,
            travel_cap,
            gas_cap
          `)
          .eq('is_active', true)
          .order('name');
        
        if (error) {
          console.error('Supabase error fetching cards:', error);
          setError(`Failed to load credit cards: ${error.message}`);
        } else if (data) {
          console.log(`Loaded ${data.length} credit cards from database`);
          setAvailableCards(data);
          setError(null);
        } else {
          console.log('No active credit cards found in database');
          setError('No active credit cards available');
        }
      } catch (error) {
        console.error('Error fetching cards:', error);
        setError('Failed to load credit cards from database');
      }
    };
    
    fetchCards();
  }, [supabase]);

  // File handling
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setLoading(true);
    setError(null);

    try {
      // Use the API route for file upload and processing
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload-statement', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process file');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to analyze file');
      }
      
      // Extract data from API response
      const analysis = result.analysis;
      const recommendations = result.recommendations;
      const currentCardRewards = result.analysis.totalSpent; // or calculate properly
      
      // Refresh all data to get the saved statement FIRST
      await refreshAll();

      // Update context with new data AFTER refreshing
      setAnalysis(analysis);
      setRecommendations(recommendations);
      setCurrentCardRewards(currentCardRewards);
      addUploadedFile(file.name);

      // Clear the file input
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during upload');
    } finally {
      setLoading(false);
    }
  };

  // Manual spending management
  const addManualSpendingEntry = () => {
    if (newCategory && newAmount && parseFloat(newAmount) > 0) {
      addManualSpending({
        category: newCategory,
        amount: parseFloat(newAmount)
      });
      setNewCategory('');
      setNewAmount('');
    }
  };

  const removeManualSpendingEntry = (index: number) => {
    removeManualSpending(index);
  };

  const handleManualAnalysis = async () => {
    if (data.manualSpending.length === 0) {
      setError('Please add at least one spending entry');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create mock analysis from manual data
      const totalSpent = data.manualSpending.reduce((sum, entry) => sum + entry.amount, 0);
      const categoryBreakdown = data.manualSpending.reduce((acc, entry) => {
        const existing = acc.find(cat => cat.category === entry.category);
        if (existing) {
          existing.amount += entry.amount;
          existing.count += 1;
        } else {
          acc.push({
            category: entry.category,
            amount: entry.amount,
            count: 1,
            percentage: 0, // Will calculate below
            averageAmount: entry.amount,
            trend: 'stable' as const
          });
        }
        return acc;
      }, [] as any[]);

      // Calculate percentages
      categoryBreakdown.forEach(cat => {
        cat.percentage = (cat.amount / totalSpent) * 100;
        cat.averageAmount = cat.amount / cat.count;
      });

      const analysis = {
        totalSpent,
        totalEarned: 0,
        netSpending: totalSpent,
        transactionCount: data.manualSpending.length,
        averageTransactionAmount: totalSpent / data.manualSpending.length,
        categoryBreakdown: categoryBreakdown.sort((a, b) => b.amount - a.amount),
        monthlyTrends: [],
        merchantAnalysis: [],
        spendingInsights: [],
        topCategories: categoryBreakdown.slice(0, 5).map(cat => ({
          category: cat.category,
          amount: cat.amount,
          percentage: cat.percentage
        }))
      };

      // Calculate current card rewards based on spending data
      const currentCardRewardsData = await calculateCurrentCardRewards(analysis, currentCard.id);
      
      // Update current card with calculated rewards
      setCurrentCard(prev => ({
        ...prev,
        estimatedAnnualRewards: currentCardRewardsData.annualRewards
      }));

      // Get recommendations
      const recommendations = await generateCardRecommendations(analysis, currentCardRewardsData.annualRewards);

      // Update context with new data
      setAnalysis(analysis);
      setRecommendations(recommendations.recommendations);
      setCurrentCardRewards(currentCardRewardsData.annualRewards);

      setShowManualEntry(false);
    } catch (err) {
      setError('Failed to analyze manual spending data');
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  };

  const saveCurrentSession = async () => {
    if (!user) return;
    
    const sessionData: UserSessionData = {
      currentCard: {
        ...currentCard,
        isCustom: currentCard.isCustom || false
      },
      uploadedFiles: data.uploadedFiles,
      manualSpendingEntries: data.manualSpending,
      analysisTimePeriod: analysisTimePeriod,
      latestAnalysis: data.analysis,
      latestRecommendations: data.recommendations,
      currentCardRewards: data.currentCardRewards,
      monthlyRewardsData: data.monthlyRewardsData
    };
    
    await saveUserSession(user.id, sessionData);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Filter cards for search
  const filteredCards = availableCards.filter(card =>
    card.name.toLowerCase().includes(cardSearchTerm.toLowerCase()) ||
    card.issuer.toLowerCase().includes(cardSearchTerm.toLowerCase())
  );

  // Handle card selection
  const handleCardSelect = async (card: any) => {
    const newCard = {
      id: card.id,
      name: card.name,
      issuer: card.issuer,
      annualFee: card.annual_fee,
      estimatedAnnualRewards: 0, // Will be calculated below if analysis exists
      isCustom: false
    };
    
    setCurrentCard(newCard);
    setShowCardSelection(false);
    setCardSearchTerm('');
    
    // If we have existing analysis data, recalculate rewards for the new card
    if (data.analysis) {
      try {
        console.log('🔄 Recalculating rewards for new card:', card.name);
        
        // Calculate current card rewards based on existing spending data
        const currentCardRewardsData = await calculateCurrentCardRewards(data.analysis, card.id);
        
        // Update current card with calculated rewards
        const updatedCard = {
          ...newCard,
          estimatedAnnualRewards: currentCardRewardsData.annualRewards
        };
        
        setCurrentCard(updatedCard);
        setCurrentCardRewards(currentCardRewardsData.annualRewards);
        
        console.log('✅ Rewards recalculated:', currentCardRewardsData.annualRewards);
        
      } catch (err) {
        console.error('Error recalculating rewards:', err);
      }
    }
  };

  // Check if we have analysis data to show results
  const hasStatements = data.statements && data.statements.length > 0;
  const hasManualSpending = data.manualSpending && data.manualSpending.length > 0;
  // Show analysis if we have valid analysis data, regardless of statement fetch issues
  const hasAnalysisData = data.analysis && data.analysis.transactionCount > 0;
  
  // Debug logging
  console.log('🔍 Dashboard Debug:', {
    hasStatements,
    hasManualSpending,
    hasAnalysisData,
    statementsLength: data.statements?.length || 0,
    manualSpendingLength: data.manualSpending?.length || 0,
    hasAnalysis: !!data.analysis,
    analysisTransactionCount: data.analysis?.transactionCount || 0,
    analysisKeys: data.analysis ? Object.keys(data.analysis) : []
  });

  const forceRefresh = async () => {
    await refreshAll();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FaCreditCard className="text-green-600 text-2xl" />
                <h1 className="text-xl font-bold text-gray-900">
                  {partnerBranding?.companyName || 'CardWise'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => forceRefresh()}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 text-sm"
                title="Force refresh all data"
              >
                <FaSync className="text-gray-400" />
                <span>Refresh Data</span>
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  <FaUser className="text-gray-400" />
                  <span>{getUserDisplayName()}</span>
                  <FaChevronDown className="text-xs" />
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                    >
                      <FaSignOutAlt />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {getUserDisplayName()}!
          </h2>
          <p className="text-gray-600">
            Upload your credit card statements or enter spending manually to get personalized recommendations.
          </p>
        </div>

        {/* Upload Section */}
        {!hasAnalysisData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <div className="text-center">
              <FaUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Get Started with CardWise
              </h3>
              <p className="text-gray-600 mb-6">
                Upload your credit card statement or enter spending manually to receive personalized credit card recommendations.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Upload Statement
                </button>
                <button 
                  onClick={() => setShowManualEntry(true)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Manual Entry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* File Selected Confirmation */}
        {file && !hasAnalysisData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FaUpload className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">File Selected</h3>
                  <p className="text-sm text-gray-500">{file.name}</p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleUpload}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium flex-1"
              >
                {loading ? 'Processing...' : 'Analyze Transactions'}
              </button>
            </div>
          </div>
        )}

        {/* Statement Manager */}
        <div className="mb-8">
          <StatementManager 
            refreshTrigger={statementRefreshKey}
            onStatementDeleted={() => {
              setStatementRefreshKey(prev => prev + 1);
              console.log('Statement deleted successfully');
            }} 
          />
        </div>

        {/* Manual Entry Modal */}
        {showManualEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Enter Monthly Spending</h3>
                  <button
                    onClick={() => setShowManualEntry(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                <p className="text-gray-600 mb-6">
                  Add your monthly spending by category to get personalized credit card recommendations.
                </p>

                {/* Add new entry */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Add Spending Category</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Category</option>
                      {spendingCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Monthly Amount ($)"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      onClick={addManualSpendingEntry}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
                    >
                      <FaPlus className="text-sm" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Current entries */}
                {data.manualSpending.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Your Spending Entries</h4>
                    <div className="space-y-2">
                      {data.manualSpending.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900">{entry.category}</span>
                            <span className="text-gray-500 ml-2">{formatCurrency(entry.amount)}/month</span>
                          </div>
                          <button
                            onClick={() => removeManualSpendingEntry(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-green-800 font-medium">
                        Total Monthly Spending: {formatCurrency(data.manualSpending.reduce((sum, entry) => sum + entry.amount, 0))}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleManualAnalysis}
                    disabled={data.manualSpending.length === 0 || loading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium flex-1"
                  >
                    {loading ? 'Analyzing...' : 'Analyze Spending'}
                  </button>
                  <button
                    onClick={() => setShowManualEntry(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {(error || contextError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">{error || contextError}</p>
          </div>
        )}

        {/* Analysis Results */}
        {hasAnalysisData && (
          <div className="mb-8 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Your Spending Analysis</h3>
                
                {/* Time Period Selector */}
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt className="text-gray-400" />
                  <select
                    value={analysisTimePeriod}
                    onChange={(e) => setAnalysisTimePeriod(e.target.value as 'month' | 'ytd' | '12months')}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="month">This Month</option>
                    <option value="ytd">Year to Date</option>
                    <option value="12months">Last 12 Months</option>
                  </select>
                </div>
              </div>
              
              {/* Period Display */}
              <div className="mb-4 text-sm text-gray-600">
                {analysisTimePeriod === 'month' && 'Showing current month analysis'}
                {analysisTimePeriod === 'ytd' && 'Showing year-to-date analysis'}
                {analysisTimePeriod === '12months' && 'Showing 12-month analysis'}
              </div>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                  <p className="text-sm font-medium opacity-90">Total Transactions</p>
                  <p className="text-2xl font-bold">{data.analysis.transactionCount}</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
                  <p className="text-sm font-medium opacity-90">Total Spent</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      analysisTimePeriod === '12months' ? data.analysis.totalSpent * 12 :
                      analysisTimePeriod === 'ytd' ? data.analysis.totalSpent * (new Date().getMonth() + 1) :
                      data.analysis.totalSpent
                    )}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
                  <p className="text-sm font-medium opacity-90">Avg Transaction</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.analysis.averageTransactionAmount)}</p>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
                  <p className="text-sm font-medium opacity-90">Top Category</p>
                  <p className="text-lg font-bold">{data.analysis.categoryBreakdown[0]?.category || 'N/A'}</p>
                  <p className="text-sm opacity-90">
                    {formatCurrency(
                      analysisTimePeriod === '12months' ? (data.analysis.categoryBreakdown[0]?.amount || 0) * 12 :
                      analysisTimePeriod === 'ytd' ? (data.analysis.categoryBreakdown[0]?.amount || 0) * (new Date().getMonth() + 1) :
                      data.analysis.categoryBreakdown[0]?.amount || 0
                    )}
                  </p>
                </div>
              </div>

              {/* Category Breakdown */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.analysis.categoryBreakdown
                    .sort((a, b) => b.amount - a.amount)
                    .map((category, index) => {
                      const adjustedAmount = 
                        analysisTimePeriod === '12months' ? category.amount * 12 :
                        analysisTimePeriod === 'ytd' ? category.amount * (new Date().getMonth() + 1) :
                        category.amount;
                      
                      return (
                        <div key={category.category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-gray-900">{category.category}</span>
                              <span className="text-sm text-gray-500">{category.percentage.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-green-600">{formatCurrency(adjustedAmount)}</span>
                              <span className="text-sm text-gray-500">({category.count} transactions)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${category.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Enhanced Recommendations */}
            {data.recommendations.length > 0 && (
              <EnhancedRecommendations
                transactions={data.analysis?.transactions || []}
                userProfile={{
                  annual_income: 75000,
                  credit_score: 'good',
                  monthly_spending: {
                    groceries: data.analysis?.categoryBreakdown?.find(c => c.category === 'Groceries')?.amount || 0,
                    dining: data.analysis?.categoryBreakdown?.find(c => c.category === 'Dining')?.amount || 0,
                    travel: data.analysis?.categoryBreakdown?.find(c => c.category === 'Travel')?.amount || 0,
                    gas: data.analysis?.categoryBreakdown?.find(c => c.category === 'Gas')?.amount || 0,
                    streaming: data.analysis?.categoryBreakdown?.find(c => c.category === 'Streaming')?.amount || 0,
                    general: data.analysis?.totalSpent || 0
                  },
                  travel_frequency: 'occasionally',
                  redemption_preference: 'flexible',
                  current_cards: [],
                  monthly_payment_behavior: 'full',
                  signup_bonus_importance: 'medium'
                }}
                onRecommendationSelect={handleCardSelect}
              />
            )}
          </div>
        )}

        {/* Hidden file input */}
        <input
          id="file-upload"
          ref={fileInputRef}
          type="file"
          accept=".csv,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </main>
    </div>
  );
} 