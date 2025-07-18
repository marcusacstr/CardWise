'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  FaArrowLeft, 
  FaPlus, 
  FaEye, 
  FaEdit,
  FaGlobe, 
  FaExternalLinkAlt,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCopy
} from 'react-icons/fa'

interface Portal {
  id: string
  portal_name: string
  subdomain: string
  custom_domain?: string
  test_url: string
  status: string
  created_at: string
  partner_portal_configs: Array<{
    company_name: string
    primary_color: string
  }>
}

export default function PortalManagement() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [portals, setPortals] = useState<Portal[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [newPortal, setNewPortal] = useState({
    portalName: '',
    subdomain: '',
    companyName: ''
  })

  useEffect(() => {
    loadPortals()
  }, [])

  const loadPortals = async () => {
    try {
      const response = await fetch('/api/partner/portals')
      const data = await response.json()
      
      if (data.success) {
        setPortals(data.portals)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load portals' })
      }
    } catch (error) {
      console.error('Error loading portals:', error)
      setMessage({ type: 'error', text: 'Failed to load portals' })
    } finally {
      setLoading(false)
    }
  }

  const createPortal = async () => {
    if (!newPortal.portalName || !newPortal.subdomain || !newPortal.companyName) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' })
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/partner/portal/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portalName: newPortal.portalName,
          subdomain: newPortal.subdomain.toLowerCase(),
          companyName: newPortal.companyName,
          primaryColor: '#10B981',
          secondaryColor: '#059669'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Portal created successfully!' })
        setShowCreateModal(false)
        setNewPortal({ portalName: '', subdomain: '', companyName: '' })
        await loadPortals()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create portal' })
      }
    } catch (error) {
      console.error('Error creating portal:', error)
      setMessage({ type: 'error', text: 'Failed to create portal' })
    } finally {
      setCreating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setMessage({ type: 'success', text: 'URL copied to clipboard!' })
    setTimeout(() => setMessage(null), 3000)
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
                href="/partner/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Portal Management</h1>
                <p className="text-sm text-gray-600">
                  Create and manage your customer portals
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <FaPlus />
              <span>Create New Portal</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <FaCheckCircle className="mr-2" />
              ) : (
                <FaExclamationTriangle className="mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        {/* Portals Grid */}
        {portals.length === 0 ? (
          <div className="text-center py-12">
            <FaGlobe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No portals yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first customer portal to start earning commissions
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <FaPlus />
              <span>Create Your First Portal</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portals.map((portal) => (
              <div key={portal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {portal.portal_name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {portal.partner_portal_configs?.[0]?.company_name || 'No company name'}
                    </p>
                    <p className="text-xs text-blue-600">
                      localhost:3000/portal/{portal.subdomain}
                    </p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    portal.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {portal.status}
                  </span>
                </div>

                {/* Portal URL */}
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-gray-600">Portal URL:</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => copyToClipboard(portal.test_url)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaCopy className="h-3 w-3" />
                    </button>
                    <a
                      href={portal.test_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaExternalLinkAlt className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Link
                      href={`/partner/portal-builder?portalId=${portal.id}`}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                      title="Edit Portal"
                    >
                      <FaEdit className="h-4 w-4" />
                    </Link>
                    <a
                      href={portal.test_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                      title="Preview Portal"
                    >
                      <FaEye className="h-4 w-4" />
                    </a>
                  </div>
                  <div className="text-xs text-gray-500">
                    Created {new Date(portal.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Portal Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Portal</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Portal Name *
                  </label>
                  <input
                    type="text"
                    value={newPortal.portalName}
                    onChange={(e) => setNewPortal({...newPortal, portalName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="My Credit Card Portal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={newPortal.companyName}
                    onChange={(e) => setNewPortal({...newPortal, companyName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Your Company Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subdomain *
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={newPortal.subdomain}
                      onChange={(e) => setNewPortal({...newPortal, subdomain: e.target.value.toLowerCase()})}
                      className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="my-portal"
                    />
                    <span className="bg-gray-50 border border-l-0 border-gray-300 rounded-r-lg px-3 py-2 text-sm text-gray-600">
                      .cardwise-demo.com
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewPortal({ portalName: '', subdomain: '', companyName: '' })
                  }}
                  className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createPortal}
                  disabled={creating}
                  className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
                >
                  {creating ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      <span>Create Portal</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 