'use client';

import React, { useState } from 'react';
import SpendingInputForm from '@/components/SpendingInputForm';
// import { FaRegChartBar, FaDollarSign, FaUpload, FaPen } from 'react-icons/fa'; // Importing icons needed for the layout
import { FaDollarSign } from 'react-icons/fa'; // Keep FaDollarSign as it's used
import { CardRecommendation } from '@/components/SpendingInputForm'; // Import the type

// Placeholder for Analysis Results component (to be created or detailed later)
const SpendingAnalysisResults = () => (
  <div className="mt-8 p-6 bg-card rounded-lg shadow-md border border-border">
    <h3 className="text-2xl font-semibold text-foreground mb-4">Spending Analysis Results</h3>
    <p className="text-muted-foreground">Analysis results will appear here after you upload a statement or enter spending.</p>
    {/* Placeholder for detailed results, charts, recommendations, etc. */}
  </div>
);

export default function AnalyzeSpendingPage() {
  const [analysisResults, setAnalysisResults] = useState<CardRecommendation[] | null>(null); // State to hold analysis results, typed

  // Function to handle receiving analysis results from the form/backend
  const handleAnalysisComplete = (results: CardRecommendation[]) => {
    setAnalysisResults(results);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-foreground mb-8">Analyze Your Spending</h1>

      {/* Spending Input Section */}
      <div className="bg-card rounded-lg shadow-md p-6 border border-border mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Upload Statement or Enter Spending</h2>
        <p className="text-muted-foreground mb-6">Upload a credit card statement CSV or manually enter transactions to get personalized credit card recommendations.</p>
        
        {/* The SpendingInputForm component will handle the actual input methods */}
        <SpendingInputForm onAnalysisComplete={handleAnalysisComplete} />

      </div>

      {/* Estimated Savings & Uploaded Statements Section */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg shadow-md border border-border flex items-center justify-between">
          <div>
            <p className="text-lg text-muted-foreground">Estimated Annual Savings</p>
            {/* Placeholder for dynamic value */}
            <p className="text-3xl font-bold text-foreground flex items-center"><FaDollarSign className="text-primary mr-2 text-2xl" />--.--</p>
            <p className="text-sm text-muted-foreground">Compared to your current card (if selected).</p>
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-md border border-border flex items-center justify-between">
          <div>
            <p className="text-lg text-muted-foreground">Uploaded Statements</p>
            {/* Placeholder for dynamic count */}
            <p className="text-3xl font-bold text-foreground">--</p>
            <p className="text-sm text-muted-foreground">Keep uploading to refine recommendations</p>
          </div>
        </div>
      </div>

      {/* Analysis Results Section (Conditional) */}
      {analysisResults ? (
        <SpendingAnalysisResults /> // Render results component if analysis is complete
      ) : (
        <div className="mt-8 p-6 bg-card rounded-lg shadow-md border border-border text-center text-muted-foreground">
          <p>Your analysis results will appear here.</p>
        </div>
      )}

    </div>
  );
} 