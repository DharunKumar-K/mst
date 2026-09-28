import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

export default {
  solidity: "0.8.20",
  paths: {
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    mst_testnet: {
      url: process.env.MST_RPC_URL || "https://rpc.mst-testnet.com",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: process.env.MST_CHAIN_ID ? parseInt(process.env.MST_CHAIN_ID) : 1337
    },
    hardhat: {
      chainId: 1337
    }
  }
};
