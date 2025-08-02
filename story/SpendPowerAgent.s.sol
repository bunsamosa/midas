// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {SpendPowerAgent} from "../src/SpendPowerAgent.sol";

contract AgentScript is Script {
    SpendPowerAgent public spendPowerAgent;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        spendPowerAgent = new SpendPowerAgent("Spend Power Agent", "SPA");

        vm.stopBroadcast();
    }
}
