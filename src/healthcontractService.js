import { ethers } from 'ethers';
import HealthInsuranceClaim from './artifacts/contracts/HealthClaim.sol/HealthInsuranceClaim.json';
import LifeInsuranceClaim from './artifacts/contracts/LifeClaim.sol/LifeInsuranceClaim.json';
import VehicleInsuranceClaim from './artifacts/contracts/VehicleClaim.sol/VehicleInsuranceClaim.json';
import TravelInsuranceClaim from './artifacts/contracts/TravelClaim.sol/TravelInsuranceClaim.json';
import GlobalClaimTracker from './artifacts/contracts/GlobalClaimTracker.sol/GlobalClaimTracker.json';
import { getInsuranceCompanyValue } from './KYCPage';
import axios from 'axios';
// import { network } from 'hardhat';

const PRIVATE_CHAIN_IDS = {
  Maxlife: '0x' + (123454321).toString(16),
  LIC: '0x' + (223454321).toString(16),
  TATAAIG: '0x' + (323454321).toString(16),
  Bajaj: '0x' + (423454321).toString(16)
};

const ClaimType = {
  Health: 0,
  Life: 1,
  Travel: 2,
  Vehicle: 3,
};

let provider = new ethers.providers.Web3Provider(window.ethereum);
let signer = provider.getSigner();

window.ethereum.on('chainChanged', async (chainId) => {
  alert(`Network changed to ${parseInt(chainId, 16)}. Please submit the claim again.`);
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
});

async function checkAndSwitchNetwork(chainId, networkName, rpcUrl) {
  try {
    const { chainId: currentChainId } = await provider.getNetwork();
    if (currentChainId !== parseInt(chainId, 16)) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }],
        });
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{ 
              chainId, 
              chainName: networkName, 
              rpcUrls: [rpcUrl], 
              nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 } 
            }],
          });
          provider = new ethers.providers.Web3Provider(window.ethereum);
          signer = provider.getSigner();
        } else {
          throw switchError;
        }
      }
    }
  } catch (error) {
    console.error(`Error checking/switching to ${networkName}:`, error);
    alert(`Please connect to the ${networkName} network in MetaMask.`);
    throw error;
  }
}

const policyArray = [];

async function requestAccounts() {
  try {
    await provider.send('eth_requestAccounts', []);
  } catch (error) {
    console.error('Error requesting accounts:', error);
  }
}

async function interactWithGlobalClaimTracker(claimType, policyNumber) {
  const insuranceCompany = getInsuranceCompanyValue();
  const networkDetails = {
    Maxlife: {
      chainId: PRIVATE_CHAIN_IDS.Maxlife,
      name: 'Private Network',
      rpcUrl: 'http://127.0.0.1:8545',
      globalClaimTrackerAddress: '0xcDe4FD1e9eC1ab8Ec092628Bb21616541012F892',
    },
    LIC: {
      chainId: PRIVATE_CHAIN_IDS.LIC,
      name: 'LIC Network',
      rpcUrl: 'http://127.0.0.1:8546',
      globalClaimTrackerAddress: '0xbC122924c8815510F634653C78b332Ba690DD2B2',
    },
    TATAAIG: {
      chainId: PRIVATE_CHAIN_IDS.TATAAIG,
      name: 'TATA AIG Network',
      rpcUrl: 'http://127.0.0.1:8547',
      globalClaimTrackerAddress: '0x649ee38b95732FA79c429E5c9f8B66989e5C5d05',
    },
    Bajaj: {
      chainId: PRIVATE_CHAIN_IDS.Bajaj,
      name: 'Bajaj Allianz Network',
      rpcUrl: 'http://127.0.0.1:8548',
      globalClaimTrackerAddress: '0xe8c627501FaB21a0dF8F4081fa83c499b39CB3C4',
    },
  };

  if (networkDetails[insuranceCompany]) {
    const { chainId, name, rpcUrl, globalClaimTrackerAddress } = networkDetails[insuranceCompany];
    await checkAndSwitchNetwork(chainId, name, rpcUrl);

    try {
      // const globalClaimTrackerAddress = '0x2344B54AD147A03503256DdF94c3f32E9dfE4d7e'; // Replace with actual address
      // const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8549");
      const contract = new ethers.Contract(globalClaimTrackerAddress, GlobalClaimTracker.abi, signer);
      const existingPolicy = policyArray.find(
        (entry) => entry.policyNumber === policyNumber && entry.network !== chainId
      );

      if (existingPolicy) {
        alert('This policy number has already been claimed on another network.');
        return false;
      }
      const isAlreadyClaimed = await contract.isClaimed(claimType, policyNumber);
      if (isAlreadyClaimed) {
        alert('This policy number has already been claimed.');
        console.log('This policy number has already been claimed.');
        return false;
      }
      policyArray.push({policyNumber, network: chainId});
      return true;
    } catch (error) {
      console.error('Error interacting with Global Claim Tracker:', error);
      throw error;
    }
  } else {
    alert("Unknown insurance company. Please ensure the company is supported.");
  }
}

