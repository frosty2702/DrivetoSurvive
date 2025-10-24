// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ValuationOracle
 * @dev On-chain valuation engine for driver market values
 * @notice Calculates PerformanceScore (P) + Sponsor_USD (S) + Demand_USD (D) → MarketValue
 */
contract ValuationOracle is Ownable {
    
    struct ValuationData {
        uint256 performanceScore; // P: 0-1000 scale
        uint256 sponsorValueUSD;  // S: USD value from sponsors
        uint256 demandValueUSD;   // D: USD value from fan demand
        uint256 marketValue;      // Final calculated market value
        uint256 timestamp;
        bool isValid;
    }
    
    struct PerformanceMetrics {
        uint256 racePosition;     // 1-20
        uint256 points;           // F1 points
        uint256 fastestLap;       // 0 or 1
        uint256 polePosition;     // 0 or 1
        uint256 dnf;              // 0 or 1 (did not finish)
        uint256 overtakes;        // Number of overtakes
        uint256 consistency;      // 0-100 consistency score
    }
    
    // Events
    event ValuationUpdated(
        uint256 indexed driverId,
        uint256 performanceScore,
        uint256 sponsorValueUSD,
        uint256 demandValueUSD,
        uint256 marketValue
    );
    
    event PerformanceRecorded(
        uint256 indexed driverId,
        uint256 racePosition,
        uint256 points,
        bool fastestLap,
        bool polePosition
    );
    
    // State
    mapping(uint256 => ValuationData) public valuations;
    mapping(uint256 => PerformanceMetrics) public performanceMetrics;
    mapping(address => bool) public authorizedUpdaters;
    
    // Weights for calculation (basis points: 10000 = 100%)
    uint256 public constant PERFORMANCE_WEIGHT = 5000;  // 50%
    uint256 public constant SPONSOR_WEIGHT = 3000;      // 30%
    uint256 public constant DEMAND_WEIGHT = 2000;       // 20%
    
    // Performance multipliers
    uint256 public constant WIN_MULTIPLIER = 1000;      // 100 points for win
    uint256 public constant POINTS_MULTIPLIER = 10;     // 10 points per F1 point
    uint256 public constant FASTEST_LAP_BONUS = 50;     // 50 point bonus
    uint256 public constant POLE_BONUS = 30;            // 30 point bonus
    uint256 public constant DNF_PENALTY = 100;          // 100 point penalty
    
    constructor() Ownable(msg.sender) {
        authorizedUpdaters[msg.sender] = true;
    }
    
    /**
     * @dev Record race performance for a driver
     * @param driverId Driver ID
     * @param metrics Performance metrics
     */
    function recordPerformance(
        uint256 driverId,
        PerformanceMetrics calldata metrics
    ) external onlyAuthorized {
        performanceMetrics[driverId] = metrics;
        
        // Calculate performance score
        uint256 performanceScore = _calculatePerformanceScore(metrics);
        
        // Update valuation
        _updateValuation(driverId, performanceScore);
        
        emit PerformanceRecorded(
            driverId,
            metrics.racePosition,
            metrics.points,
            metrics.fastestLap == 1,
            metrics.polePosition == 1
        );
    }
    
    /**
     * @dev Update sponsor value for a driver
     * @param driverId Driver ID
     * @param sponsorValueUSD New sponsor value in USD (wei)
     */
    function updateSponsorValue(
        uint256 driverId,
        uint256 sponsorValueUSD
    ) external onlyAuthorized {
        ValuationData storage valuation = valuations[driverId];
        valuation.sponsorValueUSD = sponsorValueUSD;
        valuation.timestamp = block.timestamp;
        valuation.isValid = true;
        
        // Recalculate market value
        _recalculateMarketValue(driverId);
    }
    
    /**
     * @dev Update demand value for a driver
     * @param driverId Driver ID
     * @param demandValueUSD New demand value in USD (wei)
     */
    function updateDemandValue(
        uint256 driverId,
        uint256 demandValueUSD
    ) external onlyAuthorized {
        ValuationData storage valuation = valuations[driverId];
        valuation.demandValueUSD = demandValueUSD;
        valuation.timestamp = block.timestamp;
        valuation.isValid = true;
        
        // Recalculate market value
        _recalculateMarketValue(driverId);
    }
    
    /**
     * @dev Calculate performance score from metrics
     * @param metrics Performance metrics
     * @return score Performance score (0-1000)
     */
    function _calculatePerformanceScore(PerformanceMetrics memory metrics) internal pure returns (uint256) {
        uint256 score = 0;
        
        // Position scoring (1st = 1000, 20th = 50)
        if (metrics.racePosition > 0 && metrics.racePosition <= 20) {
            score += (21 - metrics.racePosition) * 50; // Linear scale
        }
        
        // Points scoring
        score += metrics.points * POINTS_MULTIPLIER;
        
        // Bonuses
        if (metrics.fastestLap == 1) {
            score += FASTEST_LAP_BONUS;
        }
        if (metrics.polePosition == 1) {
            score += POLE_BONUS;
        }
        
        // Penalties
        if (metrics.dnf == 1) {
            score = score > DNF_PENALTY ? score - DNF_PENALTY : 0;
        }
        
        // Overtakes bonus (capped at 100 points)
        score += metrics.overtakes * 5;
        if (metrics.overtakes > 20) {
            score += 100; // Cap at 20 overtakes
        }
        
        // Consistency factor
        score = (score * (100 + metrics.consistency)) / 200;
        
        // Cap at 1000
        return score > 1000 ? 1000 : score;
    }
    
    /**
     * @dev Update valuation with new performance score
     * @param driverId Driver ID
     * @param performanceScore New performance score
     */
    function _updateValuation(uint256 driverId, uint256 performanceScore) internal {
        ValuationData storage valuation = valuations[driverId];
        valuation.performanceScore = performanceScore;
        valuation.timestamp = block.timestamp;
        valuation.isValid = true;
        
        // Recalculate market value
        _recalculateMarketValue(driverId);
    }
    
    /**
     * @dev Recalculate market value using current data
     * @param driverId Driver ID
     */
    function _recalculateMarketValue(uint256 driverId) internal {
        ValuationData storage valuation = valuations[driverId];
        
        // Calculate weighted market value
        uint256 marketValue = 0;
        
        // Performance component (0-1000 scale, weighted)
        marketValue += (valuation.performanceScore * PERFORMANCE_WEIGHT) / 10000;
        
        // Sponsor component (USD scale, weighted)
        marketValue += (valuation.sponsorValueUSD * SPONSOR_WEIGHT) / 10000;
        
        // Demand component (USD scale, weighted)
        marketValue += (valuation.demandValueUSD * DEMAND_WEIGHT) / 10000;
        
        valuation.marketValue = marketValue;
        
        emit ValuationUpdated(
            driverId,
            valuation.performanceScore,
            valuation.sponsorValueUSD,
            valuation.demandValueUSD,
            valuation.marketValue
        );
    }
    
    /**
     * @dev Get current valuation for a driver
     * @param driverId Driver ID
     * @return valuation Current valuation data
     */
    function getValuation(uint256 driverId) external view returns (ValuationData memory) {
        return valuations[driverId];
    }
    
    /**
     * @dev Get current performance metrics for a driver
     * @param driverId Driver ID
     * @return metrics Current performance metrics
     */
    function getPerformanceMetrics(uint256 driverId) external view returns (PerformanceMetrics memory) {
        return performanceMetrics[driverId];
    }
    
    /**
     * @dev Add authorized updater
     * @param updater Address to authorize
     */
    function addAuthorizedUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = true;
    }
    
    /**
     * @dev Remove authorized updater
     * @param updater Address to remove
     */
    function removeAuthorizedUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = false;
    }
    
    /**
     * @dev Modifier for authorized updaters
     */
    modifier onlyAuthorized() {
        require(authorizedUpdaters[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    /**
     * @dev Batch update multiple drivers
     * @param driverIds Array of driver IDs
     * @param metricsArray Array of performance metrics
     */
    function batchRecordPerformance(
        uint256[] calldata driverIds,
        PerformanceMetrics[] calldata metricsArray
    ) external onlyAuthorized {
        require(driverIds.length == metricsArray.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < driverIds.length; i++) {
            uint256 driverId = driverIds[i];
            PerformanceMetrics calldata metrics = metricsArray[i];
            
            performanceMetrics[driverId] = metrics;
            
            // Calculate performance score
            uint256 performanceScore = _calculatePerformanceScore(metrics);
            
            // Update valuation
            _updateValuation(driverId, performanceScore);
            
            emit PerformanceRecorded(
                driverId,
                metrics.racePosition,
                metrics.points,
                metrics.fastestLap == 1,
                metrics.polePosition == 1
            );
        }
    }
}
