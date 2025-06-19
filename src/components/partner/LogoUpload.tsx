'use client'

import React, { useState, useRef, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  FaUpload, 
  FaImage, 
  FaSpinner, 
  FaCheck, 
  FaExclamationTriangle,
  FaTimes,
  FaTrash
} from 'react-icons/fa'

interface LogoUploadProps {
  currentLogoUrl?: string
  onLogoUpdate: (logoUrl: string) => void
  className?: string
}

export default function LogoUpload({ currentLogoUrl, onLogoUpdate, className = '' }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentLogoUrl || null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClientComponentClient()

  const handleFileUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setMessage({ 
        type: 'error', 
        text: 'Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.' 
      })
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setMessage({ 
        type: 'error', 
        text: 'File too large. Please upload an image smaller than 5MB.' 
      })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      // Create form data
      const formData = new FormData()
      formData.append('logo', file)

      // Upload to API
      const response = await fetch('/api/partner/upload-logo', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setPreview(data.logoUrl)
        onLogoUpdate(data.logoUrl)
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Upload failed' })
        setPreview(currentLogoUrl || null)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setMessage({ type: 'error', text: 'Upload failed. Please try again.' })
      setPreview(currentLogoUrl || null)
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const removeLogo = async () => {
    if (!confirm('Are you sure you want to remove your logo?')) return

    try {
      // Get current user and partner info
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: partner, error: partnerError } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (partnerError || !partner) {
        throw new Error('Partner record not found')
      }

      // If there's a current logo, try to delete it from storage
      if (partner.logo_url) {
        // Check if it's a Supabase storage URL or local file
        if (partner.logo_url.includes('supabase')) {
          // Extract filename from Supabase URL for deletion
          const urlParts = partner.logo_url.split('/')
          const fileName = urlParts[urlParts.length - 1]
          
          // Delete from Supabase storage (ignore errors as file might not exist)
          await supabase.storage
            .from('partner-logos')
            .remove([fileName])
        }
        // For local files, we don't delete them as they're in development
      }

      // Update partner to remove logo
      const { error } = await supabase
        .from('partners')
        .update({ 
          logo_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      // Also update portal configs
      await supabase
        .from('partner_portal_configs')
        .update({ 
          logo_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('partner_id', partner.id)

      setPreview(null)
      onLogoUpdate('')
      setMessage({ type: 'success', text: 'Logo removed successfully' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error removing logo:', error)
      setMessage({ type: 'error', text: 'Failed to remove logo' })
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Logo Preview */}
      {preview && (
        <div className="relative">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900">Current Logo</h4>
              <button
                onClick={removeLogo}
                className="text-red-600 hover:text-red-800 p-1"
                title="Remove logo"
              >
                <FaTrash className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
              <img
                src={preview}
                alt="Partner Logo"
                className="max-h-20 max-w-40 object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        <div className="space-y-4">
          {uploading ? (
            <div className="flex flex-col items-center">
              <FaSpinner className="h-8 w-8 text-green-600 animate-spin mb-2" />
              <p className="text-sm text-gray-600">Uploading logo...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <FaImage className="h-8 w-8 text-gray-400 mb-2" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-green-600 cursor-pointer">
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF or WebP up to 5MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
      >
        {uploading ? (
          <>
            <FaSpinner className="animate-spin" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <FaUpload />
            <span>Choose Logo File</span>
          </>
        )}
      </button>

      {/* Messages */}
      {message && (
        <div className={`p-3 rounded-lg ${
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
            <span className="text-sm">{message.text}</span>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Logo will appear on your customer portals</p>
        <p>• Recommended size: 200x60px or similar aspect ratio</p>
        <p>• Transparent backgrounds work best</p>
      </div>
    </div>
  )
} 