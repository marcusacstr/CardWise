'use client';

import React, { useState, useEffect } from 'react';
import { parseCSVStatements } from '@/lib/csvParser';
import { parsePDFStatement } from '@/lib/pdfParser';
import { analyzeTransactions } from '@/lib/transactionAnalyzer';
import { generateCardRecommendations, saveUserRecommendations, calculateCurrentCardRewards } from '@/lib/cardRecommendations';
import { saveReport, getUserReports } from '@/lib/reportStorage';
import { saveUserSession, loadUserSession, updateLastActivity, resetCurrentCard, UserSessionData } from '@/lib/userSession';
import { testUserSessionsTable, getUserSessionCount } from '@/lib/testPersistence';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { FaUpload, FaEdit, FaChartLine, FaCreditCard, FaTimes, FaPlus, FaCalendarAlt, FaSignOutAlt, FaUser, FaCog, FaBuilding, FaCheck } from 'react-icons/fa';
import EnhancedRecommendations from '@/components/EnhancedRecommendations';
import StatementManager from '@/components/StatementManager';

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

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualSpending, setManualSpending] = useState<ManualSpendingEntry[]>([]);
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
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [monthlyRewardsData, setMonthlyRewardsData] = useState<{
    months: string[];
    currentCardRewards: number[];
    recommendedCardRewards: number[];
  }>({
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    currentCardRewards: [],
    recommendedCardRewards: []
  });
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

  const spendingCategories = [
    'Dining', 'Groceries', 'Gas', 'Transit', 'Travel', 'Streaming',
    'Department Stores', 'Drug Stores', 'Online Shopping', 'Other'
  ];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Fetch recent reports
        const reports = await getUserReports(user.id);
        setRecentReports(reports.slice(0, 5));
        
        // Check if user came from a partner portal
        const referrerParam = new URLSearchParams(window.location.search).get('partner');
        if (referrerParam || document.referrer.includes('/portal/')) {
          // Try to detect partner branding
          const partnerId = referrerParam || document.referrer.split('/portal/')[1]?.split('/')[0];
          if (partnerId) {
            fetchPartnerBranding(partnerId);
          }
        }
      }
    };
    
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
    
    getUser();
    fetchCards();
  }, [supabase]);

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

  // Separate useEffect for loading user session data when user changes
  useEffect(() => {
    const loadUserSessionData = async () => {
      if (!user) {
        // Reset to defaults when user logs out
        setCurrentCard({
          name: 'Basic Visa Card',
          issuer: 'Generic Bank',
          annualFee: 0,
          estimatedAnnualRewards: 0,
          isCustom: false
        });
        setUploadedFiles([]);
        setManualSpending([]);
        setAnalysisTimePeriod('month');
        setResult(null);
        setMonthlyRewardsData({
          months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          currentCardRewards: [],
          recommendedCardRewards: []
        });
        return;
      }

      // Load user session data when user logs in
      try {
        console.log('Loading user session data for user:', user.id);
        const sessionData = await loadUserSession(user.id);
        if (sessionData) {
          console.log('✅ Loading saved user session data', sessionData);
          
          // Restore current card
          setCurrentCard(sessionData.currentCard);
          
          // Restore uploaded files
          setUploadedFiles(sessionData.uploadedFiles);
          
          // Restore manual spending entries
          setManualSpending(sessionData.manualSpendingEntries);
          
          // Restore analysis time period
          setAnalysisTimePeriod(sessionData.analysisTimePeriod);
          
          // Restore monthly rewards data
          setMonthlyRewardsData(sessionData.monthlyRewardsData);
          
          // Restore analysis results if they exist
          if (sessionData.latestAnalysis && sessionData.latestRecommendations.length > 0) {
            setResult({
              transactions: [], // We don't store raw transactions in session
              analysis: sessionData.latestAnalysis,
              recommendations: sessionData.latestRecommendations,
              currentCardRewards: sessionData.currentCardRewards
            });
          }
          
          // Update last activity
          await updateLastActivity(user.id);
        } else {
          console.log('No existing session data found for user');
        }
      } catch (error) {
        console.warn('Failed to load user session:', error);
        // Continue with default state if session loading fails
      }
    };

    loadUserSessionData();
  }, [user]); // This effect runs when user changes

  // Recalculate current card rewards when analysis time period changes
  useEffect(() => {
    if (result?.analysis && currentCard.id) {
      const recalculateRewardsForTimePeriod = async () => {
        try {
          console.log('🔄 Recalculating rewards for time period change:', analysisTimePeriod);
          
          const currentCardRewardsData = await calculateCurrentCardRewards(result.analysis, currentCard.id);
          
          setCurrentCard(prev => ({
            ...prev,
            estimatedAnnualRewards: currentCardRewardsData.annualRewards
          }));
          
          setResult(prev => prev ? {
            ...prev,
            currentCardRewards: currentCardRewardsData.annualRewards
          } : null);
          
        } catch (error) {
          console.error('❌ Failed to recalculate rewards for time period:', error);
        }
      };
      
      recalculateRewardsForTimePeriod();
    }
  }, [analysisTimePeriod, result?.analysis, currentCard.id]);

  const refreshCards = async () => {
    try {
      setError(null);
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
        console.error('Supabase error refreshing cards:', error);
        setError(`Failed to refresh credit cards: ${error.message}`);
      } else if (data) {
        console.log(`Refreshed ${data.length} credit cards from database`);
        setAvailableCards(data);
        setError(null);
      } else {
        console.log('No active credit cards found in database');
        setError('No active credit cards available');
      }
    } catch (error) {
      console.error('Error refreshing cards:', error);
      setError('Failed to refresh credit cards from database');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input clicked, event triggered');
    const selectedFile = event.target.files?.[0];
    if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.type === 'application/csv' || selectedFile.type === 'text/plain' || selectedFile.name.toLowerCase().endsWith('.csv'))) {
      console.log(`File accepted: ${selectedFile.name}, type: ${selectedFile.type}, size: ${selectedFile.size} bytes`);
      console.log('Setting file state:', selectedFile); setFile(selectedFile);
      setError(null);
    } else {
      setError(`Please select a valid CSV file. Selected file: ${selectedFile.name}, type: ${selectedFile.type}`);
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let parseResult;
      const fileExtension = file.name.toLowerCase().split('.').pop();
      
      if (fileExtension === 'pdf') {
        // Handle PDF files
        const arrayBuffer = await file.arrayBuffer();
        parseResult = await parsePDFStatement(arrayBuffer);
        
        if (parseResult.errors.length > 0) {
          console.warn('PDF parsing warnings:', parseResult.errors);
        }
        
        if (parseResult.transactions.length === 0) {
          throw new Error('No transactions found in the PDF file. Please ensure this is a credit card statement with transaction details.');
        }
      } else {
        // Handle CSV files (default)
        const csvText = await file.text();
        parseResult = parseCSVStatements(csvText);
        
        if (parseResult.transactions.length === 0) {
          throw new Error('No transactions found in the CSV file');
        }
      }

      // Analyze transactions
      const analysis = analyzeTransactions(parseResult.transactions);
      
      // Calculate current card rewards based on spending data
      const currentCardRewardsData = await calculateCurrentCardRewards(analysis, currentCard.id);
      
      // Update current card with calculated rewards
      setCurrentCard(prev => ({
        ...prev,
        estimatedAnnualRewards: currentCardRewardsData.annualRewards
      }));
      
      // Get recommendations
      const recommendations = await generateCardRecommendations(analysis, currentCardRewardsData.annualRewards);

      // Update monthly rewards data for chart (using current month data)
      const currentMonth = new Date().getMonth();
      const newCurrentRewards = [...monthlyRewardsData.currentCardRewards];
      const newRecommendedRewards = [...monthlyRewardsData.recommendedCardRewards];
      
      // Set current month data
      newCurrentRewards[currentMonth] = currentCardRewardsData.annualRewards / 12; // Monthly amount
      newRecommendedRewards[currentMonth] = recommendations.recommendations[0]?.annualRewards / 12 || 0;
      
      setMonthlyRewardsData(prev => ({
        ...prev,
        currentCardRewards: newCurrentRewards,
        recommendedCardRewards: newRecommendedRewards
      }));

      // Add to uploaded files list and clear file selection
      setUploadedFiles(prev => [...prev, file.name]);
      setFile(null);

      // Save report to database
      try {
        await saveReport(analysis, recommendations, file.name);
        
        // Also save user recommendations separately for quick access
        if (user) {
          await saveUserRecommendations(user.id, recommendations.recommendations);
          
          // Refresh reports list
          const reports = await getUserReports(user.id);
          setRecentReports(reports.slice(0, 5));
        }
      } catch (saveError) {
        console.warn('Failed to save report:', saveError);
      }

      setResult({
        transactions: parseResult.transactions,
        analysis,
        recommendations: recommendations.recommendations,
        currentCardRewards: currentCardRewardsData.annualRewards
      });

      // Manually save session after successful upload
      setTimeout(() => {
        if (user) {
          console.log('🔄 Manually saving session after file upload');
          saveCurrentSession();
        }
      }, 1000);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setLoading(false);
    }
  };

  const addManualSpendingEntry = () => {
    if (newCategory && newAmount && parseFloat(newAmount) > 0) {
      setManualSpending([...manualSpending, {
        category: newCategory,
        amount: parseFloat(newAmount)
      }]);
      setNewCategory('');
      setNewAmount('');
    }
  };

  const removeManualSpendingEntry = (index: number) => {
    setManualSpending(manualSpending.filter((_, i) => i !== index));
  };

  const handleManualAnalysis = async () => {
    if (manualSpending.length === 0) {
      setError('Please add at least one spending entry');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create mock analysis from manual data
      const totalSpent = manualSpending.reduce((sum, entry) => sum + entry.amount, 0);
      const categoryBreakdown = manualSpending.reduce((acc, entry) => {
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
        transactionCount: manualSpending.length,
        averageTransactionAmount: totalSpent / manualSpending.length,
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

      // Update monthly rewards data for chart (using current month data)
      const currentMonth = new Date().getMonth();
      const newCurrentRewards = [...monthlyRewardsData.currentCardRewards];
      const newRecommendedRewards = [...monthlyRewardsData.recommendedCardRewards];
      
      newCurrentRewards[currentMonth] = currentCardRewardsData.annualRewards / 12;
      newRecommendedRewards[currentMonth] = recommendations.recommendations[0]?.annualRewards / 12 || 0;
      
      setMonthlyRewardsData(prev => ({
        ...prev,
        currentCardRewards: newCurrentRewards,
        recommendedCardRewards: newRecommendedRewards
      }));

      setResult({
        transactions: [],
        analysis,
        recommendations: recommendations.recommendations,
        currentCardRewards: currentCardRewardsData.annualRewards
      });

      setShowManualEntry(false);
    } catch (err) {
      setError('Failed to analyze manual spending data');
    } finally {
      setLoading(false);
    }
  };

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

  const filteredCards = availableCards.filter(card =>
    card.name.toLowerCase().includes(cardSearchTerm.toLowerCase()) ||
    card.issuer.toLowerCase().includes(cardSearchTerm.toLowerCase())
  );

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
    if (result?.analysis) {
      try {
        console.log('🔄 Recalculating rewards for new card:', card.name);
        
        // Calculate current card rewards based on existing spending data
        const currentCardRewardsData = await calculateCurrentCardRewards(result.analysis, card.id);
        
        // Update current card with calculated rewards
        const updatedCard = {
          ...newCard,
          estimatedAnnualRewards: currentCardRewardsData.annualRewards
        };
        
        setCurrentCard(updatedCard);
        
        // Update monthly rewards data for chart
        const currentMonth = new Date().getMonth();
        const newCurrentRewards = [...monthlyRewardsData.currentCardRewards];
        newCurrentRewards[currentMonth] = currentCardRewardsData.annualRewards / 12;
        
        setMonthlyRewardsData(prev => ({
          ...prev,
          currentCardRewards: newCurrentRewards
        }));
        
        // Update the result with new current card rewards
        setResult(prev => prev ? {
          ...prev,
          currentCardRewards: currentCardRewardsData.annualRewards
        } : null);
        
        console.log('✅ Rewards recalculated:', currentCardRewardsData.annualRewards);
        
      } catch (error) {
        console.error('❌ Failed to recalculate rewards for new card:', error);
      }
    }
    
    // Manually save after card selection
    setTimeout(() => {
      if (user) {
        console.log('🔄 Manually saving session after card selection');
        saveCurrentSession();
      }
    }, 500);
  };

  const handleCustomCardSubmit = async () => {
    if (customCard.name && customCard.issuer) {
      const newCard = {
        name: customCard.name,
        issuer: customCard.issuer,
        annualFee: parseFloat(customCard.annualFee) || 0,
        estimatedAnnualRewards: parseFloat(customCard.estimatedAnnualRewards) || 0,
        isCustom: true
      };
      
      setCurrentCard(newCard);
      setShowCustomCardEntry(false);
      setCustomCard({ name: '', issuer: '', annualFee: '', estimatedAnnualRewards: '' });
      
      // If we have existing analysis data and user didn't provide rewards estimate, 
      // try to calculate rewards (though limited for custom cards)
      if (result?.analysis && !customCard.estimatedAnnualRewards) {
        try {
          console.log('🔄 Calculating estimated rewards for custom card:', customCard.name);
          
          // For custom cards, we can only estimate based on base earning rates
          // since we don't have detailed category rates in the database
          const totalSpent = result.analysis.totalSpent * 12; // Annualize
          const estimatedRewards = totalSpent * 0.01; // Assume 1% base rate
          
          const updatedCard = {
            ...newCard,
            estimatedAnnualRewards: estimatedRewards
          };
          
          setCurrentCard(updatedCard);
          
          // Update monthly rewards data for chart
          const currentMonth = new Date().getMonth();
          const newCurrentRewards = [...monthlyRewardsData.currentCardRewards];
          newCurrentRewards[currentMonth] = estimatedRewards / 12;
          
          setMonthlyRewardsData(prev => ({
            ...prev,
            currentCardRewards: newCurrentRewards
          }));
          
          // Update the result with new current card rewards
          setResult(prev => prev ? {
            ...prev,
            currentCardRewards: estimatedRewards
          } : null);
          
          console.log('✅ Estimated rewards calculated for custom card:', estimatedRewards);
          
        } catch (error) {
          console.error('❌ Failed to calculate rewards for custom card:', error);
        }
      }
      
      // Manually save after custom card creation
      setTimeout(() => {
        if (user) {
          console.log('🔄 Manually saving session after custom card creation');
          saveCurrentSession();
        }
      }, 500);
    }
  };

  // Save current session data to database
  const saveCurrentSession = async () => {
    if (!user) return;
    
    try {
      const sessionData: UserSessionData = {
        currentCard: {
          ...currentCard,
          isCustom: currentCard.isCustom || false // Ensure isCustom is always boolean
        },
        uploadedFiles,
        manualSpendingEntries: manualSpending,
        analysisTimePeriod,
        latestAnalysis: result?.analysis || null,
        latestRecommendations: result?.recommendations || [],
        currentCardRewards: result?.currentCardRewards || 0,
        monthlyRewardsData
      };
      
      console.log('💾 Saving user session data', sessionData);
      await saveUserSession(user.id, sessionData);
      console.log('✅ Session data saved successfully');
    } catch (error) {
      console.warn('❌ Failed to save user session:', error);
      // Don't show error to user as this is background functionality
    }
  };

  // Auto-save session when important state changes (with debouncing)
  useEffect(() => {
    if (!user) return;
    
    const timeoutId = setTimeout(() => {
      saveCurrentSession();
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timeoutId);
  }, [user, currentCard, uploadedFiles, manualSpending, analysisTimePeriod, result, monthlyRewardsData]);

  // Test persistence functionality
  const testPersistence = async () => {
    try {
      const testResult = await testUserSessionsTable();
      setPersistenceTestResult(testResult);
      
      const count = await getUserSessionCount();
      setSessionCount(count);
    } catch (error) {
      setPersistenceTestResult({
        tableExists: false,
        canRead: false,
        canWrite: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Reset current card to default
  const resetCurrentCardToDefault = async () => {
    if (!user) return;
    
    try {
      await resetCurrentCard(user.id);
      
      // Reset local state
      setCurrentCard({
        name: 'Basic Visa Card',
        issuer: 'Generic Bank',
        annualFee: 0,
        estimatedAnnualRewards: 0,
        isCustom: false
      });
      
      console.log('✅ Current card reset to default');
    } catch (error) {
      console.error('❌ Failed to reset current card:', error);
    }
  };

  // Generate sample data for testing
  const generateSampleData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create sample spending data
      const sampleSpending = [
        { category: 'Groceries', amount: 800 },
        { category: 'Gas', amount: 300 },
        { category: 'Dining', amount: 600 },
        { category: 'Travel', amount: 400 },
        { category: 'Shopping', amount: 500 },
        { category: 'Entertainment', amount: 200 },
        { category: 'Utilities', amount: 150 }
      ];

      const totalSpent = sampleSpending.reduce((sum, entry) => sum + entry.amount, 0);
      
      // Create category breakdown
      const categoryBreakdown = sampleSpending.map(entry => ({
        category: entry.category,
        amount: entry.amount,
        count: Math.floor(entry.amount / 50), // Estimate transaction count
        percentage: (entry.amount / totalSpent) * 100,
        averageAmount: entry.amount / Math.floor(entry.amount / 50),
        trend: 'stable' as const
      }));

      const analysis = {
        totalSpent,
        totalEarned: 0,
        netSpending: totalSpent,
        transactionCount: sampleSpending.length,
        averageTransactionAmount: totalSpent / sampleSpending.length,
        categoryBreakdown: categoryBreakdown.sort((a, b) => b.amount - a.amount),
        monthlyTrends: [],
        merchantAnalysis: [],
        spendingInsights: [
          {
            type: 'info' as const,
            title: 'High Grocery Spending',
            description: 'Your highest spending category is Groceries at $800/month',
            impact: 'medium' as const,
            actionable: true,
            recommendation: 'You could earn more rewards with a card that has grocery bonuses'
          },
          {
            type: 'positive' as const,
            title: 'Travel Rewards Opportunity',
            description: 'You spend $400/month on travel',
            impact: 'medium' as const,
            actionable: true,
            recommendation: 'Consider a travel rewards card for your travel spending'
          }
        ],
        topCategories: categoryBreakdown.slice(0, 5).map(cat => ({
          category: cat.category,
          amount: cat.amount,
          percentage: cat.percentage
        }))
      };

      // Calculate current card rewards
      const currentCardRewardsData = await calculateCurrentCardRewards(analysis, currentCard.id);
      
      // Update current card with calculated rewards
      setCurrentCard(prev => ({
        ...prev,
        estimatedAnnualRewards: currentCardRewardsData.annualRewards
      }));

      // Get recommendations
      const recommendations = await generateCardRecommendations(analysis, currentCardRewardsData.annualRewards);

      // Update monthly rewards data for chart
      const currentMonth = new Date().getMonth();
      const newCurrentRewards = [...monthlyRewardsData.currentCardRewards];
      const newRecommendedRewards = [...monthlyRewardsData.recommendedCardRewards];
      
      newCurrentRewards[currentMonth] = currentCardRewardsData.annualRewards / 12;
      newRecommendedRewards[currentMonth] = recommendations.recommendations[0]?.annualRewards / 12 || 0;
      
      setMonthlyRewardsData(prev => ({
        ...prev,
        currentCardRewards: newCurrentRewards,
        recommendedCardRewards: newRecommendedRewards
      }));

      setResult({
        transactions: [],
        analysis,
        recommendations: recommendations.recommendations,
        currentCardRewards: currentCardRewardsData.annualRewards
      });

    } catch (err) {
      console.error('Error generating sample data:', err);
      setError('Failed to generate sample data');
    } finally {
      setLoading(false);
    }
  };

  // Add sign out handler
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Branding variables
  const primaryColor = partnerBranding?.primaryColor || '#10B981';
  const companyName = partnerBranding?.companyName || 'CardWise';
  const logoUrl = partnerBranding?.logoUrl;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with User Menu */}
      <div className="bg-white shadow-sm border-b-4 sticky top-0 z-50" style={{ borderBottomColor: primaryColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Company Logo" 
                  className="h-8 w-8 mr-3 object-contain"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{ backgroundColor: primaryColor }}>
                  <span className="text-white font-bold text-sm">
                    {companyName === 'CardWise' ? 'CW' : companyName.charAt(0)}
                  </span>
                </div>
              )}
              <h1 className="text-xl font-bold" style={{ color: primaryColor }}>
                {companyName} Dashboard
              </h1>
            </div>

            {/* User Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <FaUser className="w-4 h-4" style={{ color: primaryColor }} />
                  </div>
                  <span className="text-sm font-medium">
                    {user.email?.split('@')[0]}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                      User Account
                    </div>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // Add settings functionality here
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <FaCog className="w-4 h-4" />
                        <span>Settings</span>
                      </div>
                    </button>
                    
                    <a
                      href="/partner/auth"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <FaBuilding className="w-4 h-4" />
                        <span>Become a Partner</span>
                      </div>
                    </a>
                    
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <FaSignOutAlt className="w-4 h-4" />
                        <span>Sign Out</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back{user ? `, ${user.email?.split('@')[0]}` : ''}!
              </h2>
              <p className="text-gray-600">
                Optimize your credit card rewards with AI-powered recommendations
              </p>
            </div>
            
            {/* Enhanced AI Toggle (Hidden) */}
            <div className="hidden">
              <span className="text-sm font-medium text-gray-700">Enhanced AI</span>
              <button
                onClick={() => setUseEnhancedAI(!useEnhancedAI)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  useEnhancedAI ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useEnhancedAI ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
              {useEnhancedAI && (
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                  🤖 AI-Powered
                </span>
              )}
            </div>
          </div>
          
          {/* AI Enhancement Description */}
          {useEnhancedAI && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🧠</span>
                <div>
                  <h3 className="font-semibold text-blue-900">Enhanced AI Analysis Active</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Using advanced algorithms with real-world point valuations, risk assessment, and personalized optimization tips.
                    Get more accurate recommendations based on actual redemption values.
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-blue-600">
                    <span>✓ Dynamic point valuations (0.6¢ - 2.2¢)</span>
                    <span>✓ Risk factor analysis</span>
                    <span>✓ Optimization strategies</span>
                    <span>✓ AI confidence scoring</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Debug Section - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-green-900">Debug Info</h4>
              <div className="flex space-x-2">
                <button
                  onClick={testPersistence}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                >
                  Test Persistence
                </button>
                <button
                  onClick={refreshCards}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                >
                  Refresh Cards
                </button>
                <button
                  onClick={resetCurrentCardToDefault}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                >
                  Reset Card
                </button>
              </div>
            </div>
            <div className="text-sm text-green-800 space-y-1">
              <p>Cards loaded: {availableCards.length}</p>
              <p>User authenticated: {user ? 'Yes' : 'No'}</p>
              {persistenceTestResult && (
                <div className="mt-2 p-2 bg-white rounded">
                  <p className="font-medium">Persistence Test Results:</p>
                  <p>Table exists: {persistenceTestResult.tableExists ? '✅' : '❌'}</p>
                  <p>Can read: {persistenceTestResult.canRead ? '✅' : '❌'}</p>
                  <p>Can write: {persistenceTestResult.canWrite ? '✅' : '❌'}</p>
                  {sessionCount >= 0 && <p>Total sessions: {sessionCount}</p>}
                  {persistenceTestResult.error && (
                    <p className="text-red-600 text-xs mt-1">Error: {persistenceTestResult.error}</p>
                  )}
                </div>
              )}
              <div className="mt-2 p-2 bg-yellow-50 rounded">
                <p className="font-medium text-xs">Current Session State:</p>
                <p className="text-xs">Current card: {currentCard.name}</p>
                <p className="text-xs">Uploaded files: {uploadedFiles.length}</p>
                <p className="text-xs">Has analysis: {result ? 'Yes' : 'No'}</p>
                <p className="text-xs">User ID: {user?.id ? user.id.substring(0, 8) + '...' : 'None'}</p>
              </div>
              {availableCards.length > 0 && (
                <div className="mt-2">
                  <p>Card issuers: {Array.from(new Set(availableCards.map(card => card.issuer))).join(', ')}</p>
                  <p>Reward types: {Array.from(new Set(availableCards.map(card => card.reward_type))).join(', ')}</p>
                  <p>Annual fees: ${Math.min(...availableCards.map(card => card.annual_fee))} - ${Math.max(...availableCards.map(card => card.annual_fee))}</p>
                </div>
              )}
              {availableCards.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-green-600 hover:text-green-800">
                    Show sample card data
                  </summary>
                  <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto">
                    {JSON.stringify(availableCards[0], null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )}

        {/* Upload Section - Only show if no result */}
        {!result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button
              onClick={() => { console.log('Upload button clicked, triggering file input'); const fileInput = document.getElementById('file-upload'); console.log('File input element:', fileInput); fileInput?.click(); }}
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-6 flex flex-col items-center space-y-2 transition-colors"
            >
              <FaUpload className="text-2xl" />
              <span className="text-lg font-semibold">Upload Statement</span>
              <span className="text-sm opacity-90">Get personalized recommendations</span>
            </button>
            <button 
              onClick={() => setShowManualEntry(true)}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg p-6 flex flex-col items-center space-y-2 transition-colors"
            >
              <FaEdit className="text-2xl" />
              <span className="text-lg font-semibold">Enter Spending Manually</span>
              <span className="text-sm text-gray-500">Quick analysis tool</span>
            </button>
            <button 
              onClick={generateSampleData}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6 flex flex-col items-center space-y-2 transition-colors disabled:opacity-50"
            >
              <FaChartLine className="text-2xl" />
              <span className="text-lg font-semibold">
                {loading ? 'Loading...' : 'Try Sample Data'}
              </span>
              <span className="text-sm opacity-90">Test all features</span>
            </button>
          </div>
        )}

        {/* File Selected Confirmation - Show when file is selected but not uploaded */}
        {file && !result && (
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
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleUpload}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium disabled:bg-gray-400 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FaUpload />
                    <span>Analyze File</span>
                  </>
                )}
              </button>
              <button
                onClick={() => { console.log('Upload button clicked, triggering file input'); const fileInput = document.getElementById('file-upload'); console.log('File input element:', fileInput); fileInput?.click(); }}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Change File
              </button>
            </div>
          </div>
        )}

        {/* Current Card Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Current Card</h3>
            <button
              onClick={() => setShowCardSelection(true)}
              className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center space-x-1"
            >
              <FaEdit className="text-xs" />
              <span>Change Card</span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                <FaCreditCard className="text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{currentCard.name}</p>
                <p className="text-sm text-gray-500">{currentCard.issuer} - {currentCard.annualFee === 0 ? 'Free' : `$${currentCard.annualFee}/year`}</p>
              </div>
            </div>
            <div className="text-right">
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentCard.estimatedAnnualRewards)}</p>
                <p className="text-sm text-gray-500">Annual Rewards</p>
              </div>
              {currentCard.estimatedAnnualRewards === 0 && (
                <div>
                  <p className="text-xs text-orange-600 mt-1">Upload spending data for calculation</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Selection Modal */}
        {showCardSelection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Select Your Current Card</h3>
                    <p className="text-sm text-gray-500">
                      {availableCards.length} cards available • {filteredCards.length} showing
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCardSelection(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                {/* Search Input */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search for your card..."
                    value={cardSearchTerm}
                    onChange={(e) => setCardSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Debug info - remove in production */}
                {availableCards.length === 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">No active credit cards found in database.</p>
                  </div>
                )}

                {/* Card List */}
                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                  {filteredCards.length === 0 && cardSearchTerm && (
                    <div className="text-center py-4 text-gray-500">
                      No cards found matching "{cardSearchTerm}"
                    </div>
                  )}
                  {filteredCards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => handleCardSelect(card)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{card.name}</div>
                          <div className="text-sm text-gray-600">
                            {card.issuer} • {card.annual_fee === 0 ? 'No Annual Fee' : `$${card.annual_fee}/year`}
                          </div>
                          
                          {/* Reward rates */}
                          <div className="text-xs text-gray-500 mt-1">
                            {card.base_earn_rate}x {card.reward_type} base rate
                            {card.dining_earn_rate && card.dining_earn_rate > card.base_earn_rate && (
                              <span> • {card.dining_earn_rate}x dining</span>
                            )}
                            {card.groceries_earn_rate && card.groceries_earn_rate > card.base_earn_rate && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                {card.groceries_earn_rate}x groceries
                              </span>
                            )}
                            {card.travel_earn_rate && card.travel_earn_rate > card.base_earn_rate && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                {card.travel_earn_rate}x travel
                              </span>
                            )}
                            {card.gas_earn_rate && card.gas_earn_rate > card.base_earn_rate && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                {card.gas_earn_rate}x gas
                              </span>
                            )}
                          </div>
                          
                          {/* Welcome bonus */}
                          {card.welcome_bonus && (
                            <div className="text-xs text-green-600 mt-1">
                              Welcome Bonus: {card.welcome_bonus}
                            </div>
                          )}
                          
                          {/* Credit score requirement */}
                          {card.credit_score_requirement && (
                            <div className="text-xs text-gray-500 mt-1">
                              Credit: {card.credit_score_requirement}
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-3 text-right">
                          {!card.is_active && (
                            <div className="text-xs text-red-500 mb-1">
                              Inactive
                            </div>
                          )}
                          {card.foreign_transaction_fee > 0 && (
                            <div className="text-xs text-orange-600">
                              {card.foreign_transaction_fee}% foreign fee
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom Card Option */}
                <div className="border-t pt-4">
                  <button
                    onClick={() => {
                      setShowCardSelection(false);
                      setShowCustomCardEntry(true);
                    }}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-gray-600 hover:text-green-700"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <FaPlus className="text-sm" />
                      <span className="font-medium">Card not listed? Add custom card</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Card Entry Modal */}
        {showCustomCardEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Add Custom Card</h3>
                  <button
                    onClick={() => setShowCustomCardEntry(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., Chase Freedom Unlimited"
                      value={customCard.name}
                      onChange={(e) => setCustomCard({ ...customCard, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issuer *</label>
                    <input
                      type="text"
                      placeholder="e.g., Chase, American Express, Citi"
                      value={customCard.issuer}
                      onChange={(e) => setCustomCard({ ...customCard, issuer: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Annual Fee</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={customCard.annualFee}
                      onChange={(e) => setCustomCard({ ...customCard, annualFee: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Annual Rewards</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={customCard.estimatedAnnualRewards}
                      onChange={(e) => setCustomCard({ ...customCard, estimatedAnnualRewards: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Your estimated annual rewards with current spending</p>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={handleCustomCardSubmit}
                    disabled={!customCard.name || !customCard.issuer}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium flex-1"
                  >
                    Add Card
                  </button>
                  <button
                    onClick={() => setShowCustomCardEntry(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Card Recommendations - Show after analysis */}
        {result && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-sm border border-green-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-full mr-3">
                  <FaCreditCard className="text-green-600 text-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {useEnhancedAI ? '🤖 AI-Enhanced Recommendations' : '🎯 Your Top Recommendation'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {useEnhancedAI 
                      ? 'Advanced AI analysis with real-world point valuations and risk assessment' 
                      : 'Based on your spending analysis'
                    }
                  </p>
                  {useEnhancedAI && (
                    <div className="mt-2 text-xs text-blue-600 font-medium">
                      ✨ Enhanced AI Mode: Dynamic valuations • Risk analysis • Optimization tips
                    </div>
                  )}
                </div>
              </div>
              {/* Show data period indicator */}
              <div className="text-right">
                <div className="text-xs text-gray-500">
                  Analysis Period: {result.analysis.transactionCount} transactions
                </div>
                <div className="text-xs text-green-600">
                  Projected to annual estimates
                </div>
              </div>
            </div>
            
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="space-y-4">
                {/* Check if current card is better than all recommendations */}
                {currentCard.estimatedAnnualRewards >= result.recommendations[0].annualRewards ? (
                  <div className="bg-white border-2 border-green-300 rounded-lg p-6 shadow-md">
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-green-600 text-2xl">🎉</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-xl mb-2">Excellent Choice!</h4>
                        <p className="text-gray-600 mb-4 max-w-md mx-auto">
                          It looks like you have the best current card for your spending habits. Good work!
                        </p>
                        <div className="bg-green-50 rounded-lg p-4 mb-4">
                          <p className="text-green-900 font-medium text-sm">Your {currentCard.name} is earning:</p>
                          <p className="text-green-800 text-2xl font-bold">{formatCurrency(currentCard.estimatedAnnualRewards)}/year</p>
                          <p className="text-green-700 text-sm">Based on your spending patterns</p>
                        </div>
                        <p className="text-sm text-gray-500">
                          Keep using your card to maximize your rewards. We'll continue monitoring for even better options.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Primary Recommendation */}
                    <div className="bg-white border-2 border-green-300 rounded-lg p-6 shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-1">
                              <span className="text-green-600 font-bold text-lg">#1</span>
                            </div>
                            <div className="text-xs text-gray-500">Match</div>
                            <div className="text-sm font-bold text-green-600">{result.recommendations[0].matchScore.toFixed(0)}%</div>
                          </div>
                          <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <FaCreditCard className="text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg">{result.recommendations[0].card.name}</h4>
                            <p className="text-sm text-gray-600">{result.recommendations[0].card.issuer} - {result.recommendations[0].card.annual_fee === 0 ? 'No Annual Fee' : `$${result.recommendations[0].card.annual_fee}/year`}</p>
                            
                            {/* Reward breakdown */}
                            <div className="mt-2 flex flex-wrap gap-2">
                              {result.recommendations[0].card.dining_earn_rate > result.recommendations[0].card.base_earn_rate && (
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                  {result.recommendations[0].card.dining_earn_rate}x Dining
                                </span>
                              )}
                              {result.recommendations[0].card.groceries_earn_rate > result.recommendations[0].card.base_earn_rate && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  {result.recommendations[0].card.groceries_earn_rate}x Groceries
                                </span>
                              )}
                              {result.recommendations[0].card.travel_earn_rate > result.recommendations[0].card.base_earn_rate && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  {result.recommendations[0].card.travel_earn_rate}x Travel
                                </span>
                              )}
                              {result.recommendations[0].card.gas_earn_rate > result.recommendations[0].card.base_earn_rate && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  {result.recommendations[0].card.gas_earn_rate}x Gas
                                </span>
                              )}
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {result.recommendations[0].card.base_earn_rate}x Base Rate
                              </span>
                            </div>

                            {/* Explanation why this card is better */}
                            <div className="mt-3 p-3 bg-green-50 rounded-lg">
                              <p className="text-sm text-green-900 font-medium mb-1">Why this card works for you:</p>
                              <p className="text-sm text-green-800">
                                {result.recommendations[0].reasoning && result.recommendations[0].reasoning.length > 0 
                                  ? result.recommendations[0].reasoning[0]
                                  : `This card maximizes rewards based on your spending patterns, earning you ${formatCurrency(result.recommendations[0].annualRewards)} annually.`
                                }
                              </p>
                            </div>

                            <div className="flex items-center space-x-4 mt-3">
                              <p className="text-sm text-green-600 font-medium">
                                ▲ Est. Annual Rewards: {formatCurrency(result.recommendations[0].annualRewards)}
                              </p>
                              {result.recommendations[0].welcomeBonusValue > 0 && (
                                <p className="text-sm text-green-600">
                                  + Welcome Bonus: {formatCurrency(result.recommendations[0].welcomeBonusValue)}
                                </p>
                              )}
                            </div>
                            {result.recommendations[0].netBenefit > currentCard.estimatedAnnualRewards && (
                              <p className="text-sm text-green-700 font-medium mt-1">
                                +{formatCurrency(result.recommendations[0].netBenefit - currentCard.estimatedAnnualRewards)} more than your current card annually
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {formatCurrency(result.recommendations[0].netBenefit)}/year
                          </div>
                          <div className="text-xs text-gray-500 mb-3">Net Benefit</div>
                          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                            Apply Now
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Additional Recommendations - Collapsible */}
                    {result.recommendations.length > 1 && (
                      <div className="space-y-2">
                        {!showAllRecommendations && (
                          <button
                            onClick={() => setShowAllRecommendations(true)}
                            className="w-full text-center py-3 text-green-600 hover:text-green-700 font-medium text-sm border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                          >
                            View 2 More Recommendations →
                          </button>
                        )}
                        
                        {showAllRecommendations && (
                          <>
                            {result.recommendations.slice(1, 3).map((rec, index) => (
                              <div key={index + 1} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
                                <div className="flex items-center space-x-4">
                                  <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                                      <span className="text-gray-600 font-bold text-sm">#{index + 2}</span>
                                    </div>
                                    <div className="text-xs text-gray-500">Match</div>
                                    <div className="text-sm font-bold text-gray-600">{rec.matchScore.toFixed(0)}%</div>
                                  </div>
                                  <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                                    <FaCreditCard className="text-gray-400" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{rec.card.name}</h4>
                                    <p className="text-sm text-gray-600">{rec.card.issuer} - {rec.card.annual_fee === 0 ? 'Free' : `$${rec.card.annual_fee}/year`}</p>
                                    <div className="flex items-center space-x-4 mt-1">
                                      <p className="text-sm text-green-600 font-medium">
                                        ▲ Est. Annual Rewards: {formatCurrency(rec.annualRewards)}
                                      </p>
                                      {rec.welcomeBonusValue > 0 && (
                                        <p className="text-sm text-green-600">
                                          + Welcome Bonus: {formatCurrency(rec.welcomeBonusValue)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-green-600 mb-1">
                                    {formatCurrency(rec.netBenefit)}/year
                                  </div>
                                  <div className="text-xs text-gray-500 mb-2">Net Benefit</div>
                                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                                    Apply Now
                                  </button>
                                </div>
                              </div>
                            ))}
                            <button
                              onClick={() => setShowAllRecommendations(false)}
                              className="w-full text-center py-2 text-gray-500 hover:text-gray-700 text-sm"
                            >
                              ↑ Show Less
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Potential Annual Rewards</p>
                <p className="text-3xl font-bold text-gray-900">
                  {result?.recommendations?.[0] ? formatCurrency(result.recommendations[0].annualRewards) : '$0'}
                </p>
                <p className="text-sm text-gray-500">
                  {result ? 'With recommended card' : 'Upload data for analysis'}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaChartLine className="text-green-600 text-xl" />
              </div>
            </div>
            {result?.recommendations?.[0] && result.recommendations[0].netBenefit > currentCard.estimatedAnnualRewards && (
              <div className="mt-2 text-sm text-green-600 font-medium">
                +{formatCurrency(result.recommendations[0].netBenefit - currentCard.estimatedAnnualRewards)} improvement
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Current Card Value</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(currentCard.estimatedAnnualRewards)}</p>
                <p className="text-sm text-gray-500">{currentCard.name}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaCreditCard className="text-green-600 text-xl" />
              </div>
            </div>
            {currentCard.isCustom && (
              <div className="mt-2 text-xs text-gray-500">
                Custom card • User estimated
              </div>
            )}
          </div>
        </div>

        {/* Upload more statements section - Show if result exists */}
        {result && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Upload More Statements</h3>
                <p className="text-sm text-gray-500">Add more months of data for better insights and accuracy</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => { console.log('Upload button clicked, triggering file input'); const fileInput = document.getElementById('file-upload'); console.log('File input element:', fileInput); fileInput?.click(); }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Upload New Statement
                </button>
                <button 
                  onClick={() => setShowManualEntry(true)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Manual Entry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* File confirmation for additional uploads - Show when result exists and file is selected */}
        {result && file && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FaUpload className="text-green-600 text-lg" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Additional File Selected: {file.name}</p>
                  <p className="text-sm text-gray-500">Ready to add to your analysis</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setFile(null)}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Processing...' : 'Add to Analysis'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Initial Upload Interface - Show when no analysis exists yet */}
        {!result && !file && (
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-sm border border-green-200 p-8 mb-8 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaUpload className="text-green-600 text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Let's Analyze Your Spending
              </h2>
              <p className="text-gray-600 mb-8">
                Upload your credit card statement (CSV) or enter your spending manually to get personalized card recommendations.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => { console.log('Upload button clicked, triggering file input'); const fileInput = document.getElementById('file-upload'); console.log('File input element:', fileInput); fileInput?.click(); }}
                  className="flex items-center justify-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-lg transition-colors shadow-md"
                >
                  <FaUpload className="mr-3" />
                  Upload Statement (CSV/PDF)
                </button>
                <button 
                  onClick={() => setShowManualEntry(true)}
                  className="flex items-center justify-center px-8 py-4 border-2 border-green-600 text-green-600 hover:bg-green-50 rounded-lg font-semibold text-lg transition-colors"
                >
                  <FaEdit className="mr-3" />
                  Enter Manually
                </button>
              </div>
              
              <div className="mt-8 text-sm text-gray-500">
                <p className="mb-2">
                  <strong>Supported Formats:</strong> Upload your bank or credit card statement (CSV or PDF) with transaction data
                </p>
                <p>
                  <strong>Supported columns:</strong> description, amount, date, merchant category (optional)
                </p>
              </div>
            </div>
          </div>
        )}

        <input
          id="file-upload"
          type="file"
          accept=".csv,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Show file selection confirmation when file is chosen */}
        {!result && file && (console.log('Rendering file confirmation UI, file:', file) || true) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FaUpload className="text-green-600 text-lg" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Selected File: {file.name}</p>
                  <p className="text-sm text-gray-500">Ready to analyze your spending</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setFile(null)}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg font-medium transition-colors"
                >
                  Change File
                </button>
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Processing...' : 'Analyze Transactions'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Show uploaded statements after analysis */}
        {result && uploadedFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Uploaded Statements</h3>
              <span className="text-sm text-gray-500">{uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} analyzed</span>
            </div>
            <div className="space-y-2">
              {uploadedFiles.map((fileName, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <FaUpload className="text-green-600 text-sm" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{fileName}</p>
                      <p className="text-sm text-gray-500">Processed successfully</p>
                    </div>
                  </div>
                  <div className="text-green-600 text-sm font-medium">✓ Analyzed</div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                {manualSpending.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Your Spending Entries</h4>
                    <div className="space-y-2">
                      {manualSpending.map((entry, index) => (
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
                        Total Monthly Spending: {formatCurrency(manualSpending.reduce((sum, entry) => sum + entry.amount, 0))}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleManualAnalysis}
                    disabled={manualSpending.length === 0 || loading}
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

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Analysis Results - With Time Period Selector */}
        {result && (
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
                  <p className="text-2xl font-bold">{result.analysis.transactionCount}</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
                  <p className="text-sm font-medium opacity-90">Total Spent</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      analysisTimePeriod === '12months' ? result.analysis.totalSpent * 12 :
                      analysisTimePeriod === 'ytd' ? result.analysis.totalSpent * (new Date().getMonth() + 1) :
                      result.analysis.totalSpent
                    )}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
                  <p className="text-sm font-medium opacity-90">Avg Transaction</p>
                  <p className="text-2xl font-bold">{formatCurrency(result.analysis.averageTransactionAmount)}</p>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
                  <p className="text-sm font-medium opacity-90">Top Category</p>
                  <p className="text-lg font-bold">{result.analysis.categoryBreakdown[0]?.category || 'N/A'}</p>
                  <p className="text-sm opacity-90">
                    {formatCurrency(
                      analysisTimePeriod === '12months' ? (result.analysis.categoryBreakdown[0]?.amount || 0) * 12 :
                      analysisTimePeriod === 'ytd' ? (result.analysis.categoryBreakdown[0]?.amount || 0) * (new Date().getMonth() + 1) :
                      result.analysis.categoryBreakdown[0]?.amount || 0
                    )}
                  </p>
                </div>
              </div>

              {/* Category Breakdown */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.analysis.categoryBreakdown
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
          </div>
        )}

        {/* Monthly Reward Gains Chart */}
        {result && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Monthly Rewards Comparison</h3>
                <p className="text-sm text-gray-500">Your current card vs. our top recommendation</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                Data available for: {new Date().toLocaleString('default', { month: 'short' })}
              </div>
            </div>
            
            <div className="relative">
              {/* Y-axis labels and chart */}
              <div className="flex">
                {/* Y-axis */}
                <div className="flex flex-col justify-between h-64 py-4 pr-4 text-xs text-gray-500">
                  {[200, 150, 100, 50, 0].map(value => (
                    <div key={value} className="flex items-center">
                      <span className="w-8 text-right">${value}</span>
                      <div className="w-2 h-px bg-gray-300 ml-1"></div>
                    </div>
                  ))}
                </div>
                
                {/* Chart area */}
                <div className="flex-1 relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0">
                    {[0, 25, 50, 75, 100].map(percent => (
                      <div 
                        key={percent}
                        className="absolute w-full border-t border-gray-200"
                        style={{ bottom: `${percent}%` }}
                      ></div>
                    ))}
                  </div>
                  
                  {/* Bars */}
                  <div className="h-64 flex items-end space-x-4 relative z-10">
                    {monthlyRewardsData.months.map((month, index) => {
                      const currentReward = monthlyRewardsData.currentCardRewards[index] || 0;
                      const recommendedReward = monthlyRewardsData.recommendedCardRewards[index] || 0;
                      const maxValue = 200; // Fixed scale to $200
                      
                      return (
                        <div key={month} className="flex-1 flex flex-col items-center">
                          <div className="w-full flex justify-center items-end space-x-1 h-56">
                            {currentReward > 0 && (
                              <div 
                                className="bg-green-400 rounded-t flex-1 min-h-[4px]" 
                                style={{ height: `${Math.min((currentReward / maxValue) * 100, 100)}%` }}
                                title={`Current: ${formatCurrency(currentReward)}/month`}
                              ></div>
                            )}
                            {recommendedReward > 0 && (
                              <div 
                                className="bg-green-500 rounded-t flex-1 min-h-[4px]" 
                                style={{ height: `${Math.min((recommendedReward / maxValue) * 100, 100)}%` }}
                                title={`Recommended: ${formatCurrency(recommendedReward)}/month`}
                              ></div>
                            )}
                            {currentReward === 0 && recommendedReward === 0 && (
                              <div className="flex-1 h-1 bg-gray-100 rounded"></div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 mt-2">{month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Recommended Card</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-400 rounded"></div>
                <span className="text-sm text-gray-600">Current Card</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        id="file-upload"
        type="file"
        accept=".csv,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
} 