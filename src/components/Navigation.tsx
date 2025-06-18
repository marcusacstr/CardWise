'use client'
import React from 'react'
import Link from 'next/link'

export default function Navigation() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-green-600">
              CardWise
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-gray-700 hover:text-green-600">
              Dashboard
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-green-600">
              Pricing
            </Link>
            <Link href="/partner" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              Partner Portal
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
