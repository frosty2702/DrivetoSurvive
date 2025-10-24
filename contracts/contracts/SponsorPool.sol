// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SponsorPool
 * @dev Handles sponsor deposits to driver pools with concentration limits
 * @notice Enforces HHI (Herfindahl-Hirschman Index) concentration caps
 */
contract SponsorPool is Ownable {
    
    struct Pool {
        uint256 totalDeposits;
        uint256 maxConcentration; // Max % any single sponsor can hold
        bool isActive;
        mapping(address => uint256) sponsorDeposits;
        address[] sponsors;
    }
    
    struct ConcentrationCheck {
        uint256 hhi; // Herfindahl-Hirschman Index
        bool isConcentrated; // True if HHI > threshold
        uint256 threshold; // HHI threshold for concentration
    }
    
    // Events
    event SponsorDeposit(
        uint256 indexed poolId, 
        address indexed sponsor, 
        uint256 amount,
        uint256 newHHI
    );
    event PoolCreated(uint256 indexed poolId, uint256 maxConcentration);
    event ConcentrationWarning(uint256 indexed poolId, uint256 hhi, uint256 threshold);
    
    // State
    mapping(uint256 => Pool) public pools;
    mapping(address => bool) public authorizedTokens;
    uint256 public constant HHI_THRESHOLD = 2500; // 25% concentration threshold
    uint256 public nextPoolId = 1;
    
    constructor() Ownable(msg.sender) {
        // Default authorized token (USDC testnet) - will be set after MockUSDC deployment
    }
    
    /**
     * @dev Create a new sponsor pool for a driver
     * @param maxConcentration Maximum concentration percentage (basis points, e.g., 2500 = 25%)
     */
    function createPool(uint256 maxConcentration) external onlyOwner returns (uint256) {
        uint256 poolId = nextPoolId++;
        pools[poolId].maxConcentration = maxConcentration;
        pools[poolId].isActive = true;
        
        emit PoolCreated(poolId, maxConcentration);
        return poolId;
    }
    
    /**
     * @dev Deposit funds to a driver pool
     * @param poolId The pool ID
     * @param token Token contract address
     * @param amount Amount to deposit
     */
    function depositToPool(
        uint256 poolId,
        address token,
        uint256 amount
    ) external {
        require(pools[poolId].isActive, "Pool not active");
        require(authorizedTokens[token], "Token not authorized");
        require(amount > 0, "Amount must be positive");
        
        // Transfer tokens from sponsor
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        // Update sponsor deposit
        if (pools[poolId].sponsorDeposits[msg.sender] == 0) {
            pools[poolId].sponsors.push(msg.sender);
        }
        pools[poolId].sponsorDeposits[msg.sender] += amount;
        pools[poolId].totalDeposits += amount;
        
        // Check concentration
        ConcentrationCheck memory check = _calculateConcentration(poolId);
        
        if (check.isConcentrated) {
            emit ConcentrationWarning(poolId, check.hhi, check.threshold);
        }
        
        emit SponsorDeposit(poolId, msg.sender, amount, check.hhi);
    }
    
    /**
     * @dev Calculate HHI for a pool
     * @param poolId The pool ID
     * @return check Concentration check results
     */
    function _calculateConcentration(uint256 poolId) internal view returns (ConcentrationCheck memory) {
        uint256 total = pools[poolId].totalDeposits;
        if (total == 0) {
            return ConcentrationCheck(0, false, HHI_THRESHOLD);
        }
        
        uint256 hhi = 0;
        address[] memory sponsors = pools[poolId].sponsors;
        
        for (uint256 i = 0; i < sponsors.length; i++) {
            uint256 share = (pools[poolId].sponsorDeposits[sponsors[i]] * 10000) / total;
            hhi += (share * share) / 100; // Convert to HHI scale
        }
        
        return ConcentrationCheck(hhi, hhi > HHI_THRESHOLD, HHI_THRESHOLD);
    }
    
    /**
     * @dev Get concentration data for a pool
     * @param poolId The pool ID
     * @return hhi Herfindahl-Hirschman Index
     * @return isConcentrated Whether pool is concentrated
     * @return threshold HHI threshold
     */
    function getConcentration(uint256 poolId) external view returns (uint256 hhi, bool isConcentrated, uint256 threshold) {
        ConcentrationCheck memory check = _calculateConcentration(poolId);
        return (check.hhi, check.isConcentrated, check.threshold);
    }
    
    /**
     * @dev Get pool data
     * @param poolId The pool ID
     * @return totalDeposits Total deposits in pool
     * @return maxConcentration Max concentration allowed
     * @return isActive Whether pool is active
     * @return sponsorCount Number of sponsors
     */
    function getPoolData(uint256 poolId) external view returns (
        uint256 totalDeposits,
        uint256 maxConcentration,
        bool isActive,
        uint256 sponsorCount
    ) {
        Pool storage pool = pools[poolId];
        return (
            pool.totalDeposits,
            pool.maxConcentration,
            pool.isActive,
            pool.sponsors.length
        );
    }
    
    /**
     * @dev Get sponsor data for a pool
     * @param poolId The pool ID
     * @param sponsor Sponsor address
     * @return depositAmount Amount deposited by sponsor
     * @return percentageShare Percentage share of total pool
     */
    function getSponsorData(uint256 poolId, address sponsor) external view returns (
        uint256 depositAmount,
        uint256 percentageShare
    ) {
        uint256 deposit = pools[poolId].sponsorDeposits[sponsor];
        uint256 total = pools[poolId].totalDeposits;
        uint256 percentage = total > 0 ? (deposit * 10000) / total : 0;
        
        return (deposit, percentage);
    }
    
    /**
     * @dev Add authorized token
     * @param token Token address to authorize
     */
    function addAuthorizedToken(address token) external onlyOwner {
        authorizedTokens[token] = true;
    }
    
    /**
     * @dev Remove authorized token
     * @param token Token address to remove
     */
    function removeAuthorizedToken(address token) external onlyOwner {
        authorizedTokens[token] = false;
    }
    
    /**
     * @dev Withdraw funds from pool (only owner)
     * @param poolId Pool ID
     * @param token Token address
     * @param amount Amount to withdraw
     */
    function withdrawFromPool(
        uint256 poolId,
        address token,
        uint256 amount
    ) external onlyOwner {
        require(amount <= pools[poolId].totalDeposits, "Insufficient balance");
        IERC20(token).transfer(owner(), amount);
        pools[poolId].totalDeposits -= amount;
    }
}
