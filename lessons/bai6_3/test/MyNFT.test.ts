import assert from "node:assert/strict";
import { expect } from "chai";
import * as hre from "hardhat";
import deployMyNFT from "../deploy/1-deploy";

const { ethers } = hre;

describe("MyNFT", () => {
  it("starts with the deployer as owner and token ID zero", async () => {
    const [deployer] = await ethers.getSigners();
    const nft = await (await ethers.getContractFactory("MyNFT")).deploy();
    await nft.waitForDeployment();

    expect(await nft.name()).to.equal("MyNFT");
    expect(await nft.symbol()).to.equal("MNFT");
    expect(await nft.owner()).to.equal(deployer.address);
    expect(await nft.nextTokenId()).to.equal(0n);
  });

  it("mints sequential IDs to the requested recipients", async () => {
    const [deployer, recipient] = await ethers.getSigners();
    const nft = await (await ethers.getContractFactory("MyNFT")).deploy();
    await nft.waitForDeployment();

    await (await nft.mint(deployer.address)).wait();
    expect(await nft.ownerOf(0)).to.equal(deployer.address);
    expect(await nft.nextTokenId()).to.equal(1n);

    await (await nft.mint(recipient.address)).wait();
    expect(await nft.ownerOf(1)).to.equal(recipient.address);
    expect(await nft.nextTokenId()).to.equal(2n);
  });

  it("rejects minting from a non-owner without advancing the ID", async () => {
    const [, other] = await ethers.getSigners();
    const nft = await (await ethers.getContractFactory("MyNFT")).deploy();
    await nft.waitForDeployment();

    const nftAsOther = nft.connect(other) as typeof nft;
    await assert.rejects(async () => nftAsOther.mint(other.address));
    expect(await nft.nextTokenId()).to.equal(0n);
  });

  it("does not mint again when the deploy script is rerun", async () => {
    await hre.deployments.fixture(["deploy"]);
    const deployment = await hre.deployments.get("MyNFT");
    const nft = await ethers.getContractAt("MyNFT", deployment.address);
    expect(await nft.nextTokenId()).to.equal(1n);

    await deployMyNFT(hre);
    expect((await hre.deployments.get("MyNFT")).address).to.equal(deployment.address);
    expect(await nft.nextTokenId()).to.equal(1n);
  });
});
