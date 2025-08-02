import { useState, useEffect } from "react";
import { Navbar } from "components/Navbar";
import { Card, CardContent } from "components/ui/card";
import { useDynamicContext, DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { getWeb3Provider, getSigner } from '@dynamic-labs/ethers-v6';
import { formatEther } from "ethers";
import { generateFinancialData } from "../utils/financialDataGenerator";
import { Wallet, CreditCard, Building2 } from "lucide-react";

interface ConnectionStatus {
  bank: boolean;
  creditCard: boolean;
  web3: boolean;
}

export default function Connect() {
  const { primaryWallet, setShowAuthFlow, user } = useDynamicContext();
  const [isBankLoading, setIsBankLoading] = useState(false);
  const [isCreditCardLoading, setIsCreditCardLoading] = useState(false);
  const [isWeb3Loading, setIsWeb3Loading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    bank: false,
    creditCard: false,
    web3: false
  });
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [bankBalance, setBankBalance] = useState<number | null>(null);
  const [creditCardBalance, setCreditCardBalance] = useState<number | null>(null);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [web3Error, setWeb3Error] = useState<string | null>(null);

  // Check existing connections on component mount
  useEffect(() => {
    const storedBankAccounts = localStorage.getItem('bankAccounts');
    const storedCreditCards = localStorage.getItem('creditCards');
    const storedEthBalance = localStorage.getItem('ethBalance');
    
    if (storedBankAccounts) {
      const accounts = JSON.parse(storedBankAccounts);
      const totalBalance = Object.values(accounts).reduce((sum: number, balance: unknown) => sum + Number(balance), 0);
      setBankBalance(totalBalance);
      setConnectionStatus(prev => ({ ...prev, bank: true }));
    }
    
    if (storedCreditCards) {
      const cards = JSON.parse(storedCreditCards);
      const totalBalance = Object.values(cards).reduce((sum: number, balance: unknown) => sum + Number(balance), 0);
      setCreditCardBalance(totalBalance);
      setConnectionStatus(prev => ({ ...prev, creditCard: true }));
    }
    
    if (storedEthBalance) {
      setEthBalance(storedEthBalance);
      setConnectionStatus(prev => ({ ...prev, web3: true }));
    }
  }, []);

  // Check if user is logged in and has a wallet
  useEffect(() => {
    if (user && primaryWallet && !connectionStatus.web3) {
      // Auto-connect if user is already logged in
      connectWeb3Wallet();
    }
  }, [user, primaryWallet]);

  // Update progress when connection status changes
  useEffect(() => {
    const connectedCount = Object.values(connectionStatus).filter(Boolean).length;
    const progress = (connectedCount / 3) * 100;
    setConnectionProgress(progress);
    
    if (connectedCount === 3) {
      setTimeout(() => setShowSummary(true), 1000);
    }
  }, [connectionStatus]);

  const connectBankAccounts = () => {
    if (connectionStatus.bank) return;
    
    setIsBankLoading(true);
    setConnectionProgress(33);

    setTimeout(() => {
      const { bankAccounts, totalBankBalance } = generateFinancialData();
      localStorage.setItem('bankAccounts', JSON.stringify(bankAccounts));
      localStorage.setItem('totalBankBalance', totalBankBalance.toString());
      setBankBalance(totalBankBalance);
      setIsBankLoading(false);
      setConnectionStatus(prev => ({ ...prev, bank: true }));
    }, 2500);
  };

  const connectCreditCards = () => {
    if (connectionStatus.creditCard) return;
    
    setIsCreditCardLoading(true);
    setConnectionProgress(66);

    setTimeout(() => {
      const { creditCards, totalCardBalance, financialData } = generateFinancialData();
      localStorage.setItem('creditCards', JSON.stringify(creditCards));
      localStorage.setItem('totalCreditCardDebt', totalCardBalance.toString());
      localStorage.setItem('financialData', JSON.stringify(financialData));
      setCreditCardBalance(totalCardBalance);
      setIsCreditCardLoading(false);
      setConnectionStatus(prev => ({ ...prev, creditCard: true }));
    }, 2500);
  };

  const connectWeb3Wallet = async () => {
    if (connectionStatus.web3) return;
    
    setIsWeb3Loading(true);
    setWeb3Error(null);
    setConnectionProgress(100);
    
    try {
      if (!user) {
        setShowAuthFlow(true);
        return;
      }

      if (!primaryWallet) {
        setWeb3Error("No wallet connected. Please connect your wallet first.");
        return;
      }

      const provider = await getWeb3Provider(primaryWallet);
      const signer = await getSigner(primaryWallet);
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const ethBalance = formatEther(balance);

      localStorage.setItem('ethBalance', ethBalance);
      setEthBalance(ethBalance);

      const btcBalance = Math.random().toFixed(8);
      localStorage.setItem('btcBalance', btcBalance);

      setConnectionStatus(prev => ({ ...prev, web3: true }));
    } catch (error) {
      console.error("Failed to connect Web3 wallet:", error);
      setWeb3Error("Failed to connect wallet. Please try again.");
    } finally {
      setIsWeb3Loading(false);
    }
  };

  const getConnectionIcon = (isConnected: boolean, isLoading: boolean, icon: React.ReactNode) => {
    if (isLoading) {
      return (
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      );
    }
    
    if (isConnected) {
      return (
        <div className="mx-auto bg-green-500 p-3 rounded-lg w-fit mb-4">
          {icon}
        </div>
      );
    }
    
    return (
      <div className="mx-auto bg-gray-900 p-3 rounded-lg w-fit mb-4">
        {icon}
      </div>
    );
  };

  const getConnectionStatus = (isConnected: boolean, isLoading: boolean) => {
    if (isLoading) return "Connecting...";
    if (isConnected) return "Connected";
    return "Not Connected";
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Header Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Connect Your Financial Accounts
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect your bank accounts, credit cards, and Web3 wallets to get started with Midas DeFi platform
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-2xl mx-auto mb-12">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Connection Progress</span>
              <span className="text-sm font-medium text-gray-700">{Math.round(connectionProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gray-900 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${connectionProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Connection Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bank Accounts Card */}
            <Card 
              className={`border border-gray-200 bg-white cursor-pointer transition-all duration-300 hover:shadow-lg ${
                connectionStatus.bank ? 'ring-2 ring-green-500' : ''
              }`}
              onClick={connectBankAccounts}
            >
              <CardContent className="text-center p-6">
                {getConnectionIcon(connectionStatus.bank, isBankLoading, <Building2 className="h-6 w-6 text-white" />)}
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Bank Accounts</h2>
                <p className="text-sm text-gray-600 mb-4">
                  {getConnectionStatus(connectionStatus.bank, isBankLoading)}
                </p>
                {connectionStatus.bank && bankBalance && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-500">Balance</p>
                    <p className="text-lg font-bold text-gray-900">${bankBalance.toFixed(2)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Credit Cards Card */}
            <Card 
              className={`border border-gray-200 bg-white cursor-pointer transition-all duration-300 hover:shadow-lg ${
                connectionStatus.creditCard ? 'ring-2 ring-green-500' : ''
              }`}
              onClick={connectCreditCards}
            >
              <CardContent className="text-center p-6">
                {getConnectionIcon(connectionStatus.creditCard, isCreditCardLoading, <CreditCard className="h-6 w-6 text-white" />)}
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Credit Cards</h2>
                <p className="text-sm text-gray-600 mb-4">
                  {getConnectionStatus(connectionStatus.creditCard, isCreditCardLoading)}
                </p>
                {connectionStatus.creditCard && creditCardBalance && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-500">Balance</p>
                    <p className="text-lg font-bold text-gray-900">${creditCardBalance.toFixed(2)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Web3 Wallets Card */}
            <Card 
              className={`border border-gray-200 bg-white cursor-pointer transition-all duration-300 hover:shadow-lg ${
                connectionStatus.web3 ? 'ring-2 ring-green-500' : ''
              }`}
              onClick={connectWeb3Wallet}
            >
              <CardContent className="text-center p-6">
                {getConnectionIcon(connectionStatus.web3, isWeb3Loading, <Wallet className="h-6 w-6 text-white" />)}
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Web3 Wallets</h2>
                <p className="text-sm text-gray-600 mb-4">
                  {getConnectionStatus(connectionStatus.web3, isWeb3Loading)}
                </p>
                {web3Error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                    <p className="text-sm text-red-600">{web3Error}</p>
                  </div>
                )}
                {connectionStatus.web3 && ethBalance && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-500">ETH Balance</p>
                    <p className="text-lg font-bold text-gray-900">{parseFloat(ethBalance).toFixed(4)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Connection Summary */}
      {showSummary && (
        <div className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-green-500 p-3 rounded-lg w-fit mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">All Accounts Connected!</h2>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!showSummary && (
        <div className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Getting Started</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-gray-900 mr-3 font-bold">•</span>
                    Click on each card above to connect your financial accounts
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-900 mr-3 font-bold">•</span>
                    Bank accounts and credit cards will be simulated for demo purposes
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-900 mr-3 font-bold">•</span>
                    Web3 wallet connection requires a supported wallet (MetaMask, etc.)
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-900 mr-3 font-bold">•</span>
                    Once all connections are complete, you&apos;ll be able to access all features
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Dynamic Widget for Wallet Connection */}
      <div className="fixed bottom-4 right-4 z-50">
        <DynamicWidget />
      </div>
    </div>
  );
}
