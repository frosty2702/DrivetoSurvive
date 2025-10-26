import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying contracts to Sepolia Testnet...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await ethers.provider.getBalance(deployer.address)).toString(), "\n");

  // Deploy DriverNFT
  console.log("🏎️  Deploying DriverNFT...");
  const DriverNFT = await ethers.getContractFactory("DriverNFT");
  const driverNFT = await DriverNFT.deploy();
  await driverNFT.waitForDeployment();
  const driverNFTAddress = await driverNFT.getAddress();
  console.log("✅ DriverNFT deployed to:", driverNFTAddress);

  // Deploy TeamNFT
  console.log("\n🏁 Deploying TeamNFT...");
  const TeamNFT = await ethers.getContractFactory("TeamNFT");
  const teamNFT = await TeamNFT.deploy();
  await teamNFT.waitForDeployment();
  const teamNFTAddress = await teamNFT.getAddress();
  console.log("✅ TeamNFT deployed to:", teamNFTAddress);

  // Deploy SimplePerformanceOracle
  console.log("\n📊 Deploying SimplePerformanceOracle...");
  const SimplePerformanceOracle = await ethers.getContractFactory("SimplePerformanceOracle");
  const performanceOracle = await SimplePerformanceOracle.deploy();
  await performanceOracle.waitForDeployment();
  const oracleAddress = await performanceOracle.getAddress();
  console.log("✅ SimplePerformanceOracle deployed to:", oracleAddress);

  // Deploy MockUSDC
  console.log("\n💵 Deploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  const mockUSDCAddress = await mockUSDC.getAddress();
  console.log("✅ MockUSDC deployed to:", mockUSDCAddress);

  // Deploy SponsorPool
  console.log("\n🏦 Deploying SponsorPool...");
  const SponsorPool = await ethers.getContractFactory("SponsorPool");
  const sponsorPool = await SponsorPool.deploy();
  await sponsorPool.waitForDeployment();
  const sponsorPoolAddress = await sponsorPool.getAddress();
  console.log("✅ SponsorPool deployed to:", sponsorPoolAddress);

  // Deploy ProofNFT
  console.log("\n🎫 Deploying ProofNFT...");
  const ProofNFT = await ethers.getContractFactory("ProofNFT");
  const proofNFT = await ProofNFT.deploy();
  await proofNFT.waitForDeployment();
  const proofNFTAddress = await proofNFT.getAddress();
  console.log("✅ ProofNFT deployed to:", proofNFTAddress);

  // Deploy ValuationOracle
  console.log("\n💎 Deploying ValuationOracle...");
  const ValuationOracle = await ethers.getContractFactory("ValuationOracle");
  const valuationOracle = await ValuationOracle.deploy();
  await valuationOracle.waitForDeployment();
  const valuationOracleAddress = await valuationOracle.getAddress();
  console.log("✅ ValuationOracle deployed to:", valuationOracleAddress);

  // Deploy FanRewards
  console.log("\n🎁 Deploying FanRewards...");
  const FanRewards = await ethers.getContractFactory("FanRewards");
  const fanRewards = await FanRewards.deploy(driverNFTAddress, await performanceOracle.getAddress());
  await fanRewards.waitForDeployment();
  const fanRewardsAddress = await fanRewards.getAddress();
  console.log("✅ FanRewards deployed to:", fanRewardsAddress);

  // Deploy FinancialFairPlay
  console.log("\n⚖️  Deploying FinancialFairPlay...");
  const FinancialFairPlay = await ethers.getContractFactory("FinancialFairPlay");
  const financialFairPlay = await FinancialFairPlay.deploy(teamNFTAddress, await performanceOracle.getAddress());
  await financialFairPlay.waitForDeployment();
  const financialFairPlayAddress = await financialFairPlay.getAddress();
  console.log("✅ FinancialFairPlay deployed to:", financialFairPlayAddress);

  // Deploy SponsorEscrow
  console.log("\n📝 Deploying SponsorEscrow...");
  const SponsorEscrow = await ethers.getContractFactory("SponsorEscrow");
  const sponsorEscrow = await SponsorEscrow.deploy(await performanceOracle.getAddress());
  await sponsorEscrow.waitForDeployment();
  const sponsorEscrowAddress = await sponsorEscrow.getAddress();
  console.log("✅ SponsorEscrow deployed to:", sponsorEscrowAddress);

  // Deploy TeamRecruitment
  console.log("\n👥 Deploying TeamRecruitment...");
  const TeamRecruitment = await ethers.getContractFactory("TeamRecruitment");
  const teamRecruitment = await TeamRecruitment.deploy(
    await performanceOracle.getAddress(),
    driverNFTAddress,
    teamNFTAddress
  );
  await teamRecruitment.waitForDeployment();
  const teamRecruitmentAddress = await teamRecruitment.getAddress();
  console.log("✅ TeamRecruitment deployed to:", teamRecruitmentAddress);

  // Summary
  console.log("\n" + "=".repeat(80));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(80));
  console.log("\n📍 Network: Sepolia Testnet");
  console.log("📁 Explorer: https://sepolia.etherscan.io/");
  console.log("\n📋 Contract Addresses:\n");
  
  const deploymentInfo = {
    network: "Sepolia",
    deployer: deployer.address,
    contracts: {
      DriverNFT: driverNFTAddress,
      TeamNFT: teamNFTAddress,
      SimplePerformanceOracle: oracleAddress,
      MockUSDC: mockUSDCAddress,
      SponsorPool: sponsorPoolAddress,
      ProofNFT: proofNFTAddress,
      ValuationOracle: valuationOracleAddress,
      FanRewards: fanRewardsAddress,
      FinancialFairPlay: financialFairPlayAddress,
      SponsorEscrow: sponsorEscrowAddress,
      TeamRecruitment: teamRecruitmentAddress
    },
    explorerBase: "https://sepolia.etherscan.io/address/"
  };

  for (const [name, address] of Object.entries(deploymentInfo.contracts)) {
    console.log(`  ${name.padEnd(30)} ${address}`);
    console.log(`  ${" ".repeat(32)}${deploymentInfo.explorerBase}${address}`);
  }

  console.log("\n" + "=".repeat(80));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
