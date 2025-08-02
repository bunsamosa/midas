import { useState, useEffect } from "react";
import { Navbar } from "components/Navbar";
import { Card, CardContent } from "components/ui/card";
import { ethers } from "ethers";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { getWeb3Provider } from '@dynamic-labs/ethers-v6';
import { TrendingUp, DollarSign, CreditCard, Coins, Bitcoin, Activity } from "lucide-react";

// ABI for the Oracle reader (assuming it has a 'read' function that returns the price)
const oracleABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "chronicle",
        "outputs": [
            {
                "internalType": "contract IChronicle",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "read",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "val",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "age",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "selfKisser",
        "outputs": [
            {
                "internalType": "contract ISelfKisser",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

const ETH_ORACLE_ADDRESS = "0xBFD8FDF3aa1A0034eb978fD94e2834e2fB75e34A";
const BTC_ORACLE_ADDRESS = "0x45d004941e10b75f0Dd27a6f89A312Aa004975cb";

// Polygon zkEVM Cardona Testnet RPC URL
const RPC_URL = "https://rpc.cardona.zkevm-rpc.com";

export default function NetWorthPage() {
  const { primaryWallet } = useDynamicContext();
  const [bankBalance, setBankBalance] = useState(0);
  const [creditCardDebt, setCreditCardDebt] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [btcBalance, setBtcBalance] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const [btcPrice, setBtcPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      console.log("fetchData function started");
      try {
        // Fetch data from localStorage
        const totalBankBalance = parseFloat(localStorage.getItem('totalBankBalance') || '0');
        const totalCreditCardDebt = parseFloat(localStorage.getItem('totalCreditCardDebt') || '0');
        const ethBalance = parseFloat(localStorage.getItem('ethBalance') || '0');
        const btcBalance = parseFloat(localStorage.getItem('btcBalance') || '0');

        console.log("Data from localStorage:", { totalBankBalance, totalCreditCardDebt, ethBalance, btcBalance });

        setBankBalance(totalBankBalance);
        setCreditCardDebt(totalCreditCardDebt);
        setEthBalance(ethBalance);
        setBtcBalance(btcBalance);

        console.log("Primary wallet:", primaryWallet);

        // Create a provider using the Polygon zkEVM Cardona Testnet RPC URL
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        console.log("Provider created for Polygon zkEVM Cardona Testnet");

        // Log the network we're connected to
        const network = await provider.getNetwork();
        console.log("Connected to network:", network);

        console.log("Creating ETH oracle contract...");
        const ethOracleContract = new ethers.Contract(ETH_ORACLE_ADDRESS, oracleABI, provider);
        console.log("ETH oracle contract created");

        console.log("Creating BTC oracle contract...");
        const btcOracleContract = new ethers.Contract(BTC_ORACLE_ADDRESS, oracleABI, provider);
        console.log("BTC oracle contract created");

        console.log("Calling ETH oracle read function...");
        try {
          const ethPriceRaw = await ethOracleContract.read();
          console.log("ETH price raw:", ethPriceRaw);
          const ethPriceUSD = Number(ethers.formatUnits(ethPriceRaw.val, 18));
          console.log("ETH price USD:", ethPriceUSD);
          setEthPrice(ethPriceUSD);
        } catch (ethError) {
          console.error("Error calling ETH oracle:", ethError);
          setEthPrice(2000); // Fallback price
        }

        console.log("Calling BTC oracle read function...");
        try {
          const btcPriceRaw = await btcOracleContract.read();
          console.log("BTC price raw:", btcPriceRaw);
          const btcPriceUSD = Number(ethers.formatUnits(btcPriceRaw.val, 18));
          console.log("BTC price USD:", btcPriceUSD);
          setBtcPrice(btcPriceUSD);
        } catch (btcError) {
          console.error("Error calling BTC oracle:", btcError);
          setBtcPrice(30000); // Fallback price
        }

      } catch (error) {
        console.error("Error in fetchData:", error);
        setEthPrice(2000); // Fallback price
        setBtcPrice(30000); // Fallback price
      } finally {
        setIsLoading(false);
        console.log("fetchData function completed");
      }
    };

    fetchData();
  }, [primaryWallet]);

  const totalCryptoHolding = (ethBalance * ethPrice) + (btcBalance * btcPrice);
  const totalNetWorth = bankBalance - creditCardDebt + totalCryptoHolding;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your net worth data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Header Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Net Worth Analysis
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Track your complete financial picture with real-time crypto prices and comprehensive portfolio insights
            </p>
          </div>

          {/* Net Worth Summary */}
          <div className="mb-12">
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-8 text-center">
                <div className="mx-auto bg-gray-900 p-3 rounded-lg w-fit mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Total Net Worth</h2>
                <p className="text-4xl font-bold text-gray-900">${totalNetWorth.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-2">Total assets minus liabilities</p>
              </CardContent>
            </Card>
          </div>

          {/* Financial Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Bank Balance */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6 text-center">
                <div className="mx-auto bg-green-500 p-3 rounded-lg w-fit mb-4">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Bank Balance</h3>
                <p className="text-2xl font-bold text-green-600">${bankBalance.toFixed(2)}</p>
              </CardContent>
            </Card>

            {/* Credit Card Debt */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6 text-center">
                <div className="mx-auto bg-red-500 p-3 rounded-lg w-fit mb-4">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Credit Card Debt</h3>
                <p className="text-2xl font-bold text-red-600">${creditCardDebt.toFixed(2)}</p>
              </CardContent>
            </Card>

            {/* ETH Holdings */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6 text-center">
                <div className="mx-auto bg-blue-500 p-3 rounded-lg w-fit mb-4">
                  <Coins className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ETH Holdings</h3>
                <p className="text-lg font-bold text-blue-600">{ethBalance.toFixed(4)} ETH</p>
                <p className="text-sm text-gray-600">${(ethBalance * ethPrice).toFixed(2)}</p>
                <p className="text-xs text-gray-500">@ ${ethPrice.toFixed(2)}</p>
              </CardContent>
            </Card>

            {/* BTC Holdings */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6 text-center">
                <div className="mx-auto bg-orange-500 p-3 rounded-lg w-fit mb-4">
                  <Bitcoin className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">BTC Holdings</h3>
                <p className="text-lg font-bold text-orange-600">{btcBalance.toFixed(8)} BTC</p>
                <p className="text-sm text-gray-600">${(btcBalance * btcPrice).toFixed(2)}</p>
                <p className="text-xs text-gray-500">@ ${btcPrice.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Crypto Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Portfolio Breakdown */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-6">
                  <div className="bg-purple-500 p-2 rounded-lg mr-3">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Portfolio Breakdown</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Bank Accounts</span>
                    <span className="font-semibold text-gray-900">${bankBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Credit Card Debt</span>
                    <span className="font-semibold text-red-600">-${creditCardDebt.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Crypto Portfolio</span>
                    <span className="font-semibold text-gray-900">${totalCryptoHolding.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total Net Worth</span>
                      <span className="text-xl font-bold text-gray-900">${totalNetWorth.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Crypto Performance */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-6">
                  <div className="bg-green-500 p-2 rounded-lg mr-3">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Crypto Performance</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Ethereum (ETH)</span>
                      <span className="text-sm text-gray-600">${ethPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Balance</span>
                      <span className="font-semibold text-gray-900">{ethBalance.toFixed(4)} ETH</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Value</span>
                      <span className="font-semibold text-blue-600">${(ethBalance * ethPrice).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Bitcoin (BTC)</span>
                      <span className="text-sm text-gray-600">${btcPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Balance</span>
                      <span className="font-semibold text-gray-900">{btcBalance.toFixed(8)} BTC</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Value</span>
                      <span className="font-semibold text-orange-600">${(btcBalance * btcPrice).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
