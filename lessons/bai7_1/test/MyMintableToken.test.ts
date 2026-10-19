import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.create();

describe("MyMintableToken", function () {
  const amount = ethers.parseEther("1000");

  async function deployFixture() {
    const [owner, alice] = await ethers.getSigners();
    const token = await ethers.deployContract("MyMintableToken");
    await token.waitForDeployment();
    return { token, owner: owner!, alice: alice! };
  }

  it("sets metadata, deployer ownership and zero initial supply", async function () {
    const { token, owner } = await networkHelpers.loadFixture(deployFixture);
    expect(await token.name()).to.equal("MyMintableToken");
    expect(await token.symbol()).to.equal("MMT");
    expect(await token.decimals()).to.equal(18n);
    expect(await token.owner()).to.equal(owner.address);
    expect(await token.totalSupply()).to.equal(0n);
    expect(await token.balanceOf(owner.address)).to.equal(0n);
  });

  it("lets the owner mint exactly 1000 tokens and emits Transfer", async function () {
    const { token, owner } = await networkHelpers.loadFixture(deployFixture);
    await expect(token.mint(owner.address, amount))
      .to.emit(token, "Transfer")
      .withArgs(ethers.ZeroAddress, owner.address, amount);
    expect(await token.balanceOf(owner.address)).to.equal(amount);
    expect(await token.totalSupply()).to.equal(amount);
  });

  it("lets the owner mint to another recipient", async function () {
    const { token, owner, alice } = await networkHelpers.loadFixture(deployFixture);
    await expect(token.mint(alice.address, amount))
      .to.emit(token, "Transfer")
      .withArgs(ethers.ZeroAddress, alice.address, amount);
    expect(await token.balanceOf(alice.address)).to.equal(amount);
    expect(await token.balanceOf(owner.address)).to.equal(0n);
    expect(await token.totalSupply()).to.equal(amount);
  });

  it("rejects non-owner minting without changing supply or balances", async function () {
    const { token, alice } = await networkHelpers.loadFixture(deployFixture);
    await expect(token.connect(alice).mint(alice.address, amount))
      .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount")
      .withArgs(alice.address);
    expect(await token.totalSupply()).to.equal(0n);
    expect(await token.balanceOf(alice.address)).to.equal(0n);
  });

  it("rejects minting to the zero address", async function () {
    const { token } = await networkHelpers.loadFixture(deployFixture);
    await expect(token.mint(ethers.ZeroAddress, amount))
      .to.be.revertedWithCustomError(token, "ERC20InvalidReceiver")
      .withArgs(ethers.ZeroAddress);
    expect(await token.totalSupply()).to.equal(0n);
  });

  it("moves minting permission to the new owner after ownership transfer", async function () {
    const { token, owner, alice } = await networkHelpers.loadFixture(deployFixture);
    await expect(token.transferOwnership(alice.address))
      .to.emit(token, "OwnershipTransferred")
      .withArgs(owner.address, alice.address);
    await expect(token.mint(owner.address, amount))
      .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount")
      .withArgs(owner.address);
    await expect(token.connect(alice).mint(alice.address, amount))
      .to.emit(token, "Transfer")
      .withArgs(ethers.ZeroAddress, alice.address, amount);
    expect(await token.owner()).to.equal(alice.address);
    expect(await token.balanceOf(alice.address)).to.equal(amount);
    expect(await token.totalSupply()).to.equal(amount);
  });
});
