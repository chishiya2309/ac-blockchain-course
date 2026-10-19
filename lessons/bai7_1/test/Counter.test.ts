import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.create();

describe("Counter", function () {
  async function deployFixture() {
    const [owner, alice] = await ethers.getSigners();
    const counter = await ethers.deployContract("Counter");
    return { counter, owner: owner!, alice: alice! };
  }

  it("starts at zero through both getters", async function () {
    const { counter } = await networkHelpers.loadFixture(deployFixture);
    expect(await counter.count()).to.equal(0n);
    expect(await counter.getCount()).to.equal(0n);
  });

  it("increments repeatedly", async function () {
    const { counter } = await networkHelpers.loadFixture(deployFixture);
    await (await counter.increment()).wait();
    await (await counter.increment()).wait();
    expect(await counter.getCount()).to.equal(2n);
  });

  it("allows different callers and emits their address and the new count", async function () {
    const { counter, owner, alice } = await networkHelpers.loadFixture(deployFixture);
    await expect(counter.increment())
      .to.emit(counter, "CountIncremented")
      .withArgs(owner.address, 1n);
    await expect(counter.connect(alice).increment())
      .to.emit(counter, "CountIncremented")
      .withArgs(alice.address, 2n);
  });
});
