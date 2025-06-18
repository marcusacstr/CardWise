'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  FaCreditCard, 
  FaChartLine, 
  FaUpload, 
  FaStar, 
  FaCheck,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaSpinner
} from 'react-icons/fa'

interface PortalConfig {
  id: string
  subdomain: string
  companyName: string
  logoUrl: string
  primaryColor: string
  secondaryColor: string
  welcomeTitle: string
  welcomeMessage: string
  contactEmail: string
  contactPhone: string
  backgroundImage?: string
  customCss?: string
}

export default function PortalPreview() {
  const params = useParams()
  const subdomain = params.subdomain as string
  const supabase = createClientComponentClient()
  
  const [config, setConfig] = useState<PortalConfig | null>(null)
  const [featuredCards, setFeaturedCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPortalData()
  }, [subdomain])

  const loadPortalData = async () => {
    try {
      setLoading(true)
      
      // Load portal configuration
      const { data: portalData, error: portalError } = await supabase
        .from('portal_configs')
        .select('*')
        .eq('subdomain', subdomain)
        .eq('is_active', true)
        .single()

      if (portalError) {
        if (portalError.code === 'PGRST116') {
          setError('Portal not found')
        } else {
          setError('Failed to load portal configuration')
        }
        return
      }

      setConfig({
        id: portalData.id,
        subdomain: portalData.subdomain,
        companyName: portalData.company_name,
        logoUrl: portalData.logo_url || '',
        primaryColor: portalData.primary_color,
        secondaryColor: portalData.secondary_color,
        welcomeTitle: portalData.welcome_title,
        welcomeMessage: portalData.welcome_message,
        contactEmail: portalData.contact_email,
        contactPhone: portalData.contact_phone,
        backgroundImage: portalData.background_image,
        customCss: portalData.custom_css
      })

      // Load featured cards
      const { data: cardSelections, error: cardError } = await supabase
        .from('partner_card_selections')
        .select(`
          credit_cards (
            id,
            name,
            issuer,
            annual_fee,
            welcome_bonus,
            image_url,
            base_earn_rate,
            reward_type,
            point_value,
            groceries_earn_rate,
            dining_earn_rate,
            travel_earn_rate,
            gas_earn_rate,
            application_url
          )
        `)
        .eq('partner_id', (await getPartnerId(portalData.id)))
        .eq('is_featured', true)
        .order('priority_order')

      if (cardError) {
        console.error('Error loading featured cards:', cardError)
      } else if (cardSelections) {
        setFeaturedCards(cardSelections.map(cs => cs.credit_cards).filter(Boolean))
      }

    } catch (error) {
      console.error('Error loading portal data:', error)
      setError('Failed to load portal')
    } finally {
      setLoading(false)
    }
  }

  const getPartnerId = async (portalId: string) => {
    const { data } = await supabase
      .from('portal_configs')
      .select('partner_id')
      .eq('id', portalId)
      .single()
    
    return data?.partner_id
  }

  const benefits = [
    {
      icon: FaChartLine,
      title: 'AI-Powered Analysis',
      description: 'Our advanced algorithms analyze your spending patterns to find the perfect card match.'
    },
    {
      icon: FaCreditCard,
      title: 'Comprehensive Database',
      description: 'Access to hundreds of credit cards from major US and Canadian issuers.'
    },
    {
      icon: FaStar,
      title: 'Expert Recommendations',
      description: 'Get personalized recommendations based on your unique financial situation.'
    }
  ]

  const calculateEstimatedValue = (card: any) => {
    // Simple calculation - in production this would be more sophisticated
    const baseValue = (card.base_earn_rate || 1) * card.point_value || 0.01
    const welcomeBonus = card.welcome_bonus || 0
    return Math.round((baseValue * 12000 + welcomeBonus) * 100) / 100 // Assume $12k annual spending
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading portal...</p>
        </div>
      </div>
    )
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaCreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Portal Not Found</h1>
          <p className="text-gray-600">
            {error || 'The requested portal could not be found or is not active.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{
      backgroundImage: config.backgroundImage ? `url(${config.backgroundImage})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {/* Custom CSS */}
      {config.customCss && (
        <style dangerouslySetInnerHTML={{ __html: config.customCss }} />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {config.logoUrl ? (
                <img src={config.logoUrl} alt="Logo" className="h-8 w-auto mr-3" />
              ) : (
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <span className="text-white font-bold text-sm">
                    {config.companyName.charAt(0)}
                  </span>
                </div>
              )}
              <h1 className="text-xl font-bold text-gray-900">{config.companyName}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{config.subdomain}.cardwise.com</span>
              <button 
                className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: config.primaryColor }}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {config.welcomeTitle}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {config.welcomeMessage}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="flex items-center justify-center px-8 py-3 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: config.primaryColor }}
            >
              <FaUpload className="mr-2" />
              Upload Statement
            </button>
            <button className="flex items-center justify-center px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors">
              <FaChartLine className="mr-2" />
              Browse Cards
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Service?</h2>
            <p className="text-lg text-gray-600">We make finding the perfect credit card simple and personalized</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div 
                  className="inline-flex items-center justify-center w-16 h-16 rounded-lg mb-4"
                  style={{ backgroundColor: config.primaryColor + '20' }}
                >
                  <benefit.icon 
                    className="w-8 h-8"
                    style={{ color: config.primaryColor }}
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cards */}
      {featuredCards.length > 0 && (
        <section className="py-16 bg-opacity-95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Credit Cards</h2>
              <p className="text-lg text-gray-600">Top-rated cards recommended by our experts</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCards.map((card) => (
                <div key={card.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{card.name}</h3>
                        <p className="text-sm text-gray-600">{card.issuer}</p>
                      </div>
                      {card.image_url && (
                        <img src={card.image_url} alt={card.name} className="w-12 h-8 object-contain" />
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {card.welcome_bonus && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Welcome Bonus:</span>
                          <span className="font-semibold">${card.welcome_bonus}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Annual Fee:</span>
                        <span className="font-semibold">${card.annual_fee}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Estimated Value:</span>
                        <span className="font-semibold text-green-600">${calculateEstimatedValue(card)}</span>
                      </div>
                    </div>

                    <div className="space-y-1 mb-4">
                      {card.dining_earn_rate > 1 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <FaCheck className="w-3 h-3 text-green-500 mr-2" />
                          {card.dining_earn_rate}x on dining
                        </div>
                      )}
                      {card.groceries_earn_rate > 1 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <FaCheck className="w-3 h-3 text-green-500 mr-2" />
                          {card.groceries_earn_rate}x on groceries
                        </div>
                      )}
                      {card.travel_earn_rate > 1 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <FaCheck className="w-3 h-3 text-green-500 mr-2" />
                          {card.travel_earn_rate}x on travel
                        </div>
                      )}
                      {card.gas_earn_rate > 1 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <FaCheck className="w-3 h-3 text-green-500 mr-2" />
                          {card.gas_earn_rate}x on gas
                        </div>
                      )}
                    </div>

                    <button 
                      className="w-full py-2 px-4 text-white rounded-md font-semibold hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: config.primaryColor }}
                      onClick={() => card.application_url && window.open(card.application_url, '_blank')}
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-16 bg-white bg-opacity-95">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Get Started Today</h2>
          <p className="text-lg text-gray-600 mb-8">
            Ready to find your perfect credit card? Get in touch with our experts.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {config.contactEmail && (
              <a 
                href={`mailto:${config.contactEmail}`}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <FaEnvelope className="mr-2" />
                {config.contactEmail}
              </a>
            )}
            {config.contactPhone && (
              <a 
                href={`tel:${config.contactPhone}`}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <FaPhone className="mr-2" />
                {config.contactPhone}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              Powered by {config.companyName} • Built with CardWise Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 