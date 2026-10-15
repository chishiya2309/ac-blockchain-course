import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("StudentRegistryModule", (m) => {
  const studentRegistry = m.contract("StudentRegistry");
  return { studentRegistry };
});
