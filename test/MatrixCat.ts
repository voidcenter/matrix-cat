import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MatrixCat", function () {

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployMatrixCat() {
    // Contracts are deployed using the first signer/account by default
    const [owner, addr1, addr2] = await ethers.getSigners();

    const MatrixCat = await ethers.getContractFactory("MatrixCatNFT");
    const matrixCat = await MatrixCat.deploy();

    return { matrixCat, owner, addr1, addr2 };
  }

  // Set up admin, baseURI; mint NFT with utility binding
  async function deployAndMint() {
    const { matrixCat, owner, addr1, addr2 } = await loadFixture(deployMatrixCat);
    const tokenId = 20;
    const baseURI = 'test';
    const metadata = 'meta';
    await matrixCat.mintNFTWithUtilityBinding(addr1.address, tokenId, metadata);
    await matrixCat.setAdmin(addr1.address);    
    await matrixCat.setBaseURI(baseURI);
    
    return { matrixCat, owner, addr1, addr2, tokenId, baseURI, metadata };
  }


  /* deployment */
  describe("Deployment", function () {
    it("Should have the right default values", async function () {
      const { matrixCat, owner } = await loadFixture(deployMatrixCat);
      
      expect(await matrixCat.MAX_CATS()).to.equal(100);
      expect(await matrixCat.admin()).to.equal(owner.address);      
    });

    it("Should not be able to query unminted token", async function () {
      const { matrixCat } = await loadFixture(deployMatrixCat);
      
      await expect(matrixCat.ownerOf(0)).to.be.reverted;
      await expect(matrixCat.tokenURI(0)).to.be.reverted;
    });
  });


  /* governance */
  describe("Governance", function () {

    describe("Set max cats", function () {
      it("Owner Should be able to set MAX_CATs", async function () {
        const { matrixCat } = await loadFixture(deployMatrixCat);
        await expect(matrixCat.setMaxCats(300))  
                .to.emit(matrixCat, "ChangeMaxCats")
                .withArgs(300);                
        expect(await matrixCat.MAX_CATS()).to.equal(300);
      });

      it("Owner Should not be able to reduce MAX_CATs", async function () {
        const { matrixCat } = await loadFixture(deployMatrixCat);
        await expect(matrixCat.setMaxCats(30)).to.be.revertedWith(
          "Matrix Cat NFT: can not reduce MAX_CATS!"
        );
      });

      it("Non-owner should not be able to set MAX_CATs", async function () {
        const { matrixCat, addr1 } = await loadFixture(deployMatrixCat);
        await expect(matrixCat.connect(addr1).setMaxCats(300)).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );
      });
    });

    describe("Set base URI", function () {
      it("Owner Should be able to set baseURI", async function () {
        const { matrixCat } = await loadFixture(deployMatrixCat);
        const uri = 'test'
        await expect(matrixCat.setBaseURI(uri))  
                .to.emit(matrixCat, "ChangeBaseURI")
                .withArgs(uri);                
        expect(await matrixCat.baseURI()).to.equal(uri);
      });

      it("Non-owner should not be able to set baseURI", async function () {
        const { matrixCat, addr1 } = await loadFixture(deployMatrixCat);
        await expect(matrixCat.connect(addr1).setBaseURI('test')).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );
      });
    });

    describe("Set admin", function () {
      it("Owner Should be able to set admin", async function () {
        const { matrixCat, addr1 } = await loadFixture(deployMatrixCat);
        await expect(matrixCat.setAdmin(addr1.address))  
                .to.emit(matrixCat, "ChangeAdmin")
                .withArgs(addr1.address);                
        expect(await matrixCat.admin()).to.equal(addr1.address);
      });

      it("Non-owner should not be able to set admin", async function () {
        const { matrixCat, addr1 } = await loadFixture(deployMatrixCat);
        await matrixCat.setAdmin(addr1.address);
        await expect(matrixCat.connect(addr1).setAdmin(addr1.address)).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );
      });
    });
  });


  /* mint and transfer */
  describe("Mint and transfer", function () {

    describe("Mint", function () {
      it("Owner Should be able to mint token", async function () {
        const { matrixCat, addr1 } = await loadFixture(deployMatrixCat);

        const tokenId = 20
        await expect(matrixCat.mintNFT(addr1.address, tokenId))  
                .to.emit(matrixCat, "MintNFT")
                .withArgs(addr1.address, tokenId);                
        expect(await matrixCat.ownerOf(tokenId)).to.equal(addr1.address);

        await matrixCat.setBaseURI('test');
        expect(await matrixCat.tokenURI(tokenId)).to.equal('test' + tokenId);
      });

      it("Non-owner should not be able to mint", async function () {
        const { matrixCat, addr1 } = await loadFixture(deployMatrixCat);
        await expect(matrixCat.connect(addr1).mintNFT(addr1.address, 0)).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );
      });

      it("Owner should be able to mint with utility binding", async function () {
        const { matrixCat, addr1 } = await loadFixture(deployMatrixCat);
        const tokenId = 20;
        const metadata = 'meta';
        await expect(matrixCat.mintNFTWithUtilityBinding(addr1.address, tokenId, metadata))  
                .to.emit(matrixCat, "MintNFTWithUtilityBinding")
                .withArgs(addr1.address, tokenId, metadata);                
        expect(await matrixCat.ownerOf(tokenId)).to.equal(addr1.address);

        expect(await matrixCat._utilityBindingAddress(tokenId)).to.equal(addr1.address);
        expect(await matrixCat._utilityMetadata(tokenId)).to.equal(metadata);
        expect(await matrixCat.tokenHasUtility(tokenId)).to.be.true;
      });
    });

    describe("Transfer", function () {
      it("Should be able to transfer", async function () {
        const { matrixCat, addr1, addr2, tokenId } = await loadFixture(deployAndMint);
        await expect(matrixCat.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId))
              .to.emit(matrixCat, "Transfer")
              .withArgs(addr1.address, addr2.address, tokenId);
        expect(await matrixCat.ownerOf(tokenId)).to.equal(addr2.address);
      });

      it("Non-owner should be able to transfer", async function () {
        const { matrixCat, addr1, addr2, tokenId } = await loadFixture(deployAndMint);
        await expect(matrixCat.connect(addr2).transferFrom(addr1.address, addr2.address, tokenId))
              .to.be.revertedWith("ERC721: caller is not token owner or approved");
      });

      it("Transfer invalidates utility", async function () {
        const { matrixCat, addr1, addr2, tokenId } = await loadFixture(deployAndMint);
        await matrixCat.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId);
        expect(await matrixCat.tokenHasUtility(tokenId)).to.be.false;
      });
    });
  });


  /* utility */

  describe("Utility", function () {
    it("Contract owner can set utility binding", async function () {
      const { matrixCat, addr1, addr2, tokenId } = await loadFixture(deployAndMint);
      const newMetadata = 'newmeta'
      await expect(matrixCat.setTokenUtilityBinding(tokenId, addr2.address, newMetadata))  
              .to.emit(matrixCat, "ChangeTokenUtilityBinding")
              .withArgs(tokenId, addr2.address, newMetadata);
      expect(await matrixCat._utilityBindingAddress(tokenId)).to.equal(addr2.address);
      expect(await matrixCat._utilityMetadata(tokenId)).to.equal(newMetadata);

      expect(await matrixCat.tokenHasUtility(tokenId)).to.be.false;
      await matrixCat.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId);
      expect(await matrixCat.tokenHasUtility(tokenId)).to.be.true;
    });

    it("Admin can set utility binding", async function () {
      const { matrixCat, addr1, addr2, tokenId } = await loadFixture(deployAndMint);
      const newMetadata = 'newmeta';
      // addr1 is admin 
      await expect(matrixCat.connect(addr1).setTokenUtilityBinding(tokenId, addr2.address, newMetadata))  
              .to.emit(matrixCat, "ChangeTokenUtilityBinding")
              .withArgs(tokenId, addr2.address, newMetadata);
      expect(await matrixCat._utilityBindingAddress(tokenId)).to.equal(addr2.address);
      expect(await matrixCat._utilityMetadata(tokenId)).to.equal(newMetadata);

      expect(await matrixCat.tokenHasUtility(tokenId)).to.be.false;
      await matrixCat.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId);
      expect(await matrixCat.tokenHasUtility(tokenId)).to.be.true;
    });

    it("Other account should not be able to set utility binding", async function () {
      const { matrixCat, addr1, addr2, tokenId } = await loadFixture(deployAndMint);
      await expect(matrixCat.connect(addr2).setTokenUtilityBinding(tokenId, addr2.address, 'meta'))
            .to.be.revertedWith("MatrxiCatNFT: caller is not the owner or the admin");
    });
  });

});
