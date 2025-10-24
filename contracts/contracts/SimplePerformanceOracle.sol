// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimplePerformanceOracle
 * @dev Simplified performance oracle for Hedera without Pyth dependency
 * @notice Records F1 performance data and calculates driver market values
 */
contract SimplePerformanceOracle is Ownable {
    
    struct PerformanceData {
        uint256 raceId;
        uint256 lapTime;          // in milliseconds
        uint256 avgSpeed;         // km/h * 100 (for precision)
        uint256 position;         // finish position (1-20)
        uint256 overtakes;        // number of overtakes
        uint256 points;           // championship points
        uint256 consistencyScore; // 0-100
        uint256 timestamp;
    }
    
    // Performance metrics stored on-chain
    mapping(uint256 => mapping(uint256 => PerformanceData)) public driverPerformance;
    mapping(uint256 => uint256) public driverMarketValue;
    mapping(uint256 => uint256) public driverPerformanceScore;
    mapping(address => bool) public authorizedUpdaters;
    
    // Events
    event PerformanceUpdated(uint256 indexed driverId, uint256 indexed raceId, uint256 newMarketValue, uint256 newPerformanceScore);
    event MarketValueUpdated(uint256 indexed driverId, uint256 newMarketValue);
    
    constructor() Ownable(msg.sender) {
        authorizedUpdaters[msg.sender] = true;
    }
    
    /**
     * @dev Record driver performance after race (authorized updaters only)
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
            timestamp: block.timestamp
        });
        
        // Calculate performance score (0-1000)
        uint256 performanceScore = _calculatePerformanceScore(position, points, overtakes, consistencyScore);
        driverPerformanceScore[driverId] = performanceScore;
        
        // Calculate market value based on performance
        uint256 marketValue = _calculateMarketValue(performanceScore, points, position);
        driverMarketValue[driverId] = marketValue;
        
        emit PerformanceUpdated(driverId, raceId, marketValue, performanceScore);
    }
    
    /**
     * @dev Calculate performance score from race data
     */
    function _calculatePerformanceScore(
        uint256 position,
        uint256 points,
        uint256 overtakes,
        uint256 consistencyScore
    ) internal pure returns (uint256) {
        uint256 score = 0;
        
        // Position scoring (1st = 1000, 20th = 50)
        if (position > 0 && position <= 20) {
            score += (21 - position) * 50; // Linear scale
        }
        
        // Points scoring
        score += points * 10;
        
        // Overtakes bonus (capped at 100 points)
        score += overtakes * 5;
        if (overtakes > 20) {
            score += 100; // Cap at 20 overtakes
        }
        
        // Consistency factor
        score = (score * (100 + consistencyScore)) / 200;
        
        // Cap at 1000
        return score > 1000 ? 1000 : score;
    }
    
    /**
     * @dev Calculate market value based on performance
     */
    function _calculateMarketValue(
        uint256 performanceScore,
        uint256 points,
        uint256 position
    ) internal pure returns (uint256) {
        // Base market value calculation
        uint256 baseValue = performanceScore * 10000; // Convert to wei scale
        
        // Position bonus/penalty
        if (position == 1) {
            baseValue = (baseValue * 150) / 100; // 50% bonus for win
        } else if (position <= 3) {
            baseValue = (baseValue * 125) / 100; // 25% bonus for podium
        } else if (position <= 10) {
            baseValue = (baseValue * 110) / 100; // 10% bonus for points
        }
        
        return baseValue;
    }
    
    /**
     * @dev Get current performance score for a driver
     */
    function getPerformanceScore(uint256 driverId) external view returns (uint256) {
        return driverPerformanceScore[driverId];
    }
    
    /**
     * @dev Get current market value for a driver
     */
    function getMarketValue(uint256 driverId) external view returns (uint256) {
        return driverMarketValue[driverId];
    }
    
    /**
     * @dev Get performance data for a specific race
     */
    function getPerformanceData(uint256 driverId, uint256 raceId) external view returns (PerformanceData memory) {
        return driverPerformance[driverId][raceId];
    }
    
    /**
     * @dev Add authorized updater
     */
    function addAuthorizedUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = true;
    }
    
    /**
     * @dev Remove authorized updater
     */
    function removeAuthorizedUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = false;
    }
    
    /**
     * @dev Batch update multiple drivers
     */
    function batchRecordPerformance(
        uint256[] calldata driverIds,
        uint256[] calldata raceIds,
        uint256[] calldata lapTimes,
        uint256[] calldata avgSpeeds,
        uint256[] calldata positions,
        uint256[] calldata overtakes,
        uint256[] calldata points,
        uint256[] calldata consistencyScores
    ) external {
        require(authorizedUpdaters[msg.sender] || msg.sender == owner(), "Not authorized");
        require(driverIds.length == raceIds.length, "Arrays length mismatch");
        require(driverIds.length == positions.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < driverIds.length; i++) {
            uint256 driverId = driverIds[i];
            uint256 raceId = raceIds[i];
            uint256 lapTime = lapTimes[i];
            uint256 avgSpeed = avgSpeeds[i];
            uint256 position = positions[i];
            uint256 overtake = overtakes[i];
            uint256 point = points[i];
            uint256 consistencyScore = consistencyScores[i];
            
            require(position > 0 && position <= 20, "Invalid position");
            require(consistencyScore <= 100, "Invalid consistency score");

            driverPerformance[driverId][raceId] = PerformanceData({
                raceId: raceId,
                lapTime: lapTime,
                avgSpeed: avgSpeed,
                position: position,
                overtakes: overtake,
                points: point,
                consistencyScore: consistencyScore,
                timestamp: block.timestamp
            });
            
            // Calculate performance score (0-1000)
            uint256 performanceScore = _calculatePerformanceScore(position, point, overtake, consistencyScore);
            driverPerformanceScore[driverId] = performanceScore;
            
            // Calculate market value based on performance
            uint256 marketValue = _calculateMarketValue(performanceScore, point, position);
            driverMarketValue[driverId] = marketValue;
            
            emit PerformanceUpdated(driverId, raceId, marketValue, performanceScore);
        }
    }
}
