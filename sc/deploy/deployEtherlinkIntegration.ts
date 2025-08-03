import { ethers } from "hardhat";
import { verify } from "../utils/verify";

async function main() {
  console.log("🚀 Deploying Etherlink + 1inch Fusion+ Integration...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy Price Oracle first
  console.log("\n📊 Deploying EtherlinkPriceOracle...");
  const EtherlinkPriceOracle = await ethers.getContractFactory("EtherlinkPriceOracle");
  const priceOracle = await EtherlinkPriceOracle.deploy();
  await priceOracle.waitForDeployment();
  const priceOracleAddress = await priceOracle.getAddress();
  console.log(`✅ EtherlinkPriceOracle deployed to: ${priceOracleAddress}`);

  // Deploy Bridge contract
  console.log("\n🌉 Deploying EtherlinkBridge...");
  const EtherlinkBridge = await ethers.getContractFactory("EtherlinkBridge");
  const bridge = await EtherlinkBridge.deploy(ethers.ZeroAddress); // Placeholder fusion router
  await bridge.waitForDeployment();
  const bridgeAddress = await bridge.getAddress();
  console.log(`✅ EtherlinkBridge deployed to: ${bridgeAddress}`);

  // Deploy Fusion Router
  console.log("\n🔄 Deploying EtherlinkFusionRouter...");
  const EtherlinkFusionRouter = await ethers.getContractFactory("EtherlinkFusionRouter");
  const fusionRouter = await EtherlinkFusionRouter.deploy(
    bridgeAddress,
    priceOracleAddress,
    ethers.ZeroAddress // Placeholder fusion protocol
  );
  await fusionRouter.waitForDeployment();
  const fusionRouterAddress = await fusionRouter.getAddress();
  console.log(`✅ EtherlinkFusionRouter deployed to: ${fusionRouterAddress}`);

  // Update bridge with fusion router address
  console.log("\n🔗 Updating bridge with fusion router...");
  const updateTx = await bridge.updateFusionRouter(fusionRouterAddress);
  await updateTx.wait();
  console.log("✅ Bridge updated with fusion router address");

  // Setup price oracles for common tokens
  console.log("\n💰 Setting up price oracles...");
  const commonTokens = [
    {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
      name: "USDC"
    },
    {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
      name: "USDT"
    },
    {
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
      name: "DAI"
    },
    {
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
      name: "WETH"
    }
  ];

  for (const token of commonTokens) {
    // Add oracle for Ethereum mainnet
    const addOracleTx = await priceOracle.addOracle(
      token.address,
      deployer.address, // Using deployer as oracle for demo
      1, // Ethereum mainnet
      3600 // 1 hour heartbeat
    );
    await addOracleTx.wait();
    console.log(`✅ Added oracle for ${token.name} on Ethereum`);

    // Add oracle for Etherlink
    const addEtherlinkOracleTx = await priceOracle.addOracle(
      token.address,
      deployer.address, // Using deployer as oracle for demo
      1284, // Etherlink testnet
      3600 // 1 hour heartbeat
    );
    await addEtherlinkOracleTx.wait();
    console.log(`✅ Added oracle for ${token.name} on Etherlink`);
  }

  // Setup initial prices for demo
  console.log("\n📈 Setting up initial prices...");
  const initialPrices = [
    { token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", price: 100000000 }, // USDC $1.00
    { token: "0xdAC17F958D2ee523a2206206994597C13D831ec7", price: 100000000 }, // USDT $1.00
    { token: "0x6B175474E89094C44Da98b954EedeAC495271d0F", price: 100000000 }, // DAI $1.00
    { token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", price: 3200000000000 } // WETH $3200
  ];

  for (const priceData of initialPrices) {
    // Set price on Ethereum
    const setEthPriceTx = await priceOracle.emergencyUpdatePrice(
      priceData.token,
      priceData.price,
      1 // Ethereum
    );
    await setEthPriceTx.wait();

    // Set price on Etherlink (slightly different for demo)
    const etherlinkPrice = priceData.token === "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" 
      ? priceData.price + 50000000000 // WETH slightly higher on Etherlink
      : priceData.price;
    
    const setEtherlinkPriceTx = await priceOracle.emergencyUpdatePrice(
      priceData.token,
      etherlinkPrice,
      1284 // Etherlink
    );
    await setEtherlinkPriceTx.wait();
    console.log(`✅ Set initial prices for token ${priceData.token}`);
  }

  // Wait for confirmations
  console.log("\n⏳ Waiting for confirmations...");
  await priceOracle.deploymentTransaction()?.wait(5);
  await bridge.deploymentTransaction()?.wait(5);
  await fusionRouter.deploymentTransaction()?.wait(5);

  // Verify contracts on Etherscan (if not on local network)
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 31337n) { // Not localhost
    console.log("\n🔍 Verifying contracts on Etherscan...");
    
    try {
      await verify(priceOracleAddress, []);
      console.log("✅ EtherlinkPriceOracle verified");
    } catch (error) {
      console.log("❌ Failed to verify EtherlinkPriceOracle:", error);
    }

    try {
      await verify(bridgeAddress, [ethers.ZeroAddress]);
      console.log("✅ EtherlinkBridge verified");
    } catch (error) {
      console.log("❌ Failed to verify EtherlinkBridge:", error);
    }

    try {
      await verify(fusionRouterAddress, [bridgeAddress, priceOracleAddress, ethers.ZeroAddress]);
      console.log("✅ EtherlinkFusionRouter verified");
    } catch (error) {
      console.log("❌ Failed to verify EtherlinkFusionRouter:", error);
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    contracts: {
      priceOracle: priceOracleAddress,
      bridge: bridgeAddress,
      fusionRouter: fusionRouterAddress
    },
    timestamp: new Date().toISOString(),
    etherlinkChainId: 1284,
    ethereumChainId: 1
  };

  console.log("\n🎉 Deployment Summary:");
  console.log("================================");
  console.log(`Network: ${network.name} (${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`EtherlinkPriceOracle: ${priceOracleAddress}`);
  console.log(`EtherlinkBridge: ${bridgeAddress}`);
  console.log(`EtherlinkFusionRouter: ${fusionRouterAddress}`);
  console.log("================================");

  // Save to file
  const fs = require('fs');
  const path = require('path');
  const deploymentPath = path.join(__dirname, '../deployments/etherlink-integration.json');
  
  // Ensure directory exists
  const dir = path.dirname(deploymentPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📄 Deployment info saved to: ${deploymentPath}`);

  console.log("\n🚀 Etherlink + 1inch Fusion+ Integration deployed successfully!");
  console.log("\n📋 Next Steps:");
  console.log("1. Add liquidity to the bridge contracts");
  console.log("2. Configure 1inch Fusion+ protocol addresses");
  console.log("3. Set up price oracle feeds");
  console.log("4. Test cross-chain swaps");
  console.log("5. Integrate with frontend application");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 