// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DestripeCoinModule = buildModule("DestripeCoinModule", (m) => {  

  const destripeCoin = m.contract("DestripeCoin");

  return { destripeCoin };
});

export default DestripeCoinModule;