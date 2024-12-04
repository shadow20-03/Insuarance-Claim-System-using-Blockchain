const hre = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // Get the GlobalClaimTracker address from the .env file
    let globalClaimTrackerAddress = '0xe8c627501FaB21a0dF8F4081fa83c499b39CB3C4';

    const TravelInsuranceClaim = await hre.ethers.getContractFactory("TravelInsuranceClaim");

    // Deploy the contract with the GlobalClaimTracker address
    const contract = await TravelInsuranceClaim.deploy(globalClaimTrackerAddress);

    await contract.deployed();  // Wait for the contract to be deployed

    console.log("TravelInsuranceClaim contract deployed to:", contract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
