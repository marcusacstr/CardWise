'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  FaArrowLeft, 
  FaCog, 
  FaSave, 
  FaSpinner,
  FaCheck,
  FaExclamationTriangle,
  FaToggleOn,
  FaToggleOff,
  FaEdit,
  FaTimes
} from 'react-icons/fa'

interface SystemSetting {
  id: string
  setting_key: string
  setting_value: any
  description: string
  updated_by: string
  updated_at: string
}

export default function SystemSettings() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<any>('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const SUPER_ADMIN_EMAILS = [
    'marcus@cardwise.com',
    'admin@cardwise.com',
    'team@cardwise.com',
  ]

  useEffect(() => {
    checkSuperAdminAuth()
    loadSettings()
  }, [])

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

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/super-admin/system-settings')
      const data = await response.json()

      if (response.ok) {
        setSettings(data.settings || [])
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load settings' })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      setMessage({ type: 'error', text: 'Failed to load settings' })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (setting: SystemSetting) => {
    setEditingKey(setting.setting_key)
    setEditValue(setting.setting_value)
  }

  const handleCancelEdit = () => {
    setEditingKey(null)
    setEditValue('')
  }

  const handleSave = async (setting: SystemSetting) => {
    setSaving(setting.setting_key)
    setMessage(null)

    try {
      const response = await fetch('/api/super-admin/system-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          setting_key: setting.setting_key,
          setting_value: editValue,
          description: setting.description
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Setting updated successfully!' })
        setEditingKey(null)
        await loadSettings()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update setting' })
      }
    } catch (error) {
      console.error('Error updating setting:', error)
      setMessage({ type: 'error', text: 'Failed to update setting' })
    } finally {
      setSaving(null)
    }
  }

  const toggleBooleanSetting = async (setting: SystemSetting) => {
    const newValue = setting.setting_value === 'true' ? 'false' : 'true'
    setSaving(setting.setting_key)
    setMessage(null)

    try {
      const response = await fetch('/api/super-admin/system-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          setting_key: setting.setting_key,
          setting_value: newValue,
          description: setting.description
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Setting updated successfully!' })
        await loadSettings()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update setting' })
      }
    } catch (error) {
      console.error('Error updating setting:', error)
      setMessage({ type: 'error', text: 'Failed to update setting' })
    } finally {
      setSaving(null)
    }
  }

  const renderSettingValue = (setting: SystemSetting) => {
    const isEditing = editingKey === setting.setting_key
    const isSaving = saving === setting.setting_key

    // Boolean settings
    if (setting.setting_value === 'true' || setting.setting_value === 'false') {
      return (
        <div className="flex items-center space-x-3">
          <button
            onClick={() => toggleBooleanSetting(setting)}
            disabled={isSaving}
            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              setting.setting_value === 'true'
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSaving ? (
              <FaSpinner className="animate-spin" />
            ) : setting.setting_value === 'true' ? (
              <FaToggleOn />
            ) : (
              <FaToggleOff />
            )}
            <span>{setting.setting_value === 'true' ? 'Enabled' : 'Disabled'}</span>
          </button>
        </div>
      )
    }

    // Editable settings
    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          <input
            type={isNaN(Number(setting.setting_value)) ? 'text' : 'number'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave(setting)
              if (e.key === 'Escape') handleCancelEdit()
            }}
          />
          <button
            onClick={() => handleSave(setting)}
            disabled={isSaving}
            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {isSaving ? <FaSpinner className="animate-spin" /> : <FaCheck />}
          </button>
          <button
            onClick={handleCancelEdit}
            className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      )
    }

    // Display mode
    return (
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900">{setting.setting_value}</span>
        <button
          onClick={() => handleEdit(setting)}
          className="text-blue-600 hover:text-blue-800 p-1"
        >
          <FaEdit />
        </button>
      </div>
    )
  }

  const getSettingIcon = (key: string) => {
    if (key.includes('maintenance')) return '🚧'
    if (key.includes('email')) return '📧'
    if (key.includes('file') || key.includes('csv')) return '📁'
    if (key.includes('commission') || key.includes('rate')) return '💰'
    if (key.includes('analytics') || key.includes('retention')) return '📊'
    if (key.includes('frequency') || key.includes('update')) return '🔄'
    return '⚙️'
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
                <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                <p className="text-sm text-gray-600">
                  Configure platform-wide settings and preferences
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FaCog className="text-gray-400" />
              <span className="text-sm text-gray-600">{settings.length} settings</span>
            </div>
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
                <FaExclamationTriangle className="mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        {/* Settings List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Platform Configuration</h3>
            <p className="text-sm text-gray-600 mt-1">
              Manage system-wide settings that affect all users and partners
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {settings.map((setting) => (
              <div key={setting.setting_key} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">{getSettingIcon(setting.setting_key)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{setting.description}</p>
                    
                    <div className="mb-3">
                      {renderSettingValue(setting)}
                    </div>

                    {setting.updated_by && (
                      <div className="text-xs text-gray-500">
                        Last updated by {setting.updated_by} on{' '}
                        {new Date(setting.updated_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warning Notice */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <FaExclamationTriangle className="text-yellow-600 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800">Important Notice</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Changes to these settings affect the entire platform and all users. Please be careful when modifying values.
                Some changes may require a platform restart to take effect.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h4 className="font-medium text-gray-900 mb-2">Maintenance Mode</h4>
            <p className="text-sm text-gray-600 mb-3">
              Quickly enable maintenance mode to perform system updates
            </p>
            <button
              onClick={() => {
                const maintenanceSetting = settings.find(s => s.setting_key === 'platform_maintenance_mode')
                if (maintenanceSetting) toggleBooleanSetting(maintenanceSetting)
              }}
              className="text-sm bg-yellow-600 text-white px-3 py-1 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Toggle Maintenance
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h4 className="font-medium text-gray-900 mb-2">Email Notifications</h4>
            <p className="text-sm text-gray-600 mb-3">
              Enable or disable platform-wide email notifications
            </p>
            <button
              onClick={() => {
                const emailSetting = settings.find(s => s.setting_key === 'email_notifications_enabled')
                if (emailSetting) toggleBooleanSetting(emailSetting)
              }}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Toggle Emails
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h4 className="font-medium text-gray-900 mb-2">System Health</h4>
            <p className="text-sm text-gray-600 mb-3">
              All systems operational and settings loaded successfully
            </p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600">Healthy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 