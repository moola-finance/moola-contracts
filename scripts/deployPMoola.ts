import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying the contracts with the address:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Token = await ethers.getContractFactory("PMoolaToken");
  const token = await Token.deploy("0x98A0c68d23275DcFE3f7b85f84c51b9e892a15Ad");
  await token.deployed();

  console.log("$PMOOLA deployed to:", token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
