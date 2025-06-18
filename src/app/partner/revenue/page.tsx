'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FaArrowLeft, FaDollarSign, FaChartLine, FaDownload, FaCalendarAlt, FaCheckCircle, FaClock, FaExclamationTriangle, FaFilter, FaMoneyBillWave, FaCreditCard } from 'react-icons/fa'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface RevenueData {
  id: string;
  user_id: string;
  card_id: string;
  card_name: string;
  card_issuer: string;
  revenue_type: string;
  amount: number;
  commission_rate: number;
  commission_amount: number;
  application_id: string;
  application_status: string;
  payment_status: string;
  created_at: string;
  approved_at: string;
  paid_at: string;
}

interface RevenueSummary {
  totalRevenue: number;
  totalCommissions: number;
  pendingCommissions: number;
  paidCommissions: number;
  averageCommission: number;
  conversionValue: number;
  monthlyGrowth: number;
  topPerformingCards: {
    card_name: string;
    revenue: number;
    applications: number;
  }[];
  revenueByMonth: {
    month: string;
    revenue: number;
    commissions: number;
    applications: number;
  }[];
  revenueByType: {
    type: string;
    amount: number;
    color: string;
  }[];
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function RevenueTrackingPage() {
  const supabase = createClientComponentClient();
  const [partnerId, setPartnerId] = useState<string>('');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRevenueData();
  }, [dateRange, statusFilter, typeFilter]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get partner ID
      const { data: partnerData } = await supabase
        .from('partners')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!partnerData) throw new Error('Partner not found');
      setPartnerId(partnerData.id);

      // Calculate date range
      const days = parseInt(dateRange.replace('d', ''));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch revenue data with card information
      const { data: revenueQueryData, error: revenueError } = await supabase
        .from('partner_revenues')
        .select(`
          *,
          card:credit_cards(name, issuer)
        `)
        .eq('partner_id', partnerData.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (revenueError) throw revenueError;

      // Transform data
      const transformedData: RevenueData[] = (revenueQueryData || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        card_id: item.card_id,
        card_name: item.card?.name || 'Unknown Card',
        card_issuer: item.card?.issuer || 'Unknown Issuer',
        revenue_type: item.revenue_type,
        amount: item.amount,
        commission_rate: item.commission_rate,
        commission_amount: item.commission_amount,
        application_id: item.application_id,
        application_status: item.application_status,
        payment_status: item.payment_status,
        created_at: item.created_at,
        approved_at: item.approved_at,
        paid_at: item.paid_at
      }));

      // Apply filters
      let filteredData = transformedData;
      if (statusFilter) {
        filteredData = filteredData.filter(item => item.payment_status === statusFilter);
      }
      if (typeFilter) {
        filteredData = filteredData.filter(item => item.revenue_type === typeFilter);
      }

      setRevenueData(filteredData);

      // Calculate summary statistics
      const totalRevenue = filteredData.reduce((sum, item) => sum + item.amount, 0);
      const totalCommissions = filteredData.reduce((sum, item) => sum + item.commission_amount, 0);
      const pendingCommissions = filteredData
        .filter(item => item.payment_status === 'pending')
        .reduce((sum, item) => sum + item.commission_amount, 0);
      const paidCommissions = filteredData
        .filter(item => item.payment_status === 'paid')
        .reduce((sum, item) => sum + item.commission_amount, 0);

      const averageCommission = filteredData.length > 0 
        ? totalCommissions / filteredData.length 
        : 0;

      // Top performing cards
      const cardPerformance = filteredData.reduce((acc, item) => {
        const key = item.card_name;
        if (!acc[key]) {
          acc[key] = { revenue: 0, applications: 0 };
        }
        acc[key].revenue += item.commission_amount;
        acc[key].applications += 1;
        return acc;
      }, {} as Record<string, { revenue: number; applications: number }>);

      const topPerformingCards = Object.entries(cardPerformance)
        .map(([card_name, data]) => ({ card_name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Revenue by month (last 6 months)
      const revenueByMonth = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthData = transformedData.filter(item => {
          const itemDate = new Date(item.created_at);
          return itemDate >= monthStart && itemDate <= monthEnd;
        });

        revenueByMonth.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          revenue: monthData.reduce((sum, item) => sum + item.amount, 0),
          commissions: monthData.reduce((sum, item) => sum + item.commission_amount, 0),
          applications: monthData.length
        });
      }

      // Revenue by type
      const typeData = filteredData.reduce((acc, item) => {
        acc[item.revenue_type] = (acc[item.revenue_type] || 0) + item.commission_amount;
        return acc;
      }, {} as Record<string, number>);

      const revenueByType = Object.entries(typeData).map(([type, amount], index) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        amount,
        color: COLORS[index % COLORS.length]
      }));

      // Calculate monthly growth
      const thisMonth = revenueByMonth[revenueByMonth.length - 1];
      const lastMonth = revenueByMonth[revenueByMonth.length - 2];
      const monthlyGrowth = lastMonth?.commissions 
        ? ((thisMonth.commissions - lastMonth.commissions) / lastMonth.commissions) * 100 
        : 0;

      setSummary({
        totalRevenue,
        totalCommissions,
        pendingCommissions,
        paidCommissions,
        averageCommission,
        conversionValue: totalCommissions / (filteredData.filter(item => item.application_status === 'approved').length || 1),
        monthlyGrowth,
        topPerformingCards,
        revenueByMonth,
        revenueByType
      });

    } catch (err) {
      console.error('Error fetching revenue data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch revenue data');
    } finally {
      setLoading(false);
    }
  };

  const exportRevenue = () => {
    const csvContent = [
      ['Date', 'Card', 'Issuer', 'Type', 'Revenue', 'Commission Rate', 'Commission Amount', 'Status', 'Payment Status'],
      ...revenueData.map(item => [
        new Date(item.created_at).toLocaleDateString(),
        item.card_name,
        item.card_issuer,
        item.revenue_type,
        item.amount.toFixed(2),
        (item.commission_rate * 100).toFixed(2) + '%',
        item.commission_amount.toFixed(2),
        item.application_status,
        item.payment_status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/partner/dashboard" className="inline-flex items-center text-green-600 hover:text-green-800 mb-4">
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Revenue Tracking</h1>
              <p className="text-sm text-gray-600 mt-1">
                Track your earnings, commissions, and payouts
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="365d">Last year</option>
              </select>
              <button
                onClick={exportRevenue}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                <FaDownload className="mr-2 inline" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Revenue Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FaDollarSign className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Commissions</p>
                  <p className="text-2xl font-bold text-gray-900">${summary.totalCommissions.toLocaleString()}</p>
                  <p className={`text-xs ${summary.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {summary.monthlyGrowth >= 0 ? '↗' : '↘'} {Math.abs(summary.monthlyGrowth).toFixed(1)}% from last month
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FaMoneyBillWave className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Paid Out</p>
                  <p className="text-2xl font-bold text-gray-900">${summary.paidCommissions.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    {((summary.paidCommissions / summary.totalCommissions) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <FaClock className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">${summary.pendingCommissions.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Awaiting payment</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FaChartLine className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Commission</p>
                  <p className="text-2xl font-bold text-gray-900">${summary.averageCommission.toFixed(0)}</p>
                  <p className="text-xs text-gray-500">Per application</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Revenue Trends Chart */}
            {summary && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trends</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={summary.revenueByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => [`$${value}`, 'Amount']} />
                      <Line 
                        type="monotone" 
                        dataKey="commissions" 
                        stroke="#4F46E5" 
                        strokeWidth={3}
                        name="Commissions"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        name="Total Revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Revenue Details Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Revenue Details</h2>
                  <div className="flex items-center space-x-4">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                    </select>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">All Types</option>
                      <option value="application">Application</option>
                      <option value="approval">Approval</option>
                      <option value="monthly">Monthly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Card</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {revenueData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.card_name}</div>
                            <div className="text-sm text-gray-500">{item.card_issuer}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {item.revenue_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ${item.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">${item.commission_amount.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">{(item.commission_rate * 100).toFixed(1)}%</div>
                        </td>
                        <td className="px-6 py-4">
                          {item.payment_status === 'paid' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FaCheckCircle className="mr-1" />
                              Paid
                            </span>
                          ) : item.payment_status === 'pending' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <FaClock className="mr-1" />
                              Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <FaExclamationTriangle className="mr-1" />
                              Failed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {revenueData.length === 0 && (
                  <div className="text-center py-12">
                    <FaDollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Revenue Data</h3>
                    <p className="text-sm text-gray-600">Revenue data will appear here as applications are processed.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Performing Cards */}
            {summary && summary.topPerformingCards.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Cards</h3>
                <div className="space-y-4">
                  {summary.topPerformingCards.map((card, index) => (
                    <div key={card.card_name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{card.card_name}</div>
                          <div className="text-sm text-gray-500">{card.applications} applications</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        ${card.revenue.toFixed(0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revenue by Type */}
            {summary && summary.revenueByType.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Type</h3>
                <div className="h-48 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summary.revenueByType}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="amount"
                      >
                        {summary.revenueByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`$${value}`, 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {summary.revenueByType.map((item) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-gray-600">{item.type}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">${item.amount.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payout Schedule */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payout Schedule</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Next Payout</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payout Method</span>
                  <span className="text-sm font-medium text-gray-900">Bank Transfer</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Minimum Payout</span>
                  <span className="text-sm font-medium text-gray-900">$100</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <Link 
                    href="/partner/billing"
                    className="block w-full text-center px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                  >
                    Update Payout Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 