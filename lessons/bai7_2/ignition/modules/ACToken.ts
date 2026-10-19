import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ACTokenModule", (m) => {
  const name = m.getParameter("name", "AC Token");
  const symbol = m.getParameter("symbol", "ACT");
  const recipient = m.getParameter("recipient", m.getAccount(0));
  const initialSupply = m.getParameter("initialSupply", 1_000_000n * 10n ** 18n);
  const token = m.contract("ACToken", [name, symbol, recipient, initialSupply]);
  return { token };
});
