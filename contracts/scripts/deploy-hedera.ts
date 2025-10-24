import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Deploying to Hedera Testnet...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Check if we have enough balance
  const balance = await deployer.provider.getBalance(deployer.address);
  if (balance === 0n) {
    console.error("❌ Account balance is 0. Please get testnet HBAR from:");
    console.error("   - https://faucet.hashio.io/");
    console.error("   - https://portal.hedera.com/");
    console.error("   - Hedera Discord #testnet-faucet");
    process.exit(1);
  }

  // Deploy all contracts
  console.log("\n📝 Deploying DriverNFT...");
  const DriverNFT = await ethers.getContractFactory("DriverNFT");
  const driverNFT = await DriverNFT.deploy();
  await driverNFT.waitForDeployment();
  console.log("DriverNFT deployed to:", await driverNFT.getAddress());

  console.log("\n📝 Deploying TeamNFT...");
  const TeamNFT = await ethers.getContractFactory("TeamNFT");
  const teamNFT = await TeamNFT.deploy();
  await teamNFT.waitForDeployment();
  console.log("TeamNFT deployed to:", await teamNFT.getAddress());

  console.log("\n📝 Deploying MockPyth...");
  const MockPyth = await ethers.getContractFactory("MockPyth");
  const mockPyth = await MockPyth.deploy();
  await mockPyth.waitForDeployment();
  console.log("MockPyth deployed to:", await mockPyth.getAddress());

  console.log("\n📝 Deploying PerformanceOracle...");
  const PerformanceOracle = await ethers.getContractFactory("PerformanceOracle");
  const performanceOracle = await PerformanceOracle.deploy(await mockPyth.getAddress());
  await performanceOracle.waitForDeployment();
  console.log("PerformanceOracle deployed to:", await performanceOracle.getAddress());

  console.log("\n📝 Deploying SponsorEscrow...");
  const SponsorEscrow = await ethers.getContractFactory("SponsorEscrow");
  const sponsorEscrow = await SponsorEscrow.deploy(await performanceOracle.getAddress());
  await sponsorEscrow.waitForDeployment();
  console.log("SponsorEscrow deployed to:", await sponsorEscrow.getAddress());

  console.log("\n📝 Deploying SponsorPool...");
  const SponsorPool = await ethers.getContractFactory("SponsorPool");
  const sponsorPool = await SponsorPool.deploy();
  await sponsorPool.waitForDeployment();
  console.log("SponsorPool deployed to:", await sponsorPool.getAddress());

  console.log("\n📝 Deploying ProofNFT...");
  const ProofNFT = await ethers.getContractFactory("ProofNFT");
  const proofNFT = await ProofNFT.deploy();
  await proofNFT.waitForDeployment();
  console.log("ProofNFT deployed to:", await proofNFT.getAddress());

  console.log("\n📝 Deploying ValuationOracle...");
  const ValuationOracle = await ethers.getContractFactory("ValuationOracle");
  const valuationOracle = await ValuationOracle.deploy();
  await valuationOracle.waitForDeployment();
  console.log("ValuationOracle deployed to:", await valuationOracle.getAddress());

  console.log("\n📝 Deploying FanRewards...");
  const FanRewards = await ethers.getContractFactory("FanRewards");
  const fanRewards = await FanRewards.deploy(await driverNFT.getAddress(), await performanceOracle.getAddress());
  await fanRewards.waitForDeployment();
  console.log("FanRewards deployed to:", await fanRewards.getAddress());

  console.log("\n📝 Deploying FinancialFairPlay...");
  const FinancialFairPlay = await ethers.getContractFactory("FinancialFairPlay");
  const financialFairPlay = await FinancialFairPlay.deploy(await teamNFT.getContainer(), await performanceOracle.getAddress());
  await financialFairPlay.waitForDeployment();
  console.log("FinancialFairPlay deployed to:", await financialFairPlay.getAddress());

  console.log("\n📝 Deploying TeamRecruitment...");
  const TeamRecruitment = await ethers.getContractFactory("TeamRecruitment");
  const teamRecruitment = await TeamRecruitment.deploy(await performanceOracle.getAddress(), await driverNFT.getAddress(), await teamNFT.getAddress());
  await teamRecruitment.waitForDeployment();
  console.log("TeamRecruitment deployed to:", await teamRecruitment.getAddress());

  console.log("\n📝 Deploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  console.log("MockUSDC deployed to:", await mockUSDC.getAddress());

  // Configure permissions
  console.log("\n🔧 Configuring permissions...");
  
  // Authorize PerformanceOracle to update DriverNFT
  await driverNFT.setAuthorizedUpdater(await performanceOracle.getAddress(), true);
  console.log("✅ Authorized PerformanceOracle to update DriverNFT");

  // Authorize TeamRecruitment to update DriverNFT
  await driverNFT.setAuthorizedUpdater(await teamRecruitment.getAddress(), true);
  console.log("✅ Authorized TeamRecruitment to update DriverNFT");

  // Create some test pools
  console.log("\n🏊 Creating test sponsor pools...");
  await sponsorPool.createPool(2500); // 25% max concentration
  await sponsorPool.createPool(3000); // 30% max concentration
  console.log("✅ Created test sponsor pools");

  // Authorize MockUSDC in SponsorPool
  await sponsorPool.addAuthorizedToken(await mockUSDC.getAddress());
  console.log("✅ Authorized MockUSDC in SponsorPool");

  // Save deployment info
  const deploymentInfo = {
    network: "hedera-testnet",
    chainId: 296,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      DriverNFT: await driverNFT.getAddress(),
      TeamNFT: await teamNFT.getAddress(),
      MockPyth: await mockPyth.getAddress(),
      PerformanceOracle: await performanceOracle.getAddress(),
      SponsorEscrow: await sponsorEscrow.getAddress(),
      SponsorPool: await sponsorPool.getAddress(),
      ProofNFT: await proofNFT.getAddress(),
      ValuationOracle: await valuationOracle.getAddress(),
      FanRewards: await fanRewards.getAddress(),
      FinancialFairPlay: await financialFairPlay.getAddress(),
      TeamRecruitment: await teamRecruitment.getAddress(),
      MockUSDC: await mockUSDC.getAddress()
    }
  };

  // Save to deployments directory
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `hedera-deployment-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value, 2));
  console.log(`\n💾 Hedera deployment info saved to: ${deploymentFile}`);

  // Create .env file for frontend
  const envContent = `# Contract Addresses (Hedera Testnet Deployment)
