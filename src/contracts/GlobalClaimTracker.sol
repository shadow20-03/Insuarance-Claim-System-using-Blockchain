// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GlobalClaimTracker {
    event ClaimDenied(uint256 indexed claimType, string policyNumber);
    event ClaimRegistered(uint256 indexed claimType, string policyNumber);

    enum ClaimType {
        Health,
        Life,
        Travel,
        Vehicle
    }

    // Nested mapping to track claimed policies per claim type
    mapping(ClaimType => mapping(string => bool)) public claimedPolicies;

    // View function to check if the policy is already claimed
    function isClaimed(
        ClaimType claimType,
        string memory policyNumber
    ) public view returns (bool) {
        return claimedPolicies[claimType][policyNumber];
    }

    function checkAndRegisterClaim(
        ClaimType claimType,
        string memory policyNumber
    ) external returns (bool) {
        // Check if the claim already exists in the local or global registry
        if (claimedPolicies[claimType][policyNumber]) {
            emit ClaimDenied(uint256(claimType), policyNumber);
            return false;
        }

        // Register the claim in the local mapping
        claimedPolicies[claimType][policyNumber] = true;

        emit ClaimRegistered(uint256(claimType), policyNumber);
        return true;
    }
}
