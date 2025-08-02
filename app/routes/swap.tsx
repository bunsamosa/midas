import { Navbar } from "components/Navbar";
import { Card, CardContent } from "components/ui/card";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { useState, useEffect } from "react";
import { 
  ArrowUpDown, Clock, Lock, AlertCircle, CheckCircle, TrendingUp, 
  DollarSign, Coins, Zap, Shield, Timer, Activity, BarChart3,
  Wallet, RefreshCw, ExternalLink, ChevronDown, ChevronUp, Settings,
  Sparkles, Bot, Star
} from "lucide-react";

export default function Swap() {
  // Main swap mode selection
  const [swapMode, setSwapMode] = useState<'basic' | 'advanced'>('basic');
  const [activeTab, setActiveTab] = useState<'swap' | 'portfolio' | 'market' | 'orders'>('swap');
  const [advancedSwapMode, setAdvancedSwapMode] = useState<'classic' | 'cross-chain' | 'fusion'>('classic');
  const [isLoading, setIsLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [apiHealth, setApiHealth] = useState<boolean | null>(null);
  
  // Basic swap state (original functionality)
  const [swapStatuses, setSwapStatuses] = useState<any[]>([]);
  const [orderStatuses, setOrderStatuses] = useState<any[]>([]);
  const [showSwapForm, setShowSwapForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [swapForm, setSwapForm] = useState({
    fromChain: 'ethereum',
    toChain: 'polygon',
    fromToken: 'ETH',
    toToken: 'MATIC',
    fromAmount: '',
    toAmount: '',
    timelockDuration: '3600',
    slippage: '1'
  });
  const [orderForm, setOrderForm] = useState({
    fromChain: 'ethereum',
    toChain: 'polygon',
    fromToken: 'ETH',
    toToken: 'MATIC',
    fromAmount: '',
    toAmount: '',
    duration: '86400',
    partialFills: true
  });

  // Advanced swap state (1inch functionality)
  const [advancedSwapForm, setAdvancedSwapForm] = useState({
    fromChainId: 1,
    toChainId: 137,
    fromTokenAddress: '',
    toTokenAddress: '',
    fromAmount: '',
    toAmount: '',
    slippage: 1,
    fromAddress: ''
  });
  
  // Data state
  const [supportedTokens, setSupportedTokens] = useState<any[]>([]);
  const [supportedChains, setSupportedChains] = useState<any[]>([]);
  const [currentQuote, setCurrentQuote] = useState<any>(null);
  const [gasPrice, setGasPrice] = useState<any>(null);
  const [marketData, setMarketData] = useState<any>(null);
  const [walletPortfolio, setWalletPortfolio] = useState<any>(null);
  const [limitOrders, setLimitOrders] = useState<any[]>([]);

  // Load basic swap history
  useEffect(() => {
    const savedSwaps = localStorage.getItem('swapStatuses');
    const savedOrders = localStorage.getItem('orderStatuses');
    
    if (savedSwaps) {
      setSwapStatuses(JSON.parse(savedSwaps));
    }
    if (savedOrders) {
      setOrderStatuses(JSON.parse(savedOrders));
    }
  }, []);

  // Check API availability for advanced features
  useEffect(() => {
    const apiKey = process.env.REACT_APP_1INCH_API_KEY;
    setApiAvailable(!!apiKey);
    
    if (apiKey) {
      initializeAdvancedData();
    }
  }, []);

  const initializeAdvancedData = async () => {
    setIsLoading(true);
    try {
      // Mock data for demonstration
      setSupportedChains([
        { chainId: 1, name: 'Ethereum' },
        { chainId: 137, name: 'Polygon' },
        { chainId: 42161, name: 'Arbitrum' },
        { chainId: 10, name: 'Optimism' }
      ]);
      
      setSupportedTokens([
        { symbol: 'ETH', name: 'Ethereum', address: '0x...', decimals: 18 },
        { symbol: 'USDC', name: 'USD Coin', address: '0x...', decimals: 6 },
        { symbol: 'USDT', name: 'Tether', address: '0x...', decimals: 6 },
        { symbol: 'MATIC', name: 'Polygon', address: '0x...', decimals: 18 }
      ]);
      
      setGasPrice({
        fast: 25,
        standard: 20,
        slow: 15
      });
      
      setMarketData({
        totalVolume24h: 1500000000,
        totalTrades24h: 125000,
        topTokens: [
          { symbol: 'ETH', price: 2500, change24h: 2.5, volume24h: 500000000 },
          { symbol: 'USDC', price: 1, change24h: 0, volume24h: 300000000 },
          { symbol: 'USDT', price: 1, change24h: -0.1, volume24h: 250000000 },
        ]
      });

      setApiHealth(true);
    } catch (error) {
      console.error('Error initializing advanced data:', error);
      setApiHealth(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Basic swap functions
  const handleCreateSwap = () => {
    const newSwap = {
      id: Date.now().toString(),
      fromChain: swapForm.fromChain,
      toChain: swapForm.toChain,
      fromToken: swapForm.fromToken,
      toToken: swapForm.toToken,
      fromAmount: swapForm.fromAmount,
      toAmount: swapForm.toAmount,
      status: 'pending',
      hashlock: '0x' + Math.random().toString(16).substr(2, 64),
      createdAt: new Date().toISOString()
    };

    const updatedSwaps = [newSwap, ...swapStatuses];
    setSwapStatuses(updatedSwaps);
    localStorage.setItem('swapStatuses', JSON.stringify(updatedSwaps));
    setShowSwapForm(false);
    setSwapForm({
      fromChain: 'ethereum',
      toChain: 'polygon',
      fromToken: 'ETH',
      toToken: 'MATIC',
      fromAmount: '',
      toAmount: '',
      timelockDuration: '3600',
      slippage: '1'
    });
  };

  const handleCreateOrder = () => {
    const newOrder = {
      id: Date.now().toString(),
      fromChain: orderForm.fromChain,
      toChain: orderForm.toChain,
      fromToken: orderForm.fromToken,
      toToken: orderForm.toToken,
      fromAmount: orderForm.fromAmount,
      toAmount: orderForm.toAmount,
      status: 'active',
      fillPercentage: 0,
      createdAt: new Date().toISOString()
    };

    const updatedOrders = [newOrder, ...orderStatuses];
    setOrderStatuses(updatedOrders);
    localStorage.setItem('orderStatuses', JSON.stringify(updatedOrders));
    setShowOrderForm(false);
    setOrderForm({
      fromChain: 'ethereum',
      toChain: 'polygon',
      fromToken: 'ETH',
      toToken: 'MATIC',
      fromAmount: '',
      toAmount: '',
      duration: '86400',
      partialFills: true
    });
  };

  // Advanced swap functions
  const getAdvancedQuote = async () => {
    if (!advancedSwapForm.fromTokenAddress || !advancedSwapForm.toTokenAddress || !advancedSwapForm.fromAmount) {
      return;
    }

    setIsLoading(true);
    try {
      // Mock quote
      setCurrentQuote({
        fromToken: { symbol: 'ETH', decimals: 18 },
        toToken: { symbol: 'USDC', decimals: 6 },
        fromTokenAmount: advancedSwapForm.fromAmount,
        toTokenAmount: (parseFloat(advancedSwapForm.fromAmount) * 2500).toString(),
        estimatedGas: 150000
      });
    } catch (error) {
      console.error('Error getting quote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const executeAdvancedSwap = async () => {
    if (!currentQuote || !advancedSwapForm.fromAddress) {
      return;
    }

    setIsLoading(true);
    try {
      alert('Advanced swap executed successfully! (Demo mode)');
      setCurrentQuote(null);
    } catch (error) {
      console.error('Error executing swap:', error);
      alert('Error executing swap');
    } finally {
      setIsLoading(false);
    }
  };

  // Utility functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'filled': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'filled': return 'Filled';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const getChainIcon = (chain: string) => {
    switch (chain) {
      case 'ethereum': return '🔵';
      case 'polygon': return '🟣';
      case 'arbitrum': return '🔵';
      case 'optimism': return '🔴';
      default: return '⚪';
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
              Midas Swap Hub
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Your gateway to cross-chain DeFi. From secure hashlock swaps to advanced 1inch-powered trading, 
              Midas provides the tools you need to navigate the multi-chain ecosystem with confidence.
            </p>
            
            {/* Ecosystem Integration */}
            <div className="mt-6 flex justify-center space-x-4">
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-blue-700">Net Worth Tracking</span>
              </div>
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700">Spend Power AI</span>
              </div>
              <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-purple-700">Cross-Chain Swaps</span>
              </div>
            </div>
          </div>

          {/* Swap Mode Selection */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setSwapMode('basic')}
                className={`px-8 py-3 rounded-md font-medium transition-colors ${
                  swapMode === 'basic'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Basic Swap</span>
                </div>
              </button>
              <button
                onClick={() => setSwapMode('advanced')}
                className={`px-8 py-3 rounded-md font-medium transition-colors ${
                  swapMode === 'advanced'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>1inch Pro</span>
                  <Star className="h-3 w-3 text-yellow-500" />
                </div>
              </button>
            </div>
          </div>

          {/* API Health Status for Advanced Mode */}
          {swapMode === 'advanced' && (
            <div className="flex justify-center mb-8">
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
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          {swapMode === 'basic' ? (
            // Basic Swap Interface
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Swap Form */}
              <div className="lg:col-span-2">
                <Card className="border border-gray-200 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-6">
                      <div className="bg-purple-500 p-2 rounded-lg mr-3">
                        <Lock className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Hashlock & Timelock Swap</h3>
                    </div>

                    {!showSwapForm ? (
                      <div className="text-center py-8">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Ready to Swap?</h4>
                        <p className="text-gray-600 mb-6">Create a new cross-chain swap with hashlock protection</p>
                        <Button 
                          onClick={() => setShowSwapForm(true)}
                          className="bg-gray-900 hover:bg-gray-800 text-white"
                        >
                          Start New Swap
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">From Chain</label>
                            <select 
                              value={swapForm.fromChain}
                              onChange={(e) => setSwapForm({...swapForm, fromChain: e.target.value})}
                              className="w-full p-2 border border-gray-300 rounded-md"
                            >
                              <option value="ethereum">Ethereum</option>
                              <option value="polygon">Polygon</option>
                              <option value="arbitrum">Arbitrum</option>
                              <option value="optimism">Optimism</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">To Chain</label>
                            <select 
                              value={swapForm.toChain}
                              onChange={(e) => setSwapForm({...swapForm, toChain: e.target.value})}
                              className="w-full p-2 border border-gray-300 rounded-md"
                            >
                              <option value="polygon">Polygon</option>
                              <option value="ethereum">Ethereum</option>
                              <option value="arbitrum">Arbitrum</option>
                              <option value="optimism">Optimism</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">From Token</label>
                            <Input
                              value={swapForm.fromToken}
                              onChange={(e) => setSwapForm({...swapForm, fromToken: e.target.value})}
                              placeholder="ETH"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">To Token</label>
                            <Input
                              value={swapForm.toToken}
                              onChange={(e) => setSwapForm({...swapForm, toToken: e.target.value})}
                              placeholder="MATIC"
                            />
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
                              onChange={(e) => setSwapForm({...swapForm, toAmount: e.target.value})}
                              placeholder="0.0"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Timelock Duration (seconds)</label>
                          <select 
                            value={swapForm.timelockDuration}
                            onChange={(e) => setSwapForm({...swapForm, timelockDuration: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="3600">1 Hour</option>
                            <option value="7200">2 Hours</option>
                            <option value="14400">4 Hours</option>
                            <option value="86400">24 Hours</option>
                          </select>
                        </div>

                        <div className="flex space-x-3">
                          <Button 
                            onClick={handleCreateSwap}
                            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                          >
                            Create Swap
                          </Button>
                          <Button 
                            onClick={() => setShowSwapForm(false)}
                            variant="outline"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Swap History */}
              <div className="lg:col-span-1">
                <Card className="border border-gray-200 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-6">
                      <div className="bg-blue-500 p-2 rounded-lg mr-3">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Swap History</h3>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {swapStatuses.length > 0 ? (
                        swapStatuses.map((swap) => (
                          <div key={swap.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(swap.status)}
                                <span className="text-sm font-medium text-gray-900">
                                  {getStatusText(swap.status)}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(swap.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">From:</span>
                                <span className="font-medium">{swap.fromAmount} {swap.fromToken} ({swap.fromChain})</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">To:</span>
                                <span className="font-medium">{swap.toAmount} {swap.toToken} ({swap.toChain})</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Hashlock:</span>
                                <span className="font-mono text-xs">{swap.hashlock.slice(0, 8)}...</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-8">No swap history</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            // Advanced Swap Interface (1inch Pro)
            <div>
              {/* Advanced Tab Navigation */}
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

              {activeTab === 'swap' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Advanced Swap Form */}
                  <div className="lg:col-span-2">
                    <Card className="border border-gray-200 bg-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg mr-3">
                              <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">1inch Pro Swap</h3>
                          </div>
                          <Button
                            onClick={initializeAdvancedData}
                            variant="outline"
                            size="sm"
                            disabled={isLoading}
                          >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                          </Button>
                        </div>

                        {/* Advanced Swap Mode Selection */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Swap Mode</label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => setAdvancedSwapMode('classic')}
                              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                                advancedSwapMode === 'classic'
                                  ? 'bg-gray-900 text-white border-gray-900'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              <Zap className="h-4 w-4 mx-auto mb-1" />
                              Classic
                            </button>
                            <button
                              onClick={() => setAdvancedSwapMode('cross-chain')}
                              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                                advancedSwapMode === 'cross-chain'
                                  ? 'bg-gray-900 text-white border-gray-900'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              <Shield className="h-4 w-4 mx-auto mb-1" />
                              Cross-Chain
                            </button>
                            <button
                              onClick={() => setAdvancedSwapMode('fusion')}
                              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                                advancedSwapMode === 'fusion'
                                  ? 'bg-gray-900 text-white border-gray-900'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              <TrendingUp className="h-4 w-4 mx-auto mb-1" />
                              Fusion
                            </button>
                          </div>
                        </div>

                        {/* Advanced Swap Form */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">From Chain</label>
                              <select 
                                value={advancedSwapForm.fromChainId}
                                onChange={(e) => setAdvancedSwapForm({...advancedSwapForm, fromChainId: parseInt(e.target.value)})}
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
                                value={advancedSwapForm.toChainId}
                                onChange={(e) => setAdvancedSwapForm({...advancedSwapForm, toChainId: parseInt(e.target.value)})}
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
                                value={advancedSwapForm.fromTokenAddress}
                                onChange={(e) => setAdvancedSwapForm({...advancedSwapForm, fromTokenAddress: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md"
                              >
                                <option value="">Select token</option>
                                {supportedTokens.map(token => (
                                  <option key={token.address} value={token.address}>
                                    {token.symbol} - {token.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">To Token</label>
                              <select 
                                value={advancedSwapForm.toTokenAddress}
                                onChange={(e) => setAdvancedSwapForm({...advancedSwapForm, toTokenAddress: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md"
                              >
                                <option value="">Select token</option>
                                {supportedTokens.map(token => (
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
                                value={advancedSwapForm.fromAmount}
                                onChange={(e) => setAdvancedSwapForm({...advancedSwapForm, fromAmount: e.target.value})}
                                placeholder="0.0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">To Amount</label>
                              <Input
                                type="number"
                                value={advancedSwapForm.toAmount}
                                placeholder="0.0"
                                disabled
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
                              <Input
                                value={advancedSwapForm.fromAddress}
                                onChange={(e) => setAdvancedSwapForm({...advancedSwapForm, fromAddress: e.target.value})}
                                placeholder="0x..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Slippage (%)</label>
                              <Input
                                type="number"
                                value={advancedSwapForm.slippage}
                                onChange={(e) => setAdvancedSwapForm({...advancedSwapForm, slippage: parseFloat(e.target.value)})}
                                placeholder="1.0"
                              />
                            </div>
                          </div>

                          <div className="flex space-x-3">
                            <Button 
                              onClick={getAdvancedQuote}
                              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                              disabled={isLoading}
                            >
                              {isLoading ? 'Getting Quote...' : 'Get Quote'}
                            </Button>
                            <Button 
                              onClick={executeAdvancedSwap}
                              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
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
                                    {currentQuote.fromTokenAmount} {currentQuote.fromToken.symbol}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">To:</span>
                                  <span className="font-medium">
                                    {currentQuote.toTokenAmount} {currentQuote.toToken.symbol}
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

              {/* Additional tabs for advanced features */}
              {activeTab === 'portfolio' && (
                <div className="text-center py-12">
                  <div className="bg-gray-50 rounded-lg p-8">
                    <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Portfolio Management</h3>
                    <p className="text-gray-600">Advanced portfolio tracking and multi-chain balance management coming soon.</p>
                  </div>
                </div>
              )}

              {activeTab === 'market' && (
                <div className="text-center py-12">
                  <div className="bg-gray-50 rounded-lg p-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Analytics</h3>
                    <p className="text-gray-600">Real-time market data and analytics coming soon.</p>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="text-center py-12">
                  <div className="bg-gray-50 rounded-lg p-8">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Limit Orders</h3>
                    <p className="text-gray-600">Advanced limit order management coming soon.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 