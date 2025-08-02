import { getOneInchAPI, OneInchToken, OneInchQuote, OneInchSwap, OneInchBalance } from './oneinchApi';
import { ethers } from 'ethers';

export interface SwapRequest {
  fromChainId: number;
  toChainId: number;
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  fromAddress: string;
  slippage?: number;
  fee?: number;
}

export interface SwapResult {
  success: boolean;
  txHash?: string;
  error?: string;
  quote?: OneInchQuote;
  swap?: OneInchSwap;
}

export interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
}

export interface WalletPortfolio {
  address: string;
  balances: OneInchBalance[];
  totalValueUSD: number;
  chains: number[];
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
    try {
      return await this.api.getPrices(chainId, tokenAddresses);
    } catch (error) {
      console.error('Error fetching token prices:', error);
      return {};
    }
  }

  async getTokenPriceHistory(
    chainId: number,
    tokenAddress: string,
    period: '1h' | '24h' | '7d' | '30d' = '24h'
  ): Promise<Array<{ timestamp: number; price: number }>> {
    try {
      // This would integrate with 1inch's price history API
      // For now, return mock data
      const now = Date.now();
      const data = [];
      const interval = period === '1h' ? 60000 : period === '24h' ? 3600000 : period === '7d' ? 86400000 : 86400000;
      
      for (let i = 0; i < 24; i++) {
        data.push({
          timestamp: now - (i * interval),
          price: Math.random() * 1000 + 100, // Mock price
        });
      }
      
      return data.reverse();
    } catch (error) {
      console.error('Error fetching price history:', error);
      return [];
    }
  }

  // Classic Swap (DEX Aggregation)
  async getSwapQuote(request: SwapRequest): Promise<OneInchQuote | null> {
    try {
      return await this.api.getQuote(
        request.fromChainId,
        request.fromTokenAddress,
        request.toTokenAddress,
        request.amount,
        request.fee
      );
    } catch (error) {
      console.error('Error getting swap quote:', error);
      return null;
    }
  }

  async executeSwap(request: SwapRequest): Promise<SwapResult> {
    try {
      // Get quote first
      const quote = await this.getSwapQuote(request);
      if (!quote) {
        return { success: false, error: 'Failed to get quote' };
      }

      // Get swap transaction
      const swap = await this.api.getSwap(
        request.fromChainId,
        request.fromTokenAddress,
        request.toTokenAddress,
        request.amount,
        request.fromAddress,
        request.slippage || 1,
        request.fee
      );

      return {
        success: true,
        quote,
        swap,
      };
    } catch (error) {
      console.error('Error executing swap:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Cross-chain Swap (Fusion+)
  async getCrossChainQuote(request: SwapRequest): Promise<any> {
    try {
      return await this.api.getCrossChainQuote(
        request.fromChainId,
        request.toChainId,
        request.fromTokenAddress,
        request.toTokenAddress,
        request.amount,
        request.fromAddress
      );
    } catch (error) {
      console.error('Error getting cross-chain quote:', error);
      return null;
    }
  }

  async executeCrossChainSwap(
    quoteId: string,
    fromAddress: string,
    signature: string
  ): Promise<SwapResult> {
    try {
      const result = await this.api.createCrossChainSwap(quoteId, fromAddress, signature);
      return {
        success: true,
        txHash: result.txHash,
      };
    } catch (error) {
      console.error('Error executing cross-chain swap:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Wallet Balances
  async getWalletBalances(chainId: number, address: string): Promise<OneInchBalance[]> {
    try {
      return await this.api.getWalletBalances(chainId, address);
    } catch (error) {
      console.error('Error fetching wallet balances:', error);
      return [];
    }
  }

  async getMultiChainPortfolio(addresses: string[]): Promise<WalletPortfolio[]> {
    try {
      const supportedChains = await this.api.getSupportedChains();
      const portfolios: WalletPortfolio[] = [];

      for (const address of addresses) {
        const balances: OneInchBalance[] = [];
        const chains: number[] = [];
        let totalValueUSD = 0;

        // Get balances for each supported chain
        for (const chain of supportedChains.slice(0, 5)) { // Limit to first 5 chains for performance
          try {
            const chainBalances = await this.getWalletBalances(chain.chainId, address);
            balances.push(...chainBalances);
            chains.push(chain.chainId);
          } catch (error) {
            console.warn(`Failed to get balances for chain ${chain.chainId}:`, error);
          }
        }

        // Calculate total value (this would require price data)
        portfolios.push({
          address,
          balances,
          totalValueUSD,
          chains,
        });
      }

      return portfolios;
    } catch (error) {
      console.error('Error fetching multi-chain portfolio:', error);
      return [];
    }
  }

  // Gas Estimation
  async getGasPrice(chainId: number): Promise<{
    fast: number;
    standard: number;
    slow: number;
  } | null> {
    try {
      return await this.api.getGasPrice(chainId);
    } catch (error) {
      console.error('Error fetching gas price:', error);
      return null;
    }
  }

  // Transaction Management
  async getTransactionStatus(txHash: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    blockNumber?: number;
    gasUsed?: number;
    effectiveGasPrice?: string;
  } | null> {
    try {
      return await this.api.getTransactionStatus(txHash);
    } catch (error) {
      console.error('Error fetching transaction status:', error);
      return null;
    }
  }

  // Limit Orders
  async getLimitOrders(
    chainId: number,
    makerAsset: string,
    takerAsset: string,
    limit: number = 20
  ): Promise<any[]> {
    try {
      return await this.api.getLimitOrders(chainId, makerAsset, takerAsset, limit);
    } catch (error) {
      console.error('Error fetching limit orders:', error);
      return [];
    }
  }

  async createLimitOrder(chainId: number, order: any): Promise<{ orderHash: string } | null> {
    try {
      return await this.api.createLimitOrder(chainId, order);
    } catch (error) {
      console.error('Error creating limit order:', error);
      return null;
    }
  }

  // Market Data
  async getMarketOverview(chainId: number): Promise<{
    totalVolume24h: number;
    totalTrades24h: number;
    topTokens: TokenPrice[];
  }> {
    try {
      // This would integrate with 1inch's market data APIs
      // For now, return mock data
      return {
        totalVolume24h: 1500000000, // $1.5B
        totalTrades24h: 125000,
        topTokens: [
          { symbol: 'ETH', price: 2500, change24h: 2.5, volume24h: 500000000 },
          { symbol: 'USDC', price: 1, change24h: 0, volume24h: 300000000 },
          { symbol: 'USDT', price: 1, change24h: -0.1, volume24h: 250000000 },
        ],
      };
    } catch (error) {
      console.error('Error fetching market overview:', error);
      return {
        totalVolume24h: 0,
        totalTrades24h: 0,
        topTokens: [],
      };
    }
  }

  // Protocol Information
  async getSupportedProtocols(chainId: number): Promise<Array<{
    id: string;
    title: string;
    description: string;
    logoURI: string;
  }>> {
    try {
      return await this.api.getProtocols(chainId);
    } catch (error) {
      console.error('Error fetching protocols:', error);
      return [];
    }
  }

  async getSupportedChains(): Promise<Array<{
    chainId: number;
    name: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
  }>> {
    try {
      return await this.api.getSupportedChains();
    } catch (error) {
      console.error('Error fetching supported chains:', error);
      return [];
    }
  }

  // Health Check
  async checkAPIHealth(): Promise<boolean> {
    try {
      const health = await this.api.getHealthStatus();
      return health.status === 'ok';
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }

  // Utility Methods
  formatTokenAmount(amount: string, decimals: number): string {
    try {
      return ethers.formatUnits(amount, decimals);
    } catch (error) {
      return '0';
    }
  }

  parseTokenAmount(amount: string, decimals: number): string {
    try {
      return ethers.parseUnits(amount, decimals).toString();
    } catch (error) {
      return '0';
    }
  }

  calculateSlippage(amount: string, slippagePercent: number): string {
    try {
      const amountBN = ethers.BigNumber.from(amount);
      const slippageBN = amountBN.mul(slippagePercent).div(100);
      return amountBN.sub(slippageBN).toString();
    } catch (error) {
      return amount;
    }
  }

  // Batch Operations
  async getMultipleQuotes(
    chainId: number,
    requests: Array<{
      fromTokenAddress: string;
      toTokenAddress: string;
      amount: string;
    }>
  ): Promise<OneInchQuote[]> {
    try {
      return await this.api.getMultipleQuotes(chainId, requests);
    } catch (error) {
      console.error('Error fetching multiple quotes:', error);
      return [];
    }
  }

  async getMultipleBalances(
    chainId: number,
    walletAddresses: string[]
  ): Promise<Record<string, OneInchBalance[]>> {
    try {
      return await this.api.getMultipleBalances(chainId, walletAddresses);
    } catch (error) {
      console.error('Error fetching multiple balances:', error);
      return {};
    }
  }
}

// Create singleton instance
let swapServiceInstance: SwapService | null = null;

export function getSwapService(): SwapService {
  if (!swapServiceInstance) {
    swapServiceInstance = new SwapService();
  }
  return swapServiceInstance;
}

export { SwapService };
export type { SwapRequest, SwapResult, TokenPrice, WalletPortfolio }; 