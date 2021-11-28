import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { TOKEN_ADDRESSES } from "../constants/TokenAddresses";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying the contracts with the address:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Redeemer = await ethers.getContractFactory("PMoolaRedeemer");
  const redeemer = await Redeemer.deploy(TOKEN_ADDRESSES.MOOLA, TOKEN_ADDRESSES.PMOOLA, TOKEN_ADDRESSES.OPS);
  await redeemer.deployed();

  console.log("$PMOOLA Redeemer deployed to:", redeemer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
