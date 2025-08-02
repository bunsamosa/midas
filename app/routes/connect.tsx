import { useState, useEffect } from "react";
import { Navbar } from "components/Navbar";
import { Card, CardContent } from "components/ui/card";
import { useDynamicContext, DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { getWeb3Provider, getSigner } from '@dynamic-labs/ethers-v6';
import { formatEther } from "ethers";
import { generateFinancialData } from "../utils/financialDataGenerator";

export default function Connect() {
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const [isBankLoading, setIsBankLoading] = useState(false);
  const [isCreditCardLoading, setIsCreditCardLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isCreditCardConnected, setIsCreditCardConnected] = useState(false);
  const [isWeb3Loading, setIsWeb3Loading] = useState(false);
  const [isWeb3Connected, setIsWeb3Connected] = useState(false);
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [bankBalance, setBankBalance] = useState<number | null>(null);
  const [creditCardBalance, setCreditCardBalance] = useState<number | null>(null);

  const connectBankAccounts = () => {
    setIsBankLoading(true);

    setTimeout(() => {
      const { bankAccounts, totalBankBalance } = generateFinancialData();
      localStorage.setItem('bankAccounts', JSON.stringify(bankAccounts));
      localStorage.setItem('totalBankBalance', totalBankBalance.toString());
      setBankBalance(totalBankBalance);
      setIsBankLoading(false);
      setIsConnected(true);
    }, 2500);
  };

  const connectCreditCards = () => {
    setIsCreditCardLoading(true);

    setTimeout(() => {
      const { creditCards, totalCardBalance, financialData } = generateFinancialData();
      localStorage.setItem('creditCards', JSON.stringify(creditCards));
      localStorage.setItem('totalCreditCardDebt', totalCardBalance.toString());
      localStorage.setItem('financialData', JSON.stringify(financialData));
      setCreditCardBalance(totalCardBalance);
      setIsCreditCardLoading(false);
      setIsCreditCardConnected(true);
    }, 2500);
  };

  const connectWeb3Wallet = async () => {
    setIsWeb3Loading(true);
    try {
      if (!primaryWallet) {
        setShowAuthFlow(true);
        return;
      }

      const provider = await getWeb3Provider(primaryWallet);
      const signer = await getSigner(primaryWallet);
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const ethBalance = formatEther(balance);

      // Store Ethereum balance
      localStorage.setItem('ethBalance', ethBalance);
      setEthBalance(ethBalance);

      // Generate and store a random Bitcoin balance (0 to 1 BTC)
      const btcBalance = Math.random().toFixed(8);
      localStorage.setItem('btcBalance', btcBalance);

      setIsWeb3Connected(true);
    } catch (error) {
      console.error("Failed to connect Web3 wallet:", error);
    } finally {
      setIsWeb3Loading(false);
    }
  };

  return (
    <div className="flex p-2 flex-col min-h-screen w-full max-w-4xl mx-auto">
      <Navbar />
      <main className="flex flex-col items-center justify-center gap-8 m-auto w-full max-w-4xl px-4">
        <Card
          className="w-full sm:w-2/3 md:w-1/2 h-40 shadow-md rounded-xl transition-all hover:shadow-xl hover:scale-105 cursor-pointer overflow-hidden group"
          onClick={connectBankAccounts}
        >
          <CardContent className="flex items-center justify-center h-full p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {isBankLoading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            ) : isConnected ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center mb-2">
                  <svg className="w-6 h-6 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <h2 className="text-2xl font-semibold">Connected</h2>
                </div>
                <p className="text-sm">Bank Balance: ${bankBalance?.toFixed(2)}</p>
              </div>
            ) : (
              <h2 className="text-2xl font-semibold group-hover:scale-110 transition-transform duration-200">Connect Bank Accounts</h2>
            )}
          </CardContent>
        </Card>
        <Card
          className="w-full sm:w-2/3 md:w-1/2 h-40 shadow-md rounded-xl transition-all hover:shadow-xl hover:scale-105 cursor-pointer overflow-hidden group"
          onClick={connectCreditCards}
        >
          <CardContent className="flex items-center justify-center h-full p-6 bg-gradient-to-br from-green-500 to-teal-600 text-white">
            {isCreditCardLoading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            ) : isCreditCardConnected ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center mb-2">
                  <svg className="w-6 h-6 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <h2 className="text-2xl font-semibold">Connected</h2>
                </div>
                <p className="text-sm">Credit Card Balance: ${creditCardBalance?.toFixed(2)}</p>
              </div>
            ) : (
              <h2 className="text-2xl font-semibold group-hover:scale-110 transition-transform duration-200">Connect Credit Cards</h2>
            )}
          </CardContent>
        </Card>
        <Card
          className="w-full sm:w-2/3 md:w-1/2 h-40 shadow-md rounded-xl transition-all hover:shadow-xl hover:scale-105 cursor-pointer overflow-hidden group"
          onClick={connectWeb3Wallet}
        >
          <CardContent className="flex items-center justify-center h-full p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white">
            {isWeb3Loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            ) : isWeb3Connected ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center mb-2">
                  <svg className="w-6 h-6 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <h2 className="text-2xl font-semibold">Connected</h2>
                </div>
                <p className="text-sm">ETH Balance: {parseFloat(ethBalance!).toFixed(4)}</p>
              </div>
            ) : (
              <h2 className="text-2xl font-semibold group-hover:scale-110 transition-transform duration-200">Connect Web3 Wallets</h2>
            )}
          </CardContent>
        </Card>
      </main>
      <DynamicWidget />
    </div>
  );
}
