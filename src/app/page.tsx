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

