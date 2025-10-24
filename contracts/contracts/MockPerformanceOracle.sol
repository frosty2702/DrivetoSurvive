// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockPerformanceOracle
 * @dev Mock contract for testing performance oracle functionality
 */
contract MockPerformanceOracle {
    mapping(uint256 => uint256) private driverScores;
    mapping(uint256 => uint256) private driverValues;

    function getPerformanceScore(uint256 driverId) external view returns (uint256) {
        return driverScores[driverId];
    }

    function getDriverValue(uint256 driverId) external view returns (uint256) {
        return driverValues[driverId];
    }

    function setDriverScore(uint256 driverId, uint256 score) external {
        driverScores[driverId] = score;
    }

    function setDriverValue(uint256 driverId, uint256 value) external {
        driverValues[driverId] = value;
    }
}
