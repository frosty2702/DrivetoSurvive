// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./PerformanceOracle.sol";

/**
 * @title SponsorEscrow
 * @dev Transparent sponsor investment system with automated performance-based payouts
 * 
 * KEY FEATURES:
 * - Sponsors lock funds for drivers/teams
 * - Smart contract automatically releases funds based on objective performance metrics
 * - No politics or favoritism - pure meritocracy
 * - Full transparency on-chain
 */
contract SponsorEscrow is Ownable, ReentrancyGuard {
    PerformanceOracle public performanceOracle;

    enum DealStatus { Active, Completed, Cancelled, Breached }

    struct SponsorDeal {
        uint256 dealId;
        address sponsor;
        uint256 driverId;          // Driver NFT token ID
        uint256 totalAmount;       // Total locked amount
        uint256 releasedAmount;    // Amount already paid out
        uint256 startTime;
        uint256 duration;          // Deal length in seconds
        DealStatus status;
        
        // Performance milestones for automated payouts
        Milestone[] milestones;
    }

    struct Milestone {
        string description;        // "Win race", "Top 5 finish", "Score 10+ points"
        uint256 payoutAmount;      // Amount to release when achieved
        uint256 minPerformanceScore; // Minimum score needed
        uint256 minPosition;       // Minimum race position (1-20)
        uint256 minPoints;         // Minimum championship points
        bool achieved;
        uint256 achievedAt;
    }

    // Deal storage
    uint256 private _nextDealId = 1;
    mapping(uint256 => SponsorDeal) public deals;
    mapping(uint256 => uint256[]) public driverToDeals; // Driver ID => Deal IDs
    mapping(address => uint256[]) public sponsorToDeals; // Sponsor => Deal IDs

    // Events
    event DealCreated(
        uint256 indexed dealId,
        address indexed sponsor,
        uint256 indexed driverId,
        uint256 totalAmount,
        uint256 duration
    );
    event MilestoneAchieved(
        uint256 indexed dealId,
        uint256 milestoneIndex,
        uint256 payoutAmount,
        uint256 driverId
    );
    event FundsReleased(
        uint256 indexed dealId,
        address indexed recipient,
        uint256 amount
    );
    event DealCancelled(uint256 indexed dealId);

    constructor(address payable _performanceOracle) Ownable(msg.sender) {
        performanceOracle = PerformanceOracle(_performanceOracle);
    }

    /**
     * @dev Create a sponsor deal with performance milestones
     */
    function createDeal(
        uint256 driverId,
        uint256 duration,
        string[] memory milestoneDescriptions,
        uint256[] memory payoutAmounts,
        uint256[] memory minPerformanceScores,
        uint256[] memory minPositions,
        uint256[] memory minPoints
    ) external payable returns (uint256) {
        require(msg.value > 0, "Must send funds");
        require(duration > 0, "Invalid duration");
        require(
            milestoneDescriptions.length == payoutAmounts.length &&
            payoutAmounts.length == minPerformanceScores.length &&
            minPerformanceScores.length == minPositions.length &&
            minPositions.length == minPoints.length,
            "Array length mismatch"
        );

        // Verify total payout doesn't exceed locked amount
        uint256 totalPayout = 0;
        for (uint256 i = 0; i < payoutAmounts.length; i++) {
            totalPayout += payoutAmounts[i];
        }
        require(totalPayout <= msg.value, "Payout exceeds locked amount");

        uint256 dealId = _nextDealId++;

        // Create deal
        SponsorDeal storage deal = deals[dealId];
        deal.dealId = dealId;
        deal.sponsor = msg.sender;
        deal.driverId = driverId;
        deal.totalAmount = msg.value;
        deal.releasedAmount = 0;
        deal.startTime = block.timestamp;
        deal.duration = duration;
        deal.status = DealStatus.Active;

        // Add milestones
        for (uint256 i = 0; i < milestoneDescriptions.length; i++) {
            deal.milestones.push(Milestone({
                description: milestoneDescriptions[i],
                payoutAmount: payoutAmounts[i],
                minPerformanceScore: minPerformanceScores[i],
                minPosition: minPositions[i],
                minPoints: minPoints[i],
                achieved: false,
                achievedAt: 0
            }));
        }

        // Track deals
        driverToDeals[driverId].push(dealId);
        sponsorToDeals[msg.sender].push(dealId);

        emit DealCreated(dealId, msg.sender, driverId, msg.value, duration);
        return dealId;
    }

    /**
     * @dev Check and release funds if milestone is achieved
     * Anyone can call this - it's permissionless and verifies against oracle
     */
    function checkAndReleaseMilestone(
        uint256 dealId,
        uint256 milestoneIndex,
        address payable recipient
    ) external nonReentrant {
        SponsorDeal storage deal = deals[dealId];
        require(deal.status == DealStatus.Active, "Deal not active");
        require(block.timestamp <= deal.startTime + deal.duration, "Deal expired");
        require(milestoneIndex < deal.milestones.length, "Invalid milestone");

        Milestone storage milestone = deal.milestones[milestoneIndex];
        require(!milestone.achieved, "Milestone already achieved");

        // Fetch performance data from oracle
        uint256 performanceScore = performanceOracle.getPerformanceScore(deal.driverId);

        // Check if milestone conditions are met
        require(
            performanceScore >= milestone.minPerformanceScore,
            "Performance score not met"
        );

        // Mark as achieved
        milestone.achieved = true;
        milestone.achievedAt = block.timestamp;
        deal.releasedAmount += milestone.payoutAmount;

        // Transfer funds
        recipient.transfer(milestone.payoutAmount);

        emit MilestoneAchieved(dealId, milestoneIndex, milestone.payoutAmount, deal.driverId);
        emit FundsReleased(dealId, recipient, milestone.payoutAmount);

        // Check if deal is completed
        bool allAchieved = true;
        for (uint256 i = 0; i < deal.milestones.length; i++) {
            if (!deal.milestones[i].achieved) {
                allAchieved = false;
                break;
            }
        }
        if (allAchieved) {
            deal.status = DealStatus.Completed;
        }
    }

    /**
     * @dev Sponsor can cancel deal and get refund of unreleased funds
     */
    function cancelDeal(uint256 dealId) external nonReentrant {
        SponsorDeal storage deal = deals[dealId];
        require(deal.sponsor == msg.sender, "Not sponsor");
        require(deal.status == DealStatus.Active, "Deal not active");

        uint256 refundAmount = deal.totalAmount - deal.releasedAmount;
        deal.status = DealStatus.Cancelled;

        if (refundAmount > 0) {
            payable(msg.sender).transfer(refundAmount);
        }

        emit DealCancelled(dealId);
    }

    /**
     * @dev Get deal details
     */
    function getDeal(uint256 dealId) external view returns (
        address sponsor,
        uint256 driverId,
        uint256 totalAmount,
        uint256 releasedAmount,
        DealStatus status,
        uint256 milestoneCount
    ) {
        SponsorDeal storage deal = deals[dealId];
        return (
            deal.sponsor,
            deal.driverId,
            deal.totalAmount,
            deal.releasedAmount,
            deal.status,
            deal.milestones.length
        );
    }

    /**
     * @dev Get milestone details
     */
    function getMilestone(uint256 dealId, uint256 milestoneIndex) 
        external 
        view 
        returns (
            string memory description,
            uint256 payoutAmount,
            bool achieved,
            uint256 minPerformanceScore
        ) 
    {
        SponsorDeal storage deal = deals[dealId];
        require(milestoneIndex < deal.milestones.length, "Invalid milestone");
        Milestone memory milestone = deal.milestones[milestoneIndex];
        
        return (
            milestone.description,
            milestone.payoutAmount,
            milestone.achieved,
            milestone.minPerformanceScore
        );
    }

    /**
     * @dev Get all deals for a driver
     */
    function getDriverDeals(uint256 driverId) external view returns (uint256[] memory) {
        return driverToDeals[driverId];
    }

    /**
     * @dev Get all deals from a sponsor
     */
    function getSponsorDeals(address sponsor) external view returns (uint256[] memory) {
        return sponsorToDeals[sponsor];
    }

    /**
     * @dev Update performance oracle
     */
    function updatePerformanceOracle(address payable _performanceOracle) external onlyOwner {
        performanceOracle = PerformanceOracle(_performanceOracle);
    }
}

