// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title DriverNFT
 * @dev Dynamic NFT for F1 drivers with performance-based metadata updates
 */
contract DriverNFT is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;

    // Driver stats stored on-chain
    struct DriverStats {
        string name;
        string nationality;
        string team;
        uint256 marketValue;      // in wei
        uint256 performanceScore; // 0-100
        uint256 totalRaces;
        uint256 totalWins;
        uint256 totalPodiums;
        uint256 totalPoints;
        uint256 lastUpdated;
    }

    // Token ID counter (start from 1 to avoid confusion with default 0)
    uint256 private _nextTokenId = 1;

    // Mapping from token ID to driver stats
    mapping(uint256 => DriverStats) public driverStats;

    // Mapping from driver name to token ID (prevent duplicate drivers)
    mapping(string => uint256) public driverNameToTokenId;

    // Authorized updaters (e.g., oracle, backend API)
    mapping(address => bool) public authorizedUpdaters;

    // Events
    event DriverMinted(uint256 indexed tokenId, string name, address indexed owner);
    event StatsUpdated(uint256 indexed tokenId, uint256 newMarketValue, uint256 newPerformanceScore);
    event UpdaterAuthorized(address indexed updater, bool authorized);

    constructor() ERC721("DrivetoSurvive Driver", "DTS-DRIVER") Ownable(msg.sender) {
        // Owner is automatically an authorized updater
        authorizedUpdaters[msg.sender] = true;
    }

    /**
     * @dev Mint a new driver NFT
     */
    function mintDriver(
        address to,
        string memory name,
        string memory nationality,
        string memory team,
        uint256 marketValue,
        uint256 performanceScore
    ) public onlyOwner returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(driverNameToTokenId[name] == 0, "Driver already exists");
        require(performanceScore <= 100, "Performance score must be <= 100");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        // Store driver stats
        driverStats[tokenId] = DriverStats({
            name: name,
            nationality: nationality,
            team: team,
            marketValue: marketValue,
            performanceScore: performanceScore,
            totalRaces: 0,
            totalWins: 0,
            totalPodiums: 0,
            totalPoints: 0,
            lastUpdated: block.timestamp
        });

        driverNameToTokenId[name] = tokenId;

        emit DriverMinted(tokenId, name, to);
        return tokenId;
    }

    /**
     * @dev Update driver stats (only authorized updaters)
     */
    function updateDriverStats(
        uint256 tokenId,
        uint256 newMarketValue,
        uint256 newPerformanceScore,
        uint256 totalRaces,
        uint256 totalWins,
        uint256 totalPodiums,
        uint256 totalPoints
    ) public {
        require(authorizedUpdaters[msg.sender] || msg.sender == owner(), "Not authorized");
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        require(newPerformanceScore <= 100, "Performance score must be <= 100");

        DriverStats storage stats = driverStats[tokenId];
        stats.marketValue = newMarketValue;
        stats.performanceScore = newPerformanceScore;
        stats.totalRaces = totalRaces;
        stats.totalWins = totalWins;
        stats.totalPodiums = totalPodiums;
        stats.totalPoints = totalPoints;
        stats.lastUpdated = block.timestamp;

        emit StatsUpdated(tokenId, newMarketValue, newPerformanceScore);
    }

    /**
     * @dev Update driver team
     */
    function updateDriverTeam(uint256 tokenId, string memory newTeam) public {
        require(authorizedUpdaters[msg.sender] || msg.sender == owner(), "Not authorized");
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        
        driverStats[tokenId].team = newTeam;
        driverStats[tokenId].lastUpdated = block.timestamp;
    }

    /**
     * @dev Authorize/deauthorize an address to update stats
     */
    function setAuthorizedUpdater(address updater, bool authorized) public onlyOwner {
        authorizedUpdaters[updater] = authorized;
        emit UpdaterAuthorized(updater, authorized);
    }

    /**
     * @dev Generate dynamic metadata JSON
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");

        DriverStats memory stats = driverStats[tokenId];

        // Generate dynamic JSON metadata
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        stats.name,
                        '", "description": "DrivetoSurvive Driver NFT - Performance-based digital collectible", ',
                        '"image": "ipfs://QmDriverImage/', // Placeholder
                        tokenId.toString(),
                        '", "attributes": [',
                        '{"trait_type": "Nationality", "value": "', stats.nationality, '"},',
                        '{"trait_type": "Team", "value": "', stats.team, '"},',
                        '{"trait_type": "Market Value", "value": ', (stats.marketValue / 1 ether).toString(), ', "display_type": "number"},',
                        '{"trait_type": "Performance Score", "value": ', stats.performanceScore.toString(), ', "max_value": 100},',
                        '{"trait_type": "Total Races", "value": ', stats.totalRaces.toString(), ', "display_type": "number"},',
                        '{"trait_type": "Total Wins", "value": ', stats.totalWins.toString(), ', "display_type": "number"},',
                        '{"trait_type": "Total Podiums", "value": ', stats.totalPodiums.toString(), ', "display_type": "number"},',
                        '{"trait_type": "Total Points", "value": ', stats.totalPoints.toString(), ', "display_type": "number"}',
                        ']}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    /**
     * @dev Get driver stats by token ID
     */
    function getDriverStats(uint256 tokenId) public view returns (DriverStats memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return driverStats[tokenId];
    }

    /**
     * @dev Get token ID by driver name
     */
    function getTokenIdByName(string memory name) public view returns (uint256) {
        return driverNameToTokenId[name];
    }

    // Override required functions
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

