import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Checking Hedera Account Details...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());
  
  // Try to get account info
  try {
    const network = await deployer.provider.getNetwork();
    console.log("Network:", network.name, "Chain ID:", network.chainId);
    
    // Try to get transaction count
    const txCount = await deployer.provider.getTransactionCount(deployer.address);
    console.log("Transaction count:", txCount);
    
    // Try to get block number
    const blockNumber = await deployer.provider.getBlockNumber();
    console.log("Current block number:", blockNumber);
    
  } catch (error) {
    console.error("Error getting account info:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
