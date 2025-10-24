// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./TeamNFT.sol";
import "./PerformanceOracle.sol";

/**
 * @title FinancialFairPlay
 * @dev Enforces budget caps and prevents monopolies - ensures FINANCIAL BALANCE
 * 
 * PREVENTS:
 * - Rich teams monopolizing all top talent
 * - Buying success without merit
 * - Unfair competitive advantage through wealth alone
 * 
 * ENFORCES:
 * - Team salary caps (like NBA/NFL)
 * - Maximum roster value limits
 * - Balanced distribution of talent
 * - Penalties for violations
 */
contract FinancialFairPlay is Ownable {
    TeamNFT public teamNFT;
    PerformanceOracle public performanceOracle;

    // Financial limits
    uint256 public constant BUDGET_CAP = 145_000_000 ether; // $145M (same as TeamNFT)
    uint256 public constant SALARY_CAP = 50_000_000 ether;  // $50M max for driver salaries
    uint256 public constant MAX_DRIVER_SALARY = 15_000_000 ether; // $15M max per driver
    uint256 public constant MAX_ROSTER_VALUE = 100_000_000 ether; // Combined market value cap

    // Luxury tax rates (like NBA)
    uint256 public constant LUXURY_TAX_THRESHOLD = 40_000_000 ether;
    uint256 public constant LUXURY_TAX_RATE = 150; // 150% tax rate (1.5x)

    struct TeamFinancials {
        uint256 teamId;
        uint256 totalSalary;
        uint256 totalRosterValue;
        uint256 luxuryTaxOwed;
        uint256 lastAuditTime;
        bool inCompliance;
        uint256 violations;
    }

    struct Violation {
        uint256 violationId;
        uint256 teamId;
        string reason;
        uint256 penalty;
        uint256 timestamp;
        bool paid;
    }

    // Storage
    mapping(uint256 => TeamFinancials) public teamFinancials;
    mapping(uint256 => Violation) public violations;
    mapping(uint256 => uint256[]) public teamToViolations;
    
    uint256 private _nextViolationId = 1;

    // Driver salary tracking (teamId => driverId => salary)
    mapping(uint256 => mapping(uint256 => uint256)) public driverSalaries;
    
    // Events
    event FinancialsUpdated(uint256 indexed teamId, uint256 totalSalary, uint256 totalRosterValue);
    event ComplianceViolation(uint256 indexed teamId, string reason, uint256 penalty);
    event LuxuryTaxAssessed(uint256 indexed teamId, uint256 taxAmount);
    event ViolationPaid(uint256 indexed violationId, uint256 indexed teamId);
    event SalaryCapped(uint256 indexed teamId, uint256 attemptedSalary, uint256 maxAllowed);

    constructor(address _teamNFT, address payable _performanceOracle) Ownable(msg.sender) {
        teamNFT = TeamNFT(_teamNFT);
        performanceOracle = PerformanceOracle(_performanceOracle);
    }

    /**
     * @dev Register driver salary with team (called by TeamRecruitment contract)
     */
    function registerDriverSalary(
        uint256 teamId,
        uint256 driverId,
        uint256 salary
    ) external returns (bool) {
        require(teamNFT.ownerOf(teamId) != address(0), "Team doesn't exist");

        // Check individual salary cap
        require(salary <= MAX_DRIVER_SALARY, "Exceeds max driver salary");

        TeamFinancials storage financials = teamFinancials[teamId];
        uint256 newTotalSalary = financials.totalSalary + salary;

        // Check team salary cap
        if (newTotalSalary > SALARY_CAP) {
            emit SalaryCapped(teamId, newTotalSalary, SALARY_CAP);
            return false;
        }

        // Register salary
        driverSalaries[teamId][driverId] = salary;
        financials.totalSalary = newTotalSalary;
        financials.lastAuditTime = block.timestamp;

        // Calculate luxury tax if applicable
        if (newTotalSalary > LUXURY_TAX_THRESHOLD) {
            uint256 overage = newTotalSalary - LUXURY_TAX_THRESHOLD;
            uint256 tax = (overage * LUXURY_TAX_RATE) / 100;
            financials.luxuryTaxOwed += tax;
            
            emit LuxuryTaxAssessed(teamId, tax);
        }

        return true;
    }

    /**
     * @dev Calculate total roster value from Oracle
     * Prevents teams from hoarding all expensive talent
     */
    function calculateRosterValue(uint256 teamId, uint256[] calldata driverIds) external returns (uint256) {
        uint256 totalValue = 0;

        for (uint256 i = 0; i < driverIds.length; i++) {
            uint256 driverValue = performanceOracle.getDriverValue(driverIds[i]);
            totalValue += driverValue;
        }

        TeamFinancials storage financials = teamFinancials[teamId];
        financials.totalRosterValue = totalValue;
        financials.lastAuditTime = block.timestamp;

        // Check roster value cap
        if (totalValue > MAX_ROSTER_VALUE) {
            string memory reason = "Roster value exceeds cap - too much talent concentration";
            uint256 penalty = (totalValue - MAX_ROSTER_VALUE) / 1 ether; // Penalty = overage
            
            _issueViolation(teamId, reason, penalty);
            financials.inCompliance = false;
            financials.violations++;
        } else {
            financials.inCompliance = true;
        }

        emit FinancialsUpdated(teamId, financials.totalSalary, totalValue);
        return totalValue;
    }

    /**
     * @dev Audit team for compliance
     */
    function auditTeam(uint256 teamId, uint256[] calldata driverIds) external returns (bool) {
        TeamFinancials storage financials = teamFinancials[teamId];
        bool compliant = true;

        // Check budget cap (from TeamNFT)
        TeamNFT.TeamData memory teamDataStruct = teamNFT.getTeamData(teamId);
        if (teamDataStruct.budget > BUDGET_CAP) {
            _issueViolation(teamId, "Budget exceeds cap", (teamDataStruct.budget - BUDGET_CAP) / 1 ether);
            compliant = false;
        }

        // Check salary cap
        if (financials.totalSalary > SALARY_CAP) {
            _issueViolation(teamId, "Salary exceeds cap", (financials.totalSalary - SALARY_CAP) / 1 ether);
            compliant = false;
        }

        // Check roster value
        uint256 totalValue = 0;
        for (uint256 i = 0; i < driverIds.length; i++) {
            totalValue += performanceOracle.getDriverValue(driverIds[i]);
        }

        if (totalValue > MAX_ROSTER_VALUE) {
            _issueViolation(teamId, "Roster value too high", (totalValue - MAX_ROSTER_VALUE) / 1 ether);
            compliant = false;
        }

        financials.inCompliance = compliant;
        financials.lastAuditTime = block.timestamp;
        
        if (!compliant) {
            financials.violations++;
        }

        return compliant;
    }

    /**
     * @dev Issue a violation
     */
    function _issueViolation(uint256 teamId, string memory reason, uint256 penalty) internal {
        uint256 violationId = _nextViolationId++;

        violations[violationId] = Violation({
            violationId: violationId,
            teamId: teamId,
            reason: reason,
            penalty: penalty,
            timestamp: block.timestamp,
            paid: false
        });

        teamToViolations[teamId].push(violationId);

        emit ComplianceViolation(teamId, reason, penalty);
    }

    /**
     * @dev Pay violation penalty
     */
    function payViolation(uint256 violationId) external payable {
        Violation storage violation = violations[violationId];
        require(!violation.paid, "Already paid");
        require(
            teamNFT.ownerOf(violation.teamId) == msg.sender,
            "Not team owner"
        );
        require(msg.value >= violation.penalty, "Insufficient payment");

        violation.paid = true;
        emit ViolationPaid(violationId, violation.teamId);

        // Check if team is back in compliance
        TeamFinancials storage financials = teamFinancials[violation.teamId];
        uint256[] memory teamViolations = teamToViolations[violation.teamId];
        bool allPaid = true;
        
        for (uint256 i = 0; i < teamViolations.length; i++) {
            if (!violations[teamViolations[i]].paid) {
                allPaid = false;
                break;
            }
        }

        if (allPaid) {
            financials.inCompliance = true;
        }

        // Refund excess
        if (msg.value > violation.penalty) {
            payable(msg.sender).transfer(msg.value - violation.penalty);
        }
    }

    /**
     * @dev Check if team can sign a driver without violating caps
     */
    function canSignDriver(
        uint256 teamId,
        uint256 driverId,
        uint256 proposedSalary
    ) external view returns (bool, string memory) {
        TeamFinancials memory financials = teamFinancials[teamId];

        // Check individual salary
        if (proposedSalary > MAX_DRIVER_SALARY) {
            return (false, "Salary exceeds individual cap");
        }

        // Check team salary cap
        if (financials.totalSalary + proposedSalary > SALARY_CAP) {
            return (false, "Would exceed team salary cap");
        }

        // Check roster value
        uint256 driverValue = performanceOracle.getDriverValue(driverId);
        if (financials.totalRosterValue + driverValue > MAX_ROSTER_VALUE) {
            return (false, "Would exceed roster value cap");
        }

        return (true, "Can sign driver");
    }

    /**
     * @dev Calculate luxury tax for a team
     */
    function calculateLuxuryTax(uint256 teamId) external view returns (uint256) {
        TeamFinancials memory financials = teamFinancials[teamId];
        
        if (financials.totalSalary <= LUXURY_TAX_THRESHOLD) {
            return 0;
        }

        uint256 overage = financials.totalSalary - LUXURY_TAX_THRESHOLD;
        return (overage * LUXURY_TAX_RATE) / 100;
    }

    /**
     * @dev View functions
     */
    function getTeamFinancials(uint256 teamId) external view returns (
        uint256 totalSalary,
        uint256 totalRosterValue,
        uint256 luxuryTaxOwed,
        bool inCompliance,
        uint256 violationCount
    ) {
        TeamFinancials memory financials = teamFinancials[teamId];
        return (
            financials.totalSalary,
            financials.totalRosterValue,
            financials.luxuryTaxOwed,
            financials.inCompliance,
            financials.violations
        );
    }

    function getTeamViolations(uint256 teamId) external view returns (uint256[] memory) {
        return teamToViolations[teamId];
    }

    function getViolation(uint256 violationId) external view returns (
        uint256 teamId,
        string memory reason,
        uint256 penalty,
        bool paid
    ) {
        Violation memory violation = violations[violationId];
        return (violation.teamId, violation.reason, violation.penalty, violation.paid);
    }

    function getDriverSalary(uint256 teamId, uint256 driverId) external view returns (uint256) {
        return driverSalaries[teamId][driverId];
    }

    /**
     * @dev Get remaining cap space
     */
    function getRemainingCapSpace(uint256 teamId) external view returns (
        uint256 salaryCapSpace,
        uint256 rosterValueSpace
    ) {
        TeamFinancials memory financials = teamFinancials[teamId];
        
        salaryCapSpace = financials.totalSalary < SALARY_CAP 
            ? SALARY_CAP - financials.totalSalary 
            : 0;
            
        rosterValueSpace = financials.totalRosterValue < MAX_ROSTER_VALUE
            ? MAX_ROSTER_VALUE - financials.totalRosterValue
            : 0;
    }

    /**
     * @dev Admin functions
     */
    function updatePerformanceOracle(address payable _performanceOracle) external onlyOwner {
        performanceOracle = PerformanceOracle(_performanceOracle);
    }

    function withdrawPenalties() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {}
}

