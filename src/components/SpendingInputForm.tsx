'use client';

import React, { useState } from 'react';
import { FaDollarSign, FaUpload, FaPen } from 'react-icons/fa'; // Import icons for manual input fields and CSV upload
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Papa from 'papaparse'; // Import PapaParse

// Define the props the component accepts
interface SpendingInputFormProps {
  onAnalysisComplete: (results: CardRecommendation[]) => void;
  userId?: string; // Add optional userId prop
}

// Define type for recommendations
export interface CardRecommendation {
  card_name: string;
  estimated_annual_value: number;
  description: string;
}

// Update the component signature to accept the props
const SpendingInputForm: React.FC<SpendingInputFormProps> = ({ onAnalysisComplete, userId }) => {
  const supabase = createClientComponentClient(); // Initialize Supabase client
  const [selectedMethod, setSelectedMethod] = useState<'csv' | 'manual'>('csv'); // State to track selected method
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [manualSpending, setManualSpending] = useState({
    groceries: '',
    dining: '',
    travel: '',
    gas: '',
    other: '',
  });

  const [recommendations, setRecommendations] = useState<CardRecommendation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setCsvFile(selectedFile);
      // Clear manual input when a file is selected
      setManualSpending({
        groceries: '',
        dining: '',
        travel: '',
        gas: '',
        other: '',
      });
      setRecommendations(null); // Clear previous results
      setError(null); // Clear previous errors
      setSelectedMethod('csv'); // Ensure method is set to csv
    }
  };

   const handleManualInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    // Allow only numbers and a single decimal point
    const numericValue = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setManualSpending({
      ...manualSpending,
      [name]: numericValue
    });
    // Clear selected file when manual input is used
    setCsvFile(null);
    setRecommendations(null); // Clear previous results
    setError(null); // Clear previous errors
    setSelectedMethod('manual'); // Ensure method is set to manual
  };

  const handleAnalyzeSpending = async () => {
    // Determine if using file upload or manual input based on selectedMethod
    const useFileUpload = selectedMethod === 'csv' && !!csvFile;
    const useManualInput = selectedMethod === 'manual' && Object.values(manualSpending).some(value => value !== '');

    if (selectedMethod === 'csv' && !csvFile) {
        setError('Please select a CSV file to upload.');
        return;
    } else if (selectedMethod === 'manual' && !Object.values(manualSpending).some(value => parseFloat(value || '0') > 0)) {
        // Check if at least one manual spending amount is entered and is a positive number
        setError('Please enter valid spending amounts manually.');
        return;
    }

    setLoading(true);
    setError(null);
    setRecommendations(null); // Clear previous recommendations

    try {
      let spendingDataToSend: string | Record<string, number> = '';

      if (useFileUpload && csvFile) {
        const reader = new FileReader();
        spendingDataToSend = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(csvFile);
        });
        if (!spendingDataToSend) {
            throw new Error('Failed to read file.');
        }
      } else if (useManualInput) {
         // Format manual spending data for the API
         spendingDataToSend = Object.entries(manualSpending).reduce((acc, [category, amount]) => {
           const numericAmount = parseFloat(amount || '0');
           if (!isNaN(numericAmount) && numericAmount > 0) {
             acc[category] = numericAmount;
           }
           return acc;
         }, {} as Record<string, number>);
         // The check above based on selectedMethod already covers this
      }

      const response = await fetch('/api/analyze-spending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spendingData: spendingDataToSend, userId }), // Pass userId if available
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze spending');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
      console.log('Recommendations:', data.recommendations);

      onAnalysisComplete(data.recommendations);

    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'An unexpected error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Analyze Your Spending</h2>

      {/* Method Selection */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setSelectedMethod('csv')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${selectedMethod === 'csv' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          <FaUpload className="inline mr-2" /> Upload CSV
        </button>
        <button
          onClick={() => setSelectedMethod('manual')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${selectedMethod === 'manual' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          <FaPen className="inline mr-2" /> Manual Entry
        </button>
      </div>

      {/* CSV Upload Section */}
      {selectedMethod === 'csv' && (
        <div className="mb-6 border-b pb-6 border-gray-200">
          <h3 className="text-xl font-semibold mb-3">Upload Spending Data (CSV)</h3>
          <p className="text-sm text-muted-foreground mb-4">
             Upload a CSV file of your credit card transactions. The file should ideally contain columns for &apos;description&apos;, &apos;amount&apos;, and &apos;mcc&apos; (Merchant Category Code) for best results.
             If MCC is not available, we will attempt to categorize based on description keywords.
          </p>
         <label className="block text-sm font-medium text-gray-700 sr-only">Upload Spending Data (CSV)</label>
         <input
           type="file"
           accept=".csv"
           onChange={handleFileChange}
           className="mt-1 block w-full text-sm text-gray-500
             file:mr-4 file:py-2 file:px-4
             file:rounded-full file:border-0
             file:text-sm file:font-semibold
             file:bg-violet-50 file:text-violet-700
             hover:file:bg-violet-100"
         />
         {csvFile && <p className="mt-2 text-sm text-gray-500">Selected file: {csvFile.name}</p>}
        </div>
      )}

      {/* Manual Entry Section */}
      {selectedMethod === 'manual' && (
        <div className="mb-6">
           <h3 className="text-xl font-semibold mb-3">Or Enter Spending Manually</h3>
           <p className="text-sm text-muted-foreground mb-4">
              Enter your estimated annual spending in the key categories below.
           </p>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
             {Object.keys(manualSpending).map((category) => (
               <div key={category}>
                 <label htmlFor={category} className="block text-sm font-medium text-gray-700 capitalize">{category.replace('_', ' ')}</label>
                 <div className="mt-1 relative rounded-md shadow-sm">
                   <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                     <FaDollarSign className="h-5 w-5 text-gray-400" aria-hidden="true" />
                   </div>
                   <input
                     type="text"
                     name={category}
                     id={category}
                     className="block w-full rounded-md border-gray-300 pl-10 pr-12 focus:border-primary-foreground focus:ring-primary-foreground sm:text-sm"
                     placeholder="0.00"
                     value={manualSpending[category as keyof typeof manualSpending]}
                     onChange={handleManualInputChange}
                   />
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}

      {recommendations && recommendations.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">Recommendations:</h3>
          <ul className="list-disc pl-5">
            {recommendations.map((rec, index) => (
              <li key={index} className="mb-2">
                <strong>{rec.card_name}:</strong> Estimated Annual Value: ${rec.estimated_annual_value?.toFixed(2)} - {rec.description}
              </li>
            ))}
          </ul>
        </div>
      )}

       {recommendations && recommendations.length === 0 && !loading && !error && (
         <div className="mt-4 text-gray-600">
           No recommendations generated based on your spending data.
         </div>
       )}
    </div>
  );
}

export default SpendingInputForm;