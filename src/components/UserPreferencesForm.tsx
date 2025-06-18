'use client';

import React, { useState, useEffect } from 'react';

interface UserPreferencesFormProps {
  initialPreferences?: {
    preferred_cards?: string[];
    excluded_cards?: string[];
    country?: string;
    // Add other preferences here as needed
  } | null;
}

export default function UserPreferencesForm({ initialPreferences }: UserPreferencesFormProps) {
  // State to manage preferences being edited. Initialize with fetched preferences or defaults.
  const [preferredCards, setPreferredCards] = useState<string[]>(initialPreferences?.preferred_cards || []);
  const [excludedCards, setExcludedCards] = useState<string[]>(initialPreferences?.excluded_cards || []);
  const [country, setCountry] = useState<string>(initialPreferences?.country || 'US'); // Default to US
  // Add state for other preferences

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Sync internal state if initialPreferences prop changes
  useEffect(() => {
    setPreferredCards(initialPreferences?.preferred_cards || []);
    setExcludedCards(initialPreferences?.excluded_cards || []);
    setCountry(initialPreferences?.country || 'US');
    // Sync other preferences
  }, [initialPreferences]);

  // Helper to handle changes for list-based preferences (comma-separated string input)
  const handleListChange = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
    // Split by comma, trim whitespace, filter out empty strings
    const cardsArray = event.target.value.split(',').map(card => card.trim()).filter(card => card.length > 0);
    setter(cardsArray);
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/user/update-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferredCards: preferredCards.length > 0 ? preferredCards : null, // Send null if empty array
          excludedCards: excludedCards.length > 0 ? excludedCards : null, // Send null if empty array
          country: country || null,
          // Include other preferences here
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save preferences');
      }

      setStatus('Preferences updated successfully!');

    } catch (err: any) {
      console.error('Error saving preferences:', err);
      setStatus(`Error saving preferences: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded-md mb-6">
      <h3 className="text-xl font-semibold mb-3">Your Preferences:</h3>

      {/* Preferred Cards Input */}
      <div className="mb-4">
        <label htmlFor="preferredCards" className="block text-sm font-medium text-gray-700 mb-1">Preferred Cards (comma-separated names):</label>
        <input
          type="text"
          id="preferredCards"
          value={preferredCards.join(', ')}
          onChange={handleListChange(setPreferredCards)}
          placeholder="e.g., Chase Sapphire Preferred, Amex Gold"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-foreground"
        />
      </div>

      {/* Excluded Cards Input */}
      <div className="mb-4">
        <label htmlFor="excludedCards" className="block text-sm font-medium text-gray-700 mb-1">Excluded Cards (comma-separated names):</label>
        <input
          type="text"
          id="excludedCards"
          value={excludedCards.join(', ')}
          onChange={handleListChange(setExcludedCards)}
          placeholder="e.g., Citi Double Cash, Capital One SavorOne"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-foreground"
        />
      </div>

       {/* Country Selection (Example) */}
      <div className="mb-4">
        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Your Country:</label>
        <select
          id="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-foreground"
        >
          {/* Add more countries as needed */}
          <option value="US">United States</option>
          <option value="CA">Canada</option>
        </select>
      </div>

      {/* TODO: Add inputs for other preferences */}

      {/* Save Button and status */}
      <button
        onClick={handleSavePreferences}
        disabled={loading}
        className={`px-4 py-2 rounded-md text-white font-semibold shadow-sm ${!loading ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
      >
        {loading ? 'Saving...' : 'Save Preferences'}
      </button>

      {status && (
        <div className={`mt-2 text-sm ${status.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
          {status}
        </div>
      )}
    </div>
  );
} 