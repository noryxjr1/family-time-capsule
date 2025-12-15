import { ethers } from "hardhat";
import { expect } from "chai";

describe("MemoryTimeCapsule", () => {
  it("mints and tracks viewing permissions", async () => {
    const [owner, viewer] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("MemoryTimeCapsule");
    const contract = await Factory.deploy();
    await contract.deployed();

    const openAt = Math.floor(Date.now() / 1000) + 3600;
    const tx = await contract
      .connect(owner)
      .mintMemory(
        openAt,
        "encryptedCid",
        ethers.ZeroHash,
        "ivB64",
        "metaCid",
        [viewer.address]
      );
    const receipt = await tx.wait();
    const tokenId = receipt.events?.find((e) => e.event === "Transfer")?.args?.tokenId;
    expect(tokenId).to.not.be.undefined;

    const canViewOwner = await contract.canView(tokenId, owner.address);
    const canViewViewer = await contract.canView(tokenId, viewer.address);
    expect(canViewOwner).to.equal(true);
    expect(canViewViewer).to.equal(true);

    const isOpen = await contract.isOpen(tokenId);
    expect(isOpen).to.equal(false);

    await ethers.provider.send("evm_increaseTime", [3600]);
    await ethers.provider.send("evm_mine", []);

    const isOpenAfter = await contract.isOpen(tokenId);
    expect(isOpenAfter).to.equal(true);

    const uri = await contract.tokenURI(tokenId);
    expect(uri).to.equal("ipfs://metaCid");
  });
});
