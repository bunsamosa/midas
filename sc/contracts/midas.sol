// SPDX-License-Identifier: MIT

pragma solidity >=0.8.13 <0.9.0;

import "@fhenixprotocol/contracts/FHE.sol";
import {Permissioned, Permission} from "@fhenixprotocol/contracts/access/Permissioned.sol";

contract Midas is Permissioned {
    struct UserData {
        euint32 bankBalance;
        euint32 creditCardBalance;
        euint32 dueDate;
    }

    mapping(address => UserData) private userDataMap;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function updateBankBalance(inEuint32 calldata encryptedValue) public {
        euint32 value = FHE.asEuint32(encryptedValue);
        userDataMap[msg.sender].bankBalance = value;
    }

    function updateCreditCardBalance(inEuint32 calldata encryptedValue) public {
        euint32 value = FHE.asEuint32(encryptedValue);
        userDataMap[msg.sender].creditCardBalance = value;
    }

    function updateDueDate(inEuint32 calldata encryptedValue) public {
        euint32 value = FHE.asEuint32(encryptedValue);
        userDataMap[msg.sender].dueDate = value;
    }

    function getBankBalance(Permission memory permission) public view onlySender(permission) returns (uint256) {
        return FHE.decrypt(userDataMap[msg.sender].bankBalance);
    }

    function getCreditCardBalance(Permission memory permission) public view onlySender(permission) returns (uint256) {
        return FHE.decrypt(userDataMap[msg.sender].creditCardBalance);
    }

    function getDueDate(Permission memory permission) public view onlySender(permission) returns (uint256) {
        return FHE.decrypt(userDataMap[msg.sender].dueDate);
    }
}
