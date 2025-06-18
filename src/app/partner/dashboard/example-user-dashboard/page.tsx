'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
// import SignOutButton from '@/components/SignOutButton'; // Not needed for example view
import SpendingInputForm from '@/components/SpendingInputForm'; // Use the actual form component
import { FaChartLine, FaCreditCard, FaCog, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link'; // Import Link
// User type is not needed as we won't have an authenticated user here
// import { User } from '@supabase/supabase-js';

// Define types for analysis results and current cards (assuming they are exported or defined here)
interface AnalysisResult {
  card_id: string;
  card_name: string;
  issuer: string;
  estimated_annual_value: number;
  description: string;
  image_url?: string;
  annual_fee?: number;
}

interface LatestAnalysis {
  created_at: string;
  categorized_spending: Record<string, number>;
  recommendations: AnalysisResult[];
}

interface UserMetadata {
  current_cards: { name: string; issuer: string; }[]; // Simplified type for example
}

// Hardcoded example user ID for demonstration purposes
// IMPORTANT: Replace with a real user ID from your Supabase auth.users table
//            who has associated data in spending_analysis and user_metadata
const EXAMPLE_USER_ID = "be7ba1ba-8c97-434f-8351-edb968380626"; // <<< REPLACE WITH REAL EXAMPLE USER ID (Keep quotes for string ID)

export default function ExampleUserDashboard() {
  const router = useRouter(); // router might not be needed for simple example
  const supabase = createClientComponentClient();
  // We don't have an authenticated user here, but we might fetch user-like metadata
  const [exampleUserData, setExampleUserData] = useState<{ email: string } | null>({ email: 'example.user@acmetravel.com' }); // Static example user data
  const [latestAnalysis, setLatestAnalysis] = useState<LatestAnalysis | null>(null);
  const [userMetadata, setUserMetadata] = useState<UserMetadata | null>(null);

  // Move fetchExampleUserData outside useEffect
  const fetchExampleUserData = async () => {
    // Fetch latest analysis results for the example user ID
    const { data: analysisData } = await supabase
      .from('spending_analysis')
      .select('*')
      .eq('user_id', EXAMPLE_USER_ID)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (analysisData) {
      setLatestAnalysis(analysisData);
    }

    // Fetch example user's current cards from metadata using the example user ID
    const { data: metadata } = await supabase
      .from('user_metadata')
      .select('current_cards')
      .eq('user_id', EXAMPLE_USER_ID)
      .single();

    if (metadata) {
      setUserMetadata(metadata as UserMetadata);
    }
  };

  useEffect(() => {
    fetchExampleUserData();
  }, [supabase]); // Add fetchExampleUserData to dependency array

  const handleAnalysisComplete = (results: any) => {
    // For the example dashboard, we might just log this or show a static message
    console.log('Example Analysis Complete:', results);
    // Optionally, update the state or refetch data to show new results
     fetchExampleUserData(); // Re-fetch data to show updated analysis results
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-16"> {/* Use a light background */}
      {/* Dashboard Header */}
      <header className="bg-green-500 backdrop-blur-md border-b border-green-700 sticky top-16 z-10"> {/* Acme Travel Primary Color */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Partner Logo/Name and Example User Label */}
            <div className="flex items-center gap-3">
              {/* In a real white-label scenario, this would be the partner's logo */}
              <h1 className="text-2xl font-bold text-white">Acme Travel</h1> {/* Partner Name/Logo */}
              <span className="px-3 py-1 text-sm bg-green-600 text-white rounded-full">
                Example User View
              </span>
            </div>
            {/* Back to Partner Dashboard Link */}
             <Link href="/partner/dashboard" className="flex items-center gap-2 text-green-200 hover:text-white transition-colors">
                <span>Back to Partner Dashboard</span>
                <FaArrowRight className="text-sm" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Latest Analysis Stat */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full"> {/* Example Partner Light Color */}
                    <FaChartLine className="text-green-700 text-xl" /> {/* Example Partner Primary Color */}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Latest Analysis</h3>
                    <p className="text-2xl font-semibold text-gray-900">
                      {/* Use fetched data */}
                      {latestAnalysis ? new Date(latestAnalysis.created_at).toLocaleDateString() : 'No analysis yet'}
                    </p>
                  </div>
                </div>
              </div>
              {/* Current Cards Stat */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full"> {/* Example Partner Light Color */}
                    <FaCreditCard className="text-green-700 text-xl" /> {/* Example Partner Primary Color */}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Current Cards</h3>
                    <p className="text-2xl font-semibold text-gray-900">
                      {/* Use fetched data */}
                      {userMetadata?.current_cards?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Spending Analysis Section */}
            <section className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Spending Analysis</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Upload spending data or enter it manually to get personalized card recommendations
                    </p>
                  </div>
                   {/* Link to analysis history, if applicable for example */}
                   {/* <a href="#" className="flex items-center gap-2 text-green-700 hover:text-green-900 transition-colors"> View History <FaArrowRight className="text-sm" /> </a> */}
                </div>
              </div>
              <div className="p-6">
                 {/* Pass the example user ID to the form */}
                <SpendingInputForm onAnalysisComplete={handleAnalysisComplete} userId={EXAMPLE_USER_ID} />
              </div>
            </section>

            {/* Latest Analysis Results */}
            {latestAnalysis && latestAnalysis.recommendations && latestAnalysis.recommendations.length > 0 && (
              <section className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Latest Analysis Results</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Your most recent spending analysis and recommendations
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-3">Spending Categories</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Use fetched data */}
                        {latestAnalysis.categorized_spending && Object.entries(latestAnalysis.categorized_spending).map(([category, amount]) => (
                          <div key={category} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"> {/* Use a light background for categories */}
                            <p className="text-sm text-gray-600 capitalize">{category}</p>
                            <p className="text-lg font-semibold text-green-800">${amount}</p> {/* Example Partner Secondary Color */}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-3">Top Recommendations</h3>
                      <div className="space-y-3">
                        {/* Use fetched data */}
                        {latestAnalysis.recommendations.map((rec: AnalysisResult, index: number) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"> {/* Use a light background for recommendations */}
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">{rec.card_name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                              </div>
                              {/* Add card image and value if available */}
                              {/* Example Placeholder for Card Image */}
                              {rec.image_url && (
                                <img src={rec.image_url} alt={rec.card_name} className="w-16 h-10 object-contain" />
                              )}
                              {/* Example Placeholder for Estimated Value */}
                              {rec.estimated_annual_value > 0 && (
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-500">Est. Value</p>
                                    <p className="text-lg font-semibold text-green-800">${rec.estimated_annual_value}</p> {/* Example Partner Secondary Color */}
                                </div>
                              )}
                            </div>
                             {/* Example Placeholder for Annual Fee */}
                             {rec.annual_fee !== undefined && rec.annual_fee >= 0 && (
                                <p className="text-sm text-gray-500 mt-2">Annual Fee: ${rec.annual_fee}</p>
                             )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

             {/* Sidebar Placeholder - Use actual sidebar content here if available and relevant */}
            {/* For a full example, you might include a stripped-down version of UserPreferencesForm or other user-specific sidebar content */}
            <section className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200 lg:col-span-1 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Example User Preferences</h2>
              <p className="text-sm text-gray-600 mt-1">This section would typically contain the user's preferences and settings.</p>
              {/* Placeholder for user preferences form or other sidebar content */}
               {/* Example: Include a non-functional UserPreferencesForm or its elements */}
               {/* <UserPreferencesForm user={exampleUserData} /> */}

               <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
               <p className="text-sm text-gray-600">Contact support for assistance.</p>
               <Link href="/contact" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"> {/* Example Partner Primary Color */}
                  Contact Support
               </Link>
            </section>

          </div>


        </div>
      </main>
    </div>
  );
} 