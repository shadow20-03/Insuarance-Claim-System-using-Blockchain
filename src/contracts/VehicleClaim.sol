// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./GlobalClaimTracker.sol"; // Import the GlobalClaimTracker contract

contract VehicleInsuranceClaim {
    GlobalClaimTracker public globalClaimTracker; // Reference to the GlobalClaimTracker

    constructor(address _globalClaimTracker) {
        globalClaimTracker = GlobalClaimTracker(_globalClaimTracker); // Initialize with the address of the GlobalClaimTracker
    }

    struct PolicyDetails {
        string policyNumber;
        string policyHolderName;
        bytes32 phoneNumber;
        bytes32 holderAddress;
        bytes32 district;
        bytes32 pinCode;
        bytes32 email;
        bytes32 panNo;
        bytes32 aadhar;
        bytes32 yearlyIncome;
        bytes32 occupation;
        bytes32 dob;
        bytes32 gender;
        bytes32 insuranceCompany;
        uint8 familyMembers;
        uint8 membersOver18;
        uint8 membersDrive;
        uint8 numberOfVehicle;
        bytes32 averageKM;
        bytes32 antitheftDevice;
        bytes32 haveClaimedInYear;
        bytes32 usage;
    }

    struct VehicleDetails {
        bytes32 vehicleRegistrationNo;
        bytes32 vehicleModel;
        bytes32 dateOfRegistration;
        bytes32 mileage;
        bytes32 km;
        bytes32 chassisNo;
        bytes32 engineNo;
        bytes32 classOfVehicle;
    }

    struct DriverDetails {
        bytes32 driverName;
        bytes32 driverAddress;
        bytes32 relationshipWithDriver;
        bytes32 driverGender;
        bytes32 wasDriverDrunk;
        bytes32 drivingLicenseNo;
        bytes32 licenseIssueAuthority;
        bytes32 dateOfExpiry;
        bytes32 typeOfLicense;
        bytes32 detailsOfSuspension;
        bytes32 licenseTemporary;
    }

    struct AccidentDetails {
        bytes32 dateOfAccident;
        bytes32 timeOfAccident;
        bytes32 location;
        bytes32 descriptionOfAccident;
        bytes32 thirdPartyResponsible;
        bytes32 detailOfThirdParty;
        bytes32 reportedToPolice;
        bytes32 policeDetails;
        bytes32 repairCost;
        bytes32 supportingDocument;
    }

    struct BankDetails {
        string accountNumber;
        string bankName;
        string panNumber;
        string ifscNumber;
    }

    struct Claim {
        PolicyDetails policyDetails;
        VehicleDetails vehicleDetails;
        DriverDetails driverDetails;
        AccidentDetails accidentDetails;
        BankDetails bankDetails;
    }

    mapping(uint256 => Claim) public claims;
    uint256 public claimCount;

    event VehicleClaimFiled(
        uint256 indexed claimId,
        string indexed policyNumber,
        string policyHolderName
    );

    function fileVehicleClaim(
        PolicyDetails memory _policyDetails,
        VehicleDetails memory _vehicleDetails,
        DriverDetails memory _driverDetails,
        AccidentDetails memory _accidentDetails,
        BankDetails memory _bankDetails
    ) external {
        // Check and register the claim with the GlobalClaimTracker
        bool isClaimed = globalClaimTracker.checkAndRegisterClaim(
            GlobalClaimTracker.ClaimType.Vehicle,
            _policyDetails.policyNumber
        );

        require(isClaimed, "Double dipping detected!");

        // Process the claim
        claims[++claimCount] = Claim(
            _policyDetails,
            _vehicleDetails,
            _driverDetails,
            _accidentDetails,
            _bankDetails
        );

        // Emit the event
        emit VehicleClaimFiled(
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
                GlobalClaimTracker.ClaimType.Vehicle,
                policyNumber
            );
    }
}
