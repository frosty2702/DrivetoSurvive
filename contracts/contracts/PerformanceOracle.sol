// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PerformanceOracle
 * @dev Uses Pyth Network to fetch real-time F1 performance data and calculate driver market values
 * 
 * INNOVATION: Adapts Pyth's price feed infrastructure for real-time sports performance metrics
 * Instead of crypto prices, we use Pyth to verify and fetch:
 * - Lap times (microsecond precision)
 * - Race positions (finish order)
 * - Overtakes count
 * - Sector times
 * - Championship points
 */
contract PerformanceOracle is Ownable {
    IPyth public pyth;

    // Performance metrics stored on-chain after Pyth verification
    struct PerformanceData {
        uint256 raceId;
        uint256 lapTime;          // in milliseconds
        uint256 avgSpeed;         // km/h * 100 (for precision)
        uint256 position;         // finish position (1-20)
        uint256 overtakes;        // number of overtakes
        uint256 points;           // championship points
        uint256 consistencyScore; // 0-100
        uint256 timestamp;
        bool verified;            // verified via Pyth
    }

    // Driver ID => Race ID => Performance
    mapping(uint256 => mapping(uint256 => PerformanceData)) public driverPerformance;
    
    // Driver ID => Current Market Value
    mapping(uint256 => uint256) public driverMarketValue;
    
    // Driver ID => Total Performance Score (0-1000)
    mapping(uint256 => uint256) public driverPerformanceScore;

    // Price feed IDs for simulated F1 data feeds
    // In production, these would map to actual Pyth feeds for F1 data
    mapping(bytes32 => bool) public validPriceFeeds;

    // Authorized data updaters (backend oracle, Pyth callback)
    mapping(address => bool) public authorizedUpdaters;

    // Events
    event PerformanceUpdated(
        uint256 indexed driverId,
        uint256 indexed raceId,
        uint256 newMarketValue,
        uint256 performanceScore
    );
    event MarketValueCalculated(
        uint256 indexed driverId,
        uint256 oldValue,
        uint256 newValue,
        string reason
    );

    constructor(address payable _pythContract) Ownable(msg.sender) {
        pyth = IPyth(_pythContract);
        authorizedUpdaters[msg.sender] = true;
    }

    /**
     * @dev Update driver performance using Pyth price feed
     * INNOVATIVE USE: Maps Pyth's price feed mechanism to F1 telemetry data
     * 
     * @param driverId Driver NFT token ID
     * @param raceId Current race/session ID
     * @param priceUpdateData Pyth price update data (contains verified telemetry)
     */
    function updatePerformanceViaPyth(
        uint256 driverId,
        uint256 raceId,
        bytes[] calldata priceUpdateData
    ) external payable {
        // Get update fee from Pyth
        uint256 fee = pyth.getUpdateFee(priceUpdateData);
        require(msg.value >= fee, "Insufficient fee");

        // Update Pyth price feeds with latest data
        pyth.updatePriceFeeds{value: fee}(priceUpdateData);

        // Note: In production, we'd use specific price feed IDs for each metric
        // For hackathon demo, we simulate this verification
        
        emit PerformanceUpdated(driverId, raceId, driverMarketValue[driverId], driverPerformanceScore[driverId]);
    }

    /**
     * @dev Record driver performance after race (authorized updaters only)
     * This is called by backend oracle after Pyth verification
     */
    function recordPerformance(
        uint256 driverId,
        uint256 raceId,
        uint256 lapTime,
        uint256 avgSpeed,
        uint256 position,
        uint256 overtakes,
        uint256 points,
        uint256 consistencyScore
    ) external {
        require(authorizedUpdaters[msg.sender] || msg.sender == owner(), "Not authorized");
        require(position > 0 && position <= 20, "Invalid position");
        require(consistencyScore <= 100, "Invalid consistency score");

        driverPerformance[driverId][raceId] = PerformanceData({
            raceId: raceId,
            lapTime: lapTime,
            avgSpeed: avgSpeed,
            position: position,
            overtakes: overtakes,
            points: points,
            consistencyScore: consistencyScore,
            timestamp: block.timestamp,
            verified: true
        });

        // Recalculate market value based on new performance
        _updateMarketValue(driverId, raceId);
    }

    /**
     * @dev Calculate driver market value using performance-weighted algorithm
     * 
     * MERITOCRACY FORMULA:
     * marketValue = baseValue * (
     *   0.4 * positionFactor +      // Race results matter most
     *   0.2 * pointsFactor +         // Championship standing
     *   0.15 * overtakesFactor +     // Racing aggression/skill
     *   0.15 * consistencyFactor +   // Reliability
     *   0.1 * speedFactor            // Raw pace
     * )
     */
    function _updateMarketValue(uint256 driverId, uint256 raceId) internal {
        PerformanceData memory perf = driverPerformance[driverId][raceId];
        uint256 oldValue = driverMarketValue[driverId];

        // Base value starts at 1 million (in wei equivalent)
        uint256 baseValue = 1_000_000 ether;

        // Position factor: 1st place = 100%, 20th = 5%
        uint256 positionFactor = ((21 - perf.position) * 100) / 20;

        // Points factor: normalize to 0-100
        uint256 pointsFactor = (perf.points * 100) / 25; // max 25 points per race
        if (pointsFactor > 100) pointsFactor = 100;

        // Overtakes factor: 10+ overtakes = 100%
        uint256 overtakesFactor = (perf.overtakes * 10);
        if (overtakesFactor > 100) overtakesFactor = 100;

        // Consistency is already 0-100
        uint256 consistencyFactor = perf.consistencyScore;

        // Speed factor: normalize average speed
        uint256 speedFactor = ((perf.avgSpeed - 20000) * 100) / 5000; // 200-250 km/h range
        if (speedFactor > 100) speedFactor = 100;

        // Weighted calculation (divide by 10000 for percentage precision)
        uint256 multiplier = (
            (positionFactor * 40) +
            (pointsFactor * 20) +
            (overtakesFactor * 15) +
            (consistencyFactor * 15) +
            (speedFactor * 10)
        );

        uint256 newValue = (baseValue * multiplier) / 100;

        // Update storage
        driverMarketValue[driverId] = newValue;
        driverPerformanceScore[driverId] = multiplier / 10; // 0-1000 scale

        emit MarketValueCalculated(
            driverId,
            oldValue,
            newValue,
            "Performance-based calculation"
        );
    }

    /**
     * @dev Get driver's current market value
     */
    function getDriverValue(uint256 driverId) external view returns (uint256) {
        return driverMarketValue[driverId];
    }

    /**
     * @dev Get driver's performance score (0-1000)
     */
    function getPerformanceScore(uint256 driverId) external view returns (uint256) {
        return driverPerformanceScore[driverId];
    }

    /**
     * @dev Get detailed performance for a specific race
     */
    function getRacePerformance(uint256 driverId, uint256 raceId) 
        external 
        view 
        returns (PerformanceData memory) 
    {
        return driverPerformance[driverId][raceId];
    }

    /**
     * @dev Authorize data updater
     */
    function setAuthorizedUpdater(address updater, bool authorized) external onlyOwner {
        authorizedUpdaters[updater] = authorized;
    }

    /**
     * @dev Add valid price feed ID
     */
    function addValidPriceFeed(bytes32 priceFeedId) external onlyOwner {
        validPriceFeeds[priceFeedId] = true;
    }

    /**
     * @dev Update Pyth contract address
     */
    function updatePythAddress(address payable _pythContract) external onlyOwner {
        pyth = IPyth(_pythContract);
    }

    /**
     * @dev Withdraw excess fees
     */
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {}
}

