// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./GlobalClaimTracker.sol"; // Import the GlobalClaimTracker contract

contract TravelInsuranceClaim {
    GlobalClaimTracker public globalClaimTracker; // Reference to the GlobalClaimTracker

    constructor(address _globalClaimTracker) {
        globalClaimTracker = GlobalClaimTracker(_globalClaimTracker); // Initialize with the address of the GlobalClaimTracker
    }

    struct PolicyDetails {
        string policyNumber;
        string policyHolderName;
        string phoneNumber;
        string holderAddress;
        string dob;
        string gender;
        string nationality;
        string passportNumber;
        string email;
        string policyStartDate;
        string policyEndDate;
        string insuranceCompany;
        string brokerName;
    }

    struct TravelDetails {
        string departureDate;
        string returnDate;
        string source;
        string destination;
        string purposeOfTravel;
    }

    struct ClaimDetails {
        string typeOfClaim;
        string descriptionOfEvent;
        string amountClaimed;
        string attachedDocument;
    }

    struct BankDetails {
        string accountNumber;
        string bankName;
        string accountHolderName;
        string ifscNumber;
    }

    struct DeclarationDetails {
        string signature;
        string declarationDate;
    }

    struct Claim {
        PolicyDetails policyDetails;
        TravelDetails travelDetails;
        ClaimDetails claimDetails;
        BankDetails bankDetails;
        DeclarationDetails declarationDetails;
    }

    mapping(uint256 => Claim) public claims;
    uint256 public claimCount;

    event TravelClaimFiled(
        uint256 indexed claimId,
        string indexed policyNumber,
        string policyHolderName
    );

    function fileTravelClaim(
        PolicyDetails memory _policyDetails,
        TravelDetails memory _travelDetails,
        ClaimDetails memory _claimDetails,
        BankDetails memory _bankDetails,
        DeclarationDetails memory _declarationDetails
    ) external {
        // Check and register the claim with the GlobalClaimTracker
        bool isClaimed = globalClaimTracker.checkAndRegisterClaim(
            GlobalClaimTracker.ClaimType.Travel,
            _policyDetails.policyNumber
        );

        require(isClaimed, "Double dipping detected!");

        // Process the claim
        claims[++claimCount] = Claim(
            _policyDetails,
            _travelDetails,
            _claimDetails,
            _bankDetails,
            _declarationDetails
        );

        // Emit the event
        emit TravelClaimFiled(
            claimCount,
            _policyDetails.policyNumber,
            _policyDetails.policyHolderName
        );
    }

    // Optional: Function to check if a policy number has already been claimed
    function hasClaimed(
        string memory policyNumber
    ) external view returns (bool) {
        return
            globalClaimTracker.claimedPolicies(
                GlobalClaimTracker.ClaimType.Travel,
                policyNumber
            );
    }
}
