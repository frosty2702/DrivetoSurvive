// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @dev Mock USDC token for testing purposes
 * @notice Simulates USDC stablecoin for sponsor deposits
 */
contract MockUSDC is ERC20, Ownable {
    
    constructor() ERC20("Mock USDC", "mUSDC") Ownable(msg.sender) {
        // Mint initial supply to deployer
        _mint(msg.sender, 1000000 * 10**6); // 1M USDC (6 decimals)
    }
    
    /**
     * @dev Mint tokens to any address (for testing)
     * @param to Address to mint to
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Get decimals (USDC uses 6 decimals)
     * @return Number of decimals
     */
    function decimals() public pure override returns (uint8) {
        return 6;
    }
    
    /**
     * @dev Faucet function for testing (anyone can call)
     * @param amount Amount to mint to caller
     */
    function faucet(uint256 amount) external {
        require(amount <= 1000 * 10**6, "Max 1000 USDC per faucet call");
        _mint(msg.sender, amount);
    }
}
