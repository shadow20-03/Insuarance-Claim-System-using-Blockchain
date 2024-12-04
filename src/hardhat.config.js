// require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();


module.exports = {
  solidity: "0.8.26",
  settings: {
    optimizer: {
      enabled: true,
      runs: 10, // Experiment with different values like 100 or even lower
    },
    // You may want to include this for reverting reasons
    outputSelection: {
      "*": {
        "*": ["*"],
        "": ["*"],
      },
    },
  },
  networks: {
    private: {
      url: "http://127.0.0.1:8545",  // Update with your node's RPC URL
      network_id: 123454321,
      accounts: ["0xf746706da053f2c34b7a96b06e0526bd3b9366c124394a58399b414e08153b6c"],  // Private key of the account that will deploy
      gas: 5000000,  // Adjust gas limit if necessary
      gasPrice: 20000000000  // 20 gwei gas price, adjust as needed
    },
    lic: {
      url: "http://127.0.0.1:8546",  // Update with your node's RPC URL
      network_id: 223454321,
      accounts: ["6de9ac237c8752e9afadabf99517dd69d2f2e794c1f13606ce039d26a9501418"],  // Private key of the account that will deploy
      gas: 5000000,  // Adjust gas limit if necessary
      gasPrice: 20000000000  // 20 gwei gas price, adjust as needed
    },
    tataaig: {
      url: "http://127.0.0.1:8547",  // Update with your node's RPC URL
      network_id: 323454321,
      accounts: ["f67389568ef4b0e6c258ee1862f55ffba864e444aa978301e14d834502e0e798"],  // Private key of the account that will deploy
      gas: 5000000,  // Adjust gas limit if necessary
      gasPrice: 20000000000  // 20 gwei gas price, adjust as needed
    },
    bajaj: {
      url: "http://127.0.0.1:8548",  // Update with your node's RPC URL
      network_id: 423454321,
      accounts: ["65d40a44c0cfa2f1a1638281ef895704e0abe2aeb7d82d4ad5eafa2e1eed1ee7"],  // Private key of the account that will deploy
      gas: 5000000,  // Adjust gas limit if necessary
      gasPrice: 20000000000  // 20 gwei gas price, adjust as needed
    },
    common: {
      url: "http://127.0.0.1:8549",  // Update with your node's RPC URL
      network_id: 523454321,
      accounts: ["7ed122b50c0f7296364fc7658833640a9cfa44171ab1ec89a186a1476d8f2b78"],  // Private key of the account that will deploy
      gas: 5000000,  // Adjust gas limit if necessary
      gasPrice: 20000000000  // 20 gwei gas price, adjust as needed
    },
  }
};