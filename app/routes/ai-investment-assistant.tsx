import { Navbar } from "components/Navbar";
import { Card, CardContent } from "components/ui/card";
import { Button } from "components/ui/button";
import { useState } from "react";
import { MessageSquare, Building, ArrowRight, TrendingUp, Clock, Zap } from "lucide-react";
import { useNavigate } from "@remix-run/react";

interface AIRecommendation {
  id: number;
  title: string;
  description: string;
  fromToken: string;
  toToken: string;
  amount: string;
  rate: string;
  savings: string;
  confidence: number;
  timestamp: string;
  recommendedMode: string;
  reason: string;
}

const mockRecommendations: AIRecommendation[] = [
  {
    id: 1,
    title: "Portfolio Diversification",
    description: "Your ETH concentration is high (64%). Swap 0.3 ETH → MATIC for better diversification. MATIC showing strong L2 growth.",
    fromToken: "ETH",
    toToken: "MATIC",
    amount: "0.3",
    rate: "$0.49",
    savings: "$8",
    confidence: 89,
    timestamp: "9:13:01 AM",
    recommendedMode: "Cross-Chain",
    reason: "High ETH concentration, strong MATIC growth"
  },
  {
    id: 2,
    title: "Yield Optimization",
    description: "Consider swapping 0.2 ETH → USDC for stable yield farming opportunities. Current APY: 4.2%",
    fromToken: "ETH",
    toToken: "USDC",
    amount: "0.2",
    rate: "$1.00",
    savings: "$12",
    confidence: 92,
    timestamp: "9:13:05 AM",
    recommendedMode: "Standard",
    reason: "Stable yield farming opportunity"
  },
  {
    id: 3,
    title: "Risk Management",
    description: "Market volatility detected. Swap 0.1 ETH → DAI for portfolio stability. DAI showing low correlation.",
    fromToken: "ETH",
    toToken: "DAI",
    amount: "0.1",
    rate: "$1.00",
    savings: "$5",
    confidence: 85,
    timestamp: "9:13:10 AM",
    recommendedMode: "Standard",
    reason: "Market volatility, portfolio stability"
  }
];

export default function AIInvestmentAssistant() {
  const [currentRecommendation, setCurrentRecommendation] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const navigate = useNavigate();

  const recommendation = mockRecommendations[currentRecommendation];

  const handleExecuteSwap = async () => {
    setIsExecuting(true);
    
    try {
      // Navigate to swap page with pre-filled parameters
      const swapParams = new URLSearchParams({
        fromToken: recommendation.fromToken,
        toToken: recommendation.toToken,
        amount: recommendation.amount,
        mode: recommendation.recommendedMode.toLowerCase(),
        source: 'ai-recommendation'
      });

      // Simulate a brief loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to the swap page with parameters
      navigate(`/swap-with-risk?${swapParams.toString()}`);
      
    } catch (error) {
      console.error('Error navigating to swap:', error);
      alert('Error navigating to swap page');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleNextTip = () => {
    setCurrentRecommendation((prev) => 
      prev < mockRecommendations.length - 1 ? prev + 1 : 0
    );
  };

  const handlePreviousTip = () => {
    setCurrentRecommendation((prev) => 
      prev > 0 ? prev - 1 : mockRecommendations.length - 1
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Investment Assistant</h1>
                <p className="text-gray-600">Real-time portfolio analysis and recommendations</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Live</span>
            </div>
          </div>

          {/* AI Recommendation Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-lg">Midas AI</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">{recommendation.timestamp}</div>
                  <div className="text-sm font-medium text-blue-600">
                    Confidence: {recommendation.confidence}%
                  </div>
                </div>
              </div>

              {/* Recommendation Content */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {recommendation.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {recommendation.description}
                </p>
              </div>

              {/* Swap Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Swap</div>
                    <div className="font-medium">
                      {recommendation.fromToken} → {recommendation.toToken}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Rate</div>
                    <div className="font-medium">{recommendation.rate}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Amount</div>
                    <div className="font-medium">{recommendation.amount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Savings</div>
                    <div className="font-medium text-green-600">{recommendation.savings}</div>
                  </div>
                </div>
              </div>

              {/* Recommended Mode */}
              <div className="flex items-center space-x-2 mb-6">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">
                  Recommended Mode: <span className="font-medium">{recommendation.recommendedMode}</span>
                </span>
              </div>

              {/* Reason */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <div className="flex items-start space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-blue-800 mb-1">Why this recommendation?</div>
                    <div className="text-sm text-blue-700">{recommendation.reason}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePreviousTip}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={currentRecommendation === 0}
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
              
              <span className="text-sm text-gray-600">
                Recommendation {currentRecommendation + 1} of {mockRecommendations.length}
              </span>
              
              <button
                onClick={handleNextTip}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={currentRecommendation === mockRecommendations.length - 1}
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleExecuteSwap}
                disabled={isExecuting}
                className="bg-green-500 hover:bg-green-600"
              >
                {isExecuting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Navigating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Execute Swap</span>
                  </div>
                )}
              </Button>
              
              <Button
                onClick={handleNextTip}
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                Next Tip
              </Button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-6">
            <div className="flex space-x-2">
              {mockRecommendations.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full flex-1 transition-colors ${
                    index === currentRecommendation
                      ? 'bg-blue-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 