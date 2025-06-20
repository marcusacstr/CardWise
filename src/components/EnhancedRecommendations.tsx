'use client'

import { useState, useEffect } from 'react'
import { EnhancedRecommendation, SpendingProfile } from '@/lib/enhancedCardRecommendations'

interface Props {
  transactions: any[]
  userProfile: Partial<SpendingProfile>
  onRecommendationSelect?: (card: any) => void
}

export default function EnhancedRecommendations({ 
  transactions, 
  userProfile, 
  onRecommendationSelect 
}: Props) {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [analysisMetadata, setAnalysisMetadata] = useState<any>(null)
  const [analysis, setAnalysis] = useState<any>(null)

  const analyzeSpending = async () => {
    if (!transactions.length) return

    setLoading(true)
    try {
      const response = await fetch('/api/enhanced-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions,
          userProfile,
          analysisType: 'ai_powered'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setRecommendations(data.recommendations)
        setAnalysisMetadata(data.analysis_metadata)
        setAnalysis(data.analysis)
      }
    } catch (error) {
      console.error('Enhanced analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    analyzeSpending()
  }, [transactions, userProfile])

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">🧠 AI is analyzing your spending patterns...</p>
        <p className="text-sm text-gray-500 mt-2">Using advanced algorithms and real point valuations</p>
      </div>
    )
  }

  if (!recommendations.length) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <p className="text-gray-600">No recommendations available. Upload transaction data to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Analysis Quality Indicator */}
      {analysisMetadata && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-blue-900 flex items-center">
                🤖 AI Analysis Quality
              </h3>
              <p className="text-sm text-blue-700">
                {analysisMetadata.confidence_level === 'high' ? '🎯 High Confidence - Excellent recommendations' :
                 analysisMetadata.confidence_level === 'medium' ? '🔍 Medium Confidence - Good recommendations' :
                 '⚠️ Limited Data - Basic recommendations'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-900">
                {analysisMetadata.data_quality_score}%
              </p>
              <p className="text-xs text-blue-600">Data Quality</p>
            </div>
          </div>
          
          {/* Smart Insights */}
          {analysis && analysis.insights && (
            <div className="bg-white rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-gray-900 mb-2">💡 Smart Insights</h4>
              <ul className="space-y-1">
                {analysis.insights.slice(0, 3).map((insight: string, idx: number) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Recommendations */}
      <div className="space-y-6">
        {recommendations.map((rec, index) => (
          <div 
            key={rec.card.id} 
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-300"
          >
            {/* Card Header with Enhanced Rankings */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' : 
                    index === 2 ? 'bg-gradient-to-r from-amber-500 to-amber-700' : 'bg-gradient-to-r from-blue-500 to-blue-700'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{rec.card.name}</h3>
                  <p className="text-gray-600">{rec.card.issuer}</p>
                  {rec.card.annual_fee > 0 && (
                    <p className="text-sm text-red-600 font-medium">${rec.card.annual_fee} annual fee</p>
                  )}
                </div>
              </div>
              
              {/* Enhanced AI Scores */}
              <div className="text-right space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="text-xs font-medium text-gray-700">AI Match</div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    rec.ai_confidence_score >= 80 ? 'bg-green-100 text-green-800' :
                    rec.ai_confidence_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {rec.ai_confidence_score}%
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-xs font-medium text-gray-700">Personal Fit</div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    rec.personalization_score >= 70 ? 'bg-blue-100 text-blue-800' :
                    rec.personalization_score >= 50 ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {rec.personalization_score}/100
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Value Proposition */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  ${rec.annual_value.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Annual Value</p>
                <p className="text-xs text-gray-500">Real-world redemption</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  ${rec.net_annual_benefit.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Net Benefit</p>
                <p className="text-xs text-gray-500">After annual fee</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  ${rec.first_year_value.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">First Year Value</p>
                <p className="text-xs text-gray-500">Including welcome bonus</p>
              </div>
            </div>

            {/* Revolutionary Point Valuation Display */}
            <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                💎 Dynamic Point Valuation
                <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  AI-Powered
                </span>
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cashback Value:</span>
                  <span className="font-medium">{rec.point_valuation.cashback_value}¢/point</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Travel Value:</span>
                  <span className="font-medium">{rec.point_valuation.travel_value}¢/point</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Optimal Value:</span>
                  <span className="font-medium text-green-600 text-base">{rec.point_valuation.optimal_value}¢/point</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Flexibility Score:</span>
                  <span className="font-medium">{(rec.point_valuation.redemption_flexibility * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Smart Insight:</strong> Points worth up to <strong>{rec.point_valuation.optimal_value}¢</strong> each vs industry average of 1¢
                </p>
              </div>
            </div>

            {/* Category Breakdown */}
            {rec.category_breakdown && rec.category_breakdown.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">📊 Your Spending Categories</h4>
                <div className="space-y-2">
                  {rec.category_breakdown
                    .filter((cat: any) => cat.annual_spending > 0)
                    .sort((a: any, b: any) => b.annual_rewards - a.annual_rewards)
                    .slice(0, 4)
                    .map((cat: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <span className="capitalize font-medium text-gray-900">{cat.category}</span>
                        <span className="text-sm text-gray-600">${cat.annual_spending.toLocaleString()}/year</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-blue-600">{cat.earn_rate}x</span>
                        <span className="text-sm text-gray-600 ml-2">${cat.annual_rewards.toFixed(0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Reasoning */}
            {rec.reasoning.primary_benefits.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  🎯 Why This Card Works for You
                </h4>
                <ul className="space-y-1">
                  {rec.reasoning.primary_benefits.map((benefit: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2 text-sm">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk Factors with Enhanced UI */}
            {rec.risk_factors.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2 text-orange-700 flex items-center">
                  ⚠️ Risk Assessment
                </h4>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <ul className="space-y-1">
                    {rec.risk_factors.map((risk: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm">
                        <span className="text-orange-500 mt-0.5">⚠️</span>
                        <span className="text-orange-800">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Optimization Tips */}
            {rec.optimization_tips.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2 text-blue-700 flex items-center">
                  💡 AI Optimization Tips
                </h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <ul className="space-y-1">
                    {rec.optimization_tips.map((tip: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm">
                        <span className="text-blue-500 mt-0.5">💡</span>
                        <span className="text-blue-800">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Enhanced Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Match Score:</span> {rec.personalization_score}/100
                <span className="mx-2">•</span>
                <span className="font-semibold">AI Confidence:</span> {rec.ai_confidence_score}%
              </div>
              <div className="space-x-3">
                <button
                  onClick={() => onRecommendationSelect?.(rec.card)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Learn More
                </button>
                {rec.card.application_url && (
                  <a
                    href={rec.card.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block font-medium"
                  >
                    Apply Now
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Analysis Footer */}
      {analysisMetadata && (
        <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-700 mb-2">
              🤖 Analysis powered by AI with real-world point valuations
            </p>
            <p>
              {analysisMetadata.recommendations_count} cards evaluated • 
              Data quality: {analysisMetadata.data_quality_score}% • 
              Generated {new Date(analysisMetadata.generated_at).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Using advanced algorithms, dynamic point valuations, and personalized risk assessment
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 