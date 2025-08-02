// -------------------- contract description -----------------------
// what this version of the smart contract is going to achieve:
// 1. Get financial data (CC history, bank balance) via Plaid API
// 2. Financial decision-making logic
// 3. Interact with lending pools like Aave
// 4. Repayment logic
// 5. Privacy-preserving and secure computation features
// ----------------------------------------------------------------

use fhenix::{Contract, Decrypt, Encrypt, CallResult};
use fhenix::privacy::{Private, Secret}; 
use fhenix::external::{HttpRequest, HttpResponse};

// Define the structure for user data.
#[derive(Encrypt, Decrypt)]
pub struct FinancialData {
    credit_history: Vec<Transaction>, // CC transaction history
    bank_balance: u128,               // Bank balance
}

#[derive(Encrypt, Decrypt)]
pub struct LoanRequest {
    amount: u128,
    interest_rate: f64,
    duration: u32, // in days
}

#[derive(Encrypt, Decrypt)]
pub struct Repayment {
    amount_due: u128,
    due_date: u64, // Timestamp for due date
}

#[derive(Encrypt, Decrypt)]
pub struct Transaction {
    amount: u128,
    date: u64, // Timestamp
    description: String,
}

// Contract for Financial Management
#[contract]
pub struct FinancialManager {
    // Private field for storing user financial data
    user_data: Private<FinancialData>,

    // Secret field for storing loan requests
    loan_requests: Secret<Vec<LoanRequest>>,

    // Secret for repayments
    repayments: Secret<Vec<Repayment>>,
}

#[contract_methods]
impl FinancialManager {
    // Initialize the contract
    pub fn new() -> Self {
        Self {
            user_data: Private::default(),
            loan_requests: Secret::default(),
            repayments: Secret::default(),
        }
    }

    // Fetch financial data from Plaid
    pub fn fetch_financial_data(&mut self, plaid_token: String) -> CallResult<()> {
        let response: HttpResponse = HttpRequest::new("https://plaid.com/api/fetch-data")
            .with_header("Authorization", &plaid_token)
            .send()?;
        
        let data: FinancialData = response.json()?;
        self.user_data = Private::new(data);
        Ok(())
    }

    // View summary of transactions
    pub fn view_transaction_summary(&self) -> CallResult<String> {
        let user_data = self.user_data.get()?; 
        
        let transactions_summary: String = user_data.credit_history.iter()
            .map(|txn| format!("Date: {}, Amount: {}, Description: {}",
                                txn.date, txn.amount, txn.description))
            .collect::<Vec<_>>()
            .join("\n");
        
        Ok(transactions_summary)
    }

    // View current bank balance
    pub fn view_bank_balance(&self) -> CallResult<String> {
        let user_data = self.user_data.get()?;
        Ok(format!("Current Bank Balance: {}", user_data.bank_balance))
    }

    // Analyze financials to suggest actions
    pub fn analyze_financials(&self, purchase_amount: u128) -> CallResult<String> {
        let user_data = self.user_data.get()?;
        
        if user_data.bank_balance >= purchase_amount {
            return Ok("You can afford this purchase!".to_string());
        } else {
            return Ok("Insufficient funds. Consider applying for a loan.".to_string());
        }
    }

    // Request a loan from Aave
    pub fn request_loan(&mut self, amount: u128, interest_rate: f64, duration: u32) -> CallResult<String> {
        let loan_request = LoanRequest {
            amount,
            interest_rate,
            duration,
        };

        self.loan_requests.push(loan_request);

        let response: HttpResponse = HttpRequest::new("https://aave.com/api/request-loan")
            .with_body(format!("{{\"amount\": {}, \"interest_rate\": {}, \"duration\": {}}}", amount, interest_rate, duration))
            .send()?;

        if response.status_code == 200 {
            return Ok("Loan requested successfully!".to_string());
        } else {
            return Ok("Loan request failed.".to_string());
        }
    }

    // Track repayments
    pub fn track_repayments(&mut self) -> CallResult<String> {
        let repayments = self.repayments.get()?;

        for repayment in repayments {
            if repayment.amount_due > 0 {
                return Ok(format!(
                    "Payment due: {} before {}",
                    repayment.amount_due,
                    repayment.due_date
                ));
            }
        }

        Ok("No repayments due.".to_string())
    }

    // View user's loan status
    pub fn view_loan_status(&self) -> CallResult<String> {
        let loan_requests = self.loan_requests.get()?;

        let loan_summary: String = loan_requests.iter()
            .map(|loan| format!(
                "Loan Amount: {}, Interest Rate: {}, Duration: {} days",
                loan.amount, loan.interest_rate, loan.duration
            ))
            .collect::<Vec<_>>()
            .join("\n");

        Ok(loan_summary)
    }

    // View financial status summary
    pub fn view_financial_status(&self) -> CallResult<String> {
        let user_data = self.user_data.get()?;
        let loan_requests = self.loan_requests.get()?;
        let repayments = self.repayments.get()?;

        let summary = format!(
            "Bank Balance: {}\nCredit Transactions: {}\nOutstanding Loans: {}\nRepayments Due: {}",
            user_data.bank_balance,
            user_data.credit_history.len(),
            loan_requests.len(),
            repayments.len(),
        );

        Ok(summary)
    }
}
