// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./PerformanceOracle.sol";
import "./DriverNFT.sol";
import "./TeamNFT.sol";

/**
 * @title TeamRecruitment
 * @dev Merit-based driver signing system - REMOVES PAY-TO-PLAY POLITICS
 * 
 * KEY INNOVATION:
 * - Teams can only sign drivers whose PERFORMANCE VALUE proves their skill
 * - Financial backing doesn't matter - objective metrics from Oracle do
 * - Young, deserving talent rises faster based on merit alone
 * - Anti-monopoly rules prevent top teams from hoarding all talent
 */
contract TeamRecruitment is Ownable, ReentrancyGuard {
    PerformanceOracle public performanceOracle;
    DriverNFT public driverNFT;
    TeamNFT public teamNFT;

    enum JobStatus { Open, Filled, Cancelled }
    enum ApplicationStatus { Pending, Accepted, Rejected }

    struct JobPosting {
        uint256 jobId;
        uint256 teamId;              // Team NFT token ID
        string position;             // "Main Driver", "Reserve", "Test Driver"
        uint256 minMarketValue;      // Minimum driver value required
        uint256 minPerformanceScore; // Minimum performance score (0-1000)
        uint256 salaryOffered;       // Offered salary in wei
        uint256 contractLength;      // In seconds
        JobStatus status;
        uint256 postedAt;
        uint256 filledAt;
        uint256 selectedDriverId;
    }

    struct DriverApplication {
        uint256 applicationId;
        uint256 jobId;
        uint256 driverId;
        address driverOwner;
        ApplicationStatus status;
        uint256 appliedAt;
        string message;
    }

    struct DriverContract {
        uint256 contractId;
        uint256 teamId;
        uint256 driverId;
        uint256 salary;
        uint256 startTime;
        uint256 endTime;
        bool active;
    }

    // Storage
    uint256 private _nextJobId = 1;
    uint256 private _nextApplicationId = 1;
    uint256 private _nextContractId = 1;

    mapping(uint256 => JobPosting) public jobPostings;
    mapping(uint256 => DriverApplication) public applications;
    mapping(uint256 => DriverContract) public contracts;
    
    mapping(uint256 => uint256[]) public teamToJobs;        // Team ID => Job IDs
    mapping(uint256 => uint256[]) public driverToApplications; // Driver ID => Application IDs
    mapping(uint256 => uint256) public driverToActiveContract; // Driver ID => Contract ID
    mapping(uint256 => uint256[]) public teamToContracts;   // Team ID => Contract IDs

    // Anti-monopoly: limit number of top drivers per team
    uint256 public constant MAX_TOP_TIER_DRIVERS_PER_TEAM = 2;
    uint256 public constant TOP_TIER_THRESHOLD = 800; // Performance score threshold

    // Events
    event JobPosted(
        uint256 indexed jobId,
        uint256 indexed teamId,
        uint256 minMarketValue,
        uint256 minPerformanceScore
    );
    event ApplicationSubmitted(
        uint256 indexed applicationId,
        uint256 indexed jobId,
        uint256 indexed driverId
    );
    event DriverSigned(
        uint256 indexed contractId,
        uint256 indexed teamId,
        uint256 indexed driverId,
        uint256 salary
    );
    event ApplicationRejected(uint256 indexed applicationId, string reason);
    event ContractTerminated(uint256 indexed contractId);

    constructor(
        address payable _performanceOracle,
        address _driverNFT,
        address _teamNFT
    ) Ownable(msg.sender) {
        performanceOracle = PerformanceOracle(_performanceOracle);
        driverNFT = DriverNFT(_driverNFT);
        teamNFT = TeamNFT(_teamNFT);
    }

    /**
     * @dev Team posts a job opening with merit-based requirements
     */
    function postJob(
        uint256 teamId,
        string memory position,
        uint256 minMarketValue,
        uint256 minPerformanceScore,
        uint256 salaryOffered,
        uint256 contractLength
    ) external returns (uint256) {
        require(teamNFT.ownerOf(teamId) == msg.sender, "Not team owner");
        require(minPerformanceScore <= 1000, "Invalid score");
        require(salaryOffered > 0, "Invalid salary");

        uint256 jobId = _nextJobId++;

        jobPostings[jobId] = JobPosting({
            jobId: jobId,
            teamId: teamId,
            position: position,
            minMarketValue: minMarketValue,
            minPerformanceScore: minPerformanceScore,
            salaryOffered: salaryOffered,
            contractLength: contractLength,
            status: JobStatus.Open,
            postedAt: block.timestamp,
            filledAt: 0,
            selectedDriverId: 0
        });

        teamToJobs[teamId].push(jobId);

        emit JobPosted(jobId, teamId, minMarketValue, minPerformanceScore);
        return jobId;
    }

    /**
     * @dev Driver applies for a job - AUTOMATIC ELIGIBILITY CHECK
     * This is where MERITOCRACY happens - system checks Oracle for real performance
     */
    function applyForJob(
        uint256 jobId,
        uint256 driverId,
        string memory message
    ) external returns (uint256) {
        require(driverNFT.ownerOf(driverId) == msg.sender, "Not driver owner");
        
        JobPosting storage job = jobPostings[jobId];
        require(job.status == JobStatus.Open, "Job not open");

        // CHECK MERIT-BASED ELIGIBILITY FROM ORACLE
        uint256 driverValue = performanceOracle.getDriverValue(driverId);
        uint256 performanceScore = performanceOracle.getPerformanceScore(driverId);

        require(
            driverValue >= job.minMarketValue,
            "Driver market value too low - improve performance"
        );
        require(
            performanceScore >= job.minPerformanceScore,
            "Performance score too low - need better results"
        );

        // Check if driver already has active contract
        require(
            driverToActiveContract[driverId] == 0,
            "Driver already under contract"
        );

        uint256 applicationId = _nextApplicationId++;

        applications[applicationId] = DriverApplication({
            applicationId: applicationId,
            jobId: jobId,
            driverId: driverId,
            driverOwner: msg.sender,
            status: ApplicationStatus.Pending,
            appliedAt: block.timestamp,
            message: message
        });

        driverToApplications[driverId].push(applicationId);

        emit ApplicationSubmitted(applicationId, jobId, driverId);
        return applicationId;
    }

    /**
     * @dev Team accepts application and signs driver
     * ANTI-MONOPOLY CHECK: Can't hoard all top talent
     */
    function acceptApplication(uint256 applicationId) external nonReentrant {
        DriverApplication storage app = applications[applicationId];
        require(app.status == ApplicationStatus.Pending, "Application not pending");

        JobPosting storage job = jobPostings[app.jobId];
        require(teamNFT.ownerOf(job.teamId) == msg.sender, "Not team owner");
        require(job.status == JobStatus.Open, "Job not open");

        // ANTI-MONOPOLY: Check if team already has too many top-tier drivers
        uint256 driverScore = performanceOracle.getPerformanceScore(app.driverId);
        if (driverScore >= TOP_TIER_THRESHOLD) {
            uint256 topDriverCount = _countTopTierDrivers(job.teamId);
            require(
                topDriverCount < MAX_TOP_TIER_DRIVERS_PER_TEAM,
                "Team already has max top-tier drivers - prevents monopoly"
            );
        }

        // Create contract
        uint256 contractId = _nextContractId++;
        contracts[contractId] = DriverContract({
            contractId: contractId,
            teamId: job.teamId,
            driverId: app.driverId,
            salary: job.salaryOffered,
            startTime: block.timestamp,
            endTime: block.timestamp + job.contractLength,
            active: true
        });

        // Update statuses
        app.status = ApplicationStatus.Accepted;
        job.status = JobStatus.Filled;
        job.filledAt = block.timestamp;
        job.selectedDriverId = app.driverId;

        driverToActiveContract[app.driverId] = contractId;
        teamToContracts[job.teamId].push(contractId);

        // Update driver's team in NFT
        driverNFT.updateDriverTeam(app.driverId, _getTeamName(job.teamId));

        emit DriverSigned(contractId, job.teamId, app.driverId, job.salaryOffered);
    }

    /**
     * @dev Reject application with reason
     */
    function rejectApplication(uint256 applicationId, string memory reason) external {
        DriverApplication storage app = applications[applicationId];
        require(app.status == ApplicationStatus.Pending, "Application not pending");

        JobPosting storage job = jobPostings[app.jobId];
        require(teamNFT.ownerOf(job.teamId) == msg.sender, "Not team owner");

        app.status = ApplicationStatus.Rejected;
        emit ApplicationRejected(applicationId, reason);
    }

    /**
     * @dev Terminate contract (either party can call if contract expired)
     */
    function terminateContract(uint256 contractId) external {
        DriverContract storage contract_ = contracts[contractId];
        require(contract_.active, "Contract not active");
        require(
            block.timestamp >= contract_.endTime ||
            teamNFT.ownerOf(contract_.teamId) == msg.sender ||
            driverNFT.ownerOf(contract_.driverId) == msg.sender,
            "Not authorized or contract not expired"
        );

        contract_.active = false;
        driverToActiveContract[contract_.driverId] = 0;

        emit ContractTerminated(contractId);
    }

    /**
     * @dev Count top-tier drivers in a team (anti-monopoly helper)
     */
    function _countTopTierDrivers(uint256 teamId) internal view returns (uint256) {
        uint256[] memory contractIds = teamToContracts[teamId];
        uint256 count = 0;

        for (uint256 i = 0; i < contractIds.length; i++) {
            DriverContract memory contract_ = contracts[contractIds[i]];
            if (contract_.active) {
                uint256 score = performanceOracle.getPerformanceScore(contract_.driverId);
                if (score >= TOP_TIER_THRESHOLD) {
                    count++;
                }
            }
        }

        return count;
    }

    /**
     * @dev Helper to get team name from TeamNFT
     */
    function _getTeamName(uint256 teamId) internal view returns (string memory) {
        TeamNFT.TeamData memory data = teamNFT.getTeamData(teamId);
        return data.name;
    }

    /**
     * @dev View functions
     */
    function getJobPosting(uint256 jobId) external view returns (
        uint256 teamId,
        string memory position,
        uint256 minMarketValue,
        uint256 minPerformanceScore,
        JobStatus status
    ) {
        JobPosting memory job = jobPostings[jobId];
        return (job.teamId, job.position, job.minMarketValue, job.minPerformanceScore, job.status);
    }

    function getTeamJobs(uint256 teamId) external view returns (uint256[] memory) {
        return teamToJobs[teamId];
    }

    function getDriverApplications(uint256 driverId) external view returns (uint256[] memory) {
        return driverToApplications[driverId];
    }

    function getDriverContract(uint256 driverId) external view returns (
        uint256 contractId,
        uint256 teamId,
        uint256 salary,
        uint256 endTime,
        bool active
    ) {
        contractId = driverToActiveContract[driverId];
        if (contractId == 0) return (0, 0, 0, 0, false);
        
        DriverContract memory contract_ = contracts[contractId];
        return (contractId, contract_.teamId, contract_.salary, contract_.endTime, contract_.active);
    }

    function getTeamDriverCount(uint256 teamId) external view returns (uint256 total, uint256 topTier) {
        uint256[] memory contractIds = teamToContracts[teamId];
        total = 0;
        topTier = 0;

        for (uint256 i = 0; i < contractIds.length; i++) {
            DriverContract memory contract_ = contracts[contractIds[i]];
            if (contract_.active) {
                total++;
                uint256 score = performanceOracle.getPerformanceScore(contract_.driverId);
                if (score >= TOP_TIER_THRESHOLD) {
                    topTier++;
                }
            }
        }
    }

    /**
     * @dev Admin functions
     */
    function updatePerformanceOracle(address payable _performanceOracle) external onlyOwner {
        performanceOracle = PerformanceOracle(_performanceOracle);
    }
}

