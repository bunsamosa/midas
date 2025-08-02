import { useState, useEffect } from "react";
import { Navbar } from "components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Input } from "components/ui/input";
import { Button } from "components/ui/button";

interface SpendingOption {
    name: string;
    interestRate: number;
    creditScoreEffect: string;
    duration: number;
    totalAmount: number;
}

export default function SpendingPowerPage() {
    const [bankBalance, setBankBalance] = useState(0);
    const [creditCardDebt, setCreditCardDebt] = useState(0);
    const [spendAmount, setSpendAmount] = useState("");
    const [options, setOptions] = useState<SpendingOption[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        // Fetch data from localStorage
        const totalBankBalance = parseFloat(localStorage.getItem('totalBankBalance') || '0');
        const totalCreditCardDebt = parseFloat(localStorage.getItem('totalCreditCardDebt') || '0');

        setBankBalance(totalBankBalance);
        setCreditCardDebt(totalCreditCardDebt);
    }, []);

    const availableLiquidity = bankBalance - creditCardDebt;

    const generateOptions = (amount: number) => {
        const creditCardOption: SpendingOption = {
            name: "Credit Card",
            interestRate: 18.9,
            creditScoreEffect: "Negative",
            duration: 12,
            totalAmount: amount * (1 + 0.189)
        };

        const bankLoanOption: SpendingOption = {
            name: "Bank Loan",
            interestRate: 9.5,
            creditScoreEffect: "Slightly Negative",
            duration: 24,
            totalAmount: amount * (1 + (0.095 * 2))
        };

        const cryptoStakingOption: SpendingOption = {
            name: "Crypto Staking",
            interestRate: 5,
            creditScoreEffect: "Neutral",
            duration: 6,
            totalAmount: amount * (1 + (0.05 / 2))
        };

        setOptions([creditCardOption, bankLoanOption, cryptoStakingOption]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(spendAmount);
        if (!isNaN(amount) && amount > 0) {
            setIsCalculating(true);
            // Simulate a delay for calculation
            setTimeout(() => {
                generateOptions(amount);
                setIsCalculating(false);
            }, 2000); // 2 seconds delay
        }
    };

    const getCreditScoreEffectColor = (effect: string) => {
        if (effect.includes("Negative")) return "text-red-500";
        if (effect === "Neutral") return "text-blue-500";
        return "text-green-500";
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6 text-center">Your Spending Power</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                            <CardTitle>Available Liquidity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold text-blue-600">${availableLiquidity.toFixed(2)}</p>
                        </CardContent>
                    </Card>
                </div>

                <form onSubmit={handleSubmit} className="mb-6">
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
                        <Input
                            type="number"
                            value={spendAmount}
                            onChange={(e) => setSpendAmount(e.target.value)}
                            placeholder="Enter amount to spend"
                            className="w-full sm:w-64 border-2 border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <Button type="submit" className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" disabled={isCalculating}>
                            {isCalculating ? "Calculating..." : "Calculate Options"}
                        </Button>
                    </div>
                </form>

                {isCalculating && (
                    <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                    </div>
                )}

                {options.length > 0 && !isCalculating && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {options.map((option, index) => (
                            <Card key={index} className="bg-white shadow-lg rounded-lg overflow-hidden">
                                <CardHeader className="bg-gray-100 border-b border-gray-200">
                                    <CardTitle className="text-xl font-bold text-gray-800">{option.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600">Interest Rate</p>
                                        <p className="text-lg font-semibold text-gray-800">{option.interestRate}%</p>
                                    </div>
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600">Credit Score Effect</p>
                                        <p className={`text-lg font-semibold ${getCreditScoreEffectColor(option.creditScoreEffect)}`}>
                                            {option.creditScoreEffect}
                                        </p>
                                    </div>
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600">Duration</p>
                                        <p className="text-lg font-semibold text-gray-800">{option.duration} months</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Amount</p>
                                        <p className="text-lg font-semibold text-gray-800">${option.totalAmount.toFixed(2)}</p>
                                    </div>
                                    {option.name === "Crypto Staking" && (
                                        <Button
                                            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                        >
                                            Execute
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
