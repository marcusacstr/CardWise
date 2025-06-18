'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  FaSearch, 
  FaFilter, 
  FaPlus, 
  FaMinus, 
  FaStar, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaCheck,
  FaSort,
  FaGlobe,
  FaCreditCard,
  FaExternalLinkAlt,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

interface CreditCard {
  id: string;
  name: string;
  issuer: string;
  card_network: string;
  annual_fee: number;
  credit_score_requirement: string;
  welcome_bonus?: string;
  welcome_bonus_requirements?: string;
  foreign_transaction_fee: number;
  base_earn_rate: number;
  groceries_earn_rate: number;
  dining_earn_rate: number;
  travel_earn_rate: number;
  gas_earn_rate: number;
  reward_type: 'points' | 'miles' | 'cashback';
  point_value: number;
  benefits?: any;
  image_url?: string;
  application_url?: string;
  country: string;
  is_active: boolean;
}

interface PartnerCardSelection {
  id: string;
  partner_id: string;
  card_id: string;
  is_featured: boolean;
  custom_description?: string;
  priority_order: number;
  affiliate_link?: string;
  created_at: string;
}

interface CardWithSelection extends CreditCard {
  selection?: PartnerCardSelection;
  isSelected: boolean;
}

interface CardManagementProps {
  partnerId: string;
}

