import { Navbar } from "components/Navbar";
import { Card, CardContent } from "components/ui/card";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { useState, useEffect } from "react";
import { 
  ArrowUpDown, Clock, Lock, AlertCircle, CheckCircle, TrendingUp, 
  DollarSign, Coins, Zap, Shield, Timer, Activity, BarChart3,
  Wallet, RefreshCw, ExternalLink, ChevronDown, ChevronUp
} from "lucide-react";
import { getSwapService, SwapRequest, SwapResult, TokenPrice, WalletPortfolio, SwapService } from "../utils/swapService";
import { OneInchToken, OneInchQuote } from "../utils/oneinchApi";

export default function AdvancedSwap() {
  const [swapService, setSwapService] = useState<SwapService | null>(null);
  const [apiAvailable, setApiAvailable] = useState(false);

  useEffect(() => {
    try {
      const service = getSwapService();
      setSwapService(service);
      setApiAvailable(true);
    } catch (error) {
      console.warn('1inch API not available:', error);
      setApiAvailable(false);
    }
  }, []);
  
  // State management
  const [activeTab, setActiveTab] = useState<'swap' | 'portfolio' | 'market' | 'orders'>('swap');
  const [swapMode, setSwapMode] = useState<'classic' | 'cross-chain' | 'fusion'>('classic');
  const [isLoading, setIsLoading] = useState(false);
  const [apiHealth, setApiHealth] = useState<boolean | null>(null);
  
  // Swap state
  const [swapForm, setSwapForm] = useState({
    fromChainId: 1, // Ethereum
    toChainId: 137, // Polygon
    fromTokenAddress: '',
    toTokenAddress: '',
    fromAmount: '',
    toAmount: '',
    slippage: 1,
    fromAddress: ''
  });
  
  // Data state
  const [supportedTokens, setSupportedTokens] = useState<OneInchToken[]>([]);
  const [supportedChains, setSupportedChains] = useState<any[]>([]);
  const [currentQuote, setCurrentQuote] = useState<OneInchQuote | null>(null);
  const [gasPrice, setGasPrice] = useState<any>(null);
  const [marketData, setMarketData] = useState<any>(null);
  const [walletPortfolio, setWalletPortfolio] = useState<WalletPortfolio | null>(null);
  const [limitOrders, setLimitOrders] = useState<any[]>([]);

  // Initialize data
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    if (!swapService) return;
    
    setIsLoading(true);
    try {
      // Check API health
      const health = await swapService.checkAPIHealth();
      setApiHealth(health);

      // Load supported chains
      const chains = await swapService.getSupportedChains();
      setSupportedChains(chains);

      // Load supported tokens for Ethereum
      const tokens = await swapService.getSupportedTokens(1);
      setSupportedTokens(tokens);

      // Load gas price
      const gas = await swapService.getGasPrice(1);
      setGasPrice(gas);

      // Load market data
      const market = await swapService.getMarketOverview(1);
      setMarketData(market);

    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get quote for swap
  const getQuote = async () => {
    if (!swapForm.fromTokenAddress || !swapForm.toTokenAddress || !swapForm.fromAmount) {
      return;
    }

    setIsLoading(true);
    try {
      const request: SwapRequest = {
        fromChainId: swapForm.fromChainId,
        toChainId: swapForm.toChainId,
        fromTokenAddress: swapForm.fromTokenAddress,
        toTokenAddress: swapForm.toTokenAddress,
        amount: swapForm.fromAmount,
        fromAddress: swapForm.fromAddress,
        slippage: swapForm.slippage
      };

      let quote: OneInchQuote | null = null;
      
      if (swapMode === 'classic') {
        quote = await swapService.getSwapQuote(request);
      } else if (swapMode === 'cross-chain') {
        quote = await swapService.getCrossChainQuote(request);
      }

      setCurrentQuote(quote);
    } catch (error) {
      console.error('Error getting quote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute swap
  const executeSwap = async () => {
    if (!currentQuote || !swapForm.fromAddress) {
      return;
    }

    setIsLoading(true);
    try {
      const request: SwapRequest = {
        fromChainId: swapForm.fromChainId,
        toChainId: swapForm.toChainId,
        fromTokenAddress: swapForm.fromTokenAddress,
        toTokenAddress: swapForm.toTokenAddress,
        amount: swapForm.fromAmount,
        fromAddress: swapForm.fromAddress,
        slippage: swapForm.slippage
      };

      let result: SwapResult;
      
      if (swapMode === 'classic') {
        result = await swapService.executeSwap(request);
      } else if (swapMode === 'cross-chain') {
        // For cross-chain, we'd need the quote ID and signature
        result = { success: false, error: 'Cross-chain execution requires additional setup' };
      } else {
        result = { success: false, error: 'Invalid swap mode' };
      }

      if (result.success) {
        alert(`Swap executed successfully! TX Hash: ${result.txHash}`);
        setCurrentQuote(null);
      } else {
        alert(`Swap failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error executing swap:', error);
      alert('Error executing swap');
    } finally {
      setIsLoading(false);
    }
  };

  // Load wallet portfolio
  const loadWalletPortfolio = async (address: string) => {
    setIsLoading(true);
    try {
      const portfolios = await swapService.getMultiChainPortfolio([address]);
      setWalletPortfolio(portfolios[0] || null);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load limit orders
  const loadLimitOrders = async () => {
    setIsLoading(true);
    try {
      const orders = await swapService.getLimitOrders(1, '', '', 20);
      setLimitOrders(orders);
    } catch (error) {
      console.error('Error loading limit orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Header Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              1inch Advanced Swap
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive DeFi platform powered by 1inch APIs. 
              Classic swaps, cross-chain swaps, limit orders, and real-time market data.
            </p>
            
            {/* API Health Status */}
            <div className="mt-4 flex justify-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                !apiAvailable ? 'bg-red-100 text-red-800' :
                apiHealth === null ? 'bg-gray-100 text-gray-800' :
                apiHealth ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  !apiAvailable ? 'bg-red-500' :
                  apiHealth === null ? 'bg-gray-400' :
                  apiHealth ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                {!apiAvailable ? '1inch API Key Required' :
                 apiHealth === null ? 'Checking API...' :
                 apiHealth ? '1inch API Connected' : 'API Connection Failed'}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setActiveTab('swap')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'swap'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="h-4 w-4" />
                  <span>Swap</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'portfolio'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Wallet className="h-4 w-4" />
                  <span>Portfolio</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('market')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'market'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Market</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Orders</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          {activeTab === 'swap' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Swap Form */}
              <div className="lg:col-span-2">
                <Card className="border border-gray-200 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-500 p-2 rounded-lg mr-3">
                          <ArrowUpDown className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Advanced Swap</h3>
                      </div>
                      <Button
                        onClick={initializeData}
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>

                    {/* Swap Mode Selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Swap Mode</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => setSwapMode('classic')}
                          className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                            swapMode === 'classic'
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <Zap className="h-4 w-4 mx-auto mb-1" />
                          Classic
                        </button>
                        <button
                          onClick={() => setSwapMode('cross-chain')}
                          className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                            swapMode === 'cross-chain'
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <Shield className="h-4 w-4 mx-auto mb-1" />
                          Cross-Chain
                        </button>
                        <button
                          onClick={() => setSwapMode('fusion')}
                          className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                            swapMode === 'fusion'
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <TrendingUp className="h-4 w-4 mx-auto mb-1" />
                          Fusion
                        </button>
                      </div>
                    </div>

                    {/* Swap Form */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">From Chain</label>
                          <select 
                            value={swapForm.fromChainId}
                            onChange={(e) => setSwapForm({...swapForm, fromChainId: parseInt(e.target.value)})}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            {supportedChains.map(chain => (
                              <option key={chain.chainId} value={chain.chainId}>
                                {chain.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">To Chain</label>
                          <select 
                            value={swapForm.toChainId}
                            onChange={(e) => setSwapForm({...swapForm, toChainId: parseInt(e.target.value)})}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            {supportedChains.map(chain => (
                              <option key={chain.chainId} value={chain.chainId}>
                                {chain.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">From Token</label>
                          <select 
                            value={swapForm.fromTokenAddress}
                            onChange={(e) => setSwapForm({...swapForm, fromTokenAddress: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="">Select token</option>
                            {supportedTokens.slice(0, 20).map(token => (
                              <option key={token.address} value={token.address}>
                                {token.symbol} - {token.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">To Token</label>
                          <select 
                            value={swapForm.toTokenAddress}
                            onChange={(e) => setSwapForm({...swapForm, toTokenAddress: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="">Select token</option>
                            {supportedTokens.slice(0, 20).map(token => (
                              <option key={token.address} value={token.address}>
                                {token.symbol} - {token.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">From Amount</label>
                          <Input
                            type="number"
                            value={swapForm.fromAmount}
                            onChange={(e) => setSwapForm({...swapForm, fromAmount: e.target.value})}
                            placeholder="0.0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">To Amount</label>
                          <Input
                            type="number"
                            value={swapForm.toAmount}
                            placeholder="0.0"
                            disabled
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
                          <Input
                            value={swapForm.fromAddress}
                            onChange={(e) => setSwapForm({...swapForm, fromAddress: e.target.value})}
                            placeholder="0x..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Slippage (%)</label>
                          <Input
                            type="number"
                            value={swapForm.slippage}
                            onChange={(e) => setSwapForm({...swapForm, slippage: parseFloat(e.target.value)})}
                            placeholder="1.0"
                          />
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Button 
                          onClick={getQuote}
                          className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Getting Quote...' : 'Get Quote'}
                        </Button>
                        <Button 
                          onClick={executeSwap}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                          disabled={!currentQuote || isLoading}
                        >
                          {isLoading ? 'Executing...' : 'Execute Swap'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quote and Gas Info */}
              <div className="lg:col-span-1">
                <Card className="border border-gray-200 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-6">
                      <div className="bg-blue-500 p-2 rounded-lg mr-3">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Quote & Gas</h3>
                    </div>

                    {currentQuote ? (
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Swap Quote</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">From:</span>
                              <span className="font-medium">
                                {swapService.formatTokenAmount(currentQuote.fromTokenAmount, currentQuote.fromToken.decimals)} {currentQuote.fromToken.symbol}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">To:</span>
                              <span className="font-medium">
                                {swapService.formatTokenAmount(currentQuote.toTokenAmount, currentQuote.toToken.decimals)} {currentQuote.toToken.symbol}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Estimated Gas:</span>
                              <span className="font-medium">{currentQuote.estimatedGas}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">Get a quote to see details</p>
                    )}

                    {gasPrice && (
                      <div className="mt-6 bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Gas Prices</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fast:</span>
                            <span className="font-medium">{gasPrice.fast} Gwei</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Standard:</span>
                            <span className="font-medium">{gasPrice.standard} Gwei</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Slow:</span>
                            <span className="font-medium">{gasPrice.slow} Gwei</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Portfolio Overview */}
              <Card className="border border-gray-200 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-green-500 p-2 rounded-lg mr-3">
                      <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Portfolio Overview</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter wallet address"
                          className="flex-1"
                        />
                        <Button 
                          onClick={() => loadWalletPortfolio('0x...')}
                          className="bg-gray-900 hover:bg-gray-800 text-white"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Loading...' : 'Load'}
                        </Button>
                      </div>
                    </div>

                    {walletPortfolio ? (
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Total Value</h4>
                          <p className="text-2xl font-bold text-gray-900">
                            ${walletPortfolio.totalValueUSD.toLocaleString()}
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Supported Chains</h4>
                          <div className="flex flex-wrap gap-2">
                            {walletPortfolio.chains.map(chainId => (
                              <span key={chainId} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                Chain {chainId}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">Enter a wallet address to view portfolio</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Token Balances */}
              <Card className="border border-gray-200 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-500 p-2 rounded-lg mr-3">
                      <Coins className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Token Balances</h3>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {walletPortfolio?.balances.length ? (
                      walletPortfolio.balances.map((balance, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={balance.token.logoURI} 
                                alt={balance.token.symbol}
                                className="w-8 h-8 rounded-full"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                              <div>
                                <p className="font-medium text-gray-900">{balance.token.symbol}</p>
                                <p className="text-sm text-gray-600">{balance.token.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">{balance.balance}</p>
                              <p className="text-sm text-gray-600">Raw: {balance.balanceRaw}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">No balances to display</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'market' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Market Overview */}
              <div className="lg:col-span-2">
                <Card className="border border-gray-200 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-500 p-2 rounded-lg mr-3">
                          <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Market Overview</h3>
                      </div>
                      <Button
                        onClick={initializeData}
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>

                    {marketData ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">24h Volume</h4>
                          <p className="text-2xl font-bold text-gray-900">
                            ${(marketData.totalVolume24h / 1000000).toFixed(1)}M
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">24h Trades</h4>
                          <p className="text-2xl font-bold text-gray-900">
                            {marketData.totalTrades24h.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Top Tokens</h4>
                          <p className="text-2xl font-bold text-gray-900">
                            {marketData.topTokens.length}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">Loading market data...</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Top Tokens */}
              <div className="lg:col-span-1">
                <Card className="border border-gray-200 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-6">
                      <div className="bg-green-500 p-2 rounded-lg mr-3">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Top Tokens</h3>
                    </div>

                    <div className="space-y-4">
                      {marketData?.topTokens.map((token: TokenPrice, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{token.symbol}</p>
                              <p className="text-sm text-gray-600">${token.price.toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-medium ${
                                token.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                              </p>
                              <p className="text-xs text-gray-600">
                                Vol: ${(token.volume24h / 1000000).toFixed(1)}M
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="grid grid-cols-1 gap-8">
              <Card className="border border-gray-200 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-orange-500 p-2 rounded-lg mr-3">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Limit Orders</h3>
                    </div>
                    <Button
                      onClick={loadLimitOrders}
                      className="bg-gray-900 hover:bg-gray-800 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : 'Load Orders'}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {limitOrders.length > 0 ? (
                      limitOrders.map((order, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Order #{index + 1}</p>
                              <p className="text-sm text-gray-600">
                                Maker: {order.makerAsset} → Taker: {order.takerAsset}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {order.makerAmount} → {order.takerAmount}
                              </p>
                              <p className="text-xs text-gray-600">
                                Maker: {order.maker.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">No limit orders found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 