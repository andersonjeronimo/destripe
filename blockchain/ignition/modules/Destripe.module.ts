// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DestripeModule = buildModule("DestripeModule", (m) => {
  const destripeCoin = m.contract("DestripeCoin");
  const destripeCollection = m.contract("DestripeCollection");
  const destripe = m.contract("Destripe");

  m.call(destripe, "setAcceptedToken", [destripeCoin]);
  m.call(destripe, "setNFTCollection", [destripeCollection]);
  m.call(destripeCollection, "setAuthorizedContract", [destripe]);

  return { destripe, destripeCoin, destripeCollection };
});

export default DestripeModule;

/* [ DestripeModule ] successfully deployed 🚀
Deployed Addresses
DestripeModule#DestripeCoin - 0x61950A17F74755Bc830b3fde00b2baE917EB09f4
DestripeModule#DestripeCollection - 0xaF9EbA1310101DBCdb91E76a6e22713Eb3c323E4
DestripeModule#Destripe - 0x4466599FA08ceFf9118F944fcCAf91e574042342 */

/* Successfully verified contract DestripeCoin on the block explorer.
https://sepolia.etherscan.io/address/0x61950A17F74755Bc830b3fde00b2baE917EB09f4#code */

/* Successfully verified contract DestripeCollection on the block explorer.
https://sepolia.etherscan.io/address/0xaF9EbA1310101DBCdb91E76a6e22713Eb3c323E4#code*/

/*Successfully verified contract Destripe on the block explorer.
https://sepolia.etherscan.io/address/0x4466599FA08ceFf9118F944fcCAf91e574042342#code*/