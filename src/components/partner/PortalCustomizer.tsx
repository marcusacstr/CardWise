'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  FaPalette, 
  FaUpload, 
  FaEye, 
  FaSave,
  FaUndo,
  FaCog,
  FaGlobe,
  FaCode,
  FaImage,
  FaFont,
  FaLink,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

interface PortalConfig {
  id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  logo_url?: string;
  favicon_url?: string;
  company_name: string;
  domain?: string;
  custom_css?: string;
  welcome_message?: string;
  footer_text?: string;
  contact_email?: string;
  phone_number?: string;
  address?: string;
  social_links?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  seo_settings?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  features_enabled?: {
    spending_analysis: boolean;
    card_recommendations: boolean;
    credit_score_tracking: boolean;
    financial_goals: boolean;
  };
  analytics_enabled: boolean;
  maintenance_mode: boolean;
}

interface PortalCustomizerProps {
  partnerId: string;
}

const PortalCustomizer: React.FC<PortalCustomizerProps> = ({ partnerId }) => {
  const [config, setConfig] = useState<PortalConfig | null>(null);
  const [originalConfig, setOriginalConfig] = useState<PortalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'branding' | 'content' | 'features' | 'advanced'>('branding');
  const [previewMode, setPreviewMode] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPortalConfig();
  }, [partnerId]);

  const fetchPortalConfig = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('partner_portal_configs')
        .select('*')
        .eq('partner_id', partnerId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      // Default config if none exists
      const defaultConfig: PortalConfig = {
        id: '',
        primary_color: '#3B82F6',
        secondary_color: '#64748B',
        accent_color: '#10B981',
        company_name: '',
        welcome_message: 'Welcome to your personalized credit card recommendations',
        footer_text: 'Powered by CardWise',
        features_enabled: {
          spending_analysis: true,
          card_recommendations: true,
          credit_score_tracking: true,
          financial_goals: true
        },
        analytics_enabled: true,
        maintenance_mode: false
      };

      const portalConfig = data || defaultConfig;
      setConfig(portalConfig);
      setOriginalConfig(JSON.parse(JSON.stringify(portalConfig)));

    } catch (err) {
      console.error('Error fetching portal config:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch portal configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (field: string, value: any) => {
    if (!config) return;
    
    const newConfig = { ...config };
    
    // Handle nested objects
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      const parentObj = (newConfig as any)[parent] || {};
      (newConfig as any)[parent] = {
        ...parentObj,
        [child]: value
      };
    } else {
      (newConfig as any)[field] = value;
    }
    
    setConfig(newConfig);
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${partnerId}_${type}_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('partner-assets')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('partner-assets')
        .getPublicUrl(fileName);

      handleConfigChange(type === 'logo' ? 'logo_url' : 'favicon_url', publicUrl);
      setSuccess(`${type} uploaded successfully!`);

    } catch (err) {
      console.error(`Error uploading ${type}:`, err);
      setError(`Failed to upload ${type}`);
    }
  };

  const saveConfig = async () => {
    if (!config) return;

    try {
      setSaving(true);
      setError(null);

      const { error } = await supabase
        .from('partner_portal_configs')
        .upsert({
          ...config,
          partner_id: partnerId,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setOriginalConfig(JSON.parse(JSON.stringify(config)));
      setSuccess('Portal configuration saved successfully!');

    } catch (err) {
      console.error('Error saving config:', err);
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const resetConfig = () => {
    if (originalConfig) {
      setConfig(JSON.parse(JSON.stringify(originalConfig)));
    }
  };

  const hasChanges = () => {
    return JSON.stringify(config) !== JSON.stringify(originalConfig);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="bg-gray-200 h-8 w-64 rounded"></div>
        <div className="bg-gray-200 h-96 rounded-lg"></div>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Portal Customization</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FaEye className="mr-2 h-4 w-4" />
            {previewMode ? 'Edit Mode' : 'Preview'}
          </button>
          <button
            onClick={resetConfig}
            disabled={!hasChanges()}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <FaUndo className="mr-2 h-4 w-4" />
            Reset
          </button>
          <button
            onClick={saveConfig}
            disabled={saving || !hasChanges()}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            <FaSave className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <FaExclamationTriangle className="h-5 w-5 text-red-400 mr-3" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <FaCheckCircle className="h-5 w-5 text-green-400 mr-3" />
            <p className="text-green-600">{success}</p>
          </div>
        </div>
      )}

      {/* Changes Indicator */}
      {hasChanges() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            You have unsaved changes. Click "Save Changes" to apply them to your portal.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {[
              { id: 'branding', label: 'Branding', icon: FaPalette },
              { id: 'content', label: 'Content', icon: FaFont },
              { id: 'features', label: 'Features', icon: FaCog },
              { id: 'advanced', label: 'Advanced', icon: FaCode }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === tab.id
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="mr-3 h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Branding Tab */}
            {activeTab === 'branding' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Brand Appearance</h3>
                
                {/* Color Scheme */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={config.primary_color}
                        onChange={(e) => handleConfigChange('primary_color', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        value={config.primary_color}
                        onChange={(e) => handleConfigChange('primary_color', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={config.secondary_color}
                        onChange={(e) => handleConfigChange('secondary_color', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        value={config.secondary_color}
                        onChange={(e) => handleConfigChange('secondary_color', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accent Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={config.accent_color}
                        onChange={(e) => handleConfigChange('accent_color', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        value={config.accent_color}
                        onChange={(e) => handleConfigChange('accent_color', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    {config.logo_url && (
                      <img 
                        src={config.logo_url} 
                        alt="Company Logo" 
                        className="h-16 w-16 object-contain border border-gray-200 rounded-lg"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'logo');
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Recommended: PNG or SVG, max 2MB
                  </p>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={config.company_name}
                    onChange={(e) => handleConfigChange('company_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter your company name"
                  />
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Portal Content</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Welcome Message
                  </label>
                  <textarea
                    value={config.welcome_message}
                    onChange={(e) => handleConfigChange('welcome_message', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter a welcome message for your users"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Footer Text
                  </label>
                  <input
                    type="text"
                    value={config.footer_text}
                    onChange={(e) => handleConfigChange('footer_text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="Footer text"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={config.contact_email || ''}
                      onChange={(e) => handleConfigChange('contact_email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="support@company.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={config.phone_number || ''}
                      onChange={(e) => handleConfigChange('phone_number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Features Tab */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Portal Features</h3>
                
                <div className="space-y-4">
                  {Object.entries(config.features_enabled || {}).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">
                          {feature.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {getFeatureDescription(feature)}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) => handleConfigChange(`features_enabled.${feature}`, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Analytics Tracking</h4>
                      <p className="text-xs text-gray-500">
                        Enable analytics to track user behavior and optimize your portal
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.analytics_enabled}
                        onChange={(e) => handleConfigChange('analytics_enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Advanced Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Domain
                  </label>
                  <input
                    type="text"
                    value={config.domain || ''}
                    onChange={(e) => handleConfigChange('domain', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="cards.yourcompany.com"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Contact support to set up a custom domain
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom CSS
                  </label>
                  <textarea
                    value={config.custom_css || ''}
                    onChange={(e) => handleConfigChange('custom_css', e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                    placeholder="/* Add your custom CSS here */"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Advanced: Add custom CSS to further customize your portal appearance
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Maintenance Mode</h4>
                      <p className="text-xs text-gray-500">
                        Temporarily disable access to your portal
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.maintenance_mode}
                        onChange={(e) => handleConfigChange('maintenance_mode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const getFeatureDescription = (feature: string): string => {
  const descriptions: { [key: string]: string } = {
    spending_analysis: 'Allow users to upload and analyze their spending patterns',
    card_recommendations: 'Provide personalized credit card recommendations',
    credit_score_tracking: 'Enable credit score monitoring and tracking',
    financial_goals: 'Help users set and track financial goals'
  };
  
  return descriptions[feature] || 'Feature description';
};

export default PortalCustomizer; 