'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface Card {
  id: string
  name: string
  issuer: string
  annual_fee: number
  rewards_structure: {
    [key: string]: number
  }
  benefits: string[]
}

export default function CardRecommendations() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const { data, error } = await supabase
          .from('credit_cards')
          .select('*')
          .limit(5)

        if (error) throw error
        setCards(data || [])
      } catch (error) {
        console.error('Error fetching cards:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <div key={card.id} className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{card.name}</h3>
              <p className="text-sm text-gray-500">{card.issuer}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                Annual Fee: ${card.annual_fee}
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900">Rewards Structure</h4>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {Object.entries(card.rewards_structure).map(([category, rate]) => (
                <div key={category} className="text-sm">
                  <span className="text-gray-500">{category}:</span>{' '}
                  <span className="font-medium">{rate}x points</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900">Key Benefits</h4>
            <ul className="mt-2 space-y-1">
              {card.benefits.map((benefit, index) => (
                <li key={index} className="text-sm text-gray-500">
                  • {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  )
} 