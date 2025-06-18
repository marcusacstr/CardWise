'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  FaUsers, 
  FaDollarSign, 
  FaCreditCard, 
  FaChartLine, 
  FaArrowUp, 
  FaArrowDown,
  FaEye,
  FaMousePointer,
  FaPercentage,
  FaCalendarAlt
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalRevenue: number;
  revenueToday: number;
  cardApplications: number;
  applicationsToday: number;
  conversionRate: number;
  avgRevenuePerUser: number;
  topCards: Array<{
    name: string;
    applications: number;
    revenue: number;
  }>;
  dailyMetrics: Array<{
    date: string;
    users: number;
    revenue: number;
    applications: number;
    conversionRate: number;
  }>;
  userSegments: Array<{
    segment: string;
    count: number;
    percentage: number;
  }>;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  color: string;
  prefix?: string;
  suffix?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon, 
  color,
  prefix = '',
  suffix = ''
}) => {
  const isPositive = change > 0;
  const isNeutral = change === 0;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <div className={`text-${color}-600`}>{icon}</div>
        </div>
        <div className={`flex items-center text-sm font-medium ${
          isPositive ? 'text-green-600' : 
          isNeutral ? 'text-gray-600' : 'text-red-600'
        }`}>
          {isPositive ? <FaArrowUp className="mr-1" /> : 
           isNeutral ? <div className="w-2 h-2 bg-gray-400 rounded-full mr-1" /> :
           <FaArrowDown className="mr-1" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </p>
        <p className="text-xs text-gray-500 mt-1">{changeLabel}</p>
      </div>
    </div>
  );
};

interface RealTimeAnalyticsProps {
  partnerId: string;
  timeRange?: '24h' | '7d' | '30d' | '90d';
}

interface CommissionQueryResult {
  amount: number;
  created_at: string;
  card_id: string;
  credit_cards: {
    name: string;
  };
}

interface CardApplicationResult {
  id: string;
  card_id: string;
  created_at: string;
  status: string;
  commission_amount: number;
  credit_cards: {
    name: string;
  }[] | null;
}

