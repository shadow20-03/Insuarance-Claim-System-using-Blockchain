// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./GlobalClaimTracker.sol"; // Import the GlobalClaimTracker contract

contract LifeInsuranceClaim {
    GlobalClaimTracker public globalClaimTracker; // Reference to the GlobalClaimTracker

    constructor(address _globalClaimTracker) {
        globalClaimTracker = GlobalClaimTracker(_globalClaimTracker); // Initialize with the address of the GlobalClaimTracker
    }

    struct PolicyDetails {
        string policyNumber;
        string policyHolderName;
        string companyName;
        string dob;
        string gender;
        uint256 ageonDeath;
        string dateofDeath;
        string timeOfDeath;
        string causeOfDeath;
        string placeOfDeath;
    }

    struct NomineeDetails {
        string nomineeName;
        string nomineedob;
        string nomineegender;
        string relationshipWithDeceased;
        string currentAddress;
        string phonenumber;
    }

    struct MedicalDetails {
        string natureofIllness;
        string dateofDiagnosis;
        string treatmentTaken;
        string firAttachment;
        string doctorDetails;
        string hospitalName;
        string hospitalAddress;
        string hasOtherPolicy;
    }

    struct BankDetails {
        string accountNumber;
        string bankName;
        string panNumber;
        string ifscNumber;
    }

    struct Claim {
        PolicyDetails policyDetails;
        NomineeDetails nomineeDetails;
        MedicalDetails medicalDetails;
        BankDetails bankDetails;
    }

    mapping(uint256 => Claim) public claims;
    uint256 public claimCount;

    event LifeClaimFiled(
        uint256 indexed claimId,
        string indexed policyNumber,
        string policyHolderName
    );

    function fileLifeClaim(
        PolicyDetails memory _policyDetails,
        NomineeDetails memory _nomineeDetails,
        MedicalDetails memory _medicalDetails,
        BankDetails memory _bankDetails
    ) external {
        // Check and register the claim with the GlobalClaimTracker
        bool isClaimed = globalClaimTracker.checkAndRegisterClaim(
            GlobalClaimTracker.ClaimType.Life,
            _policyDetails.policyNumber
        );

        require(isClaimed, "Double dipping detected!");

        // Process the claim
        claims[++claimCount] = Claim(
            _policyDetails,
            _nomineeDetails,
            _medicalDetails,
            _bankDetails
        );

        // Emit the event
        emit LifeClaimFiled(
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
                GlobalClaimTracker.ClaimType.Life,
                policyNumber
            );
    }
}
