import { ethers } from "hardhat";

async function main() {
  const MatrixCat = await ethers.getContractFactory("MatrixCat");
  const matrixCat = await MatrixCat.deploy();

  await matrixCat.deployed();

  console.log(`Contract deployed to ${matrixCat.address} in txn ${matrixCat.deployTransaction.hash}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

