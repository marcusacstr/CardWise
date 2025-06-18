import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'CardWise - Optimize Your Credit Card Rewards',
  description: 'A white-labeled SaaS platform for financial advisors, travel gurus, and influencers to help their audience optimize credit card rewards based on spending habits.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-background text-foreground`}>
        <Navigation />
        <main>
          {children}
        </main>
      </body>
    </html>
  )
} 