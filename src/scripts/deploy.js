const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    let globalClaimTrackerAddress = '0xbC122924c8815510F634653C78b332Ba690DD2B2';

    const HealthInsuranceClaim = await hre.ethers.getContractFactory("HealthInsuranceClaim");

    // Deploy the contract with the GlobalClaimTracker address
    const contract = await HealthInsuranceClaim.deploy(globalClaimTrackerAddress);

    await contract.deployed();  // Wait for the contract to be deployed

    console.log("HealthInsuranceClaim contract deployed to:", contract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
