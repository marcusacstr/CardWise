'use client';

import React from 'react';
import { FaFileInvoiceDollar, FaBrain, FaCreditCard, FaArrowRight } from 'react-icons/fa';

export default function ValuePropositionFlow() {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-card rounded-lg shadow-xl border border-border group relative overflow-hidden w-full max-w-lg min-h-64">

      {/* Background Flow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-green-50 opacity-50 transition-opacity duration-500 group-hover:opacity-70"></div>

      <div className="relative z-10 flex items-center justify-around w-full h-full gap-4">
        {/* Input: Statements */}
        <div className="flex flex-col items-center text-center">
          <div className="text-primary text-5xl mb-2 transition-transform duration-500 group-hover:-translate-y-2">
            <FaFileInvoiceDollar />
          </div>
          <p className="text-sm font-semibold text-foreground">Spending Data</p>
        </div>

        {/* Arrow 1 */}
        <div className="text-muted-foreground text-3xl transition-transform duration-500 group-hover:translate-x-2">
          <FaArrowRight />
        </div>

        {/* Process: AI Analysis */}
        <div className="flex flex-col items-center text-center">
          <div className="text-primary text-5xl mb-2 transition-transform duration-500 group-hover:scale-110">
            <FaBrain />
          </div>
          <p className="text-sm font-semibold text-foreground">AI Analysis</p>
        </div>

         {/* Arrow 2 */}
         <div className="text-muted-foreground text-3xl transition-transform duration-500 group-hover:translate-x-2 delay-150">
          <FaArrowRight />
        </div>

        {/* Output: Recommendations */}
        <div className="flex flex-col items-center text-center">
          <div className="text-primary text-5xl mb-2 transition-transform duration-500 group-hover:translate-y-2">
            <FaCreditCard />
          </div>
          <p className="text-sm font-semibold text-foreground">Recommendations</p>
        </div>
      </div>
    </div>
  );
}
