# Bai 7.1 - MyMintableToken

TypeScript/ESM, Hardhat 3.19.0, Solidity 0.8.37, OpenZeppelin 5.6.1, ethers 6.17.0.
Dependencies are reused through a node_modules junction; do not install packages through it.

MyMintableToken (MMT) has 18 decimals, zero initial supply and deployer ownership.
Only the current owner can call mint(address,uint256).

Run from this directory, in order:

1. npx hardhat compile
2. npm run typecheck
3. npm test
4. npx hardhat run scripts/deploy.ts --network default
5. npx hardhat deploy --network default --tags deploy

Each local command uses a fresh in-process Hardhat network (chain ID 31337).
Both deployment commands create a token, mint 1000 MMT to the deployer and verify on-chain values.

For Sepolia, fill SEPOLIA_RPC_URL and TESTNET_PRIVATE_KEY in .env and fund the wallet with Sepolia ETH.
Then run: npx hardhat deploy --network sepolia --tags deploy

The deploy task is a Hardhat 3 task calling the same script, without installing hardhat-deploy.
Only the deploy tag is supported. It prints both transaction hashes, contract address and balances.
A new invocation creates a new contract; inspect printed transaction hashes before retrying a failed public deployment.
Never share .env or private keys.
