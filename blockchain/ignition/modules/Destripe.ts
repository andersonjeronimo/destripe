// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DestripeModule = buildModule("DestripeModule", (m) => {  

  const destripe = m.contract("Destripe");

  return { destripe };
});

export default DestripeModule;
