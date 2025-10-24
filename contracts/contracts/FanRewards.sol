// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./DriverNFT.sol";
import "./PerformanceOracle.sol";

/**
 * @title FanRewards
 * @dev Fan engagement system that rewards supporters WITHOUT affecting driver contracts
 * 
 * KEY PRINCIPLE: Fans participate meaningfully but DON'T compromise meritocracy
 * - Fans stake driver NFTs to earn points
 * - Points unlock real-world rewards (F1TV, store discounts, tickets)
 * - Fan activity DOES NOT influence team decisions or driver contracts
 * - Creates fan economy separate from professional merit system
 */
contract FanRewards is Ownable, ReentrancyGuard {
    DriverNFT public driverNFT;
    PerformanceOracle public performanceOracle;

    struct StakedNFT {
        uint256 driverId;
        address owner;
        uint256 stakedAt;
        uint256 pointsEarned;
        bool isStaked;
    }

    struct FanProfile {
        uint256 totalPoints;
        uint256 totalStaked;
        uint256 rewardsRedeemed;
        uint256 lastActivityAt;
        uint256[] stakedDrivers;
    }

    struct Reward {
        uint256 rewardId;
        string name;
        string description;
        uint256 pointsCost;
        uint256 available;
        bool active;
        RewardType rewardType;
    }

    enum RewardType { F1TV, StoreDiscount, Merchandise, RaceTicket, PaddockPass }

    // Storage
    mapping(uint256 => StakedNFT) public stakedNFTs;  // Driver ID => Stake info
    mapping(address => FanProfile) public fanProfiles;
    mapping(uint256 => Reward) public rewards;
    
    uint256 private _nextRewardId = 1;
    uint256 public constant POINTS_PER_DAY = 10;
    uint256 public constant PERFORMANCE_MULTIPLIER = 100; // Extra points when driver performs well

    // Engagement tracking
    mapping(address => mapping(uint256 => bool)) public hasWatchedRace; // Fan => Race ID => Watched
    mapping(address => mapping(uint256 => uint256)) public racePredictions; // Fan => Race ID => Predicted position

    // Events
    event NFTStaked(address indexed fan, uint256 indexed driverId);
    event NFTUnstaked(address indexed fan, uint256 indexed driverId, uint256 pointsEarned);
    event PointsEarned(address indexed fan, uint256 points, string reason);
    event RewardRedeemed(address indexed fan, uint256 indexed rewardId, uint256 pointsSpent);
    event RaceWatched(address indexed fan, uint256 indexed raceId);
    event PredictionMade(address indexed fan, uint256 indexed raceId, uint256 predictedPosition);

    constructor(address _driverNFT, address payable _performanceOracle) Ownable(msg.sender) {
        driverNFT = DriverNFT(_driverNFT);
        performanceOracle = PerformanceOracle(_performanceOracle);

        // Initialize default rewards
        _createDefaultRewards();
    }

    /**
     * @dev Stake driver NFT to earn points
     */
    function stakeNFT(uint256 driverId) external nonReentrant {
        require(driverNFT.ownerOf(driverId) == msg.sender, "Not NFT owner");
        require(!stakedNFTs[driverId].isStaked, "Already staked");

        // Transfer NFT to contract
        driverNFT.transferFrom(msg.sender, address(this), driverId);

        // Create stake record
        stakedNFTs[driverId] = StakedNFT({
            driverId: driverId,
            owner: msg.sender,
            stakedAt: block.timestamp,
            pointsEarned: 0,
            isStaked: true
        });

        // Update fan profile
        FanProfile storage profile = fanProfiles[msg.sender];
        profile.totalStaked++;
        profile.stakedDrivers.push(driverId);
        profile.lastActivityAt = block.timestamp;

        emit NFTStaked(msg.sender, driverId);
    }

    /**
     * @dev Unstake NFT and claim accumulated points
     */
    function unstakeNFT(uint256 driverId) external nonReentrant {
        StakedNFT storage stake = stakedNFTs[driverId];
        require(stake.isStaked, "Not staked");
        require(stake.owner == msg.sender, "Not stake owner");

        // Calculate earned points
        uint256 points = _calculatePoints(driverId);
        
        // Update fan profile
        FanProfile storage profile = fanProfiles[msg.sender];
        profile.totalPoints += points;
        profile.totalStaked--;
        profile.lastActivityAt = block.timestamp;

        // Remove from staked drivers array
        _removeFromStakedDrivers(msg.sender, driverId);

        // Return NFT
        driverNFT.transferFrom(address(this), msg.sender, driverId);
        
        // Clear stake
        stake.isStaked = false;

        emit NFTUnstaked(msg.sender, driverId, points);
        emit PointsEarned(msg.sender, points, "NFT unstaked");
    }

    /**
     * @dev Calculate points earned from staking
     * BONUS: Driver performance multiplies points earned
     */
    function _calculatePoints(uint256 driverId) internal view returns (uint256) {
        StakedNFT memory stake = stakedNFTs[driverId];
        if (!stake.isStaked) return 0;

        // Base points: time staked * daily rate
        uint256 daysStaked = (block.timestamp - stake.stakedAt) / 1 days;
        uint256 basePoints = daysStaked * POINTS_PER_DAY;

        // Performance bonus: better drivers = more points
        uint256 performanceScore = performanceOracle.getPerformanceScore(driverId);
        uint256 bonusMultiplier = (performanceScore * PERFORMANCE_MULTIPLIER) / 1000;
        
        return basePoints + (basePoints * bonusMultiplier / 100);
    }

    /**
     * @dev Record that fan watched a race (called by backend/oracle)
     */
    function recordRaceWatch(address fan, uint256 raceId) external {
        require(msg.sender == owner() || msg.sender == address(performanceOracle), "Not authorized");
        
        if (!hasWatchedRace[fan][raceId]) {
            hasWatchedRace[fan][raceId] = true;
            
            // Award engagement points
            fanProfiles[fan].totalPoints += 5;
            fanProfiles[fan].lastActivityAt = block.timestamp;
            
            emit RaceWatched(fan, raceId);
            emit PointsEarned(fan, 5, "Watched race");
        }
    }

    /**
     * @dev Fan predicts race outcome (gamification)
     */
    function makePrediction(uint256 raceId, uint256 driverId, uint256 predictedPosition) external {
        require(predictedPosition >= 1 && predictedPosition <= 20, "Invalid position");
        require(racePredictions[msg.sender][raceId] == 0, "Prediction already made");

        racePredictions[msg.sender][raceId] = (driverId << 8) | predictedPosition;
        fanProfiles[msg.sender].lastActivityAt = block.timestamp;

        emit PredictionMade(msg.sender, raceId, predictedPosition);
    }

    /**
     * @dev Check prediction accuracy and award bonus points
     */
    function checkPrediction(address fan, uint256 raceId, uint256 actualPosition) external {
        require(msg.sender == owner() || msg.sender == address(performanceOracle), "Not authorized");
        
        uint256 prediction = racePredictions[fan][raceId];
        if (prediction == 0) return;

        uint256 predictedPosition = prediction & 0xFF;
        
        // Exact prediction = 50 points, ±1 = 20 points, ±2 = 10 points
        uint256 bonus = 0;
        if (predictedPosition == actualPosition) {
            bonus = 50;
        } else if (predictedPosition >= actualPosition - 1 && predictedPosition <= actualPosition + 1) {
            bonus = 20;
        } else if (predictedPosition >= actualPosition - 2 && predictedPosition <= actualPosition + 2) {
            bonus = 10;
        }

        if (bonus > 0) {
            fanProfiles[fan].totalPoints += bonus;
            emit PointsEarned(fan, bonus, "Accurate prediction");
        }
    }

    /**
     * @dev Redeem points for rewards
     */
    function redeemReward(uint256 rewardId) external nonReentrant {
        Reward storage reward = rewards[rewardId];
        require(reward.active, "Reward not active");
        require(reward.available > 0, "Reward out of stock");

        FanProfile storage profile = fanProfiles[msg.sender];
        require(profile.totalPoints >= reward.pointsCost, "Insufficient points");

        // Deduct points
        profile.totalPoints -= reward.pointsCost;
        profile.rewardsRedeemed++;
        profile.lastActivityAt = block.timestamp;

        // Reduce availability
        reward.available--;

        emit RewardRedeemed(msg.sender, rewardId, reward.pointsCost);
    }

    /**
     * @dev Add new reward (owner only)
     */
    function addReward(
        string memory name,
        string memory description,
        uint256 pointsCost,
        uint256 available,
        RewardType rewardType
    ) external onlyOwner returns (uint256) {
        uint256 rewardId = _nextRewardId++;

        rewards[rewardId] = Reward({
            rewardId: rewardId,
            name: name,
            description: description,
            pointsCost: pointsCost,
            available: available,
            active: true,
            rewardType: rewardType
        });

        return rewardId;
    }

    /**
     * @dev Initialize default rewards
     */
    function _createDefaultRewards() internal {
        // F1TV Access
        rewards[_nextRewardId++] = Reward({
            rewardId: 1,
            name: "F1TV Pro - 1 Month",
            description: "Full access to live races and replays",
            pointsCost: 500,
            available: 100,
            active: true,
            rewardType: RewardType.F1TV
        });

        // Store Discount
        rewards[_nextRewardId++] = Reward({
            rewardId: 2,
            name: "F1 Store 20% Discount",
            description: "One-time 20% discount code",
            pointsCost: 200,
            available: 500,
            active: true,
            rewardType: RewardType.StoreDiscount
        });

        // Merchandise
        rewards[_nextRewardId++] = Reward({
            rewardId: 3,
            name: "Driver Cap",
            description: "Official team merchandise cap",
            pointsCost: 1000,
            available: 50,
            active: true,
            rewardType: RewardType.Merchandise
        });

        // Race Ticket
        rewards[_nextRewardId++] = Reward({
            rewardId: 4,
            name: "General Admission Ticket",
            description: "Weekend pass to selected GP",
            pointsCost: 5000,
            available: 10,
            active: true,
            rewardType: RewardType.RaceTicket
        });

        // Paddock Pass
        rewards[_nextRewardId++] = Reward({
            rewardId: 5,
            name: "Paddock Pass",
            description: "Behind-the-scenes access",
            pointsCost: 10000,
            available: 5,
            active: true,
            rewardType: RewardType.PaddockPass
        });
    }

    /**
     * @dev View functions
     */
    function getStakeInfo(uint256 driverId) external view returns (
        address owner,
        uint256 stakedAt,
        uint256 estimatedPoints,
        bool isStaked
    ) {
        StakedNFT memory stake = stakedNFTs[driverId];
        uint256 points = stake.isStaked ? _calculatePoints(driverId) : 0;
        return (stake.owner, stake.stakedAt, points, stake.isStaked);
    }

    function getFanProfile(address fan) external view returns (
        uint256 totalPoints,
        uint256 totalStaked,
        uint256 rewardsRedeemed,
        uint256[] memory stakedDrivers
    ) {
        FanProfile memory profile = fanProfiles[fan];
        return (profile.totalPoints, profile.totalStaked, profile.rewardsRedeemed, profile.stakedDrivers);
    }

    function getReward(uint256 rewardId) external view returns (
        string memory name,
        string memory description,
        uint256 pointsCost,
        uint256 available,
        bool active
    ) {
        Reward memory reward = rewards[rewardId];
        return (reward.name, reward.description, reward.pointsCost, reward.available, reward.active);
    }

    /**
     * @dev Helper to remove driver from staked array
     */
    function _removeFromStakedDrivers(address fan, uint256 driverId) internal {
        uint256[] storage staked = fanProfiles[fan].stakedDrivers;
        for (uint256 i = 0; i < staked.length; i++) {
            if (staked[i] == driverId) {
                staked[i] = staked[staked.length - 1];
                staked.pop();
                break;
            }
        }
    }

    /**
     * @dev Update contracts
     */
    function updatePerformanceOracle(address payable _performanceOracle) external onlyOwner {
        performanceOracle = PerformanceOracle(_performanceOracle);
    }
}