const RealTimeAnalytics: React.FC<RealTimeAnalyticsProps> = ({ 
  partnerId, 
  timeRange = '30d' 
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchAnalyticsData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchAnalyticsData();
    }, 30000);

    return () => clearInterval(interval);
  }, [partnerId, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      const now = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '24h':
          startDate.setDate(now.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
      }

      // Fetch user analytics
      const { data: userAnalytics } = await supabase
        .from('partner_user_sessions')
        .select(`
          id,
          created_at,
          card_applied,
          analyses_completed,
          session_duration
        `)
        .eq('partner_id', partnerId)
        .gte('created_at', startDate.toISOString());

      // Fetch revenue data
      const { data: revenueData } = await supabase
        .from('partner_commissions')
        .select(`
          amount,
          created_at,
          card_id,
          credit_cards (name)
        `)
        .eq('partner_id', partnerId)
        .gte('created_at', startDate.toISOString());

      // Fetch card application data
      const { data: cardApplications } = await supabase
        .from('partner_card_applications')
        .select(`
          id,
          card_id,
          created_at,
          status,
          commission_amount,
          credit_cards (name)
        `)
        .eq('partner_id', partnerId)
        .gte('created_at', startDate.toISOString());

      // Process the data
      const today = new Date().toDateString();
      const totalUsers = userAnalytics?.length || 0;
      const activeUsers = userAnalytics?.filter(session => 
        session.session_duration && session.session_duration > 60
      ).length || 0;
      const newUsersToday = userAnalytics?.filter(session => 
        new Date(session.created_at).toDateString() === today
      ).length || 0;

      const totalRevenue = revenueData?.reduce((sum, commission) => sum + commission.amount, 0) || 0;
      const revenueToday = revenueData?.filter(commission => 
        new Date(commission.created_at).toDateString() === today
      ).reduce((sum, commission) => sum + commission.amount, 0) || 0;

      const totalApplications = cardApplications?.length || 0;
      const applicationsToday = cardApplications?.filter(app => 
        new Date(app.created_at).toDateString() === today
      ).length || 0;

      const conversionRate = totalUsers > 0 ? (totalApplications / totalUsers) * 100 : 0;
      const avgRevenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0;

      // Generate daily metrics for chart
      const dailyMetrics = generateDailyMetrics(userAnalytics || [], revenueData || [], cardApplications || []);

      // Top performing cards
      const cardPerformance = new Map();
      cardApplications?.forEach((app: any) => {
        const cardName = app.credit_cards?.[0]?.name || 'Unknown';
        const current = cardPerformance.get(cardName) || { applications: 0, revenue: 0 };
        cardPerformance.set(cardName, {
          applications: current.applications + 1,
          revenue: current.revenue + (app.commission_amount || 0)
        });
      });

      const topCards = Array.from(cardPerformance.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.applications - a.applications)
        .slice(0, 5);

      // User segments (simplified)
      const userSegments = [
        { segment: 'New Users', count: newUsersToday, percentage: totalUsers > 0 ? (newUsersToday / totalUsers) * 100 : 0 },
        { segment: 'Active Users', count: activeUsers, percentage: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0 },
        { segment: 'Converted Users', count: totalApplications, percentage: totalUsers > 0 ? (totalApplications / totalUsers) * 100 : 0 },
        { segment: 'Inactive Users', count: totalUsers - activeUsers, percentage: totalUsers > 0 ? ((totalUsers - activeUsers) / totalUsers) * 100 : 0 }
      ];

      setAnalyticsData({
        totalUsers,
        activeUsers,
        newUsersToday,
        totalRevenue,
        revenueToday,
        cardApplications: totalApplications,
        applicationsToday,
        conversionRate,
        avgRevenuePerUser,
        topCards,
        dailyMetrics,
        userSegments
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const generateDailyMetrics = (users: any[], revenue: any[], applications: any[]) => {
    const days = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const metrics = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayUsers = users.filter(u => 
        new Date(u.created_at).toDateString() === date.toDateString()
      ).length;
      
      const dayRevenue = revenue.filter(r => 
        new Date(r.created_at).toDateString() === date.toDateString()
      ).reduce((sum, r) => sum + r.amount, 0);
      
      const dayApplications = applications.filter(a => 
        new Date(a.created_at).toDateString() === date.toDateString()
      ).length;
      
      const dayConversionRate = dayUsers > 0 ? (dayApplications / dayUsers) * 100 : 0;
      
      metrics.push({
        date: timeRange === '24h' ? date.getHours() + ':00' : date.toLocaleDateString(),
        users: dayUsers,
        revenue: dayRevenue,
        applications: dayApplications,
        conversionRate: dayConversionRate
      });
    }
    
    return metrics;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
        <div className="bg-gray-200 h-64 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">Error loading analytics: {error}</p>
        <button 
          onClick={fetchAnalyticsData}
          className="mt-2 text-red-800 hover:text-red-900 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!analyticsData) return null;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Header with last updated time */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Real-Time Analytics</h2>
        <div className="flex items-center text-sm text-gray-500">
          <FaCalendarAlt className="mr-2" />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={analyticsData.totalUsers}
          change={12.5}
          changeLabel="vs last period"
          icon={<FaUsers className="h-6 w-6" />}
          color="blue"
        />
        <MetricCard
          title="Revenue"
          value={analyticsData.totalRevenue}
          change={8.3}
          changeLabel="vs last period"
          icon={<FaDollarSign className="h-6 w-6" />}
          color="green"
          prefix="$"
        />
        <MetricCard
          title="Card Applications"
          value={analyticsData.cardApplications}
          change={15.7}
          changeLabel="vs last period"
          icon={<FaCreditCard className="h-6 w-6" />}
          color="purple"
        />
        <MetricCard
          title="Conversion Rate"
          value={analyticsData.conversionRate.toFixed(1)}
          change={2.1}
          changeLabel="vs last period"
          icon={<FaPercentage className="h-6 w-6" />}
          color="indigo"
          suffix="%"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Metrics Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Daily Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.dailyMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Users"
              />
              <Line 
                type="monotone" 
                dataKey="applications" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Applications"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Cards Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Performing Cards
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.topCards}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="applications" fill="#3B82F6" name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Segments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          User Segments
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analyticsData.userSegments}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ segment, percentage }) => `${segment}: ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analyticsData.userSegments.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="space-y-4">
            {analyticsData.userSegments.map((segment, index) => (
              <div key={segment.segment} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">
                    {segment.segment}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">
                    {segment.count.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {segment.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeAnalytics; 