import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const opsWalletAddress = "0x98A0c68d23275DcFE3f7b85f84c51b9e892a15Ad";
  const moolaAddress = "0x6510f4477CD695AeB191092793309adE51e0D14D";

  console.log("Deploying the contracts with the address:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Mainnet
  const Token = await ethers.getContractFactory("PMoolaToken");
  const token = await Token.deploy(opsWalletAddress, moolaAddress);
  await token.deployed();

  // Testnet
  // moolaAddress = "0x769173eDb5572c0f4E77A3a6f5CE20784F986bba";
  // const Token = await ethers.getContractFactory("PMoolaToken");
  // const token = await Token.deploy(opsWalletAddress, moolaAddress);
  // await token.deployed();

  console.log("$PMOOLA deployed to:", token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
