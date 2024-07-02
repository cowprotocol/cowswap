import { getAddress } from '@ethersproject/address'
import type { JsonRpcProvider } from '@ethersproject/providers'


import { getContract } from './getContract'

import Erc20Abi from '../abi/erc20.json'

export async function getTokenName(tokenAddress: string, chainId: number, provider: JsonRpcProvider): Promise<string> {
  const formattedAddress = getAddress(tokenAddress)
  const erc20Contract = getContract(formattedAddress, Erc20Abi, provider)

  return erc20Contract.callStatic['name']()
}
