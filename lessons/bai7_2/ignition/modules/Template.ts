import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import CounterModule from "./Counter.ts";
import ACTokenModule from "./ACToken.ts";

export default buildModule("TemplateModule", (m) => {
  const { counter } = m.useModule(CounterModule);
  const { token } = m.useModule(ACTokenModule);
  return { counter, token };
});
