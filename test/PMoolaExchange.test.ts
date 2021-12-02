import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ERC20Mock, PMoolaExchange } from "../types";

let exchange: PMoolaExchange;
let user: SignerWithAddress;
let deployer: SignerWithAddress;
let pMoolaToken: ERC20Mock;

describe.only("PMoolaExchange", async () => {
  beforeEach(async function () {
    [deployer, user] = await ethers.getSigners();

    // Deploy mock pMoola
    const ERC20 = await ethers.getContractFactory("ERC20Mock");
    pMoolaToken = (await ERC20.deploy("pMOOLA", "pMOOLA", ethers.utils.parseEther("1000000000"))) as ERC20Mock;
    await pMoolaToken.deployed();

    // Deploy PMoola Exchange
    const tokenFactory = await ethers.getContractFactory("PMoolaExchange");
    exchange = (await tokenFactory.deploy(pMoolaToken.address)) as PMoolaExchange;
    await exchange.deployed();

    await deployer.sendTransaction({
      to: exchange.address,
      value: ethers.utils.parseEther("50")
    });
  });

  describe("Exchange: ", async function () {
    it("Should send 1 bnb in exchange for 600k pMoola", async function () {
      await pMoolaToken
        .connect(deployer)
        ["transfer(address,address,uint256)"](deployer.address, user.address, ethers.utils.parseEther("600000"));
      await exchange.connect(deployer).setCanExchange(true);

      const pMoolaUserBalanceBefore = await pMoolaToken.balanceOf(user.address);

      const contractBalanceBefore = await ethers.provider.getBalance(exchange.address);
      expect(contractBalanceBefore).to.equal(ethers.utils.parseEther("50"));

      const pMoolaContractBalanceBefore = await pMoolaToken.balanceOf(exchange.address);
      expect(pMoolaContractBalanceBefore).to.equal(ethers.utils.parseEther("0"));

      await pMoolaToken.connect(user).approve(exchange.address, await pMoolaToken.totalSupply());

      await expect(exchange.connect(user).exchange())
        .to.emit(exchange, "Exchange")
        .withArgs(user.address, pMoolaUserBalanceBefore.toString(), ethers.utils.parseEther("1"));

      const contractBalanceAfter = await ethers.provider.getBalance(exchange.address);
      expect(contractBalanceAfter).to.equal(ethers.utils.parseEther("49"));

      const pMoolaContractBalanceAfter = await pMoolaToken.balanceOf(exchange.address);
      expect(pMoolaContractBalanceAfter).to.equal(ethers.utils.parseEther("600000"));

      const pMoolaUserBalanceAfter = await pMoolaToken.balanceOf(user.address);
      expect(pMoolaUserBalanceAfter).to.equal(ethers.utils.parseEther("0"));
    });

    it("Should send 2 bnb in exchange for 1.2m pMoola", async function () {
      await pMoolaToken
        .connect(deployer)
        ["transfer(address,address,uint256)"](deployer.address, user.address, ethers.utils.parseEther("1200000"));
      await exchange.connect(deployer).setCanExchange(true);

      const pMoolaUserBalanceBefore = await pMoolaToken.balanceOf(user.address);

      const contractBalanceBefore = await ethers.provider.getBalance(exchange.address);
      expect(contractBalanceBefore).to.equal(ethers.utils.parseEther("50"));

      const pMoolaContractBalanceBefore = await pMoolaToken.balanceOf(exchange.address);
      expect(pMoolaContractBalanceBefore).to.equal(ethers.utils.parseEther("0"));

      await pMoolaToken.connect(user).approve(exchange.address, await pMoolaToken.totalSupply());

      await expect(exchange.connect(user).exchange())
        .to.emit(exchange, "Exchange")
        .withArgs(user.address, pMoolaUserBalanceBefore.toString(), ethers.utils.parseEther("2"));

      const contractBalanceAfter = await ethers.provider.getBalance(exchange.address);
      expect(contractBalanceAfter).to.equal(ethers.utils.parseEther("48"));

      const pMoolaContractBalanceAfter = await pMoolaToken.balanceOf(exchange.address);
      expect(pMoolaContractBalanceAfter).to.equal(ethers.utils.parseEther("1200000"));

      const pMoolaUserBalanceAfter = await pMoolaToken.balanceOf(user.address);
      expect(pMoolaUserBalanceAfter).to.equal(ethers.utils.parseEther("0"));
    });
  });
});
