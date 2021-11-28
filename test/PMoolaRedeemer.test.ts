/* eslint-disable node/no-extraneous-import */
/* eslint-disable node/no-missing-import */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ERC20Mock, PMoolaRedeemer } from "../types";

let redeemer: PMoolaRedeemer;
let operationsWallet: SignerWithAddress;
let user: SignerWithAddress;
let user2: SignerWithAddress;
let deployer: SignerWithAddress;
let moolaToken: ERC20Mock;
let pMoolaToken: ERC20Mock;

describe("PMoola Redeemer Token", function () {
  beforeEach(async function () {
    [deployer, operationsWallet, user, user2] = await ethers.getSigners();

    const ERC20 = await ethers.getContractFactory("ERC20Mock");

    // Deploy mock moola
    moolaToken = (await ERC20.deploy("MOOLA", "MOOLA", ethers.utils.parseEther("10000000000"))) as ERC20Mock;
    await moolaToken.deployed();

    // Deploy mock pMoola
    pMoolaToken = (await ERC20.deploy("pMOOLA", "pMOOLA", ethers.utils.parseEther("1000000000"))) as ERC20Mock;
    await pMoolaToken.deployed();

    // Deploy PMoola Redeemer
    const tokenFactory = await ethers.getContractFactory("PMoolaRedeemer");
    redeemer = (await tokenFactory.deploy(
      moolaToken.address,
      pMoolaToken.address,
      operationsWallet.address
    )) as PMoolaRedeemer;

    await redeemer.deployed();

    await moolaToken
      .connect(deployer)
      ["transfer(address,address,uint256)"](
        deployer.address,
        redeemer.address,
        await moolaToken.balanceOf(deployer.address)
      );

    await pMoolaToken
      .connect(deployer)
      ["transfer(address,address,uint256)"](
        deployer.address,
        user.address,
        await pMoolaToken.balanceOf(deployer.address)
      );
  });

  describe("Redeem: ", async function () {
    it("Should revert when canRedeem flag is not set", async function () {
      await expect(redeemer.connect(user).redeem()).to.be.revertedWith("REDEEM_NOT_ENABLED");
    });

    it("Should revert when user has 0 pMoola", async function () {
      await redeemer.connect(deployer).setCanRedeem(true);
      await expect(redeemer.connect(user2).redeem()).to.be.revertedWith("NO_PMOOLA_TO_REDEEM");
    });

    it("Should exchange 1.2 m pMoola for Moola one for one", async function () {
      await redeemer.connect(deployer).setCanRedeem(true);

      const pMoolaBalanceBefore = await pMoolaToken.balanceOf(user.address);
      expect(pMoolaBalanceBefore).to.be.gt(0);

      const moolaBalanceBefore = await moolaToken.balanceOf(user.address);
      expect(moolaBalanceBefore.toNumber()).to.eq(0);

      await pMoolaToken.connect(user).approve(redeemer.address, pMoolaBalanceBefore);

      await redeemer.connect(user).redeem();

      const pMoolaBalanceAfterRedeem = await pMoolaToken.balanceOf(user.address);
      expect(pMoolaBalanceAfterRedeem).to.eq(ethers.utils.parseEther("0"));

      const moolaBalanceAfterRedeem = await moolaToken.balanceOf(user.address);
      expect(moolaBalanceAfterRedeem).to.eq(pMoolaBalanceBefore.mul(10));
    });

    it("Should revert when user has already redeemed", async function () {
      await redeemer.connect(deployer).setCanRedeem(true);
      await pMoolaToken.connect(user).approve(redeemer.address, await pMoolaToken.totalSupply());
      await redeemer.connect(user).redeem();

      await expect(redeemer.connect(user).redeem()).to.be.revertedWith("ALREADY_REDEEMED");
    });
  });

  describe("Withdraw: ", async function () {
    it("Should revert when nothing to withdraw", async function () {
      await expect(redeemer.connect(deployer).withdraw()).to.be.revertedWith("NOTHING_TO_WITHDRAW");
    });
  });

  describe("Has Redeemed: ", async function () {
    it("Should return false when user has not redeemed", async function () {
      const hasRedeemed = await redeemer.connect(user).hasRedeemed();
      expect(hasRedeemed).to.eq(false);
    });

    it("Should return true when user has redeemed", async function () {
      await redeemer.connect(deployer).setCanRedeem(true);
      await pMoolaToken.connect(user).approve(redeemer.address, await pMoolaToken.totalSupply());
      await redeemer.connect(user).redeem();

      const hasRedeemed = await redeemer.connect(user).hasRedeemed();
      expect(hasRedeemed).to.eq(true);
    });
  });
});
