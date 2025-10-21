// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title TeamNFT
 * @dev Dynamic NFT for F1 teams with budget and performance tracking
 */
contract TeamNFT is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;

    // Team data stored on-chain
    struct TeamData {
        string name;
        string teamConstructor;
        string nationality;
        uint256 budget;          // in wei
        uint256 sponsorValue;    // in wei
        uint256 totalPoints;
        uint256 championshipsWon;
        uint256 driversCount;
        uint256 lastUpdated;
    }

    // Token ID counter (start from 1)
    uint256 private _nextTokenId = 1;

    // Mapping from token ID to team data
    mapping(uint256 => TeamData) public teamData;

    // Mapping from team name to token ID
    mapping(string => uint256) public teamNameToTokenId;

    // Authorized updaters
    mapping(address => bool) public authorizedUpdaters;

    // Budget cap (for financial fair play)
    uint256 public constant BUDGET_CAP = 145_000_000 ether; // $145M equivalent

    // Events
    event TeamMinted(uint256 indexed tokenId, string name, address indexed owner);
    event TeamDataUpdated(uint256 indexed tokenId, uint256 newBudget, uint256 newSponsorValue);
    event BudgetExceeded(uint256 indexed tokenId, uint256 attemptedBudget);

    constructor() ERC721("DrivetoSurvive Team", "DTS-TEAM") Ownable(msg.sender) {
        authorizedUpdaters[msg.sender] = true;
    }

    /**
     * @dev Mint a new team NFT
     */
    function mintTeam(
        address to,
        string memory name,
        string memory teamConstructor,
        string memory nationality,
        uint256 budget
    ) public onlyOwner returns (uint256) {
        require(teamNameToTokenId[name] == 0, "Team already exists");
        require(budget <= BUDGET_CAP, "Budget exceeds cap");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        teamData[tokenId] = TeamData({
            name: name,
            teamConstructor: teamConstructor,
            nationality: nationality,
            budget: budget,
            sponsorValue: 0,
            totalPoints: 0,
            championshipsWon: 0,
            driversCount: 0,
            lastUpdated: block.timestamp
        });

        teamNameToTokenId[name] = tokenId;

        emit TeamMinted(tokenId, name, to);
        return tokenId;
    }

    /**
     * @dev Update team budget (enforces budget cap)
     */
    function updateBudget(uint256 tokenId, uint256 newBudget) public {
        require(authorizedUpdaters[msg.sender] || msg.sender == owner(), "Not authorized");
        require(ownerOf(tokenId) != address(0), "Token does not exist");

        if (newBudget > BUDGET_CAP) {
            emit BudgetExceeded(tokenId, newBudget);
            revert("Budget exceeds cap");
        }

        teamData[tokenId].budget = newBudget;
        teamData[tokenId].lastUpdated = block.timestamp;
    }

    /**
     * @dev Update team data
     */
    function updateTeamData(
        uint256 tokenId,
        uint256 newBudget,
        uint256 newSponsorValue,
        uint256 totalPoints,
        uint256 championshipsWon,
        uint256 driversCount
    ) public {
        require(authorizedUpdaters[msg.sender] || msg.sender == owner(), "Not authorized");
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        require(newBudget <= BUDGET_CAP, "Budget exceeds cap");

        TeamData storage data = teamData[tokenId];
        data.budget = newBudget;
        data.sponsorValue = newSponsorValue;
        data.totalPoints = totalPoints;
        data.championshipsWon = championshipsWon;
        data.driversCount = driversCount;
        data.lastUpdated = block.timestamp;

        emit TeamDataUpdated(tokenId, newBudget, newSponsorValue);
    }

    /**
     * @dev Authorize/deauthorize an address to update data
     */
    function setAuthorizedUpdater(address updater, bool authorized) public onlyOwner {
        authorizedUpdaters[updater] = authorized;
    }

    /**
     * @dev Generate dynamic metadata JSON
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");

        TeamData memory data = teamData[tokenId];

        // Calculate budget utilization percentage
        uint256 budgetUtilization = (data.budget * 100) / BUDGET_CAP;

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        data.name,
                        '", "description": "DrivetoSurvive Team NFT - Manage your racing empire", ',
                        '"image": "ipfs://QmTeamImage/',
                        tokenId.toString(),
                        '", "attributes": [',
                        '{"trait_type": "Constructor", "value": "', data.teamConstructor, '"},',
                        '{"trait_type": "Nationality", "value": "', data.nationality, '"},',
                        '{"trait_type": "Budget (ETH)", "value": ', (data.budget / 1 ether).toString(), ', "display_type": "number"},',
                        '{"trait_type": "Budget Utilization", "value": ', budgetUtilization.toString(), ', "max_value": 100},',
                        '{"trait_type": "Sponsor Value (ETH)", "value": ', (data.sponsorValue / 1 ether).toString(), ', "display_type": "number"},',
                        '{"trait_type": "Total Points", "value": ', data.totalPoints.toString(), ', "display_type": "number"},',
                        '{"trait_type": "Championships", "value": ', data.championshipsWon.toString(), ', "display_type": "number"},',
                        '{"trait_type": "Active Drivers", "value": ', data.driversCount.toString(), ', "display_type": "number"}',
                        ']}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    /**
     * @dev Get team data by token ID
     */
    function getTeamData(uint256 tokenId) public view returns (TeamData memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return teamData[tokenId];
    }

    /**
     * @dev Get token ID by team name
     */
    function getTokenIdByName(string memory name) public view returns (uint256) {
        return teamNameToTokenId[name];
    }

    /**
     * @dev Check if a team is within budget cap
     */
    function isWithinBudgetCap(uint256 tokenId) public view returns (bool) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return teamData[tokenId].budget <= BUDGET_CAP;
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

