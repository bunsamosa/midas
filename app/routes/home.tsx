import { Navbar } from "components/Navbar";
import { Card, CardContent } from "components/ui/card";

import { useState, useEffect } from "react";
interface FinancialData {
  dueDate: string;
  totalCreditLimit: number;
  interestRate: number;
  creditRating: number;
  creditCardBalanceHistory: number[];
  onTimePayments: number;
  latePayments: number;
  creditScoreHistory: number[];
  suggestedBudget: number;
}
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2, CreditCard, TrendingUp, Calendar, DollarSign, Percent, Award, Clock, AlertCircle } from "lucide-react";

interface BankAccount {
  name: string;
  balance: number;
}

interface CreditCard {
  name: string;
  balance: number;
}

export default function Home() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [ethBalance, setEthBalance] = useState<string | null>(null);

  useEffect(() => {
    // Fetch bank accounts, credit cards, and financial data from localStorage
    const storedBankAccounts = JSON.parse(localStorage.getItem('bankAccounts') || '{}');
    const storedCreditCards = JSON.parse(localStorage.getItem('creditCards') || '{}');
    const storedFinancialData = JSON.parse(localStorage.getItem('financialData') || 'null');
    const storedEthBalance = localStorage.getItem('ethBalance');

    const bankAccountsArray = Object.entries(storedBankAccounts).map(([name, balance]) => ({
      name,
      balance: Number(balance),
    }));

    const creditCardsArray = Object.entries(storedCreditCards).map(([name, balance]) => ({
      name,
      balance: Number(balance),
    }));

    setBankAccounts(bankAccountsArray);
    setCreditCards(creditCardsArray);
    setFinancialData(storedFinancialData);
    setEthBalance(storedEthBalance);
  }, []);

  const totalBankBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  const totalCreditCardBalance = creditCards.reduce((sum, card) => sum + card.balance, 0);
  
  // Use the same calculation as networth page
  const ethPrice = 2000; // Fallback price (same as networth page)
  const btcPrice = 30000; // Fallback price (same as networth page)
  const btcBalance = parseFloat(localStorage.getItem('btcBalance') || '0');
  const totalCryptoHolding = (parseFloat(ethBalance || '0') * ethPrice) + (btcBalance * btcPrice);
  const netWorth = totalBankBalance - totalCreditCardBalance + totalCryptoHolding;

  const formatChartData = (data: number[]) => {
    return data.map((value, index) => ({
      month: `Month ${index + 1}`,
      value
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Header Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Financial Dashboard
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your complete financial overview with real-time balances and insights
            </p>
          </div>

          {/* Net Worth Summary */}
          <div className="mb-12">
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-8 text-center">
                <div className="mx-auto bg-gray-900 p-3 rounded-lg w-fit mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Net Worth</h2>
                <p className="text-4xl font-bold text-gray-900">${netWorth.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-2">Total assets minus liabilities</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Bank Accounts */}
            <div className="lg:col-span-1">
              <Card className="border border-gray-200 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-500 p-2 rounded-lg mr-3">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Bank Accounts</h2>
                  </div>
                  {bankAccounts.length > 0 ? (
                    <>
                      {bankAccounts.map((account, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <span className="text-gray-700">{account.name}</span>
                          <span className="font-semibold text-gray-900">${account.balance.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">Total Balance</span>
                          <span className="text-lg font-bold text-blue-600">${totalBankBalance.toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No bank accounts connected</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Middle Column - Credit Cards */}
            <div className="lg:col-span-1">
              <Card className="border border-gray-200 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-red-500 p-2 rounded-lg mr-3">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Credit Cards</h2>
                  </div>
                  {creditCards.length > 0 ? (
                    <>
                      {creditCards.map((card, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <span className="text-gray-700">{card.name}</span>
                          <span className="font-semibold text-gray-900">${card.balance.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">Total Balance</span>
                          <span className="text-lg font-bold text-red-600">${totalCreditCardBalance.toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No credit cards connected</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Financial Information */}
            <div className="lg:col-span-1">
              {financialData ? (
                <Card className="border border-gray-200 bg-white h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-green-500 p-2 rounded-lg mr-3">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Financial Health</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-600">Due Date</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{financialData.dueDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-600">Credit Limit</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">${financialData.totalCreditLimit.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Percent className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-600">Interest Rate</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{financialData.interestRate.toFixed(2)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Award className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-600">Credit Rating</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{financialData.creditRating}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-600">On-Time Payments</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{financialData.onTimePayments}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-600">Late Payments</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{financialData.latePayments}</span>
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-900">Suggested Budget</span>
                          <span className="text-sm font-bold text-green-600">${financialData.suggestedBudget.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border border-gray-200 bg-white h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-gray-500 p-2 rounded-lg mr-3">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Financial Health</h2>
                    </div>
                    <p className="text-gray-500 text-center py-8">No financial data available</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {financialData && (
        <div className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Financial History</h2>
              <p className="text-lg text-gray-600">Track your financial trends over time</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border border-gray-200 bg-white">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Credit Card Balance History</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={formatChartData(financialData.creditCardBalanceHistory)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                          }} 
                        />
                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Credit Score History</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={formatChartData(financialData.creditScoreHistory)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                          }} 
                        />
                        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
