// SPDX-License-Identifier: MIT

pragma solidity >=0.8.13 <0.9.0;

import "@fhenixprotocol/contracts/FHE.sol";
import {Permissioned, Permission} from "@fhenixprotocol/contracts/access/Permissioned.sol";

interface IMidas {
    function calculateTotalAssets() external view returns (euint32);
    function getTotalCardBalance() external view returns (euint32);
}

contract SpendingPowerAgent is Permissioned {
    IMidas public midasContract;

    struct SpendingOption {
        string name;
        euint32 interestRate;
        string creditScoreEffect;
        euint32 duration;
        euint32 totalAmount;
    }

    constructor(address _midasContractAddress) {
        midasContract = IMidas(_midasContractAddress);
    }

    function calculateAvailableLiquidity() public view returns (euint32) {
        euint32 totalAssets = midasContract.calculateTotalAssets();
        euint32 totalCardBalance = midasContract.getTotalCardBalance();
        return totalAssets - totalCardBalance;
    }

    function generateSpendingOptions(inEuint32 calldata encryptedAmount) public view returns (SpendingOption[3] memory) {
        euint32 amount = FHE.asEuint32(encryptedAmount);

        SpendingOption[3] memory options;

        // Credit Card Option
        options[0] = SpendingOption({
            name: "Credit Card",
            interestRate: FHE.asEuint32(1890), // 18.90% * 100 for precision
            creditScoreEffect: "Negative",
            duration: FHE.asEuint32(12),
            totalAmount: amount + FHE.mul(amount, FHE.asEuint32(189)) / FHE.asEuint32(1000)
        });

        // Bank Loan Option
        options[1] = SpendingOption({
            name: "Bank Loan",
            interestRate: FHE.asEuint32(950), // 9.50% * 100 for precision
            creditScoreEffect: "Slightly Negative",
            duration: FHE.asEuint32(24),
            totalAmount: amount + FHE.mul(amount, FHE.asEuint32(190)) / FHE.asEuint32(1000)
        });

        // Crypto Staking Option
        options[2] = SpendingOption({
            name: "Crypto Staking",
            interestRate: FHE.asEuint32(500), // 5.00% * 100 for precision
            creditScoreEffect: "Neutral",
            duration: FHE.asEuint32(6),
            totalAmount: amount + FHE.mul(amount, FHE.asEuint32(25)) / FHE.asEuint32(1000)
        });

        return options;
    }

    function executeCryptoLending(inEuint32 calldata encryptedAmount) public {
        euint32 amount = FHE.asEuint32(encryptedAmount);
        euint32 availableLiquidity = calculateAvailableLiquidity();

        require(FHE.lte(amount, availableLiquidity), "Insufficient liquidity for crypto lending");

        // Here you would implement the actual crypto lending logic
        // For example, interacting with a DeFi protocol or updating internal state

        // For demonstration, we'll just emit an event
        emit CryptoLendingExecuted(msg.sender, FHE.decrypt(amount));
    }

    // Event to log crypto lending execution
    event CryptoLendingExecuted(address indexed user, uint256 amount);

    // Function to get decrypted spending options (only callable by the user)
    function getDecryptedSpendingOptions(inEuint32 calldata encryptedAmount, Permission memory permission) public view onlySender(permission) returns (SpendingOption[3] memory) {
        SpendingOption[3] memory encryptedOptions = generateSpendingOptions(encryptedAmount);
        SpendingOption[3] memory decryptedOptions;

        for (uint i = 0; i < 3; i++) {
            decryptedOptions[i] = SpendingOption({
                name: encryptedOptions[i].name,
                interestRate: FHE.asEuint32(FHE.decrypt(encryptedOptions[i].interestRate)),
                creditScoreEffect: encryptedOptions[i].creditScoreEffect,
                duration: FHE.asEuint32(FHE.decrypt(encryptedOptions[i].duration)),
                totalAmount: FHE.asEuint32(FHE.decrypt(encryptedOptions[i].totalAmount))
            });
        }

        return decryptedOptions;
    }
}