async function storeClaimInDatabasefromHealth(name, policyNumber, companyName, ipfsCid,supportingDocumentsIpfsCID) {
  console.log(name);
  console.log(policyNumber);
  console.log(companyName);
  console.log(ipfsCid);
  console.log(supportingDocumentsIpfsCID);
  const token = localStorage.getItem('token');
  let baseUrl;
  if (companyName === 'Maxlife') {
    baseUrl = 'http://localhost:5001/ipfs/bafybeihatzsgposbr3hrngo42yckdyqcc56yean2rynnwpzxstvdlphxf4';
  } else if (companyName === 'LIC') {
    baseUrl = 'http://localhost:5002/ipfs/bafybeihatzsgposbr3hrngo42yckdyqcc56yean2rynnwpzxstvdlphxf4';
  }
  const ipfsLink = `${baseUrl}/#/ipfs/${ipfsCid}`;
  const supportingDocumentIpfsLink= `${baseUrl}/#/ipfs/${supportingDocumentsIpfsCID}`;
  console.log(ipfsLink);
  console.log(supportingDocumentIpfsLink);
  try {
    await axios.post('http://localhost:5000/api/storeClaim', {
      name,
      policyNumber,
      companyName,
      ipfsLink,
      supportingDocumentIpfsLink
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
    console.log("Claim data stored in database successfully.");
  } catch (error) {
    console.error("Error storing claim in database:", error);
  }
}

async function interactWithHealthContract(policyDetails, medicalDetails, bankDetails) {
  await requestAccounts();

  const insuranceCompany = getInsuranceCompanyValue();
  const networkDetails = {
    Maxlife: { chainId: PRIVATE_CHAIN_IDS.Maxlife, name: 'Private Network', rpcUrl: 'http://127.0.0.1:8545', healthContractAddress: '0x34e1A5EA7E60DA1dfeFd72f488109f2CcC13d413',},
    LIC: { chainId: PRIVATE_CHAIN_IDS.LIC, name: 'LIC Network', rpcUrl: 'http://127.0.0.1:8546', healthContractAddress: '0xbe5a6f7b46bE08F72A95e2aE4f3bb59c5241e8BF',},
  };
  if (networkDetails[insuranceCompany]) {
    const { chainId, name, rpcUrl, healthContractAddress } = networkDetails[insuranceCompany];
    await checkAndSwitchNetwork(chainId, name, rpcUrl);

    try {
      const contract = new ethers.Contract(healthContractAddress, HealthInsuranceClaim.abi, signer);
      const tx = await contract.fileHealthClaim(policyDetails, medicalDetails, bankDetails, { gasLimit: 10000000 });
      console.log(tx);
      console.log('Filing Health Claim with the following details:', {
        policyDetails,
        medicalDetails,
        bankDetails,
      });
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error interacting with Health contract:', error.message || error);
      throw error; // Rethrow the error after logging
    }
  }else{
    alert("Unknown insurance company. Please ensure the company is supported.");
  }
}

async function interactWithLifeContract(policyDetails, nomineeDetails, medicalDetails, bankDetails) {
  await requestAccounts();

  const insuranceCompany = getInsuranceCompanyValue();
  const networkDetails = {
    Maxlife: { chainId: PRIVATE_CHAIN_IDS.Maxlife, name: 'Private Network', rpcUrl: 'http://127.0.0.1:8545', lifeContractAddress: '0xc8c8E6735f18DADC24807994Fb69C4015574c056',},
    LIC: { chainId: PRIVATE_CHAIN_IDS.LIC, name: 'LIC Network', rpcUrl: 'http://127.0.0.1:8546', lifeContractAddress: '0x2890d03865B5CDDF1dF1d910456eB357A33C89Ca',},
  };
  const lifeContractAddress = networkDetails[insuranceCompany].lifeContractAddress;
  if (networkDetails[insuranceCompany]) {
    await checkAndSwitchNetwork(networkDetails[insuranceCompany].chainId, networkDetails[insuranceCompany].name, networkDetails[insuranceCompany].rpcUrl);
  }

  try {
    const contract = new ethers.Contract(lifeContractAddress, LifeInsuranceClaim.abi, signer);
    const tx = await contract.fileLifeClaim(policyDetails, nomineeDetails, medicalDetails, bankDetails, { gasLimit: 1000000 });
    
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error interacting with Life contract:', error);
    throw error;
  }
}

async function interactWithVehicleContract(policyDetails, vehicleDetails, driverDetails, accidentDetails, bankDetails) {
  await requestAccounts();

  const insuranceCompany = getInsuranceCompanyValue();
  const networkDetails = {
    TATAAIG: { chainId: PRIVATE_CHAIN_IDS.TATAAIG, name: 'TATA AIG Network', rpcUrl: 'http://127.0.0.1:8547', vehicleContractAddress: '0xf9DA844e7D0B7AEC092083F105A7FDfedEcE4bd8',},
    Bajaj: { chainId: PRIVATE_CHAIN_IDS.Bajaj, name: 'Bajaj Allianz Network', rpcUrl: 'http://127.0.0.1:8548', vehicleContractAddress: '0xf996aE12b7ac12542bc6fA9A06d6824723DD91fC',},
  };
  const vehicleContractAddress = networkDetails[insuranceCompany].vehicleContractAddress;
  if (networkDetails[insuranceCompany]) {
    await checkAndSwitchNetwork(networkDetails[insuranceCompany].chainId, networkDetails[insuranceCompany].name, networkDetails[insuranceCompany].rpcUrl);
  }

  try {
    const contract = new ethers.Contract(vehicleContractAddress, VehicleInsuranceClaim.abi, signer);
    const tx = await contract.fileVehicleClaim(policyDetails, vehicleDetails, driverDetails, accidentDetails, bankDetails, { gasLimit: 1000000 });
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error interacting with Vehicle contract:', error);
    throw error;
  }
}

async function interactWithTravelContract(policyDetails, travelDetails, claimDetails, bankDetails, declarationDetails) {
  await requestAccounts();

  const insuranceCompany = getInsuranceCompanyValue();
  const networkDetails = {
    TATAAIG: { chainId: PRIVATE_CHAIN_IDS.TATAAIG, name: 'TATA AIG Network', rpcUrl: 'http://127.0.0.1:8547', travelContractAddress: '0x510fe2800664AE8EC2467FAe06ae1e0c70790410',},
    Bajaj: { chainId: PRIVATE_CHAIN_IDS.Bajaj, name: 'Bajaj Allianz Network', rpcUrl: 'http://127.0.0.1:8548', travelContractAddress: '0x1bF5790a38F62FE872f4b4399B98b4c43E43E352',},
  };
  const travelContractAddress = networkDetails[insuranceCompany].travelContractAddress;
  if (networkDetails[insuranceCompany]) {
    await checkAndSwitchNetwork(networkDetails[insuranceCompany].chainId, networkDetails[insuranceCompany].name, networkDetails[insuranceCompany].rpcUrl);
  }

  try {

    const contract = new ethers.Contract(travelContractAddress, TravelInsuranceClaim.abi, signer);
    const tx = await contract.fileTravelClaim(policyDetails, travelDetails, claimDetails, bankDetails, declarationDetails, { gasLimit: 1000000 });
    
    const receipt = await tx.wait();
    console.log("Transaction Receipt:", receipt);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error interacting with Travel contract:', error);
    throw error;
  }
}

export {
  requestAccounts,
  interactWithHealthContract,
  interactWithLifeContract,
  interactWithVehicleContract,
  interactWithTravelContract,
  interactWithGlobalClaimTracker,
  storeClaimInDatabasefromHealth,
  ClaimType
};
