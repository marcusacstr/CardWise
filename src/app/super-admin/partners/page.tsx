'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  FaArrowLeft, 
  FaSearch, 
  FaFilter, 
  FaTrash, 
  FaBan, 
  FaCheck, 
  FaEye,
  FaBuilding,
  FaDollarSign,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaSpinner
} from 'react-icons/fa'

interface Partner {
  id: string
  email: string
  full_name: string
  company_name: string
  phone: string
  website: string
  is_active: boolean
  subscription_tier: string
  created_at: string
  last_login: string
  total_portals: number
  monthly_revenue: number
}

export default function PartnerManagement() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [partners, setPartners] = useState<Partner[]>([])
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterTier, setFilterTier] = useState('all')
  const [selectedPartners, setSelectedPartners] = useState<string[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [actionType, setActionType] = useState<'terminate' | 'activate' | 'delete'>('terminate')
  const [processingAction, setProcessingAction] = useState(false)

  const SUPER_ADMIN_EMAILS = [
    'marcus@cardwise.com',
    'admin@cardwise.com',
    'team@cardwise.com',
  ]

  useEffect(() => {
    checkSuperAdminAuth()
    loadPartners()
  }, [])

  useEffect(() => {
    filterPartners()
  }, [partners, searchTerm, filterStatus, filterTier])

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

  const loadPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select(`
          id,
          email,
          full_name,
          company_name,
          phone,
          website,
          is_active,
          subscription_tier,
          created_at,
          last_login
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform data and add mock portal counts and revenue
      const partnersWithStats = (data || []).map(partner => ({
        ...partner,
        subscription_tier: partner.subscription_tier || 'basic',
        total_portals: Math.floor(Math.random() * 5) + 1, // Mock data
        monthly_revenue: partner.is_active ? (partner.subscription_tier === 'premium' ? 199 : 99) : 0
      }))

      setPartners(partnersWithStats)
    } catch (error) {
      console.error('Error loading partners:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPartners = () => {
    let filtered = partners

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(partner =>
        partner.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(partner =>
        filterStatus === 'active' ? partner.is_active : !partner.is_active
      )
    }

    // Tier filter
    if (filterTier !== 'all') {
      filtered = filtered.filter(partner => partner.subscription_tier === filterTier)
    }

    setFilteredPartners(filtered)
  }

  const handleSelectPartner = (partnerId: string) => {
    setSelectedPartners(prev =>
      prev.includes(partnerId)
        ? prev.filter(id => id !== partnerId)
        : [...prev, partnerId]
    )
  }

  const handleSelectAll = () => {
    setSelectedPartners(
      selectedPartners.length === filteredPartners.length
        ? []
        : filteredPartners.map(p => p.id)
    )
  }

  const handleBulkAction = (action: 'terminate' | 'activate' | 'delete') => {
    if (selectedPartners.length === 0) return
    setActionType(action)
    setShowConfirmDialog(true)
  }

  const executeBulkAction = async () => {
    setProcessingAction(true)
    try {
      let updateData: any = {}
      
      switch (actionType) {
        case 'terminate':
          updateData = { is_active: false }
          break
        case 'activate':
          updateData = { is_active: true }
          break
        case 'delete':
          // For delete, we'll just deactivate to preserve data
          updateData = { is_active: false, deleted_at: new Date().toISOString() }
          break
      }

      const { error } = await supabase
        .from('partners')
        .update(updateData)
        .in('id', selectedPartners)

      if (error) throw error

      // Reload partners
      await loadPartners()
      setSelectedPartners([])
      setShowConfirmDialog(false)
    } catch (error) {
      console.error('Error executing bulk action:', error)
    } finally {
      setProcessingAction(false)
    }
  }

  const getSubscriptionBadge = (tier: string) => {
    const colors = {
      basic: 'bg-gray-100 text-gray-800',
      premium: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-blue-100 text-blue-800'
    }
    return colors[tier as keyof typeof colors] || colors.basic
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
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
                <h1 className="text-2xl font-bold text-gray-900">Partner Management</h1>
                <p className="text-sm text-gray-600">
                  Manage partner accounts, subscriptions, and access
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search partners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Tiers</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>

            <div className="flex space-x-2">
              {selectedPartners.length > 0 && (
                <>
                  <button
                    onClick={() => handleBulkAction('terminate')}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    <FaBan className="mr-1" />
                    Terminate
                  </button>
                  <button
                    onClick={() => handleBulkAction('activate')}
                    className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <FaCheck className="mr-1" />
                    Activate
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Partners Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Partners ({filteredPartners.length})
              </h3>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedPartners.length === filteredPartners.length && filteredPartners.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Portals
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedPartners.includes(partner.id)}
                        onChange={() => handleSelectPartner(partner.id)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <FaBuilding className="text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {partner.company_name || 'No Company Name'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {partner.full_name} • {partner.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(partner.is_active)}`}>
                        {partner.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSubscriptionBadge(partner.subscription_tier)}`}>
                        {partner.subscription_tier.charAt(0).toUpperCase() + partner.subscription_tier.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaDollarSign className="mr-1 text-green-600" />
                        ${partner.monthly_revenue}/mo
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {partner.total_portals} portals
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        {new Date(partner.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/super-admin/partners/${partner.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FaEye />
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedPartners([partner.id])
                            setActionType(partner.is_active ? 'terminate' : 'activate')
                            setShowConfirmDialog(true)
                          }}
                          className={`${partner.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {partner.is_active ? <FaBan /> : <FaCheck />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <FaExclamationTriangle className="text-red-600 text-xl mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {actionType} {selectedPartners.length} partner(s)? 
              {actionType === 'terminate' && ' This will deactivate their accounts and portals.'}
              {actionType === 'delete' && ' This action cannot be undone.'}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeBulkAction}
                disabled={processingAction}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
              >
                {processingAction ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  `${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 