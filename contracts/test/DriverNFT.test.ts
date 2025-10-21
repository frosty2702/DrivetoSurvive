import { expect } from "chai";
import { ethers } from "hardhat";
import { DriverNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("DriverNFT", function () {
  let driverNFT: DriverNFT;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let updater: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1, updater] = await ethers.getSigners();

    const DriverNFT = await ethers.getContractFactory("DriverNFT");
    driverNFT = await DriverNFT.deploy();
    await driverNFT.waitForDeployment();
  });

  describe("Minting", function () {
    it("Should mint a driver NFT with correct stats", async function () {
      const marketValue = ethers.parseEther("10"); // 10 ETH market value
      const performanceScore = 85;

      await driverNFT.mintDriver(
        user1.address,
        "Max Verstappen",
        "Dutch",
        "Red Bull Racing",
        marketValue,
        performanceScore
      );

      const stats = await driverNFT.getDriverStats(1);
      expect(stats.name).to.equal("Max Verstappen");
      expect(stats.nationality).to.equal("Dutch");
      expect(stats.team).to.equal("Red Bull Racing");
      expect(stats.marketValue).to.equal(marketValue);
      expect(stats.performanceScore).to.equal(performanceScore);
    });

    it("Should prevent duplicate driver names", async function () {
      await driverNFT.mintDriver(
        user1.address,
        "Max Verstappen",
        "Dutch",
        "Red Bull Racing",
        ethers.parseEther("10"),
        85
      );

      await expect(
        driverNFT.mintDriver(
          user1.address,
          "Max Verstappen",
          "Dutch",
          "Red Bull Racing",
          ethers.parseEther("10"),
          85
        )
      ).to.be.revertedWith("Driver already exists");
    });

    it("Should reject performance score > 100", async function () {
      await expect(
        driverNFT.mintDriver(
          user1.address,
          "Max Verstappen",
          "Dutch",
          "Red Bull Racing",
          ethers.parseEther("10"),
          101
        )
      ).to.be.revertedWith("Performance score must be <= 100");
    });
  });

  describe("Stats Updates", function () {
    beforeEach(async function () {
      await driverNFT.mintDriver(
        user1.address,
        "Max Verstappen",
        "Dutch",
        "Red Bull Racing",
        ethers.parseEther("10"),
        85
      );
    });

    it("Should allow owner to update stats", async function () {
      const newMarketValue = ethers.parseEther("15");
      const newPerformanceScore = 95;

      await driverNFT.updateDriverStats(
        1,
        newMarketValue,
        newPerformanceScore,
        20, // totalRaces
        15, // totalWins
        18, // totalPodiums
        450 // totalPoints
      );

      const stats = await driverNFT.getDriverStats(1);
      expect(stats.marketValue).to.equal(newMarketValue);
      expect(stats.performanceScore).to.equal(newPerformanceScore);
      expect(stats.totalRaces).to.equal(20);
      expect(stats.totalWins).to.equal(15);
    });

    it("Should allow authorized updater to update stats", async function () {
      await driverNFT.setAuthorizedUpdater(updater.address, true);

      const newMarketValue = ethers.parseEther("12");
      await driverNFT.connect(updater).updateDriverStats(
        1,
        newMarketValue,
        90,
        22,
        16,
        19,
        480
      );

      const stats = await driverNFT.getDriverStats(1);
      expect(stats.marketValue).to.equal(newMarketValue);
    });

    it("Should reject updates from unauthorized users", async function () {
      await expect(
        driverNFT.connect(user1).updateDriverStats(
          1,
          ethers.parseEther("15"),
          95,
          20,
          15,
          18,
          450
        )
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Dynamic Metadata", function () {
    it("Should generate valid tokenURI", async function () {
      await driverNFT.mintDriver(
        user1.address,
        "Max Verstappen",
        "Dutch",
        "Red Bull Racing",
        ethers.parseEther("10"),
        85
      );

      const tokenURI = await driverNFT.tokenURI(1);
      expect(tokenURI).to.include("data:application/json;base64");
      
      // Decode base64 to check JSON content
      const base64Data = tokenURI.split(",")[1];
      const jsonString = Buffer.from(base64Data, "base64").toString();
      const metadata = JSON.parse(jsonString);

      expect(metadata.name).to.equal("Max Verstappen");
      expect(metadata.description).to.include("DrivetoSurvive");
      expect(metadata.attributes).to.be.an("array");
    });
  });

  describe("Token Lookup", function () {
    it("Should find token by driver name", async function () {
      await driverNFT.mintDriver(
        user1.address,
        "Max Verstappen",
        "Dutch",
        "Red Bull Racing",
        ethers.parseEther("10"),
        85
      );

      const tokenId = await driverNFT.getTokenIdByName("Max Verstappen");
      expect(tokenId).to.equal(1);
    });
  });
});

