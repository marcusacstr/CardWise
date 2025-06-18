'use client'
import React from 'react'
import Link from 'next/link'

export default function TestStatementUploadPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Test Statement Upload</h1>
      <p className="text-gray-600 mb-8">This page is under development.</p>
      <Link href="/partner/dashboard" className="text-green-600 hover:underline">
        Go back to Dashboard
      </Link>
    </div>
  )
} 