"use client"

import React from 'react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { FaUserPlus, FaChartBar, FaChartLine, FaPalette, FaCreditCard, FaUsers, FaDollarSign, FaCog, FaFileAlt } from 'react-icons/fa'

export default function PartnerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [partner, setPartner] = useState<any>(null)
  const [stats, setStats] = useState<any>({ users: 0, reports: 0, engagement: 0 })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getPartnerData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/auth')
        return
      }
      setUser(user)
      // Fetch user row to get partner_id
      const { data: userRow } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single()
      if (!userRow) {
        setLoading(false)
        return
      }
      // Fetch partner info
      const { data: partnerRow } = await supabase
        .from('partners')
        .select('*')
        .eq('id', userRow.partner_id)
        .single()
      setPartner(partnerRow)
      // Fetch stats
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('partner_id', userRow.partner_id)
      const { count: reportCount } = await supabase
        .from('user_recommendations')
        .select('*', { count: 'exact', head: true })
        .in('user_id', [userRow.id]) // For demo, just this user; for all, fetch all user IDs for this partner
      // Engagement: mock for now
      setStats({ users: userCount || 0, reports: reportCount || 0, engagement: 65 })
      setLoading(false)
    }
    getPartnerData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Partner Dashboard</h1>

      {/* User Portal Configuration Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">User Portal Configuration</h2>
        <div className="bg-gray-100 p-4 rounded-md">
          {/* Configuration settings will go here */}
          <div className="space-y-4">
            <div>
              <label htmlFor="portal-name" className="block text-sm font-medium text-gray-700">Portal Name</label>
              <input
                type="text"
                name="portal-name"
                id="portal-name"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="e.g., My Company Card Portal"
              />
            </div>
            <div>
              <label htmlFor="primary-color" className="block text-sm font-medium text-gray-700">Primary Color</label>
              <input
                type="color"
                name="primary-color"
                id="primary-color"
                className="mt-1 block w-20 h-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                defaultValue="#4F46E5" // Default to green-600
              />
            </div>
            {/* Add more configuration options as needed */}
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Analytics</h2>
        <div className="bg-gray-100 p-4 rounded-md">
          {/* Analytics charts and data will go here */}
          <p>Content for viewing analytics (revenue, user activity) will be added here.</p>
        </div>
      </section>

      {/* Subscription and Payment Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Subscription and Payment</h2>
        <div className="bg-gray-100 p-4 rounded-md">
          {/* Subscription and payment management forms/info will go here */}
          <p>Content for managing subscription and payment methods will be added here.</p>
        </div>
      </section>

      {/* Card Selection Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Available Cards for Users</h2>
        <div className="bg-gray-100 p-4 rounded-md">
          {/* Card selection interface will go here */}
          <p>Content for selecting which cards are available to users will be added here.</p>
        </div>
      </section>
    </div>
  )
} 