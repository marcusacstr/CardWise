import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CardWise - Smart Credit Card Recommendations',
  description: 'Get personalized credit card recommendations based on your spending habits',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
