import { Navbar } from "components/Navbar";
import { Card, CardContent } from "components/ui/card";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useState, useEffect } from "react";
import { FinancialData } from "../utils/financialDataGenerator";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BankAccount {
  name: string;
  balance: number;
}

interface CreditCard {
  name: string;
  balance: number;
}

export default function Home() {
  const { primaryWallet } = useDynamicContext();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);

  useEffect(() => {
    // Fetch bank accounts, credit cards, and financial data from localStorage
    const storedBankAccounts = JSON.parse(localStorage.getItem('bankAccounts') || '{}');
    const storedCreditCards = JSON.parse(localStorage.getItem('creditCards') || '{}');
    const storedFinancialData = JSON.parse(localStorage.getItem('financialData') || 'null');

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
  }, []);

  const totalBankBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  const totalCreditCardBalance = creditCards.reduce((sum, card) => sum + card.balance, 0);

  const formatChartData = (data: number[]) => {
    return data.map((value, index) => ({
      month: `Month ${index + 1}`,
      value
    }));
  };

  return (
    <div className="flex flex-col min-h-screen w-full max-w-7xl mx-auto p-4">
      <Navbar />
      <main className="flex-grow mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="flex flex-col gap-8">
            {/* Bank Account Section */}
            <Card className="w-full shadow-md rounded-xl transition-all hover:shadow-xl">
              <CardContent className="flex flex-col p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <h2 className="text-2xl font-semibold mb-4">Bank Accounts</h2>
                {bankAccounts.map((account, index) => (
                  <div key={index} className="flex justify-between items-center mb-2">
                    <span>{account.name}</span>
                    <span>${account.balance.toFixed(2)}</span>
                  </div>
                ))}
                <div className="mt-4 pt-2 border-t border-white">
                  <strong>Total Balance: ${totalBankBalance.toFixed(2)}</strong>
                </div>
              </CardContent>
            </Card>

            {/* Credit Card Section */}
            <Card className="w-full shadow-md rounded-xl transition-all hover:shadow-xl">
              <CardContent className="flex flex-col p-6 bg-gradient-to-br from-red-500 to-pink-600 text-white">
                <h2 className="text-2xl font-semibold mb-4">Credit Cards</h2>
                {creditCards.map((card, index) => (
                  <div key={index} className="flex justify-between items-center mb-2">
                    <span>{card.name}</span>
                    <span>${card.balance.toFixed(2)}</span>
                  </div>
                ))}
                <div className="mt-4 pt-2 border-t border-white">
                  <strong>Total Balance: ${totalCreditCardBalance.toFixed(2)}</strong>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div>
            {financialData && (
              <Card className="w-full h-full shadow-md rounded-xl transition-all hover:shadow-xl">
                <CardContent className="flex flex-col p-6 bg-gradient-to-br from-yellow-500 to-orange-600 text-white h-full">
                  <h2 className="text-2xl font-semibold mb-4">Additional Financial Information</h2>
                  <div className="flex flex-col gap-4">
                    <p><strong>Due Date:</strong> {financialData.dueDate}</p>
                    <p><strong>Total Credit Limit:</strong> ${financialData.totalCreditLimit.toFixed(2)}</p>
                    <p><strong>Interest Rate:</strong> {financialData.interestRate.toFixed(2)}%</p>
                    <p><strong>Credit Rating:</strong> {financialData.creditRating}</p>
                    <p><strong>On-Time Payments:</strong> {financialData.onTimePayments}</p>
                    <p><strong>Late Payments:</strong> {financialData.latePayments}</p>
                    <p><strong>Suggested Budget:</strong> ${financialData.suggestedBudget.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Charts Section */}
        {financialData && (
          <div className="mt-8">
            <Card className="w-full shadow-md rounded-xl transition-all hover:shadow-xl">
              <CardContent className="flex flex-col p-6">
                <h2 className="text-2xl font-semibold mb-4">Financial History</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Credit Card Balance History</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={formatChartData(financialData.creditCardBalanceHistory)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#8884d8" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Credit Score History</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={formatChartData(financialData.creditScoreHistory)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#82ca9d" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
