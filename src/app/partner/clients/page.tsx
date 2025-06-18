'use client'

import React, { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { FaArrowLeft, FaUsers, FaSearch, FaEdit, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

interface ClientUser {
  id: string;
  email: string;
  created_at: string;
  is_partner?: boolean;
  full_name?: string | null;
  last_sign_in_at?: string | null;
  // Add other relevant user fields here
}

const ITEMS_PER_PAGE = 10;

export default function ClientManagementPage() {
  const supabase = createClientComponentClient()
  const [clients, setClients] = useState<ClientUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchClients = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError(userError?.message || 'User not authenticated')
        setLoading(false)
        return
      }

      // Calculate offset for pagination
      const offset = (currentPage - 1) * ITEMS_PER_PAGE

      // Fetch users associated with this partner from the 'profiles' table
      const { data: clientsData, error: fetchError, count } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at, is_partner, last_sign_in_at', { count: 'exact' })
        .eq('partner_id', user.id)
        .ilike('email', `%${searchTerm}%`)
        .range(offset, offset + ITEMS_PER_PAGE - 1)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Filter for non-partner users
      const filteredClients = clientsData ? clientsData.filter((client: any) => !client.is_partner) : []
      setClients(filteredClients)
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE))

    } catch (err: any) {
      console.error('Error fetching clients:', err)
      setError(err.message || 'Failed to fetch clients.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch clients on initial load and when search term or page changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1) // Reset to first page on search
      fetchClients()
    }, 500) // Debounce for 500ms

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm])

  useEffect(() => {
    fetchClients()
  }, [currentPage])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleViewClient = (clientId: string) => {
    setActionLoading(clientId)
    // Implement view client logic
    setTimeout(() => {
      alert(`View client with ID: ${clientId} - functionality to be implemented`)
      setActionLoading(null)
    }, 500)
  }

  const handleDeleteClient = async (clientId: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      setActionLoading(clientId)
      try {
        // Implement deletion logic
        await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
        alert(`Delete client with ID: ${clientId} - functionality to be implemented`)
        await fetchClients() // Refresh the list
      } catch (err) {
        console.error('Error deleting client:', err)
        setError('Failed to delete client')
      } finally {
        setActionLoading(null)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/partner/dashboard" className="inline-flex items-center text-green-600 hover:text-green-800 mb-4">
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="mt-2 text-sm text-gray-600">View and manage the users who have signed up through your white-label platform.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search clients by email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sign Up Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      No clients found.
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {client.full_name || client.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(client.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {client.last_sign_in_at ? new Date(client.last_sign_in_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewClient(client.id)}
                          disabled={actionLoading === client.id}
                          className={`text-green-600 hover:text-green-900 mr-4 ${actionLoading === client.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {actionLoading === client.id ? (
                            <div className="animate-spin h-5 w-5 border-b-2 border-green-600"></div>
                          ) : (
                            <FaEdit className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          disabled={actionLoading === client.id}
                          className={`text-red-600 hover:text-red-900 ${actionLoading === client.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {actionLoading === client.id ? (
                            <div className="animate-spin h-5 w-5 border-b-2 border-red-600"></div>
                          ) : (
                            <FaTrash className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Previous</span>
                      <FaChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-green-50 border-green-500 text-green-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Next</span>
                      <FaChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 