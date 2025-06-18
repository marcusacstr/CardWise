'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  FaArrowLeft, 
  FaDollarSign, 
  FaCreditCard, 
  FaDownload, 
  FaChartLine,
  FaCalendarAlt,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaEdit,
  FaPlus
} from 'react-icons/fa'

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'subscription' | 'commission' | 'fee'
  status: 'completed' | 'pending' | 'failed'
}

interface CommissionData {
  month: string
  revenue: number
  commission: number
  applications: number
}

export default function Billing() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddPayment, setShowAddPayment] = useState(false)

  const currentPlan = {
    name: 'Premium',
    price: 299,
    features: [
      'Unlimited custom portals',
      'Advanced analytics',
      'Priority support',
      'White-label branding',
      'API access',
      'Custom integrations'
    ]
  }

  const transactions: Transaction[] = [
    {
      id: '1',
      date: '2024-12-01',
      description: 'Premium Plan - December 2024',
      amount: -299,
      type: 'subscription',
      status: 'completed'
    },
    {
      id: '2',
      date: '2024-11-30',
      description: 'Commission Payment - November',
      amount: 12450.75,
      type: 'commission',
      status: 'completed'
    },
    {
      id: '3',
      date: '2024-11-01',
      description: 'Premium Plan - November 2024',
      amount: -299,
      type: 'subscription',
      status: 'completed'
    },
    {
      id: '4',
      date: '2024-10-31',
      description: 'Commission Payment - October',
      amount: 8920.50,
      type: 'commission',
      status: 'completed'
    }
  ]

  const commissionData: CommissionData[] = [
    { month: 'November 2024', revenue: 498030, commission: 12450.75, applications: 247 },
    { month: 'October 2024', revenue: 356820, commission: 8920.50, applications: 189 },
    { month: 'September 2024', revenue: 423150, commission: 10578.75, applications: 203 },
    { month: 'August 2024', revenue: 387240, commission: 9681.00, applications: 198 },
    { month: 'July 2024', revenue: 445680, commission: 11142.00, applications: 234 },
    { month: 'June 2024', revenue: 398760, commission: 9969.00, applications: 187 }
  ]

  const paymentMethods = [
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiry: '12/26',
      isDefault: true
    },
    {
      id: '2',
      type: 'bank',
      last4: '7890',
      bank: 'Chase Bank',
      isDefault: false
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'commission': return 'text-green-600'
      case 'subscription': return 'text-blue-600'
      case 'fee': return 'text-red-600'
      default: return 'text-gray-600'
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
              <h1 className="text-xl font-bold text-gray-900">Billing & Payments</h1>
            </div>
            
            <button 
              onClick={() => setShowAddPayment(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <FaPlus className="h-4 w-4 mr-2" />
              Add Payment Method
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'transactions', label: 'Transactions' },
              { id: 'commissions', label: 'Commissions' },
              { id: 'payment-methods', label: 'Payment Methods' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Current Plan */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{currentPlan.name} Plan</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-4">
                    ${currentPlan.price}<span className="text-lg font-normal text-gray-500">/month</span>
                  </p>
                  
                  <ul className="space-y-2">
                    {currentPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <FaCheck className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Next Payment</h4>
                    <p className="text-2xl font-bold text-gray-900">$299.00</p>
                    <p className="text-sm text-gray-600">Due January 1, 2025</p>
                  </div>
                  
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                    Manage Subscription
                  </button>
                </div>
              </div>
            </div>

            {/* Revenue Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100">
                    <FaDollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">$12,451</p>
                    <p className="text-sm text-green-600">+23.5% from last month</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <FaChartLine className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">$65,792</p>
                    <p className="text-sm text-blue-600">Last 6 months</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <FaCalendarAlt className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Next Payout</p>
                    <p className="text-2xl font-bold text-gray-900">Dec 15</p>
                    <p className="text-sm text-purple-600">5 days remaining</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                <button 
                  onClick={() => setActiveTab('transactions')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  View All
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getTypeColor(transaction.type)}`}>
                        {transaction.amount > 0 ? '+' : ''}${transaction.amount.toLocaleString()}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">All Transactions</h2>
              <button className="flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50">
                <FaDownload className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {transaction.type}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getTypeColor(transaction.type)}`}>
                        {transaction.amount > 0 ? '+' : ''}${transaction.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Commissions Tab */}
        {activeTab === 'commissions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Commission Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">2.5%</p>
                  <p className="text-sm text-gray-600">Commission Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">1,358</p>
                  <p className="text-sm text-gray-600">Total Applications</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">$65,792</p>
                  <p className="text-sm text-gray-600">Total Earned</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Monthly Commission History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Month
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Generated Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applications
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Commission Earned
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {commissionData.map((data, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {data.month}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${data.revenue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {data.applications}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          ${data.commission.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'payment-methods' && (
          <div className="space-y-6">
            {paymentMethods.map((method) => (
              <div key={method.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-gray-100">
                      <FaCreditCard className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {method.type === 'card' ? `${method.brand} ••••${method.last4}` : `${method.bank} ••••${method.last4}`}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {method.type === 'card' ? `Expires ${method.expiry}` : 'Bank Account'}
                        {method.isDefault && <span className="ml-2 text-blue-600">• Default</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <FaEdit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-red-400 hover:text-red-600">
                      <FaTimes className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 