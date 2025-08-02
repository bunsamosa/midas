import { useState, useEffect } from "react";
import { Navbar } from "components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { ethers } from "ethers";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { getWeb3Provider } from '@dynamic-labs/ethers-v6';

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
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Your Net Worth</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Bank Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-green-600">${bankBalance.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Credit Card Debt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-red-600">${creditCardDebt.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Crypto Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-blue-600">ETH Price:</span>
                  <span className="text-lg">${ethPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-blue-600">ETH Balance:</span>
                  <span className="text-lg">{ethBalance.toFixed(4)} (${(ethBalance * ethPrice).toFixed(2)})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-orange-500">BTC Price:</span>
                  <span className="text-lg">${btcPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-orange-500">BTC Balance:</span>
                  <span className="text-lg">{btcBalance.toFixed(8)} (${(btcBalance * btcPrice).toFixed(2)})</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xl font-semibold text-purple-600">Total: ${totalCryptoHolding.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Total Net Worth</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">${totalNetWorth.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
