const fs = require("fs");
const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy the GlobalClaimTracker contract
    const GlobalClaimTracker = await hre.ethers.getContractFactory("GlobalClaimTracker");
    const contract = await GlobalClaimTracker.deploy();
    await contract.deployed();

    console.log("GlobalClaimTracker contract deployed to:", contract.address);

    // Verify the contract on Etherscan (if needed)
    if (process.env.NETWORK === "mainnet" || process.env.NETWORK === "testnet") {
        console.log("Verifying contract...");
        await hre.run("verify:verify", {
            address: contract.address,
            constructorArguments: [],
        });
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
