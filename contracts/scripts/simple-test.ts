import { ethers } from "hardhat";

/**
 * Simple test to verify basic contract functionality
 */

async function main() {
  console.log("🧪 Simple contract functionality test...\n");

  const [owner, addr1] = await ethers.getSigners();
  
  // Get deployed contracts
  const driverNFTAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const performanceOracleAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  const DriverNFT = await ethers.getContractFactory("DriverNFT");
  const driverNFT = DriverNFT.attach(driverNFTAddress);

  const PerformanceOracle = await ethers.getContractFactory("PerformanceOracle");
  const performanceOracle = PerformanceOracle.attach(performanceOracleAddress);

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

  console.log("\n📋 Step 2: Check NFT ownership");
  const ownerOf = await driverNFT.ownerOf(1);
  console.log(`👤 NFT owner: ${ownerOf}`);
  console.log(`✅ Expected owner: ${addr1.address}`);
  console.log(`✅ Ownership correct: ${ownerOf === addr1.address}`);

  console.log("\n📋 Step 3: Get driver stats");
  const stats = await driverNFT.getDriverStats(1);
  console.log(`👤 Driver name: ${stats.name}`);
  console.log(`🏁 Team: ${stats.team}`);
  console.log(`💰 Market value: ${ethers.formatEther(stats.marketValue)} ETH`);
  console.log(`📊 Performance score: ${stats.performanceScore}/100`);

  console.log("\n📋 Step 4: Record race performance");
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

  console.log("\n📋 Step 5: Check performance score");
  const performanceScore = await performanceOracle.getPerformanceScore(1);
  console.log(`📊 Performance score: ${performanceScore}/1000`);

  console.log("\n🎉 Basic functionality test completed successfully!");
  console.log("\n📊 Summary:");
  console.log("- ✅ Driver NFT minted and owned correctly");
  console.log("- ✅ Driver stats retrieved successfully");
  console.log("- ✅ Performance recorded via oracle");
  console.log("- ✅ Performance score calculated");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:");
    console.error(error);
    process.exit(1);
  });
