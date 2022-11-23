# CoW Protocol

This repository contains the Solidity smart contract code for the **CoW Protocol** (formerly know as **Gnosis Protocol**).

For more documentation on how the protocol works on a smart contract level, see the [documentation pages](docs/index.md).

## Getting Started

### Building the Project

```sh
yarn
yarn build
```

### Running Tests

```sh
yarn test
```

The tests can be run in "debug mode" as follows:

```sh
DEBUG=* yarn test
```

### Gas Reporter

Gas consumption can be reported by setting the `REPORT_GAS` flag when running tests as

```sh
REPORT_GAS=1 yarn test
```

### Benchmarking

This repository additionally includes tools for gas benchmarking and tracing.

In order to run a gas benchmark on a whole bunch of settlement scenarios:

```sh
yarn bench
```

These gas benchmarks can be compared against any other git reference and will default to the merge-base if omitted:

```sh
yarn bench:compare [<ref>]
```

In order to get a detailed trace of a settlement to identify how much gas is being spent where:

```sh
yarn bench:trace
```

## Deployment

Contracts deployment (including contract verification) is run automatically with GitHub Actions. The deployment process is triggered manually.
Maintainers of this repository can deploy a new version of the contract in the "Actions" tab, "Deploy CoW Protocol contracts", "Run workflow". The target branch can be selected before running.
A successful workflow results in a new PR asking to merge the deployment artifacts into the main branch.

Contracts can also be deployed and verified manually as follows.

### Deploying Contracts

Choose the network and gas price in wei for the deployment.
After replacing these values, run:

```sh
NETWORK='rinkeby'
GAS_PRICE_WEI='1000000000'
yarn deploy --network $NETWORK --gasprice $GAS_PRICE_WEI
```

New files containing details of this deployment will be created in the `deployment` folder.
These files should be committed to this repository.

### Verify Deployed Contracts

#### Etherscan

For verifying all deployed contracts:

```sh
export ETHERSCAN_API_KEY=<Your Key>
yarn verify:etherscan --network $NETWORK
```

#### Tenderly

For verifying all deployed contracts:

```sh
yarn verify:tenderly --network $NETWORK
```

For a single contract, named `GPv2Contract` and located at address `0xFeDbc87123caF3925145e1bD1Be844c03b36722f` in the example:

```sh
npx hardhat tenderly:verify --network $NETWORK GPv2Contract=0xFeDbc87123caF3925145e1bD1Be844c03b36722f
```

## Deployed Contract Addresses

This package additionally contains a `networks.json` file at the root with the address of each deployed contract as well the hash of the Ethereum transaction used to create the contract.

## Test coverage [![Coverage Status](https://coveralls.io/repos/github/gnosis/gp-v2-contracts/badge.svg?branch=main)](https://coveralls.io/github/gnosis/gp-v2-contracts?branch=main)

Test coverage can be checked with the command

```sh
yarn coverage
```

A summary of coverage results are printed out to console. More detailed information is presented in the generated file `coverage/index.html`.

### Solver Authentication

This repo contains scripts to manage the list of authenticated solvers in all networks the contract has been deployed.

The scripts are called with:

```sh
yarn solvers command [arg ...]
```

Here is a list of available commands.
The commands flagged with [*] require the private key of the authentication contract owner to be available to the script, for example by exporting it with `export PK=<private key>`.

1. `add $ADDRESS` [*]. Adds the address to the list of registered solvers.
2. `remove $ADDRESS` [*]. Removes the address from the list of registered solvers.
3. `check $ADDRESS`. Checks if the given address is in the list of registered solvers.

For example, adding the address `0x0000000000000000000000000000000000000042` to the solver list:

```sh
export PK=<private key>
yarn solvers add 0x0000000000000000000000000000000000000042
```

### Fee Withdrawals

Script to withdraw all balances of the Settlement contract. Allows to specify what minimum value the contract must have for a token to be considered (breadcrumbs might not be worth the gas costs) and how much remaining value should be left in the contract (e.g. to feed token buffers).

If no token list is passed in all traded token balances will be fetched from chain (can take a long time...)

```sh
export PK=<private key>
yarn hardhat withdraw --receiver 0x6C2999B6B1fAD608ECEA71B926D68Ee6c62BeEf8 --min-value 10000 --leftover 500 0x038a68ff68c393373ec894015816e33ad41bd564 0x913d8adf7ce6986a8cbfee5a54725d9eea4f0729
```

### Decoding Settlement CallData

This project exposes some handy scripts for parsing settlement calldata into human readable format.

The `decode` script can be used in two ways:

1. By specifying the transaction hash of an existing settlement transaction `--txhash 0x...`

```sh
npx hardhat decode --txhash 0xc12e5bc2ef9c116932301495738d555ea1d658977dacd6c7989a6d77125a17d2 --network mainnet
```

2. When no `txhash` is specified, by reading the calldata from stdin (`< calldata.txt`). If stdin is a terminal, the user is prompted to paste the calldata into the terminal.

```sh
> npx hardhat decode --network mainnet
# Paste in the calldata to decode
```

Note that you will be expected to have your `INFURA_KEY` exported to your environment variables.
