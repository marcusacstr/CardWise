'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  FaArrowLeft, 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCreditCard,
  FaSave,
  FaTimes,
  FaSpinner,
  FaCheck,
  FaEye,
  FaEyeSlash,
  FaFilter
} from 'react-icons/fa'

interface CreditCard {
  id: string
  name: string
  issuer: string
  country?: string
  annual_fee: number
  base_earn_rate: number
  reward_type: string
  point_value: number
  groceries_earn_rate: number
  dining_earn_rate: number
  travel_earn_rate: number
  gas_earn_rate: number
  welcome_bonus: string
  welcome_bonus_requirements: string
  application_url: string
  image_url: string
  is_active: boolean
  credit_score_requirement: string
  foreign_transaction_fee: number
  groceries_cap: number
  dining_cap: number
  travel_cap: number
  gas_cap: number
  created_at: string
  updated_at: string
}

export default function CardManagement() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [cards, setCards] = useState<CreditCard[]>([])
  const [filteredCards, setFilteredCards] = useState<CreditCard[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterIssuer, setFilterIssuer] = useState('all')
  const [filterCountry, setFilterCountry] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [newCard, setNewCard] = useState({
    name: '',
    issuer: '',
    country: 'Canada',
    annual_fee: 0,
    base_earn_rate: 1,
    reward_type: 'points',
    point_value: 0.01,
    groceries_earn_rate: 1,
    dining_earn_rate: 1,
    travel_earn_rate: 1,
    gas_earn_rate: 1,
    welcome_bonus: '',
    welcome_bonus_requirements: '',
    application_url: '',
    image_url: '',
    is_active: true,
    credit_score_requirement: 'Good',
    foreign_transaction_fee: 0,
    groceries_cap: 0,
    dining_cap: 0,
    travel_cap: 0,
    gas_cap: 0
  })

  const SUPER_ADMIN_EMAILS = [
    'marcus@cardwise.com',
    'admin@cardwise.com',
    'team@cardwise.com',
    'marcus.acaster@gmail.com',
  ]

  const ISSUERS = ['American Express', 'Chase', 'Capital One', 'Citi', 'Discover', 'Bank of America', 'Wells Fargo', 'TD', 'RBC', 'BMO', 'Scotiabank']
  const COUNTRIES = ['Canada', 'United States', 'United Kingdom', 'Australia']
  const REWARD_TYPES = ['points', 'cash back', 'miles']
  const CREDIT_REQUIREMENTS = ['Excellent', 'Good', 'Fair', 'Poor']

  const resetNewCard = () => {
    setNewCard({
      name: '',
      issuer: '',
      country: 'Canada',
      annual_fee: 0,
      base_earn_rate: 1,
      reward_type: 'points',
      point_value: 0.01,
      groceries_earn_rate: 1,
      dining_earn_rate: 1,
      travel_earn_rate: 1,
      gas_earn_rate: 1,
      welcome_bonus: '',
      welcome_bonus_requirements: '',
      application_url: '',
      image_url: '',
      is_active: true,
      credit_score_requirement: 'Good',
      foreign_transaction_fee: 0,
      groceries_cap: 0,
      dining_cap: 0,
      travel_cap: 0,
      gas_cap: 0
    })
  }

  useEffect(() => {
    checkSuperAdminAuth()
    loadCards()
  }, [])

  useEffect(() => {
    filterCards()
  }, [cards, searchTerm, filterIssuer, filterCountry, filterStatus])

  const checkSuperAdminAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || !SUPER_ADMIN_EMAILS.includes(user.email || '')) {
        router.push('/super-admin')
        return
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/super-admin')
    }
  }

  const loadCards = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .order('name')

      if (error) throw error
      setCards(data || [])
    } catch (error) {
      console.error('Error loading cards:', error)
      setMessage({ type: 'error', text: 'Failed to load credit cards' })
    } finally {
      setLoading(false)
    }
  }

  const filterCards = () => {
    let filtered = cards

    if (searchTerm) {
      filtered = filtered.filter(card =>
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.issuer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterIssuer !== 'all') {
      filtered = filtered.filter(card => card.issuer === filterIssuer)
    }

    if (filterCountry !== 'all') {
      filtered = filtered.filter(card => 
        card.country === filterCountry || (!card.country && filterCountry === 'Canada')
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(card =>
        filterStatus === 'active' ? card.is_active : !card.is_active
      )
    }

    setFilteredCards(filtered)
  }

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('credit_cards')
        .insert([newCard])

      if (error) throw error

      setMessage({ type: 'success', text: 'Credit card added successfully!' })
      setShowAddForm(false)
      resetNewCard()
      await loadCards()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to add credit card' })
    } finally {
      setSaving(false)
    }
  }

  const handleEditCard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCard) return
    
    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('credit_cards')
        .update(newCard)
        .eq('id', editingCard.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Credit card updated successfully!' })
      setEditingCard(null)
      resetNewCard()
      await loadCards()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update credit card' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this credit card? This action cannot be undone.')) {
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('credit_cards')
        .delete()
        .eq('id', cardId)

      if (error) throw error

      setMessage({ type: 'success', text: 'Credit card deleted successfully!' })
      await loadCards()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete credit card' })
    } finally {
      setSaving(false)
    }
  }

  const toggleCardStatus = async (card: CreditCard) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('credit_cards')
        .update({ is_active: !card.is_active })
        .eq('id', card.id)

      if (error) throw error

      setMessage({ 
        type: 'success', 
        text: `Card ${!card.is_active ? 'activated' : 'deactivated'} successfully!` 
      })
      await loadCards()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update card status' })
    } finally {
      setSaving(false)
    }
  }

  const startEditCard = (card: CreditCard) => {
    setEditingCard(card)
    setNewCard({
      name: card.name,
      issuer: card.issuer,
      country: card.country || 'Canada',
      annual_fee: card.annual_fee,
      base_earn_rate: card.base_earn_rate,
      reward_type: card.reward_type,
      point_value: card.point_value,
      groceries_earn_rate: card.groceries_earn_rate,
      dining_earn_rate: card.dining_earn_rate,
      travel_earn_rate: card.travel_earn_rate,
      gas_earn_rate: card.gas_earn_rate,
      welcome_bonus: card.welcome_bonus,
      welcome_bonus_requirements: card.welcome_bonus_requirements,
      application_url: card.application_url,
      image_url: card.image_url,
      is_active: card.is_active,
      credit_score_requirement: card.credit_score_requirement,
      foreign_transaction_fee: card.foreign_transaction_fee,
      groceries_cap: card.groceries_cap,
      dining_cap: card.dining_cap,
      travel_cap: card.travel_cap,
      gas_cap: card.gas_cap
    })
    setShowAddForm(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/super-admin/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Credit Card Management</h1>
                <p className="text-sm text-gray-600">
                  Add, edit, and manage credit cards in the database
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <FaPlus />
              <span>Add New Card</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <FaCheck className="mr-2" />
              ) : (
                <span className="mr-2">⚠️</span>
              )}
              {message.text}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <select
              value={filterIssuer}
              onChange={(e) => setFilterIssuer(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Issuers</option>
              {ISSUERS.map(issuer => (
                <option key={issuer} value={issuer}>{issuer}</option>
              ))}
            </select>

            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Countries</option>
              {COUNTRIES.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="text-sm text-gray-600 flex items-center">
              <FaCreditCard className="mr-2" />
              {filteredCards.length} cards found
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <div key={card.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{card.name}</h3>
                  <p className="text-sm text-gray-600">{card.issuer}</p>
                  {card.country && (
                    <p className="text-xs text-blue-600 mt-1">{card.country}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    card.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {card.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Annual Fee:</span>
                  <span className="font-medium">${card.annual_fee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Rate:</span>
                  <span className="font-medium">{card.base_earn_rate}x {card.reward_type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Welcome Bonus:</span>
                  <span className="font-medium text-xs">{card.welcome_bonus || 'None'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEditCard(card)}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                    title="Edit Card"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => toggleCardStatus(card)}
                    className={`p-2 rounded-lg transition-colors ${
                      card.is_active 
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                    title={card.is_active ? 'Deactivate Card' : 'Activate Card'}
                  >
                    {card.is_active ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                    title="Delete Card"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Form Modal */}
        {(showAddForm || editingCard) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingCard ? 'Edit Credit Card' : 'Add New Credit Card'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingCard(null)
                      resetNewCard()
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>

                <form onSubmit={editingCard ? handleEditCard : handleAddCard}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card Name *</label>
                      <input
                        type="text"
                        required
                        value={newCard.name}
                        onChange={(e) => setNewCard({...newCard, name: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="e.g., Chase Sapphire Preferred"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Issuer *</label>
                      <select
                        required
                        value={newCard.issuer}
                        onChange={(e) => setNewCard({...newCard, issuer: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Select Issuer</option>
                        {ISSUERS.map(issuer => (
                          <option key={issuer} value={issuer}>{issuer}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <select
                        value={newCard.country}
                        onChange={(e) => setNewCard({...newCard, country: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        {COUNTRIES.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Annual Fee ($)</label>
                      <input
                        type="number"
                        value={newCard.annual_fee}
                        onChange={(e) => setNewCard({...newCard, annual_fee: Number(e.target.value)})}
                        min="0"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Base Earn Rate (x)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newCard.base_earn_rate}
                        onChange={(e) => setNewCard({...newCard, base_earn_rate: Number(e.target.value)})}
                        min="0"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reward Type</label>
                      <select
                        value={newCard.reward_type}
                        onChange={(e) => setNewCard({...newCard, reward_type: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        {REWARD_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Point Value ($)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={newCard.point_value}
                        onChange={(e) => setNewCard({...newCard, point_value: Number(e.target.value)})}
                        min="0"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Credit Score Requirement</label>
                      <select
                        value={newCard.credit_score_requirement}
                        onChange={(e) => setNewCard({...newCard, credit_score_requirement: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        {CREDIT_REQUIREMENTS.map(req => (
                          <option key={req} value={req}>{req}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dining Rate (x)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newCard.dining_earn_rate}
                        onChange={(e) => setNewCard({...newCard, dining_earn_rate: Number(e.target.value)})}
                        min="0"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Groceries Rate (x)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newCard.groceries_earn_rate}
                        onChange={(e) => setNewCard({...newCard, groceries_earn_rate: Number(e.target.value)})}
                        min="0"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Travel Rate (x)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newCard.travel_earn_rate}
                        onChange={(e) => setNewCard({...newCard, travel_earn_rate: Number(e.target.value)})}
                        min="0"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gas Rate (x)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newCard.gas_earn_rate}
                        onChange={(e) => setNewCard({...newCard, gas_earn_rate: Number(e.target.value)})}
                        min="0"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Foreign Transaction Fee (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newCard.foreign_transaction_fee}
                        onChange={(e) => setNewCard({...newCard, foreign_transaction_fee: Number(e.target.value)})}
                        min="0"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Bonus</label>
                      <input
                        type="text"
                        value={newCard.welcome_bonus}
                        onChange={(e) => setNewCard({...newCard, welcome_bonus: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="e.g., 60,000 points"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Bonus Requirements</label>
                      <input
                        type="text"
                        value={newCard.welcome_bonus_requirements}
                        onChange={(e) => setNewCard({...newCard, welcome_bonus_requirements: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="e.g., Spend $4,000 in first 3 months"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Application URL</label>
                      <input
                        type="url"
                        value={newCard.application_url}
                        onChange={(e) => setNewCard({...newCard, application_url: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="https://..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <input
                          type="checkbox"
                          checked={newCard.is_active}
                          onChange={(e) => setNewCard({...newCard, is_active: e.target.checked})}
                          className="mr-2"
                        />
                        Active (show in recommendations)
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false)
                        setEditingCard(null)
                        resetNewCard()
                      }}
                      className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
                    >
                      {saving ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <FaSave />
                          <span>{editingCard ? 'Update Card' : 'Add Card'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 