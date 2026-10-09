import { expect } from "chai";
import { ethers } from "hardhat";

describe("MyToken", () => {
  it("mints the full initial supply to the deployer", async () => {
    const [deployer, other] = await ethers.getSigners();
    const token = await (await ethers.getContractFactory("MyToken")).deploy();
    await token.waitForDeployment();

    const decimals = await token.decimals();
    const expectedSupply = 1_000_000n * 10n ** BigInt(decimals);

    expect(await token.name()).to.equal("MyToken");
    expect(await token.symbol()).to.equal("MTK");
    expect(decimals).to.equal(18n);
    expect(await token.totalSupply()).to.equal(expectedSupply);
    expect(await token.balanceOf(deployer.address)).to.equal(expectedSupply);
    expect(await token.balanceOf(other.address)).to.equal(0n);
  });
});
