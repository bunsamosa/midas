import { ethers } from 'ethers';
import { http } from 'viem';
import { Account, privateKeyToAccount, Address } from 'viem/accounts';
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";

// Configuration
const privateKey: Address = `0x${process.env.WALLET_PRIVATE_KEY}`;
const account: Account = privateKeyToAccount(privateKey);

const config: StoryConfig = {
  account: account,
  transport: http(process.env.RPC_PROVIDER_URL),
  chainId: 'iliad'
};

const client = StoryClient.newClient(config);

const IP_IDS = {
  spendPowerAgent: "0x408176D5FDE0a59bBbebF638615f632323b97222",
  networthAgent: "0x7fd5a57439785cfa40b4C6713b250c05B17871f5"
};

// ABI for ERC721 balanceOf function
const ERC721_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
];

async function mintTokensToUser(userAddress: string) {
  try {
    // Mint license token
    const licenseResponse = await client.license.mintLicenseTokens({
      licenseTermsId: "1",
      licensorIpId: IP_IDS.spendPowerAgent,
      receiver: userAddress,
      amount: 1,
      txOptions: { waitForTransaction: true }
    });
    console.log(`License Token minted at transaction hash ${licenseResponse.txHash}, License IDs: ${licenseResponse.licenseTokenIds}`);

    // Mint IP token (assuming there's a similar function for IP tokens)
    // This is a placeholder as the actual method may differ
    const ipResponse = await client.ip.mintIpToken({
      ipId: IP_IDS.networthAgent,
      receiver: userAddress,
      amount: 1,
      txOptions: { waitForTransaction: true }
    });
    console.log(`IP Token minted at transaction hash ${ipResponse.txHash}, IP Token ID: ${ipResponse.ipTokenId}`);

    return {
      licenseTokenId: licenseResponse.licenseTokenIds[0],
      ipTokenId: ipResponse.ipTokenId
    };
  } catch (error) {
    console.error("Error minting tokens:", error);
    throw error;
  }
}

export async function ownsStoryProtocolTokens(userAddress: string): Promise<boolean> {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_PROVIDER_URL);

  // Assuming the license and IP token addresses are available from the client
  const licenseTokenAddress = await client.license.getLicenseTokenAddress();
  const ipTokenAddress = await client.ip.getIpTokenAddress();

  const licenseToken = new ethers.Contract(licenseTokenAddress, ERC721_ABI, provider);
  const ipToken = new ethers.Contract(ipTokenAddress, ERC721_ABI, provider);

  try {
    const [licenseBalance, ipBalance] = await Promise.all([
      licenseToken.balanceOf(userAddress),
      ipToken.balanceOf(userAddress),
    ]);

    return licenseBalance.gt(0) && ipBalance.gt(0);
  } catch (error) {
    console.error('Error checking Story Protocol token ownership:', error);
    return false;
  }
}

export async function validateAndMintIfNeeded(userAddress: string): Promise<boolean> {
  const ownsTokens = await ownsStoryProtocolTokens(userAddress);

  if (!ownsTokens) {
    console.log("User does not own required tokens. Minting...");
    try {
      await mintTokensToUser(userAddress);
      return true;
    } catch (error) {
      console.error("Failed to mint tokens:", error);
      return false;
    }
  }

  return true;
}

// Example usage:
// const userAddress = '0x...';
// const isValid = await validateAndMintIfNeeded(userAddress);
// console.log('User has required tokens:', isValid);
