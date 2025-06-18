'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  FaRocket, 
  FaGlobe, 
  FaEye, 
  FaCopy,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCog,
  FaCode,
  FaExternalLinkAlt,
  FaEdit,
  FaTrash,
  FaPlus,
  FaDownload,
  FaLink,
  FaSave
} from 'react-icons/fa';

interface Portal {
  id: string;
  portal_name: string;
  subdomain: string;
  custom_domain?: string;
  domain_verified: boolean;
  status: 'draft' | 'published' | 'offline';
  test_url: string;
  production_url?: string;
  ssl_enabled: boolean;
  created_at: string;
  last_deployed: string;
  deployment_status: 'deploying' | 'deployed' | 'failed';
}

interface DomainSetup {
  domain: string;
  cname_record: string;
  a_record?: string;
  verification_token: string;
  status: 'pending' | 'verified' | 'failed';
}

interface PortalGeneratorProps {
  partnerId: string;
}

const PortalGenerator: React.FC<PortalGeneratorProps> = ({ partnerId }) => {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'manage' | 'deploy' | 'domains'>('manage');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deploying, setDeploying] = useState<string | null>(null);
  
  // New portal form
  const [newPortal, setNewPortal] = useState({
    portal_name: '',
    subdomain: '',
    custom_domain: ''
  });

  // Domain setup
  const [domainSetup, setDomainSetup] = useState<DomainSetup | null>(null);
  const [showDomainInstructions, setShowDomainInstructions] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPortals();
  }, [partnerId]);

  const fetchPortals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/partner/portals');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch portals');
      }

      setPortals(result);

    } catch (err) {
      console.error('Error fetching portals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch portals');
    } finally {
      setLoading(false);
    }
  };

  const generateSubdomain = (portalName: string) => {
    return portalName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const createPortal = async () => {
    try {
      setError(null);
      
      if (!newPortal.portal_name.trim()) {
        setError('Portal name is required');
        return;
      }

      const subdomain = newPortal.subdomain || generateSubdomain(newPortal.portal_name);
      
      // Validate subdomain format
      if (!/^[a-z0-9-]+$/.test(subdomain) || subdomain.length < 3) {
        setError('Invalid subdomain. Must be at least 3 characters and contain only lowercase letters, numbers, and hyphens.');
        return;
      }

      console.log('Creating portal via API:', {
        portal_name: newPortal.portal_name.trim(),
        subdomain: subdomain,
        custom_domain: newPortal.custom_domain.trim() || null
      });

      const response = await fetch('/api/partner/portals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portal_name: newPortal.portal_name.trim(),
          subdomain: subdomain,
          custom_domain: newPortal.custom_domain.trim() || null
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create portal');
      }

      console.log('Portal created successfully via API:', result);

      setPortals([result, ...portals]);
      setNewPortal({ portal_name: '', subdomain: '', custom_domain: '' });
      setShowCreateModal(false);
      setSuccess('Portal created successfully! Deployment is in progress.');

      // Trigger deployment status check
      await deployPortal(result.id);

    } catch (err) {
      console.error('Error creating portal:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create portal. Please try again.');
      }
    }
  };

  const deployPortal = async (portalId: string) => {
    try {
      setDeploying(portalId);
      
      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const { error } = await supabase
        .from('partner_portals')
        .update({
          deployment_status: 'deployed',
          status: 'published',
          last_deployed: new Date().toISOString()
        })
        .eq('id', portalId);

      if (error) throw error;

      setPortals(portals.map(p => 
        p.id === portalId 
          ? { ...p, deployment_status: 'deployed', status: 'published', last_deployed: new Date().toISOString() }
          : p
      ));
      
      setSuccess('Portal deployed successfully!');

    } catch (err) {
      console.error('Error deploying portal:', err);
      setError(err instanceof Error ? err.message : 'Failed to deploy portal');
      
      // Update status to failed
      await supabase
        .from('partner_portals')
        .update({ deployment_status: 'failed' })
        .eq('id', portalId);
        
    } finally {
      setDeploying(null);
    }
  };

  const setupCustomDomain = async (portalId: string, domain: string) => {
    try {
      setError(null);
      
      // Generate verification token
      const verificationToken = `cardwise-verify-${Math.random().toString(36).substring(2, 15)}`;
      
      const domainData: DomainSetup = {
        domain: domain,
        cname_record: 'portals.cardwise.com',
        verification_token: verificationToken,
        status: 'pending'
      };

      // Save domain setup to database
      const { error } = await supabase
        .from('partner_domain_setups')
        .upsert({
          portal_id: portalId,
          partner_id: partnerId,
          domain: domain,
          cname_record: domainData.cname_record,
          verification_token: verificationToken,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      setDomainSetup(domainData);
      setShowDomainInstructions(true);
      
      setSuccess('Domain setup initiated. Please follow the DNS configuration instructions.');

    } catch (err) {
      console.error('Error setting up domain:', err);
      setError(err instanceof Error ? err.message : 'Failed to setup custom domain');
    }
  };

  const verifyDomain = async (portalId: string) => {
    try {
      setError(null);
      
      // Simulate domain verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { error } = await supabase
        .from('partner_portals')
        .update({
          domain_verified: true,
          production_url: `https://${domainSetup?.domain}`
        })
        .eq('id', portalId);

      if (error) throw error;

      setPortals(portals.map(p => 
        p.id === portalId 
          ? { ...p, domain_verified: true, production_url: `https://${domainSetup?.domain}` }
          : p
      ));
      
      setSuccess('Domain verified successfully! Your portal is now live on your custom domain.');
      setShowDomainInstructions(false);

    } catch (err) {
      console.error('Error verifying domain:', err);
      setError(err instanceof Error ? err.message : 'Domain verification failed');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Draft</span>;
      case 'published':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Published</span>;
      case 'offline':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Offline</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="bg-gray-200 h-8 w-64 rounded"></div>
        <div className="bg-gray-200 h-96 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Portal Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
        >
          <FaPlus className="mr-2 h-4 w-4" />
          Create New Portal
        </button>
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'manage', label: 'Manage Portals', icon: FaCog },
            { id: 'deploy', label: 'Deployment', icon: FaRocket },
            { id: 'domains', label: 'Custom Domains', icon: FaGlobe }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="mr-2 h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Manage Portals Tab */}
        {activeTab === 'manage' && (
          <div className="p-6">
            {portals.length === 0 ? (
              <div className="text-center py-12">
                <FaGlobe className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No portals yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first white-label portal.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-6 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                >
                  <FaPlus className="mr-2 h-4 w-4" />
                  Create Portal
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {portals.map((portal) => (
                  <div key={portal.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">{portal.portal_name}</h3>
                          {getStatusBadge(portal.status)}
                          {portal.deployment_status === 'deploying' && (
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                              Deploying...
                            </span>
                          )}
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium">Test URL:</span>
                            <button
                              onClick={() => copyToClipboard(portal.test_url)}
                              className="ml-2 flex items-center text-green-600 hover:text-green-800"
                            >
                              {portal.test_url}
                              <FaCopy className="ml-1 h-3 w-3" />
                            </button>
                          </div>
                          {portal.production_url && (
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="font-medium">Production URL:</span>
                              <button
                                onClick={() => copyToClipboard(portal.production_url!)}
                                className="ml-2 flex items-center text-green-600 hover:text-green-800"
                              >
                                {portal.production_url}
                                <FaCopy className="ml-1 h-3 w-3" />
                              </button>
                            </div>
                          )}
                          <div className="text-sm text-gray-500">
                            Last deployed: {new Date(portal.last_deployed).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <a
                          href={portal.test_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <FaEye className="mr-2 h-4 w-4" />
                          Preview
                        </a>
                        
                        {portal.status === 'draft' && (
                          <button
                            onClick={() => deployPortal(portal.id)}
                            disabled={deploying === portal.id}
                            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                          >
                            <FaRocket className="mr-2 h-4 w-4" />
                            {deploying === portal.id ? 'Deploying...' : 'Deploy'}
                          </button>
                        )}
                        
                        {!portal.custom_domain && portal.status === 'published' && (
                          <button
                            onClick={() => {
                              const domain = prompt('Enter your custom domain (e.g., www.yoursite.com/cards):');
                              if (domain) setupCustomDomain(portal.id, domain);
                            }}
                            className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            <FaLink className="mr-2 h-4 w-4" />
                            Add Domain
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Deployment Tab */}
        {activeTab === 'deploy' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Deployment Guide</h3>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900">How Portal Deployment Works</h4>
                <ul className="mt-2 text-sm text-green-800 space-y-1">
                  <li>• Portals are automatically deployed to our CDN for fast global access</li>
                  <li>• Test URLs are available immediately for preview and testing</li>
                  <li>• SSL certificates are automatically provisioned and managed</li>
                  <li>• Updates are deployed instantly when you modify portal settings</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">Deployment Steps</h4>
                <ol className="mt-2 text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Create and customize your portal</li>
                  <li>Deploy to test environment for review</li>
                  <li>Configure custom domain (optional)</li>
                  <li>Go live with your branded portal</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Custom Domains Tab */}
        {activeTab === 'domains' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Domain Setup</h3>
            
            {showDomainInstructions && domainSetup && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h4 className="font-medium text-yellow-900 mb-4">DNS Configuration Required</h4>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-900">Step 1: Add CNAME Record</h5>
                    <p className="text-sm text-gray-600 mb-2">
                      Add this CNAME record to your DNS settings:
                    </p>
                    <div className="bg-gray-900 text-white p-3 rounded font-mono text-sm">
                      <div className="flex items-center justify-between">
                        <span>CNAME: {domainSetup.domain} → {domainSetup.cname_record}</span>
                        <button
                          onClick={() => copyToClipboard(`${domainSetup.domain} CNAME ${domainSetup.cname_record}`)}
                          className="text-green-300 hover:text-green-100"
                        >
                          <FaCopy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900">Step 2: Add TXT Record for Verification</h5>
                    <p className="text-sm text-gray-600 mb-2">
                      Add this TXT record to verify domain ownership:
                    </p>
                    <div className="bg-gray-900 text-white p-3 rounded font-mono text-sm">
                      <div className="flex items-center justify-between">
                        <span>TXT: _cardwise-verify.{domainSetup.domain} → {domainSetup.verification_token}</span>
                        <button
                          onClick={() => copyToClipboard(`_cardwise-verify.${domainSetup.domain} TXT ${domainSetup.verification_token}`)}
                          className="text-green-300 hover:text-green-100"
                        >
                          <FaCopy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => verifyDomain(portals[0]?.id)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                    >
                      <FaCheckCircle className="mr-2 h-4 w-4" />
                      Verify Domain
                    </button>
                    <button
                      onClick={() => setShowDomainInstructions(false)}
                      className="text-gray-600 hover:text-gray-800 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900">Domain Setup Instructions</h4>
                <div className="mt-2 text-sm text-green-800 space-y-2">
                  <p><strong>Option 1: Subdomain</strong> (Recommended)</p>
                  <p>Use a subdomain like: <code>cards.yourwebsite.com</code></p>
                  
                  <p className="mt-3"><strong>Option 2: Path-based</strong></p>
                  <p>Use a path like: <code>yourwebsite.com/cardcompare</code></p>
                  <p className="text-xs text-green-700">
                    Note: Path-based setup requires additional server configuration
                  </p>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900">Common DNS Providers</h4>
                <div className="mt-2 text-sm text-green-800 space-y-1">
                  <p>• <strong>Cloudflare:</strong> DNS tab → Add record</p>
                  <p>• <strong>GoDaddy:</strong> DNS Management → Add record</p>
                  <p>• <strong>Namecheap:</strong> Advanced DNS → Add record</p>
                  <p>• <strong>AWS Route 53:</strong> Hosted zone → Create record</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Portal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Create New Portal</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portal Name
                </label>
                <input
                  type="text"
                  value={newPortal.portal_name}
                  onChange={(e) => {
                    setNewPortal({
                      ...newPortal,
                      portal_name: e.target.value,
                      subdomain: generateSubdomain(e.target.value)
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="My Card Comparison Portal"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subdomain
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={newPortal.subdomain}
                    onChange={(e) => setNewPortal({ ...newPortal, subdomain: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-green-500 focus:border-green-500"
                    placeholder="my-portal"
                  />
                  <span className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-md text-sm text-gray-500">
                    .cardwise-preview.com
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  This will be your test URL
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Domain (Optional)
                </label>
                <input
                  type="text"
                  value={newPortal.custom_domain}
                  onChange={(e) => setNewPortal({ ...newPortal, custom_domain: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="cards.yoursite.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                  You can add this later
                </p>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createPortal}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
              >
                Create Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortalGenerator; 