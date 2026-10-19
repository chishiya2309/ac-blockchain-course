# AC Hardhat Template

[Tiếng Việt](README.vi.md) · [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md)

An MIT-licensed smart contract starter for learning and building on Ethereum.
Inspired by the Apps Cyclone blockchain course's Hardhat 2 template.
Includes Counter, a fixed-supply OpenZeppelin ERC20, typed ethers tests,
Ignition deployments, verification, ABI export, contract sizes, gas reports and coverage.

## Requirements and versions

Use **Node.js 24 LTS** and **npm 11**. With nvm: `nvm use`.
On Windows, install the Microsoft Visual C++ Redistributable if the native Hardhat runtime cannot load.

| Component              | Pinned version |
| ---------------------- | -------------- |
| Hardhat                | 3.19.0         |
| Mocha / ethers toolbox | 4.0.0          |
| Solidity               | 0.8.37         |
| OpenZeppelin Contracts | 5.6.1          |
| ethers                 | 6.17.0         |
| TypeScript             | 6.0.3          |

Verified on 2026-10-15. TypeScript 6 is intentional: the selected typescript-eslint version
requires TypeScript below 6.1. All declared dependency versions are exact; commit the lockfile
and use `npm ci` for reproducible installs. Review Dependabot updates before merging.

## Quick start

Copy this entire directory into a new repository, or work inside it in the course repository.
It has its own package and lockfile; no parent dependencies are needed.

```sh
npm ci
npm run check
npm run smoke
```

No wallet, API key or .env file is needed for these commands.
The first build downloads the pinned Solidity compiler; installation/builds need internet access.
The smoke test starts an isolated local node, deploys both contracts twice with the same journal,
checks their constructor values, interacts with Counter, then stops the node.

## Project layout

```text
contracts/             Counter.sol and ACToken.sol
test/                  Mocha/ethers tests and Solidity tests
ignition/modules/      Individual modules and the combined Template module
ignition/parameters/   Example deployment parameters
scripts/               Interaction, ABI export, size check and local smoke test
types/                 Generated TypeChain bindings (ignored)
data/abi/              Generated ABI JSON (ignored)
.github/               Standalone CI, Dependabot and contribution templates
```

Build profiles `default` and `production` use the same Solidity 0.8.37 compiler,
optimizer (200 runs) and Cancun EVM target. Verification must use these same settings.

## Contracts

**Counter** starts at zero. Anyone can call `increment()`; each successful call emits
`CountIncremented(caller, newCount)`. Both `count()` and `getCount()` read the value.

**ACToken** inherits OpenZeppelin ERC20, uses 18 decimals and mints once in its constructor:
`constructor(string name_, string symbol_, address recipient, uint256 initialSupply)`.
Supply is specified in **base units**; one token is `10^18` units. There is no external mint
or burn function, owner privilege or proxy. The deployment defaults to one million ACT
tokens, all assigned to the deployer. Recipient may differ from the deployer.

## Commands

| Command                                   | Purpose                                                            |
| ----------------------------------------- | ------------------------------------------------------------------ |
| `npm run compile`                         | Build contracts and generate TypeChain bindings                    |
| `npm test`                                | Run TypeScript and Solidity tests                                  |
| `npm run test:gas`                        | Gas table plus gas-stats.json                                      |
| `npm run coverage`                        | Combined coverage, coverage/lcov.info and coverage/html/index.html |
| `npm run abi`                             | Export project contract ABI arrays under data/abi                  |
| `npm run size`                            | Check runtime bytecode against the 24,576-byte EIP-170 limit       |
| `npm run typecheck`                       | Type-check after compiling once                                    |
| `npm run lint`                            | ESLint and Solhint                                                 |
| `npm run format` / `npm run format:check` | Write / check formatting                                           |
| `npm run check`                           | Compile, types, lint, formatting, tests, ABI and size              |
| `npm run smoke`                           | Complete isolated localhost deployment test                        |
| `npm run clean`                           | Clear Hardhat build outputs                                        |

Run gas and coverage separately: coverage instruments bytecode and changes gas usage.
ABI filenames preserve the source path, e.g. `data/abi/contracts/Counter.sol/Counter.json`.
TypeChain generation is supplied by the official toolbox.

## Local deployment and interaction

Start a node in terminal A:

```sh
npm run node
```

Then use terminal B:

```sh
npm run deploy:localhost
npm run interact:localhost
```

The journal is stored in `ignition/deployments/chain-31337`.
Running deployment again with the same journal resumes/reuses its completed futures.
Interaction validates the journal's chain and both deployed addresses, sends one Counter
increment, waits for a successful receipt, and prints the count and signer's token balance.
Each interaction increases the count by one.

