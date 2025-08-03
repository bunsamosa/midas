import { DynamicWidget, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/ui/card';
import { Button } from 'components/ui/button';
import { 
  TrendingUp, 
  Zap, 
  BarChart3, 
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const { user, primaryWallet } = useDynamicContext();
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate('/home');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Centered Title, Subtitle, and Button */}
      <div className="h-screen flex items-center justify-center relative group">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Midas
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-12">
            Your intelligent financial assistant. Track net worth, optimize spending power, 
            and make smarter financial decisions with AI-powered insights.
          </p>
          <div className="flex flex-col items-center space-y-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">Connected: {formatAddress(primaryWallet?.address || '')}</span>
                </div>
                <Button 
                  onClick={handleGoToDashboard}
                  className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Go to Dashboard
                </Button>
              </>
            ) : (
              <DynamicWidget />
            )}
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button 
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            className="p-3 rounded-full bg-gray-900 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-800"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6"/>
              <path d="m6 15 6 6 6-6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Financial Tools
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your financial health
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Net Worth Tracking */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="text-center">
                <div className="mx-auto bg-gray-900 p-3 rounded-lg w-fit mb-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Net Worth</CardTitle>
                <CardDescription className="text-gray-600">
                  Track your complete financial picture
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>Bank account balances</li>
                  <li>Credit card debt</li>
                  <li>Crypto portfolio</li>
                  <li>Real-time valuations</li>
                </ul>
              </CardContent>
            </Card>

            {/* Spending Power Analysis */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="text-center">
                <div className="mx-auto bg-gray-900 p-3 rounded-lg w-fit mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Spending Power</CardTitle>
                <CardDescription className="text-gray-600">
                  Optimize your financing options
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>Credit vs loan analysis</li>
                  <li>Crypto staking options</li>
                  <li>Interest comparisons</li>
                  <li>Credit impact assessment</li>
                </ul>
              </CardContent>
            </Card>

            {/* AI Financial Agents */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="text-center">
                <div className="mx-auto bg-gray-900 p-3 rounded-lg w-fit mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Midas AI</CardTitle>
                <CardDescription className="text-gray-600">
                  Intelligent financial guidance
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>Personalized advice</li>
                  <li>Investment insights</li>
                  <li>Risk assessment</li>
                  <li>24/7 guidance</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gray-900">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Connect your wallet and start managing your finances today
          </p>
          <div className="flex flex-col items-center space-y-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">Connected: {formatAddress(primaryWallet?.address || '')}</span>
                </div>
                <Button 
                  onClick={handleGoToDashboard}
                  className="px-8 py-3 bg-white text-gray-900 hover:bg-gray-100 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Go to Dashboard
                </Button>
              </>
            ) : (
              <DynamicWidget />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="text-center">
            <span className="text-xl font-bold text-gray-900">Midas</span>
          </div>
          <p className="text-gray-600">
            © 2025 Midas. Your intelligent financial assistant.
          </p>
        </div>
      </footer>
    </div>
  );
}
