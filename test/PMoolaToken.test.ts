/* eslint-disable node/no-extraneous-import */
/* eslint-disable node/no-missing-import */
import { BigNumber } from "@ethersproject/bignumber";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { PMoolaToken } from "../types";

let token: PMoolaToken;
let marketingWallet: SignerWithAddress;
let user: SignerWithAddress;

describe("PMoola Token", function () {
  beforeEach(async function () {
    [marketingWallet, user] = await ethers.getSigners();

    const ERC20 = await ethers.getContractFactory("ERC20Mock");
    const bnbToken = await ERC20.deploy("BNB", "BNB", BigNumber.from("1000000000000000000"));
    await bnbToken.deployed();

    const MoolaToken = await ERC20.deploy("MOOLA", "MOOLA", BigNumber.from("1000000000000000000"));
    await MoolaToken.deployed();

    const tokenFactory = await ethers.getContractFactory("PMoolaToken");
    token = (await tokenFactory.deploy(marketingWallet.address, MoolaToken.address, bnbToken.address)) as PMoolaToken;
    await token.deployed();
  });

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
});
