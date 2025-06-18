'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  FaDollarSign, 
  FaCalendarAlt, 
  FaDownload, 
  FaFilter, 
  FaEye,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaCreditCard,
  FaFileExport,
  FaSearch,
  FaChartLine,
  FaSortAmountDown,
  FaSortAmountUp
} from 'react-icons/fa';

interface Commission {
  id: string;
  amount: number;
  card_name: string;
  card_issuer: string;
  user_email: string;
  application_date: string;
  commission_date: string;
  status: 'pending' | 'approved' | 'paid';
  payout_date?: string;
  commission_rate: number;
  application_id: string;
}

interface PayoutSummary {
  total_earned: number;
  total_pending: number;
  total_paid: number;
  current_month_earnings: number;
  last_payout_date?: string;
  next_payout_date?: string;
  minimum_payout_threshold: number;
}

interface CommissionQueryResult {
  id: string;
  amount: number;
  commission_rate: number;
  created_at: string;
  status: 'pending' | 'approved' | 'paid';
  payout_date?: string;
  application_id: string;
  partner_card_applications: {
    id: string;
    created_at: string;
    user_email: string;
    credit_cards: {
      name: string;
      issuer: string;
    };
  };
}

interface CommissionTrackerProps {
  partnerId: string;
}

const CommissionTracker: React.FC<CommissionTrackerProps> = ({ partnerId }) => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payoutSummary, setPayoutSummary] = useState<PayoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30d');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'card'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchCommissionData();
  }, [partnerId, statusFilter, dateRange]);

  const fetchCommissionData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      switch (dateRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }

      // Build query for commissions
      let query = supabase
        .from('partner_commissions')
        .select(`
          id,
          amount,
          commission_rate,
          created_at,
          status,
          payout_date,
          application_id,
          partner_card_applications!inner (
            id,
            created_at,
            user_email,
            credit_cards!inner (
              name,
              issuer
            )
          )
        `)
        .eq('partner_id', partnerId)
        .gte('created_at', startDate.toISOString());

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: commissionsData, error: commissionsError } = await query
        .order('created_at', { ascending: false });

      if (commissionsError) throw commissionsError;

      // Transform data
      const transformedCommissions: Commission[] = commissionsData?.map((commission: any) => ({
        id: commission.id,
        amount: commission.amount,
        card_name: commission.partner_card_applications?.credit_cards?.name || 'Unknown Card',
        card_issuer: commission.partner_card_applications?.credit_cards?.issuer || 'Unknown',
        user_email: commission.partner_card_applications?.user_email || 'Unknown',
        application_date: commission.partner_card_applications?.created_at || commission.created_at,
        commission_date: commission.created_at,
        status: commission.status,
        payout_date: commission.payout_date,
        commission_rate: commission.commission_rate,
        application_id: commission.partner_card_applications?.id || commission.id
      })) || [];

      setCommissions(transformedCommissions);

      // Calculate payout summary
      const totalEarned = transformedCommissions.reduce((sum, c) => sum + c.amount, 0);
      const totalPending = transformedCommissions
        .filter(c => c.status === 'pending' || c.status === 'approved')
        .reduce((sum, c) => sum + c.amount, 0);
      const totalPaid = transformedCommissions
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + c.amount, 0);

      // Current month earnings
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const currentMonthEarnings = transformedCommissions
        .filter(c => {
          const commissionDate = new Date(c.commission_date);
          return commissionDate.getMonth() === currentMonth && 
                 commissionDate.getFullYear() === currentYear;
        })
        .reduce((sum, c) => sum + c.amount, 0);

      // Get payout dates
      const paidCommissions = transformedCommissions.filter(c => c.status === 'paid' && c.payout_date);
      const lastPayoutDate = paidCommissions.length > 0 
        ? paidCommissions.sort((a, b) => new Date(b.payout_date!).getTime() - new Date(a.payout_date!).getTime())[0].payout_date
        : undefined;

      // Next payout date (typically monthly, on the 15th)
      const nextPayout = new Date();
      nextPayout.setDate(15);
      if (nextPayout < now) {
        nextPayout.setMonth(nextPayout.getMonth() + 1);
      }

      setPayoutSummary({
        total_earned: totalEarned,
        total_pending: totalPending,
        total_paid: totalPaid,
        current_month_earnings: currentMonthEarnings,
        last_payout_date: lastPayoutDate,
        next_payout_date: nextPayout.toISOString(),
        minimum_payout_threshold: 25 // $25 minimum payout
      });

    } catch (err) {
      console.error('Error fetching commission data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch commission data');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (newSortBy: 'date' | 'amount' | 'card') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Commission ID',
      'Amount',
      'Card Name',
      'Card Issuer',
      'User Email',
      'Application Date',
      'Commission Date',
      'Status',
      'Payout Date',
      'Commission Rate'
    ];

    const csvData = filteredAndSortedCommissions.map(commission => [
      commission.id,
      commission.amount,
      commission.card_name,
      commission.card_issuer,
      commission.user_email,
      new Date(commission.application_date).toLocaleDateString(),
      new Date(commission.commission_date).toLocaleDateString(),
      commission.status,
      commission.payout_date ? new Date(commission.payout_date).toLocaleDateString() : '',
      commission.commission_rate
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `commissions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredAndSortedCommissions = commissions
    .filter(commission => {
      const matchesSearch = searchTerm === '' || 
        commission.card_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.card_issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.user_email.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.commission_date).getTime() - new Date(b.commission_date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'card':
          comparison = a.card_name.localeCompare(b.card_name);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaClock className="mr-1 h-3 w-3" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1 h-3 w-3" />
            Approved
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1 h-3 w-3" />
            Paid
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
        <div className="bg-gray-200 h-96 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <FaExclamationTriangle className="h-5 w-5 text-red-400 mr-3" />
          <p className="text-red-600">Error loading commission data: {error}</p>
        </div>
        <button 
          onClick={fetchCommissionData}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Commission Tracker</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FaFilter className="mr-2 h-4 w-4" />
            Filters
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
          >
            <FaFileExport className="mr-2 h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Payout Summary Cards */}
      {payoutSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaDollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earned</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${payoutSummary.total_earned.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <FaClock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Payout</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${payoutSummary.total_pending.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${payoutSummary.total_paid.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaChartLine className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${payoutSummary.current_month_earnings.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payout Information */}
      {payoutSummary && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FaCalendarAlt className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-green-800">
                Payout Information
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Next payout: {new Date(payoutSummary.next_payout_date!).toLocaleDateString()}
                </p>
                {payoutSummary.last_payout_date && (
                  <p>
                    Last payout: {new Date(payoutSummary.last_payout_date).toLocaleDateString()}
                  </p>
                )}
                <p>
                  Minimum payout threshold: ${payoutSummary.minimum_payout_threshold}
                </p>
                {payoutSummary.total_pending < payoutSummary.minimum_payout_threshold && (
                  <p className="text-yellow-700 mt-1">
                    ⚠️ Pending amount is below minimum payout threshold
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cards, issuers, users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'card')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="card">Card</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commissions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Commission History ({filteredAndSortedCommissions.length} records)
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('date')}
                >
                  Date
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('card')}
                >
                  Card
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('amount')}
                >
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payout Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedCommissions.map((commission) => (
                <tr key={commission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(commission.commission_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {commission.card_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {commission.card_issuer}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {commission.user_email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${commission.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(commission.commission_rate * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(commission.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {commission.payout_date 
                      ? new Date(commission.payout_date).toLocaleDateString()
                      : '-'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredAndSortedCommissions.length === 0 && (
            <div className="text-center py-12">
              <FaCreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No commissions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters or date range.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommissionTracker; 