NEXT_PUBLIC_DRIVER_NFT_ADDRESS=${await driverNFT.getAddress()}
NEXT_PUBLIC_TEAM_NFT_ADDRESS=${await teamNFT.getAddress()}
NEXT_PUBLIC_PERFORMANCE_ORACLE_ADDRESS=${await performanceOracle.getAddress()}
NEXT_PUBLIC_SPONSOR_ESCROW_ADDRESS=${await sponsorEscrow.getAddress()}
NEXT_PUBLIC_SPONSOR_POOL_ADDRESS=${await sponsorPool.getAddress()}
NEXT_PUBLIC_PROOF_NFT_ADDRESS=${await proofNFT.getAddress()}
NEXT_PUBLIC_VALUATION_ORACLE_ADDRESS=${await valuationOracle.getAddress()}
NEXT_PUBLIC_FAN_REWARDS_ADDRESS=${await fanRewards.getAddress()}
NEXT_PUBLIC_FINANCIAL_FAIRPLAY_ADDRESS=${await financialFairPlay.getAddress()}
NEXT_PUBLIC_TEAM_RECRUITMENT_ADDRESS=${await teamRecruitment.getAddress()}
NEXT_PUBLIC_MOCK_USDC_ADDRESS=${await mockUSDC.getAddress()}

# Network Configuration
NEXT_PUBLIC_NETWORK_NAME=hedera-testnet
NEXT_PUBLIC_CHAIN_ID=296

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
`;

  const envFile = path.join(__dirname, "..", "..", "apps", "web", ".env.local");
  fs.writeFileSync(envFile, envContent);
  console.log(`\n🔧 Frontend .env file created: ${envFile}`);

  console.log("\n🎉 Hedera Testnet Deployment Complete!");
  console.log("\n📋 Summary:");
  console.log("✅ 11 Smart Contracts Deployed to Hedera Testnet");
  console.log("✅ Permissions Configured");
  console.log("✅ Test Pools Created");
  console.log("✅ Mock USDC Deployed");
  console.log("✅ Frontend Environment Configured");
  
  console.log("\n🚀 Next Steps:");
  console.log("1. Build frontend MVP");
  console.log("2. Create demo video");
  console.log("3. Submit to hackathon");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
