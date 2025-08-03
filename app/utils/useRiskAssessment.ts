import { useState, useCallback } from 'react';
import { DeFiRiskAssessor, RiskAssessment, SwapParameters, TokenInfo } from './riskAssessment';

export function useRiskAssessment(rpcUrl: string) {
  const [riskAssessor] = useState(() => new DeFiRiskAssessor(rpcUrl));
  const [isAssessing, setIsAssessing] = useState(false);
  const [lastAssessment, setLastAssessment] = useState<RiskAssessment | null>(null);

  const assessSwapRisk = useCallback(async (
    swapParams: SwapParameters,
    fromTokenInfo: TokenInfo,
    toTokenInfo: TokenInfo
  ): Promise<RiskAssessment> => {
    setIsAssessing(true);
    try {
      const assessment = await riskAssessor.assessSwapRisk(swapParams, fromTokenInfo, toTokenInfo);
      setLastAssessment(assessment);
      return assessment;
    } finally {
      setIsAssessing(false);
    }
  }, [riskAssessor]);

  const shouldShowWarning = useCallback((assessment: RiskAssessment): boolean => {
    return assessment.overallRisk === 'HIGH' || assessment.overallRisk === 'CRITICAL';
  }, []);

  const shouldBlockTransaction = useCallback((assessment: RiskAssessment): boolean => {
    return assessment.overallRisk === 'CRITICAL';
  }, []);

  const getRiskColor = useCallback((risk: string): string => {
    switch (risk) {
      case 'LOW': return 'text-green-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'HIGH': return 'text-orange-600';
      case 'CRITICAL': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }, []);

  const getRiskIcon = useCallback((risk: string): string => {
    switch (risk) {
      case 'LOW': return '✅';
      case 'MEDIUM': return '⚠️';
      case 'HIGH': return '🚨';
      case 'CRITICAL': return '💥';
      default: return '❓';
    }
  }, []);

  return {
    assessSwapRisk,
    isAssessing,
    lastAssessment,
    shouldShowWarning,
    shouldBlockTransaction,
    getRiskColor,
    getRiskIcon
  };
} 