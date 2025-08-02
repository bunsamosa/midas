// 1inch API Integration Layer
// Supports multiple 1inch APIs for comprehensive DeFi functionality

export interface OneInchToken {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI: string;
  tags: string[];
}

export interface OneInchQuote {
  fromToken: OneInchToken;
  toToken: OneInchToken;
  fromTokenAmount: string;
  toTokenAmount: string;
  protocols: any[];
  estimatedGas: number;
}

export interface OneInchSwap {
  fromToken: OneInchToken;
  toToken: OneInchToken;
  fromTokenAmount: string;
  toTokenAmount: string;
  protocols: any[];
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    gas: number;
  };
}

export interface OneInchPrice {
  fromToken: OneInchToken;
  toToken: OneInchToken;
  fromTokenAmount: string;
  toTokenAmount: string;
  estimatedGas: number;
}

export interface OneInchBalance {
  token: OneInchToken;
  balance: string;
  balanceRaw: string;
}

export interface OneInchLimitOrder {
  makerAsset: string;
  takerAsset: string;
  makerAmount: string;
  takerAmount: string;
  maker: string;
  salt: string;
  signature: string;
  permit: string;
  interactions: string;
}

class OneInchAPI {
  private baseUrl = 'https://api.1inch.dev';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request(endpoint: string, params: Record<string, any> = {}, options: RequestInit = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`1inch API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Token Metadata API
  async getTokens(chainId: number): Promise<OneInchToken[]> {
    return this.request(`/swap/v5.2/${chainId}/tokens`);
  }

  async getTokenMetadata(chainId: number, tokenAddress: string): Promise<OneInchToken> {
    return this.request(`/swap/v5.2/${chainId}/tokens/${tokenAddress}`);
  }

  // Price Feeds API
  async getQuote(
    chainId: number,
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    fee?: number
  ): Promise<OneInchQuote> {
    const params: any = {
      src: fromTokenAddress,
      dst: toTokenAddress,
      amount,
    };
    
    if (fee) params.fee = fee;

    return this.request(`/swap/v5.2/${chainId}/quote`, params);
  }

  async getPrices(
    chainId: number,
    tokens: string[],
    currency: string = 'USD'
  ): Promise<Record<string, number>> {
    return this.request(`/price/v1.1/${chainId}`, {
      tokens: tokens.join(','),
      currency,
    });
  }

  // Classic Swap API
  async getSwap(
    chainId: number,
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    fromAddress: string,
    slippage: number = 1,
    fee?: number
  ): Promise<OneInchSwap> {
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

  // Wallet Balances API
  async getWalletBalances(
    chainId: number,
    walletAddress: string
  ): Promise<OneInchBalance[]> {
    return this.request(`/balance/v1.2/${chainId}/balances`, {
      wallet: walletAddress,
    });
  }

  // Limit Order Protocol API
  async getLimitOrders(
    chainId: number,
    makerAsset: string,
    takerAsset: string,
    limit: number = 20
  ): Promise<OneInchLimitOrder[]> {
    return this.request(`/limit-order/v2.0/${chainId}/orders`, {
      makerAsset,
      takerAsset,
      limit,
    });
  }

  async createLimitOrder(
    chainId: number,
    order: OneInchLimitOrder
  ): Promise<{ orderHash: string }> {
    return this.request(`/limit-order/v2.0/${chainId}/order`, order, {
      method: 'POST',
    });
  }

  // Cross-chain Swap API (Fusion+)
  async getCrossChainQuote(
    fromChainId: number,
    toChainId: number,
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    fromAddress: string
  ): Promise<any> {
    return this.request(`/fusion/quote`, {
      fromChainId,
      toChainId,
      fromTokenAddress,
      toTokenAddress,
      amount,
      fromAddress,
    });
  }

  async createCrossChainSwap(
    quoteId: string,
    fromAddress: string,
    signature: string
  ): Promise<any> {
    return this.request(`/fusion/swap`, {
      quoteId,
      fromAddress,
      signature,
    }, {
      method: 'POST',
    });
  }

  // Gas Estimation API
  async getGasPrice(chainId: number): Promise<{
    fast: number;
    standard: number;
    slow: number;
  }> {
    return this.request(`/gas/v1.1/${chainId}`);
  }

  // Transaction Status API
  async getTransactionStatus(txHash: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    blockNumber?: number;
    gasUsed?: number;
    effectiveGasPrice?: string;
  }> {
    return this.request(`/tx/v1.1/status`, {
      txHash,
    });
  }

  // Health Check API
  async getHealthStatus(): Promise<{
    status: 'ok' | 'error';
    timestamp: number;
  }> {
    return this.request('/health');
  }

  // Utility Methods
  async getSupportedChains(): Promise<Array<{
    chainId: number;
    name: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
  }>> {
    return this.request('/swap/v5.2/chains');
  }

  async getProtocols(chainId: number): Promise<Array<{
    id: string;
    title: string;
    description: string;
    logoURI: string;
  }>> {
    return this.request(`/swap/v5.2/${chainId}/protocols`);
  }

  // Batch Requests
  async getMultipleQuotes(
    chainId: number,
    requests: Array<{
      fromTokenAddress: string;
      toTokenAddress: string;
      amount: string;
    }>
  ): Promise<OneInchQuote[]> {
    const promises = requests.map(req =>
      this.getQuote(chainId, req.fromTokenAddress, req.toTokenAddress, req.amount)
    );
    return Promise.all(promises);
  }

  async getMultipleBalances(
    chainId: number,
    walletAddresses: string[]
  ): Promise<Record<string, OneInchBalance[]>> {
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
}

// Create singleton instance
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

// Export types and utility functions
export { OneInchAPI }; 