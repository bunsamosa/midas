import { useState, useEffect } from "react";
import { Navbar } from "components/Navbar";
import { Card, CardContent } from "components/ui/card";
import { Input } from "components/ui/input";
import { Button } from "components/ui/button";
import { Zap, DollarSign, CreditCard, TrendingUp, Calculator, ArrowRight } from "lucide-react";

interface SpendingOption {
    name: string;
    interestRate: number;
    creditScoreEffect: string;
    duration: number;
    totalAmount: number;
    description: string;
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
            totalAmount: amount * (1 + 0.189),
            description: "Quick access to funds with higher interest rates"
        };

        const bankLoanOption: SpendingOption = {
            name: "Bank Loan",
            interestRate: 9.5,
            creditScoreEffect: "Slightly Negative",
            duration: 24,
            totalAmount: amount * (1 + (0.095 * 2)),
            description: "Lower interest rates with longer repayment terms"
        };

        const cryptoStakingOption: SpendingOption = {
            name: "Crypto Staking",
            interestRate: 5,
            creditScoreEffect: "Neutral",
            duration: 6,
            totalAmount: amount * (1 + (0.05 / 2)),
            description: "Earn while you spend with crypto staking rewards"
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
        if (effect.includes("Negative")) return "text-red-600";
        if (effect === "Neutral") return "text-blue-600";
        return "text-green-600";
    };

    const getCreditScoreEffectBg = (effect: string) => {
        if (effect.includes("Negative")) return "bg-red-50 border-red-200";
        if (effect === "Neutral") return "bg-blue-50 border-blue-200";
        return "bg-green-50 border-green-200";
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            
            {/* Header Section */}
            <div className="py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Spending Power Analysis
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Optimize your financing options and analyze the best ways to access your spending power
                        </p>
                    </div>

                    {/* Financial Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <Card className="border border-gray-200 bg-white">
                            <CardContent className="p-6 text-center">
                                <div className="mx-auto bg-green-500 p-3 rounded-lg w-fit mb-4">
                                    <DollarSign className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Bank Balance</h3>
                                <p className="text-2xl font-bold text-green-600">${bankBalance.toFixed(2)}</p>
                            </CardContent>
                        </Card>
                        
                        <Card className="border border-gray-200 bg-white">
                            <CardContent className="p-6 text-center">
                                <div className="mx-auto bg-red-500 p-3 rounded-lg w-fit mb-4">
                                    <CreditCard className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Credit Card Debt</h3>
                                <p className="text-2xl font-bold text-red-600">${creditCardDebt.toFixed(2)}</p>
                            </CardContent>
                        </Card>
                        
                        <Card className="border border-gray-200 bg-white">
                            <CardContent className="p-6 text-center">
                                <div className="mx-auto bg-blue-500 p-3 rounded-lg w-fit mb-4">
                                    <TrendingUp className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Liquidity</h3>
                                <p className="text-2xl font-bold text-blue-600">${availableLiquidity.toFixed(2)}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Calculator Form */}
                    <div className="max-w-2xl mx-auto mb-12">
                        <Card className="border border-gray-200 bg-white">
                            <CardContent className="p-8">
                                <div className="text-center mb-6">
                                    <div className="mx-auto bg-gray-900 p-3 rounded-lg w-fit mb-4">
                                        <Calculator className="h-6 w-6 text-white" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Calculate Financing Options</h2>
                                    <p className="text-gray-600">Enter an amount to see the best financing options available</p>
                                </div>
                                
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Input
                                            type="number"
                                            value={spendAmount}
                                            onChange={(e) => setSpendAmount(e.target.value)}
                                            placeholder="Enter amount to spend"
                                            className="flex-1"
                                        />
                                        <Button 
                                            type="submit" 
                                            className="px-6 py-2 bg-gray-900 text-white hover:bg-gray-800" 
                                            disabled={isCalculating}
                                        >
                                            {isCalculating ? "Calculating..." : "Calculate Options"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Loading State */}
                    {isCalculating && (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
                                <p className="text-gray-600">Analyzing your financing options...</p>
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {options.length > 0 && !isCalculating && (
                        <div className="space-y-8">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommended Options</h2>
                                <p className="text-gray-600">Here are the best financing options for your spending amount</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {options.map((option, index) => (
                                    <Card key={index} className="border border-gray-200 bg-white">
                                        <CardContent className="p-6">
                                            <div className="text-center mb-6">
                                                <div className={`mx-auto ${option.name === "Credit Card" ? "bg-red-500" : option.name === "Bank Loan" ? "bg-blue-500" : "bg-green-500"} p-3 rounded-lg w-fit mb-4`}>
                                                    <Zap className="h-6 w-6 text-white" />
                                                </div>
                                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{option.name}</h3>
                                                <p className="text-sm text-gray-600">{option.description}</p>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Interest Rate</span>
                                                    <span className="font-semibold text-gray-900">{option.interestRate}%</span>
                                                </div>
                                                
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Duration</span>
                                                    <span className="font-semibold text-gray-900">{option.duration} months</span>
                                                </div>
                                                
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Total Amount</span>
                                                    <span className="font-semibold text-gray-900">${option.totalAmount.toFixed(2)}</span>
                                                </div>
                                                
                                                <div className={`p-3 rounded-lg border ${getCreditScoreEffectBg(option.creditScoreEffect)}`}>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Credit Impact</span>
                                                        <span className={`font-semibold ${getCreditScoreEffectColor(option.creditScoreEffect)}`}>
                                                            {option.creditScoreEffect}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {option.name === "Crypto Staking" && (
                                                    <Button className="w-full bg-gray-900 text-white hover:bg-gray-800 mt-4">
                                                        <ArrowRight className="h-4 w-4 mr-2" />
                                                        Execute Strategy
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
