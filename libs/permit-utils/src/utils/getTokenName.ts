import { erc20Abi, type Address } from 'viem'
import type { Config } from 'wagmi'
import { readContract } from 'wagmi/actions'

export async function getTokenName(tokenAddress: Address, chainId: number, config: Config): Promise<string> {
  return readContract(config, {
    abi: erc20Abi,
    address: tokenAddress,
    functionName: 'name',
  })
}
