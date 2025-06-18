'use client';

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  FaArrowLeft, 
  FaGlobe, 
  FaRocket, 
  FaCheck, 
  FaSpinner,
  FaExternalLinkAlt,
  FaCopy
} from 'react-icons/fa'

interface BrandingSettings {
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  welcomeMessage: string;
  footerText: string;
}

export default function CreatePortal() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Portal settings
  const [portalName, setPortalName] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [customDomain, setCustomDomain] = useState('')
  
  // Branding settings
  const [branding, setBranding] = useState<BrandingSettings>({
    companyName: '',
    primaryColor: '#4F46E5',
    secondaryColor: '#818CF8',
    accentColor: '#10B981',
    logoUrl: '',
    welcomeMessage: '',
    footerText: ''
  })
  
  const [createdPortal, setCreatedPortal] = useState<any>(null)
  
  const supabase = createClientComponentClient()
  const router = useRouter()

  const generateSubdomain = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handlePortalNameChange = (name: string) => {
    setPortalName(name)
    if (!subdomain) {
      setSubdomain(generateSubdomain(name))
    }
    if (!branding.companyName) {
      setBranding({ ...branding, companyName: name })
    }
  }

  const handleCreatePortal = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Validate input
      if (!portalName.trim()) {
        throw new Error('Portal name is required')
      }
      if (!subdomain.trim()) {
        throw new Error('Subdomain is required')
      }
      if (!/^[a-z0-9-]+$/.test(subdomain) || subdomain.length < 3) {
        throw new Error('Subdomain must be at least 3 characters and contain only letters, numbers, and hyphens')
      }

      const response = await fetch('/api/partner/portal/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portalName,
          subdomain,
          customDomain: customDomain || null,
          branding: {
            ...branding,
            companyName: branding.companyName || portalName,
            welcomeMessage: branding.welcomeMessage || `Welcome to ${portalName}! Find the perfect credit card for your needs.`,
            footerText: branding.footerText || `© ${new Date().getFullYear()} ${branding.companyName || portalName}. All rights reserved.`
          }
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal')
      }

      setCreatedPortal(data.portal)
      setSuccess('Portal created successfully!')
      
    } catch (err) {
      console.error('Error creating portal:', err)
      setError(err instanceof Error ? err.message : 'Failed to create portal')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('URL copied to clipboard!')
    setTimeout(() => setSuccess(null), 2000)
  }

  if (createdPortal) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-4">
              <Link href="/partner/dashboard" className="inline-flex items-center text-green-600 hover:text-green-800">
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Portal Created Successfully!</h1>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <FaCheck className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Portal is Live!</h2>
              <p className="text-gray-600">
                Your credit card recommendation portal has been successfully created and deployed.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Portal Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Portal Name:</span>
                  <span className="font-medium">{createdPortal.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subdomain:</span>
                  <span className="font-medium">{createdPortal.subdomain}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Test URL:</span>
                  <div className="flex items-center space-x-2">
                    <a 
                      href={createdPortal.testUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 font-medium"
                    >
                      {createdPortal.testUrl}
                    </a>
                    <button
                      onClick={() => copyToClipboard(createdPortal.testUrl)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <FaCopy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <FaCheck className="mr-1 h-3 w-3" />
                    Live
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={createdPortal.testUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <FaExternalLinkAlt className="mr-2 h-5 w-5" />
                View Portal
              </a>
              <Link
                href="/partner/portal?tab=cards"
                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <FaRocket className="mr-2 h-5 w-5" />
                Add Credit Cards
              </Link>
              <Link
                href="/partner/portal?tab=branding"
                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Customize Design
              </Link>
            </div>

            <div className="mt-8 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Next Steps:</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Add credit cards to your portal and configure referral links</li>
                <li>• Customize your portal's branding and colors</li>
                <li>• Test the user experience on your portal</li>
                <li>• Set up a custom domain (optional)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link href="/partner/dashboard" className="inline-flex items-center text-green-600 hover:text-green-800">
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create Your Portal</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <FaGlobe className="mx-auto h-12 w-12 text-green-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Launch Your Credit Card Portal</h2>
            <p className="text-gray-600">
              Create a white-labeled portal where your users can find and apply for credit cards with your referral links.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">{success}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="portalName" className="block text-sm font-medium text-gray-700 mb-2">
                  Portal Name *
                </label>
                <input
                  type="text"
                  id="portalName"
                  value={portalName}
                  onChange={(e) => handlePortalNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="My Company Credit Cards"
                />
              </div>

              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={branding.companyName}
                  onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Your Company Name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700 mb-2">
                Portal URL *
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                  https://
                </span>
                <input
                  type="text"
                  id="subdomain"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                  className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="my-company"
                />
                <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 rounded-r-md">
                  .cardwise-preview.com
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">This will be your portal's web address</p>
            </div>

            <div>
              <label htmlFor="customDomain" className="block text-sm font-medium text-gray-700 mb-2">
                Custom Domain (Optional)
              </label>
              <input
                type="text"
                id="customDomain"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="cards.yourcompany.com"
              />
              <p className="mt-1 text-sm text-gray-500">You can set this up later</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="primaryColor"
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="secondaryColor"
                    value={branding.secondaryColor}
                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                    className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.secondaryColor}
                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="accentColor" className="block text-sm font-medium text-gray-700 mb-2">
                  Accent Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="accentColor"
                    value={branding.accentColor}
                    onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                    className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.accentColor}
                    onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={handleCreatePortal}
                disabled={loading || !portalName.trim() || !subdomain.trim()}
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2 h-5 w-5" />
                    Creating Portal...
                  </>
                ) : (
                  <>
                    <FaRocket className="mr-2 h-5 w-5" />
                    Create Portal
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 