// SPDX-License-Identifier: MIT

pragma solidity >=0.8.13 <0.9.0;

import "@fhenixprotocol/contracts/FHE.sol";
import {Permissioned, Permission} from "@fhenixprotocol/contracts/access/Permissioned.sol";

contract Midas is Permissioned {
    struct FinancialData {
        euint32 totalBankBalance;
        euint32 totalCardBalance;
        euint32 totalCreditLimit;
        euint32 interestRate;
        euint32 creditRating;
        euint32 onTimePayments;
        euint32 latePayments;
        euint32 suggestedBudget;
        euint32 dueDate;
    }

    mapping(address => FinancialData) private userFinancialData;
    mapping(address => mapping(string => euint32)) private userBankAccounts;
    mapping(address => mapping(string => euint32)) private userCreditCards;
    mapping(address => euint32[]) private userCreditCardBalanceHistory;
    mapping(address => euint32[]) private userCreditScoreHistory;

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    // Update functions
    function updateTotalBankBalance(inEuint32 calldata encryptedValue) public {
        userFinancialData[msg.sender].totalBankBalance = FHE.asEuint32(encryptedValue);
    }

    function updateTotalCardBalance(inEuint32 calldata encryptedValue) public {
        userFinancialData[msg.sender].totalCardBalance = FHE.asEuint32(encryptedValue);
    }

    function updateBankAccount(string memory bankName, inEuint32 calldata encryptedValue) public {
        userBankAccounts[msg.sender][bankName] = FHE.asEuint32(encryptedValue);
    }

    function updateCreditCard(string memory cardName, inEuint32 calldata encryptedValue) public {
        userCreditCards[msg.sender][cardName] = FHE.asEuint32(encryptedValue);
    }

    function updateFinancialData(
        inEuint32 calldata totalCreditLimit,
        inEuint32 calldata interestRate,
        inEuint32 calldata creditRating,
        inEuint32 calldata onTimePayments,
        inEuint32 calldata latePayments,
        inEuint32 calldata suggestedBudget,
        inEuint32 calldata dueDate
    ) public {
        FinancialData storage data = userFinancialData[msg.sender];
        data.totalCreditLimit = FHE.asEuint32(totalCreditLimit);
        data.interestRate = FHE.asEuint32(interestRate);
        data.creditRating = FHE.asEuint32(creditRating);
        data.onTimePayments = FHE.asEuint32(onTimePayments);
        data.latePayments = FHE.asEuint32(latePayments);
        data.suggestedBudget = FHE.asEuint32(suggestedBudget);
        data.dueDate = FHE.asEuint32(dueDate);
    }

    function addCreditCardBalanceHistory(inEuint32 calldata encryptedValue) public {
        userCreditCardBalanceHistory[msg.sender].push(FHE.asEuint32(encryptedValue));
    }

    function addCreditScoreHistory(inEuint32 calldata encryptedValue) public {
        userCreditScoreHistory[msg.sender].push(FHE.asEuint32(encryptedValue));
    }

    // Getter functions (with permission checks)
    function getTotalBankBalance(Permission memory permission) public view onlySender(permission) returns (uint256) {
        return FHE.decrypt(userFinancialData[msg.sender].totalBankBalance);
    }

    function getTotalCardBalance(Permission memory permission) public view onlySender(permission) returns (uint256) {
        return FHE.decrypt(userFinancialData[msg.sender].totalCardBalance);
    }

    // Encrypted computations
    function calculateTotalAssets() public view returns (euint32) {
        return userFinancialData[msg.sender].totalBankBalance + userFinancialData[msg.sender].totalCardBalance;
    }

    function calculateDebtToIncomeRatio() public view returns (euint32) {
        euint32 totalAssets = calculateTotalAssets();
        return FHE.div(userFinancialData[msg.sender].totalCardBalance, totalAssets);
    }

    function isOverCreditLimit() public view returns (ebool) {
        return userFinancialData[msg.sender].totalCardBalance > userFinancialData[msg.sender].totalCreditLimit;
    }

    function calculateCreditUtilization() public view returns (euint32) {
        return FHE.div(
            userFinancialData[msg.sender].totalCardBalance,
            userFinancialData[msg.sender].totalCreditLimit
        ) * FHE.asEuint32(100);
    }

    // Function to get encrypted results (to be decrypted client-side)
    function getEncryptedResults() public view returns (euint32, euint32, ebool, euint32) {
        return (
            calculateTotalAssets(),
            calculateDebtToIncomeRatio(),
            isOverCreditLimit(),
            calculateCreditUtilization()
        );
    }
}
