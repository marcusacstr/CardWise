'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  FaArrowLeft, 
  FaEye, 
  FaPalette, 
  FaGlobe, 
  FaSave, 
  FaExternalLinkAlt, 
  FaChartBar, 
  FaToggleOn, 
  FaToggleOff, 
  FaCopy, 
  FaUpload, 
  FaTimes, 
  FaCheck, 
  FaCreditCard,
  FaEdit,
  FaCog,
  FaUsers,
  FaMousePointer,
  FaPercentage,
  FaArrowUp,
  FaExclamationTriangle,
  FaSpinner
} from 'react-icons/fa'
import CardManagement from '@/components/partner/CardManagement'

interface PortalConfig {
  id: string;
  company_name: string;
  custom_app_name: string;
  custom_tagline: string;
  welcome_message: string;
  footer_text: string;
  portal_subdomain: string;
  portal_url: string;
  portal_active: boolean;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  logo_url: string;
  favicon_url: string;
  custom_css: string;
  hide_cardwise_branding: boolean;
}

interface PortalStats {
  totalVisitors: number;
  totalApplications: number;
  conversionRate: number;
  monthlyGrowth: number;
  topTrafficSources: { source: string; visitors: number }[];
  recentSessions: any[];
}

function PortalManagementPageContent() {
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();
  
  // Get tab from URL parameter, default to 'overview'
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [config, setConfig] = useState<PortalConfig>({
    id: '',
    company_name: '',
    custom_app_name: 'CardWise',
    custom_tagline: 'Smart Credit Card Recommendations',
    welcome_message: '',
    footer_text: '',
    portal_subdomain: '',
    portal_url: '',
    portal_active: true,
    primary_color: '#4F46E5',
    secondary_color: '#818CF8',
    accent_color: '#10B981',
    font_family: 'Inter',
    logo_url: '',
    favicon_url: '',
    custom_css: '',
    hide_cardwise_branding: false
  });
  
  const [stats, setStats] = useState<PortalStats>({
    totalVisitors: 0,
    totalApplications: 0,
    conversionRate: 0,
    monthlyGrowth: 0,
    topTrafficSources: [],
    recentSessions: []
  });

  const fontOptions = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Source Sans Pro'
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartBar },
    { id: 'cards', label: 'Card Selection', icon: FaCreditCard },
    { id: 'branding', label: 'Branding', icon: FaPalette },
    { id: 'content', label: 'Content', icon: FaEdit },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ];

  useEffect(() => {
    fetchPortalConfig();
    fetchPortalStats();
  }, []);

  const fetchPortalConfig = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: partnerData, error } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (partnerData) {
        setConfig({
          id: partnerData.id,
          company_name: partnerData.company_name || '',
          custom_app_name: partnerData.custom_app_name || 'CardWise',
          custom_tagline: partnerData.custom_tagline || 'Smart Credit Card Recommendations',
          welcome_message: partnerData.welcome_message || '',
          footer_text: partnerData.footer_text || '',
          portal_subdomain: partnerData.portal_subdomain || '',
          portal_url: partnerData.portal_url || '',
          portal_active: partnerData.portal_active || true,
          primary_color: partnerData.primary_color || '#4F46E5',
          secondary_color: partnerData.secondary_color || '#818CF8',
          accent_color: partnerData.accent_color || '#10B981',
          font_family: partnerData.font_family || 'Inter',
          logo_url: partnerData.logo_url || '',
          favicon_url: partnerData.favicon_url || '',
          custom_css: partnerData.custom_css || '',
          hide_cardwise_branding: partnerData.hide_cardwise_branding || false
        });
      }
    } catch (err) {
      console.error('Error fetching portal config:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch portal configuration');
    } finally {
      setLoading(false);
    }
  };

  const fetchPortalStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mock data for now - in production you'd fetch real analytics
      setStats({
        totalVisitors: 1247,
        totalApplications: 89,
        conversionRate: 7.1,
        monthlyGrowth: 12.5,
        topTrafficSources: [
          { source: 'Direct', visitors: 498 },
          { source: 'Google', visitors: 374 },
          { source: 'Social Media', visitors: 249 },
          { source: 'Referral', visitors: 126 }
        ],
        recentSessions: []
      });
    } catch (err) {
      console.error('Error fetching portal stats:', err);
    }
  };

  const savePortalConfig = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('partners')
        .update({
          company_name: config.company_name,
          custom_app_name: config.custom_app_name,
          custom_tagline: config.custom_tagline,
          welcome_message: config.welcome_message,
          footer_text: config.footer_text,
          portal_subdomain: config.portal_subdomain,
          portal_url: config.portal_url,
          portal_active: config.portal_active,
          primary_color: config.primary_color,
          secondary_color: config.secondary_color,
          accent_color: config.accent_color,
          font_family: config.font_family,
          logo_url: config.logo_url,
          favicon_url: config.favicon_url,
          custom_css: config.custom_css,
          hide_cardwise_branding: config.hide_cardwise_branding,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setSuccess('Portal configuration saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save portal configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
    // Mock file upload - in production you'd upload to your storage service
    const mockUrl = `https://example.com/${type}/${file.name}`;
    
    if (type === 'logo') {
      setConfig({ ...config, logo_url: mockUrl });
    } else {
      setConfig({ ...config, favicon_url: mockUrl });
    }
    
    setSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`);
  };

  const copyPortalUrl = () => {
    const url = config.portal_url || `https://${config.portal_subdomain}.cardwise.app`;
    navigator.clipboard.writeText(url);
    setSuccess('Portal URL copied to clipboard!');
  };

  const getPortalUrl = () => {
    return config.portal_url || `https://${config.portal_subdomain || 'yourcompany'}.cardwise.app`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Redirect to create portal if no portal exists
  if (!loading && !config.portal_subdomain) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-4">
              <Link href="/partner/dashboard" className="inline-flex items-center text-green-600 hover:text-green-800">
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Portal Management</h1>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <FaGlobe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Create Your Portal</h2>
            <p className="text-gray-600 mb-6">
              Set up your white-labeled credit card recommendation portal to start serving your users.
            </p>
            <Link
              href="/partner/portal/create"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/partner/dashboard" className="inline-flex items-center text-green-600 hover:text-green-800">
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Portal Management</h1>
                <p className="text-sm text-gray-600">Manage your white-labeled credit card portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={copyPortalUrl}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FaCopy className="mr-2 h-4 w-4" />
                Copy URL
              </button>
              <a
                href={getPortalUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FaEye className="mr-2 h-4 w-4" />
                Preview
              </a>
              <button
                onClick={savePortalConfig}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <FaSave className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <FaCheck className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <FaTimes className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Portal Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Portal Status</h3>
                  <p className="text-sm text-gray-600">Your portal is currently {config.portal_active ? 'active' : 'inactive'}</p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, portal_active: !config.portal_active })}
                  className="flex items-center"
                >
                  {config.portal_active ? (
                    <FaToggleOn className="h-8 w-8 text-green-500" />
                  ) : (
                    <FaToggleOff className="h-8 w-8 text-gray-400" />
                  )}
                </button>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Portal URL</p>
                    <p className="text-sm text-gray-600">{getPortalUrl()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={copyPortalUrl}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <FaCopy className="h-4 w-4" />
                    </button>
                    <a
                      href={getPortalUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <FaExternalLinkAlt className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaChartBar className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalVisitors.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaCreditCard className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Applications</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalApplications}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-sm">%</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.conversionRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-sm">↗</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
                    <p className="text-2xl font-semibold text-gray-900">+{stats.monthlyGrowth.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Traffic Sources</h3>
              <div className="space-y-4">
                {stats.topTrafficSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{source.source}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(source.visitors / stats.totalVisitors) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{source.visitors}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cards' && (
          <CardManagement partnerId={config.id} />
        )}

        {activeTab === 'branding' && (
          <div className="space-y-6">
            {/* Company Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={config.company_name}
                    onChange={(e) => setConfig({ ...config, company_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="Your Company Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">App Name</label>
                  <input
                    type="text"
                    value={config.custom_app_name}
                    onChange={(e) => setConfig({ ...config, custom_app_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="CardWise"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                <input
                  type="text"
                  value={config.custom_tagline}
                  onChange={(e) => setConfig({ ...config, custom_tagline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Smart Credit Card Recommendations"
                />
              </div>
            </div>

            {/* Colors */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Colors</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={config.primary_color}
                      onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                      className="h-10 w-16 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      value={config.primary_color}
                      onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={config.secondary_color}
                      onChange={(e) => setConfig({ ...config, secondary_color: e.target.value })}
                      className="h-10 w-16 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      value={config.secondary_color}
                      onChange={(e) => setConfig({ ...config, secondary_color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={config.accent_color}
                      onChange={(e) => setConfig({ ...config, accent_color: e.target.value })}
                      className="h-10 w-16 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      value={config.accent_color}
                      onChange={(e) => setConfig({ ...config, accent_color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Typography</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                <select
                  value={config.font_family}
                  onChange={(e) => setConfig({ ...config, font_family: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                >
                  {fontOptions.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Logo & Assets</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {config.logo_url ? (
                      <div className="space-y-2">
                        <img src={config.logo_url} alt="Logo" className="mx-auto h-16 w-auto" />
                        <button
                          onClick={() => setConfig({ ...config, logo_url: '' })}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FaUpload className="mx-auto h-8 w-8 text-gray-400" />
                        <div className="text-sm text-gray-600">
                          <label className="cursor-pointer text-green-600 hover:text-green-800">
                            Upload logo
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, 'logo');
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {config.favicon_url ? (
                      <div className="space-y-2">
                        <img src={config.favicon_url} alt="Favicon" className="mx-auto h-8 w-8" />
                        <button
                          onClick={() => setConfig({ ...config, favicon_url: '' })}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FaUpload className="mx-auto h-8 w-8 text-gray-400" />
                        <div className="text-sm text-gray-600">
                          <label className="cursor-pointer text-green-600 hover:text-green-800">
                            Upload favicon
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, 'favicon');
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Welcome Message</h3>
              <textarea
                value={config.welcome_message}
                onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Welcome to our credit card recommendation platform..."
              />
            </div>

            {/* Footer Text */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Footer Text</h3>
              <textarea
                value={config.footer_text}
                onChange={(e) => setConfig({ ...config, footer_text: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="© 2024 Your Company. All rights reserved."
              />
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Domain Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Domain Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subdomain</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={config.portal_subdomain}
                      onChange={(e) => setConfig({ ...config, portal_subdomain: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-green-500 focus:border-green-500"
                      placeholder="yourcompany"
                    />
                    <span className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-md text-gray-500">
                      .cardwise.app
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Domain (Optional)</label>
                  <input
                    type="text"
                    value={config.portal_url}
                    onChange={(e) => setConfig({ ...config, portal_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="https://cards.yourcompany.com"
                  />
                </div>
              </div>
            </div>

            {/* White-label Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">White-label Settings</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Hide CardWise Branding</p>
                  <p className="text-sm text-gray-600">Remove "Powered by CardWise" from your portal</p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, hide_cardwise_branding: !config.hide_cardwise_branding })}
                  className="flex items-center"
                >
                  {config.hide_cardwise_branding ? (
                    <FaToggleOn className="h-6 w-6 text-green-600" />
                  ) : (
                    <FaToggleOff className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Custom CSS */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Custom CSS</h3>
              <textarea
                value={config.custom_css}
                onChange={(e) => setConfig({ ...config, custom_css: e.target.value })}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                placeholder="/* Add your custom CSS here */"
              />
              <p className="mt-2 text-sm text-gray-600">
                Add custom CSS to further customize your portal's appearance.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PortalManagementPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <PortalManagementPageContent />
    </Suspense>
  )
} 