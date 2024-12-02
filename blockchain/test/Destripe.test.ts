import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
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
    const collection = await DestripeCollection.deploy(owner.address);
    await collection.waitForDeployment();

    const DestripeCoin = await hre.ethers.getContractFactory("DestripeCoin");
    const coin = await DestripeCoin.deploy(owner.address);
    await coin.waitForDeployment();
    await coin.mint(otherAccount.address, hre.ethers.parseEther("1"));

    const Destripe = await hre.ethers.getContractFactory("Destripe");
    const protocol = await Destripe.deploy(collection.getAddress(), coin.getAddress(), owner.address);
    await protocol.waitForDeployment();

    await collection.setAuthorizedContract(protocol.getAddress());

    return { collection, coin, protocol, owner, otherAccount };
  }

  describe("Deployment", function () {
    
    it("Accepted ERC20 token should approve and allow", async function () {
      const { collection, coin, protocol, owner, otherAccount } = await loadFixture(deployFixture);
      
      const customerCoinInstance = coin.connect(otherAccount);
      await customerCoinInstance.approve(protocol.getAddress(), hre.ethers.parseEther("0.01"));
      
      const balance = await coin.balanceOf(otherAccount.address);
      const allowance = await coin.allowance(otherAccount.address, protocol.getAddress());      

      expect(Number(balance)).to.equal(Number(hre.ethers.parseEther("1")));
      expect(Number(allowance)).to.equal(Number(hre.ethers.parseEther("0.01")));      
    });

    it("Should do first payment", async function () {
      const { collection, coin, protocol, owner, otherAccount } = await loadFixture(deployFixture);
      
      const customerCoinInstance = coin.connect(otherAccount);
      await customerCoinInstance.approve(protocol.getAddress(), hre.ethers.parseEther("0.01"));      

      await expect(protocol.payMonthlyFee(otherAccount.address)).to.emit(protocol, "Granted");
    });    

    it("Should NOT do first payment", async function () {
      const { collection, coin, protocol, owner, otherAccount } = await loadFixture(deployFixture);
      
      const customerCoinInstance = coin.connect(otherAccount);
      await customerCoinInstance.approve(protocol.getAddress(), hre.ethers.parseEther("0.00001"));   

      await expect(protocol.payMonthlyFee(otherAccount.address)).to.be.revertedWith("Insufficient balance and/or allowance.");
    });

    it("Should do second payment", async function () {
      const { collection, coin, protocol, owner, otherAccount } = await loadFixture(deployFixture);
      
      const customerCoinInstance = coin.connect(otherAccount);
      await customerCoinInstance.approve(protocol.getAddress(), hre.ethers.parseEther("0.01"));
      
      await protocol.payMonthlyFee(otherAccount.address);
      await time.increase(31 * 24 * 60 * 60);

      await expect(protocol.payMonthlyFee(otherAccount.address)).to.emit(protocol, "Paid");
    });

    it("Should NOT do second payment", async function () {
      const { collection, coin, protocol, owner, otherAccount } = await loadFixture(deployFixture);
      
      const customerCoinInstance = coin.connect(otherAccount);
      await customerCoinInstance.approve(protocol.getAddress(), hre.ethers.parseEther("0.01"));
      
      await protocol.payMonthlyFee(otherAccount.address);
      await time.increase(31 * 24 * 60 * 60);
      await customerCoinInstance.approve(protocol.getAddress(), hre.ethers.parseEther("0.00001"));

      await expect(protocol.payMonthlyFee(otherAccount.address)).to.emit(protocol, "Revoked");
    });

    it("Should do second payment after REVOKED event", async function () {
      const { collection, coin, protocol, owner, otherAccount } = await loadFixture(deployFixture);
      
      const customerCoinInstance = coin.connect(otherAccount);
      await customerCoinInstance.approve(protocol.getAddress(), hre.ethers.parseEther("0.01"));
      
      await protocol.payMonthlyFee(otherAccount.address);
      await time.increase(31 * 24 * 60 * 60);
      await customerCoinInstance.approve(protocol.getAddress(), hre.ethers.parseEther("0.00001"));
      await protocol.payMonthlyFee(otherAccount.address);
      await customerCoinInstance.approve(protocol.getAddress(), hre.ethers.parseEther("0.01"));

      await expect(protocol.payMonthlyFee(otherAccount.address)).to.emit(protocol, "Granted");
    });

  });  

});
