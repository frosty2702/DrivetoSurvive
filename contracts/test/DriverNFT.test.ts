import { expect } from "chai";
import { ethers } from "hardhat";
import { DriverNFT } from "../typechain-types";

describe("DriverNFT", function () {
  let driverNFT: DriverNFT;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const DriverNFTFactory = await ethers.getContractFactory("DriverNFT");
    driverNFT = await DriverNFTFactory.deploy();
    await driverNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await driverNFT.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await driverNFT.name()).to.equal("DrivetoSurvive Driver");
      expect(await driverNFT.symbol()).to.equal("DTS-DRIVER");
    });
  });

  describe("Minting", function () {
    it("Should mint a new driver NFT", async function () {
      const tx = await driverNFT.mintDriver(
        addr1.address,
        "Max Verstappen",
        "Dutch",
        "Red Bull Racing",
        ethers.parseEther("10000000"), // 10M market value
        95 // Performance score (0-100 scale)
      );

      const receipt = await tx.wait();
      expect(receipt).to.not.be.null;

      // Check token ownership
      expect(await driverNFT.ownerOf(1)).to.equal(addr1.address);
      
      // Check driver stats
      const stats = await driverNFT.getDriverStats(1);
      expect(stats.name).to.equal("Max Verstappen");
      expect(stats.nationality).to.equal("Dutch");
      expect(stats.team).to.equal("Red Bull Racing");
      expect(stats.marketValue).to.equal(ethers.parseEther("10000000"));
      expect(stats.performanceScore).to.equal(95);
    });

    it("Should reject empty name", async function () {
      await expect(
        driverNFT.mintDriver(
          addr1.address,
          "", // Empty name
          "Dutch",
          "Red Bull Racing",
          ethers.parseEther("10000000"),
          95
        )
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should reject duplicate driver names", async function () {
      // Mint first driver
      await driverNFT.mintDriver(
        addr1.address,
        "Max Verstappen",
        "Dutch",
        "Red Bull Racing",
        ethers.parseEther("10000000"),
        95
      );

      // Try to mint same driver name
      await expect(
        driverNFT.mintDriver(
          addr2.address,
          "Max Verstappen", // Same name
          "Dutch",
          "Red Bull Racing",
          ethers.parseEther("10000000"),
          95
        )
      ).to.be.revertedWith("Driver already exists");
    });

    it("Should reject performance score > 100", async function () {
      await expect(
        driverNFT.mintDriver(
          addr1.address,
          "Max Verstappen",
          "Dutch",
          "Red Bull Racing",
          ethers.parseEther("10000000"),
          150 // Invalid score > 100
        )
      ).to.be.revertedWith("Performance score must be <= 100");
    });
  });

  describe("Stats Updates", function () {
    beforeEach(async function () {
      // Mint a driver first
      await driverNFT.mintDriver(
        addr1.address,
        "Max Verstappen",
        "Dutch",
        "Red Bull Racing",
        ethers.parseEther("10000000"),
        95
      );
    });

    it("Should update driver stats by authorized updater", async function () {
      // Authorize addr1 as updater
      await driverNFT.setAuthorizedUpdater(addr1.address, true);

      // Update stats
      await driverNFT.updateDriverStats(
        1, // tokenId
        ethers.parseEther("12000000"), // new market value
        97, // new performance score (0-100 scale)
        22, // total races
        19, // total wins
        21, // total podiums
        575 // total points
      );

      const stats = await driverNFT.getDriverStats(1);
      expect(stats.marketValue).to.equal(ethers.parseEther("12000000"));
      expect(stats.performanceScore).to.equal(97);
      expect(stats.totalRaces).to.equal(22);
      expect(stats.totalWins).to.equal(19);
      expect(stats.totalPodiums).to.equal(21);
      expect(stats.totalPoints).to.equal(575);
    });

    it("Should reject stats update by unauthorized address", async function () {
      await expect(
        driverNFT.connect(addr2).updateDriverStats(
          1,
          ethers.parseEther("12000000"),
          970,
          22,
          19,
          21,
          575
        )
      ).to.be.revertedWith("Not authorized");
    });

    it("Should update driver team", async function () {
      await driverNFT.setAuthorizedUpdater(addr1.address, true);

      await driverNFT.updateDriverTeam(1, "Mercedes");

      const stats = await driverNFT.getDriverStats(1);
      expect(stats.team).to.equal("Mercedes");
    });
  });

  describe("Authorization", function () {
    it("Should allow owner to authorize updaters", async function () {
      await driverNFT.setAuthorizedUpdater(addr1.address, true);
      
      const isAuthorized = await driverNFT.authorizedUpdaters(addr1.address);
      expect(isAuthorized).to.be.true;
    });

    it("Should reject authorization by non-owner", async function () {
      await expect(
        driverNFT.connect(addr1).setAuthorizedUpdater(addr2.address, true)
      ).to.be.reverted;
    });
  });

  describe("Token URI", function () {
    it("Should generate valid metadata URI", async function () {
      await driverNFT.mintDriver(
        addr1.address,
        "Max Verstappen",
        "Dutch",
        "Red Bull Racing",
        ethers.parseEther("10000000"),
        95
      );

      const uri = await driverNFT.tokenURI(1);
      expect(uri).to.include("data:application/json;base64,");
      
      // Decode and check JSON contains expected fields
      const jsonPart = uri.split(",")[1];
      const decoded = Buffer.from(jsonPart, 'base64').toString();
      const metadata = JSON.parse(decoded);
      
      expect(metadata.name).to.equal("Max Verstappen");
      expect(metadata.description).to.include("DrivetoSurvive Driver NFT");
      expect(metadata.attributes).to.be.an('array');
      expect(metadata.attributes.length).to.be.greaterThan(0);
    });
  });
});