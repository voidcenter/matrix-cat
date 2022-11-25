import { ethers } from "hardhat";

async function main() {
    const MatrixCat = await ethers.getContractFactory("MatrixCatNFT");
    const matrixCat = await MatrixCat.attach("0xa1695ccf8e3f26e0f91f937bfd040c462803040d");

    // fill in values 
    const recipient = "..";
    const tokenId = -1;

    const { hash } = await matrixCat.mintNFT(recipient, tokenId);
    console.log(`#${tokenId} minted to ${recipient} in txn ${hash}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

