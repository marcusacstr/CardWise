'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import LogoUpload from '@/components/partner/LogoUpload'
import { 
  FaArrowLeft, 
  FaPalette, 
  FaGlobe, 
  FaImage, 
  FaEye, 
  FaSave, 
  FaCreditCard,
  FaUsers,
  FaCog,
  FaEdit,
  FaTimes,
  FaCheck,
  FaPlus,
  FaTrash,
  FaExternalLinkAlt
} from 'react-icons/fa'

interface PortalConfig {
  id?: string
  partnerId: string
  subdomain: string
  companyName: string
  logoUrl: string
  primaryColor: string
  secondaryColor: string
  welcomeTitle: string
  welcomeMessage: string
  contactEmail: string
  contactPhone: string
  backgroundImage: string
  customCss: string
  isActive: boolean
  featuredCards: string[]
}

export default function PortalBuilder() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [activeTab, setActiveTab] = useState('branding')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [availableCards, setAvailableCards] = useState<any[]>([])
  const [previewWindow, setPreviewWindow] = useState<Window | null>(null)
  
  const [config, setConfig] = useState<PortalConfig>({
    partnerId: '',
    subdomain: 'my-portal',
    companyName: 'My Company',
    logoUrl: '',
    primaryColor: '#10B981',
    secondaryColor: '#059669',
    welcomeTitle: 'Find Your Perfect Credit Card',
    welcomeMessage: 'Get personalized credit card recommendations tailored to your spending habits and financial goals.',
    contactEmail: '',
    contactPhone: '',
    backgroundImage: '',
    customCss: '',
    isActive: true,
    featuredCards: []
  })

  useEffect(() => {
    console.log('Portal Builder: Loading partner data...')
    loadPartnerData()
    loadAvailableCards()
  }, [])

  // Debug config changes
  useEffect(() => {
    console.log('Portal Builder: Config updated:', {
      partnerId: config.partnerId,
      companyName: config.companyName,
      subdomain: config.subdomain
    })
  }, [config.partnerId, config.companyName, config.subdomain])

  // Auto-update preview when branding changes
  useEffect(() => {
    if (previewWindow && !previewWindow.closed) {
      const timeoutId = setTimeout(() => {
        updatePreview()
      }, 500) // Debounce updates
      
      return () => clearTimeout(timeoutId)
    }
  }, [config.primaryColor, config.secondaryColor, config.companyName, config.logoUrl])

  const loadPartnerData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }

      console.log('Portal Builder: Loading partner data for user:', user.id)

      // Get partner info
      let { data: partner, error: partnerError } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', user.id)
        .single()

      console.log('Portal Builder: Partner query result:', { partner, partnerError })

      // If no partner record exists, try to create one using the fix-partner API
      if (partnerError || !partner) {
        console.log('Portal Builder: No partner record found, attempting to create via API...')
        
        try {
          const fixResponse = await fetch('/api/fix-partner', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })
          
          if (fixResponse.ok) {
            const fixResult = await fixResponse.json()
            console.log('Portal Builder: Partner creation via API successful:', fixResult)
            
            // Re-fetch partner data
            const { data: newPartner, error: refetchError } = await supabase
              .from('partners')
              .select('*')
              .eq('user_id', user.id)
              .single()
            
            if (refetchError || !newPartner) {
              console.error('Portal Builder: Failed to refetch partner after creation:', refetchError)
              throw new Error('Failed to create or fetch partner record')
            }
            
            partner = newPartner
          } else {
            const errorData = await fixResponse.json()
            console.error('Portal Builder: Fix-partner API failed:', errorData)
            throw new Error(`Failed to create partner record: ${errorData.error}`)
          }
        } catch (apiError) {
          console.error('Portal Builder: API call failed:', apiError)
          // Fall back to creating from user metadata directly
           const metadata = user.user_metadata || {}
           const companyName = metadata.company_name || metadata.companyName || 'Your Company'

           partner = {
             id: user.id, // Use user ID as fallback partner ID
             user_id: user.id,
             company_name: companyName,
             contact_email: user.email,
             contact_phone: '',
             subscription_plan: 'premium',
             subscription_status: 'active'
           }
          
          console.log('Portal Builder: Using fallback partner data:', partner)
        }
      }

      if (!partner) {
        throw new Error('Unable to load or create partner record')
      }

      console.log('Portal Builder: Using partner:', partner)

      // Load existing portal config
      const { data: portalConfig, error: configError } = await supabase
        .from('partner_portal_configs')
        .select('*')
        .eq('partner_id', partner.id)
        .single()

      console.log('Portal Builder: Portal config query result:', { portalConfig, configError })

      if (configError && configError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Portal Builder: Error loading portal config:', configError)
        return
      }

      if (portalConfig) {
        // Load existing config
        console.log('Portal Builder: Loading existing portal config')
        setConfig({
          id: portalConfig.id,
          partnerId: partner.id,
          subdomain: portalConfig.domain || partner.company_name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          companyName: portalConfig.company_name || partner.company_name,
          logoUrl: portalConfig.logo_url || '',
          primaryColor: portalConfig.primary_color,
          secondaryColor: portalConfig.secondary_color,
          welcomeTitle: 'Find Your Perfect Credit Card',
          welcomeMessage: portalConfig.welcome_message || 'Get personalized credit card recommendations',
          contactEmail: portalConfig.contact_email || partner.contact_email,
          contactPhone: portalConfig.phone_number || partner.contact_phone,
          backgroundImage: '',
          customCss: portalConfig.custom_css || '',
          isActive: !portalConfig.maintenance_mode,
          featuredCards: []
        })

        // Load featured cards
        const { data: featuredCards, error: cardsError } = await supabase
          .from('partner_card_selections')
          .select('card_id')
          .eq('partner_id', partner.id)
          .eq('is_featured', true)

        console.log('Portal Builder: Featured cards query result:', { featuredCards, cardsError })

        if (featuredCards) {
          setConfig(prev => ({
            ...prev,
            featuredCards: featuredCards.map(fc => fc.card_id)
          }))
        }
      } else {
        // Set default values from partner
        console.log('Portal Builder: No existing config, setting defaults')
        setConfig(prev => ({
          ...prev,
          partnerId: partner.id,
          companyName: partner.company_name,
          contactEmail: partner.contact_email,
          contactPhone: partner.contact_phone,
          subdomain: partner.company_name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 30)
        }))
      }

      console.log('Portal Builder: Final config state:', config)

    } catch (error) {
      console.error('Portal Builder: Error loading partner data:', error)
      alert(`Failed to load partner data: ${error.message}. Please try refreshing the page.`)
    }
  }

  const loadAvailableCards = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_cards')
        .select('id, name, issuer, image_url, welcome_bonus, annual_fee')
        .eq('is_active', true)
        .order('name')
        .limit(20)

      if (error) throw error
      setAvailableCards(data || [])
    } catch (error) {
      console.error('Error loading cards:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Ensure we have a partner ID
      if (!config.partnerId) {
        throw new Error('Partner ID is missing. Please try refreshing the page.')
      }

      console.log('Saving portal with config:', {
        partnerId: config.partnerId,
        companyName: config.companyName,
        subdomain: config.subdomain
      })

      // Save or update portal config
      const portalData = {
        partner_id: config.partnerId,
        domain: config.subdomain,
        company_name: config.companyName,
        logo_url: config.logoUrl,
        primary_color: config.primaryColor,
        secondary_color: config.secondaryColor,
        welcome_message: config.welcomeMessage,
        contact_email: config.contactEmail,
        phone_number: config.contactPhone,
        custom_css: config.customCss,
        maintenance_mode: !config.isActive
      }

      let savedPortal
      if (config.id) {
        // Update existing
        const { data, error } = await supabase
          .from('partner_portal_configs')
          .update(portalData)
          .eq('id', config.id)
          .select()
          .single()

        if (error) throw error
        savedPortal = data
      } else {
        // Create new
        const { data, error } = await supabase
          .from('partner_portal_configs')
          .insert(portalData)
          .select()
          .single()

        if (error) throw error
        savedPortal = data
        setConfig(prev => ({ ...prev, id: savedPortal.id }))
      }

      // Update featured cards
      // First, remove all existing featured cards
      await supabase
        .from('partner_card_selections')
        .delete()
        .eq('partner_id', config.partnerId)
        .eq('is_featured', true)

      // Then add new featured cards
      if (config.featuredCards.length > 0) {
        const cardSelections = config.featuredCards.map((cardId, index) => ({
          partner_id: config.partnerId,
          card_id: cardId,
          is_featured: true,
          priority_order: index
        }))

        const { error: cardError } = await supabase
          .from('partner_card_selections')
          .insert(cardSelections)

        if (cardError) throw cardError
      }

      alert(`✅ Portal Saved Successfully!\n\nYour custom portal is now live at:\nhttps://${config.subdomain}.cardwise.com\n\nShare this link with prospective clients to showcase your branded experience!`)
      
    } catch (error: any) {
      console.error('Error saving portal:', error)
      alert(`❌ Error saving portal: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    // Open preview in new tab with current config
    const previewUrl = `/partner/dashboard/preview?config=${encodeURIComponent(JSON.stringify(config))}&cards=${encodeURIComponent(JSON.stringify(config.featuredCards))}`
    
    if (previewWindow && !previewWindow.closed) {
      // Update existing preview window
      previewWindow.location.href = previewUrl
      previewWindow.focus()
    } else {
      // Open new preview window
      const newWindow = window.open(previewUrl, '_blank')
      setPreviewWindow(newWindow)
    }
  }

  const updatePreview = () => {
    if (previewWindow && !previewWindow.closed) {
      const previewUrl = `/partner/dashboard/preview?config=${encodeURIComponent(JSON.stringify(config))}&cards=${encodeURIComponent(JSON.stringify(config.featuredCards))}`
      previewWindow.location.href = previewUrl
    }
  }

  const toggleFeaturedCard = (cardId: string) => {
    const isSelected = config.featuredCards.includes(cardId)
    if (isSelected) {
      setConfig({
        ...config,
        featuredCards: config.featuredCards.filter(id => id !== cardId)
      })
    } else {
      setConfig({
        ...config,
        featuredCards: [...config.featuredCards, cardId]
      })
    }
  }

  const handleLogoUpdate = (logoUrl: string) => {
    setConfig({
      ...config,
      logoUrl: logoUrl
    })
  }

  const tabs = [
    { id: 'branding', label: 'Branding', icon: FaPalette },
    { id: 'content', label: 'Content', icon: FaEdit },
    { id: 'cards', label: 'Featured Cards', icon: FaCreditCard },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ]

  // Test database connection
  const testDatabaseConnection = async () => {
    try {
      console.log('Testing database connection...')
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log('User:', user)
      
      if (userError) {
        console.error('User error:', userError)
        return
      }

      // Test partners table
      const { data: partnersData, error: partnersError } = await supabase
        .from('partners')
        .select('*')
        .limit(1)
      
      console.log('Partners test:', { data: partnersData, error: partnersError })

      // Test partner_portal_configs table
      const { data: portalsData, error: portalsError } = await supabase
        .from('partner_portal_configs')
        .select('*')
        .limit(1)
      
      console.log('Portal configs test:', { data: portalsData, error: portalsError })

      // Test partner_card_selections table
      const { data: cardSelectionsData, error: cardSelectionsError } = await supabase
        .from('partner_card_selections')
        .select('*')
        .limit(1)
      
      console.log('Card selections test:', { data: cardSelectionsData, error: cardSelectionsError })

    } catch (error) {
      console.error('Database test error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link 
                href="/partner/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 mr-6"
              >
                <FaArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Portal Builder</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={testDatabaseConnection}
                className="flex items-center px-3 py-2 text-purple-700 border border-purple-300 rounded-md hover:bg-purple-50"
              >
                🔧 Test DB
              </button>
              <button
                onClick={handlePreview}
                className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <FaEye className="h-4 w-4 mr-2" />
                {previewWindow && !previewWindow.closed ? 'Update Preview' : 'Preview'}
              </button>
              {previewWindow && !previewWindow.closed && (
                <button
                  onClick={updatePreview}
                  className="flex items-center px-3 py-2 text-blue-700 border border-blue-300 rounded-md hover:bg-blue-50"
                >
                  <FaExternalLinkAlt className="h-3 w-3 mr-2" />
                  🔄
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <FaSave className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Portal'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Customization</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="h-4 w-4 mr-3" />
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* Quick Info */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Portal URL</h4>
                <p className="text-sm text-blue-700 break-all">
                  https://{config.subdomain}.cardwise.com
                </p>
                <button 
                  onClick={() => navigator.clipboard.writeText(`https://${config.subdomain}.cardwise.com`)}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              {/* Branding Tab */}
              {activeTab === 'branding' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Brand Customization</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={config.companyName}
                        onChange={(e) => setConfig({...config, companyName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subdomain
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={config.subdomain}
                          onChange={(e) => setConfig({...config, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm text-gray-600">
                          .cardwise.com
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={config.primaryColor}
                          onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                          className="w-12 h-10 border border-gray-300 rounded-md"
                        />
                        <input
                          type="text"
                          value={config.primaryColor}
                          onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secondary Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={config.secondaryColor}
                          onChange={(e) => setConfig({...config, secondaryColor: e.target.value})}
                          className="w-12 h-10 border border-gray-300 rounded-md"
                        />
                        <input
                          type="text"
                          value={config.secondaryColor}
                          onChange={(e) => setConfig({...config, secondaryColor: e.target.value})}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo Upload
                      </label>
                      <LogoUpload
                        currentLogoUrl={config.logoUrl}
                        onLogoUpdate={handleLogoUpdate}
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="border-t pt-6">
                    <h3 className="font-medium text-gray-900 mb-4">Brand Preview</h3>
                    <div 
                      className="p-6 rounded-lg border-l-4"
                      style={{ 
                        borderLeftColor: config.primaryColor,
                        backgroundColor: config.primaryColor + '10'
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        {config.logoUrl && (
                          <img src={config.logoUrl} alt="Logo" className="h-12 w-auto" />
                        )}
                        <div>
                          <h4 
                            className="text-xl font-bold"
                            style={{ color: config.primaryColor }}
                          >
                            {config.companyName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {config.subdomain}.cardwise.com
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Portal Content</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Welcome Title
                      </label>
                      <input
                        type="text"
                        value={config.welcomeTitle}
                        onChange={(e) => setConfig({...config, welcomeTitle: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Welcome Message
                      </label>
                      <textarea
                        value={config.welcomeMessage}
                        onChange={(e) => setConfig({...config, welcomeMessage: e.target.value})}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          value={config.contactEmail}
                          onChange={(e) => setConfig({...config, contactEmail: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          value={config.contactPhone}
                          onChange={(e) => setConfig({...config, contactPhone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Featured Cards Tab */}
              {activeTab === 'cards' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Featured Cards</h2>
                    <p className="text-sm text-gray-600">
                      {config.featuredCards.length} of {availableCards.length} cards selected
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableCards.map((card) => (
                      <div
                        key={card.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          config.featuredCards.includes(card.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleFeaturedCard(card.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{card.name}</h4>
                          {config.featuredCards.includes(card.id) && (
                            <FaCheck className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{card.issuer}</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-green-600">
                            ${card.welcome_bonus || 0} bonus
                          </span>
                          <span className="text-gray-500">
                            ${card.annual_fee || 0} fee
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Portal Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Portal Status</h3>
                        <p className="text-sm text-gray-600">Make your portal visible to clients</p>
                      </div>
                      <button
                        onClick={() => setConfig({...config, isActive: !config.isActive})}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          config.isActive ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            config.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom CSS (Advanced)
                      </label>
                      <textarea
                        value={config.customCss}
                        onChange={(e) => setConfig({...config, customCss: e.target.value})}
                        rows={6}
                        placeholder="/* Add custom CSS styles here */"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      />
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-900 mb-2">Share Your Portal</h4>
                      <p className="text-sm text-yellow-700 mb-3">
                        Use this link to show prospective clients your custom portal:
                      </p>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={`https://${config.subdomain}.cardwise.com`}
                          readOnly
                          className="flex-1 px-3 py-2 bg-white border border-yellow-300 rounded-md text-sm"
                        />
                        <button
                          onClick={() => navigator.clipboard.writeText(`https://${config.subdomain}.cardwise.com`)}
                          className="px-3 py-2 bg-yellow-200 text-yellow-800 rounded-md hover:bg-yellow-300 text-sm"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => window.open(`https://${config.subdomain}.cardwise.com`, '_blank')}
                          className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm flex items-center"
                        >
                          <FaExternalLinkAlt className="h-3 w-3 mr-1" />
                          Open
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Portal Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="h-full overflow-y-auto">
              <iframe
                src={`/preview/${config.subdomain}`}
                className="w-full h-full border-0"
                title="Portal Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}