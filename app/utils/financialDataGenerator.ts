import { addMonths, format } from 'date-fns';

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

export function generateFinancialData(): {
  bankAccounts: Record<string, number>;
  totalBankBalance: number;
  creditCards: Record<string, number>;
  totalCardBalance: number;
  financialData: FinancialData;
} {
  const totalBankBalance = Math.floor(Math.random() * (3000 - 2000 + 1)) + 2000;
  const chaseBalance = Math.floor(Math.random() * (totalBankBalance - 100)) + 100;
  const boaBalance = totalBankBalance - chaseBalance;

  const bankAccounts = {
    "Chase Bank Co.": chaseBalance,
    "Bank of America": boaBalance
  };

  let creditCards: Record<string, number>;
  let totalCardBalance: number;

  if (Math.random() < 0.5) {
    totalCardBalance = totalBankBalance - (Math.floor(Math.random() * (750 - 500 + 1)) + 500);
    creditCards = {
      "American Express": totalCardBalance
    };
  } else {
    totalCardBalance = totalBankBalance + (Math.floor(Math.random() * (1500 - 1000 + 1)) + 1000);
    const amexBalance = Math.floor(Math.random() * (totalCardBalance - 100)) + 100;
    const chaseBalance = totalCardBalance - amexBalance;
    creditCards = {
      "American Express": amexBalance,
      "Chase Freedom Flex": chaseBalance
    };
  }

  const dueDate = format(addMonths(new Date(), Math.floor(Math.random() * 3) + 1), 'yyyy-MM-dd');
  const totalCreditLimit = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
  const interestRate = (Math.random() * (30 - 20) + 20).toFixed(2);
  const creditRating = totalBankBalance > totalCardBalance ?
    Math.floor(Math.random() * (850 - 700 + 1)) + 700 :
    Math.floor(Math.random() * (699 - 550 + 1)) + 550;

  const creditCardBalanceHistory = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * (totalCreditLimit - 1000 + 1)) + 1000
  );

  const onTimePayments = Math.floor(Math.random() * 6) + 1;
  const latePayments = 6 - onTimePayments;

  const creditScoreHistory = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * (850 - 550 + 1)) + 550
  );

  const suggestedBudget = Math.floor(totalBankBalance * 0.8);

  const financialData: FinancialData = {
    dueDate,
    totalCreditLimit,
    interestRate: parseFloat(interestRate),
    creditRating,
    creditCardBalanceHistory,
    onTimePayments,
    latePayments,
    creditScoreHistory,
    suggestedBudget,
  };

  return {
    bankAccounts,
    totalBankBalance,
    creditCards,
    totalCardBalance,
    financialData,
  };
}
