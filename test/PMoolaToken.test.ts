/* eslint-disable node/no-missing-import */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { PMoolaToken } from "../types";

let token: PMoolaToken;
let marketingWallet: SignerWithAddress;
let user: SignerWithAddress;

describe("PMoola Token Tests", function () {
  beforeEach(async function () {
    [marketingWallet, user] = await ethers.getSigners();

    const tokenFactory = await ethers.getContractFactory("PMoolaToken");
    token = (await tokenFactory.deploy(marketingWallet.address)) as PMoolaToken;
    await token.deployed();
  });

  it("Should mint 500k pMoola when claimed with 1 eth", async function () {
    const pMoolaBalanceBefore = await token.balanceOf(user.address);
    expect(pMoolaBalanceBefore).to.eq(0);

    await token.connect(user).claim({ value: ethers.utils.parseEther("1") });

    const pMoolaBalanceAfter = await token.balanceOf(user.address);
    expect(pMoolaBalanceAfter).to.eq(ethers.utils.parseEther("500000"));
  });

  it("Should mint 1Mill pMoola when claimed with 2 eth", async function () {
    const pMoolaBalanceBefore = await token.balanceOf(user.address);
    expect(pMoolaBalanceBefore).to.eq(0);

    await token.connect(user).claim({ value: ethers.utils.parseEther("2") });

    const pMoolaBalanceAfter = await token.balanceOf(user.address);
    expect(pMoolaBalanceAfter).to.eq(ethers.utils.parseEther("1000000"));
  });
});
