'use client'
import React from 'react'
import Link from 'next/link'
import { FaRegLightbulb, FaDollarSign, FaRegGem } from 'react-icons/fa'
import CardStackGraphic from '@/components/CardStackGraphic'
import PartnerPortalMockup from '@/components/PartnerPortalMockup'

const ValuePropositionFlow = () => (
  <section className="w-full py-20 bg-background">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl font-bold tracking-tighter text-foreground sm:text-4xl md:text-5xl">Unlock New Opportunities with CardWise</h2>
      <p className="mt-4 text-xl text-muted-foreground lg:mx-auto md:w-2/3">
        CardWise empowers financial advisors and travel gurus to deliver unparalleled value to their clients while creating new revenue streams.
      </p>
      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="pt-6">
          <div className="flow-root bg-muted/50 rounded-lg px-6 pb-8">
            <div className="-mt-6">
              <div>
                <span className="inline-flex items-center justify-center p-3 bg-green-600 rounded-md shadow-lg">
                  <FaRegLightbulb className="h-6 w-6 text-white" aria-hidden="true" />
                </span>
              </div>
              <h3 className="mt-8 text-lg font-medium text-foreground tracking-tight">Enhanced Client Value</h3>
              <p className="mt-5 text-base text-muted-foreground">
                Provide personalized credit card recommendations tailored to your clients' spending habits, helping them maximize rewards and save money.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <div className="flow-root bg-muted/50 rounded-lg px-6 pb-8">
            <div className="-mt-6">
              <div>
                <span className="inline-flex items-center justify-center p-3 bg-green-600 rounded-md shadow-lg">
                  <FaDollarSign className="h-6 w-6 text-white" aria-hidden="true" />
                </span>
              </div>
              <h3 className="mt-8 text-lg font-medium text-foreground tracking-tight">New Revenue Streams</h3>
              <p className="mt-5 text-base text-muted-foreground">
                Integrate seamlessly with affiliate programs and earn commissions on recommended cards, turning your expertise into a profitable venture.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <div className="flow-root bg-muted/50 rounded-lg px-6 pb-8">
            <div className="-mt-6">
              <div>
                <span className="inline-flex items-center justify-center p-3 bg-green-600 rounded-md shadow-lg">
                  <FaRegGem className="h-6 w-6 text-white" aria-hidden="true" />
                </span>
              </div>
              <h3 className="mt-8 text-lg font-medium text-foreground tracking-tight">Strengthened Client Relationships</h3>
              <p className="mt-5 text-base text-muted-foreground">
                Become an indispensable resource by offering data-driven financial insights and personalized recommendations that build trust and loyalty.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center">
      <section className="w-full py-6 md:py-8 lg:py-12 flex flex-col md:flex-row items-center justify-between">
        <div className="container px-4 md:px-6 text-left md:w-1/2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl leading-none mb-4">
            Empower Your Clients with a White-Label Card Recommendation Platform
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Offer personalized credit card recommendations and financial insights under your own brand. Enhance client relationships and unlock new revenue streams.
          </p>
          <div className="space-x-4">
            <Link href="/about" className="bg-green-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-green-700">
              About Us
            </Link>
            <Link href="/contact" className="text-green-600 border border-green-600 px-6 py-3 rounded-md text-lg font-semibold hover:bg-green-50">Request a Demo</Link>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center mt-8 md:mt-0">
          <CardStackGraphic />
        </div>
      </section>

      <ValuePropositionFlow />

      <section className="w-full bg-muted/50 py-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Your Clients Experience
            </h2>
            <p className="mt-4 text-xl text-muted-foreground">
              A beautiful, intuitive interface for your clients to manage their cards and get personalized recommendations
            </p>
          </div>
          
          <div className="mt-8 flex justify-center">
            <div className="transform scale-90 origin-top">
              <PartnerPortalMockup />
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-16 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8">
            Join forward-thinking financial professionals who are already earning with CardWise
          </p>
          <div className="space-x-4">
            <Link href="/contact" className="bg-white text-green-600 px-8 py-4 rounded-md text-lg font-semibold hover:bg-gray-100 transition-colors">
              Request a Demo
            </Link>
            <Link href="/pricing" className="border-2 border-white text-white px-8 py-4 rounded-md text-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}