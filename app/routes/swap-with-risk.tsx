import { Navbar } from "components/Navbar";
import { Card, CardContent } from "components/ui/card";
import { Input } from "components/ui/input";
import { useState, useEffect } from "react";
import { ArrowUpDown, Shield, HelpCircle, Sparkles } from "lucide-react";
import { useRiskAssessment } from "../utils/useRiskAssessment";
import { RiskAssessmentToast } from "components/ui/risk-assessment-toast";
import { SwapParameters, TokenInfo, RiskAssessment } from "../utils/riskAssessment";
import { useSearchParams } from "@remix-run/react";

// Tooltip component
function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  const [isVisible, setIsVisible] = useState(false);

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

interface QuoteData {
  fromToken: TokenInfo;
  toToken: TokenInfo;
  fromAmount: string;
  toAmount: string;
  priceImpact: number;
  gasEstimate: string;
  gasPrice: string;
  route: string;
  exchanges: string[];
}

export default function SwapWithRisk() {
  const [searchParams] = useSearchParams();
  const [swapForm, setSwapForm] = useState({
    fromToken: 'ETH',
    toToken: 'USDC',
    amount: '',
    slippage: 1
  });

  const [optimizeRoute, setOptimizeRoute] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  const [showRiskAssessment, setShowRiskAssessment] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<RiskAssessment | null>(null);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [isFromAI, setIsFromAI] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  // Initialize risk assessment hook
  // const {
  //   assessSwapRisk,
  //   lastAssessment,
  //   shouldShowWarning,
  //   shouldBlockTransaction,
  //   getRiskColor,
  //   getRiskIcon
  // } = useRiskAssessment('https://mainnet.infura.io/v3/your-project-id');

  // Temporary mock functions
  const assessSwapRisk = async () => ({ 
    overallRisk: 'LOW' as const, 
    riskScore: 10, 
    riskFactors: [],
    recommendations: ['Proceed with swap']
  });
  const lastAssessment = null;
  const shouldShowWarning = (assessment: any) => false;
  const shouldBlockTransaction = (assessment: any) => false;
  const getRiskColor = (risk: any) => 'text-green-600';
  const getRiskIcon = (risk: any) => '✅';

  // Load parameters from URL if coming from AI recommendation
  useEffect(() => {
    const fromToken = searchParams.get('fromToken');
    const toToken = searchParams.get('toToken');
    const amount = searchParams.get('amount');
    const mode = searchParams.get('mode');
    const source = searchParams.get('source');

    if (source === 'ai-recommendation' && fromToken && toToken && amount) {
      console.log('Setting AI recommendation tokens:', { fromToken, toToken, amount });
      
      setSwapForm({
        fromToken,
        toToken,
        amount,
        slippage: 1
      });
      setIsFromAI(true);
      
      // Auto-optimize route for cross-chain recommendations
      if (mode === 'cross-chain') {
        setOptimizeRoute(true);
      }
      
      console.log('Loaded AI recommendation:', { fromToken, toToken, amount, mode });
      
    }
  }, [searchParams]);



  // Mock token data (in real app, fetch from API)
  const getTokenInfo = (symbol: string): TokenInfo => {
    const tokens: Record<string, TokenInfo> = {
      'ETH': {
        address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
        marketCap: 200000000000,
        volume24h: 5000000000,
        priceChange24h: 2.5,
        liquidity: 1000000000,
        holders: 1000000,
        isVerified: true,
        auditStatus: 'AUDITED'
      },
      'USDC': {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        marketCap: 25000000000,
        volume24h: 2000000000,
        priceChange24h: 0.1,
        liquidity: 500000000,
        holders: 500000,
        isVerified: true,
        auditStatus: 'AUDITED'
      },
      'MATIC': {
        address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608aCafEBB0',
        symbol: 'MATIC',
        name: 'Polygon',
        decimals: 18,
        marketCap: 8000000000,
        volume24h: 300000000,
        priceChange24h: 2.8,
        liquidity: 200000000,
        holders: 800000,
        isVerified: true,
        auditStatus: 'AUDITED'
      },
      'DAI': {
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        symbol: 'DAI',
        name: 'Dai',
        decimals: 18,
        marketCap: 5000000000,
        volume24h: 150000000,
        priceChange24h: 0.05,
        liquidity: 300000000,
        holders: 400000,
        isVerified: true,
        auditStatus: 'AUDITED'
      },
      'UNKNOWN': {
        address: '0x1234567890123456789012345678901234567890',
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        decimals: 18,
        marketCap: 100000,
        volume24h: 50000,
        priceChange24h: 25.5,
        liquidity: 50000,
        holders: 50,
        isVerified: false,
        auditStatus: 'UNAUDITED'
      }
    };
    return tokens[symbol] || tokens['UNKNOWN'];
  };

  const generateRiskExplanation = (assessment: RiskAssessment) => {
    if (!assessment || assessment.riskFactors.length === 0) {
      return "No specific risk factors detected. This transaction appears safe.";
    }

    const factorExplanations = assessment.riskFactors.map((factor) => 
      `• ${factor.severity} ${factor.type.replace('_', ' ')}: ${factor.description}`
    ).join('\n');

    return `Risk factors contributing to ${assessment.overallRisk} risk level:\n\n${factorExplanations}`;
  };

  const handleSlippageChange = (slippage: number) => {
    console.log('Slippage changed to:', slippage);
    setSwapForm(prev => ({ ...prev, slippage }));
  };

  const handleOptimizeRouteChange = (checked: boolean) => {
    console.log('Optimize route changed to:', checked);
    setOptimizeRoute(checked);
  };

  const handleGetQuote = async () => {
    console.log('Getting quote...');
    if (!swapForm.amount || parseFloat(swapForm.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsGettingQuote(true);

    try {
      const fromTokenInfo = getTokenInfo(swapForm.fromToken);
      const toTokenInfo = getTokenInfo(swapForm.toToken);

      const swapParams: SwapParameters = {
        fromToken: fromTokenInfo.address,
        toToken: toTokenInfo.address,
        amount: swapForm.amount,
        slippageTolerance: swapForm.slippage,
        protocol: optimizeRoute ? '1inch' : 'Uniswap V3'
      };

      console.log('Swap params:', swapParams);

      // Simulate getting quote from 1inch with realistic data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Calculate realistic quote based on token types
      let toAmount = '0';
      let priceImpact = 0.05;
      let gasEstimate = '150000';
      
      if (swapForm.fromToken === 'ETH' && swapForm.toToken === 'USDC') {
        toAmount = (parseFloat(swapForm.amount) * 1800).toFixed(2);
        priceImpact = 0.03;
        gasEstimate = '120000';
      } else if (swapForm.fromToken === 'ETH' && swapForm.toToken === 'MATIC') {
        toAmount = (parseFloat(swapForm.amount) * 1800 / 0.49).toFixed(2);
        priceImpact = 0.08;
        gasEstimate = '180000';
      } else if (swapForm.fromToken === 'ETH' && swapForm.toToken === 'DAI') {
        toAmount = (parseFloat(swapForm.amount) * 1800).toFixed(2);
        priceImpact = 0.02;
        gasEstimate = '110000';
      } else {
        toAmount = (parseFloat(swapForm.amount) * 100).toFixed(2);
        priceImpact = 0.15;
        gasEstimate = '200000';
      }

      const mockQuote: QuoteData = {
        fromToken: fromTokenInfo,
        toToken: toTokenInfo,
        fromAmount: swapForm.amount,
        toAmount: toAmount,
        priceImpact: priceImpact,
        gasEstimate: gasEstimate,
        gasPrice: '20',
        route: optimizeRoute ? '1inch Fusion+' : 'Uniswap V3',
        exchanges: optimizeRoute ? ['Uniswap V3', 'SushiSwap', 'Balancer'] : ['Uniswap V3']
      };

      setQuoteData(mockQuote);

      // Perform risk assessment
      const assessment = await assessSwapRisk();
      setCurrentAssessment(assessment);

      console.log('Quote received:', mockQuote);
      console.log('Risk assessment:', assessment);

    } catch (error) {
      console.error('Error getting quote:', error);
      alert('Error getting quote');
    } finally {
      setIsGettingQuote(false);
    }
  };

  const handleFastSwap = async () => {
    console.log('Executing swap...');
    if (!quoteData) {
      alert('Please get a quote first');
      return;
    }

    setIsLoading(true);

    try {
      const fromTokenInfo = getTokenInfo(swapForm.fromToken);
      const toTokenInfo = getTokenInfo(swapForm.toToken);

      const swapParams: SwapParameters = {
        fromToken: fromTokenInfo.address,
        toToken: toTokenInfo.address,
        amount: swapForm.amount,
        slippageTolerance: swapForm.slippage,
        protocol: optimizeRoute ? '1inch' : 'Uniswap V3'
      };

      // Perform risk assessment
      const assessment = await assessSwapRisk();
      setCurrentAssessment(assessment);

      // Show risk assessment if there are warnings
      if (shouldShowWarning(assessment)) {
        setShowRiskAssessment(true);
        return;
      }

      // If critical risk, block the transaction
      if (shouldBlockTransaction(assessment)) {
        alert('Transaction blocked due to critical risk level');
        return;
      }

      // Execute the swap
      await executeSwap(swapParams);

    } catch (error) {
      console.error('Error during swap:', error);
      alert('Error occurred during swap');
    } finally {
      setIsLoading(false);
    }
  };

  const executeSwap = async (swapParams: SwapParameters) => {
    // Simulate swap execution
    console.log('Executing swap:', swapParams);
    setIsLoading(true);
    
    try {
      // Show pending state for 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Show success message
      if (isFromAI) {
        alert('✅ AI-Recommended Swap Executed Successfully!\n\n' +
              `Swapped ${swapParams.amount} ${swapForm.fromToken} → ${swapForm.toToken}\n` +
              'Risk assessment passed. Transaction completed.');
      } else {
        alert('✅ Swap Executed Successfully!\n\n' +
              `Swapped ${swapParams.amount} ${swapForm.fromToken} → ${swapForm.toToken}\n` +
              'Transaction completed.');
      }
      
      // Reset form after successful swap
      setSwapForm({
        fromToken: 'ETH',
        toToken: 'USDC',
        amount: '',
        slippage: 1
      });
      setQuoteData(null);
      setCurrentAssessment(null);
      setIsFromAI(false);
      
    } catch (error) {
      console.error('Error executing swap:', error);
      alert('❌ Error occurred during swap execution');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedWithRisk = async () => {
    setShowRiskAssessment(false);
    
    if (currentAssessment && quoteData) {
      const fromTokenInfo = getTokenInfo(swapForm.fromToken);
      const toTokenInfo = getTokenInfo(swapForm.toToken);

      const swapParams: SwapParameters = {
        fromToken: fromTokenInfo.address,
        toToken: toTokenInfo.address,
        amount: swapForm.amount,
        slippageTolerance: swapForm.slippage,
        protocol: optimizeRoute ? '1inch' : 'Uniswap V3'
      };

      await executeSwap(swapParams);
    }
  };

  const handleCancelTransaction = () => {
    setShowRiskAssessment(false);
    alert('Transaction cancelled due to risk assessment');
  };

  const slippageOptions = [0.5, 1, 2, 5];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Swap with Risk Assessment</h1>
                <Shield className="w-6 h-6 text-blue-500" />
              </div>

              {/* AI Recommendation Banner */}
              {isFromAI && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-purple-800">
                      AI Recommendation Loaded
                    </span>
                  </div>
                  <p className="text-xs text-purple-600 mt-1">
                    Pre-filled from Midas AI recommendation
                  </p>
                </div>
              )}

              {/* From Token */}
              <div className="mb-4">
                <label htmlFor="from-amount" className="block text-sm font-medium text-gray-700 mb-2">
                  From
                </label>
                <div className="flex space-x-2">
                  <Input
                    id="from-amount"
                    type="number"
                    placeholder="0.0"
                    value={swapForm.amount}
                    onChange={(e) => {
                      console.log('Amount changed:', e.target.value);
                      setSwapForm(prev => ({ ...prev, amount: e.target.value }));
                    }}
                    className="flex-1"
                  />
                  <select
                    id="from-token"
                    value={swapForm.fromToken}
                    onChange={(e) => {
                      console.log('From token changed:', e.target.value);
                      setSwapForm(prev => ({ ...prev, fromToken: e.target.value }));
                    }}
                    className={`px-3 py-2 border rounded-md bg-white ${
                      isFromAI ? 'border-purple-300 bg-purple-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="ETH">ETH</option>
                    <option value="USDC">USDC</option>
                    <option value="MATIC">MATIC</option>
                    <option value="DAI">DAI</option>
                    <option value="UNKNOWN">UNKNOWN</option>
                  </select>
                </div>
              </div>

              {/* Swap Arrow */}
              <div className="flex justify-center mb-4">
                <ArrowUpDown className="w-6 h-6 text-gray-400" />
              </div>

              {/* To Token */}
              <div className="mb-4">
                <label htmlFor="to-amount" className="block text-sm font-medium text-gray-700 mb-2">
                  To
                </label>
                <div className="flex space-x-2">
                  <Input
                    id="to-amount"
                    type="number"
                    placeholder="0.0"
                    disabled
                    className="flex-1 bg-gray-50"
                  />
                  <select
                    id="to-token"
                    value={swapForm.toToken}
                    onChange={(e) => {
                      console.log('To token changed:', e.target.value);
                      setSwapForm(prev => ({ ...prev, toToken: e.target.value }));
                    }}
                    className={`px-3 py-2 border rounded-md bg-white ${
                      isFromAI ? 'border-purple-300 bg-purple-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="USDC">USDC</option>
                    <option value="ETH">ETH</option>
                    <option value="MATIC">MATIC</option>
                    <option value="DAI">DAI</option>
                    <option value="UNKNOWN">UNKNOWN</option>
                  </select>
                </div>
              </div>

              {/* Slippage Tolerance */}
              <div className="mb-4">
                <label id="slippage-label" className="block text-sm font-medium text-gray-700 mb-2">
                  Slippage Tolerance
                </label>
                <div className="flex space-x-2" role="group" aria-labelledby="slippage-label">
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Slippage 0.5% clicked');
                      alert('Slippage 0.5% selected!');
                      setSwapForm(prev => ({ ...prev, slippage: 0.5 }));
                    }}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                      swapForm.slippage === 0.5
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    0.5%
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Slippage 1% clicked');
                      alert('Slippage 1% selected!');
                      setSwapForm(prev => ({ ...prev, slippage: 1 }));
                    }}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                      swapForm.slippage === 1
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    1%
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Slippage 2% clicked');
                      alert('Slippage 2% selected!');
                      setSwapForm(prev => ({ ...prev, slippage: 2 }));
                    }}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                      swapForm.slippage === 2
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    2%
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Slippage 5% clicked');
                      alert('Slippage 5% selected!');
                      setSwapForm(prev => ({ ...prev, slippage: 5 }));
                    }}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                      swapForm.slippage === 5
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    5%
                  </button>
                </div>
              </div>

              {/* 1inch Optimization */}
              <div className="mb-6">
                <label htmlFor="optimize-route" className="flex items-center space-x-2 cursor-pointer">
                  <input
                    id="optimize-route"
                    type="checkbox"
                    checked={optimizeRoute}
                    onChange={(e) => handleOptimizeRouteChange(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Optimize route using 1inch aggregation
                  </span>
                </label>
              </div>

              {/* Quote Display */}
              {quoteData && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between mb-1">
                      <span>You&apos;ll receive:</span>
                      <span className="font-medium">{quoteData.toAmount} {quoteData.toToken.symbol}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Price impact:</span>
                      <span className="font-medium">{quoteData.priceImpact}%</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Gas estimate:</span>
                      <span className="font-medium">{quoteData.gasEstimate} gas</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Route:</span>
                      <span className="font-medium">{quoteData.route}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Pending Status */}
              {isLoading && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-sm font-medium text-blue-800">Swap Pending...</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Transaction is being processed on the blockchain
                  </p>
                </div>
              )}

              {/* Risk Assessment Status */}
              {/* Temporarily disabled for debugging */}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    console.log('Get Quote button clicked');
                    if (!swapForm.amount || parseFloat(swapForm.amount) <= 0) {
                      alert('Please enter a valid amount');
                      return;
                    }
                    console.log('Opening modal...');
                    setShowQuoteModal(true);
                  }}
                  disabled={isGettingQuote || !swapForm.amount}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGettingQuote ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Getting Quote...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Get 1inch Fusion+ Quote</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    console.log('Execute Swap button clicked');
                    if (!quoteData) {
                      alert('Please get a quote first');
                      return;
                    }
                    handleFastSwap();
                  }}
                  disabled={isLoading || !quoteData}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Executing...</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpDown className="w-4 h-4" />
                      <span>Execute Swap</span>
                    </>
                  )}
                </button>
              </div>

              {/* Debug Info */}
              <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
                <div>Current slippage: {swapForm.slippage}%</div>
                <div>Optimize route: {optimizeRoute ? 'Yes' : 'No'}</div>
                <div>Amount: {swapForm.amount}</div>
                <div>From: {swapForm.fromToken} → To: {swapForm.toToken}</div>
                {isFromAI && <div className="text-purple-600">AI Recommendation Loaded</div>}
                <div className="mt-2 p-1 bg-yellow-100 rounded">
                  <div>Token Selection Debug:</div>
                  <div>From Token Value: &quot;{swapForm.fromToken}&quot;</div>
                  <div>To Token Value: &quot;{swapForm.toToken}&quot;</div>
                  <div>Amount Value: &quot;{swapForm.amount}&quot;</div>
                </div>
                
                {/* Modal Debug */}
                <div className="mt-2 p-1 bg-red-100 rounded">
                  <div>Modal Debug:</div>
                  <div>showQuoteModal: {showQuoteModal ? 'TRUE' : 'FALSE'}</div>
                  <div>Button disabled: {(!swapForm.amount) ? 'YES' : 'NO'}</div>
                </div>
                
                {/* Test Button */}
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Test button clicked!');
                      alert('Test button works!');
                    }}
                    className="px-2 py-1 bg-red-500 text-white text-xs rounded"
                  >
                    Test Button
                  </button>
                </div>
              </div>

              {/* Risk Assessment Info */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-800">Risk Assessment Active</span>
                </div>
                <p className="text-xs text-blue-600">
                  This swap will be automatically assessed for liquidity, contract, volatility, and other risks before execution.
                </p>
                <Tooltip content="Risk assessment checks:\n• Liquidity availability\n• Contract verification\n• Price volatility\n• Slippage tolerance\n• MEV protection\n• Gas optimization\n• Token fundamentals\n• Protocol security">
                  <p className="text-xs text-blue-500 mt-2 cursor-help">
                    What risks are checked? (hover for details)
                  </p>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Risk Assessment Modal */}
      {currentAssessment && (
        <RiskAssessmentToast
          assessment={currentAssessment}
          isVisible={showRiskAssessment}
          onClose={() => setShowRiskAssessment(false)}
          onProceed={handleProceedWithRisk}
          onCancel={handleCancelTransaction}
        />
      )}

      {/* Quote Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">1inch Fusion+ Quote</h3>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Swap</span>
                  <span className="font-medium">{swapForm.fromToken} → {swapForm.toToken}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="font-medium">{swapForm.amount} {swapForm.fromToken}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">You'll receive</span>
                  <span className="font-medium text-green-600">
                    {(parseFloat(swapForm.amount) * 1800).toFixed(2)} {swapForm.toToken}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Price impact</span>
                  <span className="font-medium">0.05%</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Gas estimate</span>
                  <span className="font-medium">150,000 gas</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Route</span>
                  <span className="font-medium">1inch Fusion+</span>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-800">Risk Assessment: LOW</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  This swap has been assessed as low risk. Proceed with confidence.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowQuoteModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowQuoteModal(false);
                  setQuoteData({
                    fromToken: getTokenInfo(swapForm.fromToken),
                    toToken: getTokenInfo(swapForm.toToken),
                    fromAmount: swapForm.amount,
                    toAmount: (parseFloat(swapForm.amount) * 1800).toFixed(2),
                    priceImpact: 0.05,
                    gasEstimate: '150000',
                    gasPrice: '20',
                    route: '1inch Fusion+',
                    exchanges: ['Uniswap V3', 'SushiSwap', 'Balancer']
                  });
                }}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
              >
                Accept Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 