// 1inch API Integration Layer
// Comprehensive integration with all 1inch APIs for DeFi functionality

export interface OneInchToken {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI: string;
  tags: string[];
  chainId: number;
}

export interface OneInchQuote {
  fromToken: OneInchToken;
  toToken: OneInchToken;
  fromTokenAmount: string;
  toTokenAmount: string;
  protocols: unknown[];
  estimatedGas: number;
  gasCost: string;
  priceImpact: number;
  blockNumber: number;
}

export interface OneInchSwap {
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    gas: number;
  };
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: any[];
  destReceiver: string;
}

export interface OneInchBalance {
  token: OneInchToken;
  balance: string;
  balanceRaw: string;
  balanceUsd: number;
}

export interface OneInchLimitOrder {
  orderHash: string;
  signature: string;
  order: {
    makerAsset: string;
    takerAsset: string;
    makerAmount: string;
    takerAmount: string;
    maker: string;
    taker: string;
    salt: string;
    expiration: number;
  };
}

export interface OneInchFusionQuote {
  id: string;
  fromToken: OneInchToken;
  toToken: OneInchToken;
  fromAmount: string;
  toAmount: string;
  estimatedGas: number;
  priceImpact: number;
  protocols: any[];
}

export interface OneInchFusionSwap {
  id: string;
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    gas: number;
  };
  toTokenAmount: string;
  fromTokenAmount: string;
}

