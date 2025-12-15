import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const BASE_SEPOLIA_RPC = process.env.BASE_SEPOLIA_RPC || "";
const DEPLOYER_PK = process.env.DEPLOYER_PK || "";

const config: HardhatUserConfig = {
  solidity: "0.8.23",
  networks: {
    baseSepolia: {
      url: BASE_SEPOLIA_RPC,
      chainId: 84532,
      accounts: DEPLOYER_PK ? [DEPLOYER_PK] : [],
    },
  },
};

export default config;
