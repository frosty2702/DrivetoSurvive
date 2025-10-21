import { ethers } from "hardhat";

async function main() {
  console.log("🏎️  Deploying DrivetoSurvive Contracts...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy DriverNFT
  console.log("📦 Deploying DriverNFT...");
  const DriverNFT = await ethers.getContractFactory("DriverNFT");
  const driverNFT = await DriverNFT.deploy();
  await driverNFT.waitForDeployment();
  const driverNFTAddress = await driverNFT.getAddress();
  console.log("✅ DriverNFT deployed to:", driverNFTAddress);

  // Deploy TeamNFT
  console.log("\n📦 Deploying TeamNFT...");
  const TeamNFT = await ethers.getContractFactory("TeamNFT");
  const teamNFT = await TeamNFT.deploy();
  await teamNFT.waitForDeployment();
  const teamNFTAddress = await teamNFT.getAddress();
  console.log("✅ TeamNFT deployed to:", teamNFTAddress);

  console.log("\n🎉 Deployment Complete!\n");
  console.log("Contract Addresses:");
  console.log("==================");
  console.log("DriverNFT:", driverNFTAddress);
  console.log("TeamNFT:  ", teamNFTAddress);

  console.log("\n💡 Next Steps:");
  console.log("1. Verify contracts on block explorer");
  console.log("2. Set authorized updaters (API backend address)");
  console.log("3. Mint initial driver and team NFTs");
  console.log("4. Connect API to contracts for updates");

  // Save deployment addresses to a file
  const fs = require("fs");
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    driverNFT: driverNFTAddress,
    teamNFT: teamNFTAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    "./deployments.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n📝 Deployment info saved to deployments.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

