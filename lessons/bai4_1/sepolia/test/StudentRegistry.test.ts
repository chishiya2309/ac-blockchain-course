import { expect } from "chai";
import { network } from "hardhat";
import StudentRegistryModule from "../ignition/modules/StudentRegistry.ts";

const { ethers, networkHelpers, ignition } = await network.create();

describe("StudentRegistry", function () {
  async function fixture() {
    const [owner, alice] = await ethers.getSigners();
    const { studentRegistry } = await ignition.deploy(StudentRegistryModule);
    const registry = await ethers.getContractAt(
      "StudentRegistry",
      await studentRegistry.getAddress(),
    );
    return { registry, owner: owner!, alice: alice! };
  }

  it("starts with an unregistered student and emits no registration during deployment", async function () {
    const { registry, owner } = await networkHelpers.loadFixture(fixture);
    expect(await registry.getStudent(owner.address)).to.deep.equal(["", 0n, false]);
    expect(await registry.students(owner.address)).to.deep.equal(["", 0n, false]);
    expect(await registry.isStudentRegistered(owner.address)).to.equal(false);
    expect(await registry.queryFilter(registry.filters.StudentRegistered())).to.have.length(0);
  });

  it("stores the student and emits exactly the topics and ABI data shown in the guide", async function () {
    const { registry, owner } = await networkHelpers.loadFixture(fixture);
    const tx = await registry.register("Nguyen Van A", 20n);
    const receipt = await tx.wait();
    expect(receipt?.status).to.equal(1);
    expect(receipt?.logs).to.have.length(1);
    const log = receipt!.logs[0]!;
    expect(log.address).to.equal(await registry.getAddress());
    expect(log.topics).to.deep.equal([
      "0x9c9948e5540cad013bb3d06dd108feb894f222ad978608c957d9bd55a5c564e1",
      ethers.zeroPadValue(owner.address, 32).toLowerCase(),
    ]);
    expect(log.data).to.equal(
      ethers.AbiCoder.defaultAbiCoder().encode(["string", "uint256"], ["Nguyen Van A", 20n]),
    );
    const decoded = registry.interface.parseLog(log)!;
    expect([...decoded.args]).to.deep.equal([owner.address, "Nguyen Van A", 20n]);
    expect(await registry.getStudent(owner.address)).to.deep.equal(["Nguyen Van A", 20n, true]);
    expect(await registry.students(owner.address)).to.deep.equal(["Nguyen Van A", 20n, true]);
    expect(await registry.isStudentRegistered(owner.address)).to.equal(true);
  });

  it("rejects an empty name without storing a student or event", async function () {
    const { registry, owner } = await networkHelpers.loadFixture(fixture);
    await expect(registry.register("", 20n)).to.be.revertedWith("Name cannot be empty");
    expect(await registry.isStudentRegistered(owner.address)).to.equal(false);
    expect(await registry.queryFilter(registry.filters.StudentRegistered())).to.have.length(0);
  });

  it("rejects zero age without storing a student or event", async function () {
    const { registry, owner } = await networkHelpers.loadFixture(fixture);
    await expect(registry.register("Nguyen Van A", 0n)).to.be.revertedWith(
      "Age must be greater than 0",
    );
    expect(await registry.isStudentRegistered(owner.address)).to.equal(false);
    expect(await registry.queryFilter(registry.filters.StudentRegistered())).to.have.length(0);
  });

  it("rejects duplicate registration while preserving the original student and event", async function () {
    const { registry, owner } = await networkHelpers.loadFixture(fixture);
    await (await registry.register("Nguyen Van A", 20n)).wait();
    await expect(registry.register("Changed", 21n)).to.be.revertedWith(
      "Student already registered",
    );
    expect(await registry.getStudent(owner.address)).to.deep.equal(["Nguyen Van A", 20n, true]);
    expect(await registry.queryFilter(registry.filters.StudentRegistered())).to.have.length(1);
  });

  it("supports UTF-8 names and independent students", async function () {
    const { registry, owner, alice } = await networkHelpers.loadFixture(fixture);
    await expect(registry.register("Nguyễn Văn An", 20n))
      .to.emit(registry, "StudentRegistered")
      .withArgs(owner.address, "Nguyễn Văn An", 20n);
    const tx = await registry.connect(alice).register("Trần Thị Bình", 21n);
    const receipt = (await tx.wait())!;
    const event = registry.interface.parseLog(receipt.logs[0]!)!;
    expect([...event.args]).to.deep.equal([alice.address, "Trần Thị Bình", 21n]);
    expect(await registry.getStudent(owner.address)).to.deep.equal(["Nguyễn Văn An", 20n, true]);
    expect(await registry.getStudent(alice.address)).to.deep.equal(["Trần Thị Bình", 21n, true]);
  });
});
