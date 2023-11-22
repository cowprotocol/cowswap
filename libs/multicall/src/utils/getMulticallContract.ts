import { Multicall3, Multicall3Abi } from '@cowprotocol/abis'
import { Contract } from '@ethersproject/contracts'
import type { Web3Provider } from '@ethersproject/providers'

import { MULTICALL_ADDRESS } from '../const'

const multicallContractsCache = new Map<Web3Provider, Contract>()

export function getMulticallContract(provider: Web3Provider): Multicall3 {
  if (!multicallContractsCache.has(provider)) {
    const multicall = new Contract(MULTICALL_ADDRESS, Multicall3Abi, provider) as Multicall3

    multicallContractsCache.set(provider, multicall)

    return multicall
  }

  return multicallContractsCache.get(provider) as Multicall3
}
