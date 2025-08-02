// SPDX-License-Identifier: MIT

pragma solidity >=0.8.13 <0.9.0;

import "@fhenixprotocol/contracts/FHE.sol";
import {Permissioned, Permission} from "@fhenixprotocol/contracts/access/Permissioned.sol";

interface IMidas {
    function calculateTotalAssets() external view returns (euint32);
    function getTotalCardBalance() external view returns (euint32);
}

interface IOracle {
    function read() external view returns (uint256 val, uint256 age);
}

contract NetWorthCalculator is Permissioned {
    IMidas public midasContract;
    IOracle public ethOracle;
    IOracle public btcOracle;

    constructor(address _midasContractAddress, address _ethOracleAddress, address _btcOracleAddress) {
        midasContract = IMidas(_midasContractAddress);
        ethOracle = IOracle(_ethOracleAddress);
        btcOracle = IOracle(_btcOracleAddress);
    }

    function calculateNetWorth(inEuint32 calldata encryptedEthBalance, inEuint32 calldata encryptedBtcBalance) public view returns (euint32) {
        euint32 ethBalance = FHE.asEuint32(encryptedEthBalance);
        euint32 btcBalance = FHE.asEuint32(encryptedBtcBalance);

        // Get crypto prices from oracles
        (uint256 ethPrice, ) = ethOracle.read();
        (uint256 btcPrice, ) = btcOracle.read();

        // Convert prices to euint32
        euint32 encryptedEthPrice = FHE.asEuint32(ethPrice);
        euint32 encryptedBtcPrice = FHE.asEuint32(btcPrice);

        // Calculate crypto holdings value
        euint32 ethValue = FHE.mul(ethBalance, encryptedEthPrice);
        euint32 btcValue = FHE.mul(btcBalance, encryptedBtcPrice);
        euint32 totalCryptoValue = ethValue + btcValue;

        // Get other financial data
        euint32 totalAssets = midasContract.calculateTotalAssets();
        euint32 creditCardBalance = midasContract.getTotalCardBalance();

        // Calculate net worth: totalAssets + totalCryptoValue - creditCardBalance
        return totalAssets + totalCryptoValue - creditCardBalance;
    }

    function getEncryptedNetWorth(inEuint32 calldata encryptedEthBalance, inEuint32 calldata encryptedBtcBalance) public view returns (euint32) {
        return calculateNetWorth(encryptedEthBalance, encryptedBtcBalance);
    }

    // Function to decrypt the net worth (only callable by the user)
    function getDecryptedNetWorth(inEuint32 calldata encryptedEthBalance, inEuint32 calldata encryptedBtcBalance, Permission memory permission) public view onlySender(permission) returns (uint256) {
        euint32 encryptedNetWorth = calculateNetWorth(encryptedEthBalance, encryptedBtcBalance);
        return FHE.decrypt(encryptedNetWorth);
    }
}