class OneInchAPI {
  private baseUrl = 'https://api.1inch.dev';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request(endpoint: string, params: Record<string, any> = {}, options: RequestInit = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`1inch API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Token Management APIs
  async getTokens(chainId: number): Promise<OneInchToken[]> {
    return this.request(`/swap/v5.2/${chainId}/tokens`);
  }

  async getTokenMetadata(chainId: number, tokenAddress: string): Promise<OneInchToken> {
    const tokens = await this.getTokens(chainId);
    return tokens.find(token => token.address.toLowerCase() === tokenAddress.toLowerCase())!;
  }

  // Price Feed APIs
  async getQuote(chainId: number, fromTokenAddress: string, toTokenAddress: string, amount: string, fee?: number): Promise<OneInchQuote> {
    const params: any = {
      src: fromTokenAddress,
      dst: toTokenAddress,
      amount,
    };
    if (fee) params.fee = fee;
    
    return this.request(`/swap/v5.2/${chainId}/quote`, params);
  }

  async getPrices(chainId: number, tokens: string[], currency: string = 'USD'): Promise<Record<string, number>> {
    const params = {
      tokens: tokens.join(','),
      currency,
    };
    return this.request(`/price/v1.1/${chainId}`, params);
  }

  // Classic Swap APIs
  async getSwap(chainId: number, fromTokenAddress: string, toTokenAddress: string, amount: string, fromAddress: string, slippage: number = 1, fee?: number): Promise<OneInchSwap> {
    const params: any = {
      src: fromTokenAddress,
      dst: toTokenAddress,
      amount,
      from: fromAddress,
      slippage,
    };
    if (fee) params.fee = fee;
    
    return this.request(`/swap/v5.2/${chainId}/swap`, params);
  }

  // Wallet Balance APIs
  async getWalletBalances(chainId: number, walletAddress: string): Promise<OneInchBalance[]> {
    return this.request(`/balance/v1.2/${chainId}/balances`, { address: walletAddress });
  }

  // Limit Order Protocol APIs
  async getLimitOrders(chainId: number, makerAsset: string, takerAsset: string, limit: number = 20): Promise<OneInchLimitOrder[]> {
    const params = {
      makerAsset,
      takerAsset,
      limit,
    };
    return this.request(`/limit-order/v2.0/${chainId}/orders`, params);
  }

  async createLimitOrder(chainId: number, order: any): Promise<{ orderHash: string }> {
    return this.request(`/limit-order/v2.0/${chainId}/order`, {}, {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  // Cross-chain Swap (Fusion+) APIs
  async getCrossChainQuote(fromChainId: number, toChainId: number, fromTokenAddress: string, toTokenAddress: string, amount: string, fromAddress: string): Promise<OneInchFusionQuote> {
    const params = {
      fromChainId,
      toChainId,
      fromTokenAddress,
      toTokenAddress,
      fromAmount: amount,
      fromAddress,
    };
    return this.request('/fusion/quote', params);
  }

  async createCrossChainSwap(quoteId: string, fromAddress: string, signature: string): Promise<OneInchFusionSwap> {
    const params = {
      quoteId,
      fromAddress,
      signature,
    };
    return this.request('/fusion/swap', params);
  }

  // Gas Estimation APIs
  async getGasPrice(chainId: number): Promise<{ fast: number; standard: number; slow: number; }> {
    return this.request(`/gas/v1.1/${chainId}`);
  }

  // Transaction Status APIs
  async getTransactionStatus(txHash: string): Promise<{ status: 'pending' | 'confirmed' | 'failed'; blockNumber?: number; gasUsed?: number; effectiveGasPrice?: string; }> {
    return this.request(`/tx/v1.1/status`, { txHash });
  }

  // Health Check API
  async getHealthStatus(): Promise<{ status: 'ok' | 'error'; timestamp: number; }> {
    return this.request('/health');
  }

  // Utility APIs
  async getSupportedChains(): Promise<Array<{ chainId: number; name: string; nativeCurrency: { name: string; symbol: string; decimals: number; }; }>> {
    return this.request('/swap/v5.2/chains');
  }

  async getProtocols(chainId: number): Promise<Array<{ id: string; title: string; description: string; logoURI: string; }>> {
    return this.request(`/swap/v5.2/${chainId}/protocols`);
  }

  // Batch APIs for multiple requests
  async getMultipleQuotes(chainId: number, requests: Array<{ fromTokenAddress: string; toTokenAddress: string; amount: string; }>): Promise<OneInchQuote[]> {
    const promises = requests.map(req => 
      this.getQuote(chainId, req.fromTokenAddress, req.toTokenAddress, req.amount)
    );
    return Promise.all(promises);
  }

  async getMultipleBalances(chainId: number, walletAddresses: string[]): Promise<Record<string, OneInchBalance[]>> {
    const promises = walletAddresses.map(address => 
      this.getWalletBalances(chainId, address)
    );
    const results = await Promise.all(promises);
    
    const balances: Record<string, OneInchBalance[]> = {};
    walletAddresses.forEach((address, index) => {
      balances[address] = results[index];
    });
    
    return balances;
  }

  // Advanced Analytics APIs
  async getTokenPriceHistory(chainId: number, tokenAddress: string, from: number, to: number, interval: '1h' | '1d' | '1w' = '1d'): Promise<Array<{ timestamp: number; price: number; }>> {
    const params = {
      token: tokenAddress,
      from,
      to,
      interval,
    };
    return this.request(`/price/v1.1/${chainId}/history`, params);
  }

  async getProtocolStats(chainId: number, protocolId: string): Promise<{ volume24h: number; tvl: number; fees24h: number; }> {
    return this.request(`/protocols/v1.0/${chainId}/stats`, { protocol: protocolId });
  }

  // Market Data APIs
  async getMarketOverview(chainId: number): Promise<{ totalVolume24h: number; totalTvl: number; activeProtocols: number; }> {
    return this.request(`/market/v1.0/${chainId}/overview`);
  }

  async getTopTokens(chainId: number, limit: number = 20): Promise<OneInchToken[]> {
    return this.request(`/tokens/v1.0/${chainId}/top`, { limit });
  }

  // Portfolio Analytics APIs
  async getPortfolioValue(chainId: number, walletAddress: string): Promise<{ totalValue: number; tokens: Array<{ token: OneInchToken; value: number; percentage: number; }> }> {
    const balances = await this.getWalletBalances(chainId, walletAddress);
    const totalValue = balances.reduce((sum, balance) => sum + balance.balanceUsd, 0);
    
    const tokens = balances.map(balance => ({
      token: balance.token,
      value: balance.balanceUsd,
      percentage: totalValue > 0 ? (balance.balanceUsd / totalValue) * 100 : 0,
    }));

    return { totalValue, tokens };
  }

  // Risk Assessment APIs
  async getTokenRiskScore(chainId: number, tokenAddress: string): Promise<{ riskScore: number; riskLevel: 'low' | 'medium' | 'high'; factors: string[]; }> {
    return this.request(`/risk/v1.0/${chainId}/token`, { token: tokenAddress });
  }

  async getSwapRiskAssessment(chainId: number, fromTokenAddress: string, toTokenAddress: string, amount: string): Promise<{ riskScore: number; warnings: string[]; recommendations: string[]; }> {
    const params = {
      fromToken: fromTokenAddress,
      toToken: toTokenAddress,
      amount,
    };
    return this.request(`/risk/v1.0/${chainId}/swap`, params);
  }
}

let oneInchInstance: OneInchAPI | null = null;

export function getOneInchAPI(apiKey?: string): OneInchAPI | null {
  if (!oneInchInstance) {
    const key = apiKey || process.env.REACT_APP_1INCH_API_KEY || '';
    if (!key) {
      console.warn('1inch API key is not set. Set REACT_APP_1INCH_API_KEY environment variable for full functionality.');
      return null;
    }
    oneInchInstance = new OneInchAPI(key);
  }
  return oneInchInstance;
}

export { OneInchAPI }; 