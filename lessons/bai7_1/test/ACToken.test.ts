import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.create();

describe("ACToken", function () {
  const supply = ethers.parseUnits("1000000", 18);

  async function deployFixture() {
    const [deployer, recipient, alice, spender] = await ethers.getSigners();
    const token = await ethers.deployContract("ACToken", [
      "AC Token",
      "ACT",
      recipient!.address,
      supply,
    ]);
    return { token, deployer: deployer!, recipient: recipient!, alice: alice!, spender: spender! };
  }

  it("sets metadata and mints the fixed supply to the recipient", async function () {
    const { token, deployer, recipient } = await networkHelpers.loadFixture(deployFixture);
    expect(await token.name()).to.equal("AC Token");
    expect(await token.symbol()).to.equal("ACT");
    expect(await token.decimals()).to.equal(18n);
    expect(await token.totalSupply()).to.equal(supply);
    expect(await token.balanceOf(recipient.address)).to.equal(supply);
    expect(await token.balanceOf(deployer.address)).to.equal(0n);
  });

  it("transfers tokens and emits Transfer", async function () {
    const { token, recipient, alice } = await networkHelpers.loadFixture(deployFixture);
    const amount = ethers.parseUnits("25", 18);
    await expect(token.connect(recipient).transfer(alice.address, amount))
      .to.emit(token, "Transfer")
      .withArgs(recipient.address, alice.address, amount);
    expect(await token.balanceOf(alice.address)).to.equal(amount);
    expect(await token.balanceOf(recipient.address)).to.equal(supply - amount);
    expect(await token.totalSupply()).to.equal(supply);
  });

  it("approves a spender, emits Approval and spends the allowance", async function () {
    const { token, recipient, alice, spender } = await networkHelpers.loadFixture(deployFixture);
    await expect(token.connect(recipient).approve(spender.address, 100n))
      .to.emit(token, "Approval")
      .withArgs(recipient.address, spender.address, 100n);
    await expect(token.connect(spender).transferFrom(recipient.address, alice.address, 40n))
      .to.emit(token, "Transfer")
      .withArgs(recipient.address, alice.address, 40n);
    expect(await token.allowance(recipient.address, spender.address)).to.equal(60n);
    expect(await token.balanceOf(alice.address)).to.equal(40n);
  });

  it("rejects transfers beyond the balance", async function () {
    const { token, alice, recipient } = await networkHelpers.loadFixture(deployFixture);
    await expect(token.connect(alice).transfer(recipient.address, 1n))
      .to.be.revertedWithCustomError(token, "ERC20InsufficientBalance")
      .withArgs(alice.address, 0n, 1n);
  });

  it("rejects spending beyond the allowance", async function () {
    const { token, recipient, alice, spender } = await networkHelpers.loadFixture(deployFixture);
    await expect(token.connect(spender).transferFrom(recipient.address, alice.address, 1n))
      .to.be.revertedWithCustomError(token, "ERC20InsufficientAllowance")
      .withArgs(spender.address, 0n, 1n);
  });

  it("rejects a zero recipient at deployment", async function () {
    const { token } = await networkHelpers.loadFixture(deployFixture);
    await expect(ethers.deployContract("ACToken", ["AC Token", "ACT", ethers.ZeroAddress, supply]))
      .to.be.revertedWithCustomError(token, "ERC20InvalidReceiver")
      .withArgs(ethers.ZeroAddress);
  });

  it("rejects transfers and approvals to zero addresses", async function () {
    const { token, recipient } = await networkHelpers.loadFixture(deployFixture);
    await expect(token.connect(recipient).transfer(ethers.ZeroAddress, 1n))
      .to.be.revertedWithCustomError(token, "ERC20InvalidReceiver")
      .withArgs(ethers.ZeroAddress);
    await expect(token.connect(recipient).approve(ethers.ZeroAddress, 1n))
      .to.be.revertedWithCustomError(token, "ERC20InvalidSpender")
      .withArgs(ethers.ZeroAddress);
  });

  it("supports zero-value transfers without changing supply", async function () {
    const { token, recipient, alice } = await networkHelpers.loadFixture(deployFixture);
    await expect(token.connect(recipient).transfer(alice.address, 0n))
      .to.emit(token, "Transfer")
      .withArgs(recipient.address, alice.address, 0n);
    expect(await token.totalSupply()).to.equal(supply);
  });
});
