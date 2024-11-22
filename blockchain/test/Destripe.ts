import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Destripe", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const Destripe = await hre.ethers.getContractFactory("Destripe");
    const destripe = await Destripe.deploy();

    return { destripe, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should deploy", async function () {
      const { destripe, owner, otherAccount } = await loadFixture(deployFixture);

      expect(1).to.equal(1);
    });
  });


});
