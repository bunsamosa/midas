// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {NetworthAgent} from "../src/NetworthAgent.sol";

contract AgentScript is Script {
    NetworthAgent public networthAgent;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        networthAgent = new NetworthAgent("Networth Agent", "NWA");

        vm.stopBroadcast();
    }
}
