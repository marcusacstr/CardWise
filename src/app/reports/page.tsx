'use client';

import { useState, useEffect } from 'react';
import { getUserReports, getReport, deleteReport, type ReportSummary, type StoredReport } from '@/lib/reportStorage';
import { formatCurrency } from '@/lib/utils';
import { Trash2, FileText, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<StoredReport | null>(null);
  const [viewingDetails, setViewingDetails] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const userReports = await getUserReports();
      setReports(userReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (reportId: string) => {
    try {
      const report = await getReport(reportId);
      if (report) {
        setSelectedReport(report);
        setViewingDetails(true);
      }
    } catch (error) {
      console.error('Error fetching report details:', error);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      try {
        const success = await deleteReport(reportId);
        if (success) {
          setReports(reports.filter(r => r.id !== reportId));
        }
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1).toLocaleDateString('en-US', { month: 'long' });
  };

  if (viewingDetails && selectedReport) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button 
            onClick={() => setViewingDetails(false)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-gray-300 bg-white hover:bg-gray-50 h-10 py-2 px-4 mb-4"
          >
            ← Back to Reports
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{selectedReport.title}</h1>
          <p className="text-gray-600">
            {selectedReport.date_range_start} to {selectedReport.date_range_end}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(selectedReport.total_spent)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-red-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earned</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedReport.total_earned)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Spending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(selectedReport.net_spending)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-gray-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedReport.transaction_count}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Spending by Category</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-4">
              {selectedReport.category_breakdown.map((category: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getIconForCategory(category.category)}</span>
                    <div>
                      <p className="font-medium">{category.category}</p>
                      <p className="text-sm text-gray-600">
                        {category.count} transactions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(category.amount)}</p>
                    <p className="text-sm text-gray-600">
                      {category.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Card Recommendations */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Recommended Cards for This Period</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-4">
              {selectedReport.card_recommendations.slice(0, 3).map((rec: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{rec.card.name}</h3>
                      <p className="text-gray-600">{rec.card.issuer}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800">
                      {formatCurrency(rec.potentialAnnualRewards)} rewards
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rec.reasonsForRecommendation.map((reason: string, idx: number) => (
                      <span key={idx} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border border-gray-300 text-gray-700">
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Spending Reports</h1>
        <p className="text-gray-600">View your historical spending analysis and card recommendations</p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
            <p className="text-gray-600 mb-4">
              Upload your first credit card statement to generate a spending report.
            </p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-green-600 text-white hover:bg-green-700 h-10 py-2 px-4"
            >
              Upload Statement
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex flex-col space-y-1.5 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg text-2xl font-semibold leading-none tracking-tight">
                      {getMonthName(report.month)} {report.year}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 px-3 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  {report.transaction_count} transactions
                </p>
              </div>
              <div className="p-6 pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Spent</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(report.total_spent)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-sm">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <button 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-green-600 text-white hover:bg-green-700 h-10 py-2 px-4 w-full mt-4"
                    onClick={() => handleViewReport(report.id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getIconForCategory(category: string): string {
  const icons: { [key: string]: string } = {
    'Dining': '🍽️',
    'Groceries': '🛒',
    'Gas': '⛽',
    'Transit': '🚌',
    'Travel': '✈️',
    'Streaming': '📺',
    'Department Stores': '🏬',
    'Warehouse Clubs': '🏪',
    'Drug Stores': '💊',
    'Online Shopping': '🛍️',
    'Entertainment': '🎬',
    'Telecommunications': '📱',
    'Utilities': '⚡',
    'Healthcare': '🏥',
    'General Retail': '🛒',
    'Financial Services': '💰',
    'Other': '📦'
  };
  return icons[category] || '📦';
} 