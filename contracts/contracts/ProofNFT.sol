// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ProofNFT
 * @dev NFT minted to backers when milestones are verified and funds are released
 * @notice Represents proof of successful sponsorship milestone completion
 */
contract ProofNFT is ERC721, Ownable {
    
    using Strings for uint256;
    
    struct ProofData {
        uint256 poolId;
        uint256 milestoneId;
        uint256 amount;
        address sponsor;
        uint256 timestamp;
        string proofHash; // IPFS hash or other proof identifier
    }
    
    // Events
    event ProofMinted(
        uint256 indexed tokenId,
        uint256 indexed poolId,
        uint256 indexed milestoneId,
        address sponsor,
        uint256 amount,
        string proofHash
    );
    
    // State
    mapping(uint256 => ProofData) public proofs;
    mapping(address => uint256[]) public sponsorProofs;
    mapping(uint256 => uint256[]) public poolProofs;
    
    uint256 private _nextTokenId = 1;
    string private _baseTokenURI;
    
    constructor() ERC721("SponsorshipProof", "PROOF") Ownable(msg.sender) {
        _baseTokenURI = "https://ipfs.io/ipfs/";
    }
    
    /**
     * @dev Mint a proof NFT to a sponsor
     * @param to Sponsor address to mint to
     * @param poolId Pool ID
     * @param milestoneId Milestone ID
     * @param amount Amount released
     * @param proofHash Proof hash (IPFS or other)
     */
    function mintProof(
        address to,
        uint256 poolId,
        uint256 milestoneId,
        uint256 amount,
        string calldata proofHash
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
        proofs[tokenId] = ProofData({
            poolId: poolId,
            milestoneId: milestoneId,
            amount: amount,
            sponsor: to,
            timestamp: block.timestamp,
            proofHash: proofHash
        });
        
        sponsorProofs[to].push(tokenId);
        poolProofs[poolId].push(tokenId);
        
        _safeMint(to, tokenId);
        
        emit ProofMinted(tokenId, poolId, milestoneId, to, amount, proofHash);
        return tokenId;
    }
    
    /**
     * @dev Get proof data for a token
     * @param tokenId Token ID
     * @return proofData Proof data struct
     */
    function getProofData(uint256 tokenId) external view returns (ProofData memory) {
        return proofs[tokenId];
    }
    
    /**
     * @dev Get all proof IDs for a sponsor
     * @param sponsor Sponsor address
     * @return proofIds Array of proof token IDs
     */
    function getSponsorProofs(address sponsor) external view returns (uint256[] memory) {
        return sponsorProofs[sponsor];
    }
    
    /**
     * @dev Get all proof IDs for a pool
     * @param poolId Pool ID
     * @return proofIds Array of proof token IDs
     */
    function getPoolProofs(uint256 poolId) external view returns (uint256[] memory) {
        return poolProofs[poolId];
    }
    
    /**
     * @dev Get token URI
     * @param tokenId Token ID
     * @return Token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        ProofData memory proof = proofs[tokenId];
        return string(abi.encodePacked(
            _baseTokenURI,
            proof.proofHash,
            "/proof-",
            tokenId.toString(),
            ".json"
        ));
    }
    
    /**
     * @dev Set base token URI
     * @param baseURI New base URI
     */
    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Get total supply
     * @return Total number of minted tokens
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    /**
     * @dev Check if address owns any proof NFTs
     * @param owner Address to check
     * @return hasProofs Whether address owns proof NFTs
     */
    function hasProofs(address owner) external view returns (bool) {
        return sponsorProofs[owner].length > 0;
    }
}
