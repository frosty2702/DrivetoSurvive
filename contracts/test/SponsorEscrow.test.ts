import { expect } from "chai";
import { ethers } from "hardhat";
import { SponsorEscrow } from "../typechain-types";

describe("SponsorEscrow", function () {
  let sponsorEscrow: SponsorEscrow;
  let performanceOracle: any;
  let owner: any;
  let sponsor: any;
  let driver: any;

  beforeEach(async function () {
    [owner, sponsor, driver] = await ethers.getSigners();
    
    // Deploy mock performance oracle
    const MockOracleFactory = await ethers.getContractFactory("MockPerformanceOracle");
    performanceOracle = await MockOracleFactory.deploy();
    await performanceOracle.waitForDeployment();
    
    const SponsorEscrowFactory = await ethers.getContractFactory("SponsorEscrow");
    sponsorEscrow = await SponsorEscrowFactory.deploy(await performanceOracle.getAddress());
    await sponsorEscrow.waitForDeployment();
  });

  describe("Deal Creation", function () {
    it("Should create a sponsor deal", async function () {
      const dealAmount = ethers.parseEther("100");
      const milestones = ["Win race", "Top 5 finish"];
      const payouts = [ethers.parseEther("50"), ethers.parseEther("30")];
      const scores = [900, 800];
      const positions = [0, 0]; // Not using position filter
      const points = [0, 0]; // Not using points filter

      const tx = await sponsorEscrow.connect(sponsor).createDeal(
        1, // driverId
        365 * 24 * 60 * 60, // 1 year duration
        milestones,
        payouts,
        scores,
        positions,
        points,
        { value: dealAmount }
      );

      const receipt = await tx.wait();
      expect(receipt).to.not.be.null;

      // Check deal was created
      const deal = await sponsorEscrow.getDeal(1);
      expect(deal.sponsor).to.equal(sponsor.address);
      expect(deal.driverId).to.equal(1);
      expect(deal.totalAmount).to.equal(dealAmount);
    });

    it("Should reject deal with payout exceeding locked amount", async function () {
      const dealAmount = ethers.parseEther("100");
      const payouts = [ethers.parseEther("60"), ethers.parseEther("50")]; // 110 total > 100

      await expect(
        sponsorEscrow.connect(sponsor).createDeal(
          1,
          365 * 24 * 60 * 60,
          ["Win race", "Top 5 finish"],
          payouts,
          [900, 800],
          [0, 0],
          [0, 0],
          { value: dealAmount }
        )
      ).to.be.revertedWith("Payout exceeds locked amount");
    });

    it("Should reject deal with mismatched array lengths", async function () {
      const dealAmount = ethers.parseEther("100");

      await expect(
        sponsorEscrow.connect(sponsor).createDeal(
          1,
          365 * 24 * 60 * 60,
          ["Win race"], // 1 milestone
          [ethers.parseEther("50"), ethers.parseEther("30")], // 2 payouts
          [900], // 1 score
          [0], // 1 position
          [0], // 1 point
          { value: dealAmount }
        )
      ).to.be.revertedWith("Array length mismatch");
    });
  });

  describe("Milestone Verification", function () {
    let dealId: number;

    beforeEach(async function () {
      // Create a deal first
      const dealAmount = ethers.parseEther("100");
      const milestones = ["Win race"];
      const payouts = [ethers.parseEther("50")];
      const scores = [900];

      const tx = await sponsorEscrow.connect(sponsor).createDeal(
        1,
        365 * 24 * 60 * 60,
        milestones,
        payouts,
        scores,
        [0],
        [0],
        { value: dealAmount }
      );

      const receipt = await tx.wait();
      dealId = 1;
    });

    it("Should release funds when milestone is achieved", async function () {
      // Set driver performance score to meet milestone
      await performanceOracle.setDriverScore(1, 950); // > 900 required

      // Check and release milestone
      await sponsorEscrow.checkAndReleaseMilestone(
        dealId,
        0, // milestone index
        driver.address // recipient
      );

      // Check milestone was achieved
      const milestone = await sponsorEscrow.getMilestone(dealId, 0);
      expect(milestone.achieved).to.be.true;
    });

    it("Should reject milestone release when performance not met", async function () {
      // Set driver performance score below requirement
      await performanceOracle.setDriverScore(1, 850); // < 900 required

      await expect(
        sponsorEscrow.checkAndReleaseMilestone(
          dealId,
          0,
          driver.address
        )
      ).to.be.revertedWith("Performance score not met");
    });

    it("Should reject milestone release for already achieved milestone", async function () {
      // Achieve milestone first
      await performanceOracle.setDriverScore(1, 950);
      await sponsorEscrow.checkAndReleaseMilestone(dealId, 0, driver.address);

      // Try to release again
      await expect(
        sponsorEscrow.checkAndReleaseMilestone(dealId, 0, driver.address)
      ).to.be.revertedWith("Deal not active");
    });
  });

  describe("Deal Cancellation", function () {
    let dealId: number;

    beforeEach(async function () {
      // Create a deal
      const dealAmount = ethers.parseEther("100");
      const tx = await sponsorEscrow.connect(sponsor).createDeal(
        1,
        365 * 24 * 60 * 60,
        ["Win race"],
        [ethers.parseEther("50")],
        [900],
        [0],
        [0],
        { value: dealAmount }
      );

      const receipt = await tx.wait();
      dealId = 1;
    });

    it("Should allow sponsor to cancel deal", async function () {
      const initialBalance = await ethers.provider.getBalance(sponsor.address);

      const tx = await sponsorEscrow.connect(sponsor).cancelDeal(dealId);
      const receipt = await tx.wait();

      const finalBalance = await ethers.provider.getBalance(sponsor.address);
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      // Should refund the full amount
      expect(finalBalance).to.equal(initialBalance - gasUsed + ethers.parseEther("100"));
    });

    it("Should reject cancellation by non-sponsor", async function () {
      await expect(
        sponsorEscrow.connect(driver).cancelDeal(dealId)
      ).to.be.revertedWith("Not sponsor");
    });
  });
});
