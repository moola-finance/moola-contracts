import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying the contracts with the address:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const IterableMappingLibrary = await ethers.getContractFactory("IterableMapping");
  const iterableMappingLibrary = await IterableMappingLibrary.deploy();
  await iterableMappingLibrary.deployed();

  console.log("IterableMappingLibrary deployed to:", iterableMappingLibrary.address);

  const Token = await ethers.getContractFactory("MoolaToken", {
    libraries: {
      IterableMapping: iterableMappingLibrary.address
    }
  });
  const token = await Token.deploy();
  await token.deployed();

  console.log("$MOOLA deployed to:", token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