const CardManagement: React.FC<CardManagementProps> = ({ partnerId }) => {
  const supabase = createClientComponentClient();
  
  const [cards, setCards] = useState<CardWithSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedIssuer, setSelectedIssuer] = useState('all');
  const [selectedRewardType, setSelectedRewardType] = useState('all');
  const [feeFilter, setFeeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    affiliate_link: string;
    custom_description: string;
    is_featured: boolean;
  }>({
    affiliate_link: '',
    custom_description: '',
    is_featured: false
  });

  const countries = ['US', 'CA', 'UK', 'AU'];
  const issuers = ['Chase', 'American Express', 'Capital One', 'Citi', 'Discover', 'Bank of America', 'Wells Fargo'];
  const rewardTypes = ['points', 'miles', 'cashback'];

  useEffect(() => {
    fetchCards();
  }, [partnerId]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      
      // Fetch all available cards
      const { data: allCards, error: cardsError } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (cardsError) throw cardsError;

      // Fetch partner's selected cards
      const { data: selections, error: selectionsError } = await supabase
        .from('partner_card_selections')
        .select('*')
        .eq('partner_id', partnerId);

      if (selectionsError) throw selectionsError;

      // Combine the data
      const cardsWithSelections: CardWithSelection[] = allCards.map(card => {
        const selection = selections?.find(s => s.card_id === card.id);
        return {
          ...card,
          selection,
          isSelected: !!selection
        };
      });

      setCards(cardsWithSelections);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCardSelection = async (card: CardWithSelection) => {
    try {
      setSaving(true);
      
      if (card.isSelected && card.selection) {
        // Remove card from selection
        const { error } = await supabase
          .from('partner_card_selections')
          .delete()
          .eq('id', card.selection.id);

        if (error) throw error;
      } else {
        // Add card to selection
        const { error } = await supabase
          .from('partner_card_selections')
          .insert({
            partner_id: partnerId,
            card_id: card.id,
            priority_order: cards.filter(c => c.isSelected).length + 1,
            is_featured: false
          });

        if (error) throw error;
      }

      await fetchCards();
    } catch (error) {
      console.error('Error toggling card selection:', error);
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (card: CardWithSelection) => {
    if (card.selection) {
      setEditForm({
        affiliate_link: card.selection.affiliate_link || '',
        custom_description: card.selection.custom_description || '',
        is_featured: card.selection.is_featured
      });
      setEditingCard(card.id);
    }
  };

  const saveCardSettings = async (cardId: string) => {
    try {
      setSaving(true);
      const card = cards.find(c => c.id === cardId);
      if (!card?.selection) return;

      const { error } = await supabase
        .from('partner_card_selections')
        .update({
          affiliate_link: editForm.affiliate_link,
          custom_description: editForm.custom_description,
          is_featured: editForm.is_featured
        })
        .eq('id', card.selection.id);

      if (error) throw error;

      setEditingCard(null);
      await fetchCards();
    } catch (error) {
      console.error('Error saving card settings:', error);
    } finally {
      setSaving(false);
    }
  };

  // Filter and sort cards
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.issuer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || card.country === selectedCountry;
    const matchesIssuer = selectedIssuer === 'all' || card.issuer === selectedIssuer;
    const matchesRewardType = selectedRewardType === 'all' || card.reward_type === selectedRewardType;
    
    let matchesFee = true;
    if (feeFilter === 'free') matchesFee = card.annual_fee === 0;
    else if (feeFilter === 'low') matchesFee = card.annual_fee > 0 && card.annual_fee <= 100;
    else if (feeFilter === 'high') matchesFee = card.annual_fee > 100;

    return matchesSearch && matchesCountry && matchesIssuer && matchesRewardType && matchesFee;
  });

  const sortedCards = [...filteredCards].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'issuer':
        aValue = a.issuer;
        bValue = b.issuer;
        break;
      case 'annual_fee':
        aValue = a.annual_fee;
        bValue = b.annual_fee;
        break;
      case 'priority':
        aValue = a.selection?.priority_order || 999;
        bValue = b.selection?.priority_order || 999;
        break;
      default:
        aValue = a.name;
        bValue = b.name;
    }

    if (typeof aValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    } else {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
  });

  const selectedCards = sortedCards.filter(card => card.isSelected);
  const availableCards = sortedCards.filter(card => !card.isSelected);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading cards...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Card Management</h2>
        <p className="text-gray-600 mt-1">
          Select and configure credit cards to recommend to your users. Add affiliate links and customize descriptions.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by card name or issuer..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Country Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* Issuer Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Issuer</label>
            <select
              value={selectedIssuer}
              onChange={(e) => setSelectedIssuer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Issuers</option>
              {issuers.map(issuer => (
                <option key={issuer} value={issuer}>{issuer}</option>
              ))}
            </select>
          </div>

          {/* Reward Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reward Type</label>
            <select
              value={selectedRewardType}
              onChange={(e) => setSelectedRewardType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Types</option>
              {rewardTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Fee Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Annual Fee</label>
            <select
              value={feeFilter}
              onChange={(e) => setFeeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Fees</option>
              <option value="free">Free ($0)</option>
              <option value="low">Low ($1-100)</option>
              <option value="high">High ($100+)</option>
            </select>
          </div>
        </div>

        {/* Sort Options */}
        <div className="mt-4 flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="name">Name</option>
            <option value="issuer">Issuer</option>
            <option value="annual_fee">Annual Fee</option>
            <option value="priority">Priority Order</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Selected Cards */}
      {selectedCards.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Selected Cards ({selectedCards.length})</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {selectedCards.map((card) => (
              <div key={card.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center">
                      <FaCreditCard className="text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-medium text-gray-900">{card.name}</h4>
                        {card.selection?.is_featured && (
                          <FaStar className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{card.issuer} • {card.card_network}</p>
                      <p className="text-sm text-gray-600">
                        Annual Fee: ${card.annual_fee} • {card.reward_type}
                      </p>
                      {card.selection?.custom_description && (
                        <p className="text-sm text-gray-700 mt-2">{card.selection.custom_description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEditing(card)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <FaEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleCardSelection(card)}
                      disabled={saving}
                      className="p-2 text-red-400 hover:text-red-600"
                    >
                      <FaMinus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {editingCard === card.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Affiliate Link
                        </label>
                        <input
                          type="url"
                          value={editForm.affiliate_link}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            affiliate_link: e.target.value
                          })}
                          placeholder="https://your-affiliate-link.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Custom Description
                        </label>
                        <textarea
                          value={editForm.custom_description}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            custom_description: e.target.value
                          })}
                          rows={3}
                          placeholder="Add a custom description for this card..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editForm.is_featured}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              is_featured: e.target.checked
                            })}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Featured Card</span>
                        </label>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingCard(null)}
                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveCardSettings(card.id)}
                            disabled={saving}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>Priority: {card.selection?.priority_order || 0}</span>
                  </div>
                  {card.selection?.affiliate_link && (
                    <a
                      href={card.selection.affiliate_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800"
                    >
                      <FaExternalLinkAlt className="h-3 w-3" />
                      <span>View Link</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Cards */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Available Cards ({availableCards.length})</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {availableCards.map((card) => (
            <div key={card.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center">
                    <FaCreditCard className="text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{card.name}</h4>
                    <p className="text-sm text-gray-600">{card.issuer} • {card.card_network}</p>
                    <p className="text-sm text-gray-600">
                      Annual Fee: ${card.annual_fee} • {card.reward_type}
                    </p>
                    {card.welcome_bonus && (
                      <p className="text-sm text-green-600 mt-1">Welcome Bonus: {card.welcome_bonus}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Base: {card.base_earn_rate}x</span>
                      <span>Dining: {card.dining_earn_rate}x</span>
                      <span>Travel: {card.travel_earn_rate}x</span>
                      <span>Groceries: {card.groceries_earn_rate}x</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => toggleCardSelection(card)}
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  <FaPlus className="h-4 w-4" />
                  <span>Add Card</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardManagement; 