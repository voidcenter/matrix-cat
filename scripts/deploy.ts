import { ethers } from "hardhat";

async function main() {
  const MatrixCat = await ethers.getContractFactory("MatrixCatNFT");
  const matrixCat = await MatrixCat.deploy();

  await matrixCat.deployed();

  console.log(`MatrixCat deployed to ${matrixCat.address} via txn ${matrixCat.deployTransaction.hash}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

