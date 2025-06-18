'use client';

import React, { useState } from 'react';
import { FaDollarSign } from 'react-icons/fa';

interface CardRecommendation {
  id: string;
  name: string;
}

export default function AnalyzeSpendingPage() {
  const [analysisResults, setAnalysisResults] = useState<CardRecommendation[] | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-foreground mb-8">Analyze Your Spending</h1>

      {/* Spending Input Section */}
      <div className="bg-card rounded-lg shadow-md p-6 border border-border mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Upload Statement or Enter Spending</h2>
        <p className="text-muted-foreground mb-6">Upload a credit card statement CSV or manually enter transactions to get personalized credit card recommendations.</p>
        
        <div className="p-4 bg-gray-100 rounded text-center text-gray-600">
          SpendingInputForm component - Coming soon
        </div>
      </div>

      {/* Estimated Savings & Uploaded Statements Section */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg shadow-md border border-border flex items-center justify-between">
          <div>
            <p className="text-lg text-muted-foreground">Estimated Annual Savings</p>
            <p className="text-3xl font-bold text-foreground flex items-center"><FaDollarSign className="text-primary mr-2 text-2xl" />--.--</p>
            <p className="text-sm text-muted-foreground">Compared to your current card (if selected).</p>
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-md border border-border flex items-center justify-between">
          <div>
            <p className="text-lg text-muted-foreground">Uploaded Statements</p>
            <p className="text-3xl font-bold text-foreground">--</p>
            <p className="text-sm text-muted-foreground">Keep uploading to refine recommendations</p>
          </div>
        </div>
      </div>

      {/* Analysis Results Section (Conditional) */}
      {analysisResults ? (
        <div className="p-4 bg-green-100 rounded text-center text-green-700">
          SpendingAnalysisResults component - Coming soon
        </div>
      ) : (
        <div className="mt-8 p-6 bg-card rounded-lg shadow-md border border-border text-center text-muted-foreground">
          <p>Your analysis results will appear here.</p>
        </div>
      )}
    </div>
  );
} 