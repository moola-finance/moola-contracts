/* eslint-disable node/no-extraneous-import */
/* eslint-disable node/no-missing-import */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ERC20Mock, PMoolaToken } from "../types";

let token: PMoolaToken;
let operationsWallet: SignerWithAddress;
let user: SignerWithAddress;
let deployer: SignerWithAddress;
let moolaToken: ERC20Mock;

describe("PMoola Token", function () {
  beforeEach(async function () {
    [deployer, operationsWallet, user] = await ethers.getSigners();

    const ERC20 = await ethers.getContractFactory("ERC20Mock");
    moolaToken = (await ERC20.deploy("MOOLA", "MOOLA", ethers.utils.parseEther("1000000000"))) as ERC20Mock;
    await moolaToken.deployed();

    const tokenFactory = await ethers.getContractFactory("PMoolaToken");
    token = (await tokenFactory.deploy(operationsWallet.address, moolaToken.address)) as PMoolaToken;
    await token.deployed();

    await moolaToken
      .connect(deployer)
      ["transfer(address,address,uint256)"](
        deployer.address,
        token.address,
        await moolaToken.balanceOf(deployer.address)
      );
  });

  describe("Claim: ", async function () {
    it("Should mint 500k pMoola when claimed with 1 bnb", async function () {
      const pMoolaBalanceBefore = await token.balanceOf(user.address);
      expect(pMoolaBalanceBefore).to.eq(0);

      await token.connect(user).claim({ value: ethers.utils.parseEther("1") });

      const pMoolaBalanceAfter = await token.balanceOf(user.address);
      expect(pMoolaBalanceAfter).to.eq(ethers.utils.parseEther("500000"));
    });

    it("Should mint 1Mill pMoola when claimed with 2 bnb", async function () {
      const pMoolaBalanceBefore = await token.balanceOf(user.address);
      expect(pMoolaBalanceBefore).to.eq(0);

      await token.connect(user).claim({ value: ethers.utils.parseEther("2") });

      const pMoolaBalanceAfter = await token.balanceOf(user.address);
      expect(pMoolaBalanceAfter).to.eq(ethers.utils.parseEther("1000000"));
    });

    it("Should revert when claimed with 2.5 bnb", async function () {
      const pMoolaBalanceBefore = await token.balanceOf(user.address);
      expect(pMoolaBalanceBefore).to.eq(0);

      await expect(token.connect(user).claim({ value: ethers.utils.parseEther("2.5") })).to.be.revertedWith(
        "INVALID_CLAIM_AMOUNT"
      );
    });

    it("Should revert when 0 eth supplied with claim", async function () {
      const pMoolaBalanceBefore = await token.balanceOf(user.address);
      expect(pMoolaBalanceBefore).to.eq(0);

      await expect(token.connect(user).claim({ value: ethers.utils.parseEther("0") })).to.be.revertedWith(
        "INVALID_CLAIM_AMOUNT"
      );
    });

    it("Should revert when claimed already", async function () {
      const pMoolaBalanceBefore = await token.balanceOf(user.address);
      expect(pMoolaBalanceBefore).to.eq(0);

      await token.connect(user).claim({ value: ethers.utils.parseEther("2") });

      await expect(token.connect(user).claim({ value: ethers.utils.parseEther("2") })).to.be.revertedWith(
        "ALREADY_CLAIMED"
      );
    });

    it("Should revert when claimed already", async function () {
      const pMoolaBalanceBefore = await token.balanceOf(user.address);
      expect(pMoolaBalanceBefore).to.eq(0);

      await token.connect(user).claim({ value: ethers.utils.parseEther("2") });

      await expect(token.connect(user).claim({ value: ethers.utils.parseEther("2") })).to.be.revertedWith(
        "ALREADY_CLAIMED"
      );
    });
  });

  describe("Redeem: ", async function () {
    it("Should revert when canRedeem flag is not set", async function () {
      await expect(token.connect(user).redeem()).to.be.revertedWith("REDEEM_NOT_ENABLED");
    });

    it("Should revert when user has 0 pMoola", async function () {
      await token.connect(deployer).setCanRedeem(true);
      await expect(token.connect(user).redeem()).to.be.revertedWith("NO_PMOOLA_TO_REDEEM");
    });

    it("Should exchange 1m pMoola for Moola one for one", async function () {
      await token.connect(deployer).setCanRedeem(true);

      const pMoolaBalanceBefore = await token.balanceOf(user.address);
      expect(pMoolaBalanceBefore).to.eq(0);

      await token.connect(user).claim({ value: ethers.utils.parseEther("2") });

      const pMoolaBalanceAfterClaim = await token.balanceOf(user.address);
      expect(pMoolaBalanceAfterClaim).to.eq(ethers.utils.parseEther("1000000"));

      await token.connect(user).redeem();

      const pMoolaBalanceAfterRedeem = await token.balanceOf(user.address);
      expect(pMoolaBalanceAfterRedeem).to.eq(ethers.utils.parseEther("0"));

      const moolaBalance = await moolaToken.balanceOf(user.address);
      expect(moolaBalance).to.eq(pMoolaBalanceAfterClaim);
    });

    it("Should exchange 500k pMoola for Moola one for one", async function () {
      await token.connect(deployer).setCanRedeem(true);

      const pMoolaBalanceBefore = await token.balanceOf(user.address);
      expect(pMoolaBalanceBefore).to.eq(0);

      await token.connect(user).claim({ value: ethers.utils.parseEther("1") });

      const pMoolaBalanceAfterClaim = await token.balanceOf(user.address);
      expect(pMoolaBalanceAfterClaim).to.eq(ethers.utils.parseEther("500000"));

      await token.connect(user).redeem();

      const pMoolaBalanceAfterRedeem = await token.balanceOf(user.address);
      expect(pMoolaBalanceAfterRedeem).to.eq(ethers.utils.parseEther("0"));

      const moolaBalance = await moolaToken.balanceOf(user.address);
      expect(moolaBalance).to.eq(pMoolaBalanceAfterClaim);
    });
  });

  describe("Withdraw: ", async function () {
    it("Should revert when nothing to withdraw", async function () {
      await expect(token.connect(deployer).withdraw()).to.be.revertedWith("NOTHING_TO_WITHDRAW");
    });

    it("Should transfer funds to operations wallet", async function () {
      await token.connect(deployer).setCanRedeem(true);
      await token.connect(user).claim({ value: ethers.utils.parseEther("1") });

      const opsWalletBalanceBefore = await ethers.provider.getBalance(operationsWallet.address);

      await token.connect(deployer).withdraw();
      expect(await ethers.provider.getBalance(token.address)).to.eq(0);

      const opsWalletBalanceAfter = await ethers.provider.getBalance(operationsWallet.address);

      expect(opsWalletBalanceAfter).to.eq(opsWalletBalanceBefore.add(ethers.utils.parseEther("1")));
    });
  });
});
