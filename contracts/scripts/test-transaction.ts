import { ethers } from "hardhat";

/**
 * Test script to verify end-to-end transaction
 * This tests: Mint driver → Record performance → Check market value
 */

async function main() {
  console.log("🧪 Testing end-to-end transaction...\n");

  const [owner, addr1] = await ethers.getSigners();
  
  // Get deployed contracts
  const driverNFTAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const performanceOracleAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const sponsorEscrowAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

  const DriverNFT = await ethers.getContractFactory("DriverNFT");
  const driverNFT = DriverNFT.attach(driverNFTAddress);

  const PerformanceOracle = await ethers.getContractFactory("PerformanceOracle");
  const performanceOracle = PerformanceOracle.attach(performanceOracleAddress);

  const SponsorEscrow = await ethers.getContractFactory("SponsorEscrow");
  const sponsorEscrow = SponsorEscrow.attach(sponsorEscrowAddress);

  console.log("📋 Step 1: Mint a driver NFT");
  const mintTx = await driverNFT.mintDriver(
    addr1.address,
    "Max Verstappen",
    "Dutch",
    "Red Bull Racing",
    ethers.parseEther("10000000"), // 10M market value
    95 // Performance score
  );
  await mintTx.wait();
  console.log("✅ Driver NFT minted successfully");

  console.log("\n📋 Step 2: Record race performance");
  const performanceTx = await performanceOracle.recordPerformance(
    1, // driverId
    1, // raceId
    87000, // lapTime (87 seconds)
    23000, // avgSpeed (230 km/h * 100)
    1, // position (1st place)
    5, // overtakes
    25, // points
    95 // consistency score
  );
  await performanceTx.wait();
  console.log("✅ Performance recorded successfully");

  console.log("\n📋 Step 3: Check updated market value");
  const marketValue = await performanceOracle.driverMarketValue(1);
  const performanceScore = await performanceOracle.getPerformanceScore(1);
  
  console.log(`💰 New market value: ${marketValue} wei`);
  console.log(`📊 Performance score: ${performanceScore}/1000`);

  console.log("\n📋 Step 4: Create sponsor deal");
  const dealTx = await sponsorEscrow.createDeal(
    1, // driverId
    365 * 24 * 60 * 60, // 1 year duration
    ["Win race", "Top 5 finish"], // milestones
    [ethers.parseEther("50"), ethers.parseEther("30")], // payouts
    [900, 800], // min performance scores
    [0, 0], // min positions (not using)
    [0, 0], // min points (not using)
    { value: ethers.parseEther("100") } // 100 ETH locked
  );
  await dealTx.wait();
  console.log("✅ Sponsor deal created successfully");

  console.log("\n📋 Step 5: Check milestone achievement");
  const milestoneTx = await sponsorEscrow.checkAndReleaseMilestone(
    1, // dealId
    0, // milestone index (Win race)
    addr1.address // recipient
  );
  await milestoneTx.wait();
  console.log("✅ Milestone achieved and funds released!");

  console.log("\n🎉 End-to-end test completed successfully!");
  console.log("\n📊 Summary:");
  console.log("- Driver NFT minted");
  console.log("- Performance recorded via oracle");
  console.log("- Market value calculated");
  console.log("- Sponsor deal created");
  console.log("- Milestone verified and payout executed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:");
    console.error(error);
    process.exit(1);
  });
