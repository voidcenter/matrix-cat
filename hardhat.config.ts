import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require('dotenv').config()
const { ALCHEMY_GOERLI_KEY, ALCHEMY_MAINNET_KEY, ACCOUNT_PRIVATE_KEY, ETHERSCAN_KEY } = process.env

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_GOERLI_KEY}`,
      accounts: [ACCOUNT_PRIVATE_KEY!]
    },
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_MAINNET_KEY}`,
      accounts: [ACCOUNT_PRIVATE_KEY!]
    }
  },
  etherscan: {
    apiKey: {
      goerli: ETHERSCAN_KEY,
      mainnet: ETHERSCAN_KEY
    }
  }
};

export default config;
