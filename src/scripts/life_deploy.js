const hre = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // Get the GlobalClaimTracker address from the .env file
    let globalClaimTrackerAddress = "0xbC122924c8815510F634653C78b332Ba690DD2B2";

    const LifeInsuranceClaim = await hre.ethers.getContractFactory("LifeInsuranceClaim");

    // Deploy the contract with the GlobalClaimTracker address
    const contract = await LifeInsuranceClaim.deploy(globalClaimTrackerAddress);

    await contract.deployed();  // Wait for the contract to be deployed

    console.log("LifeInsuranceClaim contract deployed to:", contract.address);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
