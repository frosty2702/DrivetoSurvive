import { expect } from "chai";
import { ethers } from "hardhat";
import { PerformanceOracle } from "../typechain-types";

describe("PerformanceOracle", function () {
  let performanceOracle: PerformanceOracle;
  let owner: any;
  let addr1: any;
  let mockPyth: any;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    
    // Deploy mock Pyth contract for testing
    const MockPythFactory = await ethers.getContractFactory("MockPyth");
    mockPyth = await MockPythFactory.deploy();
    await mockPyth.waitForDeployment();
    
    const PerformanceOracleFactory = await ethers.getContractFactory("PerformanceOracle");
    performanceOracle = await PerformanceOracleFactory.deploy(await mockPyth.getAddress());
    await performanceOracle.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await performanceOracle.owner()).to.equal(owner.address);
    });

    it("Should initialize with correct Pyth contract", async function () {
      expect(await performanceOracle.pyth()).to.equal(await mockPyth.getAddress());
    });
  });

  describe("Performance Recording", function () {
    it("Should record driver performance", async function () {
      // Authorize addr1 as updater
      await performanceOracle.setAuthorizedUpdater(addr1.address, true);

      await performanceOracle.connect(addr1).recordPerformance(
        1, // driverId
        1, // raceId
        87000, // lapTime (87 seconds in milliseconds)
        23000, // avgSpeed (230 km/h * 100)
        1, // position
        5, // overtakes
        25, // points
        95 // consistency score
      );

      const performance = await performanceOracle.getRacePerformance(1, 1);
      expect(performance.raceId).to.equal(1);
      expect(performance.lapTime).to.equal(87000);
      expect(performance.avgSpeed).to.equal(23000);
      expect(performance.position).to.equal(1);
      expect(performance.overtakes).to.equal(5);
      expect(performance.points).to.equal(25);
      expect(performance.consistencyScore).to.equal(95);
      expect(performance.verified).to.be.true;
    });

    it("Should calculate market value correctly", async function () {
      await performanceOracle.setAuthorizedUpdater(addr1.address, true);

      // Record a winning performance (position 1, 25 points)
      await performanceOracle.connect(addr1).recordPerformance(
        1, 1, 87000, 23000, 1, 5, 25, 95
      );

      const marketValue = await performanceOracle.getDriverValue(1);
      const performanceScore = await performanceOracle.getPerformanceScore(1);

      // Should be high value for winning performance
      expect(marketValue).to.be.greaterThan(ethers.parseEther("1000000")); // > 1M base
      expect(performanceScore).to.be.greaterThan(800); // > 80% score
    });

    it("Should reject invalid position", async function () {
      await performanceOracle.setAuthorizedUpdater(addr1.address, true);

      await expect(
        performanceOracle.connect(addr1).recordPerformance(
          1, 1, 87000, 23000, 25, 5, 25, 95 // Invalid position > 20
        )
      ).to.be.revertedWith("Invalid position");
    });

    it("Should reject consistency score > 100", async function () {
      await performanceOracle.setAuthorizedUpdater(addr1.address, true);

      await expect(
        performanceOracle.connect(addr1).recordPerformance(
          1, 1, 87000, 23000, 1, 5, 25, 150 // Invalid consistency > 100
        )
      ).to.be.revertedWith("Invalid consistency score");
    });

    it("Should reject unauthorized performance recording", async function () {
      await expect(
        performanceOracle.connect(addr1).recordPerformance(
          1, 1, 87000, 23000, 1, 5, 25, 95
        )
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Market Value Calculation", function () {
    beforeEach(async function () {
      await performanceOracle.setAuthorizedUpdater(addr1.address, true);
    });

    it("Should give higher value for better positions", async function () {
      // Record 1st place finish
      await performanceOracle.connect(addr1).recordPerformance(
        1, 1, 87000, 23000, 1, 5, 25, 95
      );

      // Record 10th place finish
      await performanceOracle.connect(addr1).recordPerformance(
        2, 1, 90000, 22000, 10, 2, 1, 80
      );

      const winnerValue = await performanceOracle.getDriverValue(1);
      const tenthValue = await performanceOracle.getDriverValue(2);

      expect(winnerValue).to.be.greaterThan(tenthValue);
    });

    it("Should give higher value for more points", async function () {
      // Record high points finish
      await performanceOracle.connect(addr1).recordPerformance(
        1, 1, 87000, 23000, 1, 5, 25, 95
      );

      // Record low points finish
      await performanceOracle.connect(addr1).recordPerformance(
        2, 1, 90000, 22000, 15, 2, 0, 80
      );

      const highPointsValue = await performanceOracle.getDriverValue(1);
      const lowPointsValue = await performanceOracle.getDriverValue(2);

      expect(highPointsValue).to.be.greaterThan(lowPointsValue);
    });

    it("Should give higher value for more overtakes", async function () {
      // Record high overtakes
      await performanceOracle.connect(addr1).recordPerformance(
        1, 1, 87000, 23000, 5, 10, 10, 95
      );

      // Record low overtakes
      await performanceOracle.connect(addr1).recordPerformance(
        2, 1, 90000, 22000, 5, 1, 10, 95
      );

      const highOvertakesValue = await performanceOracle.getDriverValue(1);
      const lowOvertakesValue = await performanceOracle.getDriverValue(2);

      expect(highOvertakesValue).to.be.greaterThan(lowOvertakesValue);
    });
  });

  describe("Authorization", function () {
    it("Should allow owner to authorize updaters", async function () {
      await performanceOracle.setAuthorizedUpdater(addr1.address, true);
      
      const isAuthorized = await performanceOracle.authorizedUpdaters(addr1.address);
      expect(isAuthorized).to.be.true;
    });

    it("Should reject authorization by non-owner", async function () {
      await expect(
        performanceOracle.connect(addr1).setAuthorizedUpdater(addr1.address, true)
      ).to.be.reverted;
    });
  });
});

// Mock Pyth contract for testing
const MockPythFactory = {
  async deploy() {
    return {
      getAddress: async () => "0x1234567890123456789012345678901234567890",
      // Add other methods as needed for testing
    };
  }
};
