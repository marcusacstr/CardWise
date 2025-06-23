'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { FaTrash, FaCalendar, FaFileAlt, FaUniversity, FaDollarSign } from 'react-icons/fa';
import { useSpendingData } from '@/contexts/SpendingDataContext';

interface Statement {
  id: string;
  filename: string;
  statement_period_start?: string;
  statement_period_end?: string;
  statement_date?: string;
  bank_name?: string;
  account_number?: string;
  transaction_count: number;
  total_amount: number;
  created_at: string;
}

interface StatementManagerProps {
  onStatementDeleted?: () => void;
  refreshTrigger?: number;
  recentUploads?: string[];
}

export default function StatementManager({ onStatementDeleted, refreshTrigger, recentUploads = [] }: StatementManagerProps) {
  const { data, loading, error, refreshStatements, refreshAll, forceRefresh } = useSpendingData();
  const [deleting, setDeleting] = useState<string | null>(null);

  const deleteStatement = async (statementId: string) => {
    if (!confirm('Are you sure you want to delete this statement? This action cannot be undone.')) {
      return;
    }

    setDeleting(statementId);
    try {
      const response = await fetch(`/api/delete-statement?id=${statementId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Force refresh all data to ensure everything is cleared
        await forceRefresh();
        onStatementDeleted?.();
      } else {
        alert('Failed to delete statement');
      }
    } catch (error) {
      console.error('Error deleting statement:', error);
      alert('Error deleting statement');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleRefresh = () => {
    refreshStatements();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Uploaded Statements</h3>
          <button 
            onClick={handleRefresh}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Refresh
          </button>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Uploaded Statements</h3>
          <button 
            onClick={handleRefresh}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Retry
          </button>
        </div>
        <div className="text-center py-8">
          <FaFileAlt className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <p className="text-red-600 mb-2">Error loading statements</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button 
            onClick={handleRefresh}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const statements = data.statements || [];

  if (statements.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Uploaded Statements</h3>
          <button 
            onClick={handleRefresh}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
        <div className="text-center py-8">
          <FaFileAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No statements uploaded yet</p>
          <p className="text-sm text-gray-400 mt-2">Upload a statement to see it here</p>
          <div className="mt-4 text-xs text-gray-400">
            <p>If you just uploaded a statement, try clicking Refresh above.</p>
            <p>Note: You must be signed in to see saved statements.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Uploaded Statements</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Last refresh: {new Date().toLocaleTimeString()}</span>
          <button 
            onClick={handleRefresh}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {statements.map((statement) => (
          <div key={statement.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FaFileAlt className="text-blue-500" />
                  <h4 className="font-medium text-gray-900">{statement.filename}</h4>
                  {statement.bank_name && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      <FaUniversity className="w-3 h-3" />
                      {statement.bank_name}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaCalendar className="text-gray-400" />
                    <div>
                      <div className="font-medium">Statement Period</div>
                      <div>
                        {statement.statement_period_start && statement.statement_period_end
                          ? `${formatDate(statement.statement_period_start)} - ${formatDate(statement.statement_period_end)}`
                          : 'N/A'
                        }
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <FaDollarSign className="text-gray-400" />
                    <div>
                      <div className="font-medium">Total Spending</div>
                      <div className="text-lg font-semibold text-green-600">
                        {formatAmount(statement.total_amount)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <FaFileAlt className="text-gray-400" />
                    <div>
                      <div className="font-medium">Transactions</div>
                      <div>{statement.transaction_count} transactions</div>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  Uploaded on {formatDate(statement.created_at)}
                  {statement.account_number && (
                    <span className="ml-2">• Account: {statement.account_number}</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => deleteStatement(statement.id)}
                disabled={deleting === statement.id}
                className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Delete statement"
              >
                {deleting === statement.id ? (
                  <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
                ) : (
                  <FaTrash className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        {statements.length} statement{statements.length !== 1 ? 's' : ''} uploaded
      </div>
    </div>
  );
} 