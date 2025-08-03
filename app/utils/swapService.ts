import { getOneInchAPI, OneInchToken, OneInchQuote, OneInchSwap, OneInchBalance } from './oneinchApi';
import { ethers } from 'ethers';

export interface SwapRequest {
  fromToken: string;
  toToken: string;
  fromChain: number;
  toChain: number;
  amount: string;
  fromAddress: string;
  slippage?: number;
}

export interface SwapResult {
  success: boolean;
  txHash?: string;
  error?: string;
  swapData?: OneInchSwap;
  quoteData?: OneInchQuote;
}

export interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
}

export interface WalletPortfolio {
  totalValue: number;
  tokens: Array<{
    token: OneInchToken;
    balance: string;
    value: number;
    percentage: number;
  }>;
}

export interface MarketData {
  totalVolume24h: number;
  totalTvl: number;
  activeProtocols: number;
  topTokens: OneInchToken[];
}

class SwapService {
  private api = getOneInchAPI();

  private checkAPI(): boolean {
    if (!this.api) {
      console.warn('1inch API is not available. Please set REACT_APP_1INCH_API_KEY environment variable.');
      return false;
    }
    return true;
  }

  // Token Management
  async getSupportedTokens(chainId: number): Promise<OneInchToken[]> {
    if (!this.checkAPI()) return [];
    
    try {
      return await this.api!.getTokens(chainId);
    } catch (error) {
      console.error('Error fetching supported tokens:', error);
      return [];
    }
  }

  async getTokenMetadata(chainId: number, tokenAddress: string): Promise<OneInchToken | null> {
    if (!this.checkAPI()) return null;
    
    try {
      return await this.api!.getTokenMetadata(chainId, tokenAddress);
    } catch (error) {
      console.error('Error fetching token metadata:', error);
      return null;
    }
  }

  // Price Feeds
  async getTokenPrices(chainId: number, tokenAddresses: string[]): Promise<Record<string, number>> {
    if (!this.checkAPI()) return {};
    
    try {
      return await this.api!.getPrices(chainId, tokenAddresses);
    } catch (error) {
      console.error('Error fetching token prices:', error);
      return {};
    }
  }

  async getTokenPriceHistory(chainId: number, tokenAddress: string, days: number = 30): Promise<Array<{ timestamp: number; price: number; }>> {
    if (!this.checkAPI()) return [];
    
    try {
      const to = Math.floor(Date.now() / 1000);
      const from = to - (days * 24 * 60 * 60);
      return await this.api!.getTokenPriceHistory(chainId, tokenAddress, from, to, '1d');
    } catch (error) {
      console.error('Error fetching token price history:', error);
      return [];
    }
  }

  // Classic Swap
  async getSwapQuote(request: SwapRequest): Promise<OneInchQuote | null> {
    if (!this.checkAPI()) return null;
    
    try {
      return await this.api!.getQuote(
        request.fromChain,
        request.fromToken,
        request.toToken,
        request.amount
      );
    } catch (error) {
      console.error('Error fetching swap quote:', error);
      return null;
    }
  }

