'use client';

import React, { useState, useEffect } from 'react';
// Assuming user is passed as a prop from the dashboard page, which already fetches it.
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface CurrentCardsManagerProps {
  initialCards: string[]; // List of current cards passed from parent (dashboard page)
}

export default function CurrentCardsManager({ initialCards }: CurrentCardsManagerProps) {
  // Use internal state to manage the list of cards being edited
  const [currentCards, setCurrentCards] = useState<string[]>(initialCards);
  const [newCardName, setNewCardName] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Synchronize internal state if initialCards prop changes (e.g., user logs in/out)
  useEffect(() => {
      setCurrentCards(initialCards);
  }, [initialCards]);

  const handleAddCard = () => {
    if (newCardName.trim() && !currentCards.some(card => card.toLowerCase() === newCardName.trim().toLowerCase())) {
      setCurrentCards([...currentCards, newCardName.trim()]);
      setNewCardName('');
      setStatus(null); // Clear status on change
    } else if (newCardName.trim() && currentCards.some(card => card.toLowerCase() === newCardName.trim().toLowerCase())) {
        setStatus('Card already in your list.');
    }
  };

  const handleRemoveCard = (cardToRemove: string) => {
    setCurrentCards(currentCards.filter(card => card !== cardToRemove));
    setStatus(null); // Clear status on change
  };

  const handleSaveCards = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/user/update-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentCards: currentCards }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save cards');
      }

      // const data = await response.json(); // API returns updated user object, can use if needed
      setStatus('Current cards updated successfully!');

    } catch (err: any) {
      console.error('Error saving cards:', err);
      setStatus(`Error saving cards: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded-md mb-6">
      <h3 className="text-xl font-semibold mb-3">Manage Your Current Cards:</h3>

      {/* Input for adding new cards */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newCardName}
          onChange={(e) => setNewCardName(e.target.value)}
          placeholder="Add a card name (e.g., Chase Sapphire Preferred)"
          className="flex-grow px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-foreground"
        />
        <button
          onClick={handleAddCard}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90"
        >
          Add
        </button>
      </div>

      {/* List of current cards */}
      {currentCards.length > 0 ? (
        <ul className="list-disc pl-5 mb-4">
          {currentCards.map((card, index) => (
            <li key={index} className="flex justify-between items-center mb-1">
              {card}
              <button
                onClick={() => handleRemoveCard(card)}
                className="ml-4 text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground mb-4">No cards added yet.</p>
      )}

      {/* Save button and status */}
      <button
        onClick={handleSaveCards}
        disabled={loading}
        className={`px-4 py-2 rounded-md text-white font-semibold shadow-sm ${!loading ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
      >
        {loading ? 'Saving...' : 'Save Cards'}
      </button>

      {status && (
        <div className={`mt-2 text-sm ${status.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
          {status}
        </div>
      )}
    </div>
  );
} 