// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DestripeModule = buildModule("DestripeModule", (m) => {
  const destripeCoin = m.contract("DestripeCoin");
  const destripeCollection = m.contract("DestripeCollection");
  const destripe = m.contract("Destripe", [destripeCoin, destripeCollection]);

  m.call(destripeCollection, "setAuthorizedContract", [destripe]);

  return { destripe, destripeCoin, destripeCollection };''
});

export default DestripeModule;

/* [ DestripeModule ] successfully deployed 🚀
Deployed Addresses
DestripeModule#DestripeCoin - 0x415e0d34214bd02E01EdDe1b74121067B901150A
DestripeModule#DestripeCollection - 0x176c7202e5F7456334Df3A8d234A894897b80C3D
DestripeModule#Destripe - 0x7bCd3AB78b09cBC6DBc39c220FC9536E8ec28B46 */

/* Successfully verified contract DestripeCoin on the block explorer.
https://sepolia.etherscan.io/address/0x415e0d34214bd02E01EdDe1b74121067B901150A#code */

/* Successfully verified contract DestripeCollection on the block explorer.
https://sepolia.etherscan.io/address/0x176c7202e5F7456334Df3A8d234A894897b80C3D#code */

/* Successfully verified contract Destripe on the block explorer.
https://sepolia.etherscan.io/address/0x7bCd3AB78b09cBC6DBc39c220FC9536E8ec28B46#code */