`deploy:local` and `interact:local` are equivalent aliases.
To use another local RPC, set `LOCALHOST_RPC_URL`.
For a custom Ignition `--deployment-id`, set `DEPLOYMENT_ID` to the same ID before interacting.
After resetting/restarting your local node, use a new deployment ID or remove only the old
local journal before redeploying. Keep journals for public deployments.

## Sepolia and Ethereum

| Network name | Chain ID | RPC variable                 | Signing variable    |
| ------------ | -------- | ---------------------------- | ------------------- |
| localhost    | 31337    | LOCALHOST_RPC_URL (optional) | Local node accounts |
| sepolia      | 11155111 | SEPOLIA_RPC_URL              | TESTNET_PRIVATE_KEY |
| ethereum     | 1        | MAINNET_RPC_URL              | MAINNET_PRIVATE_KEY |

Use a dedicated wallet and encrypted keystore. The following commands prompt for values:

```sh
npx hardhat keystore set SEPOLIA_RPC_URL
npx hardhat keystore set TESTNET_PRIVATE_KEY
npx hardhat keystore set ETHERSCAN_API_KEY
npm run deploy:sepolia
npm run interact:sepolia
npm run verify:sepolia
```

Private keys must be prefixed with `0x` and contain 64 hexadecimal characters.
Missing configuration fails when the selected public network needs it; local tests
do not require public network secrets. Configure `MAINNET_RPC_URL` and
`MAINNET_PRIVATE_KEY` separately for Ethereum. An interaction sends a transaction and costs gas.

For environment-based configuration, copy `.env.example` to `.env`, uncomment and fill
the required variables. This works on Windows and Linux without inline shell assignments.
`.env` and local generated outputs are ignored by Git. Never commit a private key.

Mainnet commands are explicit:

```sh
npm run deploy:ethereum
npm run interact:ethereum
npm run verify:ethereum
```

Public network commands are provided for users; the automated checks only deploy locally.
Etherscan verification needs `ETHERSCAN_API_KEY` and the complete original journal.

### Customize constructor arguments

```sh
npm run deploy:localhost -- --parameters ignition/parameters/example.json
```

The example uses JSON strings for large integers to avoid JavaScript precision loss.
Add `"recipient": "0x..."` under `ACTokenModule` to select a recipient.
Deploy individual contracts using `npx hardhat ignition deploy ignition/modules/Counter.ts --network localhost`
or the ACToken module. The combined interaction script requires both modules to have been deployed
under the same deployment ID.

For a custom public deployment ID, use:
`npx hardhat ignition verify YOUR_ID --network sepolia`.
An explorer may need time to index a newly mined contract; retry verification with the same journal.

## CI and reuse

Standalone CI runs on Ubuntu and Windows with Node 24: clean install, `check` and smoke.
Ubuntu additionally produces gas and coverage reports, uploaded as CI artifacts.
The course repository has a separate workflow targeting this subdirectory.
When extracting the template, its own `.github` directory becomes the repository's active configuration.

Before publishing your fork, update package metadata, review the MIT attribution,
and enable GitHub private vulnerability reporting if appropriate.
`private: true` prevents accidental npm publication; the source remains MIT licensed.

## Moving from the course's Hardhat 2 example

- Use Node 24, ESM imports and `defineConfig({ plugins: [...] })`.
- Obtain ethers through `await network.create()` instead of `hre.ethers`.
- Deploy through Ignition instead of hardhat-deploy; journal addresses replace `ethers.getContract()`.
- Use the toolbox's official TypeChain integration and native gas/coverage flags.
- Export ABI and check size through the included artifact scripts.
- Configure `ETHERSCAN_API_KEY` instead of the old `ETHERSCAN_API`.
- Recreate deployments with the new modules; the old deployment files are not migrated.

The original lesson remains available in the course repository.

## Troubleshooting

- **Unsupported Node/npm:** select Node 24 and npm 11, then run `npm ci`.
- **Missing generated types:** run `npm run compile` before `npm run typecheck`.
- **Missing configuration variable:** configure its exact name in keystore or .env.
- **Missing/wrong-chain journal:** check the network and DEPLOYMENT_ID, then deploy.
- **No contract bytecode:** the local node may have restarted; redeploy with a fresh local journal.
- **Insufficient funds:** fund the wallet for the selected network before a public deployment.
- **Native runtime load failure on Windows:** install the Visual C++ runtime and reinstall with `npm ci`.
- **Compiler download failure:** check internet/proxy access; compiler downloads are required on a fresh machine.

See [Hardhat documentation](https://hardhat.org/docs/getting-started),
[Ignition](https://hardhat.org/ignition/docs/getting-started), and
[OpenZeppelin ERC20](https://docs.openzeppelin.com/contracts/5.x/erc20).

## License

MIT. Copyright (c) 2025-2026 Apps Cyclone. See [LICENSE](LICENSE).
