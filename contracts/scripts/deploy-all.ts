import { ethers } from "hardhat";

/**
 * Comprehensive deployment script for DrivetoSurvive ecosystem
 * Deploys all contracts in correct dependency order
 */

async function main() {
  console.log("🏁 Starting DrivetoSurvive deployment...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());
  console.log();

  // ============================================================================
  // PHASE 1: Deploy Core NFT Contracts
  // ============================================================================

  console.log("📦 PHASE 1: Deploying Core NFT Contracts...");

  // Deploy DriverNFT
  console.log("Deploying DriverNFT...");
  const DriverNFT = await ethers.getContractFactory("DriverNFT");
  const driverNFT = await DriverNFT.deploy();
  await driverNFT.waitForDeployment();
  const driverNFTAddress = await driverNFT.getAddress();
  console.log("✅ DriverNFT deployed to:", driverNFTAddress);

  // Deploy TeamNFT
  console.log("Deploying TeamNFT...");
  const TeamNFT = await ethers.getContractFactory("TeamNFT");
  const teamNFT = await TeamNFT.deploy();
  await teamNFT.waitForDeployment();
  const teamNFTAddress = await teamNFT.getAddress();
  console.log("✅ TeamNFT deployed to:", teamNFTAddress);
  console.log();

  // ============================================================================
  // PHASE 2: Deploy Pyth Oracle Integration
  // ============================================================================

  console.log("📡 PHASE 2: Deploying Pyth Oracle Integration...");

  // For Hedera testnet, use the Pyth contract address
  // Hedera Testnet Pyth: TBD (use mock for now)
  const pythContractAddress = process.env.PYTH_CONTRACT_ADDRESS || deployer.address;
  
  console.log("Deploying PerformanceOracle...");
  const PerformanceOracle = await ethers.getContractFactory("PerformanceOracle");
  const performanceOracle = await PerformanceOracle.deploy(pythContractAddress);
  await performanceOracle.waitForDeployment();
  const performanceOracleAddress = await performanceOracle.getAddress();
  console.log("✅ PerformanceOracle deployed to:", performanceOracleAddress);
  console.log();

  // ============================================================================
  // PHASE 3: Deploy Governance & Economics Contracts
  // ============================================================================

  console.log("⚖️ PHASE 3: Deploying Governance & Economics...");

  // Deploy SponsorEscrow
  console.log("Deploying SponsorEscrow...");
  const SponsorEscrow = await ethers.getContractFactory("SponsorEscrow");
  const sponsorEscrow = await SponsorEscrow.deploy(performanceOracleAddress);
  await sponsorEscrow.waitForDeployment();
  const sponsorEscrowAddress = await sponsorEscrow.getAddress();
  console.log("✅ SponsorEscrow deployed to:", sponsorEscrowAddress);

  // Deploy TeamRecruitment
  console.log("Deploying TeamRecruitment...");
  const TeamRecruitment = await ethers.getContractFactory("TeamRecruitment");
  const teamRecruitment = await TeamRecruitment.deploy(
    performanceOracleAddress,
    driverNFTAddress,
    teamNFTAddress
  );
  await teamRecruitment.waitForDeployment();
  const teamRecruitmentAddress = await teamRecruitment.getAddress();
  console.log("✅ TeamRecruitment deployed to:", teamRecruitmentAddress);

  // Deploy FinancialFairPlay
  console.log("Deploying FinancialFairPlay...");
  const FinancialFairPlay = await ethers.getContractFactory("FinancialFairPlay");
  const financialFairPlay = await FinancialFairPlay.deploy(
    teamNFTAddress,
    performanceOracleAddress
  );
  await financialFairPlay.waitForDeployment();
  const financialFairPlayAddress = await financialFairPlay.getAddress();
  console.log("✅ FinancialFairPlay deployed to:", financialFairPlayAddress);
  console.log();

  // ============================================================================
  // PHASE 4: Deploy Fan Engagement
  // ============================================================================

  console.log("🎮 PHASE 4: Deploying Fan Engagement...");

  // Deploy FanRewards
  console.log("Deploying FanRewards...");
  const FanRewards = await ethers.getContractFactory("FanRewards");
  const fanRewards = await FanRewards.deploy(
    driverNFTAddress,
    performanceOracleAddress
  );
  await fanRewards.waitForDeployment();
  const fanRewardsAddress = await fanRewards.getAddress();
  console.log("✅ FanRewards deployed to:", fanRewardsAddress);
  console.log();

  // ============================================================================
  // PHASE 5: Configure Permissions
  // ============================================================================

  console.log("🔐 PHASE 5: Configuring Permissions...");

  // Authorize PerformanceOracle to update DriverNFT
  console.log("Authorizing PerformanceOracle for DriverNFT updates...");
  await driverNFT.setAuthorizedUpdater(performanceOracleAddress, true);
  console.log("✅ PerformanceOracle authorized");

  // Authorize TeamRecruitment to update DriverNFT (for team changes)
  console.log("Authorizing TeamRecruitment for DriverNFT updates...");
  await driverNFT.setAuthorizedUpdater(teamRecruitmentAddress, true);
  console.log("✅ TeamRecruitment authorized");

  console.log();

  // ============================================================================
  // DEPLOYMENT SUMMARY
  // ============================================================================

  console.log("=" .repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(60));
  console.log();
  console.log("📋 Contract Addresses:");
  console.log("-" .repeat(60));
  console.log("Core NFTs:");
  console.log(`  DriverNFT:           ${driverNFTAddress}`);
  console.log(`  TeamNFT:             ${teamNFTAddress}`);
  console.log();
  console.log("Oracle & Data:");
  console.log(`  PerformanceOracle:   ${performanceOracleAddress}`);
  console.log();
  console.log("Economics & Governance:");
  console.log(`  SponsorEscrow:       ${sponsorEscrowAddress}`);
  console.log(`  TeamRecruitment:     ${teamRecruitmentAddress}`);
  console.log(`  FinancialFairPlay:   ${financialFairPlayAddress}`);
  console.log();
  console.log("Fan Engagement:");
  console.log(`  FanRewards:          ${fanRewardsAddress}`);
  console.log();
  console.log("=" .repeat(60));
  console.log();

  // ============================================================================
  // SAVE DEPLOYMENT INFO
  // ============================================================================

  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      DriverNFT: driverNFTAddress,
      TeamNFT: teamNFTAddress,
      PerformanceOracle: performanceOracleAddress,
      SponsorEscrow: sponsorEscrowAddress,
      TeamRecruitment: teamRecruitmentAddress,
      FinancialFairPlay: financialFairPlayAddress,
      FanRewards: fanRewardsAddress
    }
  };

  console.log("💾 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log();

  // Save to file
  const fs = require('fs');
  const deploymentPath = `./deployments/${deploymentInfo.network}-${Date.now()}.json`;
  fs.mkdirSync('./deployments', { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`✅ Deployment info saved to: ${deploymentPath}`);
  console.log();

  // ============================================================================
  // ENVIRONMENT VARIABLES FOR FRONTEND
  // ============================================================================

  console.log("🔧 Add these to your apps/web/.env.local:");
  console.log("-" .repeat(60));
  console.log(`NEXT_PUBLIC_DRIVER_NFT_ADDRESS=${driverNFTAddress}`);
  console.log(`NEXT_PUBLIC_TEAM_NFT_ADDRESS=${teamNFTAddress}`);
  console.log(`NEXT_PUBLIC_PERFORMANCE_ORACLE_ADDRESS=${performanceOracleAddress}`);
  console.log(`NEXT_PUBLIC_SPONSOR_ESCROW_ADDRESS=${sponsorEscrowAddress}`);
  console.log(`NEXT_PUBLIC_TEAM_RECRUITMENT_ADDRESS=${teamRecruitmentAddress}`);
  console.log(`NEXT_PUBLIC_FINANCIAL_FAIRPLAY_ADDRESS=${financialFairPlayAddress}`);
  console.log(`NEXT_PUBLIC_FAN_REWARDS_ADDRESS=${fanRewardsAddress}`);
  console.log("=" .repeat(60));
  console.log();

  console.log("✨ Deployment successful! Your DrivetoSurvive ecosystem is live!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

