# Multicall

Multicall is a library that allows you to batch multiple calls into a single call to the Ethereum blockchain.

There are two main cases where multicall is useful.

## useMultipleContractSingleData()
>You want to get data from multiple contracts in a single call.
For example, you want to get the balance of 10 different ERC20 tokens.

### Usage example
```ts
import { Interface } from '@ethersproject/abi'
import { Erc20Abi, Erc20Interface } from '@cowprotocol/abis'
import { useMultipleContractSingleData } from '@cowprotocol/multicall'

const ACCOUNT = '0x0000000000000000000000000000000000000000'
const GP_VAULT_RELAYER = '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110'

const TOKENS = [
  '0x5d30aD9C6374Bf925D0A75454fa327AACf778492',
  '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
  '0x418d75f65a02b3d53b2418fb8e1fe493759c7605'
]

const ERC20_INTERFACE = new Interface(Erc20Abi) as Erc20Interface

const results = useMultipleContractSingleData(
  TOKENS,
  ERC20_INTERFACE,
  'allowance',
  [ACCOUNT, GP_VAULT_RELAYER]
)

const allowancesPerToken = results.reduce((acc, allowance, i) => {
  acc[TOKENS[i]] = allowance
  return acc
}, {})

console.log(allowancesPerToken)
```

## useSingleContractMultipleData()
>You want to get data from a single contract, but you want to make multiple calls to it.
For example: you want to get the balance of 10 different users.

### Usage example
```ts
import { Interface } from '@ethersproject/abi'
import { Erc20Abi, Erc20Interface } from '@cowprotocol/abis'
import { Contract } from '@ethersproject/contracts'
import { BigNumber } from '@ethersproject/bignumber'

import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { useSingleContractMultipleData } from '@cowprotocol/multicall'

const provider = useWalletProvider()

const WETH_TOKEN_CONTRACT = new Contract(
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  Erc20Abi,
  provider
)

const ACCOUNTS = [
  '0x5d30aD9C6374Bf925D0A75454fa327AACf778492',
  '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
  '0x418d75f65a02b3d53b2418fb8e1fe493759c7605'
]

const ERC20_INTERFACE = new Interface(Erc20Abi) as Erc20Interface

const results = useSingleContractMultipleData<[BigNumber]>(
  WETH_TOKEN_CONTRACT,
  'balanceOf',
  ACCOUNTS
)

const balancesPerAddress = results.reduce((acc, balance, i) => {
  acc[ACCOUNTS[i]] = balance
  return acc
}, {})

console.log(balancesPerAddress)
```
