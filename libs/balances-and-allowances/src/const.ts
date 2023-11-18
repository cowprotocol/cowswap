import { Erc20Abi, Erc20Interface } from '@cowprotocol/abis'
import { Interface } from '@ethersproject/abi'

export const erc20Interface = new Interface(Erc20Abi) as Erc20Interface
