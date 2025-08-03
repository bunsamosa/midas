import { Navbar } from "components/Navbar";
import { Card, CardContent } from "components/ui/card";
import { Button } from "components/ui/button";
import { useState } from "react";
import { Shield, TestTube, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useRiskAssessment } from "../utils/useRiskAssessment";
import { RiskAssessmentToast } from "components/ui/risk-assessment-toast";
import { SwapParameters, TokenInfo, RiskAssessment } from "../utils/riskAssessment";

// Test scenarios with different risk levels
const TEST_SCENARIOS = [
  {
    name: "Safe Swap (Low Risk)",
    description: "ETH to USDC with high liquidity and verified contracts",
    fromToken: {
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
      auditStatus: 'AUDITED' as const
    },
    toToken: {
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
      auditStatus: 'AUDITED' as const
    },
    amount: "1000",
    slippage: 1,
    expectedRisk: "LOW"
  },
  {
    name: "Medium Risk Swap",
    description: "Large amount with moderate slippage",
    fromToken: {
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
      auditStatus: 'AUDITED' as const
    },
    toToken: {
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      symbol: 'UNI',
      name: 'Uniswap',
      decimals: 18,
      marketCap: 5000000000,
      volume24h: 100000000,
      priceChange24h: 15.5,
      liquidity: 20000000,
      holders: 100000,
      isVerified: true,
      auditStatus: 'AUDITED' as const
    },
    amount: "50000",
    slippage: 3,
    expectedRisk: "MEDIUM"
  },
  {
    name: "High Risk Swap",
    description: "Unknown token with low liquidity and high volatility",
    fromToken: {
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
      auditStatus: 'AUDITED' as const
    },
    toToken: {
      address: '0x1234567890123456789012345678901234567890',
      symbol: 'UNKNOWN',
      name: 'Unknown Token',
      decimals: 18,
      marketCap: 100000,
      volume24h: 50000,
      priceChange24h: 45.5,
      liquidity: 50000,
      holders: 50,
      isVerified: false,
      auditStatus: 'UNAUDITED' as const
    },
    amount: "10000",
    slippage: 5,
    expectedRisk: "HIGH"
  },
  {
    name: "Critical Risk Swap",
    description: "Unverified contract with owner privileges",
    fromToken: {
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
      auditStatus: 'AUDITED' as const
    },
    toToken: {
      address: '0x9999999999999999999999999999999999999999',
      symbol: 'SCAM',
      name: 'Suspicious Token',
      decimals: 18,
      marketCap: 50000,
      volume24h: 1000,
      priceChange24h: 100.0,
      liquidity: 1000,
      holders: 10,
      isVerified: false,
      auditStatus: 'UNAUDITED' as const
    },
    amount: "50000",
    slippage: 10,
    expectedRisk: "CRITICAL"
  }
];

export default function TestRiskAssessment() {
  const [currentTest, setCurrentTest] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<Array<{
    scenario: string;
    expectedRisk: string;
    actualRisk: string;
    passed: boolean;
    assessment: RiskAssessment;
  }>>([]);
  const [showRiskAssessment, setShowRiskAssessment] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<RiskAssessment | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const {
    assessSwapRisk,
    isAssessing,
    shouldBlockTransaction
  } = useRiskAssessment('https://mainnet.infura.io/v3/your-project-id');

  const runSingleTest = async (scenarioIndex: number) => {
    const scenario = TEST_SCENARIOS[scenarioIndex];
    setCurrentTest(scenarioIndex);

    try {
      const swapParams: SwapParameters = {
        fromToken: scenario.fromToken.address,
        toToken: scenario.toToken.address,
        amount: scenario.amount,
        slippageTolerance: scenario.slippage,
        protocol: 'Uniswap V3'
      };

      const assessment = await assessSwapRisk(swapParams, scenario.fromToken, scenario.toToken);
      
      const result = {
        scenario: scenario.name,
        expectedRisk: scenario.expectedRisk,
        actualRisk: assessment.overallRisk,
        passed: assessment.overallRisk === scenario.expectedRisk,
        assessment
      };

      setTestResults(prev => [...prev, result]);
      setCurrentAssessment(assessment);
      setShowRiskAssessment(true);

    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setCurrentTest(null);
    }
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    for (let i = 0; i < TEST_SCENARIOS.length; i++) {
      await runSingleTest(i);
      // Wait a bit between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsRunningTests(false);
  };

  const getTestResultIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'HIGH': return 'text-orange-600';
      case 'CRITICAL': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <TestTube className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold">Risk Assessment Testing</h1>
            </div>
            <p className="text-gray-600">
              Test the risk assessment system with various scenarios to ensure it correctly identifies different risk levels.
            </p>
          </div>

          {/* Test Controls */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Test Controls</h2>
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              
              <div className="flex space-x-4">
                <Button
                  onClick={runAllTests}
                  disabled={isRunningTests}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {isRunningTests ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Running Tests...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <TestTube className="w-4 h-4" />
                      <span>Run All Tests</span>
                    </div>
                  )}
                </Button>
                
                <Button
                  onClick={() => setTestResults([])}
                  variant="outline"
                >
                  Clear Results
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Test Scenarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {TEST_SCENARIOS.map((scenario, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{scenario.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      scenario.expectedRisk === 'LOW' ? 'bg-green-100 text-green-800' :
                      scenario.expectedRisk === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      scenario.expectedRisk === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      Expected: {scenario.expectedRisk}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div>From: {scenario.fromToken.symbol} → To: {scenario.toToken.symbol}</div>
                    <div>Amount: ${parseInt(scenario.amount).toLocaleString()}</div>
                    <div>Slippage: {scenario.slippage}%</div>
                    <div>To Token Liquidity: ${scenario.toToken.liquidity?.toLocaleString()}</div>
                    <div>To Token Verified: {scenario.toToken.isVerified ? 'Yes' : 'No'}</div>
                  </div>

                  <Button
                    onClick={() => runSingleTest(index)}
                    disabled={isRunningTests || currentTest === index}
                    variant="outline"
                    className="w-full"
                  >
                    {currentTest === index ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        <span>Testing...</span>
                      </div>
                    ) : (
                      <span>Run Test</span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Test Results</h2>
                
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTestResultIcon(result.passed)}
                        <div>
                          <h3 className="font-medium">{result.scenario}</h3>
                          <p className="text-sm text-gray-600">
                            Expected: <span className="font-medium">{result.expectedRisk}</span> | 
                            Actual: <span className={`font-medium ${getRiskColor(result.actualRisk)}`}>{result.actualRisk}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {result.passed ? 'PASSED' : 'FAILED'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Score: {result.assessment.riskScore}/100
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Test Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Tests:</span>
                      <span className="ml-2 font-medium">{testResults.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Passed:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {testResults.filter(r => r.passed).length}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Failed:</span>
                      <span className="ml-2 font-medium text-red-600">
                        {testResults.filter(r => !r.passed).length}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Success Rate:</span>
                      <span className="ml-2 font-medium">
                        {Math.round((testResults.filter(r => r.passed).length / testResults.length) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Risk Assessment Modal */}
      {currentAssessment && (
        <RiskAssessmentToast
          assessment={currentAssessment}
          isVisible={showRiskAssessment}
          onClose={() => setShowRiskAssessment(false)}
          onProceed={() => setShowRiskAssessment(false)}
          onCancel={() => setShowRiskAssessment(false)}
        />
      )}
    </div>
  );
} 