  async executeSwap(request: SwapRequest): Promise<SwapResult> {
    if (!this.checkAPI()) {
      return { success: false, error: '1inch API not available' };
    }
    
    try {
      const swapData = await this.api!.getSwap(
        request.fromChain,
        request.fromToken,
        request.toToken,
        request.amount,
        request.fromAddress,
        request.slippage || 1
      );

      return {
        success: true,
        swapData,
        txHash: undefined
      };
    } catch (error) {
      console.error('Error executing swap:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Cross-chain Swap (Fusion+)
  async getCrossChainQuote(request: SwapRequest): Promise<any> {
    if (!this.checkAPI()) return null;
    
    try {
      return await this.api!.getCrossChainQuote(
        request.fromChain,
        request.toChain,
        request.fromToken,
        request.toToken,
        request.amount,
        request.fromAddress
      );
    } catch (error) {
      console.error('Error fetching cross-chain quote:', error);
      return null;
    }
  }

  async executeCrossChainSwap(quoteId: string, fromAddress: string, signature: string): Promise<SwapResult> {
    if (!this.checkAPI()) {
      return { success: false, error: '1inch API not available' };
    }
    
    try {
      const swapData = await this.api!.createCrossChainSwap(quoteId, fromAddress, signature);
      
      return {
        success: true,
        swapData,
        txHash: undefined
      };
    } catch (error) {
      console.error('Error executing cross-chain swap:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Wallet Management
  async getWalletBalances(chainId: number, walletAddress: string): Promise<OneInchBalance[]> {
    if (!this.checkAPI()) return [];
    
    try {
      return await this.api!.getWalletBalances(chainId, walletAddress);
    } catch (error) {
      console.error('Error fetching wallet balances:', error);
      return [];
    }
  }

  async getMultiChainPortfolio(walletAddress: string, chains: number[]): Promise<Record<number, WalletPortfolio>> {
    if (!this.checkAPI()) return {};
    
    try {
      const portfolio: Record<number, WalletPortfolio> = {};
      
      for (const chainId of chains) {
        const balances = await this.api!.getWalletBalances(chainId, walletAddress);
        const totalValue = balances.reduce((sum, balance) => sum + balance.balanceUsd, 0);
        
        portfolio[chainId] = {
          totalValue,
          tokens: balances.map(balance => ({
            token: balance.token,
            balance: balance.balance,
            value: balance.balanceUsd,
            percentage: totalValue > 0 ? (balance.balanceUsd / totalValue) * 100 : 0,
          }))
        };
      }
      
      return portfolio;
    } catch (error) {
      console.error('Error fetching multi-chain portfolio:', error);
      return {};
    }
  }

  // Gas Estimation
  async getGasPrice(chainId: number): Promise<{ fast: number; standard: number; slow: number; } | null> {
    if (!this.checkAPI()) return null;
    
    try {
      return await this.api!.getGasPrice(chainId);
    } catch (error) {
      console.error('Error fetching gas price:', error);
      return null;
    }
  }

  // Transaction Management
  async getTransactionStatus(txHash: string): Promise<{ status: 'pending' | 'confirmed' | 'failed'; blockNumber?: number; gasUsed?: number; effectiveGasPrice?: string; } | null> {
    if (!this.checkAPI()) return null;
    
    try {
      return await this.api!.getTransactionStatus(txHash);
    } catch (error) {
      console.error('Error fetching transaction status:', error);
      return null;
    }
  }

  // Limit Orders
  async getLimitOrders(chainId: number, makerAsset: string, takerAsset: string, limit: number = 20): Promise<any[]> {
    if (!this.checkAPI()) return [];
    
    try {
      return await this.api!.getLimitOrders(chainId, makerAsset, takerAsset, limit);
    } catch (error) {
      console.error('Error fetching limit orders:', error);
      return [];
    }
  }

  async createLimitOrder(chainId: number, order: any): Promise<{ orderHash: string } | null> {
    if (!this.checkAPI()) return null;
    
    try {
      return await this.api!.createLimitOrder(chainId, order);
    } catch (error) {
      console.error('Error creating limit order:', error);
      return null;
    }
  }

  // Market Data
  async getMarketOverview(chainId: number): Promise<MarketData | null> {
    if (!this.checkAPI()) return null;
    
    try {
      const [overview, topTokens] = await Promise.all([
        this.api!.getMarketOverview(chainId),
        this.api!.getTopTokens(chainId, 20)
      ]);
      
      return {
        ...overview,
        topTokens
      };
    } catch (error) {
      console.error('Error fetching market overview:', error);
      return null;
    }
  }

  // Protocol Information
  async getSupportedProtocols(chainId: number): Promise<Array<{ id: string; title: string; description: string; logoURI: string; }>> {
    if (!this.checkAPI()) return [];
    
    try {
      return await this.api!.getProtocols(chainId);
    } catch (error) {
      console.error('Error fetching supported protocols:', error);
      return [];
    }
  }

  async getSupportedChains(): Promise<Array<{ chainId: number; name: string; nativeCurrency: { name: string; symbol: string; decimals: number; }; }>> {
    if (!this.checkAPI()) return [];
    
    try {
      return await this.api!.getSupportedChains();
    } catch (error) {
      console.error('Error fetching supported chains:', error);
      return [];
    }
  }

  // Health Check
  async checkAPIHealth(): Promise<{ status: 'ok' | 'error'; timestamp: number; } | null> {
    if (!this.checkAPI()) return null;
    
    try {
      return await this.api!.getHealthStatus();
    } catch (error) {
      console.error('Error checking API health:', error);
      return null;
    }
  }

  // Utility Methods
  formatTokenAmount(amount: string, decimals: number): string {
    try {
      return ethers.formatUnits(amount, decimals);
    } catch (error) {
      console.error('Error formatting token amount:', error);
      return '0';
    }
  }

  parseTokenAmount(amount: string, decimals: number): string {
    try {
      return ethers.parseUnits(amount, decimals).toString();
    } catch (error) {
      console.error('Error parsing token amount:', error);
      return '0';
    }
  }

  calculateSlippage(priceImpact: number): number {
    // Calculate recommended slippage based on price impact
    if (priceImpact < 1) return 1;
    if (priceImpact < 5) return 2;
    if (priceImpact < 10) return 5;
    return 10;
  }

  // Batch Operations
  async getMultipleQuotes(chainId: number, requests: Array<{ fromTokenAddress: string; toTokenAddress: string; amount: string; }>): Promise<OneInchQuote[]> {
    if (!this.checkAPI()) return [];
    
    try {
      return await this.api!.getMultipleQuotes(chainId, requests);
    } catch (error) {
      console.error('Error fetching multiple quotes:', error);
      return [];
    }
  }

  async getMultipleBalances(chainId: number, walletAddresses: string[]): Promise<Record<string, OneInchBalance[]>> {
    if (!this.checkAPI()) return {};
    
    try {
      return await this.api!.getMultipleBalances(chainId, walletAddresses);
    } catch (error) {
      console.error('Error fetching multiple balances:', error);
      return {};
    }
  }

  // Risk Assessment
  async getTokenRiskScore(chainId: number, tokenAddress: string): Promise<{ riskScore: number; riskLevel: 'low' | 'medium' | 'high'; factors: string[]; } | null> {
    if (!this.checkAPI()) return null;
    
    try {
      return await this.api!.getTokenRiskScore(chainId, tokenAddress);
    } catch (error) {
      console.error('Error fetching token risk score:', error);
      return null;
    }
  }

  async getSwapRiskAssessment(chainId: number, fromTokenAddress: string, toTokenAddress: string, amount: string): Promise<{ riskScore: number; warnings: string[]; recommendations: string[]; } | null> {
    if (!this.checkAPI()) return null;
    
    try {
      return await this.api!.getSwapRiskAssessment(chainId, fromTokenAddress, toTokenAddress, amount);
    } catch (error) {
      console.error('Error fetching swap risk assessment:', error);
      return null;
    }
  }
}

let swapServiceInstance: SwapService | null = null;

export function getSwapService(): SwapService {
  if (!swapServiceInstance) {
    swapServiceInstance = new SwapService();
  }
  return swapServiceInstance;
}

export { SwapService }; 