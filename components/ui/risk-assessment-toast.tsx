import React from 'react';
import { RiskAssessment, RiskFactor } from '../../app/utils/riskAssessment';

interface RiskAssessmentToastProps {
  assessment: RiskAssessment;
  isVisible: boolean;
  onClose: () => void;
  onProceed?: () => void;
  onCancel?: () => void;
}

// Tooltip component
function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-50 w-64 p-3 text-sm text-white bg-gray-900 rounded-lg shadow-lg -top-2 left-full ml-2">
          {content}
          <div className="absolute top-3 -left-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
}

export function RiskAssessmentToast({ 
  assessment, 
  isVisible, 
  onClose, 
  onProceed, 
  onCancel 
}: RiskAssessmentToastProps) {
  if (!isVisible) return null;

  const { overallRisk, riskScore, riskFactors, recommendations } = assessment;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'HIGH': return 'bg-orange-500';
      case 'CRITICAL': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'LOW': return '✅';
      case 'MEDIUM': return '⚠️';
      case 'HIGH': return '🚨';
      case 'CRITICAL': return '💥';
      default: return '❓';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'text-green-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'HIGH': return 'text-orange-600';
      case 'CRITICAL': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const generateRiskExplanation = () => {
    if (riskFactors.length === 0) {
      return "No specific risk factors detected. This transaction appears safe.";
    }

    const factorExplanations = riskFactors.map(factor => 
      `• ${factor.severity} ${factor.type.replace('_', ' ')}: ${factor.description}`
    ).join('\n');

    return `Risk factors contributing to ${overallRisk} risk level:\n\n${factorExplanations}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 ${getRiskColor(overallRisk)} text-white rounded-t-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getRiskIcon(overallRisk)}</span>
              <div>
                <Tooltip content={generateRiskExplanation()}>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold">Risk Assessment</h2>
                    <span className="text-sm opacity-75">(hover for details)</span>
                  </div>
                </Tooltip>
                <p className="text-sm opacity-90">
                  {overallRisk} Risk Level ({riskScore}/100)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Risk Factors */}
          {riskFactors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Risk Factors</h3>
              <div className="space-y-3">
                {riskFactors.map((factor, index) => (
                  <div key={index} className="border-l-4 border-orange-400 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <Tooltip content={`Impact: ${factor.impact}\n\nThis risk factor contributes to the overall ${overallRisk} risk level.`}>
                        <span className={`font-medium ${getSeverityColor(factor.severity)} cursor-help`}>
                          {factor.severity} - {factor.type.replace('_', ' ')}
                        </span>
                      </Tooltip>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{factor.description}</p>
                    <p className="text-xs text-gray-500">Impact: {factor.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Recommendations</h3>
              <div className="space-y-2">
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-sm mt-0.5">•</span>
                    <p className="text-sm text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Level Explanation */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold mb-2 text-gray-800">Risk Level Explanation</h4>
            <div className="text-sm text-gray-600 space-y-1">
              {overallRisk === 'LOW' && (
                <p>✅ This transaction appears safe with minimal risk factors.</p>
              )}
              {overallRisk === 'MEDIUM' && (
                <p>⚠️ Moderate risk detected. Review the factors above before proceeding.</p>
              )}
              {overallRisk === 'HIGH' && (
                <p>🚨 High risk transaction. Consider the recommendations carefully.</p>
              )}
              {overallRisk === 'CRITICAL' && (
                <p>💥 Critical risk level. Strongly consider canceling this transaction.</p>
              )}
            </div>
            <Tooltip content={`Risk Score Calculation:\n\n${riskFactors.length > 0 ? 
              riskFactors.map(f => `• ${f.severity} ${f.type}: +${f.severity === 'LOW' ? '10' : f.severity === 'MEDIUM' ? '25' : f.severity === 'HIGH' ? '50' : '75'} points`).join('\n') :
              'No risk factors detected'
            }\n\nTotal: ${riskScore}/100 points`}>
              <p className="text-xs text-blue-600 mt-2 cursor-help">
                How is this risk level calculated? (hover for details)
              </p>
            </Tooltip>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {overallRisk === 'CRITICAL' && onCancel && (
              <button
                onClick={onCancel}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel Transaction
              </button>
            )}
            
            {onProceed && (
              <button
                onClick={onProceed}
                className={`flex-1 font-medium py-2 px-4 rounded-lg transition-colors ${
                  overallRisk === 'CRITICAL' 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                    : overallRisk === 'HIGH'
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {overallRisk === 'CRITICAL' ? 'Proceed Anyway' : 'Proceed'}
              </button>
            )}
            
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple toast notification component with tooltip
export function RiskToast({ assessment }: { assessment: RiskAssessment }) {
  const { overallRisk, riskScore, riskFactors } = assessment;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'HIGH': return 'bg-orange-500';
      case 'CRITICAL': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'LOW': return '✅';
      case 'MEDIUM': return '⚠️';
      case 'HIGH': return '🚨';
      case 'CRITICAL': return '💥';
      default: return '❓';
    }
  };

  const generateQuickExplanation = () => {
    if (riskFactors.length === 0) return "No specific risks detected";
    
    const topFactors = riskFactors.slice(0, 2);
    return topFactors.map(f => `${f.severity} ${f.type.replace('_', ' ')}`).join(', ');
  };

  return (
    <Tooltip content={`Risk Score: ${riskScore}/100\n\nMain factors: ${generateQuickExplanation()}\n\nClick for detailed analysis`}>
      <div className={`fixed top-4 right-4 ${getRiskColor(overallRisk)} text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm cursor-help`}>
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getRiskIcon(overallRisk)}</span>
          <div>
            <p className="font-semibold">{overallRisk} Risk Detected</p>
            <p className="text-sm opacity-90">Score: {riskScore}/100</p>
          </div>
        </div>
      </div>
    </Tooltip>
  );
} 