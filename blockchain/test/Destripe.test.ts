import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("Destripe", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {

    // Contracts are deployed using the first signer/account by default  
    
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const DestripeCollection = await hre.ethers.getContractFactory("DestripeCollection");
    const collection = await DestripeCollection.deploy(otherAccount.address);
    await collection.waitForDeployment();

    const DestripeCoin = await hre.ethers.getContractFactory("DestripeCoin");
    const coin = await DestripeCoin.deploy(owner.address);
    await coin.waitForDeployment();    

    const Destripe = await hre.ethers.getContractFactory("Destripe");
    const protocol = await Destripe.deploy(collection.getAddress(), coin.getAddress(), owner.address);
    await protocol.waitForDeployment();

    await collection.setAuthorizedContract(protocol.getAddress());

    await coin.mint(otherAccount.address, ethers.parseEther("1"));

    return { collection, coin, protocol, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should deploy", async function () {
      const { collection, coin, protocol, owner, otherAccount } = await loadFixture(deployFixture);

      expect(1).to.equal(1);
    });
  });


});
