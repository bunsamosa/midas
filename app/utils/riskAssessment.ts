import { ethers } from 'ethers';

export interface RiskAssessment {
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number; // 0-100
  riskFactors: RiskFactor[];
  recommendations: string[];
}

export interface RiskFactor {
  type: RiskFactorType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  impact: string;
}

export type RiskFactorType = 
  | 'LIQUIDITY_RISK'
  | 'SLIPPAGE_RISK'
  | 'CONTRACT_RISK'
  | 'VOLATILITY_RISK'
  | 'MEV_RISK'
  | 'GAS_RISK'
  | 'TOKEN_RISK'
  | 'PROTOCOL_RISK';

export interface SwapParameters {
  fromToken: string;
  toToken: string;
  amount: string;
  slippageTolerance: number;
  gasPrice?: string;
  protocol?: string;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  totalSupply?: string;
  marketCap?: number;
  volume24h?: number;
  priceChange24h?: number;
  liquidity?: number;
  holders?: number;
  isVerified?: boolean;
  auditStatus?: 'AUDITED' | 'UNAUDITED' | 'UNKNOWN';
}

export class DeFiRiskAssessor {
  private provider: ethers.providers.JsonRpcProvider;

  constructor(rpcUrl: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  async assessSwapRisk(swapParams: SwapParameters, fromTokenInfo: TokenInfo, toTokenInfo: TokenInfo): Promise<RiskAssessment> {
    const riskFactors: RiskFactor[] = [];
    let totalRiskScore = 0;

    // Check liquidity risk
    const liquidityRisk = await this.assessLiquidityRisk(swapParams, fromTokenInfo, toTokenInfo);
    if (liquidityRisk) {
      riskFactors.push(liquidityRisk);
      totalRiskScore += this.getRiskScore(liquidityRisk.severity);
    }

    // Check slippage risk
    const slippageRisk = this.assessSlippageRisk(swapParams, fromTokenInfo, toTokenInfo);
    if (slippageRisk) {
      riskFactors.push(slippageRisk);
      totalRiskScore += this.getRiskScore(slippageRisk.severity);
    }

    // Check contract risk
    const contractRisk = await this.assessContractRisk(toTokenInfo);
    if (contractRisk) {
      riskFactors.push(contractRisk);
      totalRiskScore += this.getRiskScore(contractRisk.severity);
    }

    // Check volatility risk
    const volatilityRisk = this.assessVolatilityRisk(fromTokenInfo, toTokenInfo);
    if (volatilityRisk) {
      riskFactors.push(volatilityRisk);
      totalRiskScore += this.getRiskScore(volatilityRisk.severity);
    }

    // Check MEV risk
    const mevRisk = this.assessMEVRisk(swapParams);
    if (mevRisk) {
      riskFactors.push(mevRisk);
      totalRiskScore += this.getRiskScore(mevRisk.severity);
    }

    // Check gas risk
    const gasRisk = await this.assessGasRisk(swapParams);
    if (gasRisk) {
      riskFactors.push(gasRisk);
      totalRiskScore += this.getRiskScore(gasRisk.severity);
    }

    // Check token risk
    const tokenRisk = this.assessTokenRisk(toTokenInfo);
    if (tokenRisk) {
      riskFactors.push(tokenRisk);
      totalRiskScore += this.getRiskScore(tokenRisk.severity);
    }

    // Check protocol risk
    const protocolRisk = this.assessProtocolRisk(swapParams.protocol);
    if (protocolRisk) {
      riskFactors.push(protocolRisk);
      totalRiskScore += this.getRiskScore(protocolRisk.severity);
    }

    const overallRisk = this.calculateOverallRisk(totalRiskScore);
    const recommendations = this.generateRecommendations(riskFactors, overallRisk);

    return {
      overallRisk,
      riskScore: Math.min(totalRiskScore, 100),
      riskFactors,
      recommendations
    };
  }

  private async assessLiquidityRisk(swapParams: SwapParameters, fromToken: TokenInfo, toToken: TokenInfo): Promise<RiskFactor | null> {
    const amount = parseFloat(swapParams.amount);
    const fromLiquidity = fromToken.liquidity || 0;
    const toLiquidity = toToken.liquidity || 0;

    if (amount > fromLiquidity * 0.1) {
      return {
        type: 'LIQUIDITY_RISK',
        severity: 'HIGH',
        description: `Swap amount (${amount}) represents more than 10% of available liquidity`,
        impact: 'High slippage and potential failed transaction'
      };
    }

    if (toLiquidity < 100000) { // Less than $100k liquidity
      return {
        type: 'LIQUIDITY_RISK',
        severity: 'MEDIUM',
        description: `Low liquidity for ${toToken.symbol} ($${toLiquidity.toLocaleString()})`,
        impact: 'Potential price manipulation and high slippage'
      };
    }

    return null;
  }

  private assessSlippageRisk(swapParams: SwapParameters, fromToken: TokenInfo, toToken: TokenInfo): RiskFactor | null {
    const slippage = swapParams.slippageTolerance;
    const amount = parseFloat(swapParams.amount);
    const liquidity = toToken.liquidity || 0;

    if (slippage > 5) {
      return {
        type: 'SLIPPAGE_RISK',
        severity: 'HIGH',
        description: `High slippage tolerance (${slippage}%)`,
        impact: 'Potential for significant price impact and MEV attacks'
      };
    }

    if (amount > liquidity * 0.05 && slippage < 2) {
      return {
        type: 'SLIPPAGE_RISK',
        severity: 'MEDIUM',
        description: `Large swap with low slippage tolerance may fail`,
        impact: 'Transaction likely to revert due to price movement'
      };
    }

    return null;
  }

  private async assessContractRisk(tokenInfo: TokenInfo): Promise<RiskFactor | null> {
    if (!tokenInfo.isVerified) {
      return {
        type: 'CONTRACT_RISK',
        severity: 'HIGH',
        description: `Token contract ${tokenInfo.symbol} is not verified`,
        impact: 'Unable to verify contract safety and potential for malicious code'
      };
    }

    if (tokenInfo.auditStatus === 'UNAUDITED') {
      return {
        type: 'CONTRACT_RISK',
        severity: 'MEDIUM',
        description: `Token ${tokenInfo.symbol} has not been audited`,
        impact: 'Potential security vulnerabilities in smart contract'
      };
    }

    // Check for common red flags
    try {
      const contract = new ethers.Contract(tokenInfo.address, [
        'function totalSupply() view returns (uint256)',
        'function balanceOf(address) view returns (uint256)',
        'function owner() view returns (address)'
      ], this.provider);

      const totalSupply = await contract.totalSupply();
      const owner = await contract.owner();

      if (owner !== ethers.constants.AddressZero) {
        return {
          type: 'CONTRACT_RISK',
          severity: 'CRITICAL',
          description: `Token ${tokenInfo.symbol} has an owner with privileged access`,
          impact: 'Owner can potentially manipulate token supply or pause transfers'
        };
      }
    } catch (error) {
      // Contract might not have owner function, which is good
    }

    return null;
  }

  private assessVolatilityRisk(fromToken: TokenInfo, toToken: TokenInfo): RiskFactor | null {
    const fromVolatility = Math.abs(fromToken.priceChange24h || 0);
    const toVolatility = Math.abs(toToken.priceChange24h || 0);

    if (fromVolatility > 20 || toVolatility > 20) {
      return {
        type: 'VOLATILITY_RISK',
        severity: 'HIGH',
        description: `High volatility detected: ${fromToken.symbol} (${fromVolatility}%), ${toToken.symbol} (${toVolatility}%)`,
        impact: 'Price may change significantly during transaction execution'
      };
    }

    if (fromVolatility > 10 || toVolatility > 10) {
      return {
        type: 'VOLATILITY_RISK',
        severity: 'MEDIUM',
        description: `Moderate volatility detected: ${fromToken.symbol} (${fromVolatility}%), ${toToken.symbol} (${toVolatility}%)`,
        impact: 'Consider adjusting slippage tolerance'
      };
    }

    return null;
  }

  private assessMEVRisk(swapParams: SwapParameters): RiskFactor | null {
    const amount = parseFloat(swapParams.amount);
    
    if (amount > 10000) { // Large swaps are more susceptible to MEV
      return {
        type: 'MEV_RISK',
        severity: 'MEDIUM',
        description: `Large swap amount ($${amount.toLocaleString()}) may attract MEV bots`,
        impact: 'Potential for front-running and sandwich attacks'
      };
    }

    return null;
  }

  private async assessGasRisk(swapParams: SwapParameters): Promise<RiskFactor | null> {
    if (!swapParams.gasPrice) return null;

    const gasPrice = parseFloat(swapParams.gasPrice);
    const currentGasPrice = await this.provider.getGasPrice();
    const currentGasGwei = ethers.utils.formatUnits(currentGasPrice, 'gwei');

    if (gasPrice < parseFloat(currentGasGwei) * 0.8) {
      return {
        type: 'GAS_RISK',
        severity: 'MEDIUM',
        description: `Gas price may be too low for current network conditions`,
        impact: 'Transaction may take long time to confirm or fail'
      };
    }

    if (gasPrice > parseFloat(currentGasGwei) * 2) {
      return {
        type: 'GAS_RISK',
        severity: 'LOW',
        description: `Gas price is significantly higher than current network average`,
        impact: 'Overpaying for transaction fees'
      };
    }

    return null;
  }

  private assessTokenRisk(tokenInfo: TokenInfo): RiskFactor | null {
    if (tokenInfo.holders && tokenInfo.holders < 100) {
      return {
        type: 'TOKEN_RISK',
        severity: 'HIGH',
        description: `Token ${tokenInfo.symbol} has very few holders (${tokenInfo.holders})`,
        impact: 'High concentration risk and potential for manipulation'
      };
    }

    if (tokenInfo.marketCap && tokenInfo.marketCap < 100000) {
      return {
        type: 'TOKEN_RISK',
        severity: 'MEDIUM',
        description: `Token ${tokenInfo.symbol} has very low market cap ($${tokenInfo.marketCap.toLocaleString()})`,
        impact: 'High volatility and potential for significant price swings'
      };
    }

    return null;
  }

  private assessProtocolRisk(protocol?: string): RiskFactor | null {
    const riskyProtocols = ['unknown', 'new_protocol', 'experimental'];
    
    if (protocol && riskyProtocols.includes(protocol.toLowerCase())) {
      return {
        type: 'PROTOCOL_RISK',
        severity: 'HIGH',
        description: `Using relatively unknown or experimental protocol: ${protocol}`,
        impact: 'Protocol may have undiscovered vulnerabilities or bugs'
      };
    }

    return null;
  }

  private getRiskScore(severity: string): number {
    switch (severity) {
      case 'LOW': return 10;
      case 'MEDIUM': return 25;
      case 'HIGH': return 50;
      case 'CRITICAL': return 75;
      default: return 0;
    }
  }

  private calculateOverallRisk(totalScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (totalScore >= 75) return 'CRITICAL';
    if (totalScore >= 50) return 'HIGH';
    if (totalScore >= 25) return 'MEDIUM';
    return 'LOW';
  }

  private generateRecommendations(riskFactors: RiskFactor[], overallRisk: string): string[] {
    const recommendations: string[] = [];

    if (overallRisk === 'CRITICAL') {
      recommendations.push('⚠️ CRITICAL RISK: Consider canceling this transaction');
    }

    if (overallRisk === 'HIGH') {
      recommendations.push('⚠️ HIGH RISK: Proceed with extreme caution');
    }

    riskFactors.forEach(factor => {
      switch (factor.type) {
        case 'LIQUIDITY_RISK':
          recommendations.push('💧 Consider reducing swap amount or using a different DEX');
          break;
        case 'SLIPPAGE_RISK':
          recommendations.push('📊 Adjust slippage tolerance based on market conditions');
          break;
        case 'CONTRACT_RISK':
          recommendations.push('🔒 Verify contract address and check audit status');
          break;
        case 'VOLATILITY_RISK':
          recommendations.push('📈 Monitor price movements and consider waiting for stability');
          break;
        case 'MEV_RISK':
          recommendations.push('🤖 Consider using MEV-protected transactions or private mempool');
          break;
        case 'GAS_RISK':
          recommendations.push('⛽ Adjust gas price based on current network conditions');
          break;
        case 'TOKEN_RISK':
          recommendations.push('🎯 Research token fundamentals and community before trading');
          break;
        case 'PROTOCOL_RISK':
          recommendations.push('🏗️ Use well-established protocols with proven track records');
          break;
      }
    });

    return recommendations;
  }
}

// Toast notification helper
export function showRiskToast(assessment: RiskAssessment): void {
  const { overallRisk, riskScore, recommendations } = assessment;
  
  const toastConfig = {
    LOW: { color: 'green', icon: '✅' },
    MEDIUM: { color: 'yellow', icon: '⚠️' },
    HIGH: { color: 'orange', icon: '🚨' },
    CRITICAL: { color: 'red', icon: '💥' }
  };

  const config = toastConfig[overallRisk];
  
  // This would integrate with your toast system
  console.log(`${config.icon} Risk Assessment: ${overallRisk} (${riskScore}/100)`);
  recommendations.forEach(rec => console.log(`  ${rec}`));
} 