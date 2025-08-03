import { Navbar } from "components/Navbar";
import { Card, CardContent } from "components/ui/card";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { useState, useEffect } from "react";
import { 
  ArrowUpDown, Clock, Lock, AlertCircle, CheckCircle, TrendingUp, 
  DollarSign, Coins, Zap, Shield, Timer, Activity, BarChart3,
  Wallet, RefreshCw, ExternalLink, ChevronDown, ChevronUp, Settings,
  Sparkles, Bot, Star, Network, Globe, Cpu, ShieldCheck, MessageSquare
} from "lucide-react";
import { getSwapService } from "../utils/swapService";

export default function Swap() {
  const swapService = getSwapService();
  // Main swap mode selection
  const [swapMode, setSwapMode] = useState<'basic' | 'advanced' | 'etherlink' | 'stellar' | 'near-solver'>('basic');
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
  
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 12450.67,
    change24h: 2.3,
    change7d: 8.7,
    assets: [
      { symbol: 'ETH', name: 'Ethereum', amount: 2.5, value: 5000, change24h: 3.2, chain: 'Ethereum' },
      { symbol: 'USDC', name: 'USD Coin', amount: 3000, value: 3000, change24h: 0.1, chain: 'Ethereum' },
      { symbol: 'MATIC', name: 'Polygon', amount: 5000, value: 2450.67, change24h: 1.8, chain: 'Polygon' },
      { symbol: 'BTC', name: 'Bitcoin', amount: 0.05, value: 2000, change24h: 2.1, chain: 'Ethereum' }
    ],
    chains: [
      { name: 'Ethereum', value: 8000, percentage: 64.3 },
      { name: 'Polygon', value: 2450.67, percentage: 19.7 },
      { name: 'Arbitrum', value: 2000, percentage: 16.0 }
    ]
  });

  // Dummy data for market analytics
  const [marketAnalytics, setMarketAnalytics] = useState({
    topGainers: [
      { symbol: 'ETH', name: 'Ethereum', price: 2000, change24h: 3.2, volume: 1500000000 },
      { symbol: 'MATIC', name: 'Polygon', price: 0.49, change24h: 1.8, volume: 450000000 },
      { symbol: 'UNI', name: 'Uniswap', price: 12.5, change24h: 1.5, volume: 320000000 }
    ],
    topLosers: [
      { symbol: 'LINK', name: 'Chainlink', price: 18.2, change24h: -2.1, volume: 280000000 },
      { symbol: 'AAVE', name: 'Aave', price: 95.5, change24h: -1.8, volume: 180000000 },
      { symbol: 'COMP', name: 'Compound', price: 45.2, change24h: -1.2, volume: 120000000 }
    ],
    trendingPairs: [
      { pair: 'ETH/USDC', volume24h: 2500000000, change24h: 15.3, liquidity: 50000000 },
      { pair: 'MATIC/USDT', volume24h: 850000000, change24h: 8.7, liquidity: 25000000 },
      { pair: 'UNI/ETH', volume24h: 320000000, change24h: 12.1, liquidity: 18000000 }
    ],
    marketOverview: {
      totalVolume24h: 85000000000,
      totalTvl: 45000000000,
      activeUsers: 1250000,
      totalTransactions: 8500000
    }
  });

  // Dummy data for limit orders
  const [limitOrdersData, setLimitOrdersData] = useState([
    {
      id: '1',
      pair: 'ETH/USDC',
      type: 'buy',
      amount: 0.5,
      price: 1950,
      filled: 0.3,
      status: 'active',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: '2',
      pair: 'MATIC/USDT',
      type: 'sell',
      amount: 1000,
      price: 0.52,
      filled: 0,
      status: 'active',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      expiresAt: new Date(Date.now() + 172800000).toISOString()
    },
    {
      id: '3',
      pair: 'USDC/ETH',
      type: 'buy',
      amount: 2000,
      price: 2050,
      filled: 2000,
      status: 'filled',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      expiresAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '4',
      pair: 'BTC/USDC',
      type: 'sell',
      amount: 0.02,
      price: 42000,
      filled: 0,
      status: 'cancelled',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      expiresAt: new Date(Date.now() - 86400000).toISOString()
    }
  ]);

  // AI Chat and Recommendations
  const [aiRecommendations, setAiRecommendations] = useState([
    {
      id: 1,
      type: 'swap-opportunity',
      message: "🔄 ETH → USDC: Current spread is only 0.1%! Perfect time to take profits. Use 1inch Advanced for best rates across DEXs.",
      confidence: 94,
      action: 'Swap ETH to USDC',
      swapDetails: {
        from: 'ETH',
        to: 'USDC',
        amount: '0.5',
        expectedRate: '2000',
        savings: '$15',
        recommendedMode: 'advanced'
      },
      timestamp: new Date(Date.now() - 300000).toISOString()
    },
    {
      id: 2,
      type: 'portfolio-rebalance',
      message: "⚖️ Your ETH concentration is high (64%). Swap 0.3 ETH → MATIC for better diversification. MATIC showing strong L2 growth.",
      confidence: 89,
      action: 'Rebalance Portfolio',
      swapDetails: {
        from: 'ETH',
        to: 'MATIC',
        amount: '0.3',
        expectedRate: '0.49',
        savings: '$8',
        recommendedMode: 'cross-chain'
      },
      timestamp: new Date(Date.now() - 600000).toISOString()
    },
    {
      id: 3,
      type: 'defi-opportunity',
      message: "📈 DeFi season incoming! Swap 500 USDC → UNI. Uniswap governance tokens showing accumulation patterns.",
      confidence: 82,
      action: 'Enter DeFi Position',
      swapDetails: {
        from: 'USDC',
        to: 'UNI',
        amount: '500',
        expectedRate: '12.5',
        savings: '$12',
        recommendedMode: 'advanced'
      },
      timestamp: new Date(Date.now() - 900000).toISOString()
    },
    {
      id: 4,
      type: 'risk-management',
      message: "🛡️ Market volatility detected. Use Limit Orders instead of market swaps. Set ETH buy limit at $1950 for better entry.",
      confidence: 91,
      action: 'Use Limit Orders',
      swapDetails: {
        from: 'USDC',
        to: 'ETH',
        amount: '1000',
        limitPrice: '1950',
        savings: '$25',
        recommendedMode: 'basic'
      },
      timestamp: new Date(Date.now() - 1200000).toISOString()
    },
    {
      id: 5,
      type: 'cross-chain-opportunity',
      message: "🌉 Cross-chain arbitrage opportunity! ETH on Ethereum vs Polygon has 0.8% spread. Use Etherlink Fusion for seamless bridging.",
      confidence: 87,
      action: 'Cross-chain Arbitrage',
      swapDetails: {
        from: 'ETH (Ethereum)',
        to: 'ETH (Polygon)',
        amount: '1.0',
        expectedRate: '1.008',
        savings: '$16',
        recommendedMode: 'etherlink'
      },
      timestamp: new Date(Date.now() - 1500000).toISOString()
    },
    {
      id: 6,
      type: 'stellar-opportunity',
      message: "⭐ Stellar's low fees make it perfect for small trades. Swap 100 USDC → XLM for micro-transactions. 0.00001 XLM fees!",
      confidence: 85,
      action: 'Micro-trade on Stellar',
      swapDetails: {
        from: 'USDC',
        to: 'XLM',
        amount: '100',
        expectedRate: '0.12',
        savings: '$0.50',
        recommendedMode: 'stellar'
      },
      timestamp: new Date(Date.now() - 1800000).toISOString()
    }
  ]);

  const [currentRecommendation, setCurrentRecommendation] = useState(0);

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

  // Rotate AI recommendations every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRecommendation((prev) => (prev + 1) % aiRecommendations.length);
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [aiRecommendations.length]);

  // Check API availability for advanced features
  useEffect(() => {
    const apiKey = process.env.REACT_APP_1INCH_API_KEY;
    setApiAvailable(!!apiKey);
    
    // Initialize with mock data for demonstration
    if (!apiKey) {
      setSupportedChains([
        { chainId: 1, name: 'Ethereum', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 } },
        { chainId: 137, name: 'Polygon', nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 } },
        { chainId: 42161, name: 'Arbitrum', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 } },
        { chainId: 10, name: 'Optimism', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 } },
        { chainId: 56, name: 'BSC', nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 } },
        { chainId: 43114, name: 'Avalanche', nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 } }
      ]);
      
      setSupportedTokens([
        { address: '0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8', symbol: 'ETH', name: 'Ethereum', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
        { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', name: 'Uniswap', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png' },
        { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png' },
        { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
        { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', name: 'Dai', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/9956/small/4943.png' },
        { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, logoURI: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png' }
      ]);
      
      setMarketData({
        totalVolume24h: 2500000000000,
        totalTvl: 4500000000000,
        activeProtocols: 150,
        topTokens: [
          { address: '0x1', symbol: 'ETH', name: 'Ethereum', price: 3200, change24h: 2.5, marketCap: 380000000000000 },
          { address: '0x2', symbol: 'USDC', name: 'USD Coin', price: 1.00, change24h: 0.1, marketCap: 25000000000000 },
          { address: '0x3', symbol: 'USDT', name: 'Tether', price: 1.00, change24h: -0.2, marketCap: 95000000000000 },
          { address: '0x4', symbol: 'DAI', name: 'Dai', price: 1.00, change24h: 0.05, marketCap: 5000000000000 },
          { address: '0x5', symbol: 'WBTC', name: 'Wrapped Bitcoin', price: 65000, change24h: 1.8, marketCap: 10000000000000 }
        ]
      });
      
      setGasPrice({
        fast: 45,
        standard: 30,
        slow: 20
      });
    }
  }, []);

  // Load data when switching to advanced mode
  useEffect(() => {
    if (swapMode === 'advanced' && apiAvailable) {
      initializeAdvancedData();
    }
  }, [swapMode, apiAvailable]);

  // Initialize advanced data with real 1inch APIs
  const initializeAdvancedData = async () => {
    if (!swapService) return;
    
    try {
      setIsLoading(true);
      
      // Get supported chains and tokens
      const chains = await swapService.getSupportedChains();
      const tokens = await swapService.getSupportedTokens(1); // Ethereum mainnet
      
      setSupportedChains(chains);
      setSupportedTokens(tokens);
      
      // Get market data
      const marketData = await swapService.getMarketOverview(1);
      if (marketData) {
        setMarketData(marketData);
      }
      
      // Get gas price
      const gasPrice = await swapService.getGasPrice(1);
      if (gasPrice) {
        setGasPrice(gasPrice);
      }
      
      // Check API health
      const health = await swapService.checkAPIHealth();
      if (health) {
        setApiHealth(health.status === 'ok');
      }
      
    } catch (error) {
      console.error('Error initializing advanced data:', error);
      setApiHealth(false);
      
      // Fallback to comprehensive mock data for demonstration
      setSupportedChains([
        { chainId: 1, name: 'Ethereum', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 } },
        { chainId: 137, name: 'Polygon', nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 } },
        { chainId: 42161, name: 'Arbitrum', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 } },
        { chainId: 10, name: 'Optimism', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 } },
        { chainId: 56, name: 'BSC', nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 } },
        { chainId: 43114, name: 'Avalanche', nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 } },
        { chainId: 250, name: 'Fantom', nativeCurrency: { name: 'FTM', symbol: 'FTM', decimals: 18 } },
        { chainId: 1101, name: 'Polygon zkEVM', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 } }
      ]);
      
      setSupportedTokens([
        { address: '0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8', symbol: 'ETH', name: 'Ethereum', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
        { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', name: 'Uniswap', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png' },
        { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png' },
        { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
        { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', name: 'Dai', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/9956/small/4943.png' },
        { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, logoURI: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png' },
        { address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', symbol: 'AAVE', name: 'Aave', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/12645/small/AAVE.png' },
        { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', symbol: 'LINK', name: 'Chainlink', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/877/small/chainlink.png' }
      ]);
      
      setMarketData({
        totalVolume24h: 2500000000000, // $2.5B
        totalTvl: 4500000000000, // $4.5B
        activeProtocols: 150,
        topTokens: [
          { address: '0x1', symbol: 'ETH', name: 'Ethereum', price: 3200, change24h: 2.5, marketCap: 380000000000000 },
          { address: '0x2', symbol: 'USDC', name: 'USD Coin', price: 1.00, change24h: 0.1, marketCap: 25000000000000 },
          { address: '0x3', symbol: 'USDT', name: 'Tether', price: 1.00, change24h: -0.2, marketCap: 95000000000000 },
          { address: '0x4', symbol: 'DAI', name: 'Dai', price: 1.00, change24h: 0.05, marketCap: 5000000000000 },
          { address: '0x5', symbol: 'WBTC', name: 'Wrapped Bitcoin', price: 65000, change24h: 1.8, marketCap: 10000000000000 },
          { address: '0x6', symbol: 'UNI', name: 'Uniswap', price: 12.50, change24h: 3.2, marketCap: 7500000000000 },
          { address: '0x7', symbol: 'AAVE', name: 'Aave', price: 85.30, change24h: -1.5, marketCap: 1200000000000 },
          { address: '0x8', symbol: 'LINK', name: 'Chainlink', price: 15.75, change24h: 4.1, marketCap: 8500000000000 },
          { address: '0x9', symbol: 'MATIC', name: 'Polygon', price: 0.85, change24h: 6.8, marketCap: 8000000000000 },
          { address: '0x10', symbol: 'AVAX', name: 'Avalanche', price: 28.40, change24h: -2.1, marketCap: 10000000000000 }
        ]
      });
      
      setGasPrice({
        fast: 45,
        standard: 30,
        slow: 20
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  // Get real quote from 1inch API
  const getAdvancedQuote = async () => {
    if (!swapService || !advancedSwapForm.fromTokenAddress || !advancedSwapForm.toTokenAddress || !advancedSwapForm.fromAmount) return;
    
    try {
      setIsLoading(true);
      
      const quote = await swapService.getSwapQuote({
        fromToken: advancedSwapForm.fromTokenAddress,
        toToken: advancedSwapForm.toTokenAddress,
        fromChain: 1, // Ethereum mainnet
        toChain: 1,
        amount: advancedSwapForm.fromAmount,
        fromAddress: '0x0000000000000000000000000000000000000000', // Placeholder
        slippage: advancedSwapForm.slippage || 1
      });
      
      if (quote) {
        setCurrentQuote(quote);
      }
      
    } catch (error) {
      console.error('Error getting quote:', error);
      
      // Fallback to mock quote for demonstration
      if (advancedSwapForm.fromTokenAddress && advancedSwapForm.toTokenAddress && advancedSwapForm.fromAmount) {
        const mockQuote = {
          fromToken: advancedSwapForm.fromTokenAddress,
          toToken: advancedSwapForm.toTokenAddress,
          fromTokenAmount: advancedSwapForm.fromAmount,
          toTokenAmount: (parseFloat(advancedSwapForm.fromAmount) * 0.95).toString(), // Mock conversion
          estimatedGas: '150000',
          gasCost: '0.0045',
          priceImpact: 0.5,
          blockNumber: 18500000,
          protocols: [
            { name: 'Uniswap V3', part: 100, fromTokenAddress: advancedSwapForm.fromTokenAddress, toTokenAddress: advancedSwapForm.toTokenAddress }
          ]
        };
        setCurrentQuote(mockQuote);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Execute real swap with 1inch API
  const executeAdvancedSwap = async () => {
    if (!swapService || !currentQuote) return;
    
    try {
      setIsLoading(true);
      
      const result = await swapService.executeSwap({
        fromToken: advancedSwapForm.fromTokenAddress,
        toToken: advancedSwapForm.toTokenAddress,
        fromChain: 1,
        toChain: 1,
        amount: advancedSwapForm.fromAmount,
        fromAddress: '0x0000000000000000000000000000000000000000', // Placeholder
        slippage: advancedSwapForm.slippage || 1
      });
      
      if (result.success) {
        alert('Swap executed successfully!');
        // Reset form
        setAdvancedSwapForm({
          fromChainId: 1,
          toChainId: 137,
          fromTokenAddress: '',
          toTokenAddress: '',
          fromAmount: '',
          toAmount: '',
          slippage: 1,
          fromAddress: ''
        });
        setCurrentQuote(null);
      } else {
        alert(`Swap failed: ${result.error}`);
      }
      
    } catch (error) {
      console.error('Error executing swap:', error);
      alert('Failed to execute swap');
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

          {/* Portfolio Integration Summary */}
          <div className="mb-8">
            <Card className="border border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">$12,450</div>
                    <div className="text-sm text-gray-600">Total Net Worth</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">+$890</div>
                    <div className="text-sm text-gray-600">DeFi Potential</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">12.3%</div>
                    <div className="text-sm text-gray-600">Portfolio Growth</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">Medium</div>
                    <div className="text-sm text-gray-600">Risk Profile</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Investment Assistant */}
          <div className="mb-8">
            <Card className="border border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">AI Investment Assistant</h3>
                      <p className="text-sm text-gray-600">Real-time portfolio analysis and recommendations</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Live</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">Midas AI</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {new Date(aiRecommendations[currentRecommendation].timestamp).toLocaleTimeString()}
                          </span>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">Confidence:</span>
                            <span className="text-xs font-medium text-green-600">
                              {aiRecommendations[currentRecommendation].confidence}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        {aiRecommendations[currentRecommendation].message}
                      </p>
                      
                      {/* Swap Details */}
                      {aiRecommendations[currentRecommendation].swapDetails && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-gray-500">Swap:</span>
                              <div className="font-medium text-gray-900">
                                {aiRecommendations[currentRecommendation].swapDetails.from} → {aiRecommendations[currentRecommendation].swapDetails.to}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Amount:</span>
                              <div className="font-medium text-gray-900">
                                {aiRecommendations[currentRecommendation].swapDetails.amount}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Rate:</span>
                              <div className="font-medium text-gray-900">
                                ${aiRecommendations[currentRecommendation].swapDetails.expectedRate}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Savings:</span>
                              <div className="font-medium text-green-600">
                                {aiRecommendations[currentRecommendation].swapDetails.savings}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <span className="text-gray-500 text-xs">Recommended Mode: </span>
                            <span className="text-xs font-medium text-blue-600 capitalize">
                              {aiRecommendations[currentRecommendation].swapDetails.recommendedMode}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Recommendation {currentRecommendation + 1} of {aiRecommendations.length}
                        </span>
                        <div className="flex items-center space-x-2">
                          {aiRecommendations[currentRecommendation].swapDetails && (
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => {
                                const rec = aiRecommendations[currentRecommendation];
                                setSwapMode(rec.swapDetails.recommendedMode);
                                // Pre-fill swap form with AI recommendation
                                if (rec.swapDetails.recommendedMode === 'advanced') {
                                  setAdvancedSwapForm({
                                    ...advancedSwapForm,
                                    fromTokenAddress: rec.swapDetails.from,
                                    toTokenAddress: rec.swapDetails.to,
                                    fromAmount: rec.swapDetails.amount
                                  });
                                }
                              }}
                            >
                              Execute Swap
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => setCurrentRecommendation((prev) => (prev + 1) % aiRecommendations.length)}
                          >
                            Next Tip
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Swap Mode Selection */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setSwapMode('basic')}
                className={`px-8 py-3 rounded-md font-medium transition-colors ${
                  swapMode === 'basic'
                    ? 'bg-gray-100 text-gray-900'
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
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>1inch Advanced</span>
                  <Star className="h-3 w-3 text-yellow-500" />
                </div>
              </button>
              <button
                onClick={() => setSwapMode('etherlink')}
                className={`px-8 py-3 rounded-md font-medium transition-colors ${
                  swapMode === 'etherlink'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Network className="h-4 w-4" />
                  <span>Etherlink Fusion</span>
                </div>
              </button>
              <button
                onClick={() => setSwapMode('stellar')}
                className={`px-8 py-3 rounded-md font-medium transition-colors ${
                  swapMode === 'stellar'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>Stellar + 1inch</span>
                </div>
              </button>
              <button
                onClick={() => setSwapMode('near-solver')}
                className={`px-8 py-3 rounded-md font-medium transition-colors ${
                  swapMode === 'near-solver'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Cpu className="h-4 w-4" />
                  <span>NEAR Solver</span>
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
                apiHealth === true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  !apiAvailable ? 'bg-red-500' :
                  apiHealth === null ? 'bg-gray-400' :
                  apiHealth === true ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                {!apiAvailable ? '1inch API Key Required' :
                 apiHealth === null ? 'Checking API...' :
                 apiHealth === true ? '1inch API Connected' : 'API Connection Failed'}
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

              {/* 1inch Pro Advanced Features */}
              {swapMode === 'advanced' && (
                <div className="space-y-8">
                  {/* API Status & Market Overview */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* API Health Status */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">API Status</h3>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          !apiAvailable ? 'bg-red-100 text-red-800' :
                          apiHealth === null ? 'bg-gray-100 text-gray-800' :
                          apiHealth ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 inline-block ${
                            !apiAvailable ? 'bg-red-500' :
                            apiHealth === null ? 'bg-gray-400' :
                            apiHealth ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          {!apiAvailable ? '1inch API Key Required' :
                           apiHealth === null ? 'Checking API...' :
                           apiHealth ? '1inch API Connected' : 'API Connection Failed'}
                        </div>
                      </div>
                      
                      {/* API Statistics */}
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Supported Chains:</span>
                          <span className="font-medium">{supportedChains.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Available Tokens:</span>
                          <span className="font-medium">{supportedTokens.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated:</span>
                          <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Market Overview */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Overview</h3>
                      {marketData ? (
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">24h Volume:</span>
                            <span className="font-medium">${(marketData.totalVolume24h / 1e9).toFixed(2)}B</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total TVL:</span>
                            <span className="font-medium">${(marketData.totalTvl / 1e9).toFixed(2)}B</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Active Protocols:</span>
                            <span className="font-medium">{marketData.activeProtocols}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500">Loading market data...</div>
                      )}
                    </div>

                    {/* Gas Prices */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Gas Prices (Gwei)</h3>
                      {gasPrice ? (
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fast:</span>
                            <span className="font-medium text-green-600">{gasPrice.fast}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Standard:</span>
                            <span className="font-medium text-blue-600">{gasPrice.standard}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Slow:</span>
                            <span className="font-medium text-gray-600">{gasPrice.slow}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500">Loading gas prices...</div>
                      )}
                    </div>
                  </div>

                  {/* Advanced Swap Interface */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">Advanced Swap</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setAdvancedSwapMode('classic')}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            advancedSwapMode === 'classic'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Classic
                        </button>
                        <button
                          onClick={() => setAdvancedSwapMode('cross-chain')}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            advancedSwapMode === 'cross-chain'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Cross-Chain
                        </button>
                        <button
                          onClick={() => setAdvancedSwapMode('fusion')}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            advancedSwapMode === 'fusion'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Fusion+
                        </button>
                      </div>
                    </div>

                    {/* Swap Form */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            From Token
                          </label>
                          <select
                            value={advancedSwapForm.fromTokenAddress}
                            onChange={(e) => setAdvancedSwapForm({
                              ...advancedSwapForm,
                              fromTokenAddress: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select token</option>
                            {supportedTokens.slice(0, 10).map((token: any) => (
                              <option key={token.address} value={token.address}>
                                {token.symbol} - {token.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount
                          </label>
                          <input
                            type="number"
                            value={advancedSwapForm.fromAmount}
                            onChange={(e) => setAdvancedSwapForm({
                              ...advancedSwapForm,
                              fromAmount: e.target.value
                            })}
                            placeholder="0.0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Slippage (%)
                          </label>
                          <input
                            type="number"
                            value={advancedSwapForm.slippage}
                            onChange={(e) => setAdvancedSwapForm({
                              ...advancedSwapForm,
                              slippage: parseFloat(e.target.value) || 1
                            })}
                            placeholder="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            To Token
                          </label>
                          <select
                            value={advancedSwapForm.toTokenAddress}
                            onChange={(e) => setAdvancedSwapForm({
                              ...advancedSwapForm,
                              toTokenAddress: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select token</option>
                            {supportedTokens.slice(0, 10).map((token: any) => (
                              <option key={token.address} value={token.address}>
                                {token.symbol} - {token.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expected Amount
                          </label>
                          <input
                            type="text"
                            value={currentQuote ? currentQuote.toTokenAmount : ''}
                            placeholder="0.0"
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                          />
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={getAdvancedQuote}
                            disabled={!advancedSwapForm.fromTokenAddress || !advancedSwapForm.toTokenAddress || !advancedSwapForm.fromAmount}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            Get Quote
                          </button>
                          <button
                            onClick={executeAdvancedSwap}
                            disabled={!currentQuote}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            Execute Swap
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quote Details */}
                    {currentQuote && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Quote Details</h4>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Price Impact:</span>
                            <div className="font-medium">{currentQuote.priceImpact?.toFixed(2)}%</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Estimated Gas:</span>
                            <div className="font-medium">{currentQuote.estimatedGas?.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Gas Cost:</span>
                            <div className="font-medium">${currentQuote.gasCost ? parseFloat(currentQuote.gasCost).toFixed(4) : 'N/A'}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Block Number:</span>
                            <div className="font-medium">{currentQuote.blockNumber}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Top Tokens & Market Data */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Tokens */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Tokens</h3>
                      {marketData?.topTokens ? (
                        <div className="space-y-3">
                          {marketData.topTokens.slice(0, 5).map((token: any, index: number) => (
                            <div key={token.address} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-medium">{token.symbol}</div>
                                  <div className="text-sm text-gray-500">{token.name}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">${token.price?.toFixed(4) || 'N/A'}</div>
                                <div className={`text-sm ${token.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {token.change24h >= 0 ? '+' : ''}{token.change24h?.toFixed(2) || 'N/A'}%
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {[
                            { symbol: 'ETH', name: 'Ethereum', price: 3200, change24h: 2.5 },
                            { symbol: 'USDC', name: 'USD Coin', price: 1.00, change24h: 0.1 },
                            { symbol: 'USDT', name: 'Tether', price: 1.00, change24h: -0.2 },
                            { symbol: 'DAI', name: 'Dai', price: 1.00, change24h: 0.05 },
                            { symbol: 'WBTC', name: 'Wrapped Bitcoin', price: 65000, change24h: 1.8 }
                          ].map((token, index) => (
                            <div key={token.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{token.symbol}</div>
                                  <div className="text-sm text-gray-500">{token.name}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-gray-900">${token.price.toFixed(4)}</div>
                                <div className={`text-sm ${token.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Supported Chains */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Chains</h3>
                      {supportedChains.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {supportedChains.slice(0, 8).map((chain: any) => (
                            <div key={chain.chainId} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium">{chain.name}</span>
                            </div>
                          ))}
                          {supportedChains.length > 8 && (
                            <div className="col-span-2 text-center text-sm text-gray-500">
                              +{supportedChains.length - 8} more chains
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { chainId: 1, name: 'Ethereum' },
                            { chainId: 137, name: 'Polygon' },
                            { chainId: 42161, name: 'Arbitrum' },
                            { chainId: 10, name: 'Optimism' },
                            { chainId: 56, name: 'BSC' },
                            { chainId: 43114, name: 'Avalanche' },
                            { chainId: 250, name: 'Fantom' },
                            { chainId: 1101, name: 'Polygon zkEVM' }
                          ].map((chain) => (
                            <div key={chain.chainId} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium">{chain.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* 1inch Dashboard Mode - Now part of Advanced */}
              {false && (
                <div className="space-y-8">
                  {isLoading && (
                    <div className="flex justify-center py-8">
                      <div className="flex items-center space-x-3 text-gray-600">
                        <RefreshCw className="w-6 h-6 animate-spin" />
                        <span>Loading 1inch data...</span>
                      </div>
                    </div>
                  )}
                                     {/* API Status & Market Overview */}
                   <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                     {/* API Health Status */}
                     <div className="bg-white border border-gray-200 rounded-lg p-6">
                       <div className="flex items-center justify-between mb-4">
                         <h3 className="text-lg font-semibold text-gray-900">API Status</h3>
                         <div className="flex items-center space-x-3">
                           <div className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                             !apiAvailable ? 'bg-blue-50 text-blue-700 border-blue-200' :
                             apiHealth === null ? 'bg-gray-50 text-gray-700 border-gray-200' :
                             apiHealth ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                           }`}>
                             <div className="flex items-center space-x-2">
                               <div className={`w-2 h-2 rounded-full ${
                                 !apiAvailable ? 'bg-green-500' :
                                 apiHealth === null ? 'bg-gray-400' :
                                 apiHealth ? 'bg-green-500' : 'bg-red-500'
                               }`}></div>
                               <span>
                                 {!apiAvailable ? 'good' :
                                  apiHealth === null ? 'Checking API...' :
                                  apiHealth ? '1inch API Connected' : 'API Connection Failed'}
                               </span>
                             </div>
                           </div>
                           <button
                             onClick={initializeAdvancedData}
                             disabled={isLoading}
                             className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                             title="Refresh data"
                           >
                             <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                           </button>
                         </div>
                       </div>
                      
                      {/* API Statistics */}
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Supported Chains:</span>
                          <span className="font-medium">{supportedChains.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Available Tokens:</span>
                          <span className="font-medium">{supportedTokens.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated:</span>
                          <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Market Overview */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Overview</h3>
                      {marketData ? (
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">24h Volume:</span>
                            <span className="font-medium">${(marketData.totalVolume24h / 1e9).toFixed(2)}B</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total TVL:</span>
                            <span className="font-medium">${(marketData.totalTvl / 1e9).toFixed(2)}B</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Active Protocols:</span>
                            <span className="font-medium">{marketData.activeProtocols}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500">Loading market data...</div>
                      )}
                    </div>

                    {/* Gas Prices */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Gas Prices (Gwei)</h3>
                      {gasPrice ? (
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fast:</span>
                            <span className="font-medium text-green-600">{gasPrice.fast}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Standard:</span>
                            <span className="font-medium text-blue-600">{gasPrice.standard}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Slow:</span>
                            <span className="font-medium text-gray-600">{gasPrice.slow}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500">Loading gas prices...</div>
                      )}
                    </div>

                    {/* Top Tokens Summary */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Tokens</h3>
                      {marketData?.topTokens ? (
                        <div className="space-y-2">
                          {marketData.topTokens.slice(0, 3).map((token: any, index: number) => (
                            <div key={token.address} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">
                                  {index + 1}
                                </div>
                                <span className="text-sm font-medium">{token.symbol}</span>
                              </div>
                              <span className="text-sm text-gray-600">${token.price?.toFixed(4) || 'N/A'}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {[
                            { symbol: 'ETH', price: 3200 },
                            { symbol: 'USDC', price: 1.00 },
                            { symbol: 'USDT', price: 1.00 }
                          ].map((token, index) => (
                            <div key={token.symbol} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">
                                  {index + 1}
                                </div>
                                <span className="text-sm font-medium">{token.symbol}</span>
                              </div>
                              <span className="text-sm text-gray-600">${token.price.toFixed(4)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Top Tokens Table */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Tokens by Volume</h3>
                    {marketData?.topTokens ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Token
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                24h Change
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Market Cap
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {marketData.topTokens.slice(0, 10).map((token: any, index: number) => (
                              <tr key={token.address}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                                      {index + 1}
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{token.symbol}</div>
                                      <div className="text-sm text-gray-500">{token.name}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ${token.price?.toFixed(4) || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`text-sm font-medium ${
                                    token.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {token.change24h >= 0 ? '+' : ''}{token.change24h?.toFixed(2) || 'N/A'}%
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ${token.marketCap ? (token.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Token
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                24h Change
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Market Cap
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {[
                              { symbol: 'ETH', name: 'Ethereum', price: 3200, change24h: 2.5, marketCap: 380000000000000 },
                              { symbol: 'USDC', name: 'USD Coin', price: 1.00, change24h: 0.1, marketCap: 25000000000000 },
                              { symbol: 'USDT', name: 'Tether', price: 1.00, change24h: -0.2, marketCap: 95000000000000 },
                              { symbol: 'DAI', name: 'Dai', price: 1.00, change24h: 0.05, marketCap: 5000000000000 },
                              { symbol: 'WBTC', name: 'Wrapped Bitcoin', price: 65000, change24h: 1.8, marketCap: 10000000000000 }
                            ].map((token, index) => (
                              <tr key={token.symbol}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                                      {index + 1}
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{token.symbol}</div>
                                      <div className="text-sm text-gray-500">{token.name}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ${token.price.toFixed(4)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`text-sm font-medium ${token.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ${(token.marketCap / 1e9).toFixed(2)}B
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Supported Chains */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Chains</h3>
                    {supportedChains.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {supportedChains.slice(0, 12).map((chain: any) => (
                          <div key={chain.chainId} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium">{chain.name}</span>
                          </div>
                        ))}
                        {supportedChains.length > 12 && (
                          <div className="col-span-full text-center text-sm text-gray-500">
                            +{supportedChains.length - 12} more chains
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {[
                          { chainId: 1, name: 'Ethereum' },
                          { chainId: 137, name: 'Polygon' },
                          { chainId: 42161, name: 'Arbitrum' },
                          { chainId: 10, name: 'Optimism' },
                          { chainId: 56, name: 'BSC' },
                          { chainId: 43114, name: 'Avalanche' },
                          { chainId: 250, name: 'Fantom' },
                          { chainId: 1101, name: 'Polygon zkEVM' },
                          { chainId: 8453, name: 'Base' },
                          { chainId: 7777777, name: 'Zora' },
                          { chainId: 59144, name: 'Linea' },
                          { chainId: 534352, name: 'Scroll' }
                        ].map((chain) => (
                          <div key={chain.chainId} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium">{chain.name}</span>
                          </div>
                        ))}
                        <div className="col-span-full text-center text-sm text-gray-500">
                          +5 more chains
                        </div>
                      </div>
                    )}
                  </div>

                  {/* API Features Showcase */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">1inch API Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        {
                          title: 'Classic Swaps',
                          description: 'DEX aggregation across 100+ protocols',
                          icon: ArrowUpDown,
                          color: 'blue'
                        },
                        {
                          title: 'Cross-Chain Swaps',
                          description: 'Fusion+ cross-chain trading',
                          icon: ExternalLink,
                          color: 'purple'
                        },
                        {
                          title: 'Limit Orders',
                          description: 'Advanced order types with partial fills',
                          icon: Clock,
                          color: 'green'
                        },
                        {
                          title: 'Price Feeds',
                          description: 'Real-time prices across all chains',
                          icon: TrendingUp,
                          color: 'yellow'
                        },
                        {
                          title: 'Wallet Balances',
                          description: 'Multi-chain portfolio tracking',
                          icon: Wallet,
                          color: 'red'
                        },
                        {
                          title: 'Gas Optimization',
                          description: 'Smart gas estimation and optimization',
                          icon: Zap,
                          color: 'indigo'
                        }
                      ].map((feature, index) => (
                        <div key={index} className={`p-4 bg-${feature.color}-50 rounded-lg border border-${feature.color}-200`}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 bg-${feature.color}-100 rounded-lg flex items-center justify-center`}>
                              <feature.icon className={`w-5 h-5 text-${feature.color}-600`} />
                            </div>
                            <div>
                              <h3 className={`font-medium text-${feature.color}-900`}>{feature.title}</h3>
                              <p className={`text-sm text-${feature.color}-700`}>{feature.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Etherlink Fusion Mode */}
              {swapMode === 'etherlink' && (
                <div className="space-y-8">
                 

                  {/* Network Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card className="border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-bold text-sm">ETH</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Ethereum</h3>
                              <p className="text-gray-500 text-sm">Layer 1</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">30 Gwei</div>
                            <div className="text-gray-500 text-sm">Gas Price</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-600 text-sm">Network Active</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 font-bold text-sm">ETH</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Etherlink</h3>
                              <p className="text-gray-500 text-sm">Layer 2</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">$0.001</div>
                            <div className="text-gray-500 text-sm">Gas Price</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-600 text-sm">Network Active</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Cross-Chain Swap Form */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Cross-Chain Swap</h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* From Token */}
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700">From</label>
                          <div className="space-y-3">
                            <select className="w-full p-3 border border-gray-300 rounded-lg">
                              <option value="1">Ethereum</option>
                              <option value="1284">Etherlink</option>
                            </select>
                            <select className="w-full p-3 border border-gray-300 rounded-lg">
                              <option value="USDC">USDC</option>
                              <option value="USDT">USDT</option>
                              <option value="DAI">DAI</option>
                              <option value="WETH">WETH</option>
                            </select>
                            <Input
                              type="number"
                              placeholder="Amount"
                              className="w-full"
                            />
                          </div>
                        </div>

                        {/* To Token */}
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700">To</label>
                          <div className="space-y-3">
                            <select className="w-full p-3 border border-gray-300 rounded-lg">
                              <option value="1284">Etherlink</option>
                              <option value="1">Ethereum</option>
                            </select>
                            <select className="w-full p-3 border border-gray-300 rounded-lg">
                              <option value="USDC">USDC</option>
                              <option value="USDT">USDT</option>
                              <option value="DAI">DAI</option>
                              <option value="WETH">WETH</option>
                            </select>
                            <Input
                              type="number"
                              placeholder="Amount (estimated)"
                              className="w-full"
                              readOnly
                            />
                          </div>
                        </div>
                      </div>

                      {/* Slippage Settings */}
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Slippage Tolerance</label>
                        <div className="flex space-x-2">
                          {[0.5, 1, 2, 5].map((slippage) => (
                            <button
                              key={slippage}
                              className="px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                              {slippage}%
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-8 flex space-x-4">
                        <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                          <div className="flex items-center space-x-2">
                            <Sparkles className="w-4 h-4" />
                            <span>Get 1inch Fusion+ Quote</span>
                          </div>
                        </Button>
                        <Button className="flex-1 bg-green-600 hover:bg-green-700">
                          <div className="flex items-center space-x-2">
                            <ArrowUpDown className="w-4 h-4" />
                            <span>Execute Swap</span>
                          </div>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Price Comparison */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Cross-Chain Price Comparison</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Token</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ethereum Price</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Etherlink Price</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difference</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {[
                              { symbol: 'USDC', ethPrice: 1.00, etherlinkPrice: 1.00, difference: 0 },
                              { symbol: 'USDT', ethPrice: 1.00, etherlinkPrice: 1.00, difference: 0 },
                              { symbol: 'DAI', ethPrice: 1.00, etherlinkPrice: 1.00, difference: 0 },
                              { symbol: 'WETH', ethPrice: 3200, etherlinkPrice: 3250, difference: 1.56 }
                            ].map((token) => (
                              <tr key={token.symbol}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-sm font-medium">{token.symbol[0]}</span>
                                    </div>
                                    <span className="font-medium">{token.symbol}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ${token.ethPrice.toFixed(4)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ${token.etherlinkPrice.toFixed(4)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`text-sm font-medium ${token.difference > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                    {token.difference > 0 ? '+' : ''}{token.difference.toFixed(2)}%
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">Live</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bridge Analytics */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Bridge Analytics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">$2.5M</div>
                          <div className="text-sm text-blue-700">Total Volume Bridged</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">1,247</div>
                          <div className="text-sm text-green-700">Successful Bridges</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">$12.50</div>
                          <div className="text-sm text-purple-700">Average Bridge Fee</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Stellar + 1inch Mode */}
              {swapMode === 'stellar' && (
                <div className="space-y-8">

                  {/* Network Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <Globe className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Stellar</h3>
                              <p className="text-gray-500 text-sm">Layer 1</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Speed:</span>
                            <span className="text-sm font-medium text-green-600">~3-5 seconds</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Fee:</span>
                            <span className="text-sm font-medium text-green-600">~0.00001 XLM</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">TPS:</span>
                            <span className="text-sm font-medium text-green-600">1,000+</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-bold text-sm">ETH</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Ethereum</h3>
                              <p className="text-gray-500 text-sm">Layer 1</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Speed:</span>
                            <span className="text-sm font-medium text-yellow-600">~15 seconds</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Fee:</span>
                            <span className="text-sm font-medium text-yellow-600">~$5-50</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">TPS:</span>
                            <span className="text-sm font-medium text-yellow-600">15-30</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 font-bold text-sm">1INCH</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">1inch DEX</h3>
                              <p className="text-gray-500 text-sm">Aggregator</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Protocols:</span>
                            <span className="text-sm font-medium text-purple-600">100+</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Chains:</span>
                            <span className="text-sm font-medium text-purple-600">15+</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Liquidity:</span>
                            <span className="text-sm font-medium text-purple-600">$50B+</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Cross-Chain Swap Interface */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Cross-Chain Swap</h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* From Token */}
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700">From</label>
                          <div className="space-y-3">
                            <select className="w-full p-3 border border-gray-300 rounded-lg">
                              <option value="stellar">Stellar</option>
                              <option value="ethereum">Ethereum</option>
                              <option value="polygon">Polygon</option>
                              <option value="bsc">BSC</option>
                            </select>
                            <select className="w-full p-3 border border-gray-300 rounded-lg">
                              <option value="XLM">XLM (Stellar)</option>
                              <option value="USDC">USDC</option>
                              <option value="USDT">USDT</option>
                              <option value="ETH">ETH</option>
                              <option value="MATIC">MATIC</option>
                            </select>
                            <Input
                              type="number"
                              placeholder="Amount"
                              className="w-full"
                            />
                          </div>
                        </div>

                        {/* To Token */}
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700">To</label>
                          <div className="space-y-3">
                            <select className="w-full p-3 border border-gray-300 rounded-lg">
                              <option value="ethereum">Ethereum</option>
                              <option value="stellar">Stellar</option>
                              <option value="polygon">Polygon</option>
                              <option value="bsc">BSC</option>
                            </select>
                            <select className="w-full p-3 border border-gray-300 rounded-lg">
                              <option value="USDC">USDC</option>
                              <option value="XLM">XLM (Stellar)</option>
                              <option value="USDT">USDT</option>
                              <option value="ETH">ETH</option>
                              <option value="MATIC">MATIC</option>
                            </select>
                            <Input
                              type="number"
                              placeholder="Amount (estimated)"
                              className="w-full"
                              readOnly
                            />
                          </div>
                        </div>
                      </div>

                      {/* Advanced Options */}
                      <div className="mt-6 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Slippage Tolerance</label>
                          <div className="flex space-x-2">
                            {[0.1, 0.5, 1, 2].map((slippage) => (
                              <button
                                key={slippage}
                                className="px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                              >
                                {slippage}%
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="optimize-route" className="rounded" />
                          <label htmlFor="optimize-route" className="text-sm text-gray-700">
                            Optimize route using 1inch aggregation
                          </label>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-8 flex space-x-4">
                        <Button className="flex-1 bg-orange-600 hover:bg-orange-700">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4" />
                            <span>Get 1inch Quote</span>
                          </div>
                        </Button>
                        <Button className="flex-1 bg-green-600 hover:bg-green-700">
                          <div className="flex items-center space-x-2">
                            <Zap className="w-4 h-4" />
                            <span>Execute Fast Swap</span>
                          </div>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stellar Assets & Markets */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Stellar Assets & Markets</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">24h Change</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Liquidity</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {[
                              { asset: 'XLM', type: 'Native', price: 0.12, change: 2.5, liquidity: 'High', status: 'Active' },
                              { asset: 'USDC', type: 'Token', price: 1.00, change: 0.1, liquidity: 'High', status: 'Active' },
                              { asset: 'USDT', type: 'Token', price: 1.00, change: -0.2, liquidity: 'High', status: 'Active' },
                              { asset: 'BTC', type: 'Wrapped', price: 43000, change: 1.8, liquidity: 'Medium', status: 'Active' },
                              { asset: 'ETH', type: 'Wrapped', price: 3200, change: 3.2, liquidity: 'Medium', status: 'Active' }
                            ].map((item) => (
                              <tr key={item.asset}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-sm font-medium text-orange-600">{item.asset[0]}</span>
                                    </div>
                                    <span className="font-medium">{item.asset}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ${item.price.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`text-sm font-medium ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.liquidity}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">{item.status}</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance Metrics */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">3.2s</div>
                          <div className="text-sm text-orange-700">Avg. Transaction Time</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">$0.00001</div>
                          <div className="text-sm text-green-700">Avg. Transaction Fee</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">1,247</div>
                          <div className="text-sm text-blue-700">Daily Transactions</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">$2.1M</div>
                          <div className="text-sm text-purple-700">Total Volume (24h)</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* NEAR Solver Mode */}
              {swapMode === 'near-solver' && (
                <div className="space-y-8">

                  {/* Architecture Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="border border-gray-200">
                      <CardContent className="p-6">
                                                 <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center space-x-3">
                             <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                               <Cpu className="w-5 h-5 text-gray-600" />
                             </div>
                             <div>
                               <h3 className="font-semibold text-gray-900">Shade Agent</h3>
                               <p className="text-gray-500 text-sm">Framework</p>
                             </div>
                           </div>
                         </div>
                         <div className="space-y-2">
                           <div className="flex justify-between">
                             <span className="text-sm text-gray-600">Type:</span>
                             <span className="text-sm font-medium text-gray-900">Decentralized</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-sm text-gray-600">Trust:</span>
                             <span className="text-sm font-medium text-gray-900">Trustless</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-sm text-gray-600">Security:</span>
                             <span className="text-sm font-medium text-gray-900">TEE Protected</span>
                           </div>
                         </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 font-bold text-sm">1INCH</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Fusion+</h3>
                              <p className="text-gray-500 text-sm">Meta-Orders</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Format:</span>
                            <span className="text-sm font-medium text-purple-600">Intent-Based</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Execution:</span>
                            <span className="text-sm font-medium text-purple-600">Competitive</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Protection:</span>
                            <span className="text-sm font-medium text-purple-600">MEV Resistant</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-bold text-sm">NEAR</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">NEAR Protocol</h3>
                              <p className="text-gray-500 text-sm">Layer 1</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Speed:</span>
                            <span className="text-sm font-medium text-blue-600">~1-2 seconds</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Fee:</span>
                            <span className="text-sm font-medium text-blue-600">~$0.001</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">TPS:</span>
                            <span className="text-sm font-medium text-blue-600">100,000+</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Solver Competition Interface */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Decentralized Solver Competition</h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Intent Submission */}
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700">Submit Intent</label>
                          <div className="space-y-3">
                            <select className="w-full p-3 border border-gray-300 rounded-lg">
                              <option value="near">NEAR</option>
                              <option value="ethereum">Ethereum</option>
                              <option value="polygon">Polygon</option>
                              <option value="arbitrum">Arbitrum</option>
                            </select>
                            <select className="w-full p-3 border border-gray-300 rounded-lg">
                              <option value="USDC">USDC</option>
                              <option value="USDT">USDT</option>
                              <option value="NEAR">NEAR</option>
                              <option value="ETH">ETH</option>
                            </select>
                            <Input
                              type="number"
                              placeholder="Amount"
                              className="w-full"
                            />
                            <Input
                              type="number"
                              placeholder="Minimum output amount"
                              className="w-full"
                            />
                          </div>
                        </div>

                        {/* Solver Quotes */}
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700">Solver Quotes</label>
                          <div className="space-y-3">
                            {[
                              { solver: 'Solver Alpha', quote: 995.50, fee: 0.15, time: '1.2s', status: 'Best' },
                              { solver: 'Solver Beta', quote: 994.80, fee: 0.12, time: '1.5s', status: 'Competing' },
                              { solver: 'Solver Gamma', quote: 993.20, fee: 0.10, time: '1.8s', status: 'Competing' }
                            ].map((solver, index) => (
                              <div key={index} className={`p-3 border rounded-lg ${
                                solver.status === 'Best' ? 'border-teal-300 bg-teal-50' : 'border-gray-200'
                              }`}>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-medium text-gray-900">{solver.solver}</div>
                                    <div className="text-sm text-gray-500">Quote: {solver.quote} USDC</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-gray-600">Fee: {solver.fee}%</div>
                                    <div className="text-sm text-gray-600">Time: {solver.time}</div>
                                    {solver.status === 'Best' && (
                                      <div className="text-xs text-teal-600 font-medium mt-1">Best Quote</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-8 flex space-x-4">
                        <Button className="flex-1 bg-teal-600 hover:bg-teal-700">
                          <div className="flex items-center space-x-2">
                            <Cpu className="w-4 h-4" />
                            <span>Submit Intent</span>
                          </div>
                        </Button>
                        <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                          <div className="flex items-center space-x-2">
                            <Sparkles className="w-4 h-4" />
                            <span>Execute Best Quote</span>
                          </div>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Solver Network Status */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Solvers Network</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solver</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success Rate</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg. Quote Time</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Volume</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TEE Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {[
                              { solver: 'Solver Alpha', status: 'Active', successRate: 98.5, quoteTime: '1.2s', volume: '$2.1M', teeStatus: 'Verified' },
                              { solver: 'Solver Beta', status: 'Active', successRate: 97.2, quoteTime: '1.5s', volume: '$1.8M', teeStatus: 'Verified' },
                              { solver: 'Solver Gamma', status: 'Active', successRate: 96.8, quoteTime: '1.8s', volume: '$1.5M', teeStatus: 'Verified' },
                              { solver: 'Solver Delta', status: 'Standby', successRate: 95.1, quoteTime: '2.1s', volume: '$1.2M', teeStatus: 'Verified' }
                            ].map((item) => (
                              <tr key={item.solver}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                                      <Cpu className="w-4 h-4 text-teal-600" />
                                    </div>
                                    <span className="font-medium">{item.solver}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                      item.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'
                                    }`}></div>
                                    <span className="text-sm text-gray-600">{item.status}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.successRate}%</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quoteTime}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.volume}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-2">
                                    <ShieldCheck className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-gray-600">{item.teeStatus}</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance Metrics */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Solver Network Performance</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center p-4 bg-teal-50 rounded-lg">
                          <div className="text-2xl font-bold text-teal-600">12</div>
                          <div className="text-sm text-teal-700">Active Solvers</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">97.8%</div>
                          <div className="text-sm text-green-700">Success Rate</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">1.4s</div>
                          <div className="text-sm text-blue-700">Avg. Quote Time</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">$6.7M</div>
                          <div className="text-sm text-purple-700">Total Volume (24h)</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>                  
                </div>
              )}

              {/* Additional tabs for advanced features */}
              {activeTab === 'portfolio' && (
                <div className="space-y-8">
                  {/* Portfolio Overview */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">Portfolio Overview</h3>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">${portfolioData.totalValue.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Total Value</div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-semibold ${portfolioData.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {portfolioData.change24h >= 0 ? '+' : ''}{portfolioData.change24h}%
                            </div>
                            <div className="text-sm text-gray-600">24h Change</div>
                          </div>
                        </div>
                      </div>

                      {/* Assets Table */}
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">24h Change</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chain</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {portfolioData.assets.map((asset) => (
                              <tr key={asset.symbol}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-sm font-medium text-blue-600">{asset.symbol[0]}</span>
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-900">{asset.symbol}</div>
                                      <div className="text-sm text-gray-500">{asset.name}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.amount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${asset.value.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`text-sm font-medium ${asset.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.chain}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Chain Distribution */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Chain Distribution</h3>
                      <div className="space-y-4">
                        {portfolioData.chains.map((chain) => (
                          <div key={chain.name} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                              <span className="font-medium text-gray-900">{chain.name}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-600">{chain.percentage}%</span>
                              <span className="text-sm font-medium text-gray-900">${chain.value.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'market' && (
                <div className="space-y-8">
                  {/* Market Overview */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Overview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">${(marketAnalytics.marketOverview.totalVolume24h / 1e9).toFixed(1)}B</div>
                          <div className="text-sm text-blue-700">24h Volume</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">${(marketAnalytics.marketOverview.totalTvl / 1e9).toFixed(1)}B</div>
                          <div className="text-sm text-green-700">Total TVL</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{(marketAnalytics.marketOverview.activeUsers / 1e6).toFixed(1)}M</div>
                          <div className="text-sm text-purple-700">Active Users</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">{(marketAnalytics.marketOverview.totalTransactions / 1e6).toFixed(1)}M</div>
                          <div className="text-sm text-orange-700">Transactions</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Gainers & Losers */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="border border-gray-200">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Gainers (24h)</h3>
                        <div className="space-y-4">
                          {marketAnalytics.topGainers.map((token) => (
                            <div key={token.symbol} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-sm font-medium text-green-600">{token.symbol[0]}</span>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{token.symbol}</div>
                                  <div className="text-sm text-gray-600">{token.name}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">${token.price}</div>
                                <div className="text-sm font-medium text-green-600">+{token.change24h}%</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-200">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Losers (24h)</h3>
                        <div className="space-y-4">
                          {marketAnalytics.topLosers.map((token) => (
                            <div key={token.symbol} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-sm font-medium text-red-600">{token.symbol[0]}</span>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{token.symbol}</div>
                                  <div className="text-sm text-gray-600">{token.name}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">${token.price}</div>
                                <div className="text-sm font-medium text-red-600">{token.change24h}%</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Trending Pairs */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Trading Pairs</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pair</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">24h Volume</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volume Change</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Liquidity</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {marketAnalytics.trendingPairs.map((pair) => (
                              <tr key={pair.pair}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{pair.pair}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${(pair.volume24h / 1e6).toFixed(1)}M</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-medium text-green-600">+{pair.change24h}%</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${(pair.liquidity / 1e6).toFixed(1)}M</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-8">
                  {/* Limit Orders Table */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">Active Limit Orders</h3>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Create New Order
                        </Button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pair</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filled</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {limitOrdersData.map((order) => (
                              <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{order.pair}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                    order.type === 'buy' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {order.type.toUpperCase()}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.amount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.price}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.filled}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                    order.status === 'active' 
                                      ? 'bg-blue-100 text-blue-800'
                                      : order.status === 'filled'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {order.status.toUpperCase()}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Order Statistics */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Statistics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">4</div>
                          <div className="text-sm text-blue-700">Total Orders</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">2</div>
                          <div className="text-sm text-green-700">Active Orders</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">1</div>
                          <div className="text-sm text-purple-700">Filled Orders</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">75%</div>
                          <div className="text-sm text-orange-700">Success Rate</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 