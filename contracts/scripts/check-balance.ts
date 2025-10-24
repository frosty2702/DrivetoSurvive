import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Checking Hedera Testnet Account Balance...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());
  
  // Try to get account info
  try {
    const network = await deployer.provider.getNetwork();
    console.log("Network:", network.name, "Chain ID:", network.chainId);
  } catch (error) {
    console.error("Network error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
