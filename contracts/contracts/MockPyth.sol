// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockPyth
 * @dev Mock contract for testing Pyth oracle integration
 */
contract MockPyth {
    mapping(bytes32 => uint256) private mockUpdateFees;

    function getUpdateFee(bytes[] calldata priceUpdateData) external pure returns (uint256) {
        // Return mock fee
        return 0.1 ether;
    }

    function updatePriceFeeds(bytes[] calldata priceUpdateData) external payable {
        // Mock implementation - just accept the call
        require(msg.value >= 0.1 ether, "Insufficient fee");
    }

    function setMockUpdateFee(bytes32 priceFeedId, uint256 fee) external {
        mockUpdateFees[priceFeedId] = fee;
    }

    function getMockUpdateFee(bytes32 priceFeedId) external view returns (uint256) {
        return mockUpdateFees[priceFeedId];
    }
}
