import { ethers } from "hardhat";
import { verify } from "../utils/verify";

async function main() {
  console.log("🚀 Deploying Cross-Chain Swap Contracts...");

  // Get the contract factory
  const CrossChainSwap = await ethers.getContractFactory("CrossChainSwap");
  const LimitOrderProtocol = await ethers.getContractFactory("LimitOrderProtocol");

  // Deploy CrossChainSwap
  console.log("📦 Deploying CrossChainSwap...");
  const crossChainSwap = await CrossChainSwap.deploy();
  await crossChainSwap.waitForDeployment();
  const crossChainSwapAddress = await crossChainSwap.getAddress();
  console.log(`✅ CrossChainSwap deployed to: ${crossChainSwapAddress}`);

  // Deploy LimitOrderProtocol
  console.log("📦 Deploying LimitOrderProtocol...");
  const limitOrderProtocol = await LimitOrderProtocol.deploy();
  await limitOrderProtocol.waitForDeployment();
  const limitOrderProtocolAddress = await limitOrderProtocol.getAddress();
  console.log(`✅ LimitOrderProtocol deployed to: ${limitOrderProtocolAddress}`);

  // Wait for a few block confirmations
  console.log("⏳ Waiting for confirmations...");
  await crossChainSwap.deploymentTransaction()?.wait(5);
  await limitOrderProtocol.deploymentTransaction()?.wait(5);

  // Verify contracts on Etherscan (if not on local network)
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 31337) { // Not local network
    console.log("🔍 Verifying contracts on Etherscan...");
    
    try {
      await verify(crossChainSwapAddress, []);
      console.log("✅ CrossChainSwap verified on Etherscan");
    } catch (error) {
      console.log("❌ Failed to verify CrossChainSwap:", error);
    }

    try {
      await verify(limitOrderProtocolAddress, []);
      console.log("✅ LimitOrderProtocol verified on Etherscan");
    } catch (error) {
      console.log("❌ Failed to verify LimitOrderProtocol:", error);
    }
  }

  // Log deployment summary
  console.log("\n🎉 Deployment Summary:");
  console.log("================================");
  console.log(`CrossChainSwap: ${crossChainSwapAddress}`);
  console.log(`LimitOrderProtocol: ${limitOrderProtocolAddress}`);
  console.log("================================");

  // Save deployment addresses to a file
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    contracts: {
      CrossChainSwap: crossChainSwapAddress,
      LimitOrderProtocol: limitOrderProtocolAddress
    },
    deploymentTime: new Date().toISOString()
  };

  console.log("\n📝 Deployment info saved to deployment-info.json");
  
  return {
    crossChainSwap: crossChainSwapAddress,
    limitOrderProtocol: limitOrderProtocolAddress
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 