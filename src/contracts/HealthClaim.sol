// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./GlobalClaimTracker.sol"; // Import the GlobalClaimTracker contract

contract HealthInsuranceClaim {
    GlobalClaimTracker public globalClaimTracker; // Reference to the GlobalClaimTracker

    constructor(address _globalClaimTracker) {
        globalClaimTracker = GlobalClaimTracker(_globalClaimTracker); // Initialize with the address of the GlobalClaimTracker
    }

    struct PolicyDetails {
        string companyName;
        string policyNumber;
        string policyHolderName;
        string phoneNumber;
        string holderAddress;
        string dob;
        string gender;
    }

    struct MedicalDetails {
        string diseaseDetails;
        uint256 diseaseDuration;
        string firAttachment;
        string previousHospitalizedRecord;
        string doctorDetails;
        uint256 treatmentAmountSpent;
        string hospitalName;
        string hospitalAddress;
        string hasOtherPolicy;
        string icuSurgeryDetails;
    }

    struct BankDetails {
        string accountNumber;
        string bankName;
        string panNumber;
        string ifscNumber;
    }

    struct Claim {
        PolicyDetails policyDetails;
        MedicalDetails medicalDetails;
        BankDetails bankDetails;
    }

    mapping(uint256 => Claim) public claims;
    uint256 public claimCount;

    event HealthClaimFiled(
        uint256 indexed claimId,
        string indexed policyNumber,
        string policyHolderName
    );

    function fileHealthClaim(
        PolicyDetails memory _policyDetails,
        MedicalDetails memory _medicalDetails,
        BankDetails memory _bankDetails
    ) external {
        // Check and register the claim with the GlobalClaimTracker
        bool isClaimed = globalClaimTracker.checkAndRegisterClaim(
            GlobalClaimTracker.ClaimType.Health,
            _policyDetails.policyNumber
        );

        require(isClaimed, "Double dipping detected!");

        // Process the claim
        claims[++claimCount] = Claim(
            _policyDetails,
            _medicalDetails,
            _bankDetails
        );

        // Emit the event
        emit HealthClaimFiled(
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
            globalClaimTracker.isClaimed(
                GlobalClaimTracker.ClaimType.Health,
                policyNumber
            );
    }
}
