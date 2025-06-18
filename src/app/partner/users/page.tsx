'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FaArrowLeft, FaUsers, FaEye, FaDownload, FaFilter, FaSearch, FaChartLine, FaMapMarkerAlt, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

interface UserSession {
  id: string;
  user_id: string;
  session_id: string;
  ip_address: string;
  user_agent: string;
  referrer: string;
  country: string;
  city: string;
  pages_visited: number;
  session_duration: string;
  uploaded_files: number;
  analyses_completed: number;
  cards_viewed: number;
  card_applied: boolean;
  card_applied_id: string;
  application_status: string;
  created_at: string;
  updated_at: string;
}

interface UserAnalytics {
  totalUsers: number;
  newUsersToday: number;
  activeUsers: number;
  avgSessionDuration: string;
  conversionRate: number;
  topCountries: { country: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  dailyActivity: { date: string; users: number; conversions: number }[];
}

export default function UserManagementPage() {
  const supabase = createClientComponentClient();
  const [partnerId, setPartnerId] = useState<string>('');
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('7d');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [dateFilter]);

  const fetchData = async () => {
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
      const days = parseInt(dateFilter.replace('d', ''));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch user sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('partner_user_sessions')
        .select('*')
        .eq('partner_id', partnerData.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (sessionsError) throw sessionsError;
      setUserSessions(sessionsData || []);

      // Calculate analytics
      const sessions = sessionsData || [];
      const uniqueUsers = new Set(sessions.map(s => s.user_id)).size;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const newUsersToday = sessions.filter(s => 
        new Date(s.created_at) >= todayStart && s.user_id
      ).length;

      const activeUsers = sessions.filter(s => 
        s.analyses_completed > 0 || s.uploaded_files > 0
      ).length;

      const avgDuration = sessions.reduce((sum, s) => {
        const duration = s.session_duration || '0 minutes';
        const minutes = parseInt(duration.split(' ')[0]) || 0;
        return sum + minutes;
      }, 0) / (sessions.length || 1);

      const conversions = sessions.filter(s => s.card_applied).length;
      const conversionRate = sessions.length > 0 ? (conversions / sessions.length) * 100 : 0;

      // Top countries
      const countryCount = sessions.reduce((acc, s) => {
        if (s.country) {
          acc[s.country] = (acc[s.country] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const topCountries = Object.entries(countryCount)
        .map(([country, count]) => ({ country, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Top referrers
      const referrerCount = sessions.reduce((acc, s) => {
        if (s.referrer && s.referrer !== 'direct') {
          const domain = new URL(s.referrer).hostname;
          acc[domain] = (acc[domain] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const topReferrers = Object.entries(referrerCount)
        .map(([referrer, count]) => ({ referrer, count: count as number }))
        .sort((a, b) => (b.count as number) - (a.count as number))
        .slice(0, 5);

      // Daily activity (last 7 days)
      const dailyActivity = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        const daySessions = sessions.filter(s => {
          const sessionDate = new Date(s.created_at);
          return sessionDate >= dayStart && sessionDate <= dayEnd;
        });
        
        dailyActivity.push({
          date: dateStr,
          users: new Set(daySessions.map(s => s.user_id)).size,
          conversions: daySessions.filter(s => s.card_applied).length
        });
      }

      setAnalytics({
        totalUsers: uniqueUsers,
        newUsersToday,
        activeUsers,
        avgSessionDuration: `${Math.round(avgDuration)} min`,
        conversionRate,
        topCountries,
        topReferrers,
        dailyActivity
      });

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Date', 'User ID', 'Country', 'City', 'Pages Visited', 'Duration', 'Analyses', 'Applied', 'Status'],
      ...userSessions.map(session => [
        new Date(session.created_at).toLocaleDateString(),
        session.user_id || 'Anonymous',
        session.country || '',
        session.city || '',
        session.pages_visited || 0,
        session.session_duration || '0',
        session.analyses_completed || 0,
        session.card_applied ? 'Yes' : 'No',
        session.application_status || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter sessions
  const filteredSessions = userSessions.filter(session => {
    const matchesSearch = !searchTerm || 
      session.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.user_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || 
      (statusFilter === 'converted' && session.card_applied) ||
      (statusFilter === 'active' && (session.analyses_completed > 0 || session.uploaded_files > 0)) ||
      (statusFilter === 'browsing' && !session.card_applied && session.analyses_completed === 0);

    const matchesCountry = !countryFilter || session.country === countryFilter;

    return matchesSearch && matchesStatus && matchesCountry;
  });

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
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                Track user activity and engagement on your portal
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button
                onClick={exportData}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                <FaDownload className="mr-2 inline" />
                Export Data
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

        {/* Analytics Summary */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FaUsers className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FaChartLine className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.activeUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FaClock className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Session</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.avgSessionDuration}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
                  <FaCheckCircle className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.conversionRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* User Sessions Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">User Sessions ({filteredSessions.length})</h2>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="mt-4 flex items-center space-x-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="converted">Converted</option>
                    <option value="active">Active</option>
                    <option value="browsing">Browsing</option>
                  </select>

                  <select
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Countries</option>
                    {Array.from(new Set(userSessions.map(s => s.country).filter(Boolean))).map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredSessions.map((session) => (
                      <tr key={session.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {session.user_id ? `User ${session.user_id.slice(0, 8)}...` : 'Anonymous'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {session.session_duration || '0 min'} session
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm text-gray-900">{session.country || 'Unknown'}</div>
                              <div className="text-sm text-gray-500">{session.city || 'Unknown'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {session.pages_visited} pages • {session.analyses_completed} analyses
                          </div>
                          <div className="text-sm text-gray-500">
                            {session.uploaded_files} uploads • {session.cards_viewed} cards
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {session.card_applied ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FaCheckCircle className="mr-1" />
                              Applied
                            </span>
                          ) : session.analyses_completed > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FaChartLine className="mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <FaEye className="mr-1" />
                              Browsing
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(session.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredSessions.length === 0 && (
                  <div className="text-center py-12">
                    <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                    <p className="text-sm text-gray-600">Try adjusting your filters or date range.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Countries */}
            {analytics && analytics.topCountries.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Countries</h3>
                <div className="space-y-3">
                  {analytics.topCountries.map((item, index) => (
                    <div key={item.country} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <span className="ml-3 text-sm text-gray-900">{item.country}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Referrers */}
            {analytics && analytics.topReferrers.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Referrers</h3>
                <div className="space-y-3">
                  {analytics.topReferrers.map((item, index) => (
                    <div key={item.referrer} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <span className="ml-3 text-sm text-gray-900 truncate">{item.referrer}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">New Users Today</span>
                  <span className="text-sm font-medium">{analytics?.newUsersToday || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Sessions</span>
                  <span className="text-sm font-medium">{userSessions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Applications</span>
                  <span className="text-sm font-medium">
                    {userSessions.filter(s => s.card_applied).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Unique Countries</span>
                  <span className="text-sm font-medium">
                    {new Set(userSessions.map(s => s.country).filter(Boolean)).size